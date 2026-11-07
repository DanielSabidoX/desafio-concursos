(function () {
  'use strict';

  var appFiles = [
    'main.js',
    'board.js',
    'fichas.js',
    'placar.js',
    'regras.js',
    'admin.js',
    'panel-nav.js'
  ];
  var version = window.APP_VERSION || '0';

  function showLoadError() {
    var app = document.getElementById('app');
    if (app) {
      app.innerHTML = '<div class="banner banner-error">Não foi possível carregar os arquivos do jogo. Confira a conexão e atualize a página.</div>';
    }
  }

  function loadFiles(files, index, done) {
    if (index >= files.length) {
      done();
      return;
    }

    var script = document.createElement('script');
    script.src = files[index] + '?v=' + encodeURIComponent(version);
    script.onload = function () {
      loadFiles(files, index + 1, done);
    };
    script.onerror = showLoadError;
    document.body.appendChild(script);
  }

  function mountPanels() {
    var mounts = [
      ['mountBoard', '#tabuleiro-painel'],
      ['mountFichas', '#fichas-painel'],
      ['mountPlacar', '#placar-painel'],
      ['mountRegras', '#regras-painel'],
      ['mountAdmin', '#admin-painel'],
      ['mountPanelNav', '#panel-tabbar']
    ];
    mounts.forEach(function (entry) {
      if (typeof window[entry[0]] === 'function') window[entry[0]](entry[1]);
    });
  }

  function loadApplication() {
    var validThemes = Array.isArray(window.MASTER_THEME_ORDER) &&
      Array.isArray(window.MASTER_THEME_FILES) &&
      window.MASTER_THEME_ORDER.length === window.MASTER_THEME_FILES.length &&
      window.MASTER_THEME_ORDER.every(function (key) {
        return !!window.MASTER_THEMES[key] &&
          Array.isArray(window.MASTER_QUESTIONS[key]) &&
          window.MASTER_QUESTIONS[key].length > 0;
      });
    if (!validThemes) {
      showLoadError();
      return;
    }
    loadFiles(appFiles, 0, mountPanels);
  }

  if (!Array.isArray(window.MASTER_THEME_FILES) || !window.MASTER_THEME_FILES.length) {
    showLoadError();
    return;
  }

  loadFiles(window.MASTER_THEME_FILES, 0, loadApplication);
})();
