/* ============================================================================
   MASTER — main.js
   ----------------------------------------------------------------------------
   Lógica principal do jogo:
   • criação de partida local (2 a 6 jogadores no mesmo dispositivo)
   • salas online opcionais (Firestore, coleção "master_rooms")
   • turnos, escolha de tema, apostas, perguntas, respostas, tabuleiro e FIM

   A interface conversa com este arquivo por window.__master (usado nos
   onclick) e window.MasterApp (usado pelos painéis independentes).
   ========================================================================== */
(function () {
  'use strict';

  /* ==========================================================================
     CONSTANTES E ESTADO
     ========================================================================== */

  var SESSION_KEY = 'master_session_v1';
  var DEVICE_KEY = 'master_device_id_v1';
  var ROOM_PREFIX = 'master_room_';
  var PLAYER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
  var CHIP_VALUES = [1, 2, 3, 4, 5];
  var MAX_PLAYERS = 6;
  var MIN_PLAYERS = 2;

  var state = {
    screen: 'home',
    room: null,
    playerId: null,
    name: '',
    code: '',
    mode: 'local',
    error: '',
    joinError: '',
    isSpectator: false,
    local: {
      count: 2,
      names: ['', '', '', '', '', '']
    }
  };

  var unsubRoom = null;

  /* ==========================================================================
     ARMAZENAMENTO LOCAL
     ========================================================================== */

  function lsGet(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function lsSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* modo privado / cota cheia */ }
  }

  function getDeviceId() {
    var id = lsGet(DEVICE_KEY, null);
    if (!id) {
      id = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
      lsSet(DEVICE_KEY, id);
    }
    return id;
  }

  function roomKey(code) {
    return ROOM_PREFIX + code;
  }

  function readLocalRoom(code) {
    return lsGet(roomKey(code), null);
  }

  var localSubscribers = {};
  function notifyLocal(code, room) {
    var list = localSubscribers[code] || [];
    list.slice().forEach(function (cb) {
      try { cb(room); } catch (e) { console.warn(e); }
    });
  }

  function writeLocalRoom(room) {
    lsSet(roomKey(room.code), room);
    notifyLocal(room.code, room);
  }

  function deleteLocalRoom(code) {
    try { localStorage.removeItem(roomKey(code)); } catch (e) {}
    notifyLocal(code, null);
  }

  /* ==========================================================================
     STORE (local ou Firestore)
     ========================================================================== */

  function onlineReady() {
    return !!(window.masterOnline && window.masterDb);
  }

  // Partidas locais SEMPRE usam o localStorage — nunca o Firestore, mesmo que
  // o Firebase esteja configurado. Só salas online (mode: 'online') usam o banco.
  function useOnline() {
    return onlineReady() && state.mode !== 'local';
  }

  function onlineRooms() {
    return window.masterDb.collection('master_rooms');
  }

  var Store = {
    online: function () { return useOnline(); },

    create: function (room) {
      if (useOnline()) {
        return onlineRooms().doc(room.code).set(room);
      }
      writeLocalRoom(room);
      return Promise.resolve(room);
    },

    // forceOnline = true é usado ao entrar em uma sala pelo código, antes de
    // state.mode virar 'online'. Sem isso, um aparelho que abre o jogo pela
    // primeira vez (mode padrão 'local') leria o localStorage em vez do
    // Firestore e diria "Sala não encontrada".
    get: function (code, forceOnline) {
      if (useOnline() || forceOnline) {
        return onlineRooms().doc(code).get().then(function (snap) {
          return snap.exists ? snap.data() : null;
        });
      }
      return Promise.resolve(readLocalRoom(code));
    },

    subscribe: function (code, cb) {
      if (useOnline()) {
        return onlineRooms().doc(code).onSnapshot(function (snap) {
          cb(snap.exists ? snap.data() : null, null);
        }, function (err) {
          cb(null, err);
        });
      }
      localSubscribers[code] = localSubscribers[code] || [];
      localSubscribers[code].push(cb);
      cb(readLocalRoom(code), null);
      return function () {
        localSubscribers[code] = (localSubscribers[code] || []).filter(function (f) { return f !== cb; });
      };
    },

    mutate: function (code, fn) {
      if (useOnline()) {
        var ref = onlineRooms().doc(code);
        return window.masterDb.runTransaction(function (tx) {
          return tx.get(ref).then(function (snap) {
            if (!snap.exists) throw new Error('Esta sala não existe mais.');
            var room = snap.data();
            fn(room);
            tx.set(ref, room);
            return room;
          });
        });
      }
      var room = readLocalRoom(code);
      if (!room) return Promise.reject(new Error('Esta partida não existe mais neste dispositivo.'));
      fn(room);
      writeLocalRoom(room);
      return Promise.resolve(room);
    }
  };

  /* ==========================================================================
     SESSÃO
     ========================================================================== */

  function saveSession() {
    lsSet(SESSION_KEY, {
      code: state.code,
      pid: state.playerId,
      name: state.name,
      mode: state.mode
    });
  }

  function loadSession() {
    return lsGet(SESSION_KEY, null);
  }

  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  /* ==========================================================================
     HELPERS GERAIS
     ========================================================================== */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function genCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code = 'M';
    for (var i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  }

  function nowTs() {
    return Date.now();
  }

  function playerById(room, id) {
    if (!room || !room.players) return null;
    for (var i = 0; i < room.players.length; i++) {
      if (room.players[i].id === id) return room.players[i];
    }
    return null;
  }

  function activePlayer(room) {
    if (!room || !room.turnOrder || !room.turnOrder.length) return null;
    var len = room.turnOrder.length;
    for (var k = 0; k < len; k++) {
      var id = room.turnOrder[(room.turnIndex + k) % len];
      var p = playerById(room, id);
      if (p && !p.left) return p;
    }
    return null;
  }

  function activeIndex(room) {
    if (!room || !room.turnOrder || !room.turnOrder.length) return -1;
    var len = room.turnOrder.length;
    for (var k = 0; k < len; k++) {
      var idx = (room.turnIndex + k) % len;
      var p = playerById(room, room.turnOrder[idx]);
      if (p && !p.left) return idx;
    }
    return -1;
  }

  function isHost() {
    if (!state.room) return false;
    if (state.mode === 'local') return true;
    return state.room.hostId === state.playerId;
  }

  function myTurn() {
    if (!state.room || state.room.phase !== 'playing') return false;
    if (state.mode === 'local') return true;
    var p = activePlayer(state.room);
    return !!(p && p.id === state.playerId);
  }

  function amPlayer(room) {
    if (!room || !room.players) return false;
    if (state.mode === 'local') return true;
    return room.players.some(function (p) { return p.id === state.playerId; });
  }

  function assertTurn(room) {
    if (state.mode === 'local') return;
    var p = activePlayer(room);
    if (!p || p.id !== state.playerId) throw new Error('Não é a sua vez de jogar.');
  }

  function log(room, text, type) {
    room.log = room.log || [];
    room.log.push({ text: text, type: type || 'normal', ts: nowTs() });
    if (room.log.length > 140) room.log = room.log.slice(-140);
  }

  function fmtTime(ts) {
    try {
      return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  function letter(i) {
    return ['A', 'B', 'C', 'D'][i] || '?';
  }

  function newPlayer(id, name, color) {
    return {
      id: id,
      name: name,
      color: color,
      pos: 0,
      chips: CHIP_VALUES.slice(),
      correct: 0,
      wrong: 0,
      finished: false,
      rank: null,
      left: false
    };
  }

  function nextColor(room) {
    var used = (room.players || []).map(function (p) { return p.color; });
    for (var i = 0; i < PLAYER_COLORS.length; i++) {
      if (used.indexOf(PLAYER_COLORS[i]) < 0) return PLAYER_COLORS[i];
    }
    return PLAYER_COLORS[(room.players || []).length % PLAYER_COLORS.length];
  }

  function positionLabel(pos) {
    if (pos >= masterBoardLastPos()) return 'FIM';
    if (pos <= 0) return 'INÍCIO';
    var sp = masterBoardSpace(pos);
    return 'Casa ' + pos + ' · ' + masterSpaceLabel(sp);
  }

  function themeChip(themeKey, extraClass) {
    var t = masterTheme(themeKey);
    if (!t) return '';
    return '<span class="theme-chip ' + (extraClass || '') + '" style="--tc:' + t.color + ';--tc2:' + t.color2 + '">' +
      '<span class="theme-chip-icon">' + t.icon + '</span>' + esc(t.name) + '</span>';
  }

  /* ==========================================================================
     REGRAS DE TURNO
     ========================================================================== */

  function prepareQuestion(room, theme, isFinal) {
    var q = masterPickQuestion(room, theme);
    if (!q) return false;
    room.usedQuestions = room.usedQuestions || [];
    room.usedQuestions.push(q.id);
    room.question = {
      id: q.id,
      theme: q.theme,
      q: q.q,
      options: q.options,
      answer: q.answer,
      bet: null,
      chosen: null,
      correct: null,
      final: !!isFinal,
      skipped: false
    };
    room.selectedTheme = theme;
    room.step = isFinal ? 'final-answer' : 'bet';
    return true;
  }

  function startTurn(room) {
    var p = activePlayer(room);
    if (!p) return;

    room.round = Math.floor(room.turnIndex / Math.max(1, room.turnOrder.length)) + 1;

    if (p.pos >= masterBoardLastPos()) {
      room.step = 'final-theme';
      room.availableThemes = MASTER_THEME_ORDER.slice();
      room.selectedTheme = null;
      room.question = null;
      log(room, p.name + ' está no FIM e vai responder à pergunta final. Os outros jogadores escolhem o tema.', 'info');
      return;
    }

    if (!p.chips || p.chips.length === 0) {
      p.chips = CHIP_VALUES.slice();
      log(room, p.name + ' recolheu as 5 fichas de aposta.', 'info');
    }

    var space = masterBoardSpace(p.pos);
    var themes = (p.pos === 0) ? MASTER_THEME_ORDER.slice() : ((space && space.themes) || []).slice();
    room.availableThemes = themes;

    if (themes.length === 1) {
      room.selectedTheme = themes[0];
      prepareQuestion(room, themes[0], false);
      log(room, p.name + ' vai responder sobre ' + MASTER_THEMES[themes[0]].name + '.', 'info');
    } else {
      room.step = 'theme';
      room.selectedTheme = null;
      room.question = null;
    }
  }

  function advanceTurn(room) {
    if (room.phase !== 'playing') return;

    room.turnIndex = (room.turnIndex || 0) + 1;
    room.question = null;
    room.selectedTheme = null;
    room.step = 'theme';

    var allEmpty = (room.players || []).every(function (p) {
      return p.left || !p.chips || p.chips.length === 0;
    });
    if (allEmpty) {
      room.pot = 0;
      log(room, 'Todas as fichas foram usadas. O pote foi recolhido do centro do tabuleiro.', 'system');
    }

    startTurn(room);
  }

  function computeRanks(room) {
    var winner = playerById(room, room.winner);
    if (winner) winner.rank = 1;

    var rest = (room.players || []).filter(function (p) { return p.id !== room.winner; });
    rest.sort(function (a, b) {
      if (b.pos !== a.pos) return b.pos - a.pos;
      if (b.correct !== a.correct) return b.correct - a.correct;
      return String(a.name).localeCompare(String(b.name));
    });
    rest.forEach(function (p, i) { p.rank = i + 2; });
  }

  /* ==========================================================================
     INICIALIZAÇÃO / NAVEGAÇÃO
     ========================================================================== */

  function boot() {
    var s = loadSession();
    if (!s || !s.code) {
      render();
      return;
    }

    state.code = s.code;
    state.playerId = s.pid;
    state.name = s.name || '';
    state.mode = s.mode || 'online';

    if (state.mode === 'online' && !onlineReady()) {
      clearSession();
      state.error = 'A sala online não está disponível porque o Firebase não está configurado neste dispositivo.';
      render();
      return;
    }

    Store.get(state.code).then(function (room) {
      if (!room) {
        clearSession();
        render();
        return;
      }
      state.room = room;
      state.mode = room.mode || state.mode;
      state.screen = room.phase === 'lobby' ? 'lobby' : (room.phase === 'ended' ? 'ended' : 'game');
      subscribeRoom();
      render();
    }).catch(function (err) {
      clearSession();
      state.error = err && err.message ? err.message : 'Não foi possível retomar a partida.';
      render();
    });
  }

  function subscribeRoom() {
    if (unsubRoom) { unsubRoom(); unsubRoom = null; }
    if (!state.code) return;

    unsubRoom = Store.subscribe(state.code, function (room, err) {
      if (err) {
        state.error = 'Não foi possível sincronizar a sala. Verifique as regras do Firestore.';
        render();
        return;
      }
      if (!room) {
        if (state.room) {
          clearSession();
          state.room = null;
          state.code = '';
          state.playerId = null;
          state.isSpectator = false;
          state.screen = 'home';
          state.error = 'A sala foi encerrada.';
          render();
        }
        return;
      }

      state.room = room;
      state.mode = room.mode || state.mode;
      state.isSpectator = !!(room.spectators || []).some(function (s) { return s.id === state.playerId; }) &&
        !(room.players || []).some(function (p) { return p.id === state.playerId; });

      if (room.phase === 'lobby') state.screen = 'lobby';
      else if (room.phase === 'ended') state.screen = 'ended';
      else if (room.phase === 'playing') state.screen = 'game';
      else if (room.phase === 'cancelled') {
        clearSession();
        state.room = null;
        state.code = '';
        state.playerId = null;
        state.screen = 'home';
        state.error = 'O anfitrião encerrou a sala.';
      }

      render();
    });
  }

  /* ==========================================================================
     AÇÕES
     ========================================================================== */

  function mutateAndRender(fn) {
    if (!state.code) return;
    Store.mutate(state.code, fn).then(function (room) {
      if (state.mode === 'local') {
        state.room = room;
        render();
      }
    }).catch(function (err) {
      state.error = err && err.message ? err.message : 'Não foi possível concluir a ação.';
      render();
    });
  }

  function openLocalSetup() {
    state.screen = 'local-setup';
    state.error = '';
    render();
  }

  function setLocalCount(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) n = 2;
    state.local.count = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, n));
    render();
  }

  function setLocalName(i, value) {
    if (i >= 0 && i < MAX_PLAYERS) state.local.names[i] = value;
  }

  function createLocalGame() {
    var count = state.local.count;
    var names = [];
    for (var i = 0; i < count; i++) {
      var n = String(state.local.names[i] || '').trim() || ('Jogador ' + (i + 1));
      names.push(n.slice(0, 24));
    }

    var code = genCode();
    var players = names.map(function (name, idx) {
      return newPlayer('p' + (idx + 1), name, PLAYER_COLORS[idx]);
    });

    var room = {
      game: 'master',
      version: 1,
      code: code,
      mode: 'local',
      hostId: players[0].id,
      phase: 'lobby',
      players: players,
      spectators: [],
      turnOrder: [],
      turnIndex: 0,
      round: 1,
      step: 'theme',
      availableThemes: [],
      selectedTheme: null,
      question: null,
      usedQuestions: [],
      pot: 0,
      winner: null,
      log: [{ text: 'Mesa criada com ' + players.length + ' jogadores.', type: 'system', ts: nowTs() }],
      createdAt: nowTs()
    };

    state.code = code;
    state.playerId = players[0].id;
    state.name = players[0].name;
    state.mode = 'local';
    state.room = room;
    state.error = '';
    state.joinError = '';

    Store.create(room).then(function () {
      saveSession();
      subscribeRoom();
      state.screen = 'lobby';
      render();
    }).catch(function (err) {
      state.room = null;
      state.code = '';
      state.playerId = null;
      state.screen = 'local-setup';
      state.error = err && err.message ? err.message : 'Não foi possível criar a mesa.';
      render();
    });
  }

  function createOnlineRoom() {
    if (!onlineReady()) {
      state.error = 'O modo online não está configurado. Preencha o firebase-config.js ou use a partida local.';
      render();
      return;
    }

    var nameEl = document.getElementById('home-name');
    var name = nameEl ? nameEl.value.trim() : '';
    if (!name) {
      state.error = 'Digite seu nome para criar a sala.';
      render();
      return;
    }

    var code = genCode();
    var pid = code + '-' + getDeviceId();
    var room = {
      game: 'master',
      version: 1,
      code: code,
      mode: 'online',
      hostId: pid,
      phase: 'lobby',
      players: [newPlayer(pid, name.slice(0, 24), PLAYER_COLORS[0])],
      spectators: [],
      turnOrder: [],
      turnIndex: 0,
      round: 1,
      step: 'theme',
      availableThemes: [],
      selectedTheme: null,
      question: null,
      usedQuestions: [],
      pot: 0,
      winner: null,
      log: [{ text: name + ' abriu a sala ' + code + '.', type: 'system', ts: nowTs() }],
      createdAt: nowTs()
    };

    state.code = code;
    state.playerId = pid;
    state.name = name;
    state.mode = 'online';
    state.room = room;
    state.isSpectator = false;
    state.error = '';
    state.joinError = '';

    Store.create(room).then(function () {
      saveSession();
      subscribeRoom();
      state.screen = 'lobby';
      render();
    }).catch(function (err) {
      state.room = null;
      state.code = '';
      state.playerId = null;
      state.screen = 'home';
      state.error = 'Não foi possível criar a sala. Confira o Firebase e as regras do Firestore.';
      console.warn(err);
      render();
    });
  }

  function joinOnlineRoom() {
    if (!onlineReady()) {
      state.error = 'O modo online não está configurado. Preencha o firebase-config.js ou use a partida local.';
      render();
      return;
    }

    var nameEl = document.getElementById('home-name');
    var codeEl = document.getElementById('join-code');
    var name = nameEl ? nameEl.value.trim() : '';
    var code = codeEl ? codeEl.value.trim().toUpperCase() : '';

    if (!name || !code) {
      state.joinError = 'Preencha seu nome e o código da sala.';
      render();
      return;
    }

    var pid = code + '-' + getDeviceId();

    Store.get(code, true).then(function (room) {
      if (!room || room.game !== 'master') {
        state.joinError = 'Sala não encontrada. Confira o código.';
        render();
        return;
      }

      var wasPlaying = room.phase !== 'lobby';
      var alreadyIn = (room.players || []).some(function (p) { return p.id === pid; });

      state.code = code;
      state.playerId = pid;
      state.name = name;
      state.mode = 'online';
      state.isSpectator = false;
      state.error = '';
      state.joinError = '';

      // Partida já começou e o jogador não está nela: entra como espectador
      // (não interfere no jogo e não pode responder nem apostar).
      if (!alreadyIn && wasPlaying) {
        state.isSpectator = true;
        return Store.mutate(code, function (r) {
          var exists = (r.players || []).some(function (p) { return p.id === pid; });
          if (exists) return;
          r.spectators = r.spectators || [];
          var alreadySp = r.spectators.some(function (s) { return s.id === pid; });
          if (!alreadySp) {
            r.spectators.push({ id: pid, name: name.slice(0, 24), joinedAt: nowTs() });
            log(r, name + ' entrou para assistir à partida.', 'system');
          }
        }).then(function () {
          saveSession();
          subscribeRoom();
          state.screen = 'game';
          render();
        });
      }

      return Store.mutate(code, function (r) {
        var exists = (r.players || []).some(function (p) { return p.id === pid; });
        if (exists) return;
        if (r.phase !== 'lobby') throw new Error('Esta partida já começou.');
        if (r.players.length >= MAX_PLAYERS) throw new Error('A sala está cheia (máximo de 6 jogadores).');
        r.players.push(newPlayer(pid, name.slice(0, 24), nextColor(r)));
        log(r, name + ' entrou na sala.', 'system');
      }).then(function () {
        saveSession();
        subscribeRoom();
        state.screen = 'lobby';
        render();
      });
    }).catch(function (err) {
      state.room = null;
      state.code = '';
      state.playerId = null;
      state.isSpectator = false;
      state.screen = 'home';
      state.joinError = err && err.message ? err.message : 'Não foi possível entrar na sala.';
      render();
    });
  }

  function startGame() {
    if (!isHost()) return;
    mutateAndRender(function (room) {
      if (room.phase !== 'lobby') return;
      if ((room.players || []).length < MIN_PLAYERS) {
        throw new Error('São necessários pelo menos 2 jogadores.');
      }

      room.phase = 'playing';
      room.turnOrder = room.players.map(function (p) { return p.id; });
      room.turnIndex = 0;
      room.round = 1;
      room.pot = 0;
      room.question = null;
      room.selectedTheme = null;
      room.availableThemes = [];
      room.usedQuestions = [];
      room.winner = null;

      room.players.forEach(function (p) {
        p.pos = 0;
        p.chips = CHIP_VALUES.slice();
        p.correct = 0;
        p.wrong = 0;
        p.finished = false;
        p.rank = null;
        p.left = false;
      });

      log(room, 'A partida começou! Boa sorte a todos.', 'system');
      startTurn(room);
    });
  }

  function chooseTheme(theme) {
    mutateAndRender(function (room) {
      assertTurn(room);
      if (room.phase !== 'playing' || room.step !== 'theme') return;
      if ((room.availableThemes || []).indexOf(theme) < 0) return;
      var p = activePlayer(room);
      prepareQuestion(room, theme, false);
      log(room, p.name + ' escolheu o tema ' + MASTER_THEMES[theme].name + '.', 'info');
    });
  }

  function chooseFinalTheme(theme) {
    mutateAndRender(function (room) {
      if (room.phase !== 'playing' || room.step !== 'final-theme') return;
      if (MASTER_THEME_ORDER.indexOf(theme) < 0) return;

      var p = activePlayer(room);
      if (!p) return;
      if (state.mode !== 'local' && !amPlayer(room)) {
        throw new Error('Espectadores não escolhem o tema da pergunta final.');
      }
      if (state.mode !== 'local' && p.id === state.playerId) {
        throw new Error('O tema da pergunta final é escolhido pelos outros jogadores.');
      }

      prepareQuestion(room, theme, true);
      log(room, 'O tema da pergunta final é ' + MASTER_THEMES[theme].name + '.', 'system');
    });
  }

  function placeBet(value) {
    value = parseInt(value, 10);
    mutateAndRender(function (room) {
      assertTurn(room);
      if (room.phase !== 'playing' || room.step !== 'bet' || !room.question) return;

      var p = activePlayer(room);
      var idx = (p.chips || []).indexOf(value);
      if (idx < 0) throw new Error('Essa ficha já foi usada.');

      p.chips.splice(idx, 1);
      room.question.bet = value;
      room.pot = (room.pot || 0) + 1;
      room.step = 'answer';
      log(room, p.name + ' apostou ' + value + ' ponto' + (value > 1 ? 's' : '') + '.', 'normal');
    });
  }

  function answerQuestion(index) {
    index = parseInt(index, 10);
    mutateAndRender(function (room) {
      assertTurn(room);
      if (room.phase !== 'playing') return;
      if (room.step !== 'answer' && room.step !== 'final-answer') return;
      if (!room.question || room.question.chosen != null) return;

      var p = activePlayer(room);
      var q = room.question;
      q.chosen = index;
      q.correct = index === q.answer;

      if (q.final) {
        if (q.correct) {
          p.correct += 1;
          p.finished = true;
          room.winner = p.id;
          room.phase = 'ended';
          room.step = 'final-reveal';
          computeRanks(room);
          log(room, '🏆 ' + p.name + ' acertou a pergunta final e venceu a partida!', 'win');
        } else {
          p.wrong += 1;
          room.step = 'final-reveal';
          log(room, p.name + ' errou a pergunta final. Continua no FIM e tentará novamente na próxima rodada.', 'bad');
        }
        return;
      }

      if (q.correct) {
        p.correct += 1;
        var before = p.pos;
        p.pos = Math.min(masterBoardLastPos(), p.pos + (q.bet || 1));
        var moved = p.pos - before;
        if (p.pos >= masterBoardLastPos()) {
          log(room, '✅ ' + p.name + ' acertou e avançou ' + moved + ' casa' + (moved > 1 ? 's' : '') + ', chegando ao FIM!', 'good');
        } else {
          log(room, '✅ ' + p.name + ' acertou e avançou ' + moved + ' casa' + (moved > 1 ? 's' : '') + '.', 'good');
        }
      } else {
        p.wrong += 1;
        log(room, '❌ ' + p.name + ' errou e permanece na casa ' + p.pos + '.', 'bad');
      }

      room.step = 'reveal';
    });
  }

  function continueTurn() {
    mutateAndRender(function (room) {
      if (room.phase !== 'playing') return;
      if (room.step !== 'reveal' && room.step !== 'final-reveal') return;
      if (state.mode !== 'local') {
        var p = activePlayer(room);
        if (!p || p.id !== state.playerId) throw new Error('Aguarde o jogador da vez continuar.');
      }
      advanceTurn(room);
    });
  }

  function copyCode() {
    if (!state.code) return;
    var text = state.code;
    function done() {
      var btn = document.getElementById('copy-code-btn');
      if (btn) {
        btn.textContent = 'Copiado!';
        setTimeout(function () { btn.textContent = 'Copiar'; }, 1500);
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, onDone) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      onDone();
    } catch (e) {}
  }

  function leaveRoom() {
    if (!state.code) {
      state.screen = 'home';
      render();
      return;
    }

    var code = state.code;
    var pid = state.playerId;

    function finish() {
      if (unsubRoom) { unsubRoom(); unsubRoom = null; }
      clearSession();
      state.room = null;
      state.code = '';
      state.playerId = null;
      state.isSpectator = false;
      state.screen = 'home';
      state.error = '';
      state.joinError = '';
      render();
    }

    if (state.mode === 'local') {
      deleteLocalRoom(code);
      finish();
      return;
    }

    Store.mutate(code, function (room) {
      var p = playerById(room, pid);
      if (room.phase === 'lobby') {
        room.players = (room.players || []).filter(function (pp) { return pp.id !== pid; });
        if (room.hostId === pid) {
          room.hostId = room.players.length ? room.players[0].id : null;
        }
        if (!room.players.length) room.phase = 'cancelled';
      } else if (p) {
        p.left = true;
      }
      log(room, (state.name || 'Um jogador') + ' saiu da partida.', 'system');
    }).then(finish).catch(finish);
  }

  function cancelRoom() {
    if (!isHost()) return;
    Store.mutate(state.code, function (room) {
      room.phase = 'cancelled';
      log(room, 'O anfitrião encerrou a sala.', 'system');
    }).then(function () {
      if (unsubRoom) { unsubRoom(); unsubRoom = null; }
      clearSession();
      state.room = null;
      state.code = '';
      state.playerId = null;
      state.screen = 'home';
      state.error = '';
      render();
    }).catch(function (err) {
      state.error = err && err.message ? err.message : 'Não foi possível encerrar a sala.';
      render();
    });
  }

  function backHome() {
    state.screen = 'home';
    state.error = '';
    state.joinError = '';
    render();
  }

  function openRules() {
    if (typeof window.openMasterPanel === 'function') window.openMasterPanel('regras');
  }

  /* ---- controles do anfitrião ---- */

  function adminSkip() {
    mutateAndRender(function (room) {
      if (!isHost() && state.mode !== 'local') throw new Error('Apenas o anfitrião pode fazer isso.');
      if (room.phase !== 'playing') return;
      if (room.question && (room.step === 'bet' || room.step === 'answer' || room.step === 'final-answer')) {
        room.question.skipped = true;
        room.step = room.question.final ? 'final-reveal' : 'reveal';
        log(room, 'O anfitrião pulou a pergunta atual.', 'system');
      } else {
        log(room, 'O anfitrião pulou a vez de ' + (activePlayer(room) || {}).name + '.', 'system');
        advanceTurn(room);
      }
    });
  }

  function adminRefillChips() {
    mutateAndRender(function (room) {
      if (!isHost() && state.mode !== 'local') throw new Error('Apenas o anfitrião pode fazer isso.');
      (room.players || []).forEach(function (p) { p.chips = CHIP_VALUES.slice(); });
      log(room, 'O anfitrião devolveu todas as fichas aos jogadores.', 'system');
    });
  }

  function adminReset() {
    mutateAndRender(function (room) {
      if (!isHost() && state.mode !== 'local') throw new Error('Apenas o anfitrião pode fazer isso.');
      room.phase = 'lobby';
      room.turnOrder = [];
      room.turnIndex = 0;
      room.round = 1;
      room.pot = 0;
      room.question = null;
      room.selectedTheme = null;
      room.availableThemes = [];
      room.usedQuestions = [];
      room.winner = null;
      (room.players || []).forEach(function (p) {
        p.pos = 0;
        p.chips = CHIP_VALUES.slice();
        p.correct = 0;
        p.wrong = 0;
        p.finished = false;
        p.rank = null;
        p.left = false;
      });
      log(room, 'A partida foi reiniciada. Todos voltaram para o INÍCIO.', 'system');
    });
  }

  function adminForceEnd() {
    mutateAndRender(function (room) {
      if (!isHost() && state.mode !== 'local') throw new Error('Apenas o anfitrião pode fazer isso.');
      if (room.phase !== 'playing') return;
      var best = null;
      (room.players || []).forEach(function (p) {
        if (p.left) return;
        if (!best || p.pos > best.pos || (p.pos === best.pos && p.correct > best.correct)) best = p;
      });
      if (!best) return;
      room.winner = best.id;
      room.phase = 'ended';
      room.step = 'final-reveal';
      computeRanks(room);
      log(room, 'O anfitrião encerrou a partida. Vitória de ' + best.name + '.', 'win');
    });
  }

  /* ==========================================================================
     RENDERIZAÇÃO
     ========================================================================== */

  function render() {
    var app = document.getElementById('app');
    if (!app) return;

    if (state.screen === 'home') app.innerHTML = renderHome();
    else if (state.screen === 'local-setup') app.innerHTML = renderLocalSetup();
    else if (!state.room) app.innerHTML = renderHome();
    else if (state.room.phase === 'lobby') app.innerHTML = renderLobby();
    else if (state.room.phase === 'ended' || state.screen === 'ended') app.innerHTML = renderEnded();
    else app.innerHTML = renderGame();

    document.dispatchEvent(new CustomEvent('master:update', {
      detail: { room: state.room, state: state }
    }));
  }

  function renderMasthead(kicker, sub) {
    var ribbon = MASTER_THEME_ORDER.map(function (k) {
      return '<span style="background:' + MASTER_THEMES[k].color + '"></span>';
    }).join('');

    return '<header class="masthead">' +
      '<div class="theme-ribbon">' + ribbon + '</div>' +
      '<div class="kicker">' + esc(kicker) + '</div>' +
      '<h1>MASTER</h1>' +
      (sub ? '<div class="sub">' + esc(sub) + '</div>' : '') +
      '</header>';
  }

  function errorBanner() {
    if (!state.error) return '';
    return '<div class="banner banner-error">' + esc(state.error) + '</div>';
  }

  function renderHome() {
    var online = onlineReady();

    return renderMasthead('Jogo de perguntas, apostas e tabuleiro',
      'Responda, aposte suas fichas e seja o primeiro a chegar ao FIM.') +
      errorBanner() +
      '<div class="home-grid">' +

        '<section class="panel home-card">' +
          '<div class="home-card-icon">🎲</div>' +
          '<h2>Partida local</h2>' +
          '<p class="home-card-text">De 2 a 6 jogadores no mesmo dispositivo. O aparelho passa de mão em mão a cada rodada.</p>' +
          '<button class="primary" onclick="__master.openLocalSetup()">Começar partida local</button>' +
        '</section>' +

        '<section class="panel home-card">' +
          '<div class="home-card-icon">🌐</div>' +
          '<h2>Sala online</h2>' +
          '<p class="home-card-text">Cada jogador usa o próprio celular. Crie uma sala e compartilhe o código.</p>' +
          (online ? '' : '<p class="home-note">Online não configurado neste projeto. A partida local funciona normalmente.</p>') +
          '<div class="field">' +
            '<label for="home-name">Seu nome</label>' +
            '<input type="text" id="home-name" maxlength="24" placeholder="Ex: Ana">' +
          '</div>' +
          '<div class="row">' +
            '<button onclick="__master.createOnline()"' + (online ? '' : ' disabled') + '>Criar sala</button>' +
          '</div>' +
          '<div class="field" style="margin-top:14px;">' +
            '<label for="join-code">Código da sala</label>' +
            '<input type="text" id="join-code" maxlength="5" placeholder="Ex: M7K2P" class="code-input">' +
          '</div>' +
          '<button onclick="__master.joinOnline()"' + (online ? '' : ' disabled') + '>Entrar em sala</button>' +
          (state.joinError ? '<div class="error">' + esc(state.joinError) + '</div>' : '') +
        '</section>' +

      '</div>' +

      '<section class="panel home-rules">' +
        '<div>' +
          '<h2>Como funciona</h2>' +
          '<p>Cada jogador começa no INÍCIO com 5 fichas numeradas de 1 a 5. A casa em que o peão está indica o tema da pergunta. Aposte uma ficha, responda e, se acertar, avance o número de casas apostado. Quem chegar ao FIM e acertar a pergunta final vence.</p>' +
        '</div>' +
        '<button class="ghost" onclick="__master.openRules()">Ler as regras completas</button>' +
      '</section>';
  }

  function renderLocalSetup() {
    var count = state.local.count;
    var countButtons = '';
    for (var n = MIN_PLAYERS; n <= MAX_PLAYERS; n++) {
      countButtons += '<button type="button" class="count-btn' + (n === count ? ' active' : '') + '" onclick="__master.setLocalCount(' + n + ')">' + n + '</button>';
    }

    var rows = '';
    for (var i = 0; i < count; i++) {
      var val = state.local.names[i] || '';
      rows += '<div class="player-setup-row">' +
        '<span class="color-dot" style="background:' + PLAYER_COLORS[i] + '"></span>' +
        '<input type="text" maxlength="24" id="local-name-' + i + '" value="' + esc(val) + '" ' +
          'placeholder="Jogador ' + (i + 1) + '" oninput="__master.setLocalName(' + i + ', this.value)">' +
        (i === 0 ? '<span class="mini-badge">1º a jogar</span>' : '') +
      '</div>';
    }

    return renderMasthead('Preparação da mesa', 'Escolha quantos jogadores vão disputar a partida.') +
      errorBanner() +
      '<section class="panel">' +
        '<div class="section-title"><h2>Jogadores</h2><button class="small ghost" onclick="__master.backHome()">Voltar</button></div>' +
        '<p class="hint">A ordem dos campos é a ordem dos turnos. Nomes em branco recebem "Jogador N".</p>' +
        '<div class="count-row">' + countButtons + '</div>' +
        '<div class="player-setup-list">' + rows + '</div>' +
        '<button class="primary wide" style="margin-top:18px;" onclick="__master.createLocal()">Criar mesa</button>' +
      '</section>';
  }

  function renderLobby() {
    var room = state.room;
    var host = isHost();
    var players = room.players || [];
    var canStart = players.length >= MIN_PLAYERS;

    var list = players.map(function (p) {
      return '<div class="player-row' + (p.id === room.hostId ? ' is-host' : '') + '">' +
        '<span class="color-dot" style="background:' + p.color + '"></span>' +
        '<span class="player-name">' + esc(p.name) + '</span>' +
        (p.id === room.hostId ? '<span class="badge host">Anfitrião</span>' : '') +
      '</div>';
    }).join('');

    return renderMasthead('Sala de espera', room.mode === 'local' ? 'Mesa local — passe o dispositivo entre os jogadores.' : 'Compartilhe o código com seus amigos.') +
      errorBanner() +
      '<section class="panel">' +
        '<div class="section-title">' +
          '<h2>' + (room.mode === 'local' ? 'Mesa local' : 'Código da sala') + '</h2>' +
          '<button class="small ghost" onclick="__master.leaveRoom()">Sair</button>' +
        '</div>' +
        (room.mode === 'local'
          ? '<p class="hint">Código interno: <b>' + esc(room.code) + '</b></p>'
          : '<div class="code-row"><div class="code-badge">' + esc(room.code) + '</div>' +
            '<button type="button" class="small" id="copy-code-btn" onclick="__master.copyCode()">Copiar</button></div>') +
        '<div class="players-list">' + list + '</div>' +
        '<p class="hint">' + players.length + ' de ' + MAX_PLAYERS + ' jogadores. Mínimo de ' + MIN_PLAYERS + ' para começar.</p>' +
        (host
          ? '<button class="primary wide" style="margin-top:16px;" onclick="__master.startGame()"' + (canStart ? '' : ' disabled') + '>Iniciar partida</button>'
          : '<p class="hint">Aguarde o anfitrião iniciar a partida.</p>') +
        (room.mode !== 'local' && host ? '<button class="danger wide" style="margin-top:10px;" onclick="__master.cancelRoom()">Cancelar sala</button>' : '') +
      '</section>';
  }

  function renderTurnCard() {
    var room = state.room;
    var p = activePlayer(room);
    if (!p) {
      return '<section class="panel turn-card"><div class="panel-empty">Não há jogadores ativos nesta partida.</div></section>';
    }

    var can = myTurn();
    var step = room.step;
    var q = room.question;

    var eyebrow = state.mode === 'local'
      ? 'Rodada ' + (room.round || 1) + ' · Vez de ' + p.name
      : (can ? 'Sua vez' : 'Vez de ' + p.name);

    var head = '<div class="turn-head">' +
      '<div class="turn-eyebrow">' + esc(eyebrow) + '</div>' +
      '<div class="turn-player"><span class="color-dot lg" style="background:' + p.color + '"></span>' +
        '<span>' + esc(p.name) + '</span>' +
        '<span class="turn-pos">' + esc(positionLabel(p.pos)) + '</span>' +
      '</div>' +
    '</div>';

    var body = '';

    if (step === 'theme') {
      body = '<h3 class="turn-title">Escolha o tema</h3>' +
        '<p class="turn-sub">A casa atual permite ' + (room.availableThemes || []).length + ' tema' +
          ((room.availableThemes || []).length > 1 ? 's' : '') + '. ' +
          (can ? 'Escolha antes de apostar.' : 'Aguarde a escolha de ' + esc(p.name) + '.') + '</p>' +
        renderThemeGrid(room.availableThemes, can ? '__master.chooseTheme' : null);
    }

    else if (step === 'bet' && q) {
      body = '<h3 class="turn-title">Leia a pergunta e aposte uma ficha</h3>' +
        '<p class="turn-sub">' + (can ? 'Escolha o quanto você confia na resposta: a ficha vale casas no tabuleiro.' : esc(p.name) + ' está escolhendo a aposta.') + '</p>' +
        themeChip(q.theme, 'big') +
        renderQuestion(q, 'bet', false) +
        '<div class="bet-area">' +
          '<div class="bet-label">Sua aposta</div>' +
          renderChips(p.chips, can, true) +
        '</div>';
    }

    else if (step === 'answer' && q) {
      body = '<h3 class="turn-title">Qual é a resposta?</h3>' +
        '<p class="turn-sub">' + (can ? 'Peça a outro jogador para ler em voz alta e marque a alternativa.' : esc(p.name) + ' está respondendo.') + '</p>' +
        themeChip(q.theme, 'big') +
        (q.bet ? '<div class="bet-badge">Aposta: <b>' + q.bet + '</b> ponto' + (q.bet > 1 ? 's' : '') + '</div>' : '') +
        renderQuestion(q, 'answer', can);
    }

    else if (step === 'reveal' && q) {
      body = renderReveal(q, p, can);
    }

    else if (step === 'final-theme') {
      var canChooseFinal = state.mode === 'local' || !can;
      body = '<h3 class="turn-title">Pergunta final</h3>' +
        '<p class="turn-sub">' + esc(p.name) + ' chegou ao FIM. ' +
          (state.mode === 'local'
            ? 'Os outros jogadores escolhem o tema em conjunto.'
            : (can ? 'Aguarde: os outros jogadores estão escolhendo o tema.' : 'Escolha o tema da pergunta final para ' + esc(p.name) + '.')) +
        '</p>' +
        renderThemeGrid(MASTER_THEME_ORDER, canChooseFinal ? '__master.chooseFinalTheme' : null);
    }

    else if (step === 'final-answer' && q) {
      body = '<h3 class="turn-title">Pergunta final</h3>' +
        '<p class="turn-sub">' + (can ? 'Acerte para vencer a partida!' : esc(p.name) + ' está respondendo à pergunta final.') + '</p>' +
        themeChip(q.theme, 'big final') +
        renderQuestion(q, 'final-answer', can);
    }

    else if (step === 'final-reveal' && q) {
      body = renderReveal(q, p, can);
    }

    else {
      body = '<div class="panel-empty">Aguardando o próximo passo...</div>';
    }

    return '<section class="panel turn-card">' + head + body + '</section>';
  }

  function renderThemeGrid(themes, action) {
    if (!themes || !themes.length) return '<div class="panel-empty">Nenhum tema disponível.</div>';
    return '<div class="theme-grid">' + themes.map(function (key) {
      var t = masterTheme(key);
      if (!t) return '';
      var click = action ? ' onclick="' + action + '(\'' + key + '\')"' : '';
      var cls = 'theme-btn' + (action ? '' : ' disabled');
      return '<button type="button" class="' + cls + '" style="--tc:' + t.color + ';--tc2:' + t.color2 + '"' + click + (action ? '' : ' disabled') + '>' +
        '<span class="theme-btn-icon">' + t.icon + '</span>' +
        '<span class="theme-btn-name">' + esc(t.name) + '</span>' +
        '<span class="theme-btn-desc">' + esc(t.desc) + '</span>' +
      '</button>';
    }).join('') + '</div>';
  }

  function renderQuestion(q, mode, interactive) {
    var reveal = (mode === 'reveal');
    var correctIndex = q.answer;
    var chosen = q.chosen;

    var options = q.options.map(function (opt, i) {
      var cls = 'option';
      if (reveal) {
        if (i === correctIndex) cls += ' correct';
        if (chosen === i && i !== correctIndex) cls += ' wrong';
      }
      var disabled = interactive ? '' : ' disabled';
      var click = interactive ? ' onclick="__master.answer(' + i + ')"' : '';
      return '<button type="button" class="' + cls + '"' + click + disabled + '>' +
        '<span class="opt-letter">' + letter(i) + '</span>' +
        '<span class="opt-text">' + esc(opt) + '</span>' +
        (reveal && i === correctIndex ? '<span class="opt-mark">✓</span>' : '') +
      '</button>';
    }).join('');

    var hint = '';
    if (mode === 'bet') hint = '<p class="q-hint">A pergunta só pode ser respondida depois de colocar uma ficha no centro.</p>';
    if (mode === 'answer') hint = '<p class="q-hint">Confira a alternativa e toque nela para responder.</p>';
    if (mode === 'final-answer') hint = '<p class="q-hint">Esta é a pergunta final: acertar garante a vitória.</p>';

    return '<div class="question-card' + (q.final ? ' final' : '') + '">' +
      '<div class="q-text">' + esc(q.q) + '</div>' +
      '<div class="options">' + options + '</div>' +
      hint +
    '</div>';
  }

  function renderReveal(q, p, can) {
    var ok = !!q.correct;
    var title, text;

    if (q.skipped) {
      title = 'Pergunta pulada';
      text = 'O anfitrião pulou esta pergunta.';
    } else if (q.final) {
      if (ok) {
        title = 'Vitória!';
        text = p.name + ' acertou a pergunta final e venceu a partida.';
      } else {
        title = 'Resposta errada';
        text = p.name + ' errou a pergunta final e continua no FIM. Tentará novamente na próxima rodada.';
      }
    } else if (ok) {
      title = 'Acertou!';
      text = p.name + ' avançou ' + (q.bet || 1) + ' casa' + ((q.bet || 1) > 1 ? 's' : '') + ' no tabuleiro.';
    } else {
      title = 'Resposta errada';
      text = p.name + ' permanece na mesma casa e perdeu a ficha desta rodada.';
    }

    var revealQuestion = '<div class="question-card reveal-card">' +
      '<div class="q-text">' + esc(q.q) + '</div>' +
      '<div class="options">' + q.options.map(function (opt, i) {
        var cls = 'option';
        if (i === q.answer) cls += ' correct';
        if (q.chosen === i && i !== q.answer) cls += ' wrong';
        return '<button type="button" class="' + cls + '" disabled>' +
          '<span class="opt-letter">' + letter(i) + '</span>' +
          '<span class="opt-text">' + esc(opt) + '</span>' +
          (i === q.answer ? '<span class="opt-mark">✓</span>' : '') +
        '</button>';
      }).join('') + '</div>' +
    '</div>';

    var showContinue = can && state.room.phase === 'playing';

    return '<div class="result-banner ' + (ok ? 'ok' : 'bad') + '">' +
        '<div class="result-title">' + esc(title) + '</div>' +
        '<div class="result-text">' + esc(text) + '</div>' +
        (q.chosen != null && !q.skipped
          ? '<div class="result-answer">Resposta correta: <b>' + letter(q.answer) + ') ' + esc(q.options[q.answer]) + '</b></div>'
          : '') +
      '</div>' +
      revealQuestion +
      (showContinue ? '<button class="primary wide" style="margin-top:14px;" onclick="__master.continueTurn()">' + (q.final && ok ? 'Ver resultado' : 'Continuar') + '</button>' : '');
  }

  function renderChips(chips, interactive, showValues) {
    var owned = chips || [];
    var html = '<div class="chips-row">';
    CHIP_VALUES.forEach(function (v) {
      var has = owned.indexOf(v) >= 0;
      var clickable = !!(interactive && has);
      var cls = 'chip' + (has ? '' : ' used') + (clickable ? ' clickable' : '');
      var click = clickable ? ' onclick="__master.placeBet(' + v + ')"' : '';
      var a11y = clickable
        ? ' role="button" tabindex="0" aria-label="Apostar ficha ' + v + '"' +
          ' onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();__master.placeBet(' + v + ');}"'
        : ' aria-hidden="true"';
      html += '<div class="' + cls + '"' + click + a11y + ' title="Ficha ' + v + '">' +
        '<span class="chip-inner">' + (showValues === false ? '' : v) + '</span>' +
      '</div>';
    });
    html += '</div>';
    return html;
  }

  function renderPlayers() {
    var room = state.room;
    var active = activePlayer(room);
    var html = '<div class="players-grid">';

    (room.players || []).forEach(function (p) {
      var isActive = active && p.id === active.id && room.phase === 'playing';
      var cls = 'player-card' + (isActive ? ' active' : '') + (p.left ? ' left' : '') + (p.finished ? ' finished' : '');
      var you = (state.mode !== 'local' && p.id === state.playerId) ? '<span class="mini-badge you">você</span>' : '';
      html += '<div class="' + cls + '" style="--pc:' + p.color + '">' +
        '<div class="pc-top">' +
          '<span class="color-dot" style="background:' + p.color + '"></span>' +
          '<span class="pc-name">' + esc(p.name) + '</span>' +
          you +
          (p.id === room.hostId ? '<span class="crown" title="Anfitrião">👑</span>' : '') +
        '</div>' +
        '<div class="pc-pos">' + esc(p.left ? 'Saiu da partida' : positionLabel(p.pos)) + '</div>' +
        '<div class="pc-chips">' + renderChips(p.chips, false, true) + '</div>' +
        '<div class="pc-stats"><span>✅ ' + p.correct + '</span><span>❌ ' + p.wrong + '</span>' +
          (p.rank ? '<span class="pc-rank">' + p.rank + 'º</span>' : '') +
        '</div>' +
      '</div>';
    });

    html += '</div>';
    return html;
  }

  function renderLog() {
    var room = state.room;
    var entries = (room.log || []).slice(-18).reverse();
    if (!entries.length) return '<div class="panel-empty">Nada registrado ainda.</div>';

    return '<div class="log">' + entries.map(function (e) {
      return '<div class="log-entry ' + esc(e.type || 'normal') + '">' +
        '<span>' + esc(e.text) + '</span>' +
        '<span class="ts">' + fmtTime(e.ts) + '</span>' +
      '</div>';
    }).join('') + '</div>';
  }

  function turnAlert(room) {
    var step = room.step;
    var text = 'Siga as instruções da rodada.';
    if (step === 'theme') text = 'Escolha o tema da pergunta.';
    else if (step === 'bet') text = 'Aposte uma ficha antes de responder.';
    else if (step === 'answer') text = 'Marque a alternativa correta.';
    else if (step === 'reveal') text = 'Confira o resultado e continue.';
    else if (step === 'final-answer') text = 'Acerte a pergunta final para vencer!';
    else if (step === 'final-reveal') text = 'Confira o resultado final.';

    return '<div class="turn-alert">' +
      '<span class="turn-alert-icon">🎯</span>' +
      '<span class="turn-alert-text"><b>É a sua vez!</b> ' + esc(text) + '</span>' +
      '<button type="button" class="small ghost" onclick="openMasterPanel(\'tabuleiro\')">Ver tabuleiro</button>' +
    '</div>';
  }

  function renderGame() {
    var room = state.room;
    var active = activePlayer(room);

    var sub = state.mode === 'local'
      ? 'Rodada ' + (room.round || 1) + ' · Vez de ' + (active ? active.name : '—')
      : (state.isSpectator ? 'Modo espectador' : (myTurn() ? 'É a sua vez!' : 'Vez de ' + (active ? active.name : '—')));

    return renderMasthead('Partida em andamento · Sala ' + room.code, sub) +
      errorBanner() +
      (state.isSpectator
        ? '<div class="banner banner-info">Você está assistindo a esta partida como espectador.</div>'
        : (state.mode !== 'local' && myTurn() ? turnAlert(room) : '')) +
      '<div class="game-layout">' +
        '<div class="game-main">' +
          renderTurnCard() +
          '<section class="panel players-panel">' +
            '<div class="section-title"><h2>Jogadores</h2><span class="pot-pill">Pote: ' + (room.pot || 0) + ' ficha' + ((room.pot || 0) === 1 ? '' : 's') + '</span></div>' +
            renderPlayers() +
          '</section>' +
        '</div>' +
        '<aside class="game-side">' +
          '<section class="panel log-panel">' +
            '<div class="section-title"><h2>Registro</h2>' +
              (room.mode === 'local' ? '<button class="small ghost" onclick="__master.leaveRoom()">Sair</button>' : '') +
            '</div>' +
            renderLog() +
          '</section>' +
        '</aside>' +
      '</div>';
  }

  function renderEnded() {
    var room = state.room;
    var winner = playerById(room, room.winner);
    var ranked = (room.players || []).slice().sort(function (a, b) {
      return (a.rank || 99) - (b.rank || 99);
    });

    var podium = ranked.map(function (p) {
      return '<div class="rank-row' + (p.id === room.winner ? ' winner' : '') + '">' +
        '<span class="rank-pos">' + (p.rank || '—') + 'º</span>' +
        '<span class="color-dot" style="background:' + p.color + '"></span>' +
        '<span class="rank-name">' + esc(p.name) + '</span>' +
        '<span class="rank-meta">' + esc(positionLabel(p.pos)) + '</span>' +
        '<span class="rank-meta">✅ ' + p.correct + ' · ❌ ' + p.wrong + '</span>' +
      '</div>';
    }).join('');

    return renderMasthead('Fim da partida', winner ? 'Vitória de ' + winner.name : 'Partida encerrada') +
      errorBanner() +
      '<section class="panel final-banner">' +
        '<div class="trophy">🏆</div>' +
        '<h2>' + (winner ? esc(winner.name) + ' venceu!' : 'Partida encerrada') + '</h2>' +
        (winner ? '<p class="final-sub">Acertou a pergunta final e chegou ao FIM do tabuleiro.</p>' : '') +
      '</section>' +
      '<section class="panel">' +
        '<div class="section-title"><h2>Classificação</h2></div>' +
        '<div class="rank-list">' + podium + '</div>' +
      '</section>' +
      '<section class="panel">' +
        '<div class="section-title"><h2>Registro da partida</h2></div>' +
        renderLog() +
      '</section>' +
      '<div class="ended-actions">' +
        (isHost() ? '<button class="primary" onclick="__master.adminReset()">Jogar novamente</button>' : '') +
        '<button class="ghost" onclick="__master.leaveRoom()">Voltar ao início</button>' +
      '</div>';
  }

  /* ==========================================================================
     API PÚBLICA
     ========================================================================== */

  window.__master = {
    openLocalSetup: openLocalSetup,
    setLocalCount: setLocalCount,
    setLocalName: setLocalName,
    createLocal: createLocalGame,
    createOnline: createOnlineRoom,
    joinOnline: joinOnlineRoom,
    startGame: startGame,
    chooseTheme: chooseTheme,
    chooseFinalTheme: chooseFinalTheme,
    placeBet: placeBet,
    answer: answerQuestion,
    continueTurn: continueTurn,
    copyCode: copyCode,
    leaveRoom: leaveRoom,
    cancelRoom: cancelRoom,
    backHome: backHome,
    openRules: openRules,
    adminSkip: adminSkip,
    adminRefillChips: adminRefillChips,
    adminReset: adminReset,
    adminForceEnd: adminForceEnd
  };

  window.MasterApp = {
    getState: function () { return state; },
    getRoom: function () { return state.room; },
    isHost: isHost,
    onlineReady: onlineReady,
    activePlayer: function () { return state.room ? activePlayer(state.room) : null; },
    renderLog: function () {
      var room = state.room;
      if (!room) return [];
      return (room.log || []).slice().reverse();
    },
    fmtTime: fmtTime,
    positionLabel: positionLabel
  };

  /* ==========================================================================
     START
     ========================================================================== */

  document.addEventListener('DOMContentLoaded', boot);
})();
