(function () {
  var SETTINGS_FILE = "Waves-Media-Downloader-settings.json";
  var LEGACY_SETTINGS_FILE = "AE-YouTube-Importer-settings.json";
  var DOWNLOAD_CACHE_FILE = "download-cache.json";
  var EXTENSION_VERSION = "1.4.7";
  var EXTENSION_ROOT = (function () {
    try {
      return new File($.fileName).parent.parent;
    } catch (error) {
      return new Folder("");
    }
  })();

  function makeResult(ok, data) {
    data = data || {};
    data.ok = ok;
    return toJson(data);
  }

  function toJson(value) {
    if (typeof JSON !== "undefined" && JSON.stringify) {
      return JSON.stringify(value);
    }
    return legacyStringify(value);
  }

  function legacyStringify(value) {
    var type = typeof value;
    if (value === null) {
      return "null";
    }
    if (type === "number" || type === "boolean") {
      return String(value);
    }
    if (type === "string") {
      return '"' + value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r/g, "\\r").replace(/\n/g, "\\n") + '"';
    }
    if (value instanceof Array) {
      var items = [];
      for (var i = 0; i < value.length; i += 1) {
        items.push(legacyStringify(value[i]));
      }
      return "[" + items.join(",") + "]";
    }
    var pairs = [];
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        pairs.push(legacyStringify(key) + ":" + legacyStringify(value[key]));
      }
    }
    return "{" + pairs.join(",") + "}";
  }

  function parseJson(text) {
    if (!text) {
      return {};
    }
    if (typeof JSON !== "undefined" && JSON.parse) {
      return JSON.parse(text);
    }
    return eval("(" + text + ")");
  }

  function settingsFolder() {
    var folder = new Folder(Folder.userData.fsName + "/Waves Media Downloader");
    if (!folder.exists) {
      folder.create();
    }
    return folder;
  }

  function legacySettingsFolder() {
    return new Folder(Folder.userData.fsName + "/AE YouTube Importer");
  }

  function settingsFile() {
    return new File(settingsFolder().fsName + "/" + SETTINGS_FILE);
  }

  function legacySettingsFile() {
    return new File(legacySettingsFolder().fsName + "/" + LEGACY_SETTINGS_FILE);
  }

  function downloadCacheFile() {
    return new File(settingsFolder().fsName + "/" + DOWNLOAD_CACHE_FILE);
  }

  function twoDigits(value) {
    value = Number(value || 0);
    return value < 10 ? "0" + value : String(value);
  }

  function timestampForFile(date) {
    date = date || new Date();
    return date.getFullYear() + twoDigits(date.getMonth() + 1) + twoDigits(date.getDate()) + "-" + twoDigits(date.getHours()) + twoDigits(date.getMinutes()) + twoDigits(date.getSeconds());
  }

  function timestampForLog(date) {
    date = date || new Date();
    return date.getFullYear() + "-" + twoDigits(date.getMonth() + 1) + "-" + twoDigits(date.getDate()) + " " + twoDigits(date.getHours()) + ":" + twoDigits(date.getMinutes()) + ":" + twoDigits(date.getSeconds());
  }

  function safeLogName(value) {
    value = String(value || "media").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");
    return value ? value.substring(0, 32) : "media";
  }

  function writeSessionLog(label, text, settings) {
    try {
      var folder = settingsFolder();
      var file = new File(folder.fsName + "/log-" + timestampForFile(new Date()) + "-" + safeLogName(label) + ".txt");
      file.encoding = "UTF-8";
      file.open("w");
      file.write(sanitizeLogText(text, settings));
      file.close();
      return file.fsName;
    } catch (error) {
      return "";
    }
  }

  function cleanupOldSettingsFiles() {
    try {
      var folder = settingsFolder();
      var files = folder.getFiles(function (file) {
        return file instanceof File && /^(runner-|job-|log-).*\.(json|txt|cancel|cmd)$/i.test(file.name);
      });
      var now = new Date().getTime();
      var maxAgeMs = 7 * 24 * 60 * 60 * 1000;
      for (var i = 0; i < files.length; i += 1) {
        try {
          if (now - files[i].modified.getTime() > maxAgeMs) {
            files[i].remove();
          }
        } catch (innerError) {}
      }
    } catch (error) {}
  }

  function sanitizeLogText(text, settings) {
    text = String(text || "");
    if (settings) {
      if (settings.spotifyClientSecret) {
        text = text.split(settings.spotifyClientSecret).join("[spotify-client-secret]");
      }
      if (settings.spotifyClientId) {
        text = text.split(settings.spotifyClientId).join("[spotify-client-id]");
      }
    }
    text = text.replace(/[A-Za-z]:\\Users\\[^\\\r\n]+/g, "[USER_HOME]");
    text = text.replace(/\/Users\/[^\/\r\n]+/g, "[USER_HOME]");
    text = text.replace(/\b((?:access[_-]?token|refresh[_-]?token|token|secret|client_secret)=)([^\s&]+)/ig, "$1[REDACTED]");
    text = text.replace(/\b[A-Za-z0-9_-]{32,}\b/g, "[REDACTED_TOKEN]");
    return text;
  }

  function toolLabel(pathValue, fallback) {
    var text = String(pathValue || fallback || "");
    if (!text) {
      return "";
    }
    text = text.replace(/\\/g, "/");
    var parts = text.split("/");
    return parts[parts.length - 1] || fallback || "";
  }

  function temporaryDownloadFile(file) {
    if (!(file instanceof File)) {
      return false;
    }
    return /\.(?:part(?:-Frag\d+)?|ytdl|tmp|temp)$/i.test(file.name);
  }

  function snapshotTemporaryFiles(folder) {
    var snapshot = {};
    if (!folder || !folder.exists) {
      return snapshot;
    }
    var files = folder.getFiles(function (entry) {
      return temporaryDownloadFile(entry);
    });
    for (var i = 0; i < files.length; i += 1) {
      snapshot[String(files[i].fsName).toLowerCase()] = true;
    }
    return snapshot;
  }

  function cleanupNewTemporaryFiles(folder, snapshot) {
    if (!folder || !folder.exists) {
      return;
    }
    var files = folder.getFiles(function (entry) {
      return temporaryDownloadFile(entry);
    });
    for (var i = 0; i < files.length; i += 1) {
      var key = String(files[i].fsName).toLowerCase();
      if (!snapshot[key] && files[i].exists) {
        files[i].remove();
      }
    }
  }

  function runToolWithArgs(executable, args, label, settings, workingDirectory, jobId, progressFilename) {
    var script = runnerScriptFile();
    if (!script.exists) {
      throw new Error("Waves command runner is missing.\nExpected: " + script.fsName);
    }
    cleanupOldSettingsFiles();
    var payloadFile = new File(settingsFolder().fsName + "/runner-" + timestampForFile(new Date()) + "-" + safeLogName(label) + ".json");
    var resultFile = new File(settingsFolder().fsName + "/runner-result-" + timestampForFile(new Date()) + "-" + safeLogName(label) + ".json");
    payloadFile.encoding = "UTF-8";
    payloadFile.open("w");
    payloadFile.write(toJson({
      operation: "runTool",
      executable: executable,
      arguments: args || [],
      workingDirectory: workingDirectory || "",
      jobId: jobId || "",
      jobDirectory: jobId ? settingsFolder().fsName : "",
      progressFilename: progressFilename || "",
      resultPath: resultFile.fsName
    }));
    payloadFile.close();
    var launcherFile = new File(settingsFolder().fsName + "/runner-launch-" + timestampForFile(new Date()) + "-" + safeLogName(label) + ".cmd");
    launcherFile.encoding = "UTF-8";
    launcherFile.open("w");
    launcherFile.write(
      "@echo off\r\n" +
      "powershell.exe -NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File \"" +
      script.fsName.replace(/"/g, '""') +
      "\" -PayloadPath \"" +
      payloadFile.fsName.replace(/"/g, '""') +
      "\" 2>&1\r\n"
    );
    launcherFile.close();
    var hiddenLauncherFile = new File(settingsFolder().fsName + "/runner-hidden-" + timestampForFile(new Date()) + "-" + safeLogName(label) + ".vbs");
    hiddenLauncherFile.encoding = "UTF-8";
    hiddenLauncherFile.open("w");
    hiddenLauncherFile.write(
      'Set shell = CreateObject("WScript.Shell")\r\n' +
      'exitCode = shell.Run(Chr(34) & "' + launcherFile.fsName.replace(/"/g, '""') + '" & Chr(34), 0, True)\r\n' +
      "WScript.Quit exitCode\r\n"
    );
    hiddenLauncherFile.close();
    var cmd = 'wscript.exe //B //NoLogo "' + hiddenLauncherFile.fsName.replace(/"/g, '""') + '"';
    var raw = "";
    try {
      raw = system.callSystem(cmd);
      if (resultFile.exists) {
        raw = readTextFile(resultFile);
      }
    } finally {
      if (payloadFile.exists) {
        payloadFile.remove();
      }
      if (resultFile.exists) {
        resultFile.remove();
      }
      if (launcherFile.exists) {
        launcherFile.remove();
      }
      if (hiddenLauncherFile.exists) {
        hiddenLauncherFile.remove();
      }
    }
    var result;
    if (!raw || !raw.replace(/^\s+|\s+$/g, "")) {
      result = {
        ok: false,
        exitCode: 1,
        error: "Command runner returned no output.",
        output: "The Windows command launcher produced no output. Confirm that scripts are allowed and rerun the current installer."
      };
    } else {
      try {
        result = parseJson(raw);
      } catch (error) {
        result = {
          ok: false,
          exitCode: 1,
          error: "Command runner failed before returning JSON.",
          output: raw
        };
      }
    }
    result.internalOutput = String(result.output || result.error || "");
    result.output = sanitizeLogText(result.internalOutput, settings);
    if (result.error) {
      result.error = sanitizeLogText(result.error, settings);
    }
    return result;
  }

  function defaultDownloadDir() {
    return Folder.myDocuments.fsName + "/Waves Media Downloads";
  }

  function extensionRootFolder() {
    var capturedRunner = new File(EXTENSION_ROOT.fsName + "/helpers/waves-runner.ps1");
    if (capturedRunner.exists) {
      return EXTENSION_ROOT;
    }
    var installedRoot = new Folder(Folder.userData.fsName + "/Adobe/CEP/extensions/Waves Media Downloader");
    var installedRunner = new File(installedRoot.fsName + "/helpers/waves-runner.ps1");
    if (installedRunner.exists) {
      return installedRoot;
    }
    return EXTENSION_ROOT;
  }

  function runnerScriptFile() {
    return new File(extensionRootFolder().fsName + "/helpers/waves-runner.ps1");
  }

  function defaultSpotifyDlpPath() {
    var roamingScripts = new File(Folder.userData.fsName + "/Python/Python312/Scripts/spotify-dlp.exe");
    if (roamingScripts.exists) {
      return roamingScripts.fsName;
    }
    return "spotify-dlp";
  }

  function defaultSettings() {
    return {
      ytdlpPath: "yt-dlp",
      spotifyDlpPath: defaultSpotifyDlpPath(),
      ffmpegPath: "",
      conversionMode: "auto",
      customConversionPresets: [],
      conversionPresetDefaultVersion: 1,
      disableHardwareAcceleration: false,
      cookiesBrowser: "",
      downloadDir: defaultDownloadDir(),
      defaultDownloadDir: defaultDownloadDir(),
      setupCompleted: false,
      filenameTemplate: "%(title).80B-%(id)s.%(ext)s",
      organizeProject: true,
      downloadThumbnail: true,
      lastSpotifyMode: "easy",
      addToTimeline: true,
      autoFitToComp: true,
      createCompIfNeeded: true,
      precomposeLayer: false,
      spotifyClientId: "",
      spotifyClientSecret: "",
      spotifyAuthCompleted: false
    };
  }

  function applyRuntimeSettings(settings) {
    var completeFile = new File(settingsFolder().fsName + "/spotify-auth-complete.txt");
    if (completeFile.exists) {
      settings.spotifyAuthCompleted = true;
    }
    var spotifyConfig = spotifyDlpConfig();
    if (spotifyConfig.client_id && !settings.spotifyClientId) {
      settings.spotifyClientId = spotifyConfig.client_id;
    }
    if (spotifyConfig.client_secret && !settings.spotifyClientSecret) {
      settings.spotifyClientSecret = spotifyConfig.client_secret;
    }
    if (settings.spotifyClientId && settings.spotifyClientSecret) {
      settings.spotifyAuthCompleted = true;
    }
    return settings;
  }

  function spotifyDlpConfig() {
    var configFile = new File(Folder.userData.fsName + "/spotify-dlp/config.json");
    if (!configFile.exists) {
      return {};
    }
    try {
      configFile.encoding = "UTF-8";
      configFile.open("r");
      var raw = configFile.read();
      configFile.close();
      return parseJson(raw);
    } catch (error) {
      try {
        configFile.close();
      } catch (closeError) {}
      return {};
    }
  }

  function readSettings() {
    var settings = defaultSettings();
    var file = settingsFile();
    if (!file.exists) {
      var legacyFile = legacySettingsFile();
      if (legacyFile.exists) {
        file = legacyFile;
      }
    }
    if (!file.exists) {
      return normalizeSettingsPaths(applyRuntimeSettings(settings));
    }

    file.open("r");
    var raw = file.read();
    file.close();
    var saved = parseJson(raw);
    for (var key in saved) {
      if (saved.hasOwnProperty(key) && saved[key] !== null && saved[key] !== undefined) {
        settings[key] = saved[key];
      }
    }
    if (saved.conversionPresetDefaultVersion === undefined || saved.conversionPresetDefaultVersion === null) {
      settings.conversionMode = "auto";
      settings.conversionPresetDefaultVersion = 1;
    }
    return normalizeSettingsPaths(applyRuntimeSettings(settings));
  }

  function normalizeSettingsPaths(settings) {
    if (!settings) {
      return settings;
    }
    settings.customConversionPresets = sanitizeCustomConversionPresets(settings.customConversionPresets || []);
    settings.conversionMode = normalizeConversionPresetId(settings.conversionMode, settings.customConversionPresets);
    settings.disableHardwareAcceleration = settings.disableHardwareAcceleration === true;
    if ($.os.toLowerCase().indexOf("windows") < 0) {
      return settings;
    }
    var userHome = (typeof $.getenv === "function" ? $.getenv("USERPROFILE") : "") || Folder.userData.parent.parent.fsName;
    function normalizePath(value) {
      var path = String(value || "");
      path = path.replace(/^\[USER_HOME\](?=\\|\/|$)/i, userHome);
      path = path.replace(/^%USERPROFILE%(?=\\|\/|$)/i, userHome);
      return path.replace(/\//g, "\\");
    }
    settings.ytdlpPath = normalizePath(settings.ytdlpPath || "yt-dlp");
    settings.spotifyDlpPath = normalizePath(settings.spotifyDlpPath || "spotify-dlp");
    settings.ffmpegPath = normalizePath(settings.ffmpegPath);
    if (settings.downloadDir) {
      settings.downloadDir = normalizePath(settings.downloadDir);
    }
    if (settings.defaultDownloadDir) {
      settings.defaultDownloadDir = normalizePath(settings.defaultDownloadDir);
    }
    return settings;
  }

  function availableToolPath(pathValue, fallback) {
    var value = String(pathValue || fallback || "");
    if (/[\\\/]/.test(value) && !(new File(value)).exists) {
      return fallback;
    }
    return value || fallback;
  }

  function writeSettings(settings) {
    settings = normalizeSettingsPaths(settings);
    var file = settingsFile();
    file.encoding = "UTF-8";
    file.open("w");
    file.write(toJson(settings));
    file.close();
  }

  function readDownloadCache() {
    var file = downloadCacheFile();
    if (!file.exists) {
      return {};
    }
    try {
      file.encoding = "UTF-8";
      file.open("r");
      var raw = file.read();
      file.close();
      return parseJson(raw);
    } catch (error) {
      try {
        file.close();
      } catch (closeError) {}
      return {};
    }
  }

  function writeDownloadCache(cache) {
    var file = downloadCacheFile();
    file.encoding = "UTF-8";
    file.open("w");
    file.write(toJson(cache || {}));
    file.close();
  }

  function filePathList(files) {
    var list = [];
    files = files || [];
    for (var i = 0; i < files.length; i += 1) {
      if (files[i] && files[i].fsName) {
        list.push(files[i].fsName);
      }
    }
    return list;
  }

  function cacheKeyFor(payload) {
    var url = String(payload.url || "").replace(/^\s+|\s+$/g, "").toLowerCase();
    if (payload.source === "spotify") {
      var spotifyMatch = /open\.spotify\.com\/(track|album|playlist)\/([a-z0-9]+)/i.exec(url);
      if (spotifyMatch) {
        url = "spotify:" + spotifyMatch[1].toLowerCase() + ":" + spotifyMatch[2].toLowerCase();
      }
    }
    var parts = [
      payload.source || "",
      payload.source === "spotify" ? (payload.spotifyMode || "") : "",
      payload.source === "tiktok" ? (payload.tiktokMode || "") : "",
      payload.source === "youtube" || payload.source === "other" ? (payload.quality || "") : "",
      payload.transcodeForAe ? "transcode:" + String(payload.conversionMode || "auto") : "original",
      url
    ];
    return parts.join("|");
  }

  function displayNameForFile(file) {
    return file && file.exists ? cleanDisplayName(file.name) : "";
  }

  function cleanDisplayName(name) {
    var text = String(name || "");
    try {
      text = decodeURIComponent(text);
    } catch (error) {
      text = text.replace(/%20/g, " ");
    }
    text = text.replace(/\.[a-z0-9]{2,5}$/i, "");
    text = text.replace(/-AE-H264$/i, "");
    text = text.replace(/-\d{9,20}$/g, "");
    text = text.replace(/-[a-zA-Z0-9_-]{8,18}$/g, "");
    text = text.replace(/\+/g, " ");
    text = text.replace(/[_]+/g, " ");
    text = text.replace(/^\s*\d+[\.\-_ ]+/, "");
    text = text.replace(/\s*-\s*pgc\s*$/i, "");
    text = text.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
    return text;
  }

  function validateFilenameTemplate(template) {
    template = String(template || "").replace(/^\s+|\s+$/g, "");
    if (!template) {
      return "Filename template is required.";
    }
    if (template.length > 180) {
      return "Filename template is too long. Keep it under 180 characters.";
    }
    if (/^[a-z]:/i.test(template) || /^\\\\/.test(template) || /^\//.test(template)) {
      return "Filename template must be a filename, not an absolute path.";
    }
    if (/(^|[\\\/])\.\.([\\\/]|$)/.test(template) || /\.\./.test(template)) {
      return "Filename template cannot contain path traversal.";
    }
    if (/[\\\/<>:"|?*\x00-\x1F]/.test(template)) {
      return "Filename template cannot contain folders or Windows filename characters: < > : \" / \\ | ? *";
    }
    return "";
  }

  function normalizedPathText(path) {
    return String(path || "").replace(/\\/g, "/").replace(/\/+$/g, "").toLowerCase();
  }

  function isPathInsideFolder(filePath, folderPath) {
    var fileText = normalizedPathText(filePath);
    var folderText = normalizedPathText(folderPath);
    return !!fileText && !!folderText && (fileText === folderText || fileText.indexOf(folderText + "/") === 0);
  }

  function supportedDeleteExtension(file) {
    var ext = fileExtension(file);
    return {
      ".mp4": true,
      ".mov": true,
      ".mkv": true,
      ".webm": true,
      ".mp3": true,
      ".wav": true,
      ".m4a": true,
      ".aac": true,
      ".flac": true,
      ".ogg": true,
      ".srt": true,
      ".vtt": true,
      ".ass": true,
      ".json": true,
      ".jpg": true,
      ".jpeg": true,
      ".png": true,
      ".webp": true
    }[ext] === true;
  }

  function moveFileToRecycleBin(file) {
    if (!file || !file.exists) {
      return false;
    }
    if ($.os.toLowerCase().indexOf("windows") < 0) {
      return false;
    }
    try {
      var script = new File(settingsFolder().fsName + "/recycle-delete.ps1");
      script.encoding = "UTF-8";
      script.open("w");
      script.write("param([string]$FilePath)\r\n");
      script.write("$ErrorActionPreference = 'Stop'\r\n");
      script.write("Add-Type -AssemblyName Microsoft.VisualBasic\r\n");
      script.write("[Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile($FilePath, 'OnlyErrorDialogs', 'SendToRecycleBin')\r\n");
      script.close();
      runToolWithArgs("powershell.exe", [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        script.fsName,
        "-FilePath",
        file.fsName
      ], "recycle-delete", readSettings(), settingsFolder().fsName);
      return !file.exists;
    } catch (error) {
      return false;
    }
  }

  function getCachedDownload(payload) {
    var cache = readDownloadCache();
    var entry = cache[cacheKeyFor(payload)];
    if (!entry || !entry.file) {
      return null;
    }
    var file = new File(entry.file);
    if (file.exists) {
      return {
        file: file,
        sourceFile: entry.sourceFile ? new File(entry.sourceFile) : null,
        transcoded: entry.transcoded === true
      };
    }
    delete cache[cacheKeyFor(payload)];
    writeDownloadCache(cache);
    return null;
  }

  function metadataSidecarFile(file, createFolder) {
    if (!file || !file.fsName) {
      return null;
    }
    var folder = new Folder(file.parent.fsName + "/Metadata");
    if (createFolder && !folder.exists) {
      folder.create();
    }
    return new File(folder.fsName + "/" + file.name + ".waves-meta.json");
  }

  function legacyMetadataSidecarFile(file) {
    return file && file.fsName ? new File(file.fsName + ".waves-meta.json") : null;
  }

  function existingMetadataSidecarFile(file) {
    var sidecar = metadataSidecarFile(file);
    if (sidecar && sidecar.exists) {
      return sidecar;
    }
    var legacy = legacyMetadataSidecarFile(file);
    return legacy && legacy.exists ? legacy : sidecar;
  }

  function firstOutputLine(text) {
    var lines = String(text || "").replace(/\r/g, "").split("\n");
    for (var i = 0; i < lines.length; i += 1) {
      var line = lines[i].replace(/^\s+|\s+$/g, "");
      if (line) {
        return line;
      }
    }
    return "";
  }

  function readToolVersion(executable, args, label, settings) {
    try {
      var result = runToolWithArgs(executable, args, label + "-version", settings, settingsFolder().fsName);
      if (result.ok === true || result.exitCode === 0) {
        return firstOutputLine(result.output) || "unknown";
      }
    } catch (error) {}
    return "unknown";
  }

  function collectToolVersions(payload, settings, transcoded) {
    var versions = {
      ytdlpVersion: "not used",
      spotifyDlpVersion: "not used",
      ffmpegVersion: "not used"
    };
    if (payload.source === "spotify") {
      versions.spotifyDlpVersion = readToolVersion(settings.spotifyDlpPath || "spotify-dlp", ["--version"], "spotify-dlp", settings);
      if (payload.spotifyMode !== "full") {
        versions.ytdlpVersion = readToolVersion(settings.ytdlpPath || "yt-dlp", ["--version"], "yt-dlp", settings);
      }
    } else {
      versions.ytdlpVersion = readToolVersion(settings.ytdlpPath || "yt-dlp", ["--version"], "yt-dlp", settings);
    }
    if (transcoded) {
      versions.ffmpegVersion = readToolVersion(ffmpegCommand(settings), ["-version"], "ffmpeg", settings);
    }
    return versions;
  }

  function sourceMetadataData(payload, file, sourceFile, transcoded, displayTitle, files, toolVersions) {
    var settings = readSettings();
    toolVersions = toolVersions || {};
    return {
      plugin: "Waves Media Downloader",
      pluginVersion: EXTENSION_VERSION,
      source: payload.source || "media",
      sourceUrl: payload.url || "",
      downloadDate: timestampForLog(new Date()),
      title: displayTitle || displayNameForFile(file),
      finalFile: file && file.fsName ? file.fsName : "",
      originalFile: sourceFile && sourceFile.fsName ? sourceFile.fsName : "",
      importedFiles: filePathList(files || []),
      transcoded: transcoded === true,
      quality: payload.quality || "",
      spotifyMode: payload.spotifyMode || "",
      tiktokMode: payload.tiktokMode || "",
      conversionMode: payload.conversionMode || settings.conversionMode || "auto",
      requestedConversionPreset: payload.conversionMode || settings.conversionMode || "auto",
      actualConversionPreset: payload.actualConversionPreset || (transcoded ? payload.conversionMode || settings.conversionMode || "auto" : "original"),
      actualHardwareAcceleration: payload.actualHardwareAcceleration || (transcoded ? "cpu" : "none"),
      requestedHardwareAcceleration: payload.requestedHardwareAcceleration || "none",
      hardwareFallbackUsed: payload.hardwareFallbackUsed === true,
      ytdlpTool: toolLabel(settings.ytdlpPath, "yt-dlp"),
      spotifyDlpTool: toolLabel(settings.spotifyDlpPath, "spotify-dlp"),
      ytdlpVersion: toolVersions.ytdlpVersion || "unknown",
      spotifyDlpVersion: toolVersions.spotifyDlpVersion || "unknown",
      ffmpegVersion: toolVersions.ffmpegVersion || "unknown",
      ffmpegTool: toolLabel(settings.ffmpegPath, "ffmpeg")
    };
  }

  function writeMetadataSidecar(metadata, file) {
    try {
      var sidecar = metadataSidecarFile(file, true);
      if (!sidecar) {
        return "";
      }
      sidecar.encoding = "UTF-8";
      sidecar.open("w");
      sidecar.write(sanitizeLogText(toJson(metadata), readSettings()));
      sidecar.close();
      return sidecar.fsName;
    } catch (error) {
      return "";
    }
  }

  function readMetadataSidecar(file) {
    try {
      var sidecar = metadataSidecarFile(file);
      if (!sidecar || !sidecar.exists) {
        sidecar = legacyMetadataSidecarFile(file);
      }
      if (!sidecar || !sidecar.exists) {
        return null;
      }
      sidecar.encoding = "UTF-8";
      sidecar.open("r");
      var metadata = parseJson(sidecar.read());
      sidecar.close();
      return metadata && metadata.plugin ? metadata : null;
    } catch (error) {
      try {
        sidecar.close();
      } catch (closeError) {}
      return null;
    }
  }

  function rememberDownload(payload, file, sourceFile, transcoded, thumbnailFile, metadataFile) {
    if (!file || !file.exists) {
      return;
    }
    var cache = readDownloadCache();
    cache[cacheKeyFor(payload)] = {
      file: file.fsName,
      sourceFile: sourceFile && sourceFile.exists ? sourceFile.fsName : "",
      thumbnail: thumbnailFile && thumbnailFile.exists ? thumbnailFile.fsName : "",
      transcoded: transcoded === true,
      source: payload.source || "",
      url: payload.url || "",
      title: displayNameForFile(file),
      quality: payload.quality || "",
      spotifyMode: payload.spotifyMode || "",
      tiktokMode: payload.tiktokMode || "",
      conversionMode: payload.conversionMode || "auto",
      actualConversionPreset: payload.actualConversionPreset || "original",
      metadataFile: metadataFile || "",
      savedAt: new Date().getTime()
    };
    writeDownloadCache(cache);
  }

  function historyEntries() {
    var cache = readDownloadCache();
    var entries = [];
    for (var key in cache) {
      if (!cache.hasOwnProperty(key)) {
        continue;
      }
      var entry = cache[key];
      if (!entry || !entry.file) {
        continue;
      }
      var file = new File(entry.file);
      var thumbnail = entry.thumbnail ? new File(entry.thumbnail) : null;
      var sourceFile = entry.sourceFile ? new File(entry.sourceFile) : null;
      var metadataFile = entry.metadataFile ? new File(entry.metadataFile) : existingMetadataSidecarFile(file);
      var cacheStatus = file.exists ? "present" : "missing";
      var staleAfterMs = 30 * 24 * 60 * 60 * 1000;
      if (file.exists && entry.savedAt && (new Date().getTime() - Number(entry.savedAt)) > staleAfterMs) {
        cacheStatus = "stale";
      } else if (file.exists && entry.transcoded === true && sourceFile && !sourceFile.exists) {
        cacheStatus = "present-source-removed";
      }
      entries.push({
        key: key,
        file: entry.file,
        exists: file.exists,
        cacheStatus: cacheStatus,
        thumbnail: thumbnail && thumbnail.exists ? thumbnail.fsName : "",
        title: cleanDisplayName(entry.title || displayNameForFile(file) || entry.file),
        source: entry.source || "",
        url: entry.url || "",
        quality: entry.quality || "",
        spotifyMode: entry.spotifyMode || "",
        tiktokMode: entry.tiktokMode || "",
        conversionMode: entry.conversionMode || "auto",
        actualConversionPreset: entry.actualConversionPreset || (entry.transcoded ? entry.conversionMode || "auto" : "original"),
        metadataFile: metadataFile && metadataFile.exists ? metadataFile.fsName : "",
        transcoded: entry.transcoded === true,
        savedAt: entry.savedAt || 0,
        size: file.exists ? file.length : 0
      });
    }
    entries.sort(function (a, b) {
      return Number(b.savedAt || 0) - Number(a.savedAt || 0);
    });
    return entries;
  }

  function markSpotifyAuthCompleted() {
    var settings = readSettings();
    settings.spotifyAuthCompleted = true;
    writeSettings(settings);
  }

  function readTextFile(file) {
    if (!file || !file.exists) {
      return "";
    }
    file.encoding = "UTF-8";
    file.open("r");
    var text = file.read();
    file.close();
    return text;
  }

  function quoteArg(value) {
    value = String(value || "");
    if ($.os.toLowerCase().indexOf("windows") >= 0) {
      return '"' + value.replace(/"/g, '\\"') + '"';
    }
    return "'" + value.replace(/'/g, "'\\''") + "'";
  }

  function openFolderNative(folder) {
    if (!folder || !folder.exists) {
      throw new Error("Folder not found.");
    }
    if (!folder.execute()) {
      throw new Error("Could not open folder: " + folder.fsName);
    }
  }

  function ensureFolder(path) {
    var folder = new Folder(path);
    if (!folder.exists && !folder.create()) {
      throw new Error("Could not create download folder: " + path);
    }
    return folder;
  }

  function pad2(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function ffmpegCommand(settings) {
    var path = settings.ffmpegPath || "";
    if (!path) {
      return "ffmpeg";
    }

    var file = new File(path);
    if (file.exists) {
      return file.fsName;
    }

    var folder = new Folder(path);
    if (folder.exists) {
      return folder.fsName + "/ffmpeg.exe";
    }

    return path;
  }

  function ffprobeCommand(settings) {
    var ffmpeg = ffmpegCommand(settings);
    if (/ffmpeg(\.exe)?$/i.test(ffmpeg)) {
      return ffmpeg.replace(/ffmpeg(\.exe)?$/i, "ffprobe$1");
    }
    return "ffprobe";
  }

  function builtinConversionPresets() {
    return {
      auto: { id: "auto", type: "builtin_ffmpeg", label: "Auto: AE-friendly", description: "Skips safe media and converts non-ideal files.", outputType: "video", basePresetId: "h264_high", skipIfAeFriendly: true },
      h264_high: { id: "h264_high", type: "builtin_ffmpeg", label: "H.264 High Quality", description: "High-quality AE-compatible MP4.", outputType: "video", container: "mp4", suffix: "-AE-H264-HQ", videoCodec: "libx264", hardwareAcceleration: "auto", crf: 18, encoderPreset: "medium", pixelFormat: "yuv420p", frameRateMode: "keep", targetFps: "source", audioCodec: "aac", audioBitrate: "192k", sampleRate: "48000", channels: "keep", faststart: true, hdrToSdr: false },
      h264_preview: { id: "h264_preview", type: "builtin_ffmpeg", label: "H.264 Fast Preview", description: "Fast conversion for quick previews.", outputType: "video", container: "mp4", suffix: "-AE-H264-Preview", videoCodec: "libx264", hardwareAcceleration: "auto", crf: 23, encoderPreset: "ultrafast", pixelFormat: "yuv420p", frameRateMode: "keep", targetFps: "source", audioCodec: "aac", audioBitrate: "192k", sampleRate: "48000", channels: "keep", faststart: true, hdrToSdr: false },
      h264_cfr: { id: "h264_cfr", type: "builtin_ffmpeg", label: "H.264 Constant Frame Rate", description: "AE-compatible H.264 for VFR, phone, and TikTok footage.", outputType: "video", container: "mp4", suffix: "-AE-H264-CFR", videoCodec: "libx264", hardwareAcceleration: "auto", crf: 18, encoderPreset: "medium", pixelFormat: "yuv420p", frameRateMode: "cfr", targetFps: "source", audioCodec: "aac", audioBitrate: "192k", sampleRate: "48000", channels: "keep", faststart: true, hdrToSdr: false },
      h264_hdr_sdr: { id: "h264_hdr_sdr", type: "builtin_ffmpeg", label: "H.264 HDR to SDR", description: "Tone-maps HDR footage to Rec.709 H.264.", outputType: "video", container: "mp4", suffix: "-AE-H264-SDR", videoCodec: "libx264", hardwareAcceleration: "auto", crf: 18, encoderPreset: "medium", pixelFormat: "yuv420p", frameRateMode: "keep", targetFps: "source", audioCodec: "aac", audioBitrate: "192k", sampleRate: "48000", channels: "keep", faststart: true, hdrToSdr: true },
      prores_422_hq: { id: "prores_422_hq", type: "builtin_ffmpeg", label: "ProRes 422 HQ", description: "Large files with smooth AE editing.", outputType: "video", container: "mov", suffix: "-AE-ProRes422HQ", videoCodec: "prores_422_hq", proresProfile: "3", pixelFormat: "yuv422p10le", frameRateMode: "keep", targetFps: "source", audioCodec: "pcm_s16le", sampleRate: "48000", channels: "keep", faststart: false, hdrToSdr: false },
      prores_4444: { id: "prores_4444", type: "builtin_ffmpeg", label: "ProRes 4444", description: "Maximum quality ProRes with alpha support.", outputType: "video", container: "mov", suffix: "-AE-ProRes4444", videoCodec: "prores_4444", proresProfile: "4", pixelFormat: "yuva444p10le", frameRateMode: "keep", targetFps: "source", audioCodec: "pcm_s16le", sampleRate: "48000", channels: "keep", faststart: false, hdrToSdr: false },
      audio_wav_48k: { id: "audio_wav_48k", type: "builtin_ffmpeg", label: "WAV 48kHz Audio", description: "Clean stereo PCM audio for AE.", outputType: "audio", container: "wav", suffix: "-Audio-48k", audioCodec: "pcm_s16le", sampleRate: "48000", channels: "stereo", skipIfAeFriendly: true }
    };
  }

  function legacyConversionPresetId(value) {
    var map = { quality: "h264_high", fast: "h264_preview", prores422: "prores_422_hq", prores4444: "prores_4444", cfr: "h264_cfr", hdrsdr: "h264_hdr_sdr", wav48: "audio_wav_48k", audioonly: "audio_wav_48k" };
    value = String(value || "auto");
    return map[value] || value;
  }

  function allowedPresetValue(value, allowed, fallback) {
    value = String(value === undefined || value === null ? "" : value);
    return allowed[value] ? value : fallback;
  }

  function sanitizeCustomConversionPreset(preset, index) {
    preset = preset || {};
    var name = String(preset.label || preset.name || "").replace(/^\s+|\s+$/g, "").substring(0, 60);
    var description = String(preset.description || "").substring(0, 120);
    var suffix = String(preset.suffix || "").replace(/^\s+|\s+$/g, "").substring(0, 40);
    if (!name || !suffix || /[\\\/<>:"|?*]|\.{2}|[&;`]/.test(suffix)) {
      throw new Error("Custom conversion preset has an invalid name or output suffix.");
    }
    var outputType = allowedPresetValue(preset.outputType, { video: true, audio: true }, "video");
    var container = allowedPresetValue(preset.container, { mp4: true, mov: true, wav: true, mp3: true, m4a: true }, outputType === "audio" ? "wav" : "mp4");
    var videoCodec = allowedPresetValue(preset.videoCodec, { libx264: true, libx265: true, prores_422_hq: true, prores_4444: true }, "libx264");
    var pixelFormat = allowedPresetValue(preset.pixelFormat, { yuv420p: true, yuv422p10le: true, yuva444p10le: true }, "yuv420p");
    var audioCodec = allowedPresetValue(preset.audioCodec, { aac: true, pcm_s16le: true, libmp3lame: true, copy: true, none: true }, outputType === "audio" ? "pcm_s16le" : "aac");
    if (outputType === "audio") {
      if (audioCodec === "pcm_s16le") {
        container = "wav";
      } else if (audioCodec === "libmp3lame") {
        container = "mp3";
      } else if (audioCodec === "aac") {
        container = "m4a";
      }
    }
    if (outputType === "video" && (container === "wav" || container === "mp3" || container === "m4a")) {
      throw new Error("Video custom presets must use MP4 or MOV.");
    }
    if (outputType === "audio" && audioCodec === "none") {
      throw new Error("Audio-only custom presets require an audio codec.");
    }
    if (container === "wav" && audioCodec !== "pcm_s16le") {
      throw new Error("WAV custom presets must use PCM audio.");
    }
    if (container === "mp3" && audioCodec !== "libmp3lame") {
      throw new Error("MP3 custom presets must use MP3 audio.");
    }
    if (container === "m4a" && audioCodec !== "aac") {
      throw new Error("M4A custom presets must use AAC audio.");
    }
    if ((videoCodec === "prores_422_hq" || videoCodec === "prores_4444") && container !== "mov") {
      throw new Error("ProRes custom presets must use MOV.");
    }
    if (videoCodec === "prores_422_hq" && pixelFormat !== "yuv422p10le") {
      throw new Error("ProRes 422 HQ must use yuv422p10le.");
    }
    if (videoCodec === "prores_4444" && pixelFormat !== "yuva444p10le") {
      throw new Error("ProRes 4444 must use yuva444p10le.");
    }
    if (videoCodec === "libx264" && container === "mp4" && pixelFormat !== "yuv420p") {
      throw new Error("H.264 MP4 custom presets must use yuv420p.");
    }
    var crf = Number(preset.crf);
    if (isNaN(crf) || crf < 16 || crf > 28) {
      crf = 18;
    }
    return {
      id: /^custom_[a-z0-9_-]{6,80}$/i.test(String(preset.id || "")) ? String(preset.id) : "custom_" + new Date().getTime() + "_" + index,
      type: "custom_ffmpeg",
      label: name,
      description: description,
      outputType: outputType,
      container: container,
      suffix: suffix,
      videoCodec: outputType === "video" ? videoCodec : "",
      hardwareAcceleration: allowedPresetValue(preset.hardwareAcceleration, { auto: true, cpu: true, nvenc: true, qsv: true, amf: true }, "auto"),
      crf: crf,
      encoderPreset: allowedPresetValue(preset.encoderPreset, { ultrafast: true, superfast: true, veryfast: true, faster: true, fast: true, medium: true, slow: true }, "medium"),
      pixelFormat: pixelFormat,
      frameRateMode: allowedPresetValue(preset.frameRateMode, { keep: true, cfr: true }, "keep"),
      targetFps: allowedPresetValue(preset.targetFps, { source: true, "23.976": true, "24": true, "25": true, "29.97": true, "30": true, "50": true, "59.94": true, "60": true }, "source"),
      audioCodec: audioCodec,
      audioBitrate: allowedPresetValue(preset.audioBitrate, { "128k": true, "192k": true, "256k": true, "320k": true }, "192k"),
      sampleRate: allowedPresetValue(preset.sampleRate, { keep: true, "44100": true, "48000": true }, "48000"),
      channels: allowedPresetValue(preset.channels, { keep: true, stereo: true }, "keep"),
      faststart: preset.faststart === true && container === "mp4",
      hdrToSdr: preset.hdrToSdr === true,
      skipIfAeFriendly: preset.skipIfAeFriendly === true
    };
  }

  function sanitizeCustomConversionPresets(presets) {
    var sanitized = [];
    var seenIds = {};
    presets = presets instanceof Array ? presets : [];
    for (var i = 0; i < presets.length && sanitized.length < 30; i += 1) {
      var preset = sanitizeCustomConversionPreset(presets[i], i);
      if (seenIds[preset.id]) {
        throw new Error("Custom conversion preset IDs must be unique.");
      }
      seenIds[preset.id] = true;
      sanitized.push(preset);
    }
    return sanitized;
  }

  function normalizeConversionPresetId(value, customPresets) {
    value = legacyConversionPresetId(value);
    if (builtinConversionPresets()[value]) {
      return value;
    }
    customPresets = customPresets || [];
    for (var i = 0; i < customPresets.length; i += 1) {
      if (customPresets[i].id === value) {
        return value;
      }
    }
    return "auto";
  }

  function conversionPresetById(value, settings) {
    value = normalizeConversionPresetId(value, settings.customConversionPresets);
    var builtins = builtinConversionPresets();
    if (builtins[value]) {
      return builtins[value];
    }
    for (var i = 0; i < settings.customConversionPresets.length; i += 1) {
      if (settings.customConversionPresets[i].id === value) {
        return settings.customConversionPresets[i];
      }
    }
    return builtins.auto;
  }

  function ratioValue(value) {
    var parts = String(value || "").split("/");
    if (parts.length === 2 && Number(parts[1])) {
      return Number(parts[0]) / Number(parts[1]);
    }
    return Number(value) || 0;
  }

  function probeMediaInfo(file, settings) {
    try {
      var result = runToolWithArgs(ffprobeCommand(settings), ["-v", "error", "-show_format", "-show_streams", "-of", "json", file.fsName], "ffprobe-media", settings);
      var data = parseJson(result.internalOutput || result.output || "{}");
      var info = { extension: fileExtension(file), container: "", video: null, audio: null, hasVideo: false, hasAudio: false, vfr: false };
      info.container = data.format && data.format.format_name ? String(data.format.format_name).toLowerCase() : "";
      var streams = data.streams || [];
      for (var i = 0; i < streams.length; i += 1) {
        var stream = streams[i];
        if (!info.video && stream.codec_type === "video") {
          info.video = stream;
          info.hasVideo = true;
          var avg = ratioValue(stream.avg_frame_rate);
          var nominal = ratioValue(stream.r_frame_rate);
          info.vfr = avg > 0 && nominal > 0 && Math.abs(avg - nominal) > 0.01;
        } else if (!info.audio && stream.codec_type === "audio") {
          info.audio = stream;
          info.hasAudio = true;
        }
      }
      return info;
    } catch (error) {
      return { extension: fileExtension(file), container: "", video: null, audio: null, hasVideo: false, hasAudio: false, vfr: false, probeFailed: true };
    }
  }

  function classifyAeCompatibility(file, settings, source) {
    var info = probeMediaInfo(file, settings);
    var ext = info.extension;
    var videoCodec = info.video ? String(info.video.codec_name || "").toLowerCase() : "";
    var pixFmt = info.video ? String(info.video.pix_fmt || "").toLowerCase() : "";
    var transfer = info.video ? String(info.video.color_transfer || "").toLowerCase() : "";
    var primaries = info.video ? String(info.video.color_primaries || "").toLowerCase() : "";
    var audioCodec = info.audio ? String(info.audio.codec_name || "").toLowerCase() : "";
    var hdr = transfer === "smpte2084" || transfer === "arib-std-b67" || primaries === "bt2020" || primaries === "bt2020nc";
    var result = { status: "unknown", reason: "Media compatibility could not be confirmed.", recommendedPresetId: info.hasVideo ? "h264_high" : "audio_wav_48k", mediaInfo: info, isH264Friendly: false, isAudioFriendly: false, hdr: hdr, vfr: info.vfr };
    if (info.probeFailed) {
      return result;
    }
    if (!info.hasVideo && info.hasAudio) {
      if (ext === ".wav" && { pcm_s16le: true, pcm_s24le: true, pcm_f32le: true }[audioCodec]) {
        result.status = "ae_friendly"; result.reason = "Compatible PCM WAV."; result.isAudioFriendly = true; return result;
      }
      if ((ext === ".aac" || ext === ".m4a" || ext === ".mp4" || ext === ".mov") && audioCodec === "aac") {
        result.status = "ae_friendly"; result.reason = "Compatible AAC audio."; result.isAudioFriendly = true; return result;
      }
      if (ext === ".mp3" && (audioCodec === "mp3" || audioCodec === "mp3float")) {
        result.status = "ae_friendly"; result.reason = "Compatible MP3 audio."; result.isAudioFriendly = true; return result;
      }
      result.status = "non_ideal_convert"; result.reason = "Audio will be normalized for AE."; result.recommendedPresetId = "audio_wav_48k"; return result;
    }
    if (hdr) {
      result.status = "non_ideal_convert"; result.reason = "HDR footage should be tone-mapped for AE."; result.recommendedPresetId = "h264_hdr_sdr"; return result;
    }
    if (source === "tiktok" || info.vfr) {
      result.status = "non_ideal_convert"; result.reason = source === "tiktok" ? "TikTok footage is normalized to constant frame rate." : "Variable frame rate footage should be normalized."; result.recommendedPresetId = "h264_cfr"; return result;
    }
    if ((ext === ".mp4" || ext === ".mov" || ext === ".m4v") && videoCodec === "h264" && (pixFmt === "yuv420p" || pixFmt === "yuvj420p")) {
      result.status = "ae_friendly"; result.reason = "AE-friendly SDR H.264 4:2:0."; result.recommendedPresetId = "h264_high"; result.isH264Friendly = true; return result;
    }
    if (ext === ".mov" && videoCodec.indexOf("prores") >= 0) {
      result.status = "ae_friendly"; result.reason = "AE-friendly Apple ProRes MOV."; result.recommendedPresetId = "prores_422_hq"; return result;
    }
    if (videoCodec === "hevc" || videoCodec === "h265" || videoCodec === "h264") {
      result.status = "non_ideal_convert"; result.reason = videoCodec === "h264" ? "H.264 pixel format is not AE-safe 4:2:0." : "HEVC is supported but not ideal for AE editing."; result.recommendedPresetId = "h264_high"; return result;
    }
    if ({ vp8: true, vp9: true, av1: true }[videoCodec] || { ".webm": true, ".mkv": true, ".mpeg": true, ".mpg": true, ".m2v": true, ".m2t": true, ".avi": true, ".wmv": true, ".asf": true, ".mxf": true }[ext]) {
      result.status = "needs_conversion"; result.reason = "This codec/container should be converted for reliable AE use."; result.recommendedPresetId = "h264_high"; return result;
    }
    return result;
  }

  function ytdlpArgsFor(payload, settings, folder) {
    var baseVideoFormat = "bv*[height<=2160]";
    var fallbackFormat = "b[height<=2160]/best[height<=2160]";
    var format = baseVideoFormat + "+ba/" + fallbackFormat;
    var args = ["--no-playlist", "--restrict-filenames", "--windows-filenames", "--newline", "--force-overwrites"];
    if (payload.quality === "best1080") {
      baseVideoFormat = "bv*[height<=1080]";
      fallbackFormat = "b[height<=1080]/best[height<=1080]";
      format = baseVideoFormat + "+ba/" + fallbackFormat;
    } else if (payload.quality === "best1440") {
      baseVideoFormat = "bv*[height<=1440]";
      fallbackFormat = "b[height<=1440]/best[height<=1440]";
      format = baseVideoFormat + "+ba/" + fallbackFormat;
    } else if (payload.quality === "best720") {
      baseVideoFormat = "bv*[height<=720]";
      fallbackFormat = "b[height<=720]/best[height<=720]";
      format = baseVideoFormat + "+ba/" + fallbackFormat;
    } else if (payload.quality === "best480") {
      baseVideoFormat = "bv*[height<=480]";
      fallbackFormat = "b[height<=480]/best[height<=480]";
      format = baseVideoFormat + "+ba/" + fallbackFormat;
    } else if (payload.quality === "best") {
      baseVideoFormat = "bestvideo";
      fallbackFormat = "best";
      format = baseVideoFormat + "+bestaudio/" + fallbackFormat;
    } else if (payload.quality === "audio") {
      format = "bestaudio/best";
    }
    if (payload.quality === "audio" && payload.selectedAudioFormat) {
      format = payload.selectedAudioFormat === "none" ? "bestaudio/best" : payload.selectedAudioFormat;
    } else if (payload.quality !== "audio" && (payload.selectedVideoFormat || payload.selectedAudioFormat)) {
      var selectedVideo = payload.selectedVideoFormat || baseVideoFormat;
      var selectedAudio = payload.selectedAudioFormat || "ba";
      if (selectedVideo === "worst") {
        format = "worst";
      } else if (selectedAudio === "none") {
        format = selectedVideo;
      } else {
        format = selectedVideo + "+" + selectedAudio + "/" + selectedVideo + "/" + fallbackFormat;
      }
    }
    args = args.concat(["-f", format]);
    if (payload.quality !== "audio") {
      args = args.concat(["--merge-output-format", "mp4"]);
    } else {
      args = args.concat(["--extract-audio", "--audio-format", "wav"]);
    }
    if (settings.ffmpegPath) {
      args = args.concat(["--ffmpeg-location", settings.ffmpegPath]);
    }
    if (settings.cookiesBrowser) {
      args = args.concat(["--cookies-from-browser", settings.cookiesBrowser]);
    }
    if (payload.downloadThumbnail) {
      args = args.concat(["--write-thumbnail", "--convert-thumbnails", "jpg"]);
    }
    args = args.concat(["--print", "after_move:filepath", "-o", settings.filenameTemplate || "%(title).80B-%(id)s.%(ext)s", "-P", folder.fsName, payload.url]);
    return args;
  }

  function runYtdlpWithArgs(args, settings, folder, label, jobId) {
    var temporaryFilesBefore = snapshotTemporaryFiles(folder);
    var executable = availableToolPath(settings.ytdlpPath, "yt-dlp");
    var result = runToolWithArgs(executable, args, label || "yt-dlp", settings, folder ? folder.fsName : "", jobId);
    if (result.cancelled) {
      cleanupNewTemporaryFiles(folder, temporaryFilesBefore);
      throw new Error("Download cancelled.");
    }
    if (result.ok !== true) {
      cleanupNewTemporaryFiles(folder, temporaryFilesBefore);
      throw new Error(result.output || result.error || ("yt-dlp failed with exit code " + result.exitCode + "."));
    }
    return result.internalOutput || "";
  }

  function spotifyArgsFor(payload, settings, folder) {
    var args = [payload.url, "-o", folder.fsName, "-c", "wav", "-y"];
    if (settings.spotifyClientId) {
      args = args.concat(["-i", settings.spotifyClientId]);
    }
    if (settings.spotifyClientSecret) {
      args = args.concat(["-s", settings.spotifyClientSecret]);
    }
    return args;
  }

  function runSpotifyDlp(payload, settings, folder) {
    var temporaryFilesBefore = snapshotTemporaryFiles(folder);
    var result = runToolWithArgs(settings.spotifyDlpPath || "spotify-dlp", spotifyArgsFor(payload, settings, folder), "spotify-dlp", settings, folder.fsName, payload.jobId || "");
    if (result.cancelled) {
      cleanupNewTemporaryFiles(folder, temporaryFilesBefore);
      throw new Error("Download cancelled.");
    }
    return result.internalOutput || "";
  }

  function tiktokArgsFor(payload, settings, folder) {
    var args = ["--no-playlist", "--restrict-filenames", "--windows-filenames", "--newline", "--force-overwrites"];
    if (payload.tiktokMode === "mp3") {
      args = args.concat(["-f", "bestaudio/best", "--extract-audio", "--audio-format", "mp3"]);
    } else {
      var format = "bestvideo*+bestaudio/best";
      if (payload.quality === "best2160") {
        format = "bv*[height<=2160]+ba/b[height<=2160]/best[height<=2160]/best";
      } else if (payload.quality === "best1440") {
        format = "bv*[height<=1440]+ba/b[height<=1440]/best[height<=1440]/best";
      } else if (payload.quality === "best1080") {
        format = "bv*[height<=1080]+ba/b[height<=1080]/best[height<=1080]/best";
      } else if (payload.quality === "best720") {
        format = "bv*[height<=720]+ba/b[height<=720]/best[height<=720]/best";
      } else if (payload.quality === "best480") {
        format = "bv*[height<=480]+ba/b[height<=480]/best[height<=480]/best";
      }
      args = args.concat(["-f", format, "-S", "res,fps,vbr,br,size", "--merge-output-format", "mp4"]);
    }
    if (settings.ffmpegPath) {
      args = args.concat(["--ffmpeg-location", settings.ffmpegPath]);
    }
    if (payload.downloadThumbnail) {
      args = args.concat(["--write-thumbnail", "--convert-thumbnails", "jpg"]);
    }
    args = args.concat(["--print", "after_move:filepath", "-o", settings.filenameTemplate || "%(title).80B-%(id)s-%(epoch)s.%(ext)s", "-P", folder.fsName, payload.url]);
    return args;
  }

  function tiktokApiScript() {
    var script = new File(settingsFolder().fsName + "/tiktok-api-download.ps1");
    script.encoding = "UTF-8";
    script.open("w");
    script.write("param([string]$Url, [string]$Mode, [string]$OutDir)\r\n");
    script.write("$ErrorActionPreference = 'Stop'\r\n");
    script.write("[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12\r\n");
    script.write("New-Item -ItemType Directory -Force -Path $OutDir | Out-Null\r\n");
    script.write("$encoded = [uri]::EscapeDataString($Url)\r\n");
    script.write("$apiUrl = \"https://www.tikwm.com/api/?url=$encoded&hd=1\"\r\n");
    script.write("$headers = @{ 'User-Agent' = 'Mozilla/5.0 Waves-Media-Downloader' }\r\n");
    script.write("$response = Invoke-RestMethod -Uri $apiUrl -Headers $headers\r\n");
    script.write("if ($response.code -ne 0 -and $response.msg) { throw $response.msg }\r\n");
    script.write("$data = $response.data\r\n");
    script.write("if (-not $data) { throw 'TikWM returned no media data.' }\r\n");
    script.write("$mediaUrl = $null\r\n");
    script.write("$ext = '.mp4'\r\n");
    script.write("if ($Mode -eq 'mp3') {\r\n");
    script.write("  $mediaUrl = $data.music\r\n");
    script.write("  $ext = '.mp3'\r\n");
    script.write("} else {\r\n");
    script.write("  $mediaUrl = $data.hdplay\r\n");
    script.write("  if (-not $mediaUrl) { $mediaUrl = $data.play }\r\n");
    script.write("  if (-not $mediaUrl) { $mediaUrl = $data.wmplay }\r\n");
    script.write("}\r\n");
    script.write("if (-not $mediaUrl) { throw 'TikWM did not expose a downloadable media URL.' }\r\n");
    script.write("$id = if ($data.id) { [string]$data.id } else { [string][DateTimeOffset]::Now.ToUnixTimeSeconds() }\r\n");
    script.write("$title = if ($data.title) { [string]$data.title } else { 'tiktok' }\r\n");
    script.write("$safeTitle = ($title -replace '[<>:\"/\\\\|?*\\x00-\\x1F]', '_').Trim()\r\n");
    script.write("if ($safeTitle.Length -gt 80) { $safeTitle = $safeTitle.Substring(0, 80) }\r\n");
    script.write("if (-not $safeTitle) { $safeTitle = 'tiktok' }\r\n");
    script.write("$out = Join-Path $OutDir ($safeTitle + '-' + $id + $ext)\r\n");
    script.write("Invoke-WebRequest -Uri $mediaUrl -Headers $headers -OutFile $out -UseBasicParsing\r\n");
    script.write("Write-Output '--- TikTok Info ---'\r\n");
    script.write("Write-Output ('ID: ' + $data.id)\r\n");
    script.write("Write-Output ('Author: ' + $data.author.nickname + ' (@' + $data.author.unique_id + ')')\r\n");
    script.write("Write-Output ('Title: ' + $data.title)\r\n");
    script.write("Write-Output ('Duration: ' + $data.duration + 's')\r\n");
    script.write("Write-Output ('Region: ' + $data.region)\r\n");
    script.write("Write-Output ('Size: ' + $data.size + ' bytes')\r\n");
    script.write("Write-Output ('HD Size: ' + $data.hd_size + ' bytes')\r\n");
    script.write("Write-Output ('Views: ' + $data.play_count)\r\n");
    script.write("Write-Output ('Likes: ' + $data.digg_count)\r\n");
    script.write("Write-Output ('Comments: ' + $data.comment_count)\r\n");
    script.write("Write-Output ('Favorites: ' + $data.collect_count)\r\n");
    script.write("Write-Output ('Shares: ' + $data.share_count)\r\n");
    script.write("Write-Output ('Downloads: ' + $data.download_count)\r\n");
    script.write("Write-Output '--- Download ---'\r\n");
    script.write("Write-Output ('TikWM media URL: ' + $mediaUrl)\r\n");
    script.write("Write-Output $out\r\n");
    script.close();
    return script;
  }

  function tiktokApiDownload(payload, folder) {
    var script = tiktokApiScript();
    var temporaryFilesBefore = snapshotTemporaryFiles(folder);
    var result = runToolWithArgs("powershell.exe", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      script.fsName,
      payload.url,
      payload.tiktokMode === "mp3" ? "mp3" : "video",
      folder.fsName
    ], "tiktok-api", readSettings(), folder.fsName, payload.jobId || "");
    if (result.cancelled) {
      cleanupNewTemporaryFiles(folder, temporaryFilesBefore);
      throw new Error("Download cancelled.");
    }
    var output = result.internalOutput || "";
    return {
      output: output,
      file: findDownloadedFile(output)
    };
  }

  function compactNumber(value) {
    if (value === null || value === undefined || value === "") {
      return "unknown";
    }
    return String(value);
  }

  function bytesLabel(value) {
    var bytes = Number(value || 0);
    if (!bytes || isNaN(bytes) || bytes < 1) {
      return "unknown";
    }
    var units = ["B", "KB", "MB", "GB"];
    var unit = 0;
    while (bytes >= 1024 && unit < units.length - 1) {
      bytes /= 1024;
      unit += 1;
    }
    return Math.round(bytes * 100) / 100 + " " + units[unit];
  }

  function bestTikTokFormat(data) {
    var formats = data.formats || [];
    var best = null;
    var bestScore = -1;
    for (var i = 0; i < formats.length; i += 1) {
      var format = formats[i];
      if (!format) {
        continue;
      }
      var width = Number(format.width || 0);
      var height = Number(format.height || 0);
      var filesize = Number(format.filesize || format.filesize_approx || 0);
      var bitrate = Number(format.tbr || format.vbr || 0);
      var score = (width * height) + (filesize / 1000) + (bitrate * 10);
      if (score > bestScore) {
        best = format;
        bestScore = score;
      }
    }
    return best || {};
  }

  function formatTimestamp(seconds) {
    if (!seconds || isNaN(seconds)) {
      return "";
    }
    var date = new Date(Number(seconds) * 1000);
    return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate()) + " " + pad2(date.getHours()) + ":" + pad2(date.getMinutes()) + ":" + pad2(date.getSeconds());
  }

  function formatYtdlpTikTokInfo(data) {
    var lines = [];
    var best = bestTikTokFormat(data);
    var width = data.width || best.width;
    var height = data.height || best.height;
    var filesize = data.filesize || data.filesize_approx || best.filesize || best.filesize_approx;
    var fps = data.fps || best.fps;
    var vcodec = data.vcodec || best.vcodec;
    var acodec = data.acodec || best.acodec;
    var ext = data.ext || best.ext;
    var formatId = data.format_id || best.format_id;
    var bitrate = data.tbr || best.tbr || best.vbr || best.abr;
    var author = data.uploader || data.channel || data.creator || "unknown";
    var authorId = data.uploader_id || data.channel_id || "";
    var thumbnail = bestThumbnailUrl(data);
    lines.push("VIDEO ANALYTICS");
    lines.push("Source: yt-dlp TikTok metadata");
    lines.push("Author: " + author + (authorId ? " (@" + authorId + ")" : ""));
    if (authorId) {
      lines.push("Uploader ID: " + authorId);
    }
    if (thumbnail) {
      lines.push("Thumbnail: " + thumbnail);
    }
    var created = formatTimestamp(data.timestamp || data.release_timestamp || data.modified_timestamp);
    if (created) {
      lines.push("Date: " + created);
    }
    lines.push("Title: " + (data.title || data.description || "untitled"));
    if (data.track || data.artist) {
      lines.push("Sound: " + (data.track || "unknown") + " - " + (data.artist || "unknown"));
    }
    lines.push("Duration: " + compactNumber(data.duration) + "s");
    lines.push("");
    lines.push("Views: " + compactNumber(data.view_count));
    lines.push("Likes: " + compactNumber(data.like_count));
    lines.push("Comments: " + compactNumber(data.comment_count));
    lines.push("Favorites: " + compactNumber(data.repost_count || data.favorite_count));
    lines.push("Shares: " + compactNumber(data.share_count || data.repost_count));
    lines.push("");
    lines.push("ID: " + compactNumber(data.id));
    lines.push("Region: " + compactNumber(data.location || data.availability));
    lines.push("Resolution: " + (width && height ? width + "x" + height : "unknown"));
    lines.push("FPS: " + compactNumber(fps));
    lines.push("Video codec: " + compactNumber(vcodec));
    lines.push("Audio codec: " + compactNumber(acodec));
    lines.push("Format: " + compactNumber(formatId) + (ext ? " / " + ext : ""));
    lines.push("Bitrate: " + (bitrate ? Math.round(Number(bitrate)) + " kbps" : "unknown"));
    lines.push("File size: " + bytesLabel(filesize));
    if (data.dynamic_range) {
      lines.push("Dynamic range: " + data.dynamic_range);
    }
    if (data.vqscore || data.vq_score) {
      lines.push("VQ Score: " + compactNumber(data.vqscore || data.vq_score));
    }
    var formats = (data.formats || []).slice(0);
    if (formats.length) {
      formats.sort(function (a, b) {
        return formatSortScore(b) - formatSortScore(a);
      });
      lines.push("");
      lines.push("Available versions:");
      for (var i = 0; i < formats.length; i += 1) {
        lines.push("- " + formatSummaryLine(formats[i]));
      }
    }
    return lines.join("\n");
  }

  function ytdlpTikTokInfo(url, settings) {
    var output = runYtdlpWithArgs(["--ignore-config", "--no-playlist", "--skip-download", "--dump-single-json", "--no-warnings", url], settings, null, "yt-dlp-tiktok-info");
    if (!output || !output.replace(/^\s+|\s+$/g, "")) {
      return "";
    }
    try {
      var data = parseJson(output);
      if (data && (data.id || data.title || data.uploader || data.view_count !== undefined)) {
        return formatYtdlpTikTokInfo(data);
      }
    } catch (error) {
      return "";
    }
    return "";
  }

  function ytdlpDumpJson(url, settings) {
    var args = ["--ignore-config", "--no-playlist", "--skip-download", "--dump-single-json", "--no-warnings"];
    if (settings.cookiesBrowser) {
      args = args.concat(["--cookies-from-browser", settings.cookiesBrowser]);
    }
    args.push(url);
    var output = runYtdlpWithArgs(args, settings, null, "yt-dlp-metadata");
    if (!output || !output.replace(/^\s+|\s+$/g, "")) {
      throw new Error("yt-dlp returned no metadata.");
    }
    try {
      return parseJson(output);
    } catch (error) {
      throw new Error("yt-dlp metadata could not be parsed.\n\nCommand output:\n" + output);
    }
  }

  function bestThumbnailUrl(data) {
    if (data.thumbnail) {
      return data.thumbnail;
    }
    var thumbnails = data.thumbnails || [];
    var best = "";
    var bestScore = -1;
    for (var i = 0; i < thumbnails.length; i += 1) {
      var thumb = thumbnails[i];
      if (!thumb || !thumb.url) {
        continue;
      }
      var score = Number(thumb.width || 0) * Number(thumb.height || 0);
      if (score >= bestScore) {
        best = thumb.url;
        bestScore = score;
      }
    }
    return best;
  }

  function bestFormatForPreview(data) {
    var formats = data.formats || [];
    var best = null;
    var bestScore = -1;
    for (var i = 0; i < formats.length; i += 1) {
      var format = formats[i];
      if (!format) {
        continue;
      }
      var width = Number(format.width || 0);
      var height = Number(format.height || 0);
      var filesize = Number(format.filesize || format.filesize_approx || 0);
      var score = (width * height) + (filesize / 1000) + (Number(format.tbr || 0) * 10);
      if (score > bestScore) {
        best = format;
        bestScore = score;
      }
    }
    return best || {};
  }

  function previewInfoFor(data) {
    var best = bestFormatForPreview(data);
    var width = data.width || best.width;
    var height = data.height || best.height;
    var filesize = data.filesize || data.filesize_approx || best.filesize || best.filesize_approx;
    return {
      title: data.title || data.fulltitle || data.description || "Untitled media",
      uploader: data.uploader || data.channel || data.creator || data.artist || "",
      duration: data.duration || "",
      resolution: width && height ? width + "x" + height : "",
      filesize: bytesLabel(filesize),
      thumbnail: bestThumbnailUrl(data),
      extractor: data.extractor_key || data.extractor || "",
      webpageUrl: data.webpage_url || data.original_url || ""
    };
  }

  function formatSummaryLine(format) {
    var pieces = [];
    pieces.push(format.format_id || "unknown");
    pieces.push(format.ext || "file");
    if (format.width && format.height) {
      pieces.push(format.width + "x" + format.height);
    } else if (format.resolution) {
      pieces.push(format.resolution);
    }
    if (format.fps) {
      pieces.push(format.fps + "fps");
    }
    if (format.vcodec && format.vcodec !== "none") {
      pieces.push("video " + format.vcodec);
    }
    if (format.acodec && format.acodec !== "none") {
      pieces.push("audio " + format.acodec);
    }
    if (format.filesize || format.filesize_approx) {
      pieces.push(bytesLabel(format.filesize || format.filesize_approx));
    }
    return pieces.join(" | ");
  }

  function formatSortScore(format) {
    return (Number(format.width || 0) * Number(format.height || 0)) +
      (Number(format.filesize || format.filesize_approx || 0) / 1000) +
      (Number(format.tbr || format.vbr || format.abr || 0) * 10);
  }

  function formatLabelForSelect(format) {
    var pieces = [];
    if (format.width && format.height) {
      pieces.push(format.width + "x" + format.height);
    } else if (format.resolution && format.resolution !== "audio only") {
      pieces.push(format.resolution);
    } else {
      pieces.push(format.acodec && format.acodec !== "none" ? "Audio" : "Format");
    }
    if (format.vcodec && format.vcodec !== "none") {
      pieces.push(String(format.vcodec).split(".")[0].toUpperCase());
    }
    if (format.fps) {
      pieces.push(format.fps + " FPS");
    }
    if (format.acodec && format.acodec !== "none" && (!format.vcodec || format.vcodec === "none")) {
      pieces.push(String(format.acodec).split(".")[0].toUpperCase());
    } else if (format.acodec && format.acodec !== "none" && format.vcodec && format.vcodec !== "none") {
      pieces.push("audio " + String(format.acodec).split(".")[0].toUpperCase());
    }
    if (format.language) {
      pieces.push(format.language);
    }
    if (format.tbr || format.vbr || format.abr) {
      pieces.push(Math.round(Number(format.tbr || format.vbr || format.abr)) + "k");
    }
    if (format.filesize || format.filesize_approx) {
      pieces.push(bytesLabel(format.filesize || format.filesize_approx));
    }
    pieces.push("(" + (format.format_id || "unknown") + ")");
    return pieces.join(" | ");
  }

  function uniqueFormatOptions(formats, wantAudioOnly) {
    var seen = {};
    var result = [];
    for (var i = 0; i < formats.length; i += 1) {
      var format = formats[i];
      if (!format || !format.format_id || seen[format.format_id]) {
        continue;
      }
      var hasVideo = format.vcodec && format.vcodec !== "none";
      var hasAudio = format.acodec && format.acodec !== "none";
      if (wantAudioOnly) {
        if (!hasAudio || hasVideo) {
          continue;
        }
      } else if (!hasVideo) {
        continue;
      }
      seen[format.format_id] = true;
      result.push({
        id: String(format.format_id),
        label: formatLabelForSelect(format)
      });
    }
    return result;
  }

  function discoverFormatsFor(data) {
    var formats = (data.formats || []).slice(0);
    formats.sort(function (a, b) {
      return formatSortScore(b) - formatSortScore(a);
    });
    var video = uniqueFormatOptions(formats, false);
    var audio = uniqueFormatOptions(formats, true);
    if (video.length > 80) {
      video = video.slice(0, 80);
    }
    if (audio.length > 50) {
      audio = audio.slice(0, 50);
    }
    var heights = {};
    for (var h = 0; h < formats.length; h += 1) {
      var height = Number(formats[h].height || 0);
      if (height > 0) {
        heights[height] = true;
      }
    }
    var presets = [
      { height: 2160, value: "best2160", label: "Best quality up to 4K" },
      { height: 1440, value: "best1440", label: "Best quality up to 1440p" },
      { height: 1080, value: "best1080", label: "Best quality up to 1080p" },
      { height: 720, value: "best720", label: "Best quality up to 720p" },
      { height: 480, value: "best480", label: "Best quality up to 480p" }
    ];
    var resolutionOptions = [{ value: "best", label: "Best available" }];
    for (var p = 0; p < presets.length; p += 1) {
      var available = false;
      for (var knownHeight in heights) {
        if (heights.hasOwnProperty(knownHeight) && Number(knownHeight) >= presets[p].height) {
          available = true;
        }
      }
      if (available) {
        resolutionOptions.push({ value: presets[p].value, label: presets[p].label });
      }
    }
    return {
      preview: previewInfoFor(data),
      videoFormats: video,
      audioFormats: audio,
      resolutionOptions: resolutionOptions,
      info: formatInfoFor(data)
    };
  }

  function formatInfoFor(data) {
    var lines = [];
    lines.push("Title: " + (data.title || "untitled"));
    lines.push("Uploader: " + (data.uploader || data.channel || data.creator || "unknown"));
    if (data.duration) {
      lines.push("Duration: " + data.duration + "s");
    }
    lines.push("");
    lines.push("Best available formats:");
    var formats = (data.formats || []).slice(0);
    formats.sort(function (a, b) {
      var aScore = (Number(a.width || 0) * Number(a.height || 0)) + (Number(a.filesize || a.filesize_approx || 0) / 1000) + (Number(a.tbr || 0) * 10);
      var bScore = (Number(b.width || 0) * Number(b.height || 0)) + (Number(b.filesize || b.filesize_approx || 0) / 1000) + (Number(b.tbr || 0) * 10);
      return bScore - aScore;
    });
    var count = Math.min(formats.length, 12);
    for (var i = 0; i < count; i += 1) {
      lines.push("- " + formatSummaryLine(formats[i]));
    }
    if (!count) {
      lines.push("- No individual format list returned.");
    }
    return lines.join("\n");
  }

  function tiktokInfoScript() {
    var script = new File(settingsFolder().fsName + "/tiktok-info.ps1");
    script.encoding = "UTF-8";
    script.open("w");
    script.write("param([string]$Url, [string]$OutputPath)\r\n");
    script.write("$ErrorActionPreference = 'Stop'\r\n");
    script.write("[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12\r\n");
    script.write("$script:lines = @()\r\n");
    script.write("function Text($value) { if ($null -eq $value) { return '' }; return [string]$value }\r\n");
    script.write("function OutLine($value) { $script:lines += (Text $value) }\r\n");
    script.write("function FirstText($items) { foreach ($item in $items) { $text = Text $item; if ($text) { return $text } }; return '' }\r\n");
    script.write("function SizeLine([string]$label, $bytes) { $n = 0; if ([int64]::TryParse((Text $bytes), [ref]$n) -and $n -gt 0) { return ('{0}: {1} MB ({2} bytes)' -f $label, ([Math]::Round($n / 1MB, 2)), $n) }; return ('{0}: unknown' -f $label) }\r\n");
    script.write("try {\r\n");
    script.write("  $encoded = [uri]::EscapeDataString($Url.Trim())\r\n");
    script.write("  $apiUrl = \"https://www.tikwm.com/api/?url=$encoded&hd=1\"\r\n");
    script.write("  $headers = @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36'; 'Accept' = 'application/json,text/plain,*/*'; 'Referer' = 'https://www.tikwm.com/' }\r\n");
    script.write("  $raw = Invoke-WebRequest -Uri $apiUrl -Headers $headers -UseBasicParsing\r\n");
    script.write("  $response = $raw.Content | ConvertFrom-Json\r\n");
    script.write("  if ($response.code -ne 0) { $message = FirstText @($response.msg, $response.message, $response.error); if (-not $message) { $message = 'TikWM returned code ' + $response.code }; throw $message }\r\n");
    script.write("  $data = $response.data\r\n");
    script.write("  if (-not $data) { throw 'TikWM returned no data object for this URL.' }\r\n");
    script.write("  $author = $data.author\r\n");
    script.write("  $music = $data.music_info\r\n");
    script.write("  $created = ''\r\n");
    script.write("  if ($data.create_time) { $created = [DateTimeOffset]::FromUnixTimeSeconds([int64]$data.create_time).LocalDateTime.ToString('yyyy-MM-dd HH:mm:ss') }\r\n");
    script.write("  OutLine 'VIDEO ANALYTICS'\r\n");
    script.write("  OutLine 'Source: TikWM public metadata'\r\n");
    script.write("  OutLine ('Author: ' + (FirstText @($author.nickname, $author.unique_id, $data.author_name, 'unknown')) + ' (@' + (FirstText @($author.unique_id, $author.id, 'unknown')) + ')')\r\n");
    script.write("  if ($created) { OutLine ('Date: ' + $created) }\r\n");
    script.write("  OutLine ('Title: ' + (FirstText @($data.title, $data.desc, 'untitled')))\r\n");
    script.write("  OutLine ('Sound: ' + (FirstText @($music.title, $data.music, 'unknown')) + ' - ' + (FirstText @($music.author, $music.owner, 'unknown')))\r\n");
    script.write("  OutLine ('Duration: ' + (FirstText @($data.duration, $data.video.duration, 'unknown')) + 's')\r\n");
    script.write("  OutLine ''\r\n");
    script.write("  OutLine ('Views: ' + (FirstText @($data.play_count, $data.stats.playCount, 'unknown')))\r\n");
    script.write("  OutLine ('Likes: ' + (FirstText @($data.digg_count, $data.stats.diggCount, 'unknown')))\r\n");
    script.write("  OutLine ('Comments: ' + (FirstText @($data.comment_count, $data.stats.commentCount, 'unknown')))\r\n");
    script.write("  OutLine ('Favorites: ' + (FirstText @($data.collect_count, $data.stats.collectCount, 'unknown')))\r\n");
    script.write("  OutLine ('Shares: ' + (FirstText @($data.share_count, $data.stats.shareCount, 'unknown')))\r\n");
    script.write("  OutLine ('Downloads: ' + (FirstText @($data.download_count, 'unknown')))\r\n");
    script.write("  OutLine ''\r\n");
    script.write("  OutLine ('ID: ' + (FirstText @($data.id, $data.aweme_id, 'unknown')))\r\n");
    script.write("  OutLine ('Region: ' + (FirstText @($data.region, $data.locationCreated, 'unknown')))\r\n");
    script.write("  OutLine (SizeLine 'File size' $data.size)\r\n");
    script.write("  OutLine (SizeLine 'HD file size' $data.hd_size)\r\n");
    script.write("} catch {\r\n");
    script.write("  OutLine ('TikTok info failed: ' + $_.Exception.Message)\r\n");
    script.write("  OutLine 'The public TikWM metadata endpoint did not return usable analytics for this URL.'\r\n");
    script.write("}\r\n");
    script.write("if ($OutputPath) { Set-Content -LiteralPath $OutputPath -Value $script:lines -Encoding UTF8 } else { $script:lines | ForEach-Object { Write-Output $_ } }\r\n");
    script.close();
    return script;
  }

  function tiktokInfoFor(url, settings) {
    var ytInfo = ytdlpTikTokInfo(url, settings || readSettings());
    if (ytInfo && ytInfo.replace(/^\s+|\s+$/g, "")) {
      return ytInfo;
    }

    var script = tiktokInfoScript();
    var folder = settingsFolder();
    var outputFile = new File(folder.fsName + "/tiktok-info-output.txt");
    if (outputFile.exists) {
      outputFile.remove();
    }

    var directResult = runToolWithArgs("powershell.exe", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      script.fsName,
      url,
      outputFile.fsName
    ], "tiktok-info-helper", settings, folder.fsName);
    var directOutput = directResult.output || "";
    var fileOutput = readTextFile(outputFile);
    if (fileOutput && fileOutput.replace(/^\s+|\s+$/g, "")) {
      return fileOutput;
    }
    if (directOutput && directOutput.replace(/^\s+|\s+$/g, "")) {
      return directOutput;
    }
    return "TikTok info failed: the metadata helper returned no output.\nThe TikWM endpoint may be blocked from After Effects on this machine, or PowerShell could not run the helper script.";
  }

  function ytdlpTikTokDownload(payload, settings, folder) {
    var output = runYtdlpWithArgs(tiktokArgsFor(payload, settings, folder), settings, folder, "yt-dlp-tiktok", payload.jobId || "");
    return {
      output: output,
      file: findDownloadedFile(output)
    };
  }

  function largerFile(a, b) {
    if (a && b) {
      return a.length >= b.length ? a : b;
    }
    return a || b;
  }

  function isTikTokUrl(value) {
    value = String(value || "");
    return /^https?:\/\/([^\/]+\.)?tiktok\.com\//i.test(value) ||
      /^https?:\/\/v[mt]\.tiktok\.com\//i.test(value);
  }

  function isYouTubeUrl(value) {
    return /^https?:\/\/([^\/]+\.)?(youtube\.com|youtu\.be)\//i.test(String(value || ""));
  }

  function isTikTokVideoUrl(value) {
    value = String(value || "");
    return /^https?:\/\/vm\.tiktok\.com\/[^\/?#]+/i.test(value) ||
      /^https?:\/\/vt\.tiktok\.com\/[^\/?#]+/i.test(value) ||
      /^https?:\/\/www\.tiktok\.com\/@[^\/]+\/video\/\d+/i.test(value) ||
      /^https?:\/\/www\.tiktok\.com\/t\/[^\/?#]+/i.test(value);
  }

  function isSpotifyUrl(value) {
    return /^https?:\/\/open\.spotify\.com\//i.test(String(value || ""));
  }

  function validateSourcePayload(payload) {
    var url = String(payload.url || "").replace(/^\s+|\s+$/g, "");
    if (!url) {
      throw new Error("Missing input.");
    }
    if (payload.source === "youtube" && !isYouTubeUrl(url)) {
      throw new Error("YouTube mode needs a youtube.com or youtu.be URL.");
    }
    if (payload.source === "tiktok" && (!isTikTokUrl(url) || !isTikTokVideoUrl(url))) {
      throw new Error("TikTok mode needs a specific TikTok video/share URL.");
    }
    if (payload.source === "spotify" && /^https?:\/\//i.test(url) && !isSpotifyUrl(url)) {
      throw new Error("Spotify mode accepts Spotify URLs or artist/song searches.");
    }
    if (payload.source === "other" && !/^https?:\/\//i.test(url)) {
      throw new Error("Other Sites mode needs a media URL supported by yt-dlp.");
    }
  }

  function cleanSpotifyUrl(value) {
    value = String(value || "").replace(/^\s+|\s+$/g, "");
    return value.replace(/[?#].*$/, "");
  }

  function spotifyOembedScript() {
    var script = new File(settingsFolder().fsName + "/spotify-oembed-title.ps1");
    script.encoding = "UTF-8";
    script.open("w");
    script.write("param([string]$Url)\r\n");
    script.write("$ErrorActionPreference = 'Stop'\r\n");
    script.write("Add-Type -AssemblyName System.Web\r\n");
    script.write("[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12\r\n");
    script.write("$encoded = [uri]::EscapeDataString($Url)\r\n");
    script.write("$headers = @{ 'User-Agent' = 'Mozilla/5.0 Waves-Media-Downloader' }\r\n");
    script.write("$lookupErrors = @()\r\n");
    script.write("try {\r\n");
    script.write("  $songlink = Invoke-RestMethod -Uri \"https://api.song.link/v1-alpha.1/links?url=$encoded&userCountry=US\" -Headers $headers\r\n");
    script.write("  $entity = $null\r\n");
    script.write("  foreach ($property in $songlink.entitiesByUniqueId.PSObject.Properties) {\r\n");
    script.write("    if ($property.Name -like 'SPOTIFY_SONG*') { $entity = $property.Value; break }\r\n");
    script.write("  }\r\n");
    script.write("  if (-not $entity) {\r\n");
    script.write("    foreach ($property in $songlink.entitiesByUniqueId.PSObject.Properties) {\r\n");
    script.write("      if ($property.Value.title) { $entity = $property.Value; break }\r\n");
    script.write("    }\r\n");
    script.write("  }\r\n");
    script.write("  if ($entity -and $entity.title) {\r\n");
    script.write("    if ($entity.artistName) { Write-Output (($entity.artistName + ' ' + $entity.title).Trim()); exit 0 }\r\n");
    script.write("    Write-Output $entity.title; exit 0\r\n");
    script.write("  }\r\n");
    script.write("  $lookupErrors += 'Songlink returned no readable song entity.'\r\n");
    script.write("}\r\n");
    script.write("catch {\r\n");
    script.write("  $lookupErrors += ('Songlink: ' + $_.Exception.Message)\r\n");
    script.write("}\r\n");
    script.write("try {\r\n");
    script.write("  $data = Invoke-RestMethod -Uri \"https://open.spotify.com/oembed?url=$encoded\" -Headers $headers\r\n");
    script.write("  if ($data.title) { Write-Output $data.title; exit 0 }\r\n");
    script.write("  $lookupErrors += 'Spotify oEmbed returned no title.'\r\n");
    script.write("}\r\n");
    script.write("catch {\r\n");
    script.write("  $lookupErrors += ('oEmbed: ' + $_.Exception.Message)\r\n");
    script.write("}\r\n");
    script.write("try {\r\n");
    script.write("  $page = Invoke-WebRequest -Uri $Url -Headers $headers -UseBasicParsing\r\n");
    script.write("  $html = $page.Content\r\n");
    script.write("  if ($html -match '<title>(.*?)</title>') {\r\n");
    script.write("    $title = [System.Web.HttpUtility]::HtmlDecode($matches[1])\r\n");
    script.write("    $title = $title -replace '\\s*\\|\\s*Spotify\\s*$', ''\r\n");
    script.write("    $title = $title -replace '\\s+-\\s+song and lyrics by\\s+', ' '\r\n");
    script.write("    $title = $title -replace '\\s+-\\s+Single by\\s+', ' '\r\n");
    script.write("    if ($title.Trim()) { Write-Output $title.Trim(); exit 0 }\r\n");
    script.write("  }\r\n");
    script.write("  if ($html -match '<meta\\s+property=\"og:title\"\\s+content=\"([^\"]+)\"') {\r\n");
    script.write("    $title = [System.Web.HttpUtility]::HtmlDecode($matches[1])\r\n");
    script.write("    if ($title.Trim()) { Write-Output $title.Trim(); exit 0 }\r\n");
    script.write("  }\r\n");
    script.write("  $lookupErrors += 'Spotify page had no readable title metadata.'\r\n");
    script.write("}\r\n");
    script.write("catch {\r\n");
    script.write("  $lookupErrors += ('Page: ' + $_.Exception.Message)\r\n");
    script.write("}\r\n");
    script.write("Write-Output ('__SPOTIFY_LOOKUP_ERROR__ ' + ($lookupErrors -join ' | '))\r\n");
    script.write("exit 1\r\n");
    script.close();
    return script;
  }

  function resolveEasySpotifyQuery(input) {
    input = String(input || "").replace(/^\s+|\s+$/g, "");
    if (!isSpotifyUrl(input)) {
      return input;
    }

    var cleanUrl = cleanSpotifyUrl(input);
    var script = spotifyOembedScript();
    var result = runToolWithArgs("powershell.exe", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      script.fsName,
      cleanUrl
    ], "spotify-title-helper", readSettings(), settingsFolder().fsName);
    var title = (result.output || "").replace(/^\s+|\s+$/g, "");
    if (!title || /^__SPOTIFY_LOOKUP_ERROR__/i.test(title)) {
      title = title.replace(/^__SPOTIFY_LOOKUP_ERROR__\s*/i, "");
      throw new Error("Could not resolve a title from the Spotify URL" + (title ? ": " + title : ".") + "\n\nTry pasting the artist and song title instead, or use Full Spotify metadata mode.");
    }
    return title;
  }

  function spotifySearchArgsFor(query, settings, folder) {
    var args = ["--restrict-filenames", "--windows-filenames", "--newline", "--force-overwrites", "-f", "bestaudio/best", "--extract-audio", "--audio-format", "wav"];
    if (settings.ffmpegPath) {
      args = args.concat(["--ffmpeg-location", settings.ffmpegPath]);
    }
    if (settings.cookiesBrowser) {
      args = args.concat(["--cookies-from-browser", settings.cookiesBrowser]);
    }
    args = args.concat(["--print", "after_move:filepath", "-P", folder.fsName, "ytsearch1:" + query]);
    return args;
  }

  function spotifyEasyCommandFor(payload, settings, folder) {
    var query = resolveEasySpotifyQuery(payload.url);
    return {
      args: spotifySearchArgsFor(query, settings, folder),
      query: query
    };
  }

  function spotifyDlpResolvedQuery(output) {
    var clean = stripAnsi(output);
    var match = /Searching\s+for\s+track\s+["“]([^"”]+)["”]/i.exec(clean);
    if (match && match[1]) {
      return match[1].replace(/^\s+|\s+$/g, "");
    }

    match = /^\s*\d+\.\s+(.+)$/m.exec(clean);
    if (match && match[1]) {
      var title = match[1]
        .replace(/\s*\([^)]+\)\s*$/g, "")
        .replace(/^\s+|\s+$/g, "");
      return title;
    }

    return "";
  }

  function spotifyAuthLauncherFor(settings) {
    var completeFile = new File(settingsFolder().fsName + "/spotify-auth-complete.txt");
    if (completeFile.exists) {
      completeFile.remove();
    }
    var authArgs = ["--auth"];
    if (settings.spotifyClientId) {
      authArgs = authArgs.concat(["-i", settings.spotifyClientId]);
    }
    if (settings.spotifyClientSecret) {
      authArgs = authArgs.concat(["-s", settings.spotifyClientSecret]);
    }
    if ($.os.toLowerCase().indexOf("windows") >= 0) {
      var runner = runnerScriptFile();
      if (!runner.exists) {
        throw new Error("Waves command runner is missing.");
      }
      var payloadFile = new File(settingsFolder().fsName + "/spotify-auth-payload.json");
      payloadFile.encoding = "UTF-8";
      payloadFile.open("w");
      payloadFile.write(toJson({
        operation: "runTool",
        executable: settings.spotifyDlpPath || "spotify-dlp",
        arguments: authArgs,
        workingDirectory: settingsFolder().fsName
      }));
      payloadFile.close();
      var launcher = new File(settingsFolder().fsName + "/spotify-auth.cmd");
      launcher.encoding = "UTF-8";
      launcher.open("w");
      launcher.write("@echo off\r\n");
      launcher.write("echo Starting spotify-dlp authentication...\r\n");
      launcher.write("powershell.exe -NoProfile -ExecutionPolicy Bypass -File " + quoteArg(runner.fsName) + " -PayloadPath " + quoteArg(payloadFile.fsName) + "\r\n");
      launcher.write("echo completed > " + quoteArg(completeFile.fsName) + "\r\n");
      launcher.write("echo.\r\n");
      launcher.write("echo Authentication command finished. You can close this window.\r\n");
      launcher.write("pause\r\n");
      launcher.close();
      return launcher;
    }
    return null;
  }

  function ytdlpUpdateCheckScript() {
    var script = new File(settingsFolder().fsName + "/check-ytdlp-update.ps1");
    script.encoding = "UTF-8";
    script.open("w");
    script.write("param([string]$YtdlpPath, [string]$OutputPath)\r\n");
    script.write("$ErrorActionPreference = 'Stop'\r\n");
    script.write("[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12\r\n");
    script.write("function ToJson($value) { $value | ConvertTo-Json -Compress -Depth 4 }\r\n");
    script.write("function Finish($value) { $json = ToJson $value; if ($OutputPath) { Set-Content -LiteralPath $OutputPath -Value $json -Encoding UTF8 } else { Write-Output $json } }\r\n");
    script.write("function Score([string]$version) { $parts = @($version -split '[^0-9]+' | Where-Object { $_ }); $score = [int64]0; $weights = @(1000000000,1000000,1000,1); for ($i=0; $i -lt $parts.Count -and $i -lt $weights.Count; $i++) { $score += ([int64]$parts[$i]) * $weights[$i] }; return $score }\r\n");
    script.write("function FindExe([string]$name) { $cmd = Get-Command $name -ErrorAction SilentlyContinue; if ($cmd) { return $cmd.Source }; foreach ($root in @((Join-Path $env:APPDATA 'Python'), (Join-Path $env:LOCALAPPDATA 'Programs\\Python'))) { if (Test-Path $root) { $match = Get-ChildItem -Path $root -Recurse -Filter $name -File -ErrorAction SilentlyContinue | Select-Object -First 1; if ($match) { return $match.FullName } } }; return '' }\r\n");
    script.write("function TryVersion([scriptblock]$Block, [string]$Name) { try { $global:LASTEXITCODE = 0; $out = & $Block 2>&1 | Select-Object -First 1; if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) { $text = ([string]$out).Trim(); if ($text) { return @{ ok=$true; name=$Name; version=$text } } }; return @{ ok=$false; name=$Name; output=([string]$out) } } catch { return @{ ok=$false; name=$Name; output=$_.Exception.Message } } }\r\n");
    script.write("try {\r\n");
    script.write("  $versionAttempts = @()\r\n");
    script.write("  $foundExe = FindExe 'yt-dlp.exe'\r\n");
    script.write("  $versionAttempts += TryVersion { & $YtdlpPath --version } ('configured yt-dlp: ' + $YtdlpPath)\r\n");
    script.write("  if (-not $versionAttempts[-1].ok) { $versionAttempts += TryVersion { yt-dlp --version } 'yt-dlp on PATH' }\r\n");
    script.write("  if (-not $versionAttempts[-1].ok -and $foundExe) { $versionAttempts += TryVersion { & $foundExe --version } ('found yt-dlp.exe: ' + $foundExe) }\r\n");
    script.write("  if (-not $versionAttempts[-1].ok) { $versionAttempts += TryVersion { python -m yt_dlp --version } 'python -m yt_dlp' }\r\n");
    script.write("  if (-not $versionAttempts[-1].ok) { $versionAttempts += TryVersion { py -m yt_dlp --version } 'py -m yt_dlp' }\r\n");
    script.write("  $versionResult = $versionAttempts | Where-Object { $_.ok } | Select-Object -First 1\r\n");
    script.write("  if (-not $versionResult -and $foundExe) { Finish @{ ok=$true; available=$false; installNeeded=$false; currentVersion='found, version unknown'; latestVersion='unknown'; ytdlpPath=$foundExe; log=($versionAttempts | ConvertTo-Json -Compress -Depth 4) }; return }\r\n");
    script.write("  if (-not $versionResult) { Finish @{ ok=$true; available=$true; installNeeded=$true; currentVersion='not installed'; latestVersion='install yt-dlp'; log=($versionAttempts | ConvertTo-Json -Compress -Depth 4) }; return }\r\n");
    script.write("  $current = $versionResult.version\r\n");
    script.write("  $latest = ''\r\n");
    script.write("  try { $release = Invoke-RestMethod -Uri 'https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest' -Headers @{ 'User-Agent'='Waves-Media-Downloader' } -TimeoutSec 12; $latest = ([string]$release.tag_name).TrimStart('v') } catch { $latest = '' }\r\n");
    script.write("  if ($latest) { Finish @{ ok=$true; currentVersion=$current; latestVersion=$latest; available=((Score $latest) -gt (Score $current)); method='github'; command=$versionResult.name; ytdlpPath=$foundExe }; return }\r\n");
    script.write("  Finish @{ ok=$true; currentVersion=$current; latestVersion='unknown'; available=$false; method='offline'; command=$versionResult.name; ytdlpPath=$foundExe }\r\n");
    script.write("} catch {\r\n");
    script.write("  Finish @{ ok=$false; silent=$true; error=$_.Exception.Message }\r\n");
    script.write("}\r\n");
    script.close();
    return script;
  }

  function ytdlpUpdateInstallScript() {
    var script = new File(settingsFolder().fsName + "/install-ytdlp-update.ps1");
    script.encoding = "UTF-8";
    script.open("w");
    script.write("param([string]$YtdlpPath, [string]$OutputPath)\r\n");
    script.write("$ErrorActionPreference = 'Continue'\r\n");
    script.write("function Finish($value) { $json = $value | ConvertTo-Json -Compress -Depth 4; if ($OutputPath) { Set-Content -LiteralPath $OutputPath -Value $json -Encoding UTF8 } else { Write-Output $json } }\r\n");
    script.write("function FindExe([string]$name) { $cmd = Get-Command $name -ErrorAction SilentlyContinue; if ($cmd) { return $cmd.Source }; foreach ($root in @((Join-Path $env:APPDATA 'Python'), (Join-Path $env:LOCALAPPDATA 'Programs\\Python'))) { if (Test-Path $root) { $match = Get-ChildItem -Path $root -Recurse -Filter $name -File -ErrorAction SilentlyContinue | Select-Object -First 1; if ($match) { return $match.FullName } } }; return '' }\r\n");
    script.write("function TryRun([scriptblock]$Block, [string]$Name) { try { $global:LASTEXITCODE = 0; $out = & $Block 2>&1 | Out-String; if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) { return @{ ok=$true; name=$Name; output=$out } }; return @{ ok=$false; name=$Name; output=$out } } catch { return @{ ok=$false; name=$Name; output=$_.Exception.Message } } }\r\n");
    script.write("$attempts = @()\r\n");
    script.write("$existingExe = FindExe 'yt-dlp.exe'\r\n");
    script.write("if ($YtdlpPath -and $YtdlpPath -ne 'yt-dlp') { $attempts += TryRun { & $YtdlpPath -U } ('yt-dlp self-update: ' + $YtdlpPath) }\r\n");
    script.write("if ($attempts.Count -lt 1 -and $existingExe) { $attempts += TryRun { & $existingExe -U } ('yt-dlp self-update: ' + $existingExe) }\r\n");
    script.write("if ($attempts.Count -lt 1) { $attempts += TryRun { yt-dlp -U } 'yt-dlp -U on PATH' }\r\n");
    script.write("if (-not $attempts[-1].ok -or $attempts[-1].output -match 'pip|package manager|not installed using|not recognized|not found') { $attempts += TryRun { python -m pip install --user --upgrade yt-dlp } 'python -m pip install --user --upgrade yt-dlp' }\r\n");
    script.write("if (-not $attempts[-1].ok) { $attempts += TryRun { py -m pip install --upgrade yt-dlp } 'py -m pip install --upgrade yt-dlp' }\r\n");
    script.write("$success = $false\r\n");
    script.write("foreach ($attempt in $attempts) { if ($attempt.ok) { $success = $true; break } }\r\n");
    script.write("$ytdlpExe = FindExe 'yt-dlp.exe'\r\n");
    script.write("$log = ($attempts | ForEach-Object { '[' + $_.name + \"]`r`n\" + $_.output }) -join \"`r`n\"\r\n");
    script.write("if ($success) { Finish @{ ok=$true; log=$log; ytdlpPath=$ytdlpExe } } else { Finish @{ ok=$false; error='Could not update yt-dlp automatically.'; log=$log; ytdlpPath=$ytdlpExe } }\r\n");
    script.close();
    return script;
  }

  function dependencyUpdateScript() {
    var script = new File(settingsFolder().fsName + "/update-dependencies.ps1");
    script.encoding = "UTF-8";
    script.open("w");
    script.write("$ErrorActionPreference = 'Continue'\r\n");
    script.write("[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12\r\n");
    script.write("function FindExe([string]$name) { $cmd = Get-Command $name -ErrorAction SilentlyContinue; if ($cmd) { return $cmd.Source }; foreach ($root in @((Join-Path $env:APPDATA 'Python'), (Join-Path $env:LOCALAPPDATA 'Programs\\Python'))) { if (Test-Path $root) { $match = Get-ChildItem -Path $root -Recurse -Filter $name -File -ErrorAction SilentlyContinue | Select-Object -First 1; if ($match) { return $match.FullName } } }; return '' }\r\n");
    script.write("function Run($label, $block) { Write-Output ('--- ' + $label + ' ---'); try { & $block 2>&1 | Out-String | Write-Output } catch { Write-Output $_.Exception.Message } }\r\n");
    script.write("function DownloadTrusted([string]$uri, [string]$checksumUri, [string]$outFile) { foreach ($candidate in @($uri, $checksumUri)) { $u = [Uri]$candidate; if ($u.Scheme -ne 'https' -or $u.Host.ToLowerInvariant() -ne 'www.gyan.dev') { throw ('Refusing unapproved FFmpeg source: ' + $candidate) } }; $checksumText = [string](Invoke-WebRequest -Uri $checksumUri -UseBasicParsing).Content; $match = [regex]::Match($checksumText, '(?i)(?<![0-9a-f])[0-9a-f]{64}(?![0-9a-f])'); if (-not $match.Success) { throw 'Published FFmpeg checksum was missing or invalid.' }; Invoke-WebRequest -Uri $uri -OutFile $outFile -UseBasicParsing; $hash = (Get-FileHash -LiteralPath $outFile -Algorithm SHA256).Hash.ToLowerInvariant(); if ($hash -ne $match.Value.ToLowerInvariant()) { Remove-Item -LiteralPath $outFile -Force -ErrorAction SilentlyContinue; throw 'FFmpeg failed SHA-256 verification.' }; Write-Output ('Verified FFmpeg SHA-256: ' + $hash) }\r\n");
    script.write("Run 'yt-dlp' { if (Get-Command yt-dlp -ErrorAction SilentlyContinue) { yt-dlp -U } elseif (Get-Command py -ErrorAction SilentlyContinue) { py -m pip install --user --upgrade yt-dlp } else { python -m pip install --user --upgrade yt-dlp } }\r\n");
    script.write("Run 'spotify-dlp' { if (Get-Command py -ErrorAction SilentlyContinue) { py -m pip install --user --upgrade spotify-dlp } else { python -m pip install --user --upgrade spotify-dlp } }\r\n");
    script.write("$ffRoot = Join-Path $env:LOCALAPPDATA 'Waves Media Downloader\\ffmpeg'\r\n");
    script.write("$ffZip = Join-Path $env:TEMP 'ffmpeg-release-essentials.zip'\r\n");
    script.write("Run 'FFmpeg' { $stage = Join-Path $env:TEMP ('waves-ffmpeg-stage-' + [guid]::NewGuid().ToString('N')); $backup = ''; $createdRoot = $false; try { New-Item -ItemType Directory -Force -Path $stage | Out-Null; DownloadTrusted 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip' 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip.sha256' $ffZip; Expand-Archive -Path $ffZip -DestinationPath $stage -Force; $ffmpeg = Get-ChildItem -Path $stage -Recurse -Filter 'ffmpeg.exe' -File -ErrorAction SilentlyContinue | Select-Object -First 1; $ffprobe = Get-ChildItem -Path $stage -Recurse -Filter 'ffprobe.exe' -File -ErrorAction SilentlyContinue | Select-Object -First 1; if (-not $ffmpeg -or -not $ffprobe) { throw 'FFmpeg archive did not contain ffmpeg.exe and ffprobe.exe.' }; if (Test-Path -LiteralPath $ffRoot) { $backup = $ffRoot + '-backup-' + [guid]::NewGuid().ToString('N'); Move-Item -LiteralPath $ffRoot -Destination $backup }; New-Item -ItemType Directory -Force -Path $ffRoot | Out-Null; $createdRoot = $true; Copy-Item -Path (Join-Path $stage '*') -Destination $ffRoot -Recurse -Force; $installedFfmpeg = Get-ChildItem -Path $ffRoot -Recurse -Filter 'ffmpeg.exe' -File -ErrorAction SilentlyContinue | Select-Object -First 1; $installedFfprobe = Get-ChildItem -Path $ffRoot -Recurse -Filter 'ffprobe.exe' -File -ErrorAction SilentlyContinue | Select-Object -First 1; if (-not $installedFfmpeg -or -not $installedFfprobe) { throw 'The installed FFmpeg copy could not be verified.' }; if ($backup -and (Test-Path -LiteralPath $backup)) { Remove-Item -LiteralPath $backup -Recurse -Force; $backup = '' } } catch { if ($backup -and (Test-Path -LiteralPath $backup)) { if (Test-Path -LiteralPath $ffRoot) { Remove-Item -LiteralPath $ffRoot -Recurse -Force -ErrorAction SilentlyContinue }; Move-Item -LiteralPath $backup -Destination $ffRoot -Force; $backup = '' } elseif ($createdRoot -and (Test-Path -LiteralPath $ffRoot)) { Remove-Item -LiteralPath $ffRoot -Recurse -Force -ErrorAction SilentlyContinue }; throw } finally { if (Test-Path -LiteralPath $stage) { Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue } } }\r\n");
    script.write("$ffmpeg = ''; if (Test-Path $ffRoot) { $m = Get-ChildItem -Path $ffRoot -Recurse -Filter 'ffmpeg.exe' -File -ErrorAction SilentlyContinue | Select-Object -First 1; if ($m) { $ffmpeg = $m.FullName } }\r\n");
    script.write("Write-Output ('YTDLP_PATH=' + (FindExe 'yt-dlp.exe'))\r\n");
    script.write("Write-Output ('SPOTIFY_DLP_PATH=' + (FindExe 'spotify-dlp.exe'))\r\n");
    script.write("Write-Output ('FFMPEG_PATH=' + $ffmpeg)\r\n");
    script.close();
    return script;
  }

  function runJsonPowerShell(script, args) {
    var outputFile = new File(settingsFolder().fsName + "/" + script.name.replace(/\.ps1$/i, "") + "-result.json");
    if (outputFile.exists) {
      outputFile.remove();
    }
    var runnerArgs = ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script.fsName];
    if (args.length > 0) {
      runnerArgs = runnerArgs.concat(["-YtdlpPath", args[0]]);
    }
    runnerArgs = runnerArgs.concat(["-OutputPath", outputFile.fsName]);
    var runnerResult = runToolWithArgs("powershell.exe", runnerArgs, script.name.replace(/\.ps1$/i, ""), readSettings(), settingsFolder().fsName);
    var output = runnerResult.output || "";
    var fileOutput = readTextFile(outputFile);
    if (fileOutput && fileOutput.replace(/^\s+|\s+$/g, "")) {
      output = fileOutput;
    }
    try {
      return parseJson(output);
    } catch (error) {
      return { ok: false, error: "Unexpected helper output from yt-dlp updater.", log: output };
    }
  }

  function shouldSkipConversion(preset, compatibility) {
    if (!compatibility || compatibility.status !== "ae_friendly") {
      return false;
    }
    if (preset.id === "auto") {
      return true;
    }
    if (preset.id === "prores_422_hq" || preset.id === "prores_4444") {
      return false;
    }
    if ((preset.id === "h264_high" || preset.id === "h264_preview" || preset.id === "h264_cfr" || preset.id === "h264_hdr_sdr") && compatibility.isH264Friendly) {
      return preset.id !== "h264_cfr" || !compatibility.vfr;
    }
    if (preset.id === "audio_wav_48k" && compatibility.isAudioFriendly && compatibility.mediaInfo.extension === ".wav") {
      return true;
    }
    return preset.type === "custom_ffmpeg" && preset.skipIfAeFriendly === true;
  }

  function actualConversionPreset(requestedPreset, compatibility, settings) {
    if (requestedPreset.id === "auto") {
      return conversionPresetById(compatibility && compatibility.recommendedPresetId ? compatibility.recommendedPresetId : "h264_high", settings);
    }
    if (compatibility && !compatibility.mediaInfo.hasVideo && requestedPreset.outputType === "video") {
      return conversionPresetById("audio_wav_48k", settings);
    }
    return requestedPreset;
  }

  function outputFileForPreset(file, preset) {
    var sourceName = file.name;
    var dotIndex = sourceName.lastIndexOf(".");
    var baseName = dotIndex > 0 ? sourceName.substring(0, dotIndex) : sourceName;
    return new File(file.parent.fsName + "/" + baseName + preset.suffix + "." + preset.container);
  }

  function requestedHardwareForPreset(preset, settings) {
    if (preset.outputType !== "video" || (preset.videoCodec !== "libx264" && preset.videoCodec !== "libx265")) {
      return "cpu";
    }
    if (settings.disableHardwareAcceleration === true) {
      return "cpu";
    }
    return preset.hardwareAcceleration || "auto";
  }

  function hardwareCandidatesForPreset(preset, settings) {
    var requested = requestedHardwareForPreset(preset, settings);
    if (requested === "auto") {
      return ["nvenc", "qsv", "amf", "cpu"];
    }
    if (requested === "cpu") {
      return ["cpu"];
    }
    return [requested, "cpu"];
  }

  function isHardwareEncoderUnavailable(output) {
    output = String(output || "").toLowerCase();
    return /unknown encoder|no capable devices found|cannot load (?:nvcuda|libcuda)|device (?:is )?not available|hardware device setup failed|failed to initialise|failed to initialize|encoder setup failed|unsupported device|no device available/.test(output);
  }

  function addVideoEncoderArgs(args, preset, hardwareMode) {
    var hevc = preset.videoCodec === "libx265";
    var crf = String(preset.crf);
    if (hardwareMode === "nvenc") {
      return args.concat(["-c:v", hevc ? "hevc_nvenc" : "h264_nvenc", "-preset", "p5", "-tune", "hq", "-rc", "vbr", "-cq", crf, "-b:v", "0", "-pix_fmt", preset.pixelFormat]);
    }
    if (hardwareMode === "qsv") {
      return args.concat(["-c:v", hevc ? "hevc_qsv" : "h264_qsv", "-preset", "medium", "-global_quality", crf, "-pix_fmt", preset.pixelFormat]);
    }
    if (hardwareMode === "amf") {
      return args.concat(["-c:v", hevc ? "hevc_amf" : "h264_amf", "-quality", "quality", "-rc", "cqp", "-qp_i", crf, "-qp_p", crf, "-qp_b", crf, "-pix_fmt", preset.pixelFormat]);
    }
    return args.concat(["-c:v", preset.videoCodec, "-preset", preset.encoderPreset, "-crf", crf, "-pix_fmt", preset.pixelFormat, "-threads", "0"]);
  }

  function buildFfmpegArgsFromPreset(file, output, preset, hardwareMode) {
    var args = ["-y", "-i", file.fsName];
    if (preset.outputType === "audio") {
      args = args.concat(["-map", "0:a:0", "-vn", "-sn"]);
    } else {
      args = args.concat(["-map", "0:v:0", "-map", "0:a?", "-sn"]);
      if (preset.hdrToSdr) {
        args = args.concat(["-vf", "zscale=t=linear:npl=100,format=gbrpf32le,tonemap=hable:desat=0,zscale=p=bt709:t=bt709:m=bt709:r=tv,format=yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709"]);
      }
      if (preset.frameRateMode === "cfr") {
        args = args.concat(["-fps_mode", "cfr"]);
        if (preset.targetFps && preset.targetFps !== "source") {
          args = args.concat(["-r", preset.targetFps]);
        }
      }
      if (preset.videoCodec === "prores_422_hq" || preset.videoCodec === "prores_4444") {
        args = args.concat(["-c:v", "prores_ks", "-profile:v", preset.videoCodec === "prores_4444" ? "4" : "3", "-pix_fmt", preset.pixelFormat, "-vendor", "apl0"]);
      } else {
        args = addVideoEncoderArgs(args, preset, hardwareMode || "cpu");
      }
    }
    if (preset.audioCodec === "none") {
      args.push("-an");
    } else if (preset.audioCodec === "copy") {
      args = args.concat(["-c:a", "copy"]);
    } else {
      args = args.concat(["-c:a", preset.audioCodec]);
      if ((preset.audioCodec === "aac" || preset.audioCodec === "libmp3lame") && preset.audioBitrate) {
        args = args.concat(["-b:a", preset.audioBitrate]);
      }
      if (preset.sampleRate && preset.sampleRate !== "keep") {
        args = args.concat(["-ar", preset.sampleRate]);
      }
      if (preset.channels === "stereo") {
        args = args.concat(["-ac", "2"]);
      }
    }
    if (preset.faststart && preset.container === "mp4") {
      args = args.concat(["-movflags", "+faststart"]);
    }
    args.push(output.fsName);
    return args;
  }

  function transcodeForAe(file, settings, jobId, compatibility, requestedPresetId) {
    compatibility = compatibility || classifyAeCompatibility(file, settings, "");
    var requestedPreset = conversionPresetById(requestedPresetId || settings.conversionMode, settings);
    if (shouldSkipConversion(requestedPreset, compatibility)) {
      return { file: file, log: "Conversion skipped: " + compatibility.reason, skipped: true, requestedPresetId: requestedPreset.id, actualPresetId: "original", compatibility: compatibility };
    }
    var preset = actualConversionPreset(requestedPreset, compatibility, settings);
    var output = outputFileForPreset(file, preset);
    var requestedHardware = requestedHardwareForPreset(preset, settings);
    var candidates = hardwareCandidatesForPreset(preset, settings);
    var runnerResult = null;
    var outputLogs = [];
    var actualHardware = "none";
    var hardwareAttempted = false;
    for (var candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += 1) {
      var candidate = candidates[candidateIndex];
      if (candidate !== "cpu") {
        hardwareAttempted = true;
      }
      var args = buildFfmpegArgsFromPreset(file, output, preset, candidate);
      if (output.exists) {
        output.remove();
      }
      runnerResult = runToolWithArgs(ffmpegCommand(settings), args, "ffmpeg-" + candidate, settings, file.parent.fsName, jobId || "", output.name);
      if (runnerResult.cancelled) {
        if (output.exists) {
          output.remove();
        }
        throw new Error("Download cancelled.");
      }
      var candidateLog = runnerResult.output || runnerResult.error || "";
      outputLogs.push("Encoder attempt " + candidate.toUpperCase() + ":\n" + candidateLog);
      if (runnerResult.ok === true && output.exists) {
        actualHardware = candidate;
        break;
      }
      if (output.exists) {
        output.remove();
      }
      if (candidate !== "cpu" && !isHardwareEncoderUnavailable(candidateLog)) {
        break;
      }
    }
    var outputLog = "Requested video encoding: " + requestedHardware.toUpperCase() + "\nEncoder candidates: " + candidates.join(", ").toUpperCase() + "\nActual video encoding: " + actualHardware.toUpperCase() + "\n\n" + outputLogs.join("\n\n");
    if (!output.exists) {
      throw new Error("FFmpeg did not create an AE-compatible file.\n\nCommand output:\n" + outputLog);
    }

    return {
      file: output,
      log: (preset.id !== requestedPreset.id ? "Preset fallback: " + requestedPreset.label + " -> " + preset.label + "\n" : "") + outputLog,
      skipped: false,
      requestedPresetId: requestedPreset.id,
      actualPresetId: preset.id,
      requestedHardwareAcceleration: requestedHardware,
      actualHardwareAcceleration: actualHardware,
      hardwareFallbackUsed: hardwareAttempted && actualHardware === "cpu",
      compatibility: compatibility
    };
  }

  function deleteFileQuietly(file) {
    if (!file || !file.exists) {
      return false;
    }
    try {
      return file.remove();
    } catch (error) {
      return false;
    }
  }

  function findDownloadedFile(output) {
    var lines = String(output || "").split(/\r?\n/);
    for (var i = lines.length - 1; i >= 0; i -= 1) {
      var line = lines[i].replace(/^\s+|\s+$/g, "");
      if (!line) {
        continue;
      }
      var file = new File(line);
      if (file.exists) {
        return file;
      }
    }
    return null;
  }

  function stripAnsi(text) {
    return String(text || "").replace(/\x1b\[[0-9;]*m/g, "");
  }

  function normalizeFileText(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/\.[a-z0-9]{2,5}$/i, "")
      .replace(/[^a-z0-9]+/g, "");
  }

  function fileStem(file) {
    var name = String(file.name || "");
    var dotIndex = name.lastIndexOf(".");
    return dotIndex > 0 ? name.substring(0, dotIndex) : name;
  }

  function findExistingFileMention(output, folder, extensions) {
    var clean = stripAnsi(output);
    var match = /File\s+["“]([^"”]+)["”]\s+already exists/i.exec(clean);
    if (!match || !match[1]) {
      return null;
    }

    var mentioned = match[1];
    var direct = new File(mentioned);
    if (direct.exists && extensions[fileExtension(direct)]) {
      return direct;
    }

    var mentionedName = mentioned.replace(/\\/g, "/").split("/").pop().toLowerCase();
    var mentionedStem = mentionedName;
    var dotIndex = mentionedStem.lastIndexOf(".");
    if (dotIndex > 0) {
      mentionedStem = mentionedStem.substring(0, dotIndex);
    }
    var mentionedNormalized = normalizeFileText(mentionedStem);

    for (var ext in extensions) {
      if (extensions.hasOwnProperty(ext)) {
        var withExtension = new File(folder.fsName + "/" + mentioned + ext);
        if (withExtension.exists) {
          return withExtension;
        }
      }
    }

    var candidates = folder.getFiles(function (item) {
      if (!(item instanceof File)) {
        return false;
      }
      if (!extensions[fileExtension(item)]) {
        return false;
      }
      var itemStem = fileStem(item);
      if (itemStem.toLowerCase() === mentionedStem) {
        return true;
      }
      var itemNormalized = normalizeFileText(itemStem);
      return itemNormalized === mentionedNormalized || itemNormalized.indexOf(mentionedNormalized) >= 0 || mentionedNormalized.indexOf(itemNormalized) >= 0;
    });

    if (candidates.length) {
      return candidates[0];
    }

    return null;
  }

  function outputMentionsExistingFile(output) {
    return /File\s+["“][^"”]+["”]\s+already exists/i.test(stripAnsi(output));
  }

  function fileExtension(file) {
    var name = String(file.name || "").toLowerCase();
    var dotIndex = name.lastIndexOf(".");
    return dotIndex >= 0 ? name.substring(dotIndex) : "";
  }

  function getNewFiles(folder, startedAt, extensions) {
    var files = folder.getFiles(function (item) {
      if (!(item instanceof File)) {
        return false;
      }
      if (!extensions[fileExtension(item)]) {
        return false;
      }
      return item.modified && item.modified.getTime && item.modified.getTime() >= startedAt;
    });
    files.sort(function (a, b) {
      return a.modified.getTime() - b.modified.getTime();
    });
    return files;
  }

  function fileSnapshot(folder, extensions) {
    var snapshot = {};
    var files = folder.getFiles(function (item) {
      return item instanceof File && extensions[fileExtension(item)];
    });
    for (var i = 0; i < files.length; i += 1) {
      snapshot[files[i].fsName] = files[i].modified && files[i].modified.getTime ? files[i].modified.getTime() : 0;
    }
    return snapshot;
  }

  function getChangedFiles(folder, snapshot, extensions) {
    snapshot = snapshot || {};
    var files = folder.getFiles(function (item) {
      if (!(item instanceof File)) {
        return false;
      }
      if (!extensions[fileExtension(item)]) {
        return false;
      }
      var previous = snapshot[item.fsName];
      var modified = item.modified && item.modified.getTime ? item.modified.getTime() : 0;
      return previous === undefined || modified > previous + 500;
    });
    files.sort(function (a, b) {
      return b.modified.getTime() - a.modified.getTime();
    });
    return files;
  }

  function getNewThumbnails(folder, startedAt) {
    return getNewFiles(folder, startedAt, { ".jpg": true, ".jpeg": true, ".png": true, ".webp": true });
  }

  function thumbnailFilesForMedia(file, folder, startedAt) {
    var thumbnails = getNewThumbnails(folder, startedAt);
    var found = {};
    var result = [];
    for (var i = 0; i < thumbnails.length; i += 1) {
      found[thumbnails[i].fsName] = true;
      result.push(thumbnails[i]);
    }
    if (file && file.exists) {
      var baseName = file.name.replace(/\.[^.]+$/, "");
      var siblings = folder.getFiles(function (item) {
        if (!(item instanceof File)) {
          return false;
        }
        var ext = fileExtension(item);
        return (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp") && item.name.indexOf(baseName) === 0;
      });
      for (var s = 0; s < siblings.length; s += 1) {
        if (!found[siblings[s].fsName]) {
          found[siblings[s].fsName] = true;
          result.push(siblings[s]);
        }
      }
    }
    return result;
  }

  function moveFileToAssetFolder(file, parentFolder, childName) {
    if (!file || !file.exists || !parentFolder || !parentFolder.exists) {
      return file;
    }
    var targetFolder = ensureFolder(parentFolder.fsName + "/" + childName);
    var target = new File(targetFolder.fsName + "/" + file.name);
    if (normalizedPathText(target.fsName) === normalizedPathText(file.fsName)) {
      return file;
    }
    if (target.exists) {
      target.remove();
    }
    if (file.copy(target.fsName)) {
      file.remove();
      return target;
    }
    return file;
  }

  function importFile(file) {
    var importOptions = new ImportOptions(file);
    return app.project.importFile(importOptions);
  }

  function isVideoFile(file) {
    var ext = fileExtension(file);
    return ext === ".mp4" || ext === ".mov" || ext === ".mkv" || ext === ".webm" || ext === ".avi";
  }

  function importFiles(files, settings) {
    var importedItems = [];
    var importedFiles = [];
    var replacedSourceFiles = [];
    var fallbackLog = "";
    var fallbackTranscoded = false;
    for (var i = 0; i < files.length; i += 1) {
      var file = files[i];
      try {
        importedItems.push(importFile(file));
        importedFiles.push(file);
      } catch (importError) {
        if (!isVideoFile(file)) {
          throw importError;
        }
        var transcodeResult;
        try {
          var rejectedCompatibility = classifyAeCompatibility(file, settings, "");
          rejectedCompatibility.status = "needs_conversion";
          rejectedCompatibility.isH264Friendly = false;
          rejectedCompatibility.reason = "After Effects rejected the original file.";
          rejectedCompatibility.recommendedPresetId = "h264_high";
          transcodeResult = transcodeForAe(file, settings, settings.activeJobId || "", rejectedCompatibility, "h264_high");
        } catch (transcodeError) {
          throw new Error("After Effects could not import the downloaded file, and FFmpeg could not make an AE-compatible copy.\n\nAE import error:\n" + String(importError) + "\n\nFFmpeg error:\n" + String(transcodeError));
        }
        importedItems.push(importFile(transcodeResult.file));
        importedFiles.push(transcodeResult.file);
        replacedSourceFiles.push(file);
        fallbackTranscoded = true;
        fallbackLog += "\n\nAE rejected the original video compression, so Waves converted this file for AE:\n" + transcodeResult.file.fsName + "\n\nFFmpeg:\n" + transcodeResult.log;
      }
    }
    return {
      items: importedItems,
      files: importedFiles,
      replacedSourceFiles: replacedSourceFiles,
      transcoded: fallbackTranscoded,
      log: fallbackLog
    };
  }

  function projectFolderNamed(name, parentFolder) {
    if (!app.project) {
      app.newProject();
    }
    var parent = parentFolder || app.project.rootFolder;
    for (var i = 1; i <= app.project.numItems; i += 1) {
      var item = app.project.item(i);
      if (item instanceof FolderItem && item.name === name && item.parentFolder === parent) {
        return item;
      }
    }
    var folder = app.project.items.addFolder(name);
    folder.parentFolder = parent;
    return folder;
  }

  function sourceFolderName(source, url) {
    if (/youtube\.com|youtu\.be/i.test(String(url || ""))) {
      return "YouTube";
    }
    if (source === "spotify") {
      return "Spotify";
    }
    if (source === "tiktok") {
      return "TikTok";
    }
    if (source === "other") {
      return "Other Sites";
    }
    return "YouTube";
  }

  function isThumbnailItem(item) {
    if (!(item instanceof FootageItem) || !item.file) {
      return false;
    }
    var ext = fileExtension(item.file);
    return ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp";
  }

  function organizeImportedItems(items, source, url) {
    var root = projectFolderNamed("Waves Media Downloader", null);
    var mediaFolder = projectFolderNamed(sourceFolderName(source, url), root);
    var thumbnailFolder = projectFolderNamed("Thumbnails", root);
    var moved = 0;
    for (var i = 0; i < items.length; i += 1) {
      var item = items[i];
      if (!item) {
        continue;
      }
      try {
        item.parentFolder = isThumbnailItem(item) ? thumbnailFolder : mediaFolder;
        moved += 1;
      } catch (error) {}
    }
    return moved;
  }

  function applySourceMetadata(items, metadata) {
    var comment = sanitizeLogText([
      metadata.plugin,
      "Source: " + metadata.source,
      "URL: " + metadata.sourceUrl,
      "Downloaded: " + metadata.downloadDate,
      "Title: " + metadata.title,
      "Plugin version: " + metadata.pluginVersion,
      "yt-dlp version: " + metadata.ytdlpVersion,
      "spotify-dlp version: " + metadata.spotifyDlpVersion,
      "FFmpeg version: " + metadata.ffmpegVersion,
      "Transcoded: " + (metadata.transcoded ? "Yes" : "No"),
      "File: " + metadata.finalFile
    ].join("\n"), readSettings());
    for (var i = 0; i < items.length; i += 1) {
      try {
        if (items[i] && !isThumbnailItem(items[i])) {
          items[i].comment = comment;
        }
      } catch (error) {}
    }
  }

  function mediaStatsFor(file, item) {
    var stats = [];
    if (file && file.exists) {
      stats.push("File size: " + bytesLabel(file.length));
      stats.push("Extension: " + fileExtension(file).replace(".", "").toUpperCase());
    }
    if (item instanceof FootageItem) {
      if (item.width && item.height) {
        stats.push("Resolution: " + item.width + "x" + item.height);
      }
      if (item.duration && item.duration > 0) {
        stats.push("Duration: " + Math.round(item.duration * 100) / 100 + "s");
      }
      if (item.frameRate && item.frameRate > 0) {
        stats.push("Frame rate: " + Math.round(item.frameRate * 100) / 100 + " fps");
      }
    }
    return stats.join("\n");
  }

  function activeComp() {
    return app.project && app.project.activeItem instanceof CompItem ? app.project.activeItem : null;
  }

  function makeCompForItem(item) {
    if (!(item instanceof FootageItem) || !item.mainSource) {
      return null;
    }
    var width = item.width && item.width > 0 ? item.width : 1920;
    var height = item.height && item.height > 0 ? item.height : 1080;
    var duration = item.duration && item.duration > 0 ? item.duration : 30;
    var frameRate = item.frameRate && item.frameRate > 0 ? item.frameRate : 30;
    return app.project.items.addComp(item.name.replace(/\.[^.]+$/, ""), width, height, 1, duration, frameRate);
  }

  function scaleLayerToFitComp(layer, comp, item) {
    if (!layer || !comp || !item) {
      return false;
    }
    var source = layer.source || item;
    var sourceWidth = source.width || item.width || 0;
    var sourceHeight = source.height || item.height || 0;
    if (sourceWidth <= 0 || sourceHeight <= 0 || comp.width <= 0 || comp.height <= 0) {
      return false;
    }
    var scale = Math.min(comp.width / sourceWidth, comp.height / sourceHeight) * 100;
    layer.property("Scale").setValue([scale, scale]);
    try {
      var position = layer.property("Position");
      if (position) {
        position.setValue(position.value.length === 3 ? [comp.width / 2, comp.height / 2, position.value[2]] : [comp.width / 2, comp.height / 2]);
      }
    } catch (error) {}
    return true;
  }

  function centerLayerAnchorPoint(layer, item) {
    try {
      var source = layer.source || item;
      var width = source.width || item.width || 0;
      var height = source.height || item.height || 0;
      var anchor = layer.property("Anchor Point");
      if (anchor && width > 0 && height > 0) {
        anchor.setValue(anchor.value.length === 3 ? [width / 2, height / 2, anchor.value[2]] : [width / 2, height / 2]);
        return true;
      }
    } catch (error) {}
    return false;
  }

  function cleanLayerNameForItem(item) {
    var name = item && item.name ? item.name : "Waves media";
    return cleanDisplayName(name).replace(/\.[^.]+$/, "");
  }

  function trimLayerToItem(layer, item) {
    try {
      if (item && item.duration && item.duration > 0) {
        layer.outPoint = layer.startTime + item.duration;
        return true;
      }
    } catch (error) {}
    return false;
  }

  function layerForSource(comp, sourceItem) {
    if (!comp || !sourceItem) {
      return null;
    }
    for (var i = 1; i <= comp.numLayers; i += 1) {
      try {
        if (comp.layer(i).source === sourceItem) {
          return comp.layer(i);
        }
      } catch (error) {}
    }
    return null;
  }

  function addItemsToTimeline(items, autoFitToComp, createCompIfNeeded, preferredComp, actions) {
    var comp = preferredComp instanceof CompItem ? preferredComp : activeComp();
    var createdComp = false;
    var added = 0;
    var fitted = 0;
    var renamed = 0;
    var muted = 0;
    var centered = 0;
    var precomposed = 0;
    var firstLayer = null;
    actions = actions || {};
    for (var i = 0; i < items.length; i += 1) {
      var item = items[i];
      if (!item) {
        continue;
      }
      if (!comp && createCompIfNeeded === true) {
        comp = makeCompForItem(item);
        createdComp = !!comp;
      }
      if (comp) {
        var layer = comp.layers.add(item);
        layer.startTime = comp.time;
        if (actions.renameLayerClean !== false) {
          try {
            layer.name = cleanLayerNameForItem(item);
            renamed += 1;
          } catch (error) {}
        }
        if (autoFitToComp && scaleLayerToFitComp(layer, comp, item)) {
          fitted += 1;
        }
        trimLayerToItem(layer, item);
        if (actions.centerAnchorPoint === true && centerLayerAnchorPoint(layer, item)) {
          centered += 1;
        }
        if (actions.muteAudio === true) {
          try {
            if (layer.hasAudio) {
              layer.audioEnabled = false;
              muted += 1;
            }
          } catch (error) {}
        }
        if (actions.precomposeLayer === true) {
          try {
            var precompItem = comp.layers.precompose([layer.index], cleanLayerNameForItem(item) + " Precomp", true);
            if (precompItem instanceof CompItem && item.duration && item.duration > 0) {
              precompItem.duration = item.duration;
            }
            var precompLayer = layerForSource(comp, precompItem);
            if (precompLayer) {
              precompLayer.startTime = comp.time;
              trimLayerToItem(precompLayer, item);
              if (autoFitToComp && scaleLayerToFitComp(precompLayer, comp, precompItem)) {
                fitted += 1;
              }
              if (!firstLayer) {
                firstLayer = precompLayer;
              }
            }
            precomposed += 1;
          } catch (error) {}
        }
        if (!firstLayer) {
          firstLayer = layer;
        }
        added += 1;
      }
    }
    if (comp && (createdComp || added > 0)) {
      comp.openInViewer();
      if (firstLayer) {
        try {
          firstLayer.selected = true;
        } catch (error) {}
      }
    }
    return {
      added: added,
      fitted: fitted,
      createdComp: createdComp,
      renamed: renamed,
      muted: muted,
      centered: centered,
      precomposed: precomposed
    };
  }

  function postActionSummary(timelineResult) {
    var actions = [];
    if (!timelineResult) {
      return "";
    }
    if (timelineResult.renamed) {
      actions.push("clean layer names");
    }
    if (timelineResult.centered) {
      actions.push("centered anchor points");
    }
    if (timelineResult.muted) {
      actions.push("muted audio");
    }
    if (timelineResult.precomposed) {
      actions.push("pre-composed layers");
    }
    return actions.join(", ");
  }

  function timelineActionsFromPayload(payload) {
    return {
      renameLayerClean: true,
      centerAnchorPoint: false,
      muteAudio: false,
      precomposeLayer: payload.precomposeLayer === true
    };
  }

  $.global.ytImporterGetSettings = function (payloadJson) {
    try {
      return makeResult(true, { settings: readSettings() });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterSaveSettings = function (payloadJson) {
    try {
      var payload = parseJson(payloadJson);
      var existing = readSettings();
      var settings = defaultSettings();
      settings.ytdlpPath = payload.ytdlpPath || "yt-dlp";
      settings.spotifyDlpPath = payload.spotifyDlpPath || "spotify-dlp";
      settings.ffmpegPath = payload.ffmpegPath || "";
      settings.customConversionPresets = sanitizeCustomConversionPresets(payload.customConversionPresets || existing.customConversionPresets || []);
      settings.conversionMode = normalizeConversionPresetId(payload.conversionMode, settings.customConversionPresets);
      settings.disableHardwareAcceleration = payload.disableHardwareAcceleration === true;
      settings.cookiesBrowser = payload.cookiesBrowser || "";
      settings.downloadDir = payload.downloadDir || defaultDownloadDir();
      settings.defaultDownloadDir = defaultDownloadDir();
      settings.setupCompleted = payload.setupCompleted === true;
      settings.filenameTemplate = payload.filenameTemplate || "%(title).80B-%(id)s.%(ext)s";
      var filenameTemplateError = validateFilenameTemplate(settings.filenameTemplate);
      if (filenameTemplateError) {
        throw new Error(filenameTemplateError);
      }
      settings.organizeProject = payload.organizeProject !== false;
      settings.downloadThumbnail = payload.downloadThumbnail !== false;
      settings.lastSpotifyMode = payload.lastSpotifyMode || existing.lastSpotifyMode || "easy";
      settings.addToTimeline = payload.addToTimeline !== false;
      settings.autoFitToComp = payload.autoFitToComp !== false;
      settings.createCompIfNeeded = payload.createCompIfNeeded !== false;
      settings.precomposeLayer = payload.precomposeLayer === true;
      settings.spotifyClientId = payload.spotifyClientId || "";
      settings.spotifyClientSecret = payload.spotifyClientSecret || "";
      settings.spotifyAuthCompleted = existing.spotifyAuthCompleted === true || (settings.spotifyClientId && settings.spotifyClientSecret) ? true : false;
      writeSettings(settings);
      return makeResult(true, { settings: readSettings() });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterSaveSetup = function (payloadJson) {
    try {
      var payload = parseJson(payloadJson);
      var settings = readSettings();
      settings.downloadDir = payload.downloadDir || defaultDownloadDir();
      settings.defaultDownloadDir = defaultDownloadDir();
      settings.setupCompleted = payload.setupCompleted === true;
      writeSettings(settings);
      return makeResult(true, { settings: settings });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterSelectDownloadFolder = function (payloadJson) {
    try {
      var payload = parseJson(payloadJson);
      var startFolder = null;
      if (payload.currentPath) {
        startFolder = new Folder(payload.currentPath);
      }
      if (!startFolder || !startFolder.exists) {
        startFolder = new Folder(defaultDownloadDir());
      }
      var selected = Folder.selectDialog("Choose where Waves Media Downloader saves media", startFolder);
      if (!selected) {
        return makeResult(true, { path: "" });
      }
      return makeResult(true, { path: selected.fsName });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterOpenFolder = function (payloadJson) {
    try {
      var payload = parseJson(payloadJson);
      var folderPath = payload.folder || readSettings().downloadDir || defaultDownloadDir();
      var folder = ensureFolder(folderPath);
      openFolderNative(folder);
      return makeResult(true, {});
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterGetDiagnostics = function (payloadJson) {
    try {
      var settings = readSettings();
      var root = extensionRootFolder();
      var runner = runnerScriptFile();
      return makeResult(true, {
        diagnostics: {
          version: EXTENSION_VERSION,
          aeVersion: app.version || "",
          installLocation: root && root.exists ? root.fsName : "",
          runnerPath: runner.fsName,
          runnerAvailable: runner.exists,
          settingsFolder: settingsFolder().fsName,
          downloadDir: settings.downloadDir || defaultDownloadDir(),
          ytdlpPath: settings.ytdlpPath || "yt-dlp",
          spotifyDlpPath: settings.spotifyDlpPath || "spotify-dlp",
          ffmpegPath: settings.ffmpegPath || "",
          conversionMode: settings.conversionMode || "auto",
          customConversionPresets: settings.customConversionPresets || [],
          disableHardwareAcceleration: settings.disableHardwareAcceleration === true,
          cookiesBrowser: settings.cookiesBrowser || "",
          organizeProject: settings.organizeProject !== false,
          spotifyAuthCompleted: settings.spotifyAuthCompleted === true,
          setupCompleted: settings.setupCompleted === true
        }
      });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterCheckYtdlpUpdate = function (payloadJson) {
    try {
      var settings = readSettings();
      var result = runJsonPowerShell(ytdlpUpdateCheckScript(), [settings.ytdlpPath || "yt-dlp"]);
      if (result.ok === true && result.ytdlpPath) {
        settings.ytdlpPath = result.ytdlpPath;
        writeSettings(settings);
      }
      return makeResult(result.ok === true, result);
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterInstallYtdlpUpdate = function (payloadJson) {
    try {
      var settings = readSettings();
      var result = runJsonPowerShell(ytdlpUpdateInstallScript(), [settings.ytdlpPath || "yt-dlp"]);
      if (result.ok === true && result.ytdlpPath) {
        settings.ytdlpPath = result.ytdlpPath;
        writeSettings(settings);
      }
      return makeResult(result.ok === true, result);
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterUpdateDependencies = function (payloadJson) {
    try {
      var settings = readSettings();
      var script = dependencyUpdateScript();
      var runnerResult = runToolWithArgs("powershell.exe", [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        script.fsName
      ], "dependency-update", settings, settingsFolder().fsName);
      var output = runnerResult.output || "";
      var ytMatch = /YTDLP_PATH=(.*)/.exec(output);
      var spotifyMatch = /SPOTIFY_DLP_PATH=(.*)/.exec(output);
      var ffmpegMatch = /FFMPEG_PATH=(.*)/.exec(output);
      if (ytMatch && ytMatch[1]) {
        settings.ytdlpPath = ytMatch[1].replace(/^\s+|\s+$/g, "");
      }
      if (spotifyMatch && spotifyMatch[1]) {
        settings.spotifyDlpPath = spotifyMatch[1].replace(/^\s+|\s+$/g, "");
      }
      if (ffmpegMatch && ffmpegMatch[1]) {
        settings.ffmpegPath = ffmpegMatch[1].replace(/^\s+|\s+$/g, "");
      }
      writeSettings(settings);
      return makeResult(true, { settings: settings, log: output });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterOpenExternalUrl = function (payloadJson) {
    try {
      var payload = parseJson(payloadJson);
      var url = String(payload.url || "");
      if (!/^https?:\/\//i.test(url)) {
        throw new Error("Refusing to open an invalid URL.");
      }
      if ($.os.toLowerCase().indexOf("windows") >= 0) {
        var openScript = new File(settingsFolder().fsName + "/open-url-" + timestampForFile(new Date()) + ".vbs");
        openScript.encoding = "UTF-8";
        openScript.open("w");
        openScript.write('CreateObject("Shell.Application").ShellExecute "' + url.replace(/"/g, '""') + '", "", "", "open", 1\r\n');
        openScript.close();
        try {
          system.callSystem('wscript.exe //B //NoLogo "' + openScript.fsName.replace(/"/g, '""') + '"');
        } finally {
          if (openScript.exists) {
            openScript.remove();
          }
        }
      } else {
        system.callSystem("open " + quoteArg(url));
      }
      return makeResult(true, {});
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterSpotifyAuth = function (payloadJson) {
    try {
      var settings = readSettings();
      var launcher = spotifyAuthLauncherFor(settings);
      if (!launcher || !launcher.exists) {
        throw new Error("Could not create the Spotify authentication launcher.");
      }
      launcher.execute();
      return makeResult(true, { log: "Opened Spotify authentication in a separate command window." });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterSpotifyAuthStatus = function (payloadJson) {
    try {
      var completeFile = new File(settingsFolder().fsName + "/spotify-auth-complete.txt");
      if (completeFile.exists) {
        markSpotifyAuthCompleted();
      }
      return makeResult(true, { completed: completeFile.exists || readSettings().spotifyAuthCompleted === true });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterTikTokInfo = function (payloadJson) {
    try {
      var payload = parseJson(payloadJson);
      if (!payload.url || !isTikTokUrl(payload.url) || !isTikTokVideoUrl(payload.url)) {
        throw new Error("Paste a specific TikTok video/share URL first.");
      }
      var info = tiktokInfoFor(payload.url, readSettings());
      return makeResult(true, { info: info });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterPreviewInfo = function (payloadJson) {
    try {
      var payload = parseJson(payloadJson);
      validateSourcePayload(payload);
      if (!payload.url || !/^https?:\/\//i.test(payload.url)) {
        throw new Error("Paste a media URL first.");
      }
      if (payload.source === "tiktok" && !isTikTokVideoUrl(payload.url)) {
        throw new Error("Paste a specific TikTok video/share URL first.");
      }
      var data = ytdlpDumpJson(payload.url, readSettings());
      return makeResult(true, { preview: previewInfoFor(data) });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterFormatInfo = function (payloadJson) {
    try {
      var payload = parseJson(payloadJson);
      validateSourcePayload(payload);
      if (!payload.url || !/^https?:\/\//i.test(payload.url)) {
        throw new Error("Paste a media URL first.");
      }
      if (payload.source === "tiktok" && !isTikTokVideoUrl(payload.url)) {
        throw new Error("Paste a specific TikTok video/share URL first.");
      }
      var data = ytdlpDumpJson(payload.url, readSettings());
      var info = formatInfoFor(data);
      return makeResult(true, { info: info });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterDiscoverFormats = function (payloadJson) {
    try {
      var payload = parseJson(payloadJson);
      validateSourcePayload(payload);
      if (!payload.url || !/^https?:\/\//i.test(payload.url)) {
        throw new Error("Paste a media URL first.");
      }
      if (payload.source !== "youtube" && payload.source !== "other" && payload.source !== "tiktok") {
        throw new Error("Exact format discovery is available for video/media URLs.");
      }
      if (payload.source === "tiktok" && !isTikTokVideoUrl(payload.url)) {
        throw new Error("Paste a specific TikTok video/share URL first.");
      }
      var data = ytdlpDumpJson(payload.url, readSettings());
      var discovered = discoverFormatsFor(data);
      return makeResult(true, discovered);
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterGetHistory = function (payloadJson) {
    try {
      return makeResult(true, { history: historyEntries() });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterGetHistoryMetadata = function (payloadJson) {
    try {
      var payload = parseJson(payloadJson);
      var cache = readDownloadCache();
      var entry = cache[payload.key || ""];
      if (!entry || !entry.file) {
        throw new Error("Metadata is unavailable because this history entry no longer exists.");
      }
      var mediaFile = new File(entry.file);
      var metadataFile = entry.metadataFile ? new File(entry.metadataFile) : existingMetadataSidecarFile(mediaFile);
      if (!metadataFile || !metadataFile.exists) {
        throw new Error("No metadata was saved for this download.");
      }
      var settings = readSettings();
      if (!isPathInsideFolder(metadataFile.fsName, settings.downloadDir || defaultDownloadDir())) {
        throw new Error("Metadata file is outside the configured download folder.");
      }
      metadataFile.encoding = "UTF-8";
      metadataFile.open("r");
      var metadata = parseJson(metadataFile.read());
      metadataFile.close();
      return makeResult(true, { metadata: metadata, metadataFile: metadataFile.fsName });
    } catch (error) {
      try {
        metadataFile.close();
      } catch (closeError) {}
      return makeResult(false, { error: String(error) });
    }
  };

  function removeKnownHistoryFiles(entry, downloadsFolder) {
    if (!entry || !entry.file) {
      throw new Error("History entry has no media file.");
    }
    var file = new File(entry.file);
    if (!isPathInsideFolder(file.fsName, downloadsFolder.fsName)) {
      throw new Error("History file is outside the configured download folder.");
    }
    if (!supportedDeleteExtension(file)) {
      throw new Error("History file has an unsupported type.");
    }
    if (!file.exists && new Folder(entry.file).exists) {
      throw new Error("History entry points to a directory.");
    }
    if (file.exists) {
      var removed = moveFileToRecycleBin(file);
      if (!removed) {
        removed = file.remove();
      }
      if (!removed && file.exists) {
        throw new Error("History file is locked or could not be removed.");
      }
    }
    var metadataFile = entry.metadataFile ? new File(entry.metadataFile) : existingMetadataSidecarFile(file);
    if (metadataFile && metadataFile.exists && isPathInsideFolder(metadataFile.fsName, downloadsFolder.fsName)) {
      deleteFileQuietly(metadataFile);
    }
    var thumbnailFile = entry.thumbnail ? new File(entry.thumbnail) : null;
    if (thumbnailFile && thumbnailFile.exists && isPathInsideFolder(thumbnailFile.fsName, downloadsFolder.fsName) && supportedDeleteExtension(thumbnailFile)) {
      deleteFileQuietly(thumbnailFile);
    }
  }

  $.global.ytImporterDeleteAllHistoryFiles = function (payloadJson) {
    try {
      var cache = readDownloadCache();
      var settings = readSettings();
      var downloadsFolder = new Folder(settings.downloadDir || defaultDownloadDir());
      var removed = 0;
      var skipped = 0;
      for (var key in cache) {
        if (!cache.hasOwnProperty(key)) {
          continue;
        }
        try {
          removeKnownHistoryFiles(cache[key], downloadsFolder);
          delete cache[key];
          removed += 1;
        } catch (entryError) {
          skipped += 1;
        }
      }
      writeDownloadCache(cache);
      return makeResult(true, { removed: removed, skipped: skipped, history: historyEntries() });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterOpenFileLocation = function (payloadJson) {
    try {
      var payload = parseJson(payloadJson);
      var file = new File(payload.file || "");
      if (!file.exists) {
        throw new Error("File not found: " + (payload.file || ""));
      }
      openFolderNative(file.parent);
      return makeResult(true, {});
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterDeleteHistoryFile = function (payloadJson) {
    try {
      var payload = parseJson(payloadJson);
      if (!payload.key) {
        throw new Error("Delete refused: missing history key.");
      }
      var cache = readDownloadCache();
      var entry = cache[payload.key];
      if (!entry || !entry.file) {
        throw new Error("Delete refused: this file is not in Waves download history.");
      }
      var filePath = entry.file;
      if (payload.file && normalizedPathText(payload.file) !== normalizedPathText(entry.file)) {
        throw new Error("Delete refused: the requested file does not match the saved history entry.");
      }
      var file = new File(filePath);
      var settings = readSettings();
      var downloadsFolder = new Folder(settings.downloadDir || defaultDownloadDir());
      if (!isPathInsideFolder(file.fsName, downloadsFolder.fsName)) {
        throw new Error("Delete refused: file is outside the configured download folder.");
      }
      if (!supportedDeleteExtension(file)) {
        throw new Error("Delete refused: unsupported file type.");
      }
      var removed = false;
      if (!file.exists && new Folder(filePath).exists) {
        throw new Error("Delete refused: history deletion only supports files.");
      }
      if (file.exists) {
        removed = moveFileToRecycleBin(file);
        if (!removed) {
          removed = file.remove();
        }
        if (!removed && file.exists) {
          throw new Error("Delete failed: Waves could not remove the file.");
        }
      }
      var metadataFile = entry.metadataFile ? new File(entry.metadataFile) : existingMetadataSidecarFile(file);
      if (metadataFile && metadataFile.exists && isPathInsideFolder(metadataFile.fsName, downloadsFolder.fsName)) {
        deleteFileQuietly(metadataFile);
      }
      var thumbnailFile = entry.thumbnail ? new File(entry.thumbnail) : null;
      if (thumbnailFile && thumbnailFile.exists && isPathInsideFolder(thumbnailFile.fsName, downloadsFolder.fsName) && supportedDeleteExtension(thumbnailFile)) {
        deleteFileQuietly(thumbnailFile);
      }
      delete cache[payload.key];
      writeDownloadCache(cache);
      return makeResult(true, { history: historyEntries(), recycled: removed });
    } catch (error) {
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterImportExistingFile = function (payloadJson) {
    var undoOpen = false;
    try {
      var payload = parseJson(payloadJson);
      var file = new File(payload.file || "");
      if (!file.exists) {
        throw new Error("File not found: " + (payload.file || ""));
      }
      if (!app.project) {
        app.newProject();
      }
      var targetComp = activeComp();
      app.beginUndoGroup("Import existing media");
      undoOpen = true;
      var importResult = importFiles([file], readSettings());
      var existingMetadata = readMetadataSidecar(file);
      if (!existingMetadata) {
        existingMetadata = sourceMetadataData(
          payload,
          importResult.files[0],
          file.fsName !== importResult.files[0].fsName ? file : null,
          importResult.transcoded === true,
          displayNameForFile(importResult.files[0]),
          importResult.files,
          { ytdlpVersion: "unknown", spotifyDlpVersion: "unknown", ffmpegVersion: "unknown" }
        );
      }
      applySourceMetadata(importResult.items, existingMetadata);
      var organized = false;
      if (payload.organizeProject !== false) {
        organized = organizeImportedItems(importResult.items, payload.source || "other", payload.url || "") > 0;
      }
      var timelineResult = null;
      if (payload.addToTimeline) {
        timelineResult = addItemsToTimeline(importResult.items, payload.autoFitToComp !== false, payload.createCompIfNeeded === true, targetComp, timelineActionsFromPayload(payload));
      }
      app.endUndoGroup();
      undoOpen = false;
      return makeResult(true, {
        file: importResult.files[0].fsName,
        files: [importResult.files[0].fsName],
        imported: true,
        organized: organized,
        addedToTimeline: timelineResult && timelineResult.added > 0,
        fitToComp: timelineResult && timelineResult.fitted > 0,
        createdComp: timelineResult && timelineResult.createdComp === true,
        postActions: postActionSummary(timelineResult),
        mediaStats: mediaStatsFor(importResult.files[0], importResult.items[0]),
        log: "Imported existing file."
      });
    } catch (error) {
      if (undoOpen) {
        app.endUndoGroup();
      }
      return makeResult(false, { error: String(error) });
    }
  };

  $.global.ytImporterDownload = function (payloadJson) {
    var undoOpen = false;
    try {
      var payload = parseJson(payloadJson);
      if (!payload.url) {
        throw new Error("Enter a valid URL or search text.");
      }
      validateSourcePayload(payload);

      var settings = readSettings();
      payload.conversionMode = normalizeConversionPresetId(payload.conversionMode || settings.conversionMode, settings.customConversionPresets);
      var folder = ensureFolder(settings.downloadDir || defaultDownloadDir());
      var startedAt = new Date().getTime() - 2000;
      var output;
      var file;
      var files = [];
      var sourceFile = null;
      var transcoded = false;
      var ffmpegOutput = "";
      var usedCache = false;
      var filesToDeleteAfterImport = [];
      var displayTitle = payload.displayTitle || "";
      var metadataFilePath = "";
      var actualConversionPreset = "original";
      var actualHardwareAcceleration = "none";
      var requestedHardwareAcceleration = "none";
      var hardwareFallbackUsed = false;
      var compatibilityStatus = "";
      var compatibilityReason = "";
      var cached = payload.forceRedownload === true ? null : getCachedDownload(payload);

      if (cached) {
        file = cached.file;
        files = [file];
        sourceFile = cached.sourceFile && cached.sourceFile.exists ? cached.sourceFile : null;
        transcoded = cached.transcoded;
        output = "Using already downloaded file from cache:\n" + file.fsName;
        usedCache = true;
      } else if (payload.source === "spotify") {
        folder = ensureFolder(folder.fsName + "/Spotify Imports");
        startedAt = new Date().getTime() - 2000;
        var audioExtensions = { ".wav": true, ".mp3": true, ".m4a": true, ".flac": true, ".ogg": true };
        var spotifySnapshot = fileSnapshot(folder, audioExtensions);
        if (payload.spotifyMode === "full" || isSpotifyUrl(payload.url)) {
          output = runSpotifyDlp(payload, settings, folder);
          files = getChangedFiles(folder, spotifySnapshot, audioExtensions);
          if (files.length < 1) {
            file = findExistingFileMention(output, folder, audioExtensions);
            if (file) {
              files = [file];
            }
          }
          if (files.length < 1 && outputMentionsExistingFile(output)) {
            throw new Error("spotify-dlp says the track is already downloaded, but Waves could not match that exact audio file in the Spotify Imports folder.\n\nDelete or rename the existing Spotify file and try again, or clear the old download from Download History.\n\nCommand output:\n" + output);
          }
          if (files.length < 1) {
            var fallbackQuery = spotifyDlpResolvedQuery(output);
            if (fallbackQuery) {
              var fallbackSnapshot = fileSnapshot(folder, audioExtensions);
              var fallbackOutput = runYtdlpWithArgs(spotifySearchArgsFor(fallbackQuery, settings, folder), settings, folder, "yt-dlp-spotify-fallback", payload.jobId || "");
              output += "\n\nFallback yt-dlp search for resolved Spotify track:\n" + fallbackQuery + "\n\n" + fallbackOutput;
              file = findDownloadedFile(fallbackOutput);
              if (file) {
                files = [file];
              } else {
                files = getChangedFiles(folder, fallbackSnapshot, audioExtensions);
              }
            }
          }
          if (files.length < 1) {
            throw new Error("spotify-dlp finished, but no downloaded audio files were found.\n\nCommand output:\n" + output);
          }
          file = files[0];
        } else {
          var easy = spotifyEasyCommandFor(payload, settings, folder);
          displayTitle = displayTitle || easy.query;
          output = "Resolved search: " + easy.query + "\n\n" + runYtdlpWithArgs(easy.args, settings, folder, "yt-dlp-spotify-easy", payload.jobId || "");
          file = findDownloadedFile(output);
          if (!file) {
            files = getChangedFiles(folder, spotifySnapshot, audioExtensions);
            file = files.length ? files[0] : null;
          }
          if (!file) {
            throw new Error("yt-dlp finished, but no downloaded audio file was found.\n\nCommand output:\n" + output);
          }
          files = [file];
        }
        if (payload.transcodeForAe && file) {
          var spotifyCompatibility = classifyAeCompatibility(file, settings, "spotify");
          compatibilityStatus = spotifyCompatibility.status;
          compatibilityReason = spotifyCompatibility.reason;
          var spotifyTranscodeResult = transcodeForAe(file, settings, payload.jobId || "", spotifyCompatibility, payload.conversionMode);
          if (!spotifyTranscodeResult.skipped) {
            filesToDeleteAfterImport.push(file);
            sourceFile = file;
            file = spotifyTranscodeResult.file;
            files = [file];
            ffmpegOutput = spotifyTranscodeResult.log;
            transcoded = true;
          }
          actualConversionPreset = spotifyTranscodeResult.actualPresetId;
          actualHardwareAcceleration = spotifyTranscodeResult.actualHardwareAcceleration || "none";
          requestedHardwareAcceleration = spotifyTranscodeResult.requestedHardwareAcceleration || "none";
          hardwareFallbackUsed = spotifyTranscodeResult.hardwareFallbackUsed === true;
        }
      } else if (payload.source === "tiktok") {
        if (!isTikTokUrl(payload.url) || !isTikTokVideoUrl(payload.url)) {
          throw new Error("TikTok mode needs a specific TikTok video/share URL, not the TikTok homepage.\n\nUse a link like https://vm.tiktok.com/... or https://www.tiktok.com/@user/video/123...");
        }

        folder = ensureFolder(folder.fsName + "/TikTok Imports");
        startedAt = new Date().getTime() - 2000;
        var tiktokExtensions = payload.tiktokMode === "mp3" ? { ".mp3": true, ".m4a": true, ".wav": true } : { ".mp4": true, ".mov": true, ".webm": true, ".mkv": true };
        var tiktokSnapshot = fileSnapshot(folder, tiktokExtensions);
        var tiktokYtdlpResult = ytdlpTikTokDownload(payload, settings, folder);
        output = "yt-dlp:\n" + tiktokYtdlpResult.output;
        file = tiktokYtdlpResult.file;
        if (!file) {
          files = getChangedFiles(folder, tiktokSnapshot, tiktokExtensions);
          file = files.length ? files[0] : null;
        }
        if (!file) {
          throw new Error("yt-dlp finished, but no downloaded TikTok file was found.\n\nCommand output:\n" + output);
        }

        sourceFile = file;
        if (payload.transcodeForAe) {
          var tiktokCompatibility = classifyAeCompatibility(file, settings, "tiktok");
          compatibilityStatus = tiktokCompatibility.status;
          compatibilityReason = tiktokCompatibility.reason;
          var tiktokTranscodeResult = transcodeForAe(file, settings, payload.jobId || "", tiktokCompatibility, payload.conversionMode);
          if (!tiktokTranscodeResult.skipped) {
            filesToDeleteAfterImport.push(file);
            file = tiktokTranscodeResult.file;
            ffmpegOutput = tiktokTranscodeResult.log;
            transcoded = true;
          }
          actualConversionPreset = tiktokTranscodeResult.actualPresetId;
          actualHardwareAcceleration = tiktokTranscodeResult.actualHardwareAcceleration || "none";
          requestedHardwareAcceleration = tiktokTranscodeResult.requestedHardwareAcceleration || "none";
          hardwareFallbackUsed = tiktokTranscodeResult.hardwareFallbackUsed === true;
        }
        files = [file];
      } else if (payload.source === "youtube") {
        if (!/^https?:\/\//i.test(payload.url)) {
          throw new Error("YouTube mode only accepts a YouTube/video URL. For song search, switch Source to Spotify / song audio.");
        }

        folder = ensureFolder(folder.fsName + "/YouTube Imports");
        startedAt = new Date().getTime() - 2000;
        output = runYtdlpWithArgs(ytdlpArgsFor(payload, settings, folder), settings, folder, "yt-dlp-youtube", payload.jobId || "");
        file = findDownloadedFile(output);
        if (!file) {
          throw new Error("yt-dlp finished, but no downloaded file path was found.\n\nCommand output:\n" + output);
        }

        sourceFile = file;
        if (payload.transcodeForAe) {
          var youtubeCompatibility = classifyAeCompatibility(file, settings, "youtube");
          compatibilityStatus = youtubeCompatibility.status;
          compatibilityReason = youtubeCompatibility.reason;
          var transcodeResult = transcodeForAe(file, settings, payload.jobId || "", youtubeCompatibility, payload.conversionMode);
          if (!transcodeResult.skipped) {
            filesToDeleteAfterImport.push(file);
            file = transcodeResult.file;
            ffmpegOutput = transcodeResult.log;
            transcoded = true;
          }
          actualConversionPreset = transcodeResult.actualPresetId;
          actualHardwareAcceleration = transcodeResult.actualHardwareAcceleration || "none";
          requestedHardwareAcceleration = transcodeResult.requestedHardwareAcceleration || "none";
          hardwareFallbackUsed = transcodeResult.hardwareFallbackUsed === true;
        }
        files = [file];
      } else {
        if (!/^https?:\/\//i.test(payload.url)) {
          throw new Error("Other sites mode needs a media URL supported by yt-dlp.");
        }

        folder = ensureFolder(folder.fsName + "/Other Site Imports");
        startedAt = new Date().getTime() - 2000;
        output = runYtdlpWithArgs(ytdlpArgsFor(payload, settings, folder), settings, folder, "yt-dlp-other", payload.jobId || "");
        file = findDownloadedFile(output);
        if (!file) {
          throw new Error("yt-dlp finished, but no downloaded file path was found.\n\nThis site may not be supported by yt-dlp, or the URL may need login/cookies.\n\nCommand output:\n" + output);
        }

        sourceFile = file;
        if (payload.transcodeForAe) {
          var otherCompatibility = classifyAeCompatibility(file, settings, "other");
          compatibilityStatus = otherCompatibility.status;
          compatibilityReason = otherCompatibility.reason;
          var otherTranscodeResult = transcodeForAe(file, settings, payload.jobId || "", otherCompatibility, payload.conversionMode);
          if (!otherTranscodeResult.skipped) {
            filesToDeleteAfterImport.push(file);
            file = otherTranscodeResult.file;
            ffmpegOutput = otherTranscodeResult.log;
            transcoded = true;
          }
          actualConversionPreset = otherTranscodeResult.actualPresetId;
          actualHardwareAcceleration = otherTranscodeResult.actualHardwareAcceleration || "none";
          requestedHardwareAcceleration = otherTranscodeResult.requestedHardwareAcceleration || "none";
          hardwareFallbackUsed = otherTranscodeResult.hardwareFallbackUsed === true;
        }
        files = [file];
      }

      if (!usedCache && payload.downloadThumbnail) {
        var thumbnails = thumbnailFilesForMedia(sourceFile || file, folder, startedAt);
        for (var thumbIndex = 0; thumbIndex < thumbnails.length; thumbIndex += 1) {
          files.push(moveFileToAssetFolder(thumbnails[thumbIndex], folder, "Thumbnails"));
        }
      }
      var cacheThumbnailFile = files.length > 1 ? files[1] : null;

      var imported = false;
      var addedToTimeline = false;
      var fitToComp = false;
      var createdComp = false;
      var organized = false;
      var postActions = "";
      var targetComp = activeComp();
      app.beginUndoGroup(payload.source === "spotify" ? "Import Spotify audio" : payload.source === "tiktok" ? "Import TikTok media" : payload.source === "other" ? "Import media" : "Import YouTube video");
      undoOpen = true;
      if (!app.project) {
        app.newProject();
      }
      var importResult = importFiles(files, settings);
      var importedItems = importResult.items;
      files = importResult.files;
      if (importResult.transcoded) {
        transcoded = true;
        ffmpegOutput += importResult.log;
        for (var replacedIndex = 0; replacedIndex < importResult.replacedSourceFiles.length; replacedIndex += 1) {
          filesToDeleteAfterImport.push(importResult.replacedSourceFiles[replacedIndex]);
        }
      }
      var toolVersions = usedCache ? null : collectToolVersions(payload, settings, transcoded);
      payload.actualConversionPreset = actualConversionPreset;
      payload.actualHardwareAcceleration = actualHardwareAcceleration;
      payload.requestedHardwareAcceleration = requestedHardwareAcceleration;
      payload.hardwareFallbackUsed = hardwareFallbackUsed;
      var sourceMetadata = sourceMetadataData(payload, files && files.length ? files[0] : null, sourceFile, transcoded, displayTitle, files, toolVersions);
      applySourceMetadata(importedItems, sourceMetadata);
      if (payload.organizeProject !== false) {
        organized = organizeImportedItems(importedItems, payload.source, payload.url || "") > 0;
      }
      if (payload.addToTimeline) {
        var timelineItems = payload.downloadThumbnail && importedItems.length > 1 ? [importedItems[0]] : importedItems;
        var timelineResult = addItemsToTimeline(timelineItems, payload.autoFitToComp !== false, payload.createCompIfNeeded === true, targetComp, timelineActionsFromPayload(payload));
        addedToTimeline = timelineResult.added > 0;
        fitToComp = timelineResult.fitted > 0;
        createdComp = timelineResult.createdComp === true;
        postActions = postActionSummary(timelineResult);
      }
      imported = true;
      app.endUndoGroup();
      undoOpen = false;
      if (files.length > 0) {
        file = files[0];
      }
      if (!usedCache && file && file.exists) {
        metadataFilePath = writeMetadataSidecar(sourceMetadata, file);
        rememberDownload(payload, file, sourceFile, transcoded, cacheThumbnailFile, metadataFilePath);
      } else if (usedCache && file && file.exists) {
        var cachedSidecar = existingMetadataSidecarFile(file);
        metadataFilePath = cachedSidecar && cachedSidecar.exists ? cachedSidecar.fsName : "";
      }

      var deletedOriginals = [];
      if (!usedCache) {
        for (var deleteIndex = 0; deleteIndex < filesToDeleteAfterImport.length; deleteIndex += 1) {
          var oldFile = filesToDeleteAfterImport[deleteIndex];
          if (oldFile && oldFile.exists && file && oldFile.fsName !== file.fsName && deleteFileQuietly(oldFile)) {
            deletedOriginals.push(oldFile.fsName);
          }
        }
      }

      var filePaths = [];
      for (var i = 0; i < files.length; i += 1) {
        filePaths.push(files[i].fsName);
      }
      var mediaStats = importedItems.length && files.length ? mediaStatsFor(files[0], importedItems[0]) : "";
      var fullLog = sanitizeLogText(output + (ffmpegOutput ? "\n\nFFmpeg:\n" + ffmpegOutput : ""), settings);
      var logPath = writeSessionLog(payload.source || "download", fullLog, settings);

      return makeResult(true, {
        file: file.fsName,
        files: filePaths,
        sourceFile: sourceFile ? sourceFile.fsName : "",
        deletedOriginals: deletedOriginals,
        transcoded: transcoded,
        displayTitle: displayTitle,
        usedCache: usedCache,
        imported: imported,
        organized: organized,
        addedToTimeline: addedToTimeline,
        fitToComp: fitToComp,
        createdComp: createdComp,
        postActions: postActions,
        mediaStats: mediaStats,
        metadataFile: metadataFilePath,
        compatibilityStatus: compatibilityStatus,
        compatibilityReason: compatibilityReason,
        requestedConversionPreset: payload.conversionMode || "auto",
        actualConversionPreset: actualConversionPreset,
        actualHardwareAcceleration: actualHardwareAcceleration,
        requestedHardwareAcceleration: requestedHardwareAcceleration,
        hardwareFallbackUsed: hardwareFallbackUsed,
        log: fullLog,
        logPath: logPath
      });
    } catch (error) {
      if (undoOpen) {
        app.endUndoGroup();
      }
      var errorLogDetail = "Error:\n" + String(error);
      if (typeof output !== "undefined" && output) {
        errorLogDetail += "\n\nOutput:\n" + output;
      }
      if (typeof ffmpegOutput !== "undefined" && ffmpegOutput) {
        errorLogDetail += "\n\nFFmpeg:\n" + ffmpegOutput;
      }
      var sanitizedErrorLog = sanitizeLogText(errorLogDetail, settings);
      var errorLogPath = writeSessionLog("error", sanitizedErrorLog, settings);
      return makeResult(false, { error: sanitizeLogText(String(error), settings), log: sanitizedErrorLog, logPath: errorLogPath });
    }
  };
})();
