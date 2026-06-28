param(
  [switch]$PanelOnly
)

$ErrorActionPreference = "Stop"

$source = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceManifest = Join-Path $source "CSXS\manifest.xml"
$panelVersion = "unknown"
if (Test-Path -LiteralPath $sourceManifest) {
  $manifestText = Get-Content -LiteralPath $sourceManifest -Raw
  $versionMatch = [regex]::Match($manifestText, 'ExtensionBundleVersion="([^"]+)"')
  if ($versionMatch.Success) {
    $panelVersion = $versionMatch.Groups[1].Value
  }
}
$extensionsRoot = Join-Path $env:APPDATA "Adobe\CEP\extensions"
$target = Join-Path $env:APPDATA "Adobe\CEP\extensions\Waves Media Downloader"
$legacyTarget = Join-Path $env:APPDATA "Adobe\CEP\extensions\com.codex.ae.youtubeimporter"
$pythonWingetId = "Python.Python.3.12"
$pythonInstallerUrl = "https://www.python.org/ftp/python/3.12.10/python-3.12.10-amd64.exe"
$pythonInstallerPath = Join-Path $env:TEMP "python-3.12.10-amd64.exe"
$wingetInstallerUrl = "https://aka.ms/getwinget"
$wingetInstallerPath = Join-Path $env:TEMP "Microsoft.DesktopAppInstaller.msixbundle"
$ffmpegUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
$ffmpegChecksumUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip.sha256"
$ffmpegZipPath = Join-Path $env:TEMP "ffmpeg-release-essentials.zip"
$ffmpegInstallRoot = Join-Path $env:LOCALAPPDATA "Waves Media Downloader\ffmpeg"
$allowedDownloadHosts = @(
  "www.python.org",
  "aka.ms",
  "www.gyan.dev"
)
$debugKeys = @(
  "HKCU:\Software\Adobe\CSXS.10",
  "HKCU:\Software\Adobe\CSXS.11",
  "HKCU:\Software\Adobe\CSXS.12",
  "HKCU:\Software\Adobe\CSXS.13",
  "HKCU:\Software\Adobe\CSXS.14",
  "HKCU:\Software\Adobe\CSXS.15"
)

function Test-AllowedDownloadUri {
  param([string]$Uri)

  try {
    $parsed = [Uri]$Uri
    return $parsed.Scheme -eq "https" -and $allowedDownloadHosts -contains $parsed.Host.ToLowerInvariant()
  }
  catch {
    return $false
  }
}

function Get-FileSha256 {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return ""
  }
  return (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

function Get-PublishedSha256 {
  param(
    [string]$Uri,
    [string]$Label
  )

  if (-not (Test-AllowedDownloadUri $Uri)) {
    throw "Refusing to read the $Label checksum from an unapproved source: $Uri"
  }
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Write-Host "Reading the published $Label checksum from:"
  Write-Host "  $Uri"
  $response = Invoke-WebRequest -Uri $Uri -UseBasicParsing
  $checksumText = [string]$response.Content
  $match = [regex]::Match($checksumText, '(?i)(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])')
  if (-not $match.Success) {
    throw "The published $Label checksum was missing or invalid."
  }
  return $match.Value.ToLowerInvariant()
}

function Test-TrustedSignature {
  param(
    [string]$Path,
    [string[]]$AllowedPublishers
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return $false
  }
  $signature = Get-AuthenticodeSignature -LiteralPath $Path
  if ($signature.Status -ne "Valid") {
    Write-Host "Signature check failed for:" -ForegroundColor Yellow
    Write-Host "  $Path" -ForegroundColor Yellow
    Write-Host "  Status: $($signature.Status)" -ForegroundColor Yellow
    return $false
  }
  $subject = [string]$signature.SignerCertificate.Subject
  foreach ($publisher in $AllowedPublishers) {
    if ($subject -like "*$publisher*") {
      return $true
    }
  }
  Write-Host "Signature publisher was not expected:" -ForegroundColor Yellow
  Write-Host "  $subject" -ForegroundColor Yellow
  return $false
}

function Invoke-TrustedDownload {
  param(
    [string]$Uri,
    [string]$OutFile,
    [string]$Label,
    [string[]]$AllowedPublishers = @(),
    [string]$ExpectedSha256 = "",
    [switch]$RequireSignature
  )

  if (-not (Test-AllowedDownloadUri $Uri)) {
    throw "Refusing to download $Label from an unapproved source: $Uri"
  }

  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Write-Host "Downloading $Label from:"
  Write-Host "  $Uri"
  Invoke-WebRequest -Uri $Uri -OutFile $OutFile -UseBasicParsing
  $hash = Get-FileSha256 -Path $OutFile
  Write-Host "$Label SHA-256:"
  Write-Host "  $hash"
  if ($ExpectedSha256) {
    if ($hash -ne $ExpectedSha256.ToLowerInvariant()) {
      Remove-Item -LiteralPath $OutFile -Force -ErrorAction SilentlyContinue
      throw "$Label failed SHA-256 verification."
    }
    Write-Host "$Label matches the published SHA-256 checksum." -ForegroundColor Green
  }

  if ($RequireSignature) {
    if (-not (Test-TrustedSignature -Path $OutFile -AllowedPublishers $AllowedPublishers)) {
      throw "$Label did not pass signature verification."
    }
  }

  return $hash
}

function Update-SessionPath {
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $pythonUserRoot = Join-Path $env:LOCALAPPDATA "Programs\Python"
  $pythonRoamingRoot = Join-Path $env:APPDATA "Python"
  $pythonExtras = @()
  if (Test-Path $pythonUserRoot) {
    Get-ChildItem -Path $pythonUserRoot -Directory -Filter "Python3*" -ErrorAction SilentlyContinue | ForEach-Object {
      $pythonExtras += $_.FullName
      $pythonExtras += (Join-Path $_.FullName "Scripts")
    }
  }
  if (Test-Path $pythonRoamingRoot) {
    Get-ChildItem -Path $pythonRoamingRoot -Directory -Filter "Python3*" -ErrorAction SilentlyContinue | ForEach-Object {
      $pythonExtras += $_.FullName
      $pythonExtras += (Join-Path $_.FullName "Scripts")
    }
  }
  $env:Path = (($pythonExtras + @($machinePath, $userPath)) -join ";")
}

function Test-PythonCommand {
  param([string]$Candidate)

  if (-not (Get-Command $Candidate -ErrorAction SilentlyContinue)) {
    return $false
  }

  try {
    $output = & $Candidate -c "import sys; print(sys.version_info[0]); print(sys.executable)" 2>&1
    if ($LASTEXITCODE -eq 0 -and ($output -join "`n") -match "^3(\r?\n|$)") {
      return $true
    }
  }
  catch {
    return $false
  }

  return $false
}

function Get-PythonCommand {
  Update-SessionPath
  $candidates = @("py", "python", "python3")
  foreach ($candidate in $candidates) {
    if (Test-PythonCommand $candidate) {
      return $candidate
    }
  }
  return $null
}

function Find-Executable {
  param([string]$ExecutableName)

  Update-SessionPath
  $command = Get-Command $ExecutableName -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $roots = @(
    (Join-Path $env:APPDATA "Python"),
    (Join-Path $env:LOCALAPPDATA "Programs\Python")
  )
  foreach ($root in $roots) {
    if (-not (Test-Path $root)) {
      continue
    }
    $match = Get-ChildItem -Path $root -Recurse -Filter $ExecutableName -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($match) {
      return $match.FullName
    }
  }

  return $null
}

function Find-FFmpeg {
  $command = Get-Command "ffmpeg" -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  if (Test-Path $ffmpegInstallRoot) {
    $match = Get-ChildItem -Path $ffmpegInstallRoot -Recurse -Filter "ffmpeg.exe" -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($match) {
      return $match.FullName
    }
  }

  return $null
}

function Write-DefaultPanelSettings {
  param(
    [string]$YtDlpPath,
    [string]$SpotifyDlpPath,
    [string]$FfmpegPath
  )

  try {
    $settingsFolder = Join-Path $env:APPDATA "Waves Media Downloader"
    $settingsPath = Join-Path $settingsFolder "Waves-Media-Downloader-settings.json"
    New-Item -ItemType Directory -Force -Path $settingsFolder | Out-Null
    if (Test-Path $settingsPath) {
      $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
    }
    else {
      $settings = [pscustomobject]@{
        ytdlpPath = "yt-dlp"
        spotifyDlpPath = "spotify-dlp"
        ffmpegPath = ""
        cookiesBrowser = ""
        downloadDir = (Join-Path ([Environment]::GetFolderPath("MyDocuments")) "Waves Media Downloads")
        spotifyClientId = ""
        spotifyClientSecret = ""
        spotifyAuthCompleted = $false
      }
    }
    if ($YtDlpPath) {
      $settings.ytdlpPath = $YtDlpPath
    }
    if ($SpotifyDlpPath) {
      $settings.spotifyDlpPath = $SpotifyDlpPath
    }
    if ($FfmpegPath) {
      $settings.ffmpegPath = $FfmpegPath
    }
    $settings | ConvertTo-Json -Compress | Set-Content -Path $settingsPath -Encoding UTF8
    if ($YtDlpPath) {
      Write-Host "Configured panel yt-dlp path:"
      Write-Host "  $YtDlpPath"
    }
    if ($SpotifyDlpPath) {
      Write-Host "Configured panel spotify-dlp path:"
      Write-Host "  $SpotifyDlpPath"
    }
    if ($FfmpegPath) {
      Write-Host "Configured panel FFmpeg path:"
      Write-Host "  $FfmpegPath"
    }
  }
  catch {
    Write-Host "Could not write default panel settings." -ForegroundColor Yellow
  }
}

function Copy-PanelFiles {
  param(
    [string]$SourceRoot,
    [string]$TargetRoot
  )

  $includeItems = @(
    "CSXS",
    "css",
    "helpers",
    "js",
    "jsx",
    "index.html",
    "CHANGELOG.md",
    "README.md",
    "HOW-TO-INSTALL.txt",
    "install-windows.bat",
    "install-windows.ps1",
    "uninstall-windows.bat",
    "uninstall-windows.ps1"
  )

  foreach ($item in $includeItems) {
    $sourcePath = Join-Path $SourceRoot $item
    if (Test-Path -LiteralPath $sourcePath) {
      Copy-Item -LiteralPath $sourcePath -Destination $TargetRoot -Recurse -Force
    }
  }
}

function Test-PanelCopy {
  param(
    [string]$SourceRoot,
    [string]$TargetRoot
  )

  $includeItems = @(
    "CSXS",
    "css",
    "helpers",
    "js",
    "jsx",
    "index.html",
    "CHANGELOG.md",
    "README.md",
    "HOW-TO-INSTALL.txt",
    "install-windows.bat",
    "install-windows.ps1",
    "uninstall-windows.bat",
    "uninstall-windows.ps1"
  )
  foreach ($item in $includeItems) {
    $sourcePath = Join-Path $SourceRoot $item
    if (-not (Test-Path -LiteralPath $sourcePath)) {
      throw "Installer source is incomplete. Missing: $sourcePath"
    }
    $sourceItem = Get-Item -LiteralPath $sourcePath
    $sourceFiles = if ($sourceItem.PSIsContainer) {
      @(Get-ChildItem -LiteralPath $sourcePath -Recurse -File)
    }
    else {
      @($sourceItem)
    }
    foreach ($sourceFile in $sourceFiles) {
      $relativePath = $sourceFile.FullName.Substring($SourceRoot.TrimEnd('\').Length).TrimStart('\')
      $targetFile = Join-Path $TargetRoot $relativePath
      if (-not (Test-Path -LiteralPath $targetFile)) {
        throw "Installed panel is missing: $relativePath"
      }
      $sourceHash = (Get-FileHash -LiteralPath $sourceFile.FullName -Algorithm SHA256).Hash
      $targetHash = (Get-FileHash -LiteralPath $targetFile -Algorithm SHA256).Hash
      if ($sourceHash -ne $targetHash) {
        throw "Installed panel verification failed for: $relativePath"
      }
    }
  }
  return $true
}

function Install-Winget {
  if (Get-Command "winget" -ErrorAction SilentlyContinue) {
    return $true
  }

  if (-not (Get-Command "Add-AppxPackage" -ErrorAction SilentlyContinue)) {
    Write-Host "winget is missing, and this PowerShell cannot install App Installer automatically." -ForegroundColor Yellow
    return $false
  }

  try {
    Write-Host "winget was not found. Installing Microsoft App Installer..."
    Invoke-TrustedDownload -Uri $wingetInstallerUrl -OutFile $wingetInstallerPath -Label "Microsoft App Installer" -AllowedPublishers @("Microsoft") -RequireSignature | Out-Null
    Add-AppxPackage -Path $wingetInstallerPath
    Update-SessionPath
    return [bool](Get-Command "winget" -ErrorAction SilentlyContinue)
  }
  catch {
    Write-Host "Could not install winget automatically." -ForegroundColor Yellow
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Yellow
    return $false
  }
}

function Install-Python {
  if (Get-PythonCommand) {
    return $true
  }

  Install-Winget | Out-Null

  if (Get-Command "winget" -ErrorAction SilentlyContinue) {
    Write-Host "Python was not found. Installing Python 3.12 automatically with winget..."
    winget install --id $pythonWingetId --exact --scope user --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) {
      Write-Host "winget could not install Python 3.12 automatically. Trying the official python.org installer..." -ForegroundColor Yellow
    }
  }
  else {
    Write-Host "Python was not found, and winget is not available. Trying the official python.org installer..."
  }

  if (-not (Get-PythonCommand)) {
    try {
      Invoke-TrustedDownload -Uri $pythonInstallerUrl -OutFile $pythonInstallerPath -Label "Python 3.12 installer" -AllowedPublishers @("Python Software Foundation") -RequireSignature | Out-Null
      Write-Host "Installing Python 3.12..."
      $process = Start-Process -FilePath $pythonInstallerPath -ArgumentList "/quiet InstallAllUsers=0 PrependPath=1 Include_pip=1" -Wait -PassThru
      if ($process.ExitCode -ne 0) {
        Write-Host "The Python installer exited with code $($process.ExitCode)." -ForegroundColor Yellow
        return $false
      }
    }
    catch {
      Write-Host "Could not download or install Python automatically." -ForegroundColor Yellow
      Write-Host "  $($_.Exception.Message)" -ForegroundColor Yellow
      return $false
    }
  }

  Update-SessionPath
  if (Get-PythonCommand) {
    return $true
  }

  Write-Host "Python installed, but it is not visible in this terminal session yet." -ForegroundColor Yellow
  Write-Host "Close and rerun install-windows.bat if spotify-dlp is still missing." -ForegroundColor Yellow
  return $false
}

function Install-PythonPackage {
  param(
    [string]$PackageName,
    [string]$ExecutableName
  )

  if (Find-Executable $ExecutableName) {
    return $true
  }

  if (-not (Install-Python)) {
    Write-Host "Python was not found, so $PackageName could not be installed automatically." -ForegroundColor Yellow
    return $false
  }

  $python = Get-PythonCommand
  Write-Host "$ExecutableName was not found. Installing $PackageName with pip..."
  & $python -m pip install --user --upgrade $PackageName
  if ($LASTEXITCODE -ne 0) {
    Write-Host "pip could not install $PackageName automatically." -ForegroundColor Yellow
    return $false
  }

  Update-SessionPath
  if (Find-Executable $ExecutableName) {
    return $true
  }

  Write-Host "$PackageName installed, but $ExecutableName is not visible on PATH yet." -ForegroundColor Yellow
  Write-Host "If needed, set the spotify-dlp path from the panel Settings button." -ForegroundColor Yellow
  return $false
}

function Install-FFmpeg {
  $existing = Find-FFmpeg
  if ($existing) {
    return $true
  }

  $ffmpegStage = ""
  $ffmpegBackup = ""
  $createdInstallRoot = $false
  try {
    Write-Host "FFmpeg was not found. Downloading FFmpeg..."
    $ffmpegStage = Join-Path $env:TEMP ("waves-ffmpeg-stage-" + [guid]::NewGuid().ToString("N"))
    $publishedFfmpegHash = Get-PublishedSha256 -Uri $ffmpegChecksumUrl -Label "FFmpeg release essentials ZIP"
    Invoke-TrustedDownload -Uri $ffmpegUrl -OutFile $ffmpegZipPath -Label "FFmpeg release essentials ZIP" -ExpectedSha256 $publishedFfmpegHash | Out-Null

    Write-Host "Installing FFmpeg..."
    New-Item -ItemType Directory -Force -Path $ffmpegStage | Out-Null
    Expand-Archive -Path $ffmpegZipPath -DestinationPath $ffmpegStage -Force
    $stagedFfmpeg = Get-ChildItem -Path $ffmpegStage -Recurse -Filter "ffmpeg.exe" -File -ErrorAction SilentlyContinue | Select-Object -First 1
    $stagedFfprobe = Get-ChildItem -Path $ffmpegStage -Recurse -Filter "ffprobe.exe" -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $stagedFfmpeg -or -not $stagedFfprobe) {
      throw "The FFmpeg archive did not contain ffmpeg.exe and ffprobe.exe."
    }

    if (Test-Path -LiteralPath $ffmpegInstallRoot) {
      $ffmpegBackup = $ffmpegInstallRoot + "-backup-" + [guid]::NewGuid().ToString("N")
      Move-Item -LiteralPath $ffmpegInstallRoot -Destination $ffmpegBackup
    }
    New-Item -ItemType Directory -Force -Path $ffmpegInstallRoot | Out-Null
    $createdInstallRoot = $true
    Copy-Item -Path (Join-Path $ffmpegStage "*") -Destination $ffmpegInstallRoot -Recurse -Force
    $installedFfmpeg = Get-ChildItem -Path $ffmpegInstallRoot -Recurse -Filter "ffmpeg.exe" -File -ErrorAction SilentlyContinue | Select-Object -First 1
    $installedFfprobe = Get-ChildItem -Path $ffmpegInstallRoot -Recurse -Filter "ffprobe.exe" -File -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $installedFfmpeg -or -not $installedFfprobe) {
      throw "The installed FFmpeg copy could not be verified."
    }
    if ($ffmpegBackup -and (Test-Path -LiteralPath $ffmpegBackup)) {
      Remove-Item -LiteralPath $ffmpegBackup -Recurse -Force
      $ffmpegBackup = ""
    }
    Write-Host "Installed FFmpeg to:"
    Write-Host "  $($installedFfmpeg.FullName)"

    return $true
  }
  catch {
    if ($ffmpegBackup -and (Test-Path -LiteralPath $ffmpegBackup)) {
      if (Test-Path -LiteralPath $ffmpegInstallRoot) {
        Remove-Item -LiteralPath $ffmpegInstallRoot -Recurse -Force -ErrorAction SilentlyContinue
      }
      Move-Item -LiteralPath $ffmpegBackup -Destination $ffmpegInstallRoot -Force
      $ffmpegBackup = ""
    }
    elseif ($createdInstallRoot -and (Test-Path -LiteralPath $ffmpegInstallRoot)) {
      Remove-Item -LiteralPath $ffmpegInstallRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Could not install FFmpeg automatically." -ForegroundColor Yellow
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Yellow
    return $false
  }
  finally {
    if ($ffmpegStage -and (Test-Path -LiteralPath $ffmpegStage)) {
      Remove-Item -LiteralPath $ffmpegStage -Recurse -Force -ErrorAction SilentlyContinue
    }
  }
}

function Show-InstallSummary {
  Write-Host "Waves Media Downloader installer summary" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Panel install:"
  Write-Host "  Build version: $panelVersion"
  Write-Host "  Installer source:"
  Write-Host "  $source"
  Write-Host "  Copies this extension to:"
  Write-Host "  $target"
  Write-Host "  Enables Adobe CEP PlayerDebugMode for the current Windows user."
  Write-Host ""
  if ($PanelOnly) {
    Write-Host "Dependency install:"
    Write-Host "  Skipped because -PanelOnly was provided."
  }
  else {
    Write-Host "Dependency install/update:"
    Write-Host "  yt-dlp and spotify-dlp: installed with Python pip into the current user profile if missing."
    Write-Host "  Python 3.12: installed from winget or python.org if Python is missing."
    Write-Host "  winget/App Installer: installed from aka.ms/getwinget if winget is missing and available."
    Write-Host "  FFmpeg: downloaded from gyan.dev into:"
    Write-Host "  $ffmpegInstallRoot"
    Write-Host ""
    Write-Host "Allowed download sources:"
    Write-Host "  python.org, aka.ms, gyan.dev"
    Write-Host ""
    Write-Host "Verification:"
    Write-Host "  Python and App Installer downloads must have a valid trusted publisher signature."
    Write-Host "  FFmpeg must match the SHA-256 checksum published by gyan.dev."
    Write-Host "  Downloaded artifacts also print their SHA-256 hash."
    Write-Host "  FFmpeg is extracted to a temporary staging folder and must contain ffmpeg.exe and ffprobe.exe before it replaces the local copy."
    Write-Host ""
    Write-Host "Admin note:"
    Write-Host "  The installer is designed for user-scope installs. Windows may still ask for permission for App Installer or PowerShell policy prompts."
  }
  Write-Host ""
  $answer = Read-Host "Continue? Type Y to continue"
  if ($answer -notmatch "^(y|yes)$") {
    Write-Host "Install cancelled."
    exit 0
  }
}

Write-Host "Installing Waves Media Downloader for After Effects 2022 or newer..."
Write-Host ""
Show-InstallSummary

try {
  if (Test-Path -LiteralPath $legacyTarget) {
    Write-Host "Removing old prototype extension folder:"
    Write-Host "  $legacyTarget"
    Remove-Item -LiteralPath $legacyTarget -Recurse -Force
  }
  $legacyLowercaseFolder = Get-ChildItem -LiteralPath $extensionsRoot -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -ceq "waves media downloader" } | Select-Object -First 1
  if ($legacyLowercaseFolder) {
    Write-Host "Removing old lowercase extension folder:"
    Write-Host "  $($legacyLowercaseFolder.FullName)"
    Remove-Item -LiteralPath $legacyLowercaseFolder.FullName -Recurse -Force
  }
  New-Item -ItemType Directory -Force -Path $target | Out-Null
  Get-ChildItem -LiteralPath $target -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
  Copy-PanelFiles -SourceRoot $source -TargetRoot $target
  Test-PanelCopy -SourceRoot $source -TargetRoot $target | Out-Null
}
catch {
  Write-Host "Could not copy the extension files." -ForegroundColor Red
  Write-Host "Target:" -ForegroundColor Red
  Write-Host "  $target" -ForegroundColor Red
  Write-Host ""
  Write-Host "Try this:" -ForegroundColor Yellow
  Write-Host "  1. Close After Effects."
  Write-Host "  2. Extract the zip first if you are running this from inside the zip."
  Write-Host "  3. Right-click install-windows.bat and choose Run as administrator."
  Write-Host ""
  Write-Host "Original error:" -ForegroundColor Yellow
  Write-Host "  $($_.Exception.Message)"
  Read-Host "Press Enter to close"
  exit 1
}

foreach ($debugKey in $debugKeys) {
  try {
    New-Item -Path $debugKey -Force | Out-Null
    New-ItemProperty -Path $debugKey -Name "PlayerDebugMode" -Value "1" -PropertyType String -Force | Out-Null
  }
  catch {
    Write-Host "Could not set CEP debug key $debugKey." -ForegroundColor Yellow
    Write-Host "Unsigned CEP panels may not load until PlayerDebugMode is enabled." -ForegroundColor Yellow
  }
}

Write-Host "Installed and verified Waves Media Downloader $panelVersion to:"
Write-Host "  $target"
Write-Host ""

if ($PanelOnly) {
  Write-Host "Panel-only install complete. Dependencies were not installed or updated." -ForegroundColor Yellow
  Write-Host "Open Settings in the panel to set yt-dlp, spotify-dlp, and FFmpeg paths if needed." -ForegroundColor Yellow
}
else {
  $ytDlpInstalled = Install-PythonPackage -PackageName "yt-dlp" -ExecutableName "yt-dlp"
  $ytDlpPath = Find-Executable "yt-dlp.exe"
  $spotifyInstalled = Install-PythonPackage -PackageName "spotify-dlp" -ExecutableName "spotify-dlp"
  $spotifyDlpPath = Find-Executable "spotify-dlp.exe"
  $ffmpegInstalled = Install-FFmpeg
  $ffmpegPath = Find-FFmpeg
  Write-DefaultPanelSettings -YtDlpPath $ytDlpPath -SpotifyDlpPath $spotifyDlpPath -FfmpegPath $ffmpegPath

  $missing = @()
  if (-not $ytDlpInstalled -and -not $ytDlpPath) {
    $missing += "yt-dlp"
  }
  if (-not $spotifyInstalled -and -not $spotifyDlpPath) {
    $missing += "spotify-dlp"
  }
  if (-not $ffmpegInstalled -and -not $ffmpegPath) {
    $missing += "FFmpeg"
  }
  if ($missing.Count -gt 0) {
    Write-Host "Missing prerequisites detected: $($missing -join ', ')" -ForegroundColor Yellow
    Write-Host "Install them or set their paths from the panel Settings button." -ForegroundColor Yellow
    Write-Host "Recovery: rerun this installer, or open Settings and use Update yt-dlp, spotify-dlp, and FFmpeg." -ForegroundColor Yellow
    Write-Host ""
  }
}
Write-Host "Restart After Effects, then open Window > Extensions > Waves Media Downloader."
Write-Host ""
Read-Host "Press Enter to close"
