/* ============================================================================
   MASTER — board.js
   Painel do tabuleiro. Independente do main.js: lê o estado por
   window.MasterApp e redesenha a cada evento "master:update".

   Uso:
     <div id="tabuleiro-painel"></div>
     <script src="board.js"></script>
     <script>mountBoard('#tabuleiro-painel');</script>
   ========================================================================== */
(function () {
  'use strict';

  var mounted = false;
  var host = null;
  var selectedPos = null;

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

  function spaceColor(space) {
    try {
      if (window.masterSpaceColor) return window.masterSpaceColor(space);
    } catch (e) { /* usa fallback */ }
    return '#2c3358';
  }

  function themeIcon(key) {
    var t = window.masterTheme ? window.masterTheme(key) : null;
    return t ? t.icon : '❔';
  }

  function themeShort(key) {
    var t = window.masterTheme ? window.masterTheme(key) : null;
    return t ? t.short : String(key || '?');
  }

  function spaceTitle(space, pos) {
    if (!space) return 'Casa ' + pos;
    if (space.type === 'start') return 'INÍCIO';
    if (space.type === 'finish') return 'FIM';
    var names = (space.themes || []).map(function (k) {
      var t = window.masterTheme ? window.masterTheme(k) : null;
      return t ? t.name : k;
    });
    return 'Casa ' + pos + ' — ' + names.join(' / ');
  }

  function gridArea(pos) {
    var rowFromBottom = Math.floor(pos / 6);
    var col = pos % 6;
    if (rowFromBottom % 2 === 1) col = 5 - col;
    var gridRow = 6 - rowFromBottom;
    return (gridRow) + ' / ' + (col + 1);
  }

  function pawnsAt(room, pos) {
    var state = getState();
    var active = getActive();
    var html = '';
    (room.players || []).forEach(function (p) {
      if (p.left) return;
      if (p.pos !== pos) return;
      var isMe = !!(state && p.id === state.playerId);
      var isActive = !!(active && p.id === active.id && room.phase === 'playing');
      html += '<span class="board-pawn' + (isMe ? ' is-me' : '') + '"' +
        ' style="--pc:' + esc(p.color) + '"' +
        ' title="' + esc(p.name) + (isActive ? ' (jogando agora)' : '') + '">' +
        esc(String(p.name || '?').trim().charAt(0).toUpperCase()) +
        '</span>';
    });
    return html ? '<div class="space-pawns">' + html + '</div>' : '';
  }

  function renderSpace(space, pos, room) {
    var cls = 'board-space';
    var inner = '';
    var bg = '';

    if (!space) {
      cls += '';
      bg = 'background:#2c3358';
    } else if (space.type === 'start') {
      cls += ' is-start';
      bg = 'background:' + spaceColor(space);
      inner = '<span class="space-icon">🏁</span><span class="space-name">' + esc(space.label || 'INÍCIO') + '</span>';
    } else if (space.type === 'finish') {
      cls += ' is-finish';
      bg = 'background:' + spaceColor(space);
      inner = '<span class="space-icon">🏆</span><span class="space-name">' + esc(space.label || 'FIM') + '</span>';
    } else {
      bg = 'background:' + spaceColor(space);
      var themes = space.themes || [];
      if (themes.length > 1) {
        inner = '<span class="space-icon">' + themeIcon(themes[0]) + themeIcon(themes[1]) + '</span>' +
          '<span class="space-name">' + esc(themeShort(themes[0])) + '</span>' +
          '<span class="space-name">' + esc(themeShort(themes[1])) + '</span>';
      } else {
        inner = '<span class="space-icon">' + themeIcon(themes[0]) + '</span>' +
          '<span class="space-name">' + esc(themeShort(themes[0])) + '</span>';
      }
    }

    var active = getActive();
    var isCurrent = !!(active && active.pos === pos && room.phase === 'playing');
    if (isCurrent) cls += ' is-current';
    if (selectedPos === pos) cls += ' is-selected';

    return '<button type="button" class="' + cls + '" data-pos="' + pos + '"' +
      ' style="grid-area:' + gridArea(pos) + ';' + bg + '"' +
      ' title="' + esc(spaceTitle(space, pos)) + '" aria-label="' + esc(spaceTitle(space, pos)) + '">' +
      '<span class="space-num">' + (space && (space.type === 'start' || space.type === 'finish') ? '' : pos) + '</span>' +
      inner +
      pawnsAt(room, pos) +
      '</button>';
  }

  function legend() {
    var order = window.MASTER_THEME_ORDER || [];
    return '<div class="board-legend">' + order.map(function (k) {
      var t = window.masterTheme ? window.masterTheme(k) : null;
      if (!t) return '';
      return '<span class="legend-item"><span class="legend-dot" style="--lc:' + t.color + '"></span>' +
        esc(t.name) + '</span>';
    }).join('') + '</div>';
  }

  function buildInfo(room) {
    if (selectedPos != null) {
      var sp = window.masterBoardSpace ? window.masterBoardSpace(selectedPos, room) : null;
      var here = (room.players || []).filter(function (p) {
        return !p.left && p.pos === selectedPos;
      }).map(function (p) { return p.name; });

      var extra = '';
      if (sp && sp.type === 'start') extra = 'Todos os jogadores começam aqui.';
      else if (sp && sp.type === 'finish') extra = 'Quem chega aqui disputa a pergunta final.';
      else if (sp && (sp.themes || []).length > 1) extra = 'Casa dividida: o jogador escolhe um dos dois temas.';
      else if (sp) extra = 'Tema único desta casa.';

      return '<b>' + esc(spaceTitle(sp, selectedPos)) + '</b> · ' + esc(extra) +
        (here.length ? '<br>Peões aqui: <b>' + esc(here.join(', ')) + '</b>' : '');
    }

    var active = getActive();
    if (room.phase === 'lobby') {
      return 'Partida ainda não começou. Os peões estão posicionados no INÍCIO.';
    }
    if (active) {
      var label = app() && app().positionLabel ? app().positionLabel(active.pos) : ('Casa ' + active.pos);
      return 'Vez de <b>' + esc(active.name) + '</b> — ' + esc(label) + '. Toque em uma casa para ver os detalhes.';
    }
    return 'Toque em uma casa do tabuleiro para ver os detalhes.';
  }

  function chrome(room, bodyHtml, pot) {
    return '<div class="panel-handle">' +
        '<h3>Tabuleiro</h3>' +
        '<button type="button" class="panel-toggle" onclick="closePanelNav()">Minimizar</button>' +
      '</div>' +
      '<div class="panel-body board-body">' +
        '<div class="board-top">' +
          '<div class="board-brand">MASTER <small>Novo Master</small></div>' +
          '<div class="board-pot">Pote <b>' + (pot || 0) + '</b> ficha' + ((pot || 0) === 1 ? '' : 's') + '</div>' +
        '</div>' +
        bodyHtml +
        legend() +
        '<div class="board-info" id="board-info">' + buildInfo(room) + '</div>' +
      '</div>';
  }

  function render() {
    if (!host) return;
    var room = getRoom();

    if (!room) {
      host.innerHTML = '<div class="panel-handle">' +
          '<h3>Tabuleiro</h3>' +
          '<button type="button" class="panel-toggle" onclick="closePanelNav()">Minimizar</button>' +
        '</div>' +
        '<div class="panel-body">' +
          '<div class="board-empty">Crie uma partida (local ou online) para ver o tabuleiro, os peões e o pote de fichas.</div>' +
        '</div>';
      return;
    }

    var cells = '';
    var board = window.masterRoomBoard ? window.masterRoomBoard(room) : (window.MASTER_BOARD || []);
    for (var i = 0; i < board.length; i++) cells += renderSpace(board[i], i, room);

    var html = '<div class="master-board">' + cells + '</div>';
    host.innerHTML = chrome(room, html, room.pot || 0);
  }

  function updateInfoOnly() {
    var info = host ? host.querySelector('#board-info') : null;
    var room = getRoom();
    if (!info || !room) return;
    info.innerHTML = buildInfo(room);
  }

  // ---- clique nas casas (delegação: sobrevive aos re-renders) ----
  function onBoardClick(ev) {
    var target = ev.target;
    while (target && target !== host && !target.getAttribute('data-pos')) {
      target = target.parentElement;
    }
    if (!target || target === host) return;
    var raw = target.getAttribute('data-pos');
    if (raw == null) return;
    var pos = parseInt(raw, 10);
    if (isNaN(pos)) return;

    selectedPos = (selectedPos === pos) ? null : pos;
    var room = getRoom();
    // atualiza apenas as classes de seleção, sem redesenhar tudo
    var all = host.querySelectorAll('.board-space');
    for (var i = 0; i < all.length; i++) {
      all[i].classList.toggle('is-selected', parseInt(all[i].getAttribute('data-pos'), 10) === selectedPos);
    }
    updateInfoOnly();
  }

  window.mountBoard = function (target) {
    if (mounted) return;
    host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) return;
    mounted = true;
    host.addEventListener('click', onBoardClick);
    document.addEventListener('master:update', render);
    window.addEventListener('storage', render);
    render();
  };
})();
