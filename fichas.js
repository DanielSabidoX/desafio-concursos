/* ============================================================================
   MASTER — fichas.js
   Painel das fichas de aposta: mostra o pote e as 5 fichas de cada jogador.
   Lê o estado por window.MasterApp e redesenha em "master:update".

   Uso:
     <div id="fichas-painel"></div>
     <script src="fichas.js"></script>
     <script>mountFichas('#fichas-painel');</script>
   ========================================================================== */
(function () {
  'use strict';

  var mounted = false;
  var host = null;

  var VALUES = [1, 2, 3, 4, 5];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function app() { return window.MasterApp || null; }

  function getRoom() {
    try { return app() && app().getRoom ? app().getRoom() : null; }
    catch (e) { return null; }
  }

  function getState() {
    try { return app() && app().getState ? app().getState() : null; }
    catch (e) { return null; }
  }

  function getActive() {
    try { return app() && app().activePlayer ? app().activePlayer() : null; }
    catch (e) { return null; }
  }

  function positionLabel(pos) {
    try {
      if (app() && app().positionLabel) return app().positionLabel(pos);
    } catch (e) { /* fallback */ }
    return 'Casa ' + pos;
  }

  function chipsHtml(chips, bet) {
    var owned = chips || [];
    return VALUES.map(function (v) {
      var has = owned.indexOf(v) >= 0;
      return '<span class="ficha-chip' + (has ? '' : ' is-used') +
        (bet === v ? ' is-bet' : '') + '" data-v="' + v + '" title="Ficha ' + v +
        (has ? ' disponível' : ' já usada') + '">' + v + '</span>';
    }).join('');
  }

  function chrome(body) {
    return '<div class="panel-handle">' +
        '<h3>Fichas de aposta</h3>' +
        '<button type="button" class="panel-toggle" onclick="closePanelNav()">Minimizar</button>' +
      '</div>' +
      '<div class="panel-body fichas-body">' + body + '</div>';
  }

  function render() {
    if (!host) return;
    var room = getRoom();

    if (!room) {
      host.innerHTML = chrome(
        '<div class="panel-empty">As fichas aparecem aqui quando uma partida começar.</div>' +
        '<div class="fichas-rule">Cada jogador recebe <b>5 fichas</b>, numeradas de <b>1 a 5</b>. ' +
        'Antes de responder, coloque uma ficha no centro do tabuleiro. Se acertar, avance o número de casas igual ao valor da ficha. ' +
        'A ficha usada fica no centro (pote). Quando as 5 fichas acabarem, o jogador recebe outras 5.</div>'
      );
      return;
    }

    var active = getActive();
    var q = room.question;
    var bet = q && q.bet != null ? q.bet : null;
    var pot = room.pot || 0;

    var summary = '<div class="fichas-summary">' +
        '<div class="fichas-pot">' +
          '<span class="pot-num">' + pot + '</span>' +
          '<span class="pot-label">ficha' + (pot === 1 ? '' : 's') + ' no centro</span>' +
        '</div>' +
        '<div class="fichas-rule">' +
          'Cada jogador tem <b>5 fichas</b> (1 a 5). A ficha apostada vai para o centro e só volta ao jogo quando ' +
          'o jogador fica sem nenhuma. Acertando, o peão avança <b>o número de casas igual ao valor apostado</b>. ' +
          'Errando, o peão fica onde está e a ficha é perdida.' +
        '</div>' +
      '</div>';

    var current = '';
    if (q && bet != null) {
      var who = active ? active.name : 'Jogador';
      var themeName = '';
      try {
        var t = window.masterTheme ? window.masterTheme(q.theme) : null;
        themeName = t ? t.name : q.theme;
      } catch (e) { themeName = ''; }
      current = '<div class="fichas-current">' +
        'Aposta atual: <b>' + bet + ' ponto' + (bet > 1 ? 's' : '') + '</b>' +
        ' de <b>' + esc(who) + '</b>' +
        (themeName ? ' · tema ' + esc(themeName) : '') +
        (q.final ? ' · <b>pergunta final</b>' : '') +
      '</div>';
    }

    var list = '<div class="fichas-list">';
    (room.players || []).forEach(function (p) {
      var isActive = !!(active && p.id === active.id && room.phase === 'playing');
      var available = (p.chips || []).length;
      var myBet = !!(isActive && q && bet != null) ? bet : null;

      list += '<div class="ficha-player' + (isActive ? ' is-active' : '') + '" style="--pc:' + esc(p.color) + '">' +
          '<div class="ficha-player-head">' +
            '<span class="color-dot" style="background:' + esc(p.color) + '"></span>' +
            '<span class="ficha-player-name">' + esc(p.name) + '</span>' +
            '<span class="ficha-player-pos">' + esc(p.left ? 'saiu' : positionLabel(p.pos)) + '</span>' +
          '</div>' +
          '<div class="ficha-chips">' + chipsHtml(p.chips, myBet) + '</div>' +
          '<div class="ficha-player-meta"><b>' + available + '</b> de 5 ficha' + (available === 1 ? '' : 's') + ' disponível' + (available === 1 ? '' : 'is') + '</div>' +
        '</div>';
    });
    list += '</div>';

    host.innerHTML = chrome(summary + current + list);
  }

  window.mountFichas = function (target) {
    if (mounted) return;
    host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) return;
    mounted = true;
    document.addEventListener('master:update', render);
    window.addEventListener('storage', render);
    render();
  };
})();
