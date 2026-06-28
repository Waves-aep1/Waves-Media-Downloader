Here’s the same README version **without the Panel-Only Install section**:

# Waves Media Downloader

**Waves Media Downloader** is an Adobe After Effects extension for Windows that downloads media and imports it directly into your AE project.

It is built for editors who want a faster workflow for getting clips, audio, and references into After Effects without manually downloading, converting, and importing files one by one.

Current version: `1.4.7`

> Public preview: this release uses the ZIP installer only. A signed ZXP package is not included yet.

---

## Features

### Download and Import

* Download YouTube videos up to 4K
* Download TikTok video or audio
* Download Spotify / song audio workflows
* Download from other sites supported by `yt-dlp`
* Import downloaded media directly into the current After Effects project
* Optional add-to-timeline workflow
* Optional composition creation
* Optional auto-fit to active composition
* Organized source folders for downloads

### Queue and History

* Batch queue for multiple URLs or searches
* Download items one by one with progress information when available
* Download history with cached import, redownload, folder, metadata, URL, and delete actions
* Reuse already downloaded files instead of downloading the same URL again
* Safe deletion only for known cached files inside the configured download folder

### Conversion

* Auto compatibility checks with FFprobe
* AE-friendly FFmpeg conversion presets
* H.264 High Quality and Fast Preview presets
* Constant-frame-rate preset for TikTok, phone footage, and screen recordings
* HDR-to-SDR conversion preset
* ProRes 422 HQ and ProRes 4444 presets
* WAV 48kHz audio preset
* Custom FFmpeg presets with validated options only
* NVIDIA, Intel, or AMD hardware encoding for supported H.264/H.265 presets
* CPU fallback if hardware encoding is unavailable

### Metadata and Diagnostics

* Source metadata comments on imported AE footage when possible
* `.waves-meta.json` sidecar files for source URL, title, download date, conversion mode, and tool versions
* Optional thumbnails and metadata stored in dedicated folders
* Safe Diagnostics button that redacts usernames, paths, cookie sources, credentials, and tokens
* Full Diagnostics option with confirmation

---

## Supported Sources

Waves Media Downloader supports:

* YouTube
* TikTok video and audio
* Spotify / song search
* Other websites supported by `yt-dlp`

Support depends on the external tools and the website you are downloading from. Some sites may require cookies, login, or may stop working if the site changes.

---

## Requirements

* Windows
* Adobe After Effects 2022 or newer
* Internet connection for downloads and optional dependency installation

The installer can install or update these dependencies when needed:

* `yt-dlp`
* `spotify-dlp`
* FFmpeg / ffprobe
* Python 3.12
* `winget`

---

## Installation

1. Download `Waves-Media-Downloader-v1.4.7.zip` from the GitHub Release assets.
2. Extract the ZIP into a new empty folder.
3. Run `install-windows.bat`.
4. Review the installer summary.
5. Confirm the build version is `1.4.7`.
6. Restart After Effects.
7. Open `Window > Extensions > Waves Media Downloader`.
8. Choose a download folder on first launch.

Do not use GitHub’s automatic **Source code** ZIP as the installer package. Use the release asset named:

```txt
Waves-Media-Downloader-v1.4.7.zip
```

---

## Public Preview Notice

This version is an unsigned CEP panel.

The installer enables Adobe CEP `PlayerDebugMode` for the current Windows user so After Effects can load the extension. This is expected for the current ZIP preview release.

A signed distribution package is planned for a later release.

---

## Basic Usage

1. Open After Effects.
2. Open `Window > Extensions > Waves Media Downloader`.
3. Choose a source mode, such as YouTube, TikTok, Spotify, or Other Sites.
4. Paste a URL or search term.
5. Choose download and conversion settings.
6. Start the download.
7. Wait until the file is downloaded, converted if needed, and imported into After Effects.

During downloads or conversions, After Effects may appear temporarily unresponsive. Do not force close After Effects while a job is running.

---

## Conversion Notes

Keep **Convert incompatible files for After Effects** enabled if AE cannot import a downloaded format correctly.

Auto mode checks the downloaded media and skips files that are already safe for After Effects. Non-ideal files are converted with a recommended preset.

Examples:

* Compatible H.264 MP4/MOV files can be reused
* ProRes MOV files can be reused
* WAV, AAC/M4A, and MP3 audio can be reused
* HEVC, HDR, VFR/TikTok media, VP9, AV1, WebM, MKV, and legacy containers may be converted
* Selecting ProRes explicitly always creates ProRes output
* ProRes conversion uses CPU
* Supported H.264/H.265 presets can use GPU encoding with CPU fallback

Custom presets use safe fields only. Raw FFmpeg command input is not accepted.

---

## Privacy

Waves Media Downloader stores settings, credentials, paths, downloads, and history locally on your computer.

It does not upload your data to a Waves Media Downloader-owned server.

Downloads and optional features may contact third-party services depending on what you use, including:

* the selected website
* YouTube
* TikTok
* TikWM
* Spotify
* Song.link
* GitHub
* Python.org
* `winget`
* FFmpeg sources such as gyan.dev

Spotify client credentials are saved locally so they do not need to be entered every time. They are masked by default and removed from diagnostics and command output controlled by Waves Media Downloader.

Browser cookies are optional. If enabled, `yt-dlp` may access supported sites using your logged-in browser session. Only enable browser cookies if you understand the privacy implications.

---

## Troubleshooting

### The panel does not appear in After Effects

* Restart After Effects after installation
* Make sure you installed from the extracted folder
* Check `Window > Extensions > Waves Media Downloader`
* Re-run `install-windows.bat`

### Windows blocks the installer

Right-click `install-windows.bat` and choose **Run as administrator** only if normal launch is blocked or permissions are required.

### FFmpeg is missing

Use the installer dependency setup or set the FFmpeg path manually in Settings.

### A YouTube download fails

Try updating `yt-dlp` from Settings. If the video requires login, choose a browser under the YouTube cookies setting.

### After Effects looks frozen

Downloads and conversions currently use a blocking After Effects host call. Wait for the job to finish and do not force close After Effects.

### A file imports badly or not at all

Enable conversion and use one of the AE-friendly presets such as H.264 High Quality, H.264 Constant Frame Rate, or ProRes 422 HQ.

---

## Uninstall

Run:

```txt
uninstall-windows.bat
```

The uninstaller can optionally remove:

* saved settings
* downloaded media
* installed command-line tools
* the local FFmpeg copy installed by Waves Media Downloader

Python and separate system FFmpeg installs are not removed automatically.

---

## Responsible Use

Use Waves Media Downloader only for media you have permission to download and use.

You are responsible for following the terms of service of any website you use and for respecting copyright laws.

The author is not responsible for how users choose to use this extension.

---

## License

See [LICENSE](LICENSE).

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.
