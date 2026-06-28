param(
  [Parameter(Mandatory = $true)]
  [string]$PayloadPath
)

$ErrorActionPreference = "Stop"
$script:ResultPath = ""

function Finish($value) {
  $json = $value | ConvertTo-Json -Compress -Depth 12
  if ($script:ResultPath) {
    Set-Content -LiteralPath $script:ResultPath -Value $json -Encoding UTF8
  }
  else {
    $json
  }
}

function Get-ProgressSnapshot([string]$Text, [hashtable]$Base) {
  $snapshot = @{} + $Base
  $snapshot.updatedAt = (Get-Date).ToString("o")
  $snapshot.stage = if ($Base.stage) { $Base.stage } else { "running" }
  $snapshot.message = "Running"

  $lines = @($Text -split "`r?`n" | Where-Object { $_ -and $_.Trim() })
  if ($lines.Count -gt 0) {
    $latest = [string]$lines[-1]
    $snapshot.message = $latest.Trim()
    if ($latest -match 'Destination:\s*(.+)$') {
      $snapshot.filename = $Matches[1].Trim()
    }
    elseif ($latest -match '\[download\]\s+(.+?)\s+has already been downloaded') {
      $snapshot.filename = $Matches[1].Trim()
    }
    if ($latest -match '(\d{1,3}(?:\.\d+)?)%') {
      $snapshot.percent = [double]$Matches[1]
      $snapshot.stage = "downloading"
    }
    if ($latest -match '\bat\s+([^\s]+\/s)') {
      $snapshot.speed = $Matches[1]
    }
    if ($latest -match '\bETA\s+([0-9:]+)') {
      $snapshot.eta = $Matches[1]
    }
    if ($latest -match 'ffmpeg|frame=\s*\d+|time=\s*[0-9:.]+') {
      $snapshot.stage = "converting"
    }
  }

  $durationMatches = [regex]::Matches($Text, 'Duration:\s*(\d{1,2}):(\d{2}):(\d{2}(?:\.\d+)?)')
  $timeMatches = [regex]::Matches($Text, 'time=\s*(\d{1,2}):(\d{2}):(\d{2}(?:\.\d+)?)')
  if ($durationMatches.Count -gt 0 -and $timeMatches.Count -gt 0) {
    $durationMatch = $durationMatches[$durationMatches.Count - 1]
    $timeMatch = $timeMatches[$timeMatches.Count - 1]
    $durationSeconds = ([double]$durationMatch.Groups[1].Value * 3600) + ([double]$durationMatch.Groups[2].Value * 60) + [double]$durationMatch.Groups[3].Value
    $elapsedSeconds = ([double]$timeMatch.Groups[1].Value * 3600) + ([double]$timeMatch.Groups[2].Value * 60) + [double]$timeMatch.Groups[3].Value
    if ($durationSeconds -gt 0) {
      $snapshot.percent = [Math]::Round([Math]::Min(99, [Math]::Max(0, ($elapsedSeconds / $durationSeconds) * 100)), 1)
      $snapshot.stage = "converting"
      $speedMatches = [regex]::Matches($Text, 'speed=\s*([0-9.]+)x')
      if ($speedMatches.Count -gt 0) {
        $speedMatch = $speedMatches[$speedMatches.Count - 1]
        $speedValue = [double]$speedMatch.Groups[1].Value
        $snapshot.speed = $speedMatch.Groups[1].Value + "x"
        if ($speedValue -gt 0 -and $elapsedSeconds -lt $durationSeconds) {
          $remainingSeconds = ($durationSeconds - $elapsedSeconds) / $speedValue
          $snapshot.eta = [TimeSpan]::FromSeconds($remainingSeconds).ToString("hh\:mm\:ss")
        }
      }
    }
  }
  return $snapshot
}

function Write-JobState([string]$Path, [hashtable]$State) {
  if (-not $Path) {
    return
  }
  $State | ConvertTo-Json -Compress -Depth 8 | Set-Content -LiteralPath $Path -Encoding UTF8
}

function ConvertTo-ProcessArgumentString([string[]]$Arguments) {
  $quoted = @()
  foreach ($argument in $Arguments) {
    $value = [string]$argument
    if ($value -eq "") {
      $quoted += '""'
      continue
    }
    if ($value -notmatch '[\s"]') {
      $quoted += $value
      continue
    }
    $escaped = $value -replace '(\\*)"', '$1$1\"'
    $escaped = $escaped -replace '(\\+)$', '$1$1'
    $quoted += '"' + $escaped + '"'
  }
  return ($quoted -join " ")
}

try {
  $payloadText = Get-Content -LiteralPath $PayloadPath -Raw
  $payload = $payloadText | ConvertFrom-Json
  $script:ResultPath = [string]$payload.resultPath
  Remove-Item -LiteralPath $PayloadPath -Force -ErrorAction SilentlyContinue
  $payloadText = ""
  if (-not $payload.operation) {
    throw "Missing runner operation."
  }

  if ($payload.operation -eq "runTool") {
    $exe = [string]$payload.executable
    if (-not $exe) {
      throw "Missing executable."
    }
    $arguments = @()
    if ($payload.arguments) {
      foreach ($argument in $payload.arguments) {
        $arguments += [string]$argument
      }
    }
    $jobId = [string]$payload.jobId
    $jobDirectory = [string]$payload.jobDirectory
    $jobPath = ""
    $cancelPath = ""
    if ($jobId -and $jobDirectory) {
      if (-not (Test-Path -LiteralPath $jobDirectory)) {
        New-Item -ItemType Directory -Force -Path $jobDirectory | Out-Null
      }
      $jobPath = Join-Path $jobDirectory ("job-" + $jobId + ".json")
      $cancelPath = Join-Path $jobDirectory ("job-" + $jobId + ".cancel")
      Remove-Item -LiteralPath $cancelPath -Force -ErrorAction SilentlyContinue
    }
    $previousLocation = Get-Location
    try {
      if ($payload.workingDirectory) {
        Set-Location -LiteralPath ([string]$payload.workingDirectory)
      }
      $baseState = @{
        ok = $false
        jobId = $jobId
        executable = $exe
        stage = "starting"
        percent = $null
        speed = ""
        eta = ""
        filename = [string]$payload.progressFilename
        message = "Starting"
        pid = $null
        cancelPath = $cancelPath
        outputPath = $jobPath
      }
      Write-JobState $jobPath $baseState

      $outputBase = if ($jobDirectory) { Join-Path $jobDirectory ("job-" + $jobId) } else { Join-Path ([IO.Path]::GetTempPath()) ("waves-runner-" + [guid]::NewGuid().ToString("N")) }
      $stdoutPath = $outputBase + ".stdout.txt"
      $stderrPath = $outputBase + ".stderr.txt"
      Remove-Item -LiteralPath $stdoutPath, $stderrPath -Force -ErrorAction SilentlyContinue
      $argumentString = ConvertTo-ProcessArgumentString $arguments
      $process = Start-Process -FilePath $exe -ArgumentList $argumentString -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath -NoNewWindow -PassThru
      $baseState.pid = $process.Id
      $baseState.stage = "running"
      Write-JobState $jobPath $baseState

      $cancelled = $false
      while (-not $process.HasExited) {
        Start-Sleep -Milliseconds 500
        $stdout = if (Test-Path -LiteralPath $stdoutPath) { Get-Content -LiteralPath $stdoutPath -Raw -ErrorAction SilentlyContinue } else { "" }
        $stderr = if (Test-Path -LiteralPath $stderrPath) { Get-Content -LiteralPath $stderrPath -Raw -ErrorAction SilentlyContinue } else { "" }
        $outputSoFar = ($stdout + "`r`n" + $stderr)
        $progress = Get-ProgressSnapshot $outputSoFar $baseState
        Write-JobState $jobPath $progress
        if ($cancelPath -and (Test-Path -LiteralPath $cancelPath)) {
          $cancelled = $true
          try {
            if ($IsWindows -or $env:OS -like "*Windows*") {
              & taskkill.exe /PID $process.Id /T /F 2>$null | Out-Null
            }
            else {
              $process.Kill()
            }
          }
          catch {
            try { $process.Kill() } catch {}
          }
          break
        }
      }
      $process.WaitForExit()
      Start-Sleep -Milliseconds 100
      $stdoutFinal = if (Test-Path -LiteralPath $stdoutPath) { Get-Content -LiteralPath $stdoutPath -Raw -ErrorAction SilentlyContinue } else { "" }
      $stderrFinal = if (Test-Path -LiteralPath $stderrPath) { Get-Content -LiteralPath $stderrPath -Raw -ErrorAction SilentlyContinue } else { "" }
      $output = ($stdoutFinal + "`r`n" + $stderrFinal)
      Remove-Item -LiteralPath $stdoutPath, $stderrPath -Force -ErrorAction SilentlyContinue
      $exitCode = if ($cancelled) { -1 } else { [int]$process.ExitCode }
      $finalState = Get-ProgressSnapshot $output $baseState
      $finalState.ok = ($exitCode -eq 0)
      $finalState.exitCode = $exitCode
      $finalState.stage = if ($cancelled) { "cancelled" } elseif ($exitCode -eq 0) { "completed" } else { "failed" }
      if ($exitCode -eq 0) {
        $finalState.percent = 100
      }
      $finalState.message = if ($cancelled) { "Cancelled by user." } elseif ($exitCode -eq 0) { "Completed." } else { "Failed with exit code $exitCode." }
      Write-JobState $jobPath $finalState
      Finish @{ ok = ($exitCode -eq 0); cancelled = $cancelled; exitCode = $exitCode; output = $output; jobPath = $jobPath; cancelPath = $cancelPath }
      exit 0
    }
    finally {
      Set-Location $previousLocation
    }
  }

  throw ("Unknown runner operation: " + $payload.operation)
}
catch {
  Finish @{ ok = $false; exitCode = 1; error = $_.Exception.Message; output = "" }
  exit 0
}
