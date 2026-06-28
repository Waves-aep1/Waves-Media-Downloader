(function () {
  "use strict";

  var cs = new CSInterface();
  var nodes = {
    source: document.getElementById("source"),
    downloaderTab: document.getElementById("downloaderTab"),
    historyTab: document.getElementById("historyTab"),
    downloaderPanel: document.getElementById("downloaderPanel"),
    historyPanel: document.getElementById("historyPanel"),
    sourcePicker: document.getElementById("sourcePicker"),
    downloadForm: document.getElementById("downloadForm"),
    backToSources: document.getElementById("backToSources"),
    sourceTitle: document.getElementById("sourceTitle"),
    sourceHint: document.getElementById("sourceHint"),
    urlLabel: document.getElementById("urlLabel"),
    url: document.getElementById("url"),
    batchField: document.getElementById("batchField"),
    batchLabel: document.getElementById("batchLabel"),
    batchUrls: document.getElementById("batchUrls"),
    spotifyModeField: document.getElementById("spotifyModeField"),
    spotifyMode: document.getElementById("spotifyMode"),
    formatOptionsGroup: document.getElementById("formatOptionsGroup"),
    tiktokModeField: document.getElementById("tiktokModeField"),
    tiktokMode: document.getElementById("tiktokMode"),
    transcodeField: document.getElementById("transcodeField"),
    transcodeForAe: document.getElementById("transcodeForAe"),
    transcodeHelpText: document.getElementById("transcodeHelpText"),
    actionButtons: document.getElementById("actionButtons"),
    spotifyAuthButton: document.getElementById("spotifyAuthButton"),
    inspectButton: document.getElementById("inspectButton"),
    previewInfoButton: document.getElementById("previewInfoButton"),
    formatInfoButton: document.getElementById("formatInfoButton"),
    tiktokInfoButton: document.getElementById("tiktokInfoButton"),
    addToTimeline: document.getElementById("addToTimeline"),
    autoFitField: document.getElementById("autoFitField"),
    autoFitToComp: document.getElementById("autoFitToComp"),
    createCompIfNeeded: document.getElementById("createCompIfNeeded"),
    downloadThumbnail: document.getElementById("downloadThumbnail"),
    organizeProject: document.getElementById("organizeProject"),
    precomposeLayer: document.getElementById("precomposeLayer"),
    downloadButton: document.getElementById("downloadButton"),
    addToQueueButton: document.getElementById("addToQueueButton"),
    queuePanel: document.getElementById("queuePanel"),
    queueList: document.getElementById("queueList"),
    startQueueButton: document.getElementById("startQueueButton"),
    removeCompletedQueueButton: document.getElementById("removeCompletedQueueButton"),
    clearFailedQueueButton: document.getElementById("clearFailedQueueButton"),
    clearQueueButton: document.getElementById("clearQueueButton"),
    statusTitle: document.getElementById("statusTitle"),
    statusDetail: document.getElementById("statusDetail"),
    refreshHistory: document.getElementById("refreshHistory"),
    deleteAllHistory: document.getElementById("deleteAllHistory"),
    historyList: document.getElementById("historyList"),
    metadataDialog: document.getElementById("metadataDialog"),
    metadataDialogTitle: document.getElementById("metadataDialogTitle"),
    metadataDialogContent: document.getElementById("metadataDialogContent"),
    closeMetadataDialog: document.getElementById("closeMetadataDialog"),
    settingsButton: document.getElementById("settingsButton"),
    settingsDialog: document.getElementById("settingsDialog"),
    cookieAlert: document.getElementById("cookieAlert"),
    cookieAlertMessage: document.getElementById("cookieAlertMessage"),
    cookieAlertClose: document.getElementById("cookieAlertClose"),
    cookieAlertSettings: document.getElementById("cookieAlertSettings"),
    updateDialog: document.getElementById("updateDialog"),
    updateMessage: document.getElementById("updateMessage"),
    declineUpdate: document.getElementById("declineUpdate"),
    installUpdate: document.getElementById("installUpdate"),
    setupDialog: document.getElementById("setupDialog"),
    setupDownloadDir: document.getElementById("setupDownloadDir"),
    browseSetupDownloadDir: document.getElementById("browseSetupDownloadDir"),
    useDefaultDownloadDir: document.getElementById("useDefaultDownloadDir"),
    saveSetup: document.getElementById("saveSetup"),
    errorDialog: document.getElementById("errorDialog"),
    errorDialogTitle: document.getElementById("errorDialogTitle"),
    errorDialogMessage: document.getElementById("errorDialogMessage"),
    closeErrorDialog: document.getElementById("closeErrorDialog"),
    workingDialog: document.getElementById("workingDialog"),
    workingDialogTitle: document.getElementById("workingDialogTitle"),
    workingDialogMessage: document.getElementById("workingDialogMessage"),
    inspectDialog: document.getElementById("inspectDialog"),
    inspectHint: document.getElementById("inspectHint"),
    inspectActions: document.getElementById("inspectActions"),
    inspectResultTitle: document.getElementById("inspectResultTitle"),
    inspectResultDetail: document.getElementById("inspectResultDetail"),
    closeInspectDialog: document.getElementById("closeInspectDialog"),
    configureDialog: document.getElementById("configureDialog"),
    configuredInfo: document.getElementById("configuredInfo"),
    configuredThumb: document.getElementById("configuredThumb"),
    configuredTitle: document.getElementById("configuredTitle"),
    configuredMeta: document.getElementById("configuredMeta"),
    configureFileType: document.getElementById("configureFileType"),
    configureResolutionField: document.getElementById("configureResolutionField"),
    configureResolution: document.getElementById("configureResolution"),
    configureStatus: document.getElementById("configureStatus"),
    cancelConfigure: document.getElementById("cancelConfigure"),
    saveConfigure: document.getElementById("saveConfigure"),
    wavesCredit: document.getElementById("wavesCredit"),
    ytdlpPath: document.getElementById("ytdlpPath"),
    spotifyDlpPath: document.getElementById("spotifyDlpPath"),
    ffmpegPath: document.getElementById("ffmpegPath"),
    conversionMode: document.getElementById("conversionMode"),
    conversionPresetDescription: document.getElementById("conversionPresetDescription"),
    disableHardwareAcceleration: document.getElementById("disableHardwareAcceleration"),
    createPresetBtn: document.getElementById("createPresetBtn"),
    duplicatePresetBtn: document.getElementById("duplicatePresetBtn"),
    editPresetBtn: document.getElementById("editPresetBtn"),
    deletePresetBtn: document.getElementById("deletePresetBtn"),
    presetEditorModal: document.getElementById("presetEditorModal"),
    presetEditorForm: document.getElementById("presetEditorForm"),
    presetEditorTitle: document.getElementById("presetEditorTitle"),
    closePresetEditorBtn: document.getElementById("closePresetEditorBtn"),
    cancelPresetEditorBtn: document.getElementById("cancelPresetEditorBtn"),
    presetNameInput: document.getElementById("presetNameInput"),
    presetDescriptionInput: document.getElementById("presetDescriptionInput"),
    presetOutputType: document.getElementById("presetOutputType"),
    presetContainer: document.getElementById("presetContainer"),
    videoPresetFields: document.getElementById("videoPresetFields"),
    audioPresetFields: document.getElementById("audioPresetFields"),
    presetVideoCodec: document.getElementById("presetVideoCodec"),
    presetHardwareAcceleration: document.getElementById("presetHardwareAcceleration"),
    presetCrf: document.getElementById("presetCrf"),
    presetEncoderPreset: document.getElementById("presetEncoderPreset"),
    presetPixelFormat: document.getElementById("presetPixelFormat"),
    presetFrameRateMode: document.getElementById("presetFrameRateMode"),
    presetTargetFps: document.getElementById("presetTargetFps"),
    presetHdrToSdr: document.getElementById("presetHdrToSdr"),
    presetSkipIfAeFriendly: document.getElementById("presetSkipIfAeFriendly"),
    presetAudioCodec: document.getElementById("presetAudioCodec"),
    presetAudioBitrate: document.getElementById("presetAudioBitrate"),
    presetSampleRate: document.getElementById("presetSampleRate"),
    presetChannels: document.getElementById("presetChannels"),
    presetSuffix: document.getElementById("presetSuffix"),
    presetFaststart: document.getElementById("presetFaststart"),
    presetValidationMessage: document.getElementById("presetValidationMessage"),
    cookiesBrowser: document.getElementById("cookiesBrowser"),
    downloadDir: document.getElementById("downloadDir"),
    browseDownloadDir: document.getElementById("browseDownloadDir"),
    openDownloadDir: document.getElementById("openDownloadDir"),
    filenameTemplate: document.getElementById("filenameTemplate"),
    filenameTemplateNote: document.getElementById("filenameTemplateNote"),
    spotifyClientId: document.getElementById("spotifyClientId"),
    spotifyClientSecret: document.getElementById("spotifyClientSecret"),
    showSpotifyClientSecret: document.getElementById("showSpotifyClientSecret"),
    spotifyAuthState: document.getElementById("spotifyAuthState"),
    updateDependencies: document.getElementById("updateDependencies"),
    aboutText: document.getElementById("aboutText"),
    copySafeDiagnostics: document.getElementById("copySafeDiagnostics"),
    copyFullDiagnostics: document.getElementById("copyFullDiagnostics"),
    saveSettings: document.getElementById("saveSettings"),
    cancelSettings: document.getElementById("cancelSettings")
  };

  var currentSettings = null;
  var queueState = [];
  var configuredDownload = null;
  var metadataCache = {};
  var pendingConfigureAction = "";
  var settingsLoaded = false;
  var saveUiTimer = null;
  var nodeFs = null;
  var nodePath = null;
  var activeJobId = "";
  var activeJobPollTimer = null;
  var editingPresetId = "";
  try {
    if (typeof require === "function") {
      nodeFs = require("fs");
      nodePath = require("path");
    }
  } catch (error) {
    nodeFs = null;
    nodePath = null;
  }
  var sourceInfo = {
    youtube: {
      title: "YouTube",
      hint: "Paste a YouTube video URL, choose quality, then import into AE."
    },
    spotify: {
      title: "Spotify / Song Audio",
      hint: "Use a Spotify URL or type artist and song title. Full metadata uses Spotify auth."
    },
    tiktok: {
      title: "TikTok",
      hint: "Paste a specific TikTok video URL, then download video or MP3 audio."
    },
    other: {
      title: "Other Sites",
      hint: "Paste a media URL supported by yt-dlp. Compatibility conversion still applies."
    }
  };

  function escapeForExtendScript(value) {
    return String(value == null ? "" : value)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r/g, "\\r")
      .replace(/\n/g, "\\n");
  }

  function evalHost(functionName, payload, callback) {
    var script = functionName + "(\"" + escapeForExtendScript(JSON.stringify(payload || {})) + "\")";
    cs.evalScript(script, function (raw) {
      var result;
      try {
        result = JSON.parse(raw);
      } catch (error) {
        result = { ok: false, error: raw || String(error) };
      }
      callback(result);
    });
  }

  function openExternalUrl(url) {
    var opened = false;
    try {
      if (cs && typeof cs.openURLInDefaultBrowser === "function") {
        cs.openURLInDefaultBrowser(url);
        opened = true;
      }
    } catch (error) {}

    if (!opened) {
      try {
        if (window.cep && window.cep.util && typeof window.cep.util.openURLInDefaultBrowser === "function") {
          window.cep.util.openURLInDefaultBrowser(url);
          opened = true;
        }
      } catch (error) {}
    }

    if (opened) {
      setStatus("Opening link", url);
      return;
    }

    evalHost("ytImporterOpenExternalUrl", { url: url }, function (result) {
      if (!result.ok) {
        setStatus("Could not open link", result.error || "Open this URL manually:\n" + url, true);
        return;
      }
      setStatus("Opening link", url);
    });
  }

  function createJobId() {
    return Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function jobDirectory() {
    if (!nodePath || typeof process === "undefined" || !process.env) {
      return "";
    }
    var base = process.env.APPDATA || process.env.HOME || "";
    return base ? nodePath.join(base, "Waves Media Downloader") : "";
  }

  function jobFilePath(jobId, suffix) {
    var dir = jobDirectory();
    return dir && jobId ? nodePath.join(dir, "job-" + jobId + suffix) : "";
  }

  function formatJobProgress(progress) {
    var lines = [];
    lines.push("Stage: " + (progress.stage || "running"));
    if (progress.percent !== null && progress.percent !== undefined && progress.percent !== "") {
      lines.push("Progress: " + progress.percent + "%");
    }
    if (progress.speed) {
      lines.push("Speed: " + progress.speed);
    }
    if (progress.eta) {
      lines.push("ETA: " + progress.eta);
    }
    if (progress.filename) {
      lines.push("File: " + sanitizeSensitiveText(fileNameFromPath(progress.filename)));
    }
    if (progress.message) {
      lines.push("");
      lines.push(sanitizeSensitiveText(progress.message));
    }
    return lines.join("\n");
  }

  function readJobProgress(jobId) {
    if (!nodeFs || !jobId) {
      return null;
    }
    var path = jobFilePath(jobId, ".json");
    if (!path || !nodeFs.existsSync(path)) {
      return null;
    }
    try {
      return JSON.parse(nodeFs.readFileSync(path, "utf8"));
    } catch (error) {
      return null;
    }
  }

  function startJobProgressPolling(jobId, label) {
    stopJobProgressPolling(false);
    if (!nodeFs || !jobId) {
      return;
    }
    activeJobPollTimer = window.setInterval(function () {
      var progress = readJobProgress(jobId);
      if (!progress || activeJobId !== jobId) {
        return;
      }
      setStatus(label || "Working", formatJobProgress(progress));
    }, 700);
  }

  function stopJobProgressPolling(hideCancel) {
    if (activeJobPollTimer) {
      window.clearInterval(activeJobPollTimer);
      activeJobPollTimer = null;
    }
    if (hideCancel) {
      activeJobId = "";
    }
  }

  function setActiveTab(tabName) {
    var showHistory = tabName === "history";
    nodes.downloaderTab.className = showHistory ? "tab" : "tab active";
    nodes.historyTab.className = showHistory ? "tab active" : "tab";
    nodes.downloaderPanel.className = showHistory ? "tab-panel hidden" : "tab-panel";
    nodes.historyPanel.className = showHistory ? "tab-panel" : "tab-panel hidden";
    if (showHistory) {
      loadHistory();
    }
  }

  function showSourcePicker() {
    nodes.sourcePicker.className = "source-picker";
    nodes.downloadForm.className = "download-form hidden";
  }

  function showDownloadForm(source) {
    if (source) {
      nodes.source.value = source;
    }
    updateSourceUi();
    nodes.sourcePicker.className = "source-picker hidden";
    nodes.downloadForm.className = "download-form";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parseKeyValueLines(text) {
    var data = {};
    var lines = String(text || "").split(/\r?\n/);
    for (var i = 0; i < lines.length; i += 1) {
      var line = lines[i];
      var index = line.indexOf(":");
      if (index > 0) {
        data[line.substring(0, index).replace(/^\s+|\s+$/g, "")] = line.substring(index + 1).replace(/^\s+|\s+$/g, "");
      }
    }
    return data;
  }

  function statCard(label, value) {
    return '<div class="stat-card"><div class="label">' + escapeHtml(label) + '</div><div class="value">' + escapeHtml(value || "unknown") + '</div></div>';
  }

  function infoRow(label, value) {
    if (!value || value === "unknown") {
      return "";
    }
    return '<div class="info-row"><div class="label">' + escapeHtml(label) + '</div><div class="value">' + escapeHtml(value) + '</div></div>';
  }

  function tiktokMetric(label, value) {
    return '<div class="tiktok-metric"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value || "unknown") + '</strong></div>';
  }

  function renderTikTokInfo(text, targetNode) {
    var data = parseKeyValueLines(text);
    var html = '<div class="tiktok-overview">';
    html += '<div class="tiktok-header">';
    if (data.Thumbnail) {
      html += '<img src="' + escapeHtml(data.Thumbnail) + '" alt="" />';
    } else {
      html += '<div class="tiktok-thumb-placeholder"></div>';
    }
    html += '<div class="tiktok-copy">';
    html += '<strong class="tiktok-title">' + escapeHtml(data.Title || "TikTok video") + '</strong>';
    html += '<div class="tiktok-author">' + escapeHtml(data.Author || "Unknown author") + '</div>';
    if (data.Date) {
      html += '<div class="tiktok-date">' + escapeHtml(data.Date) + '</div>';
    }
    html += '</div></div>';
    html += '<div class="tiktok-metrics">';
    html += tiktokMetric("Views", data.Views);
    html += tiktokMetric("Likes", data.Likes);
    html += tiktokMetric("Comments", data.Comments);
    html += tiktokMetric("Shares", data.Shares);
    html += '</div>';
    html += '<div class="tiktok-media-summary">';
    html += tiktokMetric("Duration", data.Duration);
    html += tiktokMetric("Resolution", data.Resolution);
    html += tiktokMetric("File size", data["File size"] || data["HD file size"] || data["Estimated size"]);
    html += '</div>';
    html += '<div class="tiktok-tech">';
    html += infoRow("FPS", data.FPS);
    html += infoRow("Video", data["Video codec"]);
    html += infoRow("Audio", data["Audio codec"]);
    html += infoRow("Format", data.Format || data.Extension);
    html += infoRow("Bitrate", data.Bitrate);
    html += infoRow("VQ Score", data["VQ Score"]);
    html += infoRow("Source", data.Source);
    html += infoRow("Sound", data.Sound);
    html += infoRow("Region", data.Region);
    html += infoRow("Uploader ID", data["Uploader ID"]);
    html += infoRow("ID", data.ID);
    html += '</div>';
    html += '<details class="format-details"><summary>More technical details</summary><pre>' + escapeHtml(text || "") + '</pre></details>';
    html += '</div>';
    (targetNode || nodes.statusDetail).innerHTML = html;
  }

  function renderPreviewInfo(preview, targetNode) {
    var html = '<div class="preview-panel">';
    if (preview && preview.thumbnail) {
      html += '<img src="' + escapeHtml(preview.thumbnail) + '" alt="" />';
    } else {
      html += '<div></div>';
    }
    html += '<div class="preview-body">';
    html += '<strong>' + escapeHtml((preview && preview.title) || "Media preview") + '</strong>';
    html += '<div class="preview-meta">' + escapeHtml((preview && preview.uploader) || "Unknown creator") + '</div>';
    html += '<div class="stat-grid">';
    html += statCard("Duration", preview && preview.duration ? preview.duration + "s" : "unknown");
    html += statCard("Resolution", preview && preview.resolution ? preview.resolution : "unknown");
    html += statCard("File size", preview && preview.filesize ? preview.filesize : "unknown");
    html += statCard("Source", preview && preview.extractor ? preview.extractor : "yt-dlp");
    html += '</div>';
    html += '</div></div>';
    (targetNode || nodes.statusDetail).innerHTML = html;
  }

  function setStatus(title, detail, isError) {
    var formatted = isError ? formatErrorMessage(title, detail) : null;
    nodes.statusTitle.textContent = formatted ? formatted.title : title;
    var displayDetail = formatted ? formatted.detailMessage : detail;
    if (title === "TikTok info" && displayDetail) {
      renderTikTokInfo(displayDetail);
    } else if (title === "Preview info" && displayDetail && typeof displayDetail === "object") {
      renderPreviewInfo(displayDetail);
    } else {
      nodes.statusDetail.textContent = displayDetail || "";
    }
    nodes.statusTitle.style.color = isError ? "var(--danger)" : "var(--text)";
    if (isError) {
      showErrorPopup(formatted.title, formatted.popupMessage);
    }
  }

  function setInspectResult(title, detail, isError) {
    var formatted = isError ? formatErrorMessage(title, detail) : null;
    nodes.inspectResultTitle.textContent = formatted ? formatted.title : title;
    nodes.inspectResultTitle.className = title === "TikTok info" && !isError ? "hidden" : "";
    var displayDetail = formatted ? formatted.detailMessage : detail;
    if (title === "TikTok info" && displayDetail) {
      renderTikTokInfo(displayDetail, nodes.inspectResultDetail);
    } else if (title === "Preview info" && displayDetail && typeof displayDetail === "object") {
      renderPreviewInfo(displayDetail, nodes.inspectResultDetail);
    } else {
      nodes.inspectResultDetail.textContent = displayDetail || "";
    }
    nodes.inspectResultTitle.style.color = isError ? "var(--danger)" : "var(--text)";
    if (isError) {
      showErrorPopup(formatted.title, formatted.popupMessage);
    }
  }

  function sanitizeSensitiveText(value, preserveLocalPaths) {
    var text = String(value || "Unknown error.")
      .replace(/\x1b\[[0-9;]*m/g, "")
      .replace(/^\s+|\s+$/g, "");
    var settings = currentSettings || {};
    if (settings.spotifyClientSecret) {
      text = text.split(settings.spotifyClientSecret).join("[SPOTIFY_SECRET]");
    }
    if (settings.spotifyClientId) {
      text = text.split(settings.spotifyClientId).join("[SPOTIFY_CLIENT_ID]");
    }
    if (!preserveLocalPaths) {
      text = text.replace(/[A-Za-z]:\\Users\\[^\\\r\n]+/g, "[USER_HOME]");
      text = text.replace(/\/Users\/[^\/\r\n]+/g, "[USER_HOME]");
      text = text.replace(/[A-Za-z]:\\[^\r\n"]{12,}/g, "[LOCAL_PATH]");
    }
    text = text.replace(/\b((?:access[_-]?token|refresh[_-]?token|token|secret|client_secret)=)([^\s&]+)/ig, "$1[REDACTED]");
    text = text.replace(/\b[A-Za-z0-9_-]{32,}\b/g, "[REDACTED_TOKEN]");
    return text;
  }

  function firstHelpfulLine(value) {
    var text = String(value || "").replace(/\r/g, "\n");
    var lines = text.split("\n");
    for (var i = 0; i < lines.length; i += 1) {
      var line = lines[i].replace(/^\s+|\s+$/g, "");
      if (line && !/^command output:?$/i.test(line) && !/^\[?debug\]?/i.test(line)) {
        return line;
      }
    }
    return "Something went wrong.";
  }

  function popupHelpText(errorText, helpText) {
    var tips = String(helpText || "").replace(/^\s*What to try:\s*/i, "").replace(/^- /gm, "");
    var firstTip = tips.split("\n").filter(function (line) { return line.replace(/^\s+|\s+$/g, ""); })[0] || "Check the URL, update yt-dlp from Settings, then try again.";
    return firstHelpfulLine(errorText) + "\n\nTry this: " + firstTip.replace(/^\s+|\s+$/g, "");
  }

  function formatErrorMessage(title, detail) {
    var sanitized = sanitizeSensitiveText(detail);
    var help = /\n\s*What to try:/i.test(sanitized) ? "" : friendlyErrorHelp(sanitized);
    return {
      title: title || "Error",
      popupMessage: shortMessage(popupHelpText(sanitized, help), 360),
      detailMessage: sanitized + help
    };
  }

  function shortMessage(value, maxLength) {
    var text = sanitizeSensitiveText(value);
    var limit = maxLength || 700;
    if (text.length > limit) {
      text = text.substring(0, limit - 3) + "...";
    }
    return text;
  }

  function showErrorPopup(title, detail) {
    nodes.errorDialogTitle.textContent = title || "Error";
    nodes.errorDialogMessage.textContent = shortMessage(detail);
    nodes.errorDialog.hidden = false;
  }

  function showWorkingDialog(title, message, nonBlocking) {
    nodes.workingDialogTitle.textContent = title;
    nodes.workingDialogMessage.textContent = message;
    nodes.workingDialog.className = nonBlocking ? "modal working-modal working-toast" : "modal working-modal";
    nodes.workingDialog.hidden = false;
  }

  function hideWorkingDialog() {
    nodes.workingDialog.hidden = true;
  }

  function setBusy(isBusy) {
    nodes.downloadButton.disabled = isBusy;
    nodes.addToQueueButton.disabled = isBusy;
    nodes.startQueueButton.disabled = isBusy;
    nodes.spotifyAuthButton.disabled = isBusy;
    nodes.inspectButton.disabled = isBusy;
    nodes.previewInfoButton.disabled = isBusy;
    nodes.formatInfoButton.disabled = isBusy;
    nodes.tiktokInfoButton.disabled = isBusy;
    nodes.installUpdate.disabled = isBusy;
    nodes.declineUpdate.disabled = isBusy;
    nodes.updateDependencies.disabled = isBusy;
    nodes.deleteAllHistory.disabled = isBusy;
    nodes.downloadButton.textContent = isBusy ? "Working..." : "Download and Import";
  }

  function selectedCookiesBrowserLabel() {
    var select = nodes.cookiesBrowser;
    if (!select || select.selectedIndex < 0 || !select.value) {
      return "None";
    }
    return select.options[select.selectedIndex].text;
  }

  function showCookieAlert(message) {
    nodes.cookieAlertMessage.textContent = message;
    nodes.cookieAlert.hidden = false;
  }

  function updateSpotifyAuthState(isCompleted) {
    if (isCompleted) {
      nodes.spotifyAuthState.textContent = "Spotify auth completed. Waves fills these fields from spotify-dlp when its config stores the client credentials. If you enter new credentials and save, Waves will apply them to spotify-dlp.";
      nodes.spotifyAuthState.className = "settings-note ok";
      nodes.spotifyAuthButton.textContent = "Spotify is authenticated";
    } else {
      nodes.spotifyAuthState.textContent = "Spotify auth not completed yet. Use Authenticate Spotify for Full Spotify metadata mode, or enter client credentials and save to apply them to spotify-dlp.";
      nodes.spotifyAuthState.className = "settings-note";
      nodes.spotifyAuthButton.textContent = "Authenticate Spotify";
    }
  }

  function setSelectValue(select, value, fallback) {
    if (!select) {
      return;
    }
    var wanted = value || fallback || "";
    for (var i = 0; i < select.options.length; i += 1) {
      if (select.options[i].value === wanted) {
        select.value = wanted;
        return;
      }
    }
    if (fallback !== undefined) {
      select.value = fallback;
    }
  }

  var BUILTIN_CONVERSION_PRESETS = {
    auto: { id: "auto", type: "builtin_ffmpeg", label: "Auto: AE-friendly", description: "Skips safe media and converts non-ideal files with a recommended preset.", outputType: "video", basePresetId: "h264_high", skipIfAeFriendly: true },
    h264_high: { id: "h264_high", type: "builtin_ffmpeg", label: "H.264 High Quality", description: "High-quality AE-compatible MP4. Reuses safe H.264 input.", outputType: "video", container: "mp4", suffix: "-AE-H264-HQ", videoCodec: "libx264", crf: 18, encoderPreset: "medium", pixelFormat: "yuv420p", frameRateMode: "keep", targetFps: "source", audioCodec: "aac", audioBitrate: "192k", sampleRate: "48000", channels: "keep", faststart: true, hdrToSdr: false },
    h264_preview: { id: "h264_preview", type: "builtin_ffmpeg", label: "H.264 Fast Preview", description: "Fast preview MP4. Reuses safe H.264 input.", outputType: "video", container: "mp4", suffix: "-AE-H264-Preview", videoCodec: "libx264", crf: 23, encoderPreset: "ultrafast", pixelFormat: "yuv420p", frameRateMode: "keep", targetFps: "source", audioCodec: "aac", audioBitrate: "192k", sampleRate: "48000", channels: "keep", faststart: true, hdrToSdr: false },
    h264_cfr: { id: "h264_cfr", type: "builtin_ffmpeg", label: "H.264 Constant Frame Rate", description: "Normalizes VFR, phone, screen-recording, and TikTok footage.", outputType: "video", container: "mp4", suffix: "-AE-H264-CFR", videoCodec: "libx264", crf: 18, encoderPreset: "medium", pixelFormat: "yuv420p", frameRateMode: "cfr", targetFps: "source", audioCodec: "aac", audioBitrate: "192k", sampleRate: "48000", channels: "keep", faststart: true, hdrToSdr: false },
    h264_hdr_sdr: { id: "h264_hdr_sdr", type: "builtin_ffmpeg", label: "H.264 HDR to SDR", description: "Tone-maps HDR footage to Rec.709 H.264.", outputType: "video", container: "mp4", suffix: "-AE-H264-SDR", videoCodec: "libx264", crf: 18, encoderPreset: "medium", pixelFormat: "yuv420p", frameRateMode: "keep", targetFps: "source", audioCodec: "aac", audioBitrate: "192k", sampleRate: "48000", channels: "keep", faststart: true, hdrToSdr: true },
    prores_422_hq: { id: "prores_422_hq", type: "builtin_ffmpeg", label: "ProRes 422 HQ", description: "Always creates a ProRes 422 HQ MOV.", outputType: "video", container: "mov", suffix: "-AE-ProRes422HQ", videoCodec: "prores_422_hq", crf: 18, encoderPreset: "medium", pixelFormat: "yuv422p10le", frameRateMode: "keep", targetFps: "source", audioCodec: "pcm_s16le", audioBitrate: "192k", sampleRate: "48000", channels: "keep", faststart: false, hdrToSdr: false },
    prores_4444: { id: "prores_4444", type: "builtin_ffmpeg", label: "ProRes 4444", description: "Always creates a ProRes 4444 MOV.", outputType: "video", container: "mov", suffix: "-AE-ProRes4444", videoCodec: "prores_4444", crf: 18, encoderPreset: "medium", pixelFormat: "yuva444p10le", frameRateMode: "keep", targetFps: "source", audioCodec: "pcm_s16le", audioBitrate: "192k", sampleRate: "48000", channels: "keep", faststart: false, hdrToSdr: false },
    audio_wav_48k: { id: "audio_wav_48k", type: "builtin_ffmpeg", label: "WAV 48kHz Audio", description: "Creates stereo PCM WAV audio; compatible PCM WAV may be reused.", outputType: "audio", container: "wav", suffix: "-Audio-48k", videoCodec: "", crf: 18, encoderPreset: "medium", pixelFormat: "yuv420p", frameRateMode: "keep", targetFps: "source", audioCodec: "pcm_s16le", audioBitrate: "192k", sampleRate: "48000", channels: "stereo", faststart: false, hdrToSdr: false }
  };
  var BUILTIN_PRESET_ORDER = ["auto", "h264_high", "h264_preview", "h264_cfr", "h264_hdr_sdr", "prores_422_hq", "prores_4444", "audio_wav_48k"];

  function getAllConversionPresets() {
    var presets = [];
    for (var i = 0; i < BUILTIN_PRESET_ORDER.length; i += 1) {
      presets.push(BUILTIN_CONVERSION_PRESETS[BUILTIN_PRESET_ORDER[i]]);
    }
    var custom = currentSettings && currentSettings.customConversionPresets ? currentSettings.customConversionPresets : [];
    return presets.concat(custom);
  }

  function getConversionPresetById(id) {
    var presets = getAllConversionPresets();
    for (var i = 0; i < presets.length; i += 1) {
      if (presets[i].id === id) {
        return presets[i];
      }
    }
    return BUILTIN_CONVERSION_PRESETS.auto;
  }

  function getSelectedConversionPreset() {
    return getConversionPresetById(nodes.conversionMode.value || "auto");
  }

  function updateConversionPresetDescription() {
    var preset = getSelectedConversionPreset();
    nodes.conversionPresetDescription.textContent = preset.description || "";
    nodes.editPresetBtn.disabled = preset.type !== "custom_ffmpeg";
    nodes.deletePresetBtn.disabled = preset.type !== "custom_ffmpeg";
  }

  function renderConversionPresetDropdown(selectedId) {
    var custom = currentSettings && currentSettings.customConversionPresets ? currentSettings.customConversionPresets : [];
    var html = '<optgroup label="Built-in">';
    for (var i = 0; i < BUILTIN_PRESET_ORDER.length; i += 1) {
      var preset = BUILTIN_CONVERSION_PRESETS[BUILTIN_PRESET_ORDER[i]];
      html += '<option value="' + escapeHtml(preset.id) + '">' + escapeHtml(preset.label) + '</option>';
    }
    html += "</optgroup>";
    if (custom.length) {
      html += '<optgroup label="Custom">';
      for (var j = 0; j < custom.length; j += 1) {
        html += '<option value="' + escapeHtml(custom[j].id) + '">' + escapeHtml(custom[j].label) + '</option>';
      }
      html += "</optgroup>";
    }
    nodes.conversionMode.innerHTML = html;
    setSelectValue(nodes.conversionMode, selectedId || "auto", "auto");
    updateConversionPresetDescription();
  }

  function clonePreset(preset) {
    return JSON.parse(JSON.stringify(preset));
  }

  function updatePresetEditorVisibility() {
    var audioOnly = nodes.presetOutputType.value === "audio";
    var supportsHardware = !audioOnly && (nodes.presetVideoCodec.value === "libx264" || nodes.presetVideoCodec.value === "libx265");
    var container = nodes.presetContainer.value;
    var audioCodec = nodes.presetAudioCodec.value;
    if (audioOnly) {
      if (audioCodec === "pcm_s16le" && container !== "wav") {
        nodes.presetContainer.value = "wav";
      } else if (audioCodec === "libmp3lame" && container !== "mp3") {
        nodes.presetContainer.value = "mp3";
      } else if (audioCodec === "aac" && container !== "m4a") {
        nodes.presetContainer.value = "m4a";
      }
    } else if (container === "wav" || container === "mp3" || container === "m4a") {
      nodes.presetContainer.value = "mp4";
    }
    nodes.videoPresetFields.className = audioOnly ? "preset-fields hidden" : "preset-fields";
    nodes.presetFaststart.disabled = nodes.presetContainer.value !== "mp4";
    nodes.presetHardwareAcceleration.disabled = !supportsHardware;
    if (!supportsHardware) {
      nodes.presetHardwareAcceleration.value = "cpu";
    }
  }

  function fillPresetEditor(preset) {
    nodes.presetNameInput.value = preset.label || "";
    nodes.presetDescriptionInput.value = preset.description || "";
    nodes.presetOutputType.value = preset.outputType || "video";
    nodes.presetContainer.value = preset.container || "mp4";
    nodes.presetVideoCodec.value = preset.videoCodec || "libx264";
    nodes.presetHardwareAcceleration.value = preset.hardwareAcceleration || "auto";
    nodes.presetCrf.value = preset.crf === undefined ? 18 : preset.crf;
    nodes.presetEncoderPreset.value = preset.encoderPreset || "medium";
    nodes.presetPixelFormat.value = preset.pixelFormat || "yuv420p";
    nodes.presetFrameRateMode.value = preset.frameRateMode || "keep";
    nodes.presetTargetFps.value = preset.targetFps || "source";
    nodes.presetHdrToSdr.checked = preset.hdrToSdr === true;
    nodes.presetSkipIfAeFriendly.checked = preset.skipIfAeFriendly === true;
    nodes.presetAudioCodec.value = preset.audioCodec || "aac";
    nodes.presetAudioBitrate.value = preset.audioBitrate || "192k";
    nodes.presetSampleRate.value = preset.sampleRate || "48000";
    nodes.presetChannels.value = preset.channels || "keep";
    nodes.presetSuffix.value = preset.suffix || "-Custom";
    nodes.presetFaststart.checked = preset.faststart === true;
    nodes.presetValidationMessage.textContent = "";
    updatePresetEditorVisibility();
  }

  function openPresetEditor(mode, preset) {
    editingPresetId = mode === "edit" && preset ? preset.id : "";
    nodes.presetEditorTitle.textContent = mode === "edit" ? "Edit Preset" : "Create Preset";
    fillPresetEditor(preset || clonePreset(BUILTIN_CONVERSION_PRESETS.h264_high));
    nodes.presetEditorModal.hidden = false;
  }

  function closePresetEditor() {
    nodes.presetEditorModal.hidden = true;
    editingPresetId = "";
  }

  function readPresetEditorValues() {
    return {
      id: editingPresetId || "custom_" + new Date().getTime() + "_" + Math.floor(Math.random() * 100000),
      type: "custom_ffmpeg",
      label: nodes.presetNameInput.value.replace(/^\s+|\s+$/g, ""),
      description: nodes.presetDescriptionInput.value,
      outputType: nodes.presetOutputType.value,
      container: nodes.presetContainer.value,
      suffix: nodes.presetSuffix.value.replace(/^\s+|\s+$/g, ""),
      videoCodec: nodes.presetVideoCodec.value,
      hardwareAcceleration: nodes.presetHardwareAcceleration.value,
      crf: Number(nodes.presetCrf.value),
      encoderPreset: nodes.presetEncoderPreset.value,
      pixelFormat: nodes.presetPixelFormat.value,
      frameRateMode: nodes.presetFrameRateMode.value,
      targetFps: nodes.presetTargetFps.value,
      hdrToSdr: nodes.presetHdrToSdr.checked,
      skipIfAeFriendly: nodes.presetSkipIfAeFriendly.checked,
      audioCodec: nodes.presetAudioCodec.value,
      audioBitrate: nodes.presetAudioBitrate.value,
      sampleRate: nodes.presetSampleRate.value,
      channels: nodes.presetChannels.value,
      faststart: nodes.presetFaststart.checked
    };
  }

  function validateCustomPreset(preset) {
    if (!preset.label || preset.label.length > 60) { return "Preset name is required and must be 60 characters or fewer."; }
    if (preset.description.length > 120) { return "Description must be 120 characters or fewer."; }
    if (!preset.suffix || preset.suffix.length > 40 || /[\\\/<>:"|?*]|\.{2}|[&;`]/.test(preset.suffix)) { return "Use a safe suffix up to 40 characters without invalid filename or shell punctuation."; }
    if (preset.crf < 16 || preset.crf > 28 || isNaN(preset.crf)) { return "CRF must be between 16 and 28."; }
    if (preset.outputType === "video" && (preset.container === "wav" || preset.container === "mp3" || preset.container === "m4a")) { return "Video presets must use MP4 or MOV."; }
    if (preset.outputType === "audio" && preset.audioCodec === "none") { return "Audio-only presets require an audio codec."; }
    if (preset.container === "wav" && preset.audioCodec !== "pcm_s16le") { return "WAV presets must use PCM WAV audio."; }
    if (preset.container === "mp3" && preset.audioCodec !== "libmp3lame") { return "MP3 presets must use the MP3 audio codec."; }
    if (preset.container === "m4a" && preset.audioCodec !== "aac") { return "M4A presets must use AAC audio."; }
    if (preset.outputType === "audio" && preset.audioCodec === "pcm_s16le" && preset.container !== "wav") { return "PCM audio-only presets must use WAV."; }
    if (preset.outputType === "audio" && preset.audioCodec === "libmp3lame" && preset.container !== "mp3") { return "MP3 audio-only presets must use the MP3 container."; }
    if (preset.outputType === "audio" && preset.audioCodec === "aac" && preset.container !== "m4a") { return "AAC audio-only presets must use M4A."; }
    if ((preset.videoCodec === "prores_422_hq" || preset.videoCodec === "prores_4444") && preset.container !== "mov") { return "ProRes presets must use MOV."; }
    if (preset.videoCodec === "prores_422_hq" && preset.pixelFormat !== "yuv422p10le") { return "ProRes 422 HQ must use yuv422p10le."; }
    if (preset.videoCodec === "prores_4444" && preset.pixelFormat !== "yuva444p10le") { return "ProRes 4444 must use yuva444p10le."; }
    if (preset.videoCodec === "libx264" && preset.container === "mp4" && preset.pixelFormat !== "yuv420p") { return "H.264 MP4 must use yuv420p."; }
    return "";
  }

  function saveCustomPresetFromEditor() {
    var preset = readPresetEditorValues();
    var error = validateCustomPreset(preset);
    if (error) {
      nodes.presetValidationMessage.textContent = error;
      return;
    }
    var custom = currentSettings.customConversionPresets || [];
    var replaced = false;
    for (var i = 0; i < custom.length; i += 1) {
      if (custom[i].id === preset.id) {
        custom[i] = preset;
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      custom.push(preset);
    }
    currentSettings.customConversionPresets = custom;
    currentSettings.conversionMode = preset.id;
    renderConversionPresetDropdown(preset.id);
    closePresetEditor();
    saveUiPreferencesSoon();
  }

  function duplicateSelectedPreset() {
    var copy = clonePreset(getSelectedConversionPreset());
    copy.id = "";
    copy.type = "custom_ffmpeg";
    copy.label = "Copy of " + copy.label;
    copy.skipIfAeFriendly = false;
    openPresetEditor("create", copy);
  }

  function deleteSelectedPreset() {
    var preset = getSelectedConversionPreset();
    if (preset.type !== "custom_ffmpeg") {
      setStatus("Preset not deleted", "Built-in presets cannot be deleted.", true);
      return;
    }
    if (!window.confirm("Delete custom preset \"" + preset.label + "\"?")) {
      return;
    }
    currentSettings.customConversionPresets = (currentSettings.customConversionPresets || []).filter(function (item) { return item.id !== preset.id; });
    currentSettings.conversionMode = "auto";
    renderConversionPresetDropdown("auto");
    saveUiPreferencesSoon();
  }

  function applyUiPreferences(settings) {
    settings = settings || {};
    setSelectValue(nodes.spotifyMode, settings.lastSpotifyMode, "easy");
    nodes.addToTimeline.checked = settings.addToTimeline !== false;
    nodes.autoFitToComp.checked = settings.autoFitToComp !== false;
    nodes.createCompIfNeeded.checked = settings.createCompIfNeeded !== false;
    nodes.precomposeLayer.checked = settings.precomposeLayer === true;
    updateSourceUi();
  }

  function loadSettings() {
    evalHost("ytImporterGetSettings", {}, function (result) {
      if (!result.ok) {
        setStatus("Settings unavailable", result.error, true);
        return;
      }
      currentSettings = result.settings;
      nodes.ytdlpPath.value = result.settings.ytdlpPath || "yt-dlp";
      nodes.spotifyDlpPath.value = result.settings.spotifyDlpPath || "spotify-dlp";
      nodes.ffmpegPath.value = result.settings.ffmpegPath || "";
      renderConversionPresetDropdown(result.settings.conversionMode || "auto");
      nodes.disableHardwareAcceleration.checked = result.settings.disableHardwareAcceleration === true;
      nodes.cookiesBrowser.value = result.settings.cookiesBrowser || "";
      nodes.downloadDir.value = result.settings.downloadDir || "";
      nodes.setupDownloadDir.value = result.settings.downloadDir || "";
      nodes.filenameTemplate.value = result.settings.filenameTemplate || "%(title).80s-%(id)s.%(ext)s";
      updateFilenameTemplateNote();
      nodes.organizeProject.checked = result.settings.organizeProject !== false;
      nodes.downloadThumbnail.checked = result.settings.downloadThumbnail !== false;
      nodes.spotifyClientId.value = result.settings.spotifyClientId || "";
      nodes.spotifyClientSecret.value = result.settings.spotifyClientSecret || "";
      applyUiPreferences(result.settings);
      settingsLoaded = true;
      updateSpotifyAuthState(result.settings.spotifyAuthCompleted === true);
      if (!result.settings.setupCompleted) {
        nodes.setupDialog.hidden = false;
      }
      if (result.settings.spotifyAuthCompleted) {
        setStatus("Spotify auth completed", "Saved Spotify authentication was found. Full Spotify metadata mode should be ready.");
      }
      updateAboutDiagnostics();
    });
  }

  function collectSettings(setupCompleted) {
    var settings = {
      ytdlpPath: nodes.ytdlpPath.value,
      spotifyDlpPath: nodes.spotifyDlpPath.value,
      ffmpegPath: nodes.ffmpegPath.value,
      conversionMode: nodes.conversionMode.value,
      customConversionPresets: currentSettings && currentSettings.customConversionPresets ? currentSettings.customConversionPresets : [],
      disableHardwareAcceleration: nodes.disableHardwareAcceleration.checked,
      cookiesBrowser: nodes.cookiesBrowser.value,
      downloadDir: nodes.downloadDir.value,
      filenameTemplate: nodes.filenameTemplate.value,
      organizeProject: nodes.organizeProject.checked,
      downloadThumbnail: nodes.downloadThumbnail.checked,
      lastSpotifyMode: nodes.spotifyMode.value,
      addToTimeline: nodes.addToTimeline.checked,
      autoFitToComp: nodes.autoFitToComp.checked,
      createCompIfNeeded: nodes.createCompIfNeeded.checked,
      precomposeLayer: nodes.precomposeLayer.checked,
      spotifyClientId: nodes.spotifyClientId.value,
      spotifyClientSecret: nodes.spotifyClientSecret.value,
      setupCompleted: setupCompleted === false ? false : true
    };
    return settings;
  }

  function saveSettings() {
    var previousSettings = currentSettings || {};
    var settings = collectSettings(true);
    var filenameError = validateFilenameTemplate(settings.filenameTemplate);
    if (filenameError) {
      setStatus("Filename template not saved", filenameError, true);
      return;
    }
    evalHost("ytImporterSaveSettings", settings, function (result) {
      if (!result.ok) {
        setStatus("Settings not saved", result.error, true);
        return;
      }
      currentSettings = result.settings;
      nodes.showSpotifyClientSecret.checked = false;
      nodes.spotifyClientSecret.type = "password";
      nodes.settingsDialog.hidden = true;
      var spotifyChanged = (
        previousSettings.spotifyDlpPath !== settings.spotifyDlpPath ||
        previousSettings.spotifyClientId !== settings.spotifyClientId ||
        previousSettings.spotifyClientSecret !== settings.spotifyClientSecret
      );
      if (spotifyChanged && settings.spotifyClientId && settings.spotifyClientSecret) {
        setStatus("Settings saved", "Applying Spotify settings to spotify-dlp...");
        authenticateSpotify();
        return;
      }
      setStatus("Settings saved", "Ready.");
    });
  }

  function saveUiPreferencesSoon() {
    if (!settingsLoaded) {
      return;
    }
    if (saveUiTimer) {
      window.clearTimeout(saveUiTimer);
    }
    saveUiTimer = window.setTimeout(function () {
      saveUiTimer = null;
      var settings = collectSettings(true);
      evalHost("ytImporterSaveSettings", settings, function (result) {
        if (result && result.ok && result.settings) {
          currentSettings = result.settings;
        }
      });
    }, 250);
  }

  function saveSetup(useDefault) {
    if (useDefault && currentSettings && currentSettings.defaultDownloadDir) {
      nodes.setupDownloadDir.value = currentSettings.defaultDownloadDir;
    }
    evalHost("ytImporterSaveSetup", {
      downloadDir: nodes.setupDownloadDir.value,
      setupCompleted: true
    }, function (result) {
      if (!result.ok) {
        setStatus("Setup not saved", result.error, true);
        return;
      }
      currentSettings = result.settings;
      nodes.downloadDir.value = result.settings.downloadDir || "";
      nodes.setupDownloadDir.value = result.settings.downloadDir || "";
      nodes.setupDialog.hidden = true;
      setStatus("Download folder saved", result.settings.downloadDir || "Ready.");
    });
  }

  function browseDownloadFolder(targetNode) {
    evalHost("ytImporterSelectDownloadFolder", { currentPath: targetNode.value }, function (result) {
      if (!result.ok) {
        setStatus("Folder not selected", result.error || "Could not open the folder picker.", true);
        return;
      }
      if (result.path) {
        targetNode.value = result.path;
      }
    });
  }

  function openDownloadFolder() {
    evalHost("ytImporterOpenFolder", { folder: nodes.downloadDir.value }, function (result) {
      if (!result.ok) {
        setStatus("Could not open folder", result.error || "Download folder not found.", true);
      }
    });
  }

  function redactLocalPath(value) {
    var text = String(value || "");
    if (!text) {
      return "";
    }
    var looksLikePath = /^[a-z]:[\\/]/i.test(text) || /^\\\\/.test(text) || /^\/[^/]+/.test(text) || /[\\/]/.test(text);
    if (!looksLikePath) {
      return text;
    }
    var name = text.replace(/[\\/]+$/g, "").split(/[\\/]/).pop();
    return name ? "[local path]/" + name : "[local path]";
  }

  function redactDiagnosticsValue(value, mode) {
    var text = sanitizeSensitiveText(value, mode === "full");
    if (mode !== "full") {
      text = text.replace(/[A-Za-z]:\\Users\\[^\\\r\n]+/g, "[USER_HOME]");
      text = text.replace(/\/Users\/[^\/\r\n]+/g, "[USER_HOME]");
      text = text.replace(/[A-Za-z]:\\[^\r\n]+/g, "[LOCAL_PATH]");
      text = text.replace(/\\\\[^\\\r\n]+\\[^\r\n]+/g, "[NETWORK_PATH]");
      text = redactLocalPath(text);
    }
    return text;
  }

  function diagnosticsText(data, mode) {
    var isFull = mode === "full";
    var pathText = function (value) { return redactDiagnosticsValue(value || "", mode); };
    var conversionPreset = getConversionPresetById(data.conversionMode || "auto");
    var lines = [
      "Waves Media Downloader diagnostics",
      "Version: " + (data.version || "unknown"),
      "AE version: " + (data.aeVersion || "unknown"),
      "Install location: " + (pathText(data.installLocation) || "unknown"),
      "Command runner: " + (data.runnerAvailable ? "Available" : "Missing"),
      "Runner path: " + (pathText(data.runnerPath) || "unknown"),
      "Settings folder: " + (pathText(data.settingsFolder) || "unknown"),
      "Download folder: " + (pathText(data.downloadDir) || "unknown"),
      "yt-dlp path: " + (pathText(data.ytdlpPath) || "yt-dlp"),
      "spotify-dlp path: " + (pathText(data.spotifyDlpPath) || "spotify-dlp"),
      "FFmpeg path: " + (pathText(data.ffmpegPath) || "PATH/default"),
      "FFmpeg conversion: " + (conversionPreset.label || data.conversionMode || "Auto: AE-friendly"),
      "Hardware acceleration disabled: " + (data.disableHardwareAcceleration ? "Yes" : "No"),
      "YouTube cookies: " + (isFull ? (data.cookiesBrowser || "None") : (data.cookiesBrowser ? "[configured]" : "None")),
      "Organize AE project: " + (data.organizeProject === false ? "No" : "Yes"),
      "Spotify authenticated: " + (data.spotifyAuthCompleted ? "Yes" : "No")
    ];
    return lines.join("\n");
  }

  function validateFilenameTemplate(value) {
    var template = String(value || "").replace(/^\s+|\s+$/g, "");
    if (!template) {
      return "Filename template is required.";
    }
    if (template.length > 180) {
      return "Filename template is too long. Keep it under 180 characters.";
    }
    if (/^[a-z]:/i.test(template) || /^\\\\/.test(template) || /^\//.test(template)) {
      return "Filename template must be a filename, not an absolute path.";
    }
    if (/(^|[\\/])\.\.([\\/]|$)/.test(template) || /\.\./.test(template)) {
      return "Filename template cannot contain path traversal.";
    }
    if (/[\\\/<>:"|?*\x00-\x1F]/.test(template)) {
      return "Filename template cannot contain folders or Windows filename characters: < > : \" / \\ | ? *";
    }
    return "";
  }

  function previewFilenameTemplate(value) {
    var template = String(value || "%(title).80s-%(id)s.%(ext)s");
    return template
      .replace(/%\(title\)(?:\.[0-9]+[Bs])?s/g, "Example Title")
      .replace(/%\(id\)s/g, "abc123")
      .replace(/%\(epoch\)s/g, "1760000000")
      .replace(/%\(ext\)s/g, "mp4")
      .replace(/%\(uploader\)s/g, "Uploader");
  }

  function updateFilenameTemplateNote() {
    var error = validateFilenameTemplate(nodes.filenameTemplate.value);
    if (error) {
      nodes.filenameTemplateNote.textContent = error;
      nodes.filenameTemplateNote.style.color = "var(--danger)";
      return;
    }
    nodes.filenameTemplateNote.style.color = "";
    nodes.filenameTemplateNote.textContent = "Preview: " + previewFilenameTemplate(nodes.filenameTemplate.value);
  }

  function isYouTubeInput(value) {
    return /^https?:\/\/([^\/]+\.)?(youtube\.com|youtu\.be)\//i.test(String(value || ""));
  }

  function isTikTokInput(value) {
    return /^https?:\/\/([^\/]+\.)?tiktok\.com\//i.test(String(value || "")) || /^https?:\/\/v[mt]\.tiktok\.com\//i.test(String(value || ""));
  }

  function isSpotifyInput(value) {
    var text = String(value || "").replace(/^\s+|\s+$/g, "");
    return !/^https?:\/\//i.test(text) || /^https?:\/\/open\.spotify\.com\//i.test(text);
  }

  function validateSourceInput(value) {
    var text = String(value || "").replace(/^\s+|\s+$/g, "");
    if (!text) {
      return missingInputText();
    }
    if (nodes.source.value === "youtube" && !isYouTubeInput(text)) {
      return "YouTube mode needs a youtube.com or youtu.be URL. For song search, use Spotify / song audio.";
    }
    if (nodes.source.value === "tiktok" && !isTikTokInput(text)) {
      return "TikTok mode needs a TikTok video/share URL.";
    }
    if (nodes.source.value === "spotify" && !isSpotifyInput(text)) {
      return "Spotify mode accepts Spotify URLs or artist/song searches.";
    }
    if (nodes.source.value === "other" && !/^https?:\/\//i.test(text)) {
      return "Other Sites mode needs a media URL supported by yt-dlp.";
    }
    return "";
  }

  function validateInputList(inputs) {
    for (var i = 0; i < inputs.length; i += 1) {
      var error = validateSourceInput(inputs[i]);
      if (error) {
        return "Item " + (i + 1) + ": " + error;
      }
    }
    return "";
  }

  function updateAboutDiagnostics() {
    evalHost("ytImporterGetDiagnostics", {}, function (result) {
      if (!result.ok) {
        nodes.aboutText.textContent = "Waves Media Downloader\nDiagnostics unavailable.";
        return;
      }
      nodes.aboutText.textContent = diagnosticsText(result.diagnostics || {}, "full");
    });
  }

  function copyText(text, title, detail) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "readonly");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
      setStatus(title || "Copied", detail || "Copied text to clipboard.");
    } catch (error) {
      setStatus("Copy failed", "Could not copy automatically.\n\n" + text, true);
    }
    document.body.removeChild(area);
  }

  function copyDiagnostics(mode) {
    evalHost("ytImporterGetDiagnostics", {}, function (result) {
      if (!result.ok) {
        setStatus("Diagnostics unavailable", result.error || "Could not collect diagnostics.", true);
        return;
      }
      if (mode === "full" && !window.confirm("Full diagnostics include local paths, tool locations, and the selected cookie browser. Spotify credentials and tokens are still redacted. Copy full diagnostics?")) {
        return;
      }
      copyText(diagnosticsText(result.diagnostics || {}, mode === "full" ? "full" : "safe"), "Diagnostics copied", "Copied Waves Media Downloader diagnostics to clipboard.");
    });
  }



  function fileNameFromPath(path) {
    var name = String(path || "").replace(/\\/g, "/").split("/").pop();
    try {
      name = decodeURIComponent(name);
    } catch (error) {
      name = name.replace(/%20/g, " ");
    }
    return cleanHistoryTitle(name);
  }

  function cleanHistoryTitle(value) {
    var text = String(value || "");
    try {
      text = decodeURIComponent(text);
    } catch (error) {
      text = text.replace(/%20/g, " ");
    }
    text = text.replace(/\.[a-z0-9]{2,5}$/i, "");
    text = text.replace(/-AE-H264$/i, "");
    text = text.replace(/-\d{9,20}$/g, "");
    text = text.replace(/-[a-zA-Z0-9_-]{8,18}$/g, "");
    text = text.replace(/[_]+/g, " ");
    text = text.replace(/^\s*\d+[\.\-_ ]+/, "");
    text = text.replace(/\s*-\s*pgc\s*$/i, "");
    return text.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
  }

  function formatHistoryDate(value) {
    var date = new Date(Number(value || 0));
    if (!value || isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleString();
  }

  function localFileUrl(path) {
    var text = String(path || "").replace(/\\/g, "/");
    if (!text) {
      return "";
    }
    if (/^file:\/\//i.test(text)) {
      return text;
    }
    if (/^[a-zA-Z]:\//.test(text)) {
      return "file:///" + text;
    }
    return "file://" + text;
  }

  function cacheStatusLabel(item) {
    if (!item || item.cacheStatus === "missing" || item.exists === false) {
      return "Missing";
    }
    if (item.cacheStatus === "stale") {
      return "Stale";
    }
    if (item.cacheStatus === "present-source-removed") {
      return "Cached";
    }
    return "Cached";
  }

  function cacheStatusClass(item) {
    if (!item || item.cacheStatus === "missing" || item.exists === false) {
      return "missing";
    }
    if (item.cacheStatus === "stale") {
      return "stale";
    }
    return "present";
  }

  function loadHistory() {
    evalHost("ytImporterGetHistory", {}, function (result) {
      if (!result.ok) {
        nodes.historyList.textContent = "History unavailable.";
        return;
      }
      var history = result.history || [];
      if (!history.length) {
        nodes.historyList.textContent = "No downloads yet.";
        return;
      }
      var html = "";
      var count = Math.min(history.length, 8);
      for (var i = 0; i < count; i += 1) {
        var item = history[i];
        html += '<div class="history-item" data-file="' + escapeHtml(item.file) + '" data-key="' + escapeHtml(item.key) + '" data-source="' + escapeHtml(item.source || "") + '" data-url="' + escapeHtml(item.url || "") + '" data-quality="' + escapeHtml(item.quality || "") + '" data-spotify-mode="' + escapeHtml(item.spotifyMode || "") + '" data-tiktok-mode="' + escapeHtml(item.tiktokMode || "") + '" data-conversion-mode="' + escapeHtml(item.conversionMode || "auto") + '" data-metadata-file="' + escapeHtml(item.metadataFile || "") + '">';
        html += '<div class="history-main">';
        if (item.thumbnail) {
          html += '<img class="history-thumb" src="' + escapeHtml(localFileUrl(item.thumbnail)) + '" alt="" />';
        } else {
          html += '<div class="history-thumb history-thumb-empty">' + escapeHtml((item.source || "M").substring(0, 1).toUpperCase()) + '</div>';
        }
        html += '<div class="history-info">';
        var displayTitle = item.originalTitle || cleanHistoryTitle(item.title || fileNameFromPath(item.file));
        html += '<div class="history-title">' + escapeHtml(displayTitle) + '</div>';
        html += '<div class="history-meta"><span class="cache-badge ' + escapeHtml(cacheStatusClass(item)) + '">' + escapeHtml(cacheStatusLabel(item)) + '</span> ' + escapeHtml((item.source || "media") + " - " + formatHistoryDate(item.savedAt)) + '</div>';
        html += '</div></div><div class="history-actions">';
        if (item.exists !== false) {
          html += '<button type="button" data-action="import">Import</button>';
        }
        if (item.url) {
          html += '<button type="button" data-action="redownload">Redownload</button>';
        }
        html += '<button type="button" data-action="folder">Folder</button>';
        if (item.metadataFile) {
          html += '<button type="button" data-action="metadata">Metadata</button>';
        }
        if (item.url) {
          html += '<button type="button" data-action="copy-url">Copy URL</button>';
          html += '<button type="button" data-action="open-url">Open URL</button>';
        }
        html += '<button type="button" data-action="delete">Delete</button>';
        html += '</div></div>';
      }
      nodes.historyList.innerHTML = html;
    });
  }

  function importExistingFile(file, source, url) {
    setBusy(true);
    setStatus("Importing", "Importing existing media from history...");
    evalHost("ytImporterImportExistingFile", {
      file: file,
      source: source || "",
      url: url || "",
      addToTimeline: nodes.addToTimeline.checked,
      autoFitToComp: nodes.source.value === "spotify" ? false : nodes.autoFitToComp.checked,
      createCompIfNeeded: nodes.createCompIfNeeded.checked,
      organizeProject: !currentSettings || currentSettings.organizeProject !== false,
      renameLayerClean: true,
      precomposeLayer: nodes.precomposeLayer.checked
    }, function (result) {
      setBusy(false);
      if (!result.ok) {
        setStatus("Import failed", result.error || "Could not import existing file.", true);
        return;
      }
      setStatus("Done", "Imported existing file:\n" + (result.file || file) + (result.mediaStats ? "\n\nMedia stats:\n" + result.mediaStats : ""));
    });
  }

  function openHistoryFile(file) {
    evalHost("ytImporterOpenFileLocation", { file: file }, function (result) {
      if (!result.ok) {
        setStatus("Could not open folder", result.error || "File not found.", true);
      }
    });
  }

  function metadataDisplayText(metadata) {
    metadata = metadata || {};
    var fields = [
      ["Title", "title"], ["Original title", "originalTitle"], ["Original artist", "originalArtist"], ["Source", "source"], ["Source URL", "sourceUrl"], ["Downloaded", "downloadDate"],
      ["Final file", "finalFile"], ["Original file", "originalFile"], ["Transcoded", "transcoded"],
      ["Quality", "quality"], ["Requested preset", "requestedConversionPreset"], ["Actual preset", "actualConversionPreset"],
      ["Video encoding", "actualHardwareAcceleration"],
      ["Requested encoding", "requestedHardwareAcceleration"], ["GPU fallback used", "hardwareFallbackUsed"],
      ["Plugin version", "pluginVersion"], ["yt-dlp version", "ytdlpVersion"],
      ["spotify-dlp version", "spotifyDlpVersion"], ["FFmpeg version", "ffmpegVersion"]
    ];
    var lines = [];
    for (var i = 0; i < fields.length; i += 1) {
      var value = metadata[fields[i][1]];
      if (value !== undefined && value !== null && value !== "") {
        lines.push(fields[i][0] + ": " + (value === true ? "Yes" : value === false ? "No" : String(value)));
      }
    }
    if (metadata.importedFiles && metadata.importedFiles.length) {
      lines.push("Imported files:\n- " + metadata.importedFiles.join("\n- "));
    }
    return lines.length ? lines.join("\n\n") : "No readable metadata fields were found.";
  }

  function showHistoryMetadata(key) {
    evalHost("ytImporterGetHistoryMetadata", { key: key }, function (result) {
      if (!result.ok) {
        setStatus("Metadata unavailable", result.error || "No metadata was saved for this download.", true);
        return;
      }
      nodes.metadataDialogTitle.textContent = result.metadata && result.metadata.title ? result.metadata.title : "Download Metadata";
      nodes.metadataDialogContent.textContent = metadataDisplayText(result.metadata);
      nodes.metadataDialog.hidden = false;
    });
  }

  function deleteHistoryFile(key, file) {
    if (!window.confirm("Delete this local media file?")) {
      return;
    }
    evalHost("ytImporterDeleteHistoryFile", { key: key, file: file }, function (result) {
      if (!result.ok) {
        setStatus("Delete failed", result.error || "Could not delete file.", true);
        return;
      }
      setStatus("Deleted", "Removed file and history entry.");
      loadHistory();
    });
  }

  function deleteAllHistoryFiles() {
    if (!window.confirm("Delete every cached media file in Download History, including its saved thumbnail and metadata? This cannot be undone if Recycle Bin removal is unavailable.")) {
      return;
    }
    setBusy(true);
    evalHost("ytImporterDeleteAllHistoryFiles", {}, function (result) {
      setBusy(false);
      if (!result.ok) {
        setStatus("Delete all failed", result.error || "No history files were removed.", true);
        loadHistory();
        return;
      }
      setStatus("History cleared", "Removed " + Number(result.removed || 0) + " history item(s)." + (result.skipped ? " Skipped " + result.skipped + " unsafe or locked item(s)." : ""));
      loadHistory();
    });
  }

  function redownloadHistoryItem(item) {
    var url = item.getAttribute("data-url") || "";
    var source = item.getAttribute("data-source") || "other";
    if (!url) {
      setStatus("Redownload unavailable", "This history item does not have a source URL saved.", true);
      return;
    }
    setSelectValue(nodes.source, source, "other");
    nodes.url.value = url;
    updateSourceUi();
    var quality = item.getAttribute("data-quality") || "";
    var spotifyMode = item.getAttribute("data-spotify-mode") || "";
    var tiktokMode = item.getAttribute("data-tiktok-mode") || "";
    var mediaType = quality === "audio" || tiktokMode === "mp3" ? "audio" : "video";
    if (spotifyMode) {
      setSelectValue(nodes.spotifyMode, spotifyMode, nodes.spotifyMode.value);
    }
    configuredDownload = {
      url: url,
      source: source,
      mediaType: mediaType,
      quality: quality || "best2160"
    };
    var payload = buildDownloadPayload(url, { quality: configuredDownload.quality, mediaType: mediaType });
    payload.forceRedownload = true;
    if (spotifyMode) {
      payload.spotifyMode = spotifyMode;
    }
    if (tiktokMode) {
      payload.tiktokMode = tiktokMode;
    }
    setBusy(true);
    runDownload({ payload: payload, title: queueTitleForPayload(payload) }, 0, 1, function (ok, input, detail) {
      setBusy(false);
      loadHistory();
      setStatus(ok ? "Redownload complete" : "Redownload failed", detail, !ok);
    });
  }

  function missingInputText() {
    if (nodes.source.value === "spotify") {
      return "Paste a song title and artist, or a Spotify URL.";
    }
    if (nodes.source.value === "tiktok") {
      return "Paste a TikTok URL.";
    }
    if (nodes.source.value === "other") {
      return "Paste a supported media URL.";
    }
    return "Paste a YouTube URL.";
  }

  function batchInputs() {
    var inputs = [];
    var batchText = nodes.batchUrls.value.replace(/^\s+|\s+$/g, "");
    if (batchText) {
      var lines = batchText.split(/\r?\n/);
      for (var i = 0; i < lines.length; i += 1) {
        var line = lines[i].replace(/^\s+|\s+$/g, "");
        if (line) {
          inputs.push(line);
        }
      }
    }
    var single = nodes.url.value.replace(/^\s+|\s+$/g, "");
    if (!inputs.length && single) {
      inputs.push(single);
    }
    return inputs;
  }

  function configuredBatchOverride() {
    if (!configuredDownload || configuredDownload.source !== nodes.source.value) {
      return {};
    }
    return {
      quality: configuredDownload.quality,
      mediaType: configuredDownload.mediaType
    };
  }

  function saveQueueState() {
    try {
      window.localStorage.setItem("wavesQueueState", JSON.stringify(queueState));
    } catch (error) {}
  }

  function loadQueueState() {
    try {
      var saved = JSON.parse(window.localStorage.getItem("wavesQueueState") || "[]");
      if (saved && saved.length) {
        queueState = saved.map(function (item) {
          if (item && (item.state === "downloading" || item.state === "running")) {
            item.state = "pending";
            item.stateLabel = "Pending";
          }
          return item;
        });
      }
    } catch (error) {
      queueState = [];
    }
  }

  function renderQueueList() {
    if (!queueState.length) {
      nodes.queuePanel.className = "queue-panel hidden";
      nodes.queueList.innerHTML = "";
      saveQueueState();
      return;
    }

    nodes.queuePanel.className = "queue-panel";
    var html = "";
    for (var i = 0; i < queueState.length; i += 1) {
      var item = queueState[i];
      html += '<div class="queue-item ' + escapeHtml(item.state || "pending") + '">';
      html += '<div class="queue-title">' + escapeHtml(item.title || item.input || (item.payload && item.payload.url) || "") + '</div>';
      html += '<div class="queue-state">' + escapeHtml(item.stateLabel || item.state || "pending") + '</div>';
      if (item.state === "failed" || item.state === "cancelled") {
        html += '<button class="queue-retry" type="button" data-queue-action="retry" data-queue-index="' + i + '">Retry</button>';
        if (item.state === "failed" && item.payload && item.payload.quality !== "audio" && item.payload.tiktokMode !== "mp3") {
          html += '<button class="queue-retry-lower" type="button" data-queue-action="retry-lower" data-queue-index="' + i + '">Retry Lower</button>';
        }
        html += '<button class="queue-copy-error" type="button" data-queue-action="copy-error" data-queue-index="' + i + '">Copy Error</button>';
        if (item.logPath) {
          html += '<button class="queue-open-log" type="button" data-queue-action="open-log" data-queue-index="' + i + '">Open Log</button>';
        }
      }
      html += '<button class="queue-move" type="button" data-queue-action="up" data-queue-index="' + i + '" title="Move up">Up</button>';
      html += '<button class="queue-move" type="button" data-queue-action="down" data-queue-index="' + i + '" title="Move down">Down</button>';
      html += '<button class="queue-remove" type="button" data-queue-index="' + i + '">x</button>';
      html += '</div>';
    }
    nodes.queueList.innerHTML = html;
    saveQueueState();
  }

  function setQueueItemState(index, state, label) {
    if (!queueState[index]) {
      return;
    }
    queueState[index].state = state;
    queueState[index].stateLabel = label || state;
    renderQueueList();
  }

  function nextRunnableQueueIndex(startIndex) {
    for (var i = startIndex || 0; i < queueState.length; i += 1) {
      if (queueState[i] && (queueState[i].state === "pending" || queueState[i].state === "retry")) {
        return i;
      }
    }
    return -1;
  }

  function lowerQualityValue(value) {
    var quality = String(value || "");
    if (quality === "best2160" || quality === "best" || quality === "") {
      return "best1440";
    }
    if (quality === "best1440") {
      return "best1080";
    }
    if (quality === "best1080") {
      return "best720";
    }
    if (quality === "best720") {
      return "best480";
    }
    return "best480";
  }

  function retryQueueItemLower(index) {
    var item = queueState[index];
    if (!item || !item.payload || item.payload.quality === "audio" || item.payload.tiktokMode === "mp3") {
      setStatus("Retry unchanged", "This queue item does not have a video quality to lower.", true);
      return;
    }
    item.payload.quality = lowerQualityValue(item.payload.quality);
    item.payload.selectedVideoFormat = "";
    item.payload.selectedAudioFormat = "";
    item.state = "pending";
    item.stateLabel = "Pending lower quality";
    item.error = "";
    item.logPath = "";
    renderQueueList();
  }

  function clearConfiguredDownload() {
    configuredDownload = null;
  }

  function optionHtml(value, label) {
    return '<option value="' + escapeHtml(value) + '">' + escapeHtml(label) + '</option>';
  }

  function renderConfiguredInfo(result) {
    var preview = result.preview || {};
    nodes.configuredTitle.textContent = preview.title || "Discovered media";
    nodes.configuredMeta.textContent = (preview.uploader ? preview.uploader + " - " : "") + (preview.duration ? preview.duration + "s - " : "") + (preview.resolution || "formats loaded");
    if (preview.thumbnail) {
      nodes.configuredThumb.src = preview.thumbnail;
    } else {
      nodes.configuredThumb.removeAttribute("src");
    }
    nodes.configuredInfo.className = "media-summary";
    var options = result.resolutionOptions || [];
    var html = "";
    for (var i = 0; i < options.length; i += 1) {
      html += optionHtml(options[i].value, options[i].label);
    }
    if (!html) {
      html = optionHtml("best", "Best available");
    }
    nodes.configureResolution.innerHTML = html;
  }

  function currentQuality() {
    if (nodes.source.value === "youtube" || nodes.source.value === "other" || nodes.source.value === "tiktok") {
      if (configuredDownload && configuredDownload.url === nodes.url.value.replace(/^\s+|\s+$/g, "")) {
        return configuredDownload.quality || "best2160";
      }
      return "best2160";
    }
    return "best2160";
  }

  function currentMediaType() {
    if (nodes.source.value === "youtube" || nodes.source.value === "other" || nodes.source.value === "tiktok") {
      if (configuredDownload && configuredDownload.url === nodes.url.value.replace(/^\s+|\s+$/g, "")) {
        return configuredDownload.mediaType || "video";
      }
      return "video";
    }
    return "video";
  }

  function buildDownloadPayload(input, override) {
    override = override || {};
    var mediaType = override.mediaType || currentMediaType();
    var tiktokMode = nodes.source.value === "tiktok" ? (mediaType === "audio" ? "mp3" : "original") : nodes.tiktokMode.value;
    var spotifyMode = nodes.source.value === "spotify" && /^https?:\/\/open\.spotify\.com\//i.test(input || "") ? "full" : nodes.spotifyMode.value;
    return {
      source: nodes.source.value,
      url: input,
      spotifyMode: spotifyMode,
      tiktokMode: tiktokMode,
      quality: override.quality || (mediaType === "audio" ? "audio" : currentQuality()),
      transcodeForAe: nodes.transcodeForAe.checked,
      conversionMode: nodes.conversionMode.value || (currentSettings && currentSettings.conversionMode) || "auto",
      downloadThumbnail: nodes.downloadThumbnail.checked,
      importToProject: true,
      addToTimeline: nodes.addToTimeline.checked,
      autoFitToComp: nodes.source.value === "spotify" ? false : nodes.autoFitToComp.checked,
      createCompIfNeeded: nodes.createCompIfNeeded.checked,
      organizeProject: !currentSettings || currentSettings.organizeProject !== false,
      renameLayerClean: true,
      precomposeLayer: nodes.precomposeLayer.checked
    };
  }

  function downloadStartText() {
    if (nodes.source.value === "spotify") {
      return nodes.spotifyMode.value === "full" ? "AE is running spotify-dlp. Tracks will be imported as audio footage when the job finishes." : "AE is resolving the Spotify/search title, then downloading matching audio from YouTube.";
    }
    if (nodes.source.value === "tiktok") {
      return currentMediaType() === "audio" ? "AE is downloading TikTok audio as MP3." : "AE is downloading the TikTok video.";
    }
    if (nodes.source.value === "other") {
      return "AE is running yt-dlp for this site and may run FFmpeg after download.";
    }
    return "AE is running yt-dlp and may run FFmpeg after download. The panel may pause until the job finishes.";
  }

  function friendlyErrorHelp(errorText) {
    var tips = [];
    var corruptMedia = /moov atom not found|Invalid data found when processing input|Error opening input file/i.test(errorText);
    if (corruptMedia) {
      tips.push("The downloaded media file is incomplete or damaged. Use Redownload in Download History to fetch a fresh copy without using the cache.");
    }
    if (/Delete refused: history deletion only supports files/i.test(errorText)) {
      tips.push("Refresh Download History. Waves will only delete media files, never folders.");
    } else if (/Delete refused: file is outside/i.test(errorText)) {
      tips.push("Only files inside the download folder configured in Settings can be deleted.");
    } else if (/Delete refused: unsupported file type/i.test(errorText)) {
      tips.push("Remove this file manually. Waves only deletes supported media, subtitle, thumbnail, and metadata files.");
    } else if (/Delete refused:.*history|does not match the saved history entry/i.test(errorText)) {
      tips.push("Refresh Download History and try the action again.");
    } else if (/Delete failed: Waves could not remove/i.test(errorText)) {
      tips.push("Close any app using the file, then try deleting it again.");
    } else if (/Failed to decrypt with DPAPI/i.test(errorText)) {
      tips.push("Selected YouTube cookies browser: " + selectedCookiesBrowserLabel() + ".");
      tips.push("Run After Effects normally, not as administrator, and use the same Windows user as your browser.");
      tips.push("If it still fails, choose a different logged-in browser in Settings > YouTube cookies.");
      showCookieAlert("Windows could not decrypt the selected browser's YouTube cookies. Run After Effects normally, not as administrator, and use the same Windows user as your browser. You can also choose another logged-in browser in Settings.");
    } else if (/Could not copy .*cookie database/i.test(errorText)) {
      tips.push("Selected YouTube cookies browser: " + selectedCookiesBrowserLabel() + ".");
      tips.push("Fully close that browser, wait a few seconds, then try again.");
      tips.push("For Brave, Opera, Edge, and other Chromium browsers, yt-dlp may still call the cookie database Chrome.");
      showCookieAlert("The selected browser's cookie database is locked. Fully close " + selectedCookiesBrowserLabel() + ", wait a few seconds, then try again. You can also choose another logged-in browser in Settings.");
    } else if (/Sign in to confirm|not a bot|cookies-from-browser/i.test(errorText)) {
      tips.push("Open Settings and choose the browser where you are logged into YouTube.");
      tips.push("Save settings, then try the download again.");
      showCookieAlert("This video needs YouTube cookies. Open Settings and choose the browser where you are logged into YouTube, then save and try again.");
    }
    if (/TikTok.*impersonat|impersonation target/i.test(errorText)) {
      tips.push("Update yt-dlp from Settings, then retry with a specific TikTok video URL.");
    }
    if (/WinError 32|being used by another process/i.test(errorText)) {
      tips.push("Close any player, Explorer preview, or app using the downloaded file, then retry.");
    }
    if (/Waves command runner is missing/i.test(errorText)) {
      tips.push("Reinstall the current panel build and confirm the installer reports the expected source folder and version.");
    }
    if (/Unknown encoder.*prores_ks|Encoder.*prores.*not found/i.test(errorText)) {
      tips.push("This FFmpeg build cannot create ProRes. Choose an H.264 conversion preset in Settings.");
    } else if (/No such filter.*(?:zscale|tonemap)|Filter not found.*(?:zscale|tonemap)/i.test(errorText)) {
      tips.push("This FFmpeg build cannot run HDR-to-SDR. Choose an H.264 preset or update FFmpeg from Settings.");
    } else if (/matches no streams|does not contain any stream|no audio stream/i.test(errorText)) {
      tips.push("This file does not contain the stream required by the selected conversion preset.");
    }
    if (!corruptMedia && /ffmpeg|FFmpeg/i.test(errorText)) {
      tips.push("Install FFmpeg from Settings or set the FFmpeg override path.");
    }
    if (/After Effects could not import|AE import error/i.test(errorText)) {
      tips.push("Try an H.264 or ProRes conversion preset, then import again.");
    }
    if (/Unsupported URL|not a valid URL/i.test(errorText)) {
      tips.push("Check that the selected Source matches the link and that the URL points to a real media page.");
    }
    if (/No video formats|Requested format is not available/i.test(errorText)) {
      tips.push("Try a lower quality option or update yt-dlp from Settings.");
    }
    if (/HTTP Error 403|Forbidden|private|login/i.test(errorText)) {
      tips.push("The site may require login or YouTube may be blocking the matched result. Choose browser cookies in Settings and update yt-dlp.");
    }
    if (/spotify-dlp.*already exists|already exists; skipping/i.test(errorText)) {
      tips.push("The audio already exists in your download folder. Open Download History and import it, or delete the old file and retry.");
    }
    if (!tips.length) {
      tips.push("Check the URL, update yt-dlp from Settings, then try again.");
    }
    return "\n\nWhat to try:\n- " + tips.join("\n- ");
  }

  function formatDownloadResult(result) {
    var detail = result.files && result.files.length > 1 ? "Saved files:" : "Saved:";
    if (result.displayTitle) {
      detail = "Title: " + result.displayTitle + "\n" + detail;
    }
    if (result.files && result.files.length) {
      for (var i = 0; i < result.files.length; i += 1) {
        detail += "\n" + result.files[i];
      }
    } else {
      detail += " " + result.file;
    }
    if (result.sourceFile && result.sourceFile !== result.file) {
      detail += "\nSource: " + result.sourceFile;
    }
    if (result.transcoded) {
      detail += "\nConverted for AE with FFmpeg.";
    }
    if (result.compatibilityReason) {
      detail += "\nCompatibility: " + result.compatibilityReason;
    }
    if (result.actualConversionPreset && result.actualConversionPreset !== "original") {
      detail += "\nConversion preset: " + getConversionPresetById(result.actualConversionPreset).label;
    }
    if (result.actualHardwareAcceleration && result.actualHardwareAcceleration !== "none") {
      detail += "\nVideo encoding: " + result.actualHardwareAcceleration.toUpperCase() + (result.hardwareFallbackUsed ? " (GPU unavailable, used CPU fallback)" : "");
    }
    if (result.deletedOriginals && result.deletedOriginals.length) {
      detail += "\nDeleted incompatible original after conversion.";
    }
    if (result.usedCache) {
      detail += "\nReused an already downloaded file from your download folder.";
    }
    if (result.imported) {
      detail += "\nImported into the current AE project.";
    }
    if (result.organized) {
      detail += "\nOrganized in the Waves Media Downloader project folder.";
    }
    if (result.addedToTimeline) {
      detail += "\nAdded to the active composition timeline.";
    }
    if (result.createdComp) {
      detail += "\nCreated a new composition because none was active.";
    }
    if (result.fitToComp) {
      detail += "\nAuto-fit layer scale to the composition.";
    }
    if (result.postActions) {
      detail += "\nPost-import actions: " + result.postActions + ".";
    }
    if (result.mediaStats) {
      detail += "\n\nMedia stats:\n" + result.mediaStats;
    }
    if (result.metadataFile) {
      detail += "\n\nMetadata sidecar:\n" + result.metadataFile;
    }
    if (result.log) {
      detail += "\n\n" + result.log;
    }
    if (result.logPath) {
      detail += "\n\nSession log:\n" + result.logPath;
    }
    return detail;
  }

  function runDownload(job, index, total, callback) {
    var payload = job.payload || buildDownloadPayload(job.input || job);
    var input = payload.url;
    var jobId = createJobId();
    payload.jobId = jobId;
    var prefix = total > 1 ? "Batch " + (index + 1) + "/" + total + "\n" : "";
    var displayInput = payload.displayTitle || input;
    activeJobId = jobId;
    startJobProgressPolling(jobId, "Downloading");
    setStatus("Downloading", prefix + downloadStartText() + "\n\n" + displayInput);
    showWorkingDialog(payload.forceRedownload ? "Redownloading File" : "Downloading File", payload.transcodeForAe
      ? "The file is being downloaded and will be checked or converted for After Effects."
      : "The file is being downloaded and will be imported without conversion.", total > 1);
    window.setTimeout(function () {
      evalHost("ytImporterDownload", payload, function (result) {
        hideWorkingDialog();
        stopJobProgressPolling(true);
        if (!result.ok) {
          var errorText = result.error || result.log || "Unknown error.";
          if (result.logPath) {
            errorText += "\n\nSession log:\n" + result.logPath;
          }
          callback(false, input, errorText, result);
          return;
        }
        callback(true, input, formatDownloadResult(result), result);
      });
    }, 80);
  }

  function downloadAndImport() {
    var inputs = batchInputs();
    if (!inputs.length) {
      setStatus("Missing input", missingInputText(), true);
      return;
    }
    var inputError = validateInputList(inputs);
    if (inputError) {
      setStatus("Wrong source", inputError, true);
      return;
    }
    if (needsConfigureForInput(inputs[0])) {
      discoverFormats("download");
      return;
    }

    setBusy(true);
    var index = 0;
    var successes = 0;
    var failures = [];
    var summaries = [];

    function next() {
      if (index >= inputs.length) {
        setBusy(false);
        loadHistory();
        if (failures.length) {
          var failedText = failures.length + " of " + inputs.length + " download(s) failed.";
          for (var f = 0; f < failures.length; f += 1) {
            failedText += "\n\n" + failures[f].input + "\n" + failures[f].error;
          }
          if (successes) {
            failedText = successes + " download(s) completed.\n\n" + failedText;
          }
          setStatus("Download failed", failedText, true);
          return;
        }
        setStatus(inputs.length > 1 ? "Batch complete" : "Done", summaries.join("\n\n"));
        return;
      }

      var input = inputs[index];
      var job = { input: input, payload: buildDownloadPayload(input, configuredBatchOverride()) };
      runDownload(job, index, inputs.length, function (ok, finishedInput, detail) {
        if (ok) {
          successes += 1;
          summaries.push((inputs.length > 1 ? "Completed: " + finishedInput + "\n" : "") + detail);
        } else {
          failures.push({ input: finishedInput, error: detail });
        }
        index += 1;
        next();
      });
    }

    next();
  }

  function startQueuedDownloads() {
    if (!queueState.length) {
      setStatus("Queue empty", "Add at least one configured download to the queue first.", true);
      return;
    }

    setBusy(true);
    var index = 0;
    var successes = 0;
    var failures = [];
    var summaries = [];

    function next() {
      index = nextRunnableQueueIndex(index);
      if (index < 0) {
        setBusy(false);
        loadHistory();
        if (failures.length) {
          var failedText = failures.length + " of " + queueState.length + " queued download(s) failed.";
          for (var f = 0; f < failures.length; f += 1) {
            failedText += "\n\n" + failures[f].input + "\n" + failures[f].error;
          }
          if (successes) {
            failedText = successes + " queued download(s) completed.\n\n" + failedText;
          }
          setStatus("Queue finished with errors", failedText, true);
          return;
        }
        setStatus("Queue complete", summaries.join("\n\n"));
        return;
      }

      setQueueItemState(index, "downloading", "Working");
      runDownload(queueState[index], index, queueState.length, function (ok, finishedInput, detail, result) {
        if (ok) {
          successes += 1;
          summaries.push("Completed: " + finishedInput + "\n" + detail);
          setQueueItemState(index, "done", "Done");
        } else {
          queueState[index].error = sanitizeSensitiveText(detail);
          queueState[index].logPath = result && result.logPath ? result.logPath : "";
          failures.push({ input: finishedInput, error: detail });
          setQueueItemState(index, "failed", "Failed");
        }
        index += 1;
        next();
      });
    }

    next();
  }

  function updateDependencies() {
    setBusy(true);
    setStatus("Updating dependencies", "Updating yt-dlp, spotify-dlp, and the local FFmpeg copy. This can take a few minutes.");
    evalHost("ytImporterUpdateDependencies", {}, function (result) {
      setBusy(false);
      if (!result.ok) {
        var detail = result.error || result.log || "Could not update dependencies.";
        setStatus("Dependency update failed", detail, true);
        return;
      }
      if (result.settings) {
        currentSettings = result.settings;
        nodes.ytdlpPath.value = result.settings.ytdlpPath || nodes.ytdlpPath.value;
        nodes.spotifyDlpPath.value = result.settings.spotifyDlpPath || nodes.spotifyDlpPath.value;
        nodes.ffmpegPath.value = result.settings.ffmpegPath || nodes.ffmpegPath.value;
      }
      setStatus("Dependencies updated", result.log || "Updated dependencies.");
    });
  }

  function authenticateSpotify() {
    setBusy(true);
    setStatus("Authenticating Spotify", "A command window will open for spotify-dlp auth. Follow its instructions, then come back to AE.");
    evalHost("ytImporterSpotifyAuth", {}, function (result) {
      setBusy(false);
      if (!result.ok) {
        setStatus("Spotify auth failed", result.error || result.log || "Unknown error.", true);
        return;
      }
      setStatus("Spotify auth started", result.log || "Finish the authentication in the opened command window.");
      pollSpotifyAuthStatus();
    });
  }

  function checkTikTokInfo() {
    var url = nodes.url.value.replace(/^\s+|\s+$/g, "");
    nodes.inspectDialog.hidden = false;
    nodes.inspectHint.textContent = "TikTok stats and available known media details.";
    nodes.inspectActions.className = "button-grid hidden";
    if (!url) {
      setInspectResult("Missing TikTok URL", "Paste a TikTok video/share URL first.", true);
      return;
    }

    setBusy(true);
    setInspectResult("Checking TikTok", "Fetching TikTok metadata...");
    evalHost("ytImporterTikTokInfo", { url: url }, function (result) {
      setBusy(false);
      if (!result.ok) {
        setInspectResult("TikTok info failed", result.error || result.log || "Unknown error.", true);
        return;
      }
      setInspectResult("TikTok info", result.info || result.log || "No metadata returned.");
    });
  }

  function inspectableUrl() {
    return nodes.url.value.replace(/^\s+|\s+$/g, "");
  }

  function metadataCacheKey(source, url) {
    return String(source || "") + "|" + String(url || "").replace(/^\s+|\s+$/g, "");
  }

  function cachedMetadata(source, url) {
    return metadataCache[metadataCacheKey(source, url)] || null;
  }

  function mergeMetadataCache(source, url, data) {
    var key = metadataCacheKey(source, url);
    metadataCache[key] = metadataCache[key] || {};
    for (var prop in data) {
      if (data.hasOwnProperty(prop)) {
        metadataCache[key][prop] = data[prop];
      }
    }
    return metadataCache[key];
  }

  function checkPreviewInfo() {
    var url = inspectableUrl();
    if (!url) {
      setInspectResult("Missing URL", "Paste a URL first.", true);
      return;
    }
    if (nodes.source.value === "spotify") {
      setInspectResult("Preview unavailable", "Spotify preview is handled by spotify-dlp during download. Use Full Spotify metadata mode after authentication for better track matching.", true);
      return;
    }
    var cached = cachedMetadata(nodes.source.value, url);
    if (cached && cached.preview) {
      setInspectResult("Preview info", cached.preview);
      return;
    }
    setBusy(true);
    setInspectResult("Checking preview", "Fetching title, thumbnail, and basic media details...");
    evalHost(nodes.source.value === "youtube" || nodes.source.value === "other" ? "ytImporterDiscoverFormats" : "ytImporterPreviewInfo", { source: nodes.source.value, url: url }, function (result) {
      setBusy(false);
      if (!result.ok) {
        setInspectResult("Preview failed", result.error || result.log || "Unknown error.", true);
        return;
      }
      var merged = mergeMetadataCache(nodes.source.value, url, {
        discover: result.resolutionOptions ? result : undefined,
        preview: result.preview || {},
        formatInfo: result.info || ""
      });
      setInspectResult("Preview info", merged.preview || {});
    });
  }

  function checkFormatInfo() {
    var url = inspectableUrl();
    if (!url) {
      setInspectResult("Missing URL", "Paste a URL first.", true);
      return;
    }
    if (nodes.source.value === "spotify") {
      setInspectResult("Format check unavailable", "Format check is for yt-dlp video/media URLs. Spotify downloads are handled by spotify-dlp or easy audio search.", true);
      return;
    }
    var cached = cachedMetadata(nodes.source.value, url);
    if (cached && cached.formatInfo) {
      setInspectResult("Format info", cached.formatInfo);
      return;
    }
    setBusy(true);
    setInspectResult("Checking formats", "Asking yt-dlp for available formats...");
    evalHost(nodes.source.value === "youtube" || nodes.source.value === "other" ? "ytImporterDiscoverFormats" : "ytImporterFormatInfo", { source: nodes.source.value, url: url }, function (result) {
      setBusy(false);
      if (!result.ok) {
        setInspectResult("Format check failed", result.error || result.log || "Unknown error.", true);
        return;
      }
      var merged = mergeMetadataCache(nodes.source.value, url, {
        discover: result.resolutionOptions ? result : undefined,
        preview: result.preview || {},
        formatInfo: result.info || "No format information returned."
      });
      setInspectResult("Format info", merged.formatInfo || "No format information returned.");
    });
  }

  function discoverFormats(action) {
    var url = inspectableUrl();
    if (!url) {
      setStatus("Missing URL", "Paste a URL first, then discover available formats.", true);
      return;
    }
    var inputError = validateSourceInput(url);
    if (inputError) {
      setStatus("Wrong source", inputError, true);
      return;
    }
    if (nodes.source.value !== "youtube" && nodes.source.value !== "other" && nodes.source.value !== "tiktok") {
      setStatus("Format discovery unavailable", "Exact format discovery is available for video/media URLs.", true);
      return;
    }
    pendingConfigureAction = action || "";
    var cached = cachedMetadata(nodes.source.value, url);
    if (cached && cached.discover) {
      nodes.configureDialog.hidden = false;
      nodes.saveConfigure.disabled = false;
      renderConfiguredInfo(cached.discover);
      nodes.configureFileType.value = configuredDownload && configuredDownload.url === url ? configuredDownload.mediaType : "video";
      if (configuredDownload && configuredDownload.url === url) {
        nodes.configureResolution.value = configuredDownload.quality || "best2160";
      }
      updateConfigureUi();
      nodes.configureStatus.textContent = "Using cached media info. Choose the file type and quality.";
      nodes.saveConfigure.textContent = pendingConfigureAction === "queue" ? "Add to Queue" : pendingConfigureAction === "download" ? "Download and Import" : "Use Settings";
      setStatus("Formats loaded", "Using cached media info.");
      return;
    }
    setBusy(true);
    nodes.configureDialog.hidden = true;
    nodes.configureStatus.textContent = "Finding video...";
    nodes.saveConfigure.disabled = true;
    nodes.saveConfigure.textContent = "Continue";
    nodes.configuredInfo.className = "media-summary hidden";
    setStatus("Finding video", "Fetching title, thumbnail, and available resolutions...");
    showWorkingDialog("Finding Video", "Waves is fetching the title, thumbnail, and available formats before downloading.");
    window.setTimeout(function () {
      evalHost("ytImporterDiscoverFormats", { source: nodes.source.value, url: url }, function (result) {
        hideWorkingDialog();
        setBusy(false);
        if (!result.ok) {
          nodes.configureDialog.hidden = true;
          setStatus("Format discovery failed", result.error || result.log || "Unknown error.", true);
          return;
        }
        nodes.configureDialog.hidden = false;
        nodes.saveConfigure.disabled = false;
        var merged = mergeMetadataCache(nodes.source.value, url, {
          discover: result,
          preview: result.preview || {},
          formatInfo: result.info || ""
        });
        renderConfiguredInfo(merged.discover);
        nodes.configureFileType.value = configuredDownload && configuredDownload.url === url ? configuredDownload.mediaType : "video";
        if (configuredDownload && configuredDownload.url === url) {
          nodes.configureResolution.value = configuredDownload.quality || "best2160";
        }
        updateConfigureUi();
        nodes.configureStatus.textContent = "Choose the file type and quality.";
        nodes.saveConfigure.textContent = pendingConfigureAction === "queue" ? "Add to Queue" : pendingConfigureAction === "download" ? "Download and Import" : "Use Settings";
        setStatus("Formats loaded", "Choose the file type and quality in the popup.");
      });
    }, 80);
  }

  function saveConfiguredDownload() {
    var url = inspectableUrl();
    configuredDownload = {
      url: url,
      source: nodes.source.value,
      mediaType: nodes.configureFileType.value,
      quality: nodes.configureFileType.value === "audio" ? "audio" : nodes.configureResolution.value
    };
    nodes.configureDialog.hidden = true;
    setStatus("Download configured", nodes.configureFileType.value === "audio" ? "Audio only WAV selected." : "Video quality selected: " + nodes.configureResolution.options[nodes.configureResolution.selectedIndex].text + ".");
    var action = pendingConfigureAction;
    pendingConfigureAction = "";
    if (action === "queue") {
      addCurrentToQueue();
    } else if (action === "download") {
      downloadAndImport();
    }
  }

  function updateConfigureUi() {
    nodes.configureResolutionField.className = nodes.configureFileType.value === "audio" ? "field hidden" : "field";
  }

  function queueTitleForPayload(payload) {
    var source = payload.source === "youtube" ? "YouTube" : payload.source === "other" ? "Other Site" : payload.source === "spotify" ? "Spotify" : "TikTok";
    if (payload.source === "spotify") {
      return source + " - Audio - " + payload.url;
    }
    var quality = payload.quality === "audio" ? "Audio" : payload.quality === "best1080" ? "1080p" : payload.quality === "best720" ? "720p" : payload.quality === "best" ? "Best" : payload.quality === "best2160" ? "4K" : payload.quality || "Media";
    return source + " - " + quality + " - " + payload.url;
  }

  function needsConfigureForInput(input) {
    var isDiscoverable = nodes.source.value === "youtube" || nodes.source.value === "other" || nodes.source.value === "tiktok";
    return isDiscoverable && (!configuredDownload || configuredDownload.url !== input || configuredDownload.source !== nodes.source.value);
  }

  function addCurrentToQueue() {
    var inputs = batchInputs();
    if (!inputs.length) {
      setStatus("Missing input", missingInputText(), true);
      return;
    }
    var inputError = validateInputList(inputs);
    if (inputError) {
      setStatus("Wrong source", inputError, true);
      return;
    }
    if (needsConfigureForInput(inputs[0])) {
      discoverFormats("queue");
      return;
    }
    var batchOverride = configuredBatchOverride();
    for (var i = 0; i < inputs.length; i += 1) {
      var payload = buildDownloadPayload(inputs[i], batchOverride);
      queueState.push({
        payload: payload,
        title: queueTitleForPayload(payload),
        state: "pending",
        stateLabel: "Pending"
      });
    }
    renderQueueList();
    setStatus("Added to queue", inputs.length + " item(s) added.");
  }

  function pollSpotifyAuthStatus() {
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      evalHost("ytImporterSpotifyAuthStatus", {}, function (result) {
        if (result.ok && result.completed) {
          window.clearInterval(timer);
          if (currentSettings) {
            currentSettings.spotifyAuthCompleted = true;
          }
          loadSettings();
          updateSpotifyAuthState(true);
          setStatus("Spotify auth completed", "You can now use Full Spotify metadata mode.");
        } else if (attempts >= 240) {
          window.clearInterval(timer);
        }
      });
    }, 2000);
  }

  function checkYtdlpUpdate() {
    evalHost("ytImporterCheckYtdlpUpdate", {}, function (result) {
      if (!result.ok) {
        return;
      }
      if (!result.available) {
        return;
      }
      if (result.installNeeded) {
        nodes.updateMessage.textContent = "yt-dlp was not found. Install it now so YouTube, TikTok, and easy Spotify downloads can work?";
      } else if (result.latestVersion === "repair or update yt-dlp") {
        nodes.updateMessage.textContent = "yt-dlp was found, but its version could not be checked. Repair/update it now?";
      } else {
        nodes.updateMessage.textContent = "Installed yt-dlp: " + (result.currentVersion || "unknown") + ". Latest: " + (result.latestVersion || "unknown") + ". Update now?";
      }
      nodes.updateDialog.hidden = false;
    });
  }

  function installYtdlpUpdate() {
    nodes.updateDialog.hidden = true;
    setBusy(true);
    setStatus("Updating yt-dlp", "Installing the latest yt-dlp version...");
    evalHost("ytImporterInstallYtdlpUpdate", {}, function (result) {
      setBusy(false);
      if (!result.ok) {
        setStatus("yt-dlp update failed", result.error || result.log || "The update failed.", true);
        return;
      }
      setStatus("yt-dlp updated", (result.ytdlpPath ? "Saved yt-dlp path:\n" + result.ytdlpPath + "\n\n" : "") + (result.log || "yt-dlp was updated."));
    });
  }

  function declineYtdlpUpdate() {
    nodes.updateDialog.hidden = true;
    setStatus("yt-dlp update skipped", "Warning: downloads may fail if websites changed and yt-dlp is outdated. You can restart the panel later to check again.", true);
  }

  function updateSourceUi() {
    var isSpotify = nodes.source.value === "spotify";
    var isTikTok = nodes.source.value === "tiktok";
    var isOther = nodes.source.value === "other";
    var isFullSpotify = isSpotify && nodes.spotifyMode.value === "full";
    nodes.spotifyModeField.className = isSpotify ? "field" : "field hidden";
    nodes.formatOptionsGroup.className = isSpotify ? "option-group" : "option-group hidden";
    nodes.tiktokModeField.className = "field hidden";
    nodes.batchField.className = "field hidden";
    nodes.transcodeField.className = isSpotify ? "field inline hidden" : "field inline";
    if (nodes.transcodeHelpText) {
      nodes.transcodeHelpText.className = isSpotify ? "settings-note hidden" : "settings-note";
    }
    if (isSpotify && nodes.transcodeForAe) {
      nodes.transcodeForAe.checked = false;
    }
    nodes.autoFitField.className = isSpotify ? "field inline hidden" : "field inline";
    nodes.spotifyAuthButton.className = isFullSpotify ? "secondary" : "secondary hidden";
    nodes.inspectButton.className = isTikTok ? "secondary" : "secondary hidden";
    nodes.previewInfoButton.className = isSpotify || isTikTok ? "secondary hidden" : "secondary";
    nodes.formatInfoButton.className = isSpotify || isTikTok ? "secondary hidden" : "secondary";
    nodes.tiktokInfoButton.className = isTikTok ? "secondary" : "secondary hidden";
    nodes.tiktokInfoButton.textContent = "Check Video Stats";
    nodes.actionButtons.className = isFullSpotify || isTikTok ? "button-grid" : "button-grid hidden";
    nodes.urlLabel.textContent = isSpotify ? "Song Title / Artist or Spotify URL" : isTikTok ? "TikTok URL" : isOther ? "Media URL" : "YouTube URL";
    nodes.batchLabel.textContent = isSpotify ? "Batch queue (one song/search or Spotify URL per line)" : isTikTok ? "Batch queue (one TikTok URL per line)" : isOther ? "Batch queue (one media URL per line)" : "Batch queue (one YouTube URL per line)";
    nodes.url.placeholder = isSpotify ? "e.g. Aphex Twin Avril 14th" : isTikTok ? "https://vm.tiktok.com/... or https://www.tiktok.com/@user/video/..." : isOther ? "https://example.com/video/..." : "https://www.youtube.com/watch?v=...";
    var info = sourceInfo[nodes.source.value] || sourceInfo.youtube;
    nodes.sourceTitle.textContent = info.title;
    nodes.sourceHint.textContent = info.hint;
  }

  function openInspectDialog() {
    nodes.inspectDialog.hidden = false;
    if (nodes.source.value === "tiktok") {
      nodes.inspectHint.textContent = "TikTok stats and available known media details.";
      nodes.inspectActions.className = "button-grid";
      nodes.previewInfoButton.className = "secondary hidden";
      nodes.formatInfoButton.className = "secondary hidden";
      nodes.tiktokInfoButton.className = "secondary";
      nodes.tiktokInfoButton.textContent = "Check Video Stats";
    } else {
      nodes.inspectHint.textContent = "Preview metadata or check available formats before downloading.";
      nodes.inspectActions.className = "button-grid";
    }
    nodes.inspectResultTitle.textContent = "Ready";
    nodes.inspectResultTitle.style.color = "var(--text)";
    nodes.inspectResultDetail.textContent = "Paste a URL, then choose an inspector.";
  }

  nodes.downloadButton.addEventListener("click", downloadAndImport);
  nodes.addToQueueButton.addEventListener("click", addCurrentToQueue);
  nodes.startQueueButton.addEventListener("click", startQueuedDownloads);
  nodes.sourcePicker.addEventListener("click", function (event) {
    var target = event.target;
    while (target && target !== nodes.sourcePicker && (!target.getAttribute || !target.getAttribute("data-source"))) {
      target = target.parentNode;
    }
    if (!target || target === nodes.sourcePicker) {
      return;
    }
    showDownloadForm(target.getAttribute("data-source"));
  });
  nodes.backToSources.addEventListener("click", showSourcePicker);
  nodes.downloaderTab.addEventListener("click", function () {
    setActiveTab("downloader");
  });
  nodes.historyTab.addEventListener("click", function () {
    setActiveTab("history");
  });
  nodes.spotifyAuthButton.addEventListener("click", authenticateSpotify);
  nodes.inspectButton.addEventListener("click", checkTikTokInfo);
  nodes.previewInfoButton.addEventListener("click", checkPreviewInfo);
  nodes.formatInfoButton.addEventListener("click", checkFormatInfo);
  nodes.tiktokInfoButton.addEventListener("click", checkTikTokInfo);
  nodes.source.addEventListener("change", function () {
    clearConfiguredDownload();
    updateSourceUi();
  });
  nodes.spotifyMode.addEventListener("change", function () {
    updateSourceUi();
    saveUiPreferencesSoon();
  });
  nodes.tiktokMode.addEventListener("change", function () {
    updateSourceUi();
  });
  nodes.url.addEventListener("input", function () {
    clearConfiguredDownload();
  });
  nodes.configureFileType.addEventListener("change", function () {
    updateConfigureUi();
  });
  nodes.addToTimeline.addEventListener("change", saveUiPreferencesSoon);
  nodes.autoFitToComp.addEventListener("change", saveUiPreferencesSoon);
  nodes.createCompIfNeeded.addEventListener("change", saveUiPreferencesSoon);
  nodes.precomposeLayer.addEventListener("change", saveUiPreferencesSoon);
  nodes.cancelConfigure.addEventListener("click", function () {
    pendingConfigureAction = "";
    nodes.configureDialog.hidden = true;
  });
  nodes.saveConfigure.addEventListener("click", saveConfiguredDownload);
  nodes.clearQueueButton.addEventListener("click", function () {
    queueState = [];
    renderQueueList();
  });
  nodes.removeCompletedQueueButton.addEventListener("click", function () {
    queueState = queueState.filter(function (item) {
      return item.state !== "done";
    });
    renderQueueList();
  });
  nodes.clearFailedQueueButton.addEventListener("click", function () {
    queueState = queueState.filter(function (item) {
      return item.state !== "failed" && item.state !== "cancelled";
    });
    renderQueueList();
  });
  nodes.queueList.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.getAttribute || target.getAttribute("data-queue-index") === null) {
      return;
    }
    var index = Number(target.getAttribute("data-queue-index"));
    var action = target.getAttribute("data-queue-action") || "remove";
    if (isNaN(index) || !queueState[index]) {
      return;
    }
    if (action === "retry") {
      queueState[index].state = "pending";
      queueState[index].stateLabel = "Pending";
      queueState[index].error = "";
      queueState[index].logPath = "";
      renderQueueList();
    } else if (action === "retry-lower") {
      retryQueueItemLower(index);
    } else if (action === "copy-error") {
      copyText(sanitizeSensitiveText(queueState[index].error || "No error saved."), "Queue error copied", "Copied the redacted failed queue item error.");
    } else if (action === "open-log") {
      openHistoryFile(queueState[index].logPath || "");
    } else if (action === "up") {
      if (index > 0 && queueState[index].state !== "downloading" && queueState[index - 1].state !== "downloading") {
        var movedUp = queueState[index];
        queueState[index] = queueState[index - 1];
        queueState[index - 1] = movedUp;
        renderQueueList();
      }
    } else if (action === "down") {
      if (index < queueState.length - 1 && queueState[index].state !== "downloading" && queueState[index + 1].state !== "downloading") {
        var movedDown = queueState[index];
        queueState[index] = queueState[index + 1];
        queueState[index + 1] = movedDown;
        renderQueueList();
      }
    } else {
      queueState.splice(index, 1);
      renderQueueList();
    }
  });
  nodes.settingsButton.addEventListener("click", function () {
    nodes.showSpotifyClientSecret.checked = false;
    nodes.spotifyClientSecret.type = "password";
    loadSettings();
    updateAboutDiagnostics();
    nodes.settingsDialog.hidden = false;
  });
  nodes.saveSettings.addEventListener("click", saveSettings);
  nodes.cancelSettings.addEventListener("click", function () {
    nodes.showSpotifyClientSecret.checked = false;
    nodes.spotifyClientSecret.type = "password";
    nodes.settingsDialog.hidden = true;
  });
  nodes.showSpotifyClientSecret.addEventListener("change", function () {
    nodes.spotifyClientSecret.type = nodes.showSpotifyClientSecret.checked ? "text" : "password";
  });
  nodes.browseDownloadDir.addEventListener("click", function () {
    browseDownloadFolder(nodes.downloadDir);
  });
  nodes.openDownloadDir.addEventListener("click", openDownloadFolder);
  nodes.conversionMode.addEventListener("change", updateConversionPresetDescription);
  nodes.createPresetBtn.addEventListener("click", function () {
    var preset = clonePreset(BUILTIN_CONVERSION_PRESETS.h264_high);
    preset.label = "Custom H.264";
    preset.skipIfAeFriendly = false;
    openPresetEditor("create", preset);
  });
  nodes.duplicatePresetBtn.addEventListener("click", duplicateSelectedPreset);
  nodes.editPresetBtn.addEventListener("click", function () {
    var preset = getSelectedConversionPreset();
    if (preset.type !== "custom_ffmpeg") {
      setStatus("Preset not editable", "Built-in presets cannot be edited. Duplicate one first.", true);
      return;
    }
    openPresetEditor("edit", clonePreset(preset));
  });
  nodes.deletePresetBtn.addEventListener("click", deleteSelectedPreset);
  nodes.closePresetEditorBtn.addEventListener("click", closePresetEditor);
  nodes.cancelPresetEditorBtn.addEventListener("click", closePresetEditor);
  nodes.presetOutputType.addEventListener("change", updatePresetEditorVisibility);
  nodes.presetContainer.addEventListener("change", updatePresetEditorVisibility);
  nodes.presetAudioCodec.addEventListener("change", updatePresetEditorVisibility);
  nodes.presetVideoCodec.addEventListener("change", updatePresetEditorVisibility);
  nodes.presetEditorForm.addEventListener("submit", function (event) {
    event.preventDefault();
    saveCustomPresetFromEditor();
  });
  nodes.filenameTemplate.addEventListener("input", updateFilenameTemplateNote);
  nodes.copySafeDiagnostics.addEventListener("click", function () {
    copyDiagnostics("safe");
  });
  nodes.copyFullDiagnostics.addEventListener("click", function () {
    copyDiagnostics("full");
  });
  nodes.browseSetupDownloadDir.addEventListener("click", function () {
    browseDownloadFolder(nodes.setupDownloadDir);
  });
  nodes.useDefaultDownloadDir.addEventListener("click", function () {
    saveSetup(true);
  });
  nodes.saveSetup.addEventListener("click", function () {
    saveSetup(false);
  });
  nodes.closeErrorDialog.addEventListener("click", function () {
    nodes.errorDialog.hidden = true;
  });
  nodes.closeInspectDialog.addEventListener("click", function () {
    nodes.inspectDialog.hidden = true;
  });
  nodes.closeMetadataDialog.addEventListener("click", function () {
    nodes.metadataDialog.hidden = true;
  });
  nodes.cookieAlertClose.addEventListener("click", function () {
    nodes.cookieAlert.hidden = true;
  });
  nodes.cookieAlertSettings.addEventListener("click", function () {
    nodes.cookieAlert.hidden = true;
    loadSettings();
    nodes.settingsDialog.hidden = false;
  });
  nodes.installUpdate.addEventListener("click", installYtdlpUpdate);
  nodes.declineUpdate.addEventListener("click", declineYtdlpUpdate);
  nodes.updateDependencies.addEventListener("click", updateDependencies);
  nodes.refreshHistory.addEventListener("click", loadHistory);
  nodes.deleteAllHistory.addEventListener("click", deleteAllHistoryFiles);
  nodes.historyList.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.getAttribute || !target.getAttribute("data-action")) {
      return;
    }
    var item = target;
    while (item && (!item.className || String(item.className).indexOf("history-item") < 0)) {
      item = item.parentNode;
    }
    if (!item) {
      return;
    }
    var action = target.getAttribute("data-action");
    var file = item.getAttribute("data-file");
    var source = item.getAttribute("data-source");
    var url = item.getAttribute("data-url");
    var key = item.getAttribute("data-key");
    if (action === "import") {
      importExistingFile(file, source, url);
    } else if (action === "redownload") {
      redownloadHistoryItem(item);
    } else if (action === "folder") {
      openHistoryFile(file);
    } else if (action === "metadata") {
      showHistoryMetadata(key);
    } else if (action === "delete") {
      deleteHistoryFile(key, file);
    } else if (action === "copy-url") {
      copyText(url, "Source URL copied", "Copied the source URL from history.");
    } else if (action === "open-url") {
      openExternalUrl(url);
    }
  });
  nodes.wavesCredit.addEventListener("click", function (event) {
    event.preventDefault();
    openExternalUrl("https://www.tiktok.com/@waves.aep1");
  });

  updateSourceUi();
  loadQueueState();
  renderQueueList();
  loadSettings();
  loadHistory();
})();
