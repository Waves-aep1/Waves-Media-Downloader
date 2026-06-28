/*
 * Minimal CSInterface bridge for this panel.
 * Adobe's full CSInterface.js can replace this file if you prefer.
 */
(function () {
  "use strict";

  function CSInterface() {}

  CSInterface.prototype.evalScript = function (script, callback) {
    if (window.__adobe_cep__ && typeof window.__adobe_cep__.evalScript === "function") {
      window.__adobe_cep__.evalScript(script, callback || function () {});
      return;
    }

    if (callback) {
      callback(JSON.stringify({ ok: false, error: "Adobe CEP bridge is not available." }));
    }
  };

  window.CSInterface = CSInterface;
})();
