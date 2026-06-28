# Changelog

User-visible changes to Waves Media Downloader are recorded here.

## Unreleased

## 1.4.7.5 - 2026-06-28

- Fixed Spotify media conversion errors

## 1.4.7 - 2026-06-28

- Clarified installation, privacy, licensing, and release documentation.

## 1.4.6 - 2026-06-28

- Added clean public ZIP packaging and a distribution license.
- Added MP3 and M4A containers for custom audio presets with automatic migration and validation.
- Improved conversion wording and corrected encoder reporting when no encoder ran.

## 1.4.5 - 2026-06-28

- Restored GPU-first conversion for built-in H.264 presets.
- Corrected GPU fallback reporting and diagnostics.

## 1.4.4 - 2026-06-28

- Prevented unnecessary CPU retries after non-hardware FFmpeg failures.

## 1.4.3 - 2026-06-28

- Removed Pause, Resume, and Cancel controls that could not work while After Effects was blocked.

## 1.4.2 - 2026-06-28

- Added clear requested/actual encoder and CPU fallback reporting.

## 1.4.1 - 2026-06-28

- Enabled automatic GPU encoding for compatible built-in presets.
- Added a global option to disable hardware acceleration.

## 1.4.0 - 2026-06-28

- Added GPU selection and CPU fallback for custom H.264/H.265 presets.
- Added Delete All for Download History.
- Prevented download dialogs from covering queue controls.

## 1.3.6 - 2026-06-28

- Added a visible waiting notice during media discovery.

## 1.3.5 - 2026-06-28

- Redesigned TikTok statistics with a clearer compact layout.

## 1.3.4 - 2026-06-28

- Made History Redownload use the currently selected conversion preset.
- Clarified FFmpeg conversion preset controls.

## 1.3.3 - 2026-06-28

- Simplified media inspection while retaining Check TikTok Stats.

## 1.3.2 - 2026-06-28

- Added download/conversion waiting guidance.
- Made Redownload fetch a fresh copy and improved damaged-media errors.

## 1.3.1 - 2026-06-27

- Made Auto the default conversion mode.
- Displayed metadata inside the panel.
- Separated thumbnails and metadata into dedicated folders.

## 1.3.0 - 2026-06-27

- Added FFprobe compatibility detection, built-in conversion presets, and validated custom presets.
- Added preset-aware conversion across all sources.
- Made selected ProRes presets always produce ProRes output.

## 1.2.9 - 2026-06-27

- Removed the blocking automatic yt-dlp startup check.

## 1.2.8 - 2026-06-27

- Hid unnecessary command windows during normal use.

## 1.2.7 - 2026-06-27

- Fixed safe deletion of cached files and improved deletion errors.

## 1.2.6 - 2026-06-27

- Fixed downloaded-file detection while keeping displayed command output redacted.
- Stopped incorrect yt-dlp update prompts.

## 1.2.5 - 2026-06-27

- Fixed redacted or stale saved paths breaking media discovery.

## 1.2.4 - 2026-06-27

- Improved command-runner reliability and startup error reporting.

## 1.2.3 - 2026-06-27

- Preserved useful yt-dlp errors and large metadata responses.

## 1.2.2 - 2026-06-27

- Fixed command-runner path detection and duplicate recovery guidance.

## 1.2.1 - 2026-06-27

- Added installer build/source confirmation and SHA-256 verification of copied panel files.

## 1.2.0 - 2026-06-26

- Hardened external command execution with fixed helpers, JSON payloads, and argument arrays.
- Added strict source and filename-template validation, CSP, safe diagnostics, and protected history deletion.
- Added concise error popups with detailed logs.
- Added persistent queue, retry actions, progress reporting, cache/history controls, and guarded cleanup.
- Added AE metadata, project organization, timeline options, conversion presets, and installer trust checks.
