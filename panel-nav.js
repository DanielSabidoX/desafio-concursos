/* ============================================================================
   MASTER — panel-nav.js
   Controla QUANDO cada painel aparece: só um por vez, em tela cheia, tocando
   a classe "panel-open" neles. Não mexe na lógica interna dos painéis.

   Cada painel chama window.closePanelNav() no botão de minimizar para voltar
   à barra de abas.

   API pública:
     mountPanelNav('#panel-tabbar')
     window.openMasterPanel('tabuleiro' | 'fichas' | 'placar' | 'regras' | 'admin')
     window.closePanelNav()
   ========================================================================== */
(function () {
  'use strict';

  var TABS = [
    { id: 'tabuleiro', label: 'Tabuleiro', icon: '🗺️', sel: '#tabuleiro-painel' },
    { id: 'fichas',    label: 'Fichas',    icon: '🪙', sel: '#fichas-painel' },
    { id: 'placar',    label: 'Placar',    icon: '🏆', sel: '#placar-painel' },
    { id: 'regras',    label: 'Regras',    icon: '📖', sel: '#regras-painel' },
    { id: 'admin',     label: 'Anfitrião', icon: '👑', sel: '#admin-painel', hostOnly: true }
  ];

  var buttons = {};
  var openId = null;
  var mounted = false;

  function app() { return window.MasterApp || null; }

  function closeAll() {
    TABS.forEach(function (t) {
      var el = document.querySelector(t.sel);
      if (el) el.classList.remove('panel-open');
      if (buttons[t.id]) buttons[t.id].classList.remove('active');
    });
    openId = null;
  }

  function openTab(id) {
    var tab = null;
    for (var i = 0; i < TABS.length; i++) if (TABS[i].id === id) tab = TABS[i];
    if (!tab) return;

    var el = document.querySelector(tab.sel);
    if (!el) return;

    // tocar na aba já aberta fecha e volta ao jogo
    if (openId === id) { closeAll(); return; }

    closeAll();
    el.classList.add('panel-open');
    if (buttons[id]) {
      buttons[id].classList.add('active');
      buttons[id].classList.remove('needs-action');
    }
    openId = id;

    // leve feedback tátil (se suportado)
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} }
  }

  function updateHostVisibility() {
    var a = app();
    var host = false;
    try { host = !!(a && a.isHost && a.isHost()); } catch (e) { host = false; }
    TABS.forEach(function (t) {
      if (t.hostOnly && buttons[t.id]) buttons[t.id].hidden = !host;
    });
    // se o painel do anfitrião estava aberto e deixou de ser host, fecha
    if (!host && openId === 'admin') closeAll();
  }

  function updatePulse() {
    var a = app();
    var room = null;
    try { room = a && a.getRoom ? a.getRoom() : null; } catch (e) { room = null; }

    ['tabuleiro', 'fichas', 'placar'].forEach(function (id) {
      if (buttons[id]) buttons[id].classList.remove('needs-action');
    });

    if (!room || room.phase !== 'playing') return;

    // é a minha vez? (no modo local, MasterApp considera sempre "minha")
    var mine = false;
    try {
      var st = a.getState ? a.getState() : null;
      var active = a.activePlayer ? a.activePlayer() : null;
      if (st && st.mode === 'local') mine = true;
      else mine = !!(active && st && active.id === st.playerId);
    } catch (e) { mine = false; }

    if (!mine) return;

    // aposta pendente -> pulsa fichas; pergunta -> pulsa tabuleiro
    if (room.step === 'bet') {
      if (buttons.fichas) buttons.fichas.classList.add('needs-action');
    } else if (room.step === 'theme' || room.step === 'answer' ||
               room.step === 'final-theme' || room.step === 'final-answer') {
      if (buttons.tabuleiro) buttons.tabuleiro.classList.add('needs-action');
    } else if (room.step === 'reveal' || room.step === 'final-reveal') {
      if (buttons.tabuleiro) buttons.tabuleiro.classList.add('needs-action');
    }
  }

  function update() {
    updateHostVisibility();
    updatePulse();
  }

  window.mountPanelNav = function (target) {
    if (mounted) return;
    var host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) return;

    mounted = true;
    host.className = 'panel-tabbar';
    host.innerHTML = TABS.map(function (t) {
      return '<button type="button" class="panel-tab" data-tab="' + t.id + '"' +
        (t.hostOnly ? ' hidden' : '') + '>' +
        '<span class="panel-tab-icon">' + t.icon + '</span>' +
        '<span>' + t.label + '</span>' +
        '</button>';
    }).join('');

    TABS.forEach(function (t) {
      buttons[t.id] = host.querySelector('[data-tab="' + t.id + '"]');
      if (buttons[t.id]) {
        buttons[t.id].addEventListener('click', function () { openTab(t.id); });
      }
    });

    window.closePanelNav = closeAll;
    window.openMasterPanel = openTab;

    document.addEventListener('master:update', update);
    window.addEventListener('storage', update);
    update();

    // segurança: se algum painel precisar atualizar sem evento, confere de vez
    // em quando (barato e sem dependência de Firebase)
    setInterval(update, 2500);
  };
})();
