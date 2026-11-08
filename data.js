/* ============================================================================
   MASTER — dados do jogo (tabuleiro, temas e perguntas)
   ----------------------------------------------------------------------------
   Define o tabuleiro e o registro compartilhado dos dados das matérias.

   • MASTER_THEMES ....... metadados registrados pelos arquivos de temas
   • MASTER_THEME_ORDER .. ordem usada nos menus e no sorteio
   • MASTER_BOARD ........ as casas do tabuleiro (36 casas em serpentina 6x6)
   • MASTER_QUESTIONS .... perguntas registradas pelos arquivos de temas
   ========================================================================== */

var MASTER_THEMES = {};
var MASTER_THEME_ORDER = [];
var MASTER_QUESTIONS = {};

function masterRegisterTheme(theme, questions) {
  if (!theme || !/^[a-z0-9_-]+$/.test(theme.key || '') || !theme.name || !theme.short ||
      !theme.icon || !theme.color || !theme.color2 || !Array.isArray(questions) || !questions.length) {
    throw new Error('Definição de matéria inválida.');
  }
  if (questions.some(function (question) {
    return !question || typeof question.q !== 'string' || !question.q ||
      !Array.isArray(question.options) || question.options.length !== 4 ||
      question.options.some(function (option) { return typeof option !== 'string' || !option; }) ||
      question.answer !== Math.floor(question.answer) || question.answer < 0 || question.answer > 3;
  })) {
    throw new Error('Pergunta inválida na matéria: ' + theme.key);
  }
  if (MASTER_THEMES[theme.key]) throw new Error('Matéria duplicada: ' + theme.key);
  MASTER_THEMES[theme.key] = theme;
  MASTER_THEME_ORDER.push(theme.key);
  MASTER_QUESTIONS[theme.key] = questions;
}

/* ----------------------------------------------------------------------------
   TABULEIRO
   20 casas em um caminho sinuoso de quatro fileiras:
     0 = INÍCIO, 1–18 = percurso, 19 = FIM

   Cada casa tem:
     themes: lista de temas possíveis naquela casa
     split:  true quando a casa oferece 2 temas (o jogador escolhe)
     type:   'start' | 'finish' (nas extremidades)
   -------------------------------------------------------------------------- */
var MASTER_BOARD = [
  { type: 'start',  themes: [], label: 'INÍCIO' },
  { themes: ['artes'] },
  { themes: ['ciencias'] },
  { themes: ['entretenimento'] },
  { themes: ['esportes'] },
  { themes: ['geografia'] },
  { themes: ['historia'] },
  { themes: ['entretenimento'] },
  { themes: ['esportes'] },
  { themes: ['artes'] },
  { themes: ['geografia', 'historia'], split: true },
  { themes: ['ciencias'] },
  { themes: ['entretenimento'] },
  { themes: ['geografia'] },
  { themes: ['esportes', 'geografia'], split: true },
  { themes: ['historia'] },
  { themes: ['artes', 'ciencias'], split: true },
  { themes: ['esportes'] },
  { themes: ['geografia'] },
  { type: 'finish', themes: [], label: 'FIM' }
];
var MASTER_BOARD_THEME_KEYS = [];
MASTER_BOARD.forEach(function (space) {
  (space.themes || []).forEach(function (key) {
    if (MASTER_BOARD_THEME_KEYS.indexOf(key) < 0) MASTER_BOARD_THEME_KEYS.push(key);
  });
});

/* Perguntas carregadas dos arquivos listados em theme-manifest.js. */

/* ----------------------------------------------------------------------------
   Helpers de leitura dos dados — usados pelo main.js e pelos painéis
   -------------------------------------------------------------------------- */

function masterTheme(key) {
  return MASTER_THEMES[key] || null;
}

function masterBoardSpace(pos, room) {
  return masterRoomBoard(room)[pos] || null;
}

function masterBoardLastPos(room) {
  return masterRoomBoard(room).length - 1;
}

/* Normaliza uma lista de temas: remove repetidos/inválidos e mantém a ordem
   oficial. Se nada for informado, devolve todos os temas. */
function masterCleanThemes(themes) {
  var selected = [];
  (themes || []).forEach(function (k) {
    if (MASTER_THEMES[k] && selected.indexOf(k) < 0) selected.push(k);
  });
  if (!selected.length) return MASTER_THEME_ORDER.slice();
  return MASTER_THEME_ORDER.filter(function (k) {
    return selected.indexOf(k) >= 0;
  });
}

/* Monta o tabuleiro da partida de acordo com os temas escolhidos na criação.
   Mantém as 36 casas e as casas divididas; casas com temas não selecionados
   são preenchidas alternando entre os temas escolhidos. */
function masterBuildBoard(themes) {
  var selected = masterCleanThemes(themes);
  if (selected.length === MASTER_BOARD_THEME_KEYS.length && MASTER_BOARD_THEME_KEYS.every(function (key) {
    return selected.indexOf(key) >= 0;
  })) {
    return MASTER_BOARD;
  }

  var fill = 0;
  var board = MASTER_BOARD.map(function (space) {
    if (!space || space.type) return space;

    var wantSplit = !!space.split && selected.length > 1;
    var picked = (space.themes || []).filter(function (k) {
      return selected.indexOf(k) >= 0;
    });
    picked = picked.filter(function (k, i) {
      return picked.indexOf(k) === i;
    });

    if (!picked.length) {
      picked = [selected[fill % selected.length]];
      fill += 1;
    }

    if (wantSplit && picked.length === 1) {
      for (var i = 0; i < selected.length; i++) {
        if (selected[i] !== picked[0]) { picked.push(selected[i]); break; }
      }
    }

    if (!wantSplit) picked = [picked[0]];
    else picked = picked.slice(0, 2);

    return { themes: picked, split: picked.length > 1 };
  });

  var present = {};
  board.forEach(function (space) {
    (space.themes || []).forEach(function (key) { present[key] = true; });
  });
  selected.forEach(function (key) {
    if (present[key]) return;
    for (var i = 1; i < board.length - 1; i++) {
      var themesAtSpace = board[i].themes || [];
      if (themesAtSpace.length !== 1) continue;
      var occurrences = board.reduce(function (count, space) {
        return count + ((space.themes || []).indexOf(themesAtSpace[0]) >= 0 ? 1 : 0);
      }, 0);
      if (occurrences > 1) {
        present[themesAtSpace[0]] = false;
        board[i] = { themes: [key] };
        present[key] = true;
        break;
      }
    }
  });
  return board;
}

/* Temas válidos de uma sala (com fallback para todos os temas). */
function masterRoomThemes(room) {
  return masterCleanThemes((room && room.themes) || []);
}

/* Tabuleiro de uma sala (com fallback para o tabuleiro padrão). */
function masterRoomBoard(room) {
  if (room && room.board && room.board.length) return room.board;
  return masterBuildBoard(masterRoomThemes(room));
}

function masterSpaceLabel(space) {
  if (!space) return '—';
  if (space.type === 'start') return space.label || 'INÍCIO';
  if (space.type === 'finish') return space.label || 'FIM';
  return (space.themes || []).map(function (k) {
    return MASTER_THEMES[k] ? MASTER_THEMES[k].short : k;
  }).join(' / ');
}

function masterSpaceColor(space) {
  if (!space) return '#333';
  if (space.type === 'start') return '#35c47a';
  if (space.type === 'finish') return '#f2c14e';
  var themes = space.themes || [];
  if (themes.length === 1) return MASTER_THEMES[themes[0]].color;
  var a = MASTER_THEMES[themes[0]];
  var b = MASTER_THEMES[themes[1]];
  return 'linear-gradient(135deg, ' + a.color + ' 0 50%, ' + b.color + ' 50% 100%)';
}

/* Sorteia uma pergunta ainda não usada na partida.
   Se o tema todo já foi usado, recicla apenas as perguntas daquele tema. */
function masterPickQuestion(room, theme) {
  var pool = MASTER_QUESTIONS[theme] || [];
  if (!pool.length) return null;

  var used = room.usedQuestions || [];
  var available = [];
  for (var i = 0; i < pool.length; i++) {
    if (used.indexOf(theme + '-' + i) < 0) available.push(i);
  }
  if (!available.length) {
    room.usedQuestions = used.filter(function (id) {
      return id.indexOf(theme + '-') !== 0;
    });
    for (var j = 0; j < pool.length; j++) available.push(j);
  }

  var idx = available[Math.floor(Math.random() * available.length)];
  return {
    id: theme + '-' + idx,
    theme: theme,
    q: pool[idx].q,
    options: pool[idx].options.slice(),
    answer: pool[idx].answer
  };
}
