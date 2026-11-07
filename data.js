/* ============================================================================
   MASTER — dados do jogo (tabuleiro, temas e perguntas)
   ----------------------------------------------------------------------------
   Este arquivo é o único lugar que você precisa editar para trocar o conteúdo
   do jogo. O restante do código lê tudo daqui.

   • MASTER_THEMES ....... os 6 temas oficiais do Novo Master
   • MASTER_THEME_ORDER .. ordem usada nos menus e no sorteio
   • MASTER_BOARD ........ as casas do tabuleiro (36 casas em serpentina 6x6)
   • MASTER_QUESTIONS .... banco inicial de perguntas (editável)

   IMPORTANTE: as perguntas abaixo são um BANCO INICIAL de exemplo, criado
   para a primeira versão ficar jogável. Substitua/amplie com as perguntas
   reais do baralho físico (350 cartas). O formato é simples:

     { q: 'Enunciado da pergunta?',
       options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
       answer: 1 }   // índice da alternativa correta (0 = A, 1 = B, 2 = C, 3 = D)
   ========================================================================== */

var MASTER_THEMES = {
  artes: {
    key: 'artes',
    name: 'Artes',
    short: 'Artes',
    icon: '🎭',
    color: '#a855f7',
    color2: '#6d28d9',
    desc: 'Literatura, pintura, escultura, teatro, movimentos artísticos e história da arte.'
  },
  ciencias: {
    key: 'ciencias',
    name: 'Ciências',
    short: 'Ciên.',
    icon: '🔬',
    color: '#14b8a6',
    color2: '#0f766e',
    desc: 'Descobertas científicas, personalidades da ciência, química, física, matemática e biologia.'
  },
  entretenimento: {
    key: 'entretenimento',
    name: 'Entretenimento',
    short: 'Entr.',
    icon: '🎬',
    color: '#ec4899',
    color2: '#9d174d',
    desc: 'Cinema, séries, televisão, música e quadrinhos.'
  },
  esportes: {
    key: 'esportes',
    name: 'Esportes',
    short: 'Esp.',
    icon: '⚽',
    color: '#f97316',
    color2: '#9a3412',
    desc: 'Modalidades esportivas, esportistas, eventos esportivos, Copas e Olimpíadas.'
  },
  geografia: {
    key: 'geografia',
    name: 'Geografia',
    short: 'Geo.',
    icon: '🌍',
    color: '#3b82f6',
    color2: '#1e40af',
    desc: 'Lugares, povos, capitais, línguas, políticas regionais, economia e turismo.'
  },
  historia: {
    key: 'historia',
    name: 'História',
    short: 'Hist.',
    icon: '🏛️',
    color: '#eab308',
    color2: '#854d0e',
    desc: 'Datas, locais históricos, personalidades históricas e fatos históricos.'
  }
};

var MASTER_THEME_ORDER = ['artes', 'ciencias', 'entretenimento', 'esportes', 'geografia', 'historia'];

/* ----------------------------------------------------------------------------
   TABULEIRO
   36 casas dispostas em serpentina num grid 6x6:
     linha 1 → da esquerda para a direita
     linha 2 ← da direita para a esquerda
     linha 3 → ...
     linha 4 ← ...
     linha 5 → ...
     linha 6 ← ... (termina no FIM)

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

  { themes: ['artes', 'ciencias'], split: true },
  { themes: ['entretenimento'] },
  { themes: ['esportes'] },
  { themes: ['geografia', 'historia'], split: true },

  { themes: ['artes'] },
  { themes: ['ciencias'] },
  { themes: ['entretenimento', 'esportes'], split: true },
  { themes: ['geografia'] },
  { themes: ['historia'] },

  { themes: ['artes'] },
  { themes: ['ciencias', 'entretenimento'], split: true },
  { themes: ['esportes'] },
  { themes: ['geografia'] },
  { themes: ['historia', 'artes'], split: true },

  { themes: ['ciencias'] },
  { themes: ['entretenimento'] },
  { themes: ['esportes', 'geografia'], split: true },
  { themes: ['historia'] },

  { themes: ['artes'] },
  { themes: ['ciencias', 'historia'], split: true },
  { themes: ['entretenimento'] },
  { themes: ['esportes'] },
  { themes: ['geografia'] },

  { themes: ['artes', 'historia'], split: true },
  { themes: ['ciencias'] },
  { themes: ['entretenimento'] },
  { themes: ['esportes'] },
  { themes: ['geografia'] },

  { type: 'finish', themes: [], label: 'FIM' }
];

/* ----------------------------------------------------------------------------
   BANCO DE PERGUNTAS — 12 por tema (72 no total)
   -------------------------------------------------------------------------- */
var MASTER_QUESTIONS = {

  artes: [
    { q: 'Quem pintou a Mona Lisa?', options: ['Michelangelo', 'Leonardo da Vinci', 'Rafael Sanzio', 'Vincent van Gogh'], answer: 1 },
    { q: 'Quem esculpiu a estátua do Davi, em Florença?', options: ['Michelangelo', 'Donatello', 'Bernini', 'Rodin'], answer: 0 },
    { q: 'A obra "A Noite Estrelada" é de autoria de:', options: ['Claude Monet', 'Pablo Picasso', 'Vincent van Gogh', 'Salvador Dalí'], answer: 2 },
    { q: 'Salvador Dalí foi um dos grandes nomes de qual movimento artístico?', options: ['Cubismo', 'Surrealismo', 'Impressionismo', 'Barroco'], answer: 1 },
    { q: 'Quem escreveu o romance "Dom Casmurro"?', options: ['José de Alencar', 'Machado de Assis', 'Graciliano Ramos', 'Aluísio Azevedo'], answer: 1 },
    { q: 'Quem é o autor da peça "Romeu e Julieta"?', options: ['William Shakespeare', 'Dante Alighieri', 'Molière', 'Victor Hugo'], answer: 0 },
    { q: 'Pablo Picasso é um dos criadores de qual movimento?', options: ['Cubismo', 'Expressionismo', 'Realismo', 'Romantismo'], answer: 0 },
    { q: 'Quem pintou o teto da Capela Sistina?', options: ['Leonardo da Vinci', 'Rafael Sanzio', 'Michelangelo', 'Ticiano'], answer: 2 },
    { q: 'A obra "Guernica", de Picasso, retrata um bombardeio ocorrido em qual país?', options: ['França', 'Itália', 'Espanha', 'Alemanha'], answer: 2 },
    { q: 'Quem é o autor do poema épico "Odisseia"?', options: ['Homero', 'Virgílio', 'Sófocles', 'Eurípides'], answer: 0 },
    { q: 'A pintura "Abaporu" é de qual artista brasileira?', options: ['Anita Malfatti', 'Tarsila do Amaral', 'Beatriz Milhazes', 'Djanira'], answer: 1 },
    { q: 'Aleijadinho foi um importante artista de qual estilo no Brasil?', options: ['Barroco', 'Modernismo', 'Impressionismo', 'Art Nouveau'], answer: 0 }
  ],

  ciencias: [
    { q: 'Qual é o planeta mais próximo do Sol?', options: ['Vênus', 'Mercúrio', 'Marte', 'Terra'], answer: 1 },
    { q: 'A fórmula H2O representa qual substância?', options: ['Água', 'Sal de cozinha', 'Gás carbônico', 'Álcool'], answer: 0 },
    { q: 'Qual é a unidade de força no Sistema Internacional?', options: ['Joule', 'Watt', 'Newton', 'Pascal'], answer: 2 },
    { q: 'Como se chama o processo de divisão celular que gera duas células idênticas?', options: ['Meiose', 'Mitose', 'Fotossíntese', 'Osmose'], answer: 1 },
    { q: 'Quem propôs a teoria da evolução por seleção natural?', options: ['Isaac Newton', 'Charles Darwin', 'Gregor Mendel', 'Louis Pasteur'], answer: 1 },
    { q: 'Qual gás as plantas absorvem durante a fotossíntese?', options: ['Oxigênio', 'Nitrogênio', 'Gás carbônico', 'Hidrogênio'], answer: 2 },
    { q: 'Qual é o maior órgão do corpo humano?', options: ['Fígado', 'Pulmão', 'Pele', 'Intestino'], answer: 2 },
    { q: 'Quem formulou a teoria da relatividade?', options: ['Albert Einstein', 'Niels Bohr', 'Galileu Galilei', 'Stephen Hawking'], answer: 0 },
    { q: 'Qual é o símbolo químico do ouro?', options: ['Ag', 'Au', 'Fe', 'Cu'], answer: 1 },
    { q: 'Quantos ossos tem o esqueleto de um ser humano adulto?', options: ['186', '196', '206', '216'], answer: 2 },
    { q: 'Qual planeta é conhecido como "planeta vermelho"?', options: ['Júpiter', 'Marte', 'Saturno', 'Netuno'], answer: 1 },
    { q: 'O pH é uma escala que mede o quê?', options: ['Temperatura', 'Acidez ou alcalinidade', 'Pressão', 'Densidade'], answer: 1 }
  ],

  entretenimento: [
    { q: 'Quem dirigiu o filme "E.T. — O Extraterrestre"?', options: ['George Lucas', 'Steven Spielberg', 'James Cameron', 'Ridley Scott'], answer: 1 },
    { q: 'John Lennon, Paul McCartney, George Harrison e Ringo Starr formaram qual banda?', options: ['The Rolling Stones', 'The Beatles', 'Queen', 'Pink Floyd'], answer: 1 },
    { q: 'Quem interpretou o Homem de Ferro nos filmes da Marvel?', options: ['Chris Evans', 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo'], answer: 1 },
    { q: 'O dragão Drogon aparece em qual série?', options: ['The Witcher', 'Game of Thrones', 'Vikings', 'The Crown'], answer: 1 },
    { q: 'A frase "Que a Força esteja com você" é famosa em qual franquia?', options: ['Star Trek', 'Star Wars', 'Matrix', 'O Senhor dos Anéis'], answer: 1 },
    { q: 'Quem canta o sucesso "Like a Prayer"?', options: ['Madonna', 'Whitney Houston', 'Cher', 'Tina Turner'], answer: 0 },
    { q: 'Qual é o principal prêmio da indústria musical dos Estados Unidos?', options: ['Oscar', 'Emmy', 'Grammy', 'Tony'], answer: 2 },
    { q: 'Quem criou o personagem Batman?', options: ['Stan Lee', 'Bob Kane', 'Jack Kirby', 'Joe Shuster'], answer: 1 },
    { q: 'A música "Let It Go" faz parte de qual animação da Disney?', options: ['Moana', 'Frozen', 'Enrolados', 'Valente'], answer: 1 },
    { q: 'Em qual plataforma de streaming estreou a série "Stranger Things"?', options: ['Disney+', 'Netflix', 'Prime Video', 'HBO Max'], answer: 1 },
    { q: 'Quem interpretou o Coringa no filme de 2019?', options: ['Heath Ledger', 'Joaquin Phoenix', 'Jared Leto', 'Jack Nicholson'], answer: 1 },
    { q: 'Michael Jackson ficou conhecido como:', options: ['Rei do Rock', 'Rei do Pop', 'Príncipe da Música', 'Rei da Soul'], answer: 1 }
  ],

  esportes: [
    { q: 'Quantos jogadores de cada time ficam em campo numa partida de futebol?', options: ['9', '10', '11', '12'], answer: 2 },
    { q: 'Em qual país nasceu o futebol moderno?', options: ['Brasil', 'Inglaterra', 'Itália', 'Alemanha'], answer: 1 },
    { q: 'Quantos pontos vale uma cesta convertida de três pontos no basquete?', options: ['1', '2', '3', '4'], answer: 2 },
    { q: 'Em qual cidade ocorreram os Jogos Olímpicos de 2016?', options: ['Londres', 'Tóquio', 'Rio de Janeiro', 'Pequim'], answer: 2 },
    { q: 'Qual país tem o maior número de títulos de Copa do Mundo de futebol?', options: ['Alemanha', 'Itália', 'Brasil', 'Argentina'], answer: 2 },
    { q: 'Em qual esporte se usa raquete e peteca?', options: ['Tênis de mesa', 'Badminton', 'Squash', 'Tênis'], answer: 1 },
    { q: 'Quantos sets uma equipe precisa vencer para ganhar uma partida de vôlei?', options: ['2', '3', '4', '5'], answer: 1 },
    { q: 'Qual é a distância oficial de uma maratona?', options: ['21,195 km', '32,195 km', '42,195 km', '52,195 km'], answer: 2 },
    { q: 'Quem é conhecido como o "Rei do Futebol"?', options: ['Maradona', 'Pelé', 'Ronaldo Fenômeno', 'Zico'], answer: 1 },
    { q: 'O termo "home run" pertence a qual esporte?', options: ['Beisebol', 'Futebol americano', 'Críquete', 'Golfe'], answer: 0 },
    { q: 'No futebol, o que é um "hat-trick"?', options: ['Três defesas seguidas', 'Três gols do mesmo jogador', 'Três cartões amarelos', 'Três substituições'], answer: 1 },
    { q: 'Em qual circuito brasileiro acontece o Grande Prêmio de Fórmula 1?', options: ['Jacarepaguá', 'Interlagos', 'Goiânia', 'Cascavel'], answer: 1 }
  ],

  geografia: [
    { q: 'Qual é a capital do Brasil?', options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'], answer: 2 },
    { q: 'Qual é o maior país da América do Sul em extensão territorial?', options: ['Argentina', 'Peru', 'Colômbia', 'Brasil'], answer: 3 },
    { q: 'Qual é o maior oceano do mundo?', options: ['Atlântico', 'Índico', 'Pacífico', 'Ártico'], answer: 2 },
    { q: 'Em qual continente fica o Egito?', options: ['Ásia', 'África', 'Europa', 'Oceania'], answer: 1 },
    { q: 'Qual é a capital da França?', options: ['Lyon', 'Marselha', 'Paris', 'Nice'], answer: 2 },
    { q: 'Qual é o rio de maior volume de água do mundo?', options: ['Nilo', 'Amazonas', 'Yangtzé', 'Mississippi'], answer: 1 },
    { q: 'Qual país tem o formato que lembra uma bota?', options: ['Grécia', 'Espanha', 'Itália', 'Portugal'], answer: 2 },
    { q: 'Qual é o deserto quente mais extenso do mundo?', options: ['Gobi', 'Saara', 'Kalahari', 'Atacama'], answer: 1 },
    { q: 'Qual é o menor país do mundo em área?', options: ['Mônaco', 'San Marino', 'Vaticano', 'Liechtenstein'], answer: 2 },
    { q: 'Qual cordilheira atravessa a América do Sul?', options: ['Alpes', 'Andes', 'Himalaia', 'Montanhas Rochosas'], answer: 1 },
    { q: 'Qual é a capital do Japão?', options: ['Osaka', 'Kyoto', 'Tóquio', 'Nagoya'], answer: 2 },
    { q: 'Qual é o estado brasileiro mais populoso?', options: ['Minas Gerais', 'Rio de Janeiro', 'Bahia', 'São Paulo'], answer: 3 }
  ],

  historia: [
    { q: 'Em que ano o Brasil proclamou sua independência de Portugal?', options: ['1808', '1815', '1822', '1889'], answer: 2 },
    { q: 'Quem foi o primeiro imperador do Brasil?', options: ['D. Pedro I', 'D. Pedro II', 'D. João VI', 'D. Miguel'], answer: 0 },
    { q: 'Em que ano terminou a Segunda Guerra Mundial?', options: ['1939', '1942', '1945', '1950'], answer: 2 },
    { q: 'Quem foi o primeiro presidente do Brasil?', options: ['Prudente de Morais', 'Deodoro da Fonseca', 'Floriano Peixoto', 'Getúlio Vargas'], answer: 1 },
    { q: 'Em que ano foi assinada a Lei Áurea, que aboliu a escravidão no Brasil?', options: ['1871', '1885', '1888', '1891'], answer: 2 },
    { q: 'Qual civilização antiga construiu as pirâmides de Gizé?', options: ['Grega', 'Romana', 'Egípcia', 'Mesopotâmica'], answer: 2 },
    { q: 'Em que ano Pedro Álvares Cabral chegou ao Brasil?', options: ['1492', '1498', '1500', '1502'], answer: 2 },
    { q: 'Qual muro foi derrubado em 1989, simbolizando o fim da Guerra Fria?', options: ['Muro de Berlim', 'Muro da China', 'Muro de Hadriano', 'Muro de Jericó'], answer: 0 },
    { q: 'Em que ano começou a Primeira Guerra Mundial?', options: ['1910', '1914', '1918', '1920'], answer: 1 },
    { q: 'Quem foi um dos principais líderes da independência da Índia?', options: ['Nelson Mandela', 'Mahatma Gandhi', 'Che Guevara', 'Martin Luther King'], answer: 1 },
    { q: 'Quem comandou a primeira viagem de circum-navegação ao redor da Terra?', options: ['Cristóvão Colombo', 'Vasco da Gama', 'Fernão de Magalhães', 'Américo Vespúcio'], answer: 2 },
    { q: 'Em que ano o homem pisou na Lua pela primeira vez?', options: ['1959', '1965', '1969', '1972'], answer: 2 }
  ]
};

/* ----------------------------------------------------------------------------
   Helpers de leitura dos dados — usados pelo main.js e pelos painéis
   -------------------------------------------------------------------------- */

function masterTheme(key) {
  return MASTER_THEMES[key] || null;
}

function masterBoardSpace(pos) {
  return MASTER_BOARD[pos] || null;
}

function masterBoardLastPos() {
  return MASTER_BOARD.length - 1;
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
