$ErrorActionPreference = "Stop"

$extensionsRoot = Join-Path $env:APPDATA "Adobe\CEP\extensions"
$target = Join-Path $env:APPDATA "Adobe\CEP\extensions\Waves Media Downloader"
$legacyTarget = Join-Path $env:APPDATA "Adobe\CEP\extensions\com.codex.ae.youtubeimporter"
$settingsFolder = Join-Path $env:APPDATA "Waves Media Downloader"
$settingsPath = Join-Path $settingsFolder "Waves-Media-Downloader-settings.json"
$defaultDownloadDir = Join-Path ([Environment]::GetFolderPath("MyDocuments")) "Waves Media Downloads"
$ffmpegInstallRoot = Join-Path $env:LOCALAPPDATA "Waves Media Downloader\ffmpeg"

function Confirm-Yes {
  param([string]$Prompt)

  $answer = Read-Host "$Prompt [y/N]"
  return $answer -match "^(y|yes)$"
}

function Get-SavedDownloadDir {
  if (-not (Test-Path -LiteralPath $settingsPath)) {
    return $defaultDownloadDir
  }

  try {
    $settings = Get-Content -LiteralPath $settingsPath -Raw | ConvertFrom-Json
    if ($settings.downloadDir) {
      return [string]$settings.downloadDir
    }
  }
  catch {
    Write-Host "Could not read saved download folder from settings. Falling back to default." -ForegroundColor Yellow
  }

  return $defaultDownloadDir
}

function Get-PythonCommand {
  $candidates = @("py", "python", "python3")
  foreach ($candidate in $candidates) {
    if (Get-Command $candidate -ErrorAction SilentlyContinue) {
      return $candidate
    }
  }
  return $null
}

function Test-SafeDirectoryRemoval {
  param([string]$Path)

  if (-not $Path) {
    return $false
  }
  try {
    $resolved = (Resolve-Path -LiteralPath $Path -ErrorAction Stop).Path.TrimEnd('\')
  }
  catch {
    return $false
  }

  $blocked = @(
    [IO.Path]::GetPathRoot($resolved).TrimEnd('\'),
    $env:USERPROFILE.TrimEnd('\'),
    $env:APPDATA.TrimEnd('\'),
    $env:LOCALAPPDATA.TrimEnd('\'),
    ([Environment]::GetFolderPath("MyDocuments")).TrimEnd('\')
  ) | Where-Object { $_ }

  foreach ($blockedPath in $blocked) {
    if ($resolved.Equals($blockedPath, [StringComparison]::OrdinalIgnoreCase)) {
      return $false
    }
  }

  $allowedRoots = @($env:USERPROFILE, $env:APPDATA, $env:LOCALAPPDATA) | Where-Object { $_ }
  foreach ($allowedRoot in $allowedRoots) {
    $rootWithSeparator = $allowedRoot.TrimEnd('\') + '\'
    if ($resolved.StartsWith($rootWithSeparator, [StringComparison]::OrdinalIgnoreCase)) {
      return $true
    }
  }
  return $false
}

function Uninstall-PythonPackage {
  param([string]$PackageName)

  $python = Get-PythonCommand
  if (-not $python) {
    Write-Host "Python was not found on PATH, so $PackageName could not be uninstalled automatically." -ForegroundColor Yellow
    return
  }

  Write-Host "Uninstalling $PackageName..."
  & $python -m pip uninstall -y $PackageName
  if ($LASTEXITCODE -ne 0) {
    Write-Host "pip could not uninstall $PackageName automatically." -ForegroundColor Yellow
  }
}

Write-Host "Uninstalling Waves Media Downloader..."
Write-Host ""

if (Test-Path -LiteralPath $target) {
  try {
    Remove-Item -LiteralPath $target -Recurse -Force
    Write-Host "Removed extension files from:"
    Write-Host "  $target"
  }
  catch {
    Write-Host "Could not remove the extension folder." -ForegroundColor Red
    Write-Host "Target:" -ForegroundColor Red
    Write-Host "  $target" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try this:" -ForegroundColor Yellow
    Write-Host "  1. Close After Effects."
    Write-Host "  2. Right-click uninstall-windows.bat and choose Run as administrator."
    Write-Host ""
    Write-Host "Original error:" -ForegroundColor Yellow
    Write-Host "  $($_.Exception.Message)"
    Read-Host "Press Enter to close"
    exit 1
  }
}
else {
  Write-Host "The extension folder was not found. It may already be uninstalled:"
  Write-Host "  $target"
}

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

Write-Host ""
$downloadDir = Get-SavedDownloadDir

if (Confirm-Yes "Also remove saved settings and downloaded media? This can delete files permanently.") {
  if (Test-Path -LiteralPath $downloadDir) {
    Write-Host "Removing downloaded media from:"
    Write-Host "  $downloadDir"
    if (Test-SafeDirectoryRemoval -Path $downloadDir) {
      Remove-Item -LiteralPath $downloadDir -Recurse -Force
    }
    else {
      Write-Host "Skipped media removal because the saved download folder is too broad or outside the current user profile." -ForegroundColor Yellow
      Write-Host "Remove it manually if this path is intentional." -ForegroundColor Yellow
    }
  }
  else {
    Write-Host "Download folder was not found:"
    Write-Host "  $downloadDir"
  }

  if (Test-Path -LiteralPath $settingsFolder) {
    Write-Host "Removing saved settings from:"
    Write-Host "  $settingsFolder"
    Remove-Item -LiteralPath $settingsFolder -Recurse -Force
  }
  else {
    Write-Host "Settings folder was not found:"
    Write-Host "  $settingsFolder"
  }
}
else {
  Write-Host "Saved settings were kept here:"
  Write-Host "  $settingsFolder"
  Write-Host "Downloaded media was kept here:"
  Write-Host "  $downloadDir"
}

if (Confirm-Yes "Also uninstall yt-dlp, spotify-dlp, and the local Waves FFmpeg copy?") {
  Uninstall-PythonPackage -PackageName "yt-dlp"
  Uninstall-PythonPackage -PackageName "spotify-dlp"
  if (Test-Path -LiteralPath $ffmpegInstallRoot) {
    Write-Host "Removing local Waves FFmpeg copy from:"
    Write-Host "  $ffmpegInstallRoot"
    Remove-Item -LiteralPath $ffmpegInstallRoot -Recurse -Force
  }
}
else {
  Write-Host "Installed tools such as yt-dlp, spotify-dlp, Python, and FFmpeg were kept."
}

Write-Host ""
Write-Host "Restart After Effects if it is currently open."
Write-Host ""
Read-Host "Press Enter to close"
