/* ============================================================================
   MASTER — admin.js
   Painel do anfitrião (controles especiais da partida). Só aparece para quem
   é anfitrião (a aba é escondida pelo panel-nav.js). As ações chamam a API
   pública window.__master, que valida a permissão no main.js.

   Uso:
     <div id="admin-painel"></div>
     <script src="admin.js"></script>
     <script>mountAdmin('#admin-painel');</script>
   ========================================================================== */
(function () {
  'use strict';

  var mounted = false;
  var host = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function app() { return window.MasterApp || null; }
  function api() { return window.__master || {}; }

  function getRoom() {
    try { return app() && app().getRoom ? app().getRoom() : null; }
    catch (e) { return null; }
  }

  function isHost() {
    try { return !!(app() && app().isHost && app().isHost()); }
    catch (e) { return false; }
  }

  function getActive() {
    try { return app() && app().activePlayer ? app().activePlayer() : null; }
    catch (e) { return null; }
  }

  function stepLabel(step) {
    return {
      'theme': 'Escolha de tema',
      'bet': 'Aposta',
      'answer': 'Resposta',
      'reveal': 'Resultado da rodada',
      'final-theme': 'Escolha do tema final',
      'final-answer': 'Pergunta final',
      'final-reveal': 'Resultado final'
    }[step] || (step || '—');
  }

  function chrome(body) {
    return '<div class="panel-handle">' +
        '<h3>Anfitrião</h3>' +
        '<button type="button" class="panel-toggle" onclick="closePanelNav()">Minimizar</button>' +
      '</div>' +
      '<div class="panel-body admin-body">' + body + '</div>';
  }

  function playerRows(room) {
    var active = getActive();
    return (room.players || []).map(function (p) {
      var isActive = !!(active && p.id === active.id && room.phase === 'playing');
      return '<div class="admin-player-row" style="--pc:' + esc(p.color) + '">' +
          '<span class="color-dot" style="background:' + esc(p.color) + '"></span>' +
          '<span>' + esc(p.name) + '</span>' +
          (p.id === room.hostId ? '<span class="badge host">Anfitrião</span>' : '') +
          (isActive ? '<span class="badge host">Vez</span>' : '') +
          '<span class="meta">' + (p.left ? 'saiu' : 'casa ' + p.pos) + ' · ' +
            (p.chips || []).length + ' ficha' + ((p.chips || []).length === 1 ? '' : 's') + '</span>' +
        '</div>';
    }).join('');
  }

  function render() {
    if (!host) return;
    var room = getRoom();

    if (!room) {
      host.innerHTML = chrome(
        '<div class="admin-empty">Os controles do anfitrião ficam disponíveis durante uma partida local ou em uma sala online criada por você.</div>'
      );
      return;
    }

    if (!isHost()) {
      host.innerHTML = chrome(
        '<div class="admin-empty">Somente o anfitrião da sala pode usar estes controles.</div>'
      );
      return;
    }

    var active = getActive();
    var online = room.mode !== 'local';
    var q = room.question;

    var info = '<div class="admin-info">' +
        '<span class="admin-pill">Sala <strong>' + esc(room.code) + '</strong></span>' +
        '<span class="admin-pill">Modo <strong>' + (online ? 'Online' : 'Local') + '</strong></span>' +
        '<span class="admin-pill">Rodada <strong>' + (room.round || 1) + '</strong></span>' +
        '<span class="admin-pill">Etapa <strong>' + esc(stepLabel(room.step)) + '</strong></span>' +
        '<span class="admin-pill">Perguntas usadas <strong>' + ((room.usedQuestions || []).length) + '</strong></span>' +
      '</div>';

    var turnBox = '<div class="admin-note" style="border-left-color:var(--gold);background:rgba(242,193,78,.07);color:var(--ink-soft);">' +
        (room.phase === 'playing'
          ? 'Vez de <b style="color:var(--gold-bright)">' + esc(active ? active.name : '—') + '</b>' +
            (q ? ' · tema <b style="color:var(--gold-bright)">' + esc(q.theme) + '</b>' +
              (q.bet != null ? ' · aposta ' + q.bet : '') : '')
          : 'A partida não está em andamento agora.') +
      '</div>';

    var actions = '<div class="admin-grid">' +
        '<button type="button" class="admin-action" onclick="__master.adminSkip()">' +
          '<span class="aa-title">Pular pergunta / vez</span>' +
          '<span class="aa-desc">Avança a etapa atual ou passa a vez para o próximo jogador.</span>' +
        '</button>' +
        '<button type="button" class="admin-action" onclick="__master.adminRefillChips()">' +
          '<span class="aa-title">Devolver fichas</span>' +
          '<span class="aa-desc">Todos os jogadores recebem novamente as 5 fichas.</span>' +
        '</button>' +
        '<button type="button" class="admin-action is-danger" ' +
          'onclick="if(confirm(\'Reiniciar a partida? Todos voltam ao INÍCIO e a sala de espera.\')) __master.adminReset()">' +
          '<span class="aa-title">Reiniciar partida</span>' +
          '<span class="aa-desc">Volta todos ao INÍCIO, zera o placar e reabre a sala de espera.</span>' +
        '</button>' +
        '<button type="button" class="admin-action is-danger" ' +
          'onclick="if(confirm(\'Encerrar a partida agora e declarar vencedor quem estiver mais à frente?\')) __master.adminForceEnd()">' +
          '<span class="aa-title">Encerrar partida</span>' +
          '<span class="aa-desc">Declara vencedor quem estiver mais à frente no tabuleiro.</span>' +
        '</button>' +
        (online
          ? '<button type="button" class="admin-action" onclick="__master.copyCode()">' +
              '<span class="aa-title">Copiar código</span>' +
              '<span class="aa-desc">Copia o código da sala para convidar outros jogadores.</span>' +
            '</button>' +
            '<button type="button" class="admin-action is-danger" ' +
              'onclick="if(confirm(\'Cancelar a sala para todos os jogadores?\')) __master.cancelRoom()">' +
              '<span class="aa-title">Cancelar sala</span>' +
              '<span class="aa-desc">Encerra a sala online para todos os participantes.</span>' +
            '</button>'
          : '') +
        '<button type="button" class="admin-action" onclick="__master.leaveRoom()">' +
          '<span class="aa-title">Sair da partida</span>' +
          '<span class="aa-desc">' + (online ? 'Você deixa a sala; o anfitrião passa para outro jogador.' : 'Fecha esta mesa local.') + '</span>' +
        '</button>' +
      '</div>';

    var players = '<div class="placar-section-title">Jogadores</div>' +
      '<div class="admin-players">' + playerRows(room) + '</div>';

    host.innerHTML = chrome(info + turnBox +
      '<div class="placar-section-title">Controles</div>' + actions +
      players +
      '<div class="admin-note">Use estes controles com cuidado: eles alteram a partida para todos os jogadores da sala.</div>');
  }

  window.mountAdmin = function (target) {
    if (mounted) return;
    host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) return;
    mounted = true;
    document.addEventListener('master:update', render);
    window.addEventListener('storage', render);
    render();
  };
})();
