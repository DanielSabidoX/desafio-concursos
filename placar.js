/* ============================================================================
   MASTER — placar.js
   Painel do placar: classificação ao vivo + registro completo da partida.
   Lê o estado por window.MasterApp e redesenha em "master:update".

   Uso:
     <div id="placar-painel"></div>
     <script src="placar.js"></script>
     <script>mountPlacar('#placar-painel');</script>
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

  function fmtTime(ts) {
    try {
      if (app() && app().fmtTime) return app().fmtTime(ts);
    } catch (e) { /* fallback */ }
    try { return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return ''; }
  }

  function chrome(body) {
    return '<div class="panel-handle">' +
        '<h3>Placar</h3>' +
        '<button type="button" class="panel-toggle" onclick="closePanelNav()">Minimizar</button>' +
      '</div>' +
      '<div class="panel-body placar-body">' + body + '</div>';
  }

  function miniChips(chips) {
    var owned = chips || [];
    return VALUES.map(function (v) {
      var has = owned.indexOf(v) >= 0;
      return '<span class="mini-chip' + (has ? '' : ' used') + '"' +
        ' style="--mc:' + chipColor(v) + '" title="Ficha ' + v + '"></span>';
    }).join('');
  }

  function chipColor(v) {
    return { 1: '#e14b4b', 2: '#4f8cff', 3: '#35c47a', 4: '#f2c14e', 5: '#a855f7' }[v] || '#666';
  }

  function sortedPlayers(room) {
    var list = (room.players || []).slice();
    var winner = room.winner;
    list.sort(function (a, b) {
      if (a.id === winner) return -1;
      if (b.id === winner) return 1;
      if (b.pos !== a.pos) return b.pos - a.pos;
      if (b.correct !== a.correct) return b.correct - a.correct;
      if (a.wrong !== b.wrong) return a.wrong - b.wrong;
      return String(a.name).localeCompare(String(b.name));
    });
    return list;
  }

  function render() {
    if (!host) return;
    var room = getRoom();

    if (!room) {
      host.innerHTML = chrome(
        '<div class="panel-empty">A classificação e o registro da partida aparecem aqui durante o jogo.</div>' +
        '<div class="fichas-rule" style="border:1px dashed var(--line);border-radius:8px;padding:12px 14px;color:var(--ink-soft);font-size:12.5px;line-height:1.55;">' +
          'Vence quem chegar ao <b style="color:var(--gold-bright)">FIM</b> e acertar a pergunta final. ' +
          'Empates são desempatados pela casa alcançada e pelo número de acertos.' +
        '</div>'
      );
      return;
    }

    var active = getActive();
    var winner = null;
    if (room.winner) {
      (room.players || []).forEach(function (p) { if (p.id === room.winner) winner = p; });
    }

    var phaseLabel = room.phase === 'lobby' ? 'Sala de espera'
      : room.phase === 'ended' ? 'Partida encerrada'
      : room.phase === 'cancelled' ? 'Sala cancelada'
      : 'Em andamento';

    var meta = '<div class="placar-meta">' +
        '<span class="placar-pill">Sala <strong>' + esc(room.code) + '</strong></span>' +
        '<span class="placar-pill">' + esc(phaseLabel) + '</span>' +
        '<span class="placar-pill">Rodada <strong>' + (room.round || 1) + '</strong></span>' +
        '<span class="placar-pill">Pote <strong>' + (room.pot || 0) + '</strong></span>' +
      '</div>';

    var winnerBox = '';
    if (winner) {
      winnerBox = '<div class="placar-winner">' +
          '<span class="trophy">🏆</span>' +
          '<div class="placar-winner-text">' + esc(winner.name) + ' venceu' +
            '<small>chegou ao FIM e acertou a pergunta final</small>' +
          '</div>' +
        '</div>';
    }

    var rows = '<div class="placar-head">' +
        '<span>#</span><span>Jogador</span><span>Posição</span>' +
        '<span class="col-chips">Fichas</span><span style="text-align:right;">Acertos</span>' +
      '</div>';

    var rank = 0;
    sortedPlayers(room).forEach(function (p) {
      rank += 1;
      var isActive = !!(active && p.id === active.id && room.phase === 'playing');
      var cls = 'placar-row' +
        (isActive ? ' is-active' : '') +
        (p.id === room.winner ? ' is-winner' : '') +
        (p.left ? ' is-left' : '');
      rows += '<div class="' + cls + '" style="--pc:' + esc(p.color) + '">' +
          '<span class="placar-pos">' + rank + 'º</span>' +
          '<span class="placar-name"><span class="color-dot" style="background:' + esc(p.color) + '"></span>' +
            '<span>' + esc(p.name) + '</span></span>' +
          '<span class="placar-space">' + esc(p.left ? 'Saiu' : positionLabel(p.pos)) + '</span>' +
          '<span class="placar-chips">' + miniChips(p.chips) + '</span>' +
          '<span class="placar-stats"><b>' + (p.correct || 0) + '</b>✓ <i>' + (p.wrong || 0) + '</i>✗</span>' +
        '</div>';
    });

    var entries = (room.log || []).slice().reverse();
    var logHtml;
    if (!entries.length) {
      logHtml = '<div class="panel-empty">Nada registrado ainda.</div>';
    } else {
      logHtml = '<div class="placar-log">' + entries.map(function (e) {
        return '<div class="log-entry ' + esc(e.type || 'normal') + '">' +
          '<span>' + esc(e.text) + '</span>' +
          '<span class="ts">' + esc(fmtTime(e.ts)) + '</span>' +
        '</div>';
      }).join('') + '</div>';
    }

    var logBox = !!winner ? '<div class="placar-section-title">Registro da partida</div>' + logHtml
      : '<div class="placar-section-title">Registro</div>' + logHtml;

    host.innerHTML = chrome(meta + winnerBox + '<div class="placar-section-title">Classificação</div>' +
      '<div class="placar-table">' + rows + '</div>' + logBox);
  }

  window.mountPlacar = function (target) {
    if (mounted) return;
    host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) return;
    mounted = true;
    document.addEventListener('master:update', render);
    window.addEventListener('storage', render);
    render();
  };
})();
