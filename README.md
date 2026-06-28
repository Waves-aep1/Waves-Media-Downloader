# Waves Media Downloader

Waves Media Downloader downloads media and imports it directly into Adobe After Effects on Windows.

Current version: `1.4.7`

## Supported Sources

- YouTube
- TikTok video and audio
- Spotify and song search
- Other sites supported by `yt-dlp`

## Main Features

- Direct import, optional timeline placement, composition creation, and project organization
- Batch queue, download history, cached import, redownload, and safe deletion
- AE-friendly conversion with Auto mode, H.264, ProRes, WAV, constant-frame-rate, HDR-to-SDR, hardware encoding, and custom FFmpeg presets
- Automatic NVIDIA, Intel, or AMD H.264/H.265 encoding with CPU fallback
- Source metadata, thumbnails, diagnostics, and readable error details
- Local settings and optional browser-cookie support

## Requirements

- Windows
- Adobe After Effects 2022 or newer
- Internet access

The installer can install or update `yt-dlp`, `spotify-dlp`, FFmpeg, Python 3.12, and `winget` when required.

## Installation

1. Extract the release ZIP into a new folder.
2. Run `install-windows.bat`.
3. Confirm the installer shows build `1.4.7` and the expected source folder.
4. Restart After Effects.
5. Open `Window > Extensions > Waves Media Downloader`.
6. Choose a download folder.


### Public Preview Notice

This version is an unsigned CEP panel. The installer enables Adobe CEP `PlayerDebugMode` for the current Windows user so After Effects can load it. A signed distribution package is planned for a later release.

## Privacy

Waves Media Downloader stores settings, credentials, paths, and downloads locally. It does not upload them to a Waves Media Downloader-owned server.

Downloads and optional features may contact the selected website, YouTube, TikTok, TikWM, Spotify, Song.link, GitHub, Python.org, `winget`, and FFmpeg sources such as gyan.dev.

Spotify credentials remain saved locally so they do not need to be entered for every download. They are masked by default and removed from diagnostics and command output controlled by Waves Media Downloader.

Safe Diagnostics redacts usernames, local paths, cookie sources, credentials, and tokens. Full Diagnostics requires confirmation and still removes Spotify credentials.

Browser cookies are optional. When enabled, `yt-dlp` may access supported sites using your logged-in browser session.

## Conversion Notes

- Keep **Convert incompatible files for After Effects** enabled when AE cannot import a downloaded format.
- Auto mode reuses compatible media and converts unsuitable formats.
- Selecting ProRes always creates ProRes output.
- ProRes conversion uses CPU; supported H.264/H.265 presets can use GPU encoding.
- Generated thumbnails and metadata are stored in dedicated subfolders beside each source category.

Downloads currently use a blocking After Effects host call. After Effects may appear unresponsive during downloads or conversion; do not force close it.

## Uninstall

Run `uninstall-windows.bat`. The uninstaller can optionally remove settings, downloads, installed command-line tools, and the local FFmpeg copy.

## License And Use

See [LICENSE](LICENSE). Use Waves Media Downloader only for media you have the right to download and use.

See [CHANGELOG.md](CHANGELOG.md) for release history.
