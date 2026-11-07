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
   BANCO DE PERGUNTAS — 50 por tema (300 no total)
   -------------------------------------------------------------------------- */
var MASTER_QUESTIONS = {


  artes: [
    { q: 'Publicado em 1928 por Oswald de Andrade, qual manifesto propunha “devorar” criticamente a cultura estrangeira para produzir uma arte genuinamente brasileira?', options: ['Manifesto Pau-Brasil', 'Manifesto Regionalista', 'Manifesto Antropófago', 'Manifesto Verde-Amarelo'], answer: 2 },
    { q: 'Em “Vidas Secas”, de Graciliano Ramos, que recurso narrativo permite ao narrador revelar o pensamento de personagens que quase não falam?', options: ['Monólogo interior em primeira pessoa', 'Discurso indireto livre', 'Narrador-personagem testemunha', 'Fluxo de consciência sem pontuação'], answer: 1 },
    { q: 'O poema dramático “Morte e Vida Severina”, de João Cabral de Melo Neto, recebeu qual subtítulo?', options: ['Romance de cordel em versos livres', 'Auto de Natal pernambucano', 'Tragédia sertaneja em cinco atos', 'Epopeia do retirante'], answer: 1 },
    { q: 'Ao expor um urinol assinado “R. Mutt” como obra de arte (“A Fonte”, 1917), Marcel Duchamp inaugurou qual prática, que questiona a noção tradicional de autoria e de obra?', options: ['Assemblage', 'Colagem cubista', 'Action painting', 'Ready-made'], answer: 3 },
    { q: 'Qual procedimento caracteriza o Cubismo analítico de Picasso e Braque?', options: ['Fragmentar o objeto em planos geométricos, mostrando-o de vários ângulos ao mesmo tempo', 'Representar a luz natural por meio de pequenas manchas de cor', 'Distorcer as formas para expressar a angústia interior do artista', 'Reproduzir o objeto com fidelidade fotográfica e perspectiva única'], answer: 0 },
    { q: 'Na pintura barroca, como em Caravaggio, o forte contraste entre luz e sombra, que dramatiza a cena, é conhecido como:', options: ['Sfumato', 'Pontilhismo', 'Claro-escuro (tenebrismo)', 'Craquelê'], answer: 2 },
    { q: 'O “efeito de distanciamento”, que busca impedir a identificação emocional do público para estimular a reflexão crítica, é um princípio do teatro de:', options: ['Constantin Stanislávski', 'Bertolt Brecht', 'Samuel Beckett', 'Nelson Rodrigues'], answer: 1 },
    { q: 'Qual era o pseudônimo árcade de Cláudio Manuel da Costa, poeta da Inconfidência Mineira?', options: ['Dirceu', 'Termindo Sipílio', 'Glauceste Satúrnio', 'Alceste'], answer: 2 },
    { q: 'A visão de que o comportamento humano é condicionado pela hereditariedade, pelo meio e pelo momento histórico, como em “O Cortiço”, é característica de qual estética literária?', options: ['Romantismo', 'Parnasianismo', 'Naturalismo', 'Simbolismo'], answer: 2 },
    { q: 'Qual escola alemã, fundada por Walter Gropius em 1919, propunha integrar arte, artesanato e indústria, influenciando o design moderno?', options: ['De Stijl', 'Bauhaus', 'Arts and Crafts', 'Secessão de Viena'], answer: 1 },
    { q: 'Qual compositor brasileiro uniu elementos do folclore nacional à técnica contrapontística de Bach nas “Bachianas Brasileiras”?', options: ['Carlos Gomes', 'Alberto Nepomuceno', 'Camargo Guarnieri', 'Heitor Villa-Lobos'], answer: 3 },
    { q: 'Qual pioneira da dança moderna rompeu com a rigidez do balé clássico, dançando descalça, com túnicas leves e movimentos inspirados na natureza e na Grécia antiga?', options: ['Isadora Duncan', 'Pina Bausch', 'Anna Pavlova', 'Martha Graham'], answer: 0 },
    { q: 'Em “A Hora da Estrela”, de Clarice Lispector, quem narra a história da nordestina Macabéa?', options: ['Olímpico de Jesus', 'Glória', 'Rodrigo S. M.', 'A própria Macabéa'], answer: 2 },
    { q: 'A poesia social e abolicionista de Castro Alves, de tom grandiloquente, pertence a qual geração do Romantismo brasileiro?', options: ['Primeira geração, nacionalista e indianista', 'Segunda geração, ultrarromântica', 'Pré-Romantismo, de transição neoclássica', 'Terceira geração, condoreira'], answer: 3 },
    { q: 'Os “Parangolés”, capas vestíveis que só se completam com o movimento do corpo de quem as usa, são obra de qual artista brasileiro?', options: ['Lygia Pape', 'Hélio Oiticica', 'Lygia Clark', 'Cildo Meireles'], answer: 1 },
    { q: 'Qual pintor holandês do século XVII é autor de “A Ronda Noturna”?', options: ['Johannes Vermeer', 'Frans Hals', 'Peter Paul Rubens', 'Rembrandt'], answer: 3 },
    { q: '“Moça com Brinco de Pérola”, conhecida pela delicadeza no uso da luz, é obra de qual pintor?', options: ['Rembrandt', 'Jan van Eyck', 'Johannes Vermeer', 'Pieter Bruegel'], answer: 2 },
    { q: 'A tela “Impressão, Nascer do Sol”, de Claude Monet, deu nome a qual movimento artístico?', options: ['Impressionismo', 'Expressionismo', 'Simbolismo', 'Realismo'], answer: 0 },
    { q: 'Quem publicou, em 1924, o primeiro Manifesto do Surrealismo?', options: ['Tristan Tzara', 'Filippo Marinetti', 'André Breton', 'Wassily Kandinsky'], answer: 2 },
    { q: 'O Manifesto Futurista (1909), que exaltava a velocidade, a máquina e a violência da vida moderna, foi escrito por:', options: ['Filippo Marinetti', 'André Breton', 'Tristan Tzara', 'Pablo Picasso'], answer: 0 },
    { q: 'O Dadaísmo surgiu em 1916, no Cabaret Voltaire, em qual cidade?', options: ['Zurique', 'Paris', 'Berlim', 'Nova York'], answer: 0 },
    { q: 'Qual artista russo é considerado pioneiro da pintura abstrata e autor de “Do Espiritual na Arte”?', options: ['Marc Chagall', 'Wassily Kandinsky', 'Piet Mondrian', 'Salvador Dalí'], answer: 1 },
    { q: 'Qual movimento Piet Mondrian ajudou a criar, caracterizado por linhas ortogonais pretas, cores primárias e abstração geométrica?', options: ['Suprematismo', 'Neoplasticismo (De Stijl)', 'Op Art', 'Construtivismo russo'], answer: 1 },
    { q: 'Qual movimento artístico Andy Warhol representa, ao usar imagens da cultura de massa e a serigrafia, como nas latas de sopa Campbell?', options: ['Op Art', 'Pop Art', 'Hiper-realismo', 'Minimalismo'], answer: 1 },
    { q: '“As Duas Fridas” (1939), autorretrato duplo, é obra de uma pintora de qual país?', options: ['Peru', 'Espanha', 'Cuba', 'México'], answer: 3 },
    { q: 'Qual obra de Cervantes, publicada em duas partes (1605 e 1615), parodia os romances de cavalaria?', options: ['Lazarillo de Tormes', 'A Celestina', 'Dom Quixote de la Mancha', 'O Cid'], answer: 2 },
    { q: 'Na “Divina Comédia”, quem guia Dante pelo Inferno e pelo Purgatório?', options: ['Homero', 'Beatriz', 'Virgílio', 'São Bernardo'], answer: 2 },
    { q: 'Qual obra de 1881, de Machado de Assis, inaugura o Realismo no Brasil?', options: ['Dom Casmurro', 'Memórias Póstumas de Brás Cubas', 'Quincas Borba', 'O Ateneu'], answer: 1 },
    { q: 'Em “Dom Casmurro”, a ambiguidade sobre a suposta traição de Capitu decorre principalmente de:', options: ['Um narrador em primeira pessoa, parcial e movido pelo ciúme', 'Um narrador onisciente e neutro', 'Cartas que comprovam o adultério', 'Ausência de outros personagens na trama'], answer: 0 },
    { q: 'Qual poeta parnasiano escreveu “Profissão de Fé”, defendendo o culto da forma e a “arte pela arte”?', options: ['Olavo Bilac', 'Cruz e Sousa', 'Augusto dos Anjos', 'Castro Alves'], answer: 0 },
    { q: 'Qual obra de 1893 inaugura o Simbolismo no Brasil?', options: ['Eu, de Augusto dos Anjos', 'Espumas Flutuantes, de Castro Alves', 'Crisálidas, de Machado de Assis', 'Broquéis, de Cruz e Sousa'], answer: 3 },
    { q: 'Qual obra Mário de Andrade chamou de “rapsódia”, reunindo lendas e costumes de várias regiões brasileiras?', options: ['Pauliceia Desvairada', 'Amar, Verbo Intransitivo', 'Macunaíma', 'Contos de Belazarte'], answer: 2 },
    { q: 'Qual poema de Manuel Bandeira, declamado na Semana de Arte Moderna de 1922, satiriza o Parnasianismo?', options: ['Os Sapos', 'Pneumotórax', 'Evocação do Recife', 'Vou-me embora pra Pasárgada'], answer: 0 },
    { q: 'Em qual livro, de 1930, Carlos Drummond de Andrade estreou na poesia?', options: ['Sentimento do Mundo', 'Alguma Poesia', 'A Rosa do Povo', 'Claro Enigma'], answer: 1 },
    { q: 'Em “Grande Sertão: Veredas”, de Guimarães Rosa, quem narra a história a um interlocutor letrado?', options: ['Diadorim', 'Zé Bebelo', 'Riobaldo', 'Medeiro Vaz'], answer: 2 },
    { q: 'Qual obra de Cecília Meireles poetiza os acontecimentos da Inconfidência Mineira?', options: ['Viagem', 'Mar Absoluto', 'Vaga Música', 'Romanceiro da Inconfidência'], answer: 3 },
    { q: 'Qual personagem de Lima Barreto, funcionário público de nacionalismo exaltado, propõe o tupi como língua oficial do Brasil?', options: ['Isaías Caminha', 'Gonzaga de Sá', 'Clara dos Anjos', 'Policarpo Quaresma'], answer: 3 },
    { q: 'Qual romance de Jorge Amado retrata a vida de meninos abandonados que vivem em um trapiche em Salvador?', options: ['Gabriela, Cravo e Canela', 'Capitães da Areia', 'Tenda dos Milagres', 'Mar Morto'], answer: 1 },
    { q: 'Na “Poética”, Aristóteles define a catarse como:', options: ['O rompimento da quarta parede no teatro', 'O uso de máscaras para ampliar a voz dos atores', 'A purificação das emoções do espectador, provocada por terror e piedade na tragédia', 'O final feliz obrigatório das comédias'], answer: 2 },
    { q: 'Em qual reino se passa a tragédia “Hamlet”, de Shakespeare, cujo protagonista é príncipe?', options: ['Escócia', 'Dinamarca', 'Inglaterra', 'Noruega'], answer: 1 },
    { q: 'Qual pintor renascentista é autor do afresco “A Escola de Atenas”, no Vaticano?', options: ['Michelangelo', 'Rafael Sanzio', 'Leonardo da Vinci', 'Ticiano'], answer: 1 },
    { q: '“O Nascimento de Vênus”, obra-prima do Renascimento florentino, é de:', options: ['Rafael Sanzio', 'Giotto', 'Masaccio', 'Sandro Botticelli'], answer: 3 },
    { q: 'Arcos ogivais, abóbadas de nervuras, arcobotantes e grandes vitrais são características de qual estilo arquitetônico?', options: ['Românico', 'Barroco', 'Neoclássico', 'Gótico'], answer: 3 },
    { q: 'Qual pintor neoclássico, ligado à Revolução Francesa, é autor de “A Morte de Marat”?', options: ['Eugène Delacroix', 'Francisco de Goya', 'Jacques-Louis David', 'Jean-Auguste Ingres'], answer: 2 },
    { q: 'Em “O 3 de Maio de 1808”, Goya denuncia a violência da ocupação de qual exército na Espanha?', options: ['O inglês', 'O prussiano', 'O otomano', 'O francês, de Napoleão'], answer: 3 },
    { q: 'Qual arquiteto catalão projetou a Sagrada Família, em Barcelona, com formas orgânicas inspiradas na natureza?', options: ['Antoni Gaudí', 'Lluís Domènech i Montaner', 'Josep Puig i Cadafalch', 'Santiago Calatrava'], answer: 0 },
    { q: 'Quem concebeu o Plano Piloto de Brasília, vencedor do concurso de 1957?', options: ['Oscar Niemeyer', 'Roberto Burle Marx', 'Lúcio Costa', 'Athos Bulcão'], answer: 2 },
    { q: 'Os painéis “Guerra e Paz”, de Candido Portinari, foram doados à sede de qual instituição?', options: ['UNESCO', 'Organização das Nações Unidas (ONU)', 'Organização dos Estados Americanos', 'Corte Internacional de Justiça'], answer: 1 },
    { q: 'O Parque Nacional da Serra da Capivara, famoso por seus sítios de pinturas rupestres, localiza-se em qual estado?', options: ['Piauí', 'Bahia', 'Minas Gerais', 'Maranhão'], answer: 0 },
    { q: 'Qual compositora brasileira escreveu “Ó Abre-Alas”, considerada a primeira marcha carnavalesca?', options: ['Chiquinha Gonzaga', 'Dolores Duran', 'Carmen Miranda', 'Maysa'], answer: 0 }
  ],
 
  ciencias: [
    { q: 'Um chuveiro elétrico de 5.500 W é usado 20 minutos por dia durante 30 dias. Qual é o consumo de energia no período?', options: ['18,3 kWh', '33 kWh', '55 kWh', '110 kWh'], answer: 2 },
    { q: 'Uma solução de ácido forte com pH = 3 é diluída 100 vezes com água pura. Qual é, aproximadamente, o pH final?', options: ['1', '3,5', '5', '7'], answer: 2 },
    { q: 'Um casal normal, ambos heterozigotos para o albinismo (herança autossômica recessiva), planeja ter um filho. Qual a probabilidade de a criança ser do sexo feminino e albina?', options: ['1/8', '1/4', '1/2', '1/16'], answer: 0 },
    { q: 'O aumento da concentração de mercúrio nos tecidos à medida que se sobe nos níveis tróficos de uma cadeia alimentar é chamado de:', options: ['Eutrofização', 'Inversão térmica', 'Lixiviação', 'Biomagnificação'], answer: 3 },
    { q: 'Qual propriedade da água explica a menor amplitude térmica diária em regiões litorâneas do que no interior do continente?', options: ['Baixa densidade da água líquida', 'Alto calor específico', 'Alta tensão superficial', 'Baixo ponto de fusão'], answer: 1 },
    { q: 'A reação entre um ácido carboxílico e um álcool, com formação de éster e água, é chamada de:', options: ['Saponificação', 'Hidrogenação', 'Esterificação', 'Combustão'], answer: 2 },
    { q: 'Em qual etapa da respiração celular aeróbia ocorre a maior produção de ATP, nas cristas mitocondriais?', options: ['Cadeia transportadora de elétrons', 'Glicólise', 'Ciclo de Krebs', 'Fermentação lática'], answer: 0 },
    { q: 'Quando uma ambulância com a sirene ligada se aproxima de um observador parado, ele percebe um som com frequência:', options: ['Menor que a emitida, pois as frentes de onda se afastam', 'Maior que a emitida, pois as frentes de onda ficam comprimidas', 'Igual à emitida, pois a fonte emite sempre a mesma frequência', 'Menor que a emitida, pois a velocidade do som diminui'], answer: 1 },
    { q: 'Quantos anagramas distintos tem a palavra ENEM?', options: ['6', '8', '12', '24'], answer: 2 },
    { q: 'Um capital de R$ 2.000,00 é aplicado a juros compostos de 10% ao ano. Qual será o montante após 2 anos?', options: ['R$ 2.400,00', 'R$ 2.420,00', 'R$ 2.440,00', 'R$ 2.200,00'], answer: 1 },
    { q: 'Uma amostra de 80 g de um radioisótopo com meia-vida de 5 dias é guardada por 20 dias. Que massa do isótopo restará?', options: ['20 g', '10 g', '5 g', '2,5 g'], answer: 2 },
    { q: 'Uma pessoa picada por cobra peçonhenta recebe soro antiofídico. Esse tipo de imunização é:', options: ['Ativa e duradoura', 'Ativa e temporária', 'Passiva e duradoura', 'Passiva e temporária'], answer: 3 },
    { q: 'Na síntese da amônia (N2 + 3 H2 ⇌ 2 NH3, reação exotérmica), qual condição desloca o equilíbrio no sentido de maior formação de NH3, segundo o princípio de Le Chatelier?', options: ['Aumentar a temperatura e reduzir a pressão', 'Reduzir a temperatura e aumentar a pressão', 'Aumentar a temperatura e a pressão', 'Reduzir a temperatura e a pressão'], answer: 1 },
    { q: 'Um corpo de 2 kg é solto, a partir do repouso, de uma altura de 5 m. Desprezando o atrito e adotando g = 10 m/s², com que velocidade ele atinge o solo?', options: ['100 m/s', '50 m/s', '10 m/s', '5 m/s'], answer: 2 },
    { q: 'Segundo a teoria sintética da evolução, a variabilidade genética sobre a qual atua a seleção natural tem origem principalmente em:', options: ['Mutação e recombinação gênica', 'Uso e desuso de órgãos', 'Herança de caracteres adquiridos', 'Vontade dos organismos de se adaptar'], answer: 0 },
    { q: 'Na fase clara da fotossíntese, o oxigênio liberado tem origem:', options: ['No gás carbônico', 'Na glicose', 'No NADPH', 'Na fotólise da água'], answer: 3 },
    { q: 'A replicação do DNA é chamada de semiconservativa porque cada molécula-filha possui:', options: ['Duas fitas totalmente novas', 'Duas fitas originais', 'Fragmentos aleatórios de fitas antigas e novas', 'Uma fita original e uma fita nova'], answer: 3 },
    { q: 'Dizer que o código genético é “degenerado” significa que:', options: ['Um códon pode codificar vários aminoácidos', 'Mais de um códon pode codificar o mesmo aminoácido', 'O código varia de espécie para espécie', 'Alguns códons não são lidos pelos ribossomos'], answer: 1 },
    { q: 'Do cruzamento de dois indivíduos duplo-heterozigotos (AaBb × AaBb), com genes de segregação independente e dominância completa, qual a proporção fenotípica esperada?', options: ['3 : 1', '1 : 1 : 1 : 1', '9 : 3 : 3 : 1', '1 : 2 : 1'], answer: 2 },
    { q: 'Um homem de sangue tipo A (heterozigoto) e uma mulher de sangue tipo B (heterozigota) podem ter filhos de quais tipos sanguíneos?', options: ['Apenas AB', 'Apenas A e B', 'A, B, AB e O', 'Apenas AB e O'], answer: 2 },
    { q: 'A eritroblastose fetal ocorre quando há incompatibilidade entre:', options: ['Mãe Rh positivo e feto Rh negativo', 'Pai e mãe Rh positivos', 'Mãe tipo O e feto tipo A, apenas', 'Mãe Rh negativo, previamente sensibilizada, e feto Rh positivo'], answer: 3 },
    { q: 'Qual hormônio, produzido pelo pâncreas, estimula o fígado a liberar glicose no sangue?', options: ['Insulina', 'Tiroxina', 'Aldosterona', 'Glucagon'], answer: 3 },
    { q: 'Quais células se diferenciam em plasmócitos e produzem anticorpos?', options: ['Linfócitos T citotóxicos', 'Macrófagos', 'Linfócitos B', 'Neutrófilos'], answer: 2 },
    { q: 'Qual conjunto de doenças é transmitido pelo mosquito Aedes aegypti?', options: ['Dengue, zika e chikungunya', 'Malária, dengue e leishmaniose', 'Doença de Chagas, dengue e esquistossomose', 'Tuberculose, zika e dengue'], answer: 0 },
    { q: 'O agente causador da doença de Chagas é:', options: ['Uma bactéria do gênero Salmonella', 'Um vírus de RNA', 'Um fungo do gênero Candida', 'O protozoário Trypanosoma cruzi'], answer: 3 },
    { q: 'Em média, que porcentagem da energia de um nível trófico é transferida ao nível seguinte em uma cadeia alimentar?', options: ['Cerca de 10%', 'Cerca de 50%', 'Cerca de 90%', 'Cerca de 25%'], answer: 0 },
    { q: 'As bactérias do gênero Rhizobium, que vivem em nódulos nas raízes de leguminosas, são importantes porque:', options: ['Fixam o nitrogênio atmosférico, tornando-o aproveitável pelas plantas', 'Decompõem a celulose do solo', 'Realizam fotossíntese nas raízes', 'Absorvem o fósforo da água'], answer: 0 },
    { q: 'Qual gás de efeito estufa é emitido pela pecuária, por aterros sanitários e por plantações de arroz alagadas?', options: ['Oxigênio', 'Nitrogênio', 'Metano', 'Argônio'], answer: 2 },
    { q: 'Quais substâncias, banidas pelo Protocolo de Montreal, destroem a camada de ozônio?', options: ['Dióxido de carbono', 'Clorofluorcarbonos (CFCs)', 'Dióxido de enxofre', 'Metano'], answer: 1 },
    { q: 'Em dias muito quentes e secos, as plantas fecham os estômatos para:', options: ['Aumentar a absorção de gás carbônico', 'Reduzir a perda de água por transpiração', 'Intensificar a fotossíntese', 'Eliminar o excesso de oxigênio'], answer: 1 },
    { q: 'Um elemento de número atômico 17 pertence a qual família da tabela periódica?', options: ['Gases nobres', 'Metais alcalinos', 'Calcogênios', 'Halogênios'], answer: 3 },
    { q: 'Qual é a geometria da molécula de água (H2O)?', options: ['Angular', 'Linear', 'Trigonal plana', 'Tetraédrica'], answer: 0 },
    { q: 'Quantos mols de CO2 há em 88 g dessa substância? (massas atômicas: C = 12; O = 16)', options: ['1 mol', '4 mol', '2 mol', '0,5 mol'], answer: 2 },
    { q: 'Na reação 2 H2 + O2 → 2 H2O, quantos mols de água se formam a partir de 3 mol de H2, com O2 em excesso?', options: ['1,5 mol', '3 mol', '6 mol', '2 mol'], answer: 1 },
    { q: 'Quando 4 g de NaOH (massa molar = 40 g/mol) são dissolvidos em água até completar 500 mL de solução, qual é a concentração em mol/L?', options: ['0,1 mol/L', '2 mol/L', '0,2 mol/L', '0,4 mol/L'], answer: 2 },
    { q: 'Qual dos processos abaixo é endotérmico?', options: ['Combustão do etanol', 'Condensação do vapor de água', 'Solidificação da água', 'Fusão do gelo'], answer: 3 },
    { q: 'Em uma pilha, como se chama o eletrodo no qual ocorre a oxidação?', options: ['Cátodo', 'Ponte salina', 'Eletrólito', 'Ânodo'], answer: 3 },
    { q: 'O etanol (CH3CH2OH) e o éter dimetílico (CH3OCH3) são isômeros de qual tipo?', options: ['De cadeia', 'De posição', 'De função', 'Geométrica'], answer: 2 },
    { q: 'Qual é o monômero do polietileno?', options: ['Eteno', 'Propeno', 'Cloreto de vinila', 'Estireno'], answer: 0 },
    { q: 'Um gás ideal sofre compressão isotérmica e sua pressão dobra. O que acontece com o volume?', options: ['Dobra', 'Cai pela metade', 'Permanece constante', 'Quadruplica'], answer: 1 },
    { q: 'Qual fenômeno permite que a luz seja transmitida por longas distâncias em uma fibra óptica?', options: ['Reflexão total interna', 'Difração', 'Polarização', 'Dispersão cromática'], answer: 0 },
    { q: 'Um resistor de 20 Ω é percorrido por uma corrente de 3 A. Qual é a tensão entre seus terminais?', options: ['6,7 V', '23 V', '17 V', '60 V'], answer: 3 },
    { q: 'Dois resistores de 6 Ω e 3 Ω são ligados em paralelo. Qual é a resistência equivalente?', options: ['9 Ω', '4,5 Ω', '2 Ω', '3 Ω'], answer: 2 },
    { q: 'Qual é o período de um satélite geoestacionário em órbita da Terra?', options: ['24 horas', '12 horas', '90 minutos', '1 semana'], answer: 0 },
    { q: 'Que quantidade de calor é necessária para aquecer 200 g de água de 20 °C a 50 °C? (calor específico da água = 1 cal/g·°C)', options: ['6.000 cal', '4.000 cal', '10.000 cal', '600 cal'], answer: 0 },
    { q: 'Uma onda sonora tem frequência de 170 Hz e comprimento de onda de 2 m. Qual é a sua velocidade de propagação?', options: ['340 m/s', '85 m/s', '170 m/s', '680 m/s'], answer: 0 },
    { q: 'Em uma prova, um aluno obteve as notas 4, 6, 6, 8 e 11. Qual é a mediana?', options: ['7', '6', '8', '4'], answer: 1 },
    { q: 'O preço de um produto, R$ 200,00, sofre aumento de 20% e, depois, desconto de 20% sobre o novo valor. Qual é o preço final?', options: ['R$ 200,00', 'R$ 192,00', 'R$ 208,00', 'R$ 160,00'], answer: 1 },
    { q: 'Qual é o volume de um cilindro com raio da base de 2 m e altura de 5 m? (use π = 3)', options: ['20 m³', '30 m³', '60 m³', '120 m³'], answer: 2 },
    { q: 'Ao lançar dois dados honestos, qual é a probabilidade de a soma dos resultados ser 7?', options: ['1/12', '1/6', '1/9', '7/36'], answer: 1 }
  ],
 
  entretenimento: [
    { q: 'Qual álbum-manifesto de 1968 reuniu Caetano Veloso, Gilberto Gil, Gal Costa, Os Mutantes, Tom Zé e Nara Leão, sintetizando o movimento tropicalista?', options: ['Construção', 'Clube da Esquina', 'Acabou Chorare', 'Tropicália ou Panis et Circencis'], answer: 3 },
    { q: 'Qual cineasta é associado ao lema do Cinema Novo “uma câmera na mão e uma ideia na cabeça” e dirigiu “Deus e o Diabo na Terra do Sol”?', options: ['Walter Salles', 'Glauber Rocha', 'Fernando Meirelles', 'Carlos Diegues'], answer: 1 },
    { q: 'Qual canção, gravada por João Gilberto em 1958, é considerada o marco inicial da Bossa Nova?', options: ['Garota de Ipanema', 'Desafinado', 'Chega de Saudade', 'Águas de Março'], answer: 2 },
    { q: 'O conceito de “indústria cultural”, que critica a transformação da cultura em mercadoria padronizada, foi formulado por Adorno e Horkheimer, da:', options: ['Escola de Frankfurt', 'Escola de Chicago', 'Escola Estruturalista francesa', 'Escola Funcionalista norte-americana'], answer: 0 },
    { q: 'Mafalda, personagem de tirinhas conhecida por seu olhar crítico sobre política e sociedade, foi criada por Quino, cartunista de qual nacionalidade?', options: ['Chilena', 'Uruguaia', 'Espanhola', 'Argentina'], answer: 3 },
    { q: 'Qual movimento cinematográfico do pós-guerra se caracterizou por filmar em locações reais, com atores não profissionais e temas ligados à vida popular, como em “Ladrões de Bicicleta”?', options: ['Expressionismo alemão', 'Neorrealismo italiano', 'Nouvelle Vague francesa', 'Realismo socialista soviético'], answer: 1 },
    { q: 'Qual música, registrada em 1917 e atribuída a Donga e Mauro de Almeida, é considerada o primeiro samba gravado?', options: ['Pelo Telefone', 'Aquarela do Brasil', 'Carinhoso', 'Na Pavuna'], answer: 0 },
    { q: 'Em 1938, uma radiodramatização de Orson Welles causou pânico nos Estados Unidos por ser confundida com uma reportagem real. Qual obra ela adaptava?', options: ['A Máquina do Tempo', 'O Homem Invisível', 'A Guerra dos Mundos', 'A Ilha do Dr. Moreau'], answer: 2 },
    { q: 'Qual movimento surgido em Recife nos anos 1990, liderado por Chico Science & Nação Zumbi, misturou maracatu, rock e hip hop e teve o caranguejo como símbolo?', options: ['Jovem Guarda', 'Manguebeat', 'Axé music', 'Tecnobrega'], answer: 1 },
    { q: 'O filme “Cidade de Deus” (2002), de Fernando Meirelles, é adaptação do romance de qual escritor?', options: ['Rubem Fonseca', 'Marçal Aquino', 'Patrícia Melo', 'Paulo Lins'], answer: 3 },
    { q: 'Qual telenovela da TV Tupi (1968) é considerada marco por abandonar o melodrama de época e adotar linguagem coloquial e temas do cotidiano urbano?', options: ['O Direito de Nascer', 'Irmãos Coragem', 'Beto Rockfeller', 'Roque Santeiro'], answer: 2 },
    { q: 'Qual história em quadrinhos, vencedora de um prêmio Pulitzer especial em 1992, retrata o Holocausto representando judeus como ratos e nazistas como gatos?', options: ['Persépolis', 'Maus', 'Watchmen', 'V de Vingança'], answer: 1 },
    { q: 'O álbum duplo “Clube da Esquina” (1972) foi assinado por Milton Nascimento e por qual outro músico mineiro?', options: ['Lô Borges', 'Caetano Veloso', 'Jorge Ben', 'Gilberto Gil'], answer: 0 },
    { q: 'Qual filme de Charles Chaplin (1936) faz uma crítica bem-humorada à mecanização e ao ritmo de trabalho da linha de montagem do fordismo?', options: ['O Garoto', 'Luzes da Cidade', 'Tempos Modernos', 'O Grande Ditador'], answer: 2 },
    { q: 'Quais são os quatro elementos tradicionais da cultura hip-hop?', options: ['Rap, funk, soul e jazz', 'MC, DJ, breaking e grafite', 'Rima, beat, scratch e sample', 'Slam, tag, beatbox e funk'], answer: 1 },
    { q: 'Qual álbum dos Beatles, lançado em 1967, é apontado como marco da experimentação em estúdio no rock?', options: ['Abbey Road', 'Revolver', 'Let It Be', 'Sgt. Pepper\'s Lonely Hearts Club Band'], answer: 3 },
    { q: 'Qual banda britânica lançou, em 1973, o álbum “The Dark Side of the Moon”?', options: ['Led Zeppelin', 'Genesis', 'Yes', 'Pink Floyd'], answer: 3 },
    { q: 'Qual integrante do Queen nasceu em Zanzibar e se tornou um dos maiores vocalistas do rock?', options: ['Brian May', 'Roger Taylor', 'Freddie Mercury', 'John Deacon'], answer: 2 },
    { q: 'Com qual compositor Elis Regina gravou, em 1974, o álbum “Elis & Tom”, que inclui “Águas de Março”?', options: ['Vinicius de Moraes', 'Chico Buarque', 'Milton Nascimento', 'Tom Jobim'], answer: 3 },
    { q: 'Qual canção de Chico Buarque e Gilberto Gil, de 1973, usa um jogo de palavras com “cale-se” para driblar a censura da ditadura?', options: ['Cálice', 'Apesar de Você', 'Construção', 'Roda Viva'], answer: 0 },
    { q: 'Qual banda de rock brasileira tinha Renato Russo como vocalista?', options: ['Os Paralamas do Sucesso', 'Legião Urbana', 'Titãs', 'Barão Vermelho'], answer: 1 },
    { q: 'Em que ano aconteceu a primeira edição do Rock in Rio?', options: ['1981', '1985', '1989', '1991'], answer: 1 },
    { q: 'Carmen Miranda, símbolo da música brasileira em Hollywood, nasceu em qual país?', options: ['Brasil', 'Espanha', 'Argentina', 'Portugal'], answer: 3 },
    { q: 'Qual foi o primeiro filme brasileiro a vencer a Palma de Ouro no Festival de Cannes, em 1962?', options: ['O Pagador de Promessas', 'Central do Brasil', 'Terra em Transe', 'Pixote'], answer: 0 },
    { q: 'Qual filme brasileiro rendeu a Fernanda Montenegro indicação ao Oscar de Melhor Atriz, em 1999?', options: ['Cidade de Deus', 'Tropa de Elite', 'Central do Brasil', 'O Que É Isso, Companheiro?'], answer: 2 },
    { q: 'O filme “Ainda Estou Aqui”, de Walter Salles, vencedor do Oscar de Melhor Filme Internacional em 2025, é baseado em livro de:', options: ['Paulo Lins', 'Marcelo Rubens Paiva', 'Milton Hatoum', 'Chico Buarque'], answer: 1 },
    { q: 'Qual diretor e ator realizou “Cidadão Kane” (1941), considerado um dos maiores filmes da história?', options: ['Alfred Hitchcock', 'John Ford', 'Orson Welles', 'Billy Wilder'], answer: 2 },
    { q: 'Quem dirigiu “Psicose” (1960), famoso pela cena do chuveiro?', options: ['Stanley Kubrick', 'Alfred Hitchcock', 'Orson Welles', 'Roman Polanski'], answer: 1 },
    { q: 'Qual filme de Stanley Kubrick apresenta o computador HAL 9000?', options: ['2001: Uma Odisseia no Espaço', 'Laranja Mecânica', 'O Iluminado', 'Nascido para Matar'], answer: 0 },
    { q: 'Quem dirigiu o clássico expressionista de ficção científica “Metrópolis” (1927)?', options: ['F. W. Murnau', 'Robert Wiene', 'Fritz Lang', 'Sergei Eisenstein'], answer: 2 },
    { q: 'Qual cineasta soviético dirigiu “O Encouraçado Potemkin” (1925), célebre por sua montagem?', options: ['Sergei Eisenstein', 'Dziga Vertov', 'Andrei Tarkovski', 'Vsevolod Pudovkin'], answer: 0 },
    { q: 'Qual cineasta da Nouvelle Vague francesa dirigiu “Acossado” (1960)?', options: ['François Truffaut', 'Jean-Luc Godard', 'Éric Rohmer', 'Agnès Varda'], answer: 1 },
    { q: 'Qual foi o primeiro longa-metragem de animação em cores dos estúdios Disney, lançado em 1937?', options: ['Branca de Neve e os Sete Anões', 'Pinóquio', 'Fantasia', 'Bambi'], answer: 0 },
    { q: 'Quem dirigiu a animação “A Viagem de Chihiro”, vencedora do Oscar de Melhor Animação em 2003?', options: ['Satoshi Kon', 'Hayao Miyazaki', 'Mamoru Hosoda', 'Makoto Shinkai'], answer: 1 },
    { q: 'Quem criou o Superman, que estreou em 1938 na revista Action Comics?', options: ['Bob Kane e Bill Finger', 'Stan Lee e Jack Kirby', 'Jerry Siegel e Joe Shuster', 'Will Eisner e Jack Cole'], answer: 2 },
    { q: 'Em que ano o Homem-Aranha estreou nos quadrinhos, na revista Amazing Fantasy nº 15?', options: ['1958', '1962', '1966', '1971'], answer: 1 },
    { q: 'Qual personagem foi criado por Osamu Tezuka, conhecido como o “pai do mangá moderno”?', options: ['Astro Boy', 'Dragon Ball', 'Naruto', 'One Piece'], answer: 0 },
    { q: 'A série “Game of Thrones” é baseada na saga “As Crônicas de Gelo e Fogo”, de qual autor?', options: ['J. R. R. Tolkien', 'George R. R. Martin', 'Patrick Rothfuss', 'Andrzej Sapkowski'], answer: 1 },
    { q: 'Quantos Oscars receberam, cada um, os filmes “Ben-Hur”, “Titanic” e “O Senhor dos Anéis: O Retorno do Rei”?', options: ['9', '12', '10', '11'], answer: 3 },
    { q: 'Qual álbum de Michael Jackson, lançado em 1982, é um dos mais vendidos da história?', options: ['Bad', 'Off the Wall', 'Thriller', 'Dangerous'], answer: 2 },
    { q: 'Qual músico pernambucano ficou conhecido como o “Rei do Baião”?', options: ['Luiz Gonzaga', 'Jackson do Pandeiro', 'Dominguinhos', 'Gilberto Gil'], answer: 0 },
    { q: 'Qual poeta cearense, nascido em Assaré, escreveu “A Triste Partida”, eternizada na voz de Luiz Gonzaga?', options: ['Zé Limeira', 'Patativa do Assaré', 'Ariano Suassuna', 'Leandro Gomes de Barros'], answer: 1 },
    { q: 'Qual compositor britânico criou os musicais “O Fantasma da Ópera” e “Cats”?', options: ['Stephen Sondheim', 'Lin-Manuel Miranda', 'Richard Rodgers', 'Andrew Lloyd Webber'], answer: 3 },
    { q: 'Em que ano estreou o Jornal Nacional, primeiro telejornal transmitido em rede nacional no Brasil?', options: ['1965', '1972', '1969', '1979'], answer: 2 },
    { q: 'Qual filme de 1927 é considerado o primeiro longa-metragem falado da história do cinema?', options: ['O Cantor de Jazz', 'Metrópolis', 'Luzes da Cidade', 'O Nascimento de uma Nação'], answer: 0 },
    { q: 'Qual diretor realizou “O Bandido da Luz Vermelha” (1968), marco do Cinema Marginal?', options: ['Glauber Rocha', 'Júlio Bressane', 'Ruy Guerra', 'Rogério Sganzerla'], answer: 3 },
    { q: 'Qual diretor de “Tropa de Elite” recebeu o Urso de Ouro no Festival de Berlim de 2008?', options: ['Fernando Meirelles', 'Kleber Mendonça Filho', 'Karim Aïnouz', 'José Padilha'], answer: 3 },
    { q: '“Bacurau”, vencedor do Prêmio do Júri em Cannes (2019), foi dirigido por:', options: ['Walter Salles e Daniela Thomas', 'Fernando Meirelles e Kátia Lund', 'Kleber Mendonça Filho e Juliano Dornelles', 'José Padilha e Marcos Prado'], answer: 2 },
    { q: 'Qual grupo de rap paulistano lançou, em 1997, o álbum “Sobrevivendo no Inferno”?', options: ['Facção Central', 'MV Bill', 'Planet Hemp', 'Racionais MC\'s'], answer: 3 },
    { q: 'Bob Marley, ícone do reggae, nasceu em qual país?', options: ['Jamaica', 'Cuba', 'Trinidad e Tobago', 'Haiti'], answer: 0 }
  ],
 
  esportes: [
    { q: 'Qual motivo os Estados Unidos alegaram para liderar o boicote aos Jogos Olímpicos de Moscou, em 1980?', options: ['A construção do Muro de Berlim', 'A invasão soviética do Afeganistão', 'A Crise dos Mísseis de Cuba', 'A intervenção soviética na Tchecoslováquia'], answer: 1 },
    { q: 'Quem conquistou quatro medalhas de ouro nos Jogos de Berlim (1936), contrariando a propaganda nazista de superioridade ariana?', options: ['Carl Lewis', 'Emil Zátopek', 'Usain Bolt', 'Jesse Owens'], answer: 3 },
    { q: 'Qual foi o significado do gesto dos velocistas Tommie Smith e John Carlos, com o punho cerrado no pódio dos Jogos de 1968?', options: ['Protesto contra a discriminação racial nos Estados Unidos', 'Comemoração de um recorde mundial', 'Apoio ao boicote dos países socialistas', 'Homenagem aos atletas mexicanos'], answer: 0 },
    { q: 'Na final da Copa do Mundo de 1950, no Maracanã, quem marcou o gol da vitória do Uruguai sobre o Brasil por 2 a 1?', options: ['Friaça', 'Ghiggia', 'Schiaffino', 'Obdulio Varela'], answer: 1 },
    { q: 'Qual médico organizou, em 1948, em Stoke Mandeville, a competição para veteranos com lesão medular que deu origem aos Jogos Paralímpicos?', options: ['Pierre de Coubertin', 'Avery Brundage', 'Ludwig Guttmann', 'Juan Antonio Samaranch'], answer: 2 },
    { q: 'No futebol, um atacante está em posição de impedimento quando, no momento do passe e na metade adversária do campo:', options: ['Está mais próximo da linha de fundo adversária do que a bola e do que o penúltimo adversário', 'Está atrás da linha da bola, entre dois zagueiros', 'Recebe a bola diretamente de um arremesso lateral', 'Está mais recuado do que o goleiro adversário'], answer: 0 },
    { q: 'No revezamento 4x100 m do atletismo, qual é o comprimento da zona de passagem do bastão?', options: ['30 metros', '10 metros', '40 metros', '20 metros'], answer: 3 },
    { q: 'Em 2014, a Roda de Capoeira foi reconhecida pela Unesco como:', options: ['Patrimônio Natural da Humanidade', 'Memória do Mundo', 'Patrimônio Cultural Imaterial da Humanidade', 'Patrimônio Cultural Material da Humanidade'], answer: 2 },
    { q: 'Em 2019, Marta superou Miroslav Klose como maior artilheira da história das Copas do Mundo de futebol (masculina e feminina). Quantos gols ela marcou em Mundiais?', options: ['17', '16', '15', '18'], answer: 0 },
    { q: 'Em qual circuito Ayrton Senna sofreu o acidente fatal, em 1994?', options: ['Mônaco', 'Ímola', 'Monza', 'Spa-Francorchamps'], answer: 1 },
    { q: 'O uso de eritropoetina (EPO) como doping visa, principalmente:', options: ['Aumentar o glicogênio armazenado nos músculos', 'Retardar a fadiga reduzindo o ácido lático', 'Aumentar a produção de hemácias e o transporte de oxigênio', 'Reduzir a frequência cardíaca de repouso'], answer: 2 },
    { q: 'Qual é a fonte de energia predominante em uma prova de 100 metros rasos?', options: ['Oxidação de gorduras', 'Glicólise aeróbia', 'Fermentação láctica', 'Sistema ATP-CP (anaeróbio alático)'], answer: 3 },
    { q: 'Qual atleta brasileiro foi bicampeão olímpico no salto triplo, em 1952 e 1956?', options: ['João do Pulo', 'Nelson Prudêncio', 'Adhemar Ferreira da Silva', 'Joaquim Cruz'], answer: 2 },
    { q: 'Ao vencer qual seleção na final da Copa de 1970 o Brasil conquistou a posse definitiva da Taça Jules Rimet?', options: ['Alemanha Ocidental', 'Itália', 'Uruguai', 'Tchecoslováquia'], answer: 1 },
    { q: 'Qual esporte foi criado em 1895 por William G. Morgan, nos Estados Unidos, como alternativa menos intensa ao basquete?', options: ['Vôlei', 'Handebol', 'Squash', 'Beisebol'], answer: 0 },
    { q: 'Em que ano o Brasil conquistou seu primeiro título mundial de futebol masculino?', options: ['1954', '1962', '1958', '1950'], answer: 2 },
    { q: 'Qual seleção o Brasil derrotou na final da Copa do Mundo de 2002, conquistando o pentacampeonato?', options: ['Itália', 'França', 'Argentina', 'Alemanha'], answer: 3 },
    { q: 'Qual país sediou a Copa do Mundo de 2022, vencida pela Argentina nos pênaltis sobre a França?', options: ['Rússia', 'Catar', 'Brasil', 'África do Sul'], answer: 1 },
    { q: 'Em qual estádio o Brasil perdeu por 7 a 1 para a Alemanha, na semifinal da Copa de 2014?', options: ['Maracanã, no Rio de Janeiro', 'Arena Corinthians, em São Paulo', 'Mineirão, em Belo Horizonte', 'Castelão, em Fortaleza'], answer: 2 },
    { q: 'Qual país sediou e venceu a primeira Copa do Mundo de futebol, em 1930?', options: ['Itália', 'Brasil', 'Argentina', 'Uruguai'], answer: 3 },
    { q: 'Qual seleção venceu a Copa do Mundo feminina de 2023, sediada por Austrália e Nova Zelândia?', options: ['Espanha', 'Inglaterra', 'Suécia', 'Estados Unidos'], answer: 0 },
    { q: 'Em 2016, o Brasil conquistou o inédito ouro olímpico no futebol masculino vencendo qual seleção na final, nos pênaltis?', options: ['Alemanha', 'Argentina', 'Espanha', 'Nigéria'], answer: 0 },
    { q: 'Em qual aparelho Rebeca Andrade conquistou a medalha de ouro nos Jogos de Tóquio 2020?', options: ['Salto', 'Solo', 'Trave', 'Barras assimétricas'], answer: 0 },
    { q: 'Qual judoca brasileira conquistou o ouro na categoria acima de 78 kg nos Jogos de Paris 2024?', options: ['Beatriz Souza', 'Rafaela Silva', 'Mayra Aguiar', 'Sarah Menezes'], answer: 0 },
    { q: 'Quantos títulos da NBA Michael Jordan conquistou com o Chicago Bulls?', options: ['5', '7', '6', '4'], answer: 2 },
    { q: 'Qual jogador brasileiro de basquete ficou conhecido como “Mão Santa” e é um dos maiores cestinhas da história?', options: ['Oscar Schmidt', 'Marcel de Souza', 'Rolando Ferreira', 'Guerrinha'], answer: 0 },
    { q: 'Quantas vezes Gustavo Kuerten (Guga) venceu o torneio de Roland Garros?', options: ['2', '4', '1', '3'], answer: 3 },
    { q: 'Qual Grand Slam de tênis é disputado em quadras de grama?', options: ['Roland Garros', 'US Open', 'Wimbledon', 'Aberto da Austrália'], answer: 2 },
    { q: 'Qual nadador é o maior medalhista olímpico da história, com 23 medalhas de ouro?', options: ['Mark Spitz', 'Ryan Lochte', 'Michael Phelps', 'Ian Thorpe'], answer: 2 },
    { q: 'Qual é o recorde mundial dos 100 metros rasos, estabelecido por Usain Bolt em 2009?', options: ['9s69', '9s79', '9s83', '9s58'], answer: 3 },
    { q: 'Qual ginasta romena fez história ao receber a nota 10 nos Jogos de Montreal, em 1976?', options: ['Nadia Comaneci', 'Olga Korbut', 'Simone Biles', 'Larisa Latynina'], answer: 0 },
    { q: 'Qual nadador conquistou o primeiro ouro olímpico do Brasil na natação, em Pequim 2008, nos 50 m livre?', options: ['Gustavo Borges', 'Thiago Pereira', 'César Cielo', 'Fernando Scherer'], answer: 2 },
    { q: 'Em quais Jogos Olímpicos a seleção masculina de vôlei do Brasil conquistou seu primeiro ouro?', options: ['Los Angeles 1984', 'Sydney 2000', 'Atenas 2004', 'Barcelona 1992'], answer: 3 },
    { q: 'Quantas vezes Gabriel Medina foi campeão mundial de surfe?', options: ['2', '4', '5', '3'], answer: 3 },
    { q: 'Somando os títulos de Emerson Fittipaldi, Nelson Piquet e Ayrton Senna, quantos campeonatos mundiais de Fórmula 1 o Brasil tem?', options: ['7', '9', '8', '6'], answer: 2 },
    { q: 'Qual família brasileira foi fundamental para popularizar o jiu-jítsu no mundo, inclusive nos primeiros UFCs?', options: ['Silva', 'Nogueira', 'Gracie', 'Machida'], answer: 2 },
    { q: 'Em qual país aconteceu a luta “Rumble in the Jungle” (1974), entre Muhammad Ali e George Foreman?', options: ['Nigéria', 'Zaire (atual República Democrática do Congo)', 'Gana', 'Tanzânia'], answer: 1 },
    { q: 'O treinamento aeróbico regular provoca, na frequência cardíaca de repouso de um atleta, qual adaptação?', options: ['Aumento', 'Redução (bradicardia de repouso)', 'Nenhuma alteração', 'Irregularidade permanente'], answer: 1 },
    { q: 'Quantos jogadores de cada equipe ficam em quadra no handebol, incluindo o goleiro?', options: ['6', '7', '5', '8'], answer: 1 },
    { q: 'Qual é a duração de cada quarto em jogos de basquete regidos pelas regras da FIBA?', options: ['12 minutos', '10 minutos', '15 minutos', '8 minutos'], answer: 1 },
    { q: 'Quem foi a primeira mulher brasileira a participar dos Jogos Olímpicos, em Los Angeles 1932?', options: ['Aída dos Santos', 'Maria Lenk', 'Hortência Marcari', 'Rosa Branca'], answer: 1 },
    { q: 'Quantas Copas do Mundo Pelé conquistou como jogador?', options: ['2', '3', '4', '1'], answer: 1 },
    { q: 'Qual cidade sediou a primeira edição dos Jogos Pan-Americanos, em 1951?', options: ['Cidade do México', 'Rio de Janeiro', 'Chicago', 'Buenos Aires'], answer: 3 },
    { q: 'Qual foi o primeiro clube brasileiro campeão da Copa Libertadores da América, em 1962?', options: ['Flamengo', 'Palmeiras', 'Santos', 'Cruzeiro'], answer: 2 },
    { q: 'Qual clube europeu o Flamengo derrotou por 3 a 0 na final do Mundial de Clubes de 1981?', options: ['Liverpool', 'Bayern de Munique', 'Juventus', 'Nottingham Forest'], answer: 0 },
    { q: 'Em qual cidade fica a Arena Castelão, que recebeu jogos da Copa do Mundo de 2014?', options: ['Recife', 'Fortaleza', 'Natal', 'Salvador'], answer: 1 },
    { q: 'O ciclista Lance Armstrong perdeu sete títulos, por doping, em qual competição?', options: ['Giro d\'Italia', 'Tour de France', 'Vuelta a España', 'Paris-Roubaix'], answer: 1 },
    { q: 'Qual país é o maior medalhista olímpico de todos os tempos nos Jogos de Verão?', options: ['União Soviética', 'China', 'Alemanha', 'Estados Unidos'], answer: 3 },
    { q: 'Segundo a tradição, em que ano teriam começado os Jogos Olímpicos da Antiguidade, realizados em Olímpia?', options: ['776 a.C.', '490 a.C.', '1000 a.C.', '396 a.C.'], answer: 0 },
    { q: 'Que medalha a skatista Rayssa Leal, a “Fadinha”, conquistou em Tóquio 2020, aos 13 anos?', options: ['Prata', 'Ouro', 'Bronze', 'Não subiu ao pódio'], answer: 0 }
  ],
 
  geografia: [
    { q: 'Quando são 15h em Brasília (UTC−3), que horas são em Tóquio (UTC+9)?', options: ['21h do mesmo dia', '12h do mesmo dia', '3h do dia seguinte', '9h do dia seguinte'], answer: 2 },
    { q: 'Em um mapa de escala 1:250.000, uma distância de 3 cm representa, na realidade:', options: ['0,75 km', '7,5 km', '75 km', '12 km'], answer: 1 },
    { q: 'Qual efeito climático costuma ocorrer no Brasil durante episódios de El Niño forte?', options: ['Seca no Norte e Nordeste e chuvas acima da média no Sul', 'Chuvas intensas no Nordeste e seca no Sul', 'Geadas frequentes na Amazônia', 'Aumento das chuvas no Centro-Oeste e seca no litoral do Sul'], answer: 0 },
    { q: 'Na classificação de Aziz Ab\'Sáber, o relevo de “mares de morros” florestados é típico de qual domínio morfoclimático?', options: ['Domínio do Cerrado', 'Domínio das Caatingas', 'Domínio Tropical Atlântico', 'Domínio das Pradarias'], answer: 2 },
    { q: 'O processo pelo qual a revitalização de áreas urbanas degradadas valoriza os imóveis e expulsa moradores de baixa renda é chamado de:', options: ['Conurbação', 'Gentrificação', 'Favelização', 'Periferização'], answer: 1 },
    { q: 'A queda da taxa de fecundidade e o aumento da expectativa de vida no Brasil têm como consequência, na pirâmide etária:', options: ['Alargamento da base e estreitamento do topo', 'Manutenção do formato triangular', 'Aumento simultâneo da base e do topo', 'Estreitamento da base e alargamento do topo'], answer: 3 },
    { q: 'Qual destes países NÃO foi signatário original do Tratado de Assunção, que criou o Mercosul em 1991?', options: ['Argentina', 'Paraguai', 'Uruguai', 'Chile'], answer: 3 },
    { q: 'Qual bacia hidrográfica brasileira concentra a maior capacidade hidrelétrica instalada, abrigando usinas como Itaipu?', options: ['Amazônica', 'Tocantins-Araguaia', 'Paraná', 'São Francisco'], answer: 2 },
    { q: 'A intensa atividade sísmica e vulcânica no Cinturão de Fogo do Pacífico está associada, principalmente, a:', options: ['Divergência de placas, com formação de nova crosta', 'Convergência de placas, com subducção', 'Atividade de pontos quentes no interior das placas', 'Deslizamento lateral de placas, sem vulcanismo'], answer: 1 },
    { q: 'Qual país foi incorporado em 2011 ao grupo então chamado BRIC, dando origem à sigla BRICS?', options: ['Arábia Saudita', 'Egito', 'África do Sul', 'Indonésia'], answer: 2 },
    { q: 'A chamada Revolução Verde caracterizou-se pela:', options: ['Adoção de sementes melhoradas, fertilizantes, agrotóxicos e mecanização para elevar a produtividade', 'Volta a técnicas tradicionais e orgânicas de cultivo', 'Reforma agrária ampla, com redistribuição de terras', 'Substituição da agricultura pela pecuária extensiva'], answer: 0 },
    { q: 'Qual acordo, firmado na COP21 (2015), estabeleceu a meta de manter o aumento da temperatura média global bem abaixo de 2 °C em relação à era pré-industrial?', options: ['Protocolo de Montreal', 'Protocolo de Kyoto', 'Acordo de Paris', 'Convenção da Basileia'], answer: 2 },
    { q: 'A sigla MATOPIBA designa uma fronteira agrícola formada por áreas de quais estados?', options: ['Mato Grosso, Tocantins, Pará e Bahia', 'Maranhão, Tocantins, Piauí e Bahia', 'Minas Gerais, Tocantins, Piauí e Bahia', 'Maranhão, Tocantins, Pernambuco e Bahia'], answer: 1 },
    { q: 'Qual estreito liga o Golfo Pérsico ao Golfo de Omã e por ele passa cerca de um quinto do petróleo consumido no mundo?', options: ['Gibraltar', 'Malaca', 'Bósforo', 'Ormuz'], answer: 3 },
    { q: 'O Aquífero Guarani, uma das maiores reservas subterrâneas de água doce do planeta, estende-se por quais países?', options: ['Brasil, Argentina, Paraguai e Uruguai', 'Brasil, Bolívia, Peru e Colômbia', 'Brasil, Argentina, Chile e Bolívia', 'Brasil, Venezuela, Guiana e Suriname'], answer: 0 },
    { q: 'Qual é a capital da Austrália?', options: ['Camberra', 'Sydney', 'Melbourne', 'Brisbane'], answer: 0 },
    { q: 'O Rio São Francisco, chamado de “rio da integração nacional”, nasce em qual estado?', options: ['Bahia', 'Goiás', 'Pernambuco', 'Minas Gerais'], answer: 3 },
    { q: 'O Projeto de Integração do Rio São Francisco (transposição) leva água principalmente para:', options: ['O Centro-Oeste', 'O semiárido do Nordeste Setentrional', 'A região Sul', 'A Amazônia Oriental'], answer: 1 },
    { q: 'Qual clima predomina no litoral leste do Nordeste, de Salvador a Natal?', options: ['Semiárido', 'Tropical úmido (litorâneo)', 'Equatorial', 'Subtropical'], answer: 1 },
    { q: 'Qual bioma brasileiro é chamado de “berço das águas” por abrigar nascentes de grandes bacias hidrográficas?', options: ['Cerrado', 'Caatinga', 'Pampa', 'Pantanal'], answer: 0 },
    { q: 'Qual é a maior planície inundável contínua do planeta, localizada em Mato Grosso e Mato Grosso do Sul?', options: ['Pantanal', 'Pampa', 'Llanos', 'Chaco'], answer: 0 },
    { q: 'Qual é o único bioma exclusivamente brasileiro?', options: ['Cerrado', 'Mata Atlântica', 'Pampa', 'Caatinga'], answer: 3 },
    { q: 'Os chamados “rios voadores” da Amazônia são:', options: ['Rios subterrâneos sob a floresta', 'Correntes marítimas do Atlântico', 'Massas de vapor de água transportadas pelo ar para outras regiões', 'Geleiras que se derretem nos Andes'], answer: 2 },
    { q: 'Segundo o Censo, em qual década a população urbana brasileira ultrapassou a população rural?', options: ['1970', '1940', '1950', '1990'], answer: 0 },
    { q: 'O Índice de Desenvolvimento Humano (IDH) é calculado a partir de três dimensões:', options: ['PIB, inflação e desemprego', 'Saneamento, moradia e transporte', 'Natalidade, mortalidade e migração', 'Longevidade, educação e renda'], answer: 3 },
    { q: 'O índice de Gini é usado para medir:', options: ['A taxa de crescimento populacional', 'O nível de poluição atmosférica', 'A desigualdade na distribuição de renda', 'A inflação acumulada'], answer: 2 },
    { q: 'Qual sistema de produção, criado no Japão, baseia-se na produção flexível e no sistema just-in-time?', options: ['Fordismo', 'Taylorismo', 'Toyotismo', 'Keynesianismo'], answer: 2 },
    { q: 'Qual organização, sediada em Genebra, regula o comércio internacional e resolve disputas comerciais entre países?', options: ['Fundo Monetário Internacional (FMI)', 'Organização das Nações Unidas (ONU)', 'Organização Mundial do Comércio (OMC)', 'Banco Mundial'], answer: 2 },
    { q: 'Qual país deixou a União Europeia em 2020, após plebiscito realizado em 2016?', options: ['Noruega', 'Dinamarca', 'Reino Unido', 'Suíça'], answer: 2 },
    { q: 'No Irã, a maioria da população muçulmana pertence a qual ramo do islamismo?', options: ['Sunita', 'Xiita', 'Ismaelita', 'Drusa'], answer: 1 },
    { q: 'Qual península, na Ucrânia, foi anexada pela Rússia em 2014?', options: ['Kamchatka', 'Sacalina', 'Jutlândia', 'Crimeia'], answer: 3 },
    { q: 'Qual país ultrapassou a China e se tornou o mais populoso do mundo em 2023?', options: ['Indonésia', 'Estados Unidos', 'Índia', 'Paquistão'], answer: 2 },
    { q: 'Como se chama a faixa semiárida ao sul do deserto do Saara, afetada por desertificação e crises alimentares?', options: ['Kalahari', 'Sahel', 'Namibe', 'Atlas'], answer: 1 },
    { q: 'O Canal de Suez liga quais dois mares?', options: ['Mediterrâneo e Vermelho', 'Atlântico e Pacífico', 'Báltico e do Norte', 'Negro e Cáspio'], answer: 0 },
    { q: 'O encolhimento do Mar de Aral resultou principalmente de:', options: ['Terremotos na Ásia Central', 'Derretimento de geleiras polares', 'Extração de petróleo no leito do mar', 'Desvio dos rios que o abastecem para irrigação de lavouras'], answer: 3 },
    { q: 'A formação do Himalaia resulta da colisão entre quais placas tectônicas?', options: ['Indo-Australiana e Eurasiana', 'Africana e Sul-Americana', 'Pacífica e Norte-Americana', 'Nazca e Sul-Americana'], answer: 0 },
    { q: 'A Falha de San Andreas, na Califórnia, é um exemplo de limite de placas do tipo:', options: ['Convergente', 'Transformante', 'Divergente', 'Ponto quente'], answer: 1 },
    { q: 'A “terra roxa”, solo fértil muito associado à cafeicultura, origina-se da decomposição de qual rocha?', options: ['Basalto', 'Granito', 'Arenito', 'Calcário'], answer: 0 },
    { q: 'Qual destes estados é cortado pelo Trópico de Capricórnio?', options: ['Rio de Janeiro', 'São Paulo', 'Espírito Santo', 'Bahia'], answer: 1 },
    { q: 'Qual capital brasileira é cortada pela Linha do Equador?', options: ['Belém', 'Macapá', 'Manaus', 'Boa Vista'], answer: 1 },
    { q: 'Qual é o maior produtor mundial de soja?', options: ['Estados Unidos', 'Argentina', 'Brasil', 'China'], answer: 2 },
    { q: 'A usina hidrelétrica de Belo Monte foi construída em qual rio?', options: ['Madeira', 'Tapajós', 'Tocantins', 'Xingu'], answer: 3 },
    { q: 'Qual região brasileira lidera a geração de energia eólica, com destaque para Ceará, Rio Grande do Norte e Bahia?', options: ['Sul', 'Centro-Oeste', 'Norte', 'Nordeste'], answer: 3 },
    { q: 'O Quadrilátero Ferrífero, importante área de extração de minério de ferro, localiza-se em qual estado?', options: ['Pará', 'Goiás', 'Minas Gerais', 'Mato Grosso do Sul'], answer: 2 },
    { q: 'Segundo a teoria de Thomas Malthus, a população cresce em progressão ___ e a produção de alimentos em progressão ___.', options: ['Aritmética; geométrica', 'Geométrica; aritmética', 'Aritmética; aritmética', 'Geométrica; geométrica'], answer: 1 },
    { q: 'A projeção cartográfica de Mercator apresenta qual distorção?', options: ['Reduz as áreas próximas ao Equador', 'Distorce somente os oceanos', 'Mantém todas as áreas proporcionais', 'Amplia as áreas próximas aos polos'], answer: 3 },
    { q: 'As estações do ano ocorrem devido a:', options: ['Variação da distância entre a Terra e o Sol', 'Movimento de rotação da Terra', 'Inclinação do eixo terrestre combinada ao movimento de translação', 'Mudanças na atividade solar ao longo do ano'], answer: 2 },
    { q: 'O solstício de verão no Hemisfério Sul ocorre em qual período?', options: ['Entre 21 e 22 de dezembro', 'Entre 20 e 21 de março', 'Entre 21 e 22 de junho', 'Entre 22 e 23 de setembro'], answer: 0 },
    { q: 'As chamadas “ilhas de calor” urbanas são:', options: ['Ilhas oceânicas de clima quente', 'Regiões desérticas dentro de cidades', 'Zonas de congelamento em grandes metrópoles', 'Áreas das cidades com temperaturas mais altas que o entorno'], answer: 3 },
    { q: 'O Complexo Industrial e Portuário do Pecém localiza-se em qual estado?', options: ['Rio Grande do Norte', 'Ceará', 'Piauí', 'Pernambuco'], answer: 1 }
  ],
 
  historia: [
    { q: 'Os cercamentos (enclosures) na Inglaterra contribuíram para a Revolução Industrial porque:', options: ['Aumentaram os impostos sobre a produção têxtil', 'Expulsaram camponeses das terras comunais, formando mão de obra para as cidades', 'Proibiram a importação de tecidos indianos', 'Distribuíram terras aos operários urbanos'], answer: 1 },
    { q: 'Qual foi uma importante consequência política da Guerra do Paraguai (1864–1870) para o Império brasileiro?', options: ['A anexação do território paraguaio', 'A ampliação do poder dos barões do café', 'A abolição imediata da escravidão', 'O fortalecimento do Exército como ator político, alimentando ideias republicanas'], answer: 3 },
    { q: 'A Constituição de 1937, que instituiu o Estado Novo, foi:', options: ['Elaborada por uma Assembleia Constituinte eleita', 'Marcada pela restauração da autonomia dos estados', 'Outorgada por Vargas, ampliando os poderes do Executivo e fechando o Congresso', 'A primeira a conceder o voto às mulheres'], answer: 2 },
    { q: 'Qual ato institucional, de dezembro de 1968, autorizou o presidente a fechar o Congresso e suspendeu o habeas corpus para crimes políticos?', options: ['AI-1', 'AI-2', 'AI-5', 'AI-3'], answer: 2 },
    { q: 'Qual prática da Igreja Católica motivou diretamente as 95 teses de Martinho Lutero, em 1517?', options: ['Simonia', 'Venda de indulgências', 'Nepotismo', 'Celibato clerical'], answer: 1 },
    { q: 'Na democracia ateniense do século V a.C., quem era excluído da cidadania?', options: ['Mulheres, estrangeiros (metecos) e escravos', 'Camponeses e artesãos', 'Soldados e comerciantes', 'Proprietários de terras'], answer: 0 },
    { q: 'Durante a União Ibérica (1580–1640), a colonização portuguesa avançou além da linha de Tordesilhas principalmente porque:', options: ['Portugal venceu a Espanha em uma guerra pelo território', 'O papa revogou o Tratado de Tordesilhas', 'Os holandeses cederam terras a Portugal', 'As duas Coroas estavam sob o mesmo monarca, o que esvaziava a linha divisória'], answer: 3 },
    { q: 'Em troca da retirada dos mísseis soviéticos de Cuba, em 1962, os Estados Unidos se comprometeram a:', options: ['Não invadir Cuba e retirar, em acordo reservado, seus mísseis da Turquia', 'Reconhecer o governo de Fidel Castro e suspender o embargo', 'Retirar suas tropas de Berlim Ocidental', 'Aceitar a divisão do Vietnã'], answer: 0 },
    { q: 'Qual grupo, liderado por Robespierre, dominou a Convenção durante a Revolução Francesa e implantou o Terror?', options: ['Girondinos', 'Termidorianos', 'Jacobinos', 'Feuillants'], answer: 2 },
    { q: 'A partilha da África decidida na Conferência de Berlim (1884–1885) teve como consequência duradoura:', options: ['Fronteiras artificiais, que dividiram etnias e reuniram povos rivais', 'O respeito às fronteiras étnicas e linguísticas locais', 'A garantia de independência política dos reinos africanos', 'A criação de um Estado unificado sob tutela britânica'], answer: 0 },
    { q: 'Pela Lei de Terras (1850), as terras devolutas do Império passaram a poder ser adquiridas somente por:', options: ['Posse', 'Doação', 'Concessão de sesmarias', 'Compra'], answer: 3 },
    { q: 'Na República Velha, como ficou conhecido o acordo de Campos Sales em que o governo federal apoiava as oligarquias estaduais em troca do apoio delas ao presidente?', options: ['Política do café com leite', 'Política dos governadores', 'Encilhamento', 'Voto de cabresto'], answer: 1 },
    { q: 'Em agosto de 1939, pouco antes da invasão da Polônia, Alemanha nazista e União Soviética assinaram qual acordo?', options: ['Pacto Molotov-Ribbentrop', 'Acordo de Munique', 'Tratado de Versalhes', 'Acordos de Locarno'], answer: 0 },
    { q: 'Em que ano morreu Zumbi dos Palmares, data que inspirou o Dia Nacional da Consciência Negra (20 de novembro)?', options: ['1595', '1695', '1750', '1888'], answer: 1 },
    { q: 'A Nova Política Econômica (NEP), adotada por Lênin em 1921, caracterizou-se por:', options: ['Coletivização forçada de todas as terras', 'Planos quinquenais de industrialização acelerada', 'Abolição total da moeda e do mercado', 'Liberalização limitada, com pequeno comércio e propriedade privada e setores estratégicos estatais'], answer: 3 },
    { q: 'Em que ano foi assinado o Tratado de Tordesilhas, que dividiu as terras do Novo Mundo entre Portugal e Espanha?', options: ['1500', '1492', '1580', '1494'], answer: 3 },
    { q: 'O episódio conhecido como Boston Tea Party (1773) foi um protesto dos colonos americanos contra:', options: ['A proibição do comércio de escravos', 'O monopólio espanhol do açúcar', 'A taxação britânica do chá sem representação colonial', 'A presença de tropas francesas'], answer: 2 },
    { q: 'Qual revolução resultou na primeira república independente governada por ex-escravizados, em 1804?', options: ['Francesa', 'Americana', 'Haitiana', 'Cubana'], answer: 2 },
    { q: 'O Congresso de Viena (1814–1815) buscou:', options: ['Restaurar as monarquias absolutistas e o equilíbrio de poder europeu após Napoleão', 'Reconhecer a independência das colônias americanas', 'Criar a União Europeia', 'Dividir a África entre potências europeias'], answer: 0 },
    { q: 'Quem liderou os “Camisas Vermelhas” na unificação da Itália?', options: ['Conde de Cavour', 'Giuseppe Garibaldi', 'Giuseppe Mazzini', 'Vítor Emanuel II'], answer: 1 },
    { q: 'A unificação alemã de 1871 foi conduzida pela Prússia sob a liderança de qual chanceler?', options: ['Klemens von Metternich', 'Guilherme II', 'Otto von Bismarck', 'Paul von Hindenburg'], answer: 2 },
    { q: 'Qual presidente norte-americano governou durante a Guerra de Secessão (1861–1865)?', options: ['Abraham Lincoln', 'Ulysses Grant', 'Andrew Jackson', 'Thomas Jefferson'], answer: 0 },
    { q: 'Em que ano foi proclamada a República Popular da China, por Mao Tsé-Tung?', options: ['1949', '1945', '1959', '1937'], answer: 0 },
    { q: 'Qual presidente norte-americano implantou o New Deal para enfrentar a crise de 1929?', options: ['Herbert Hoover', 'Harry Truman', 'Franklin Roosevelt', 'Woodrow Wilson'], answer: 2 },
    { q: 'A Noite dos Cristais (1938) foi:', options: ['Um golpe de Estado contra Hitler', 'Uma onda organizada de violência contra judeus na Alemanha nazista', 'O bombardeio nazista de Londres', 'A invasão alemã da Áustria'], answer: 1 },
    { q: 'Quais líderes participaram da Conferência de Yalta, em 1945?', options: ['Truman, Attlee e Stalin', 'Hitler, Mussolini e Hirohito', 'De Gaulle, Churchill e Truman', 'Roosevelt, Churchill e Stalin'], answer: 3 },
    { q: 'O Plano Marshall (1947) tinha como objetivo principal:', options: ['Financiar a industrialização da URSS', 'Armar os países do Pacto de Varsóvia', 'Reconstruir o Japão', 'Reconstruir a economia da Europa Ocidental e conter o avanço comunista'], answer: 3 },
    { q: 'Em que ano a Índia conquistou a independência do Reino Unido, com a criação do Paquistão?', options: ['1930', '1950', '1962', '1947'], answer: 3 },
    { q: 'A Conferência de Bandung (1955) reuniu países da Ásia e da África em torno de qual proposta?', options: ['Criação da OTAN', 'Não alinhamento às potências da Guerra Fria e combate ao colonialismo', 'Formação de um bloco militar liderado pela URSS', 'Adoção de uma moeda única'], answer: 1 },
    { q: 'Em que ano ocorreu a Revolução Cubana, que levou Fidel Castro ao poder?', options: ['1953', '1959', '1962', '1961'], answer: 1 },
    { q: 'Em que ano a União Soviética foi oficialmente dissolvida?', options: ['1989', '1985', '1991', '1993'], answer: 2 },
    { q: 'Em que ano Nelson Mandela foi eleito presidente da África do Sul, na primeira eleição multirracial do país?', options: ['1990', '1984', '1976', '1994'], answer: 3 },
    { q: 'A Inconfidência Mineira (1789) foi motivada, sobretudo:', options: ['Pela abolição da escravidão', 'Pela chegada da Família Real', 'Pela ameaça da derrama e pelo controle fiscal da metrópole', 'Pela invasão holandesa'], answer: 2 },
    { q: 'Qual movimento baiano de 1798, de caráter popular, defendia igualdade social e o fim da escravidão?', options: ['Inconfidência Mineira', 'Revolta de Beckman', 'Guerra dos Mascates', 'Conjuração Baiana (Revolta dos Alfaiates)'], answer: 3 },
    { q: 'A Abertura dos Portos às nações amigas (1808) beneficiou principalmente qual país?', options: ['Inglaterra', 'França', 'Espanha', 'Estados Unidos'], answer: 0 },
    { q: 'A Cabanagem (1835–1840) foi uma revolta popular ocorrida em qual província?', options: ['Maranhão', 'Grão-Pará', 'Pernambuco', 'Bahia'], answer: 1 },
    { q: 'Qual província brasileira aboliu a escravidão em 1884, quatro anos antes da Lei Áurea?', options: ['Bahia', 'Ceará', 'Pernambuco', 'Maranhão'], answer: 1 },
    { q: 'A Lei do Ventre Livre (1871) determinava que:', options: ['Todos os escravizados com mais de 60 anos seriam libertos', 'Os filhos de mulheres escravizadas nascidos após a lei seriam livres', 'O tráfico atlântico de escravos estava proibido', 'A escravidão seria extinta em 1888'], answer: 1 },
    { q: 'A Guerra de Canudos (1896–1897), no sertão baiano, foi liderada por:', options: ['Antônio Conselheiro', 'Padre Cícero', 'Lampião', 'Zumbi dos Palmares'], answer: 0 },
    { q: 'A Revolta da Vacina (1904), no Rio de Janeiro, teve como estopim:', options: ['O aumento do preço do pão', 'A proclamação da República', 'A abolição da escravidão', 'A obrigatoriedade da vacinação contra a varíola'], answer: 3 },
    { q: 'A Revolta da Chibata (1910), liderada por João Cândido, protestava contra:', options: ['A Lei Áurea', 'Os castigos físicos aplicados aos marinheiros', 'O serviço militar obrigatório', 'A Guerra do Paraguai'], answer: 1 },
    { q: 'A Coluna Prestes (1925–1927) percorreu o interior do Brasil com o objetivo de:', options: ['Apoiar o governo de Getúlio Vargas', 'Defender a monarquia', 'Combater as oligarquias da República Velha', 'Proteger a fronteira do Sul'], answer: 2 },
    { q: 'A Revolução de 1930 depôs qual presidente da República?', options: ['Júlio Prestes', 'Artur Bernardes', 'Washington Luís', 'Epitácio Pessoa'], answer: 2 },
    { q: 'A Revolução Constitucionalista de 1932, em São Paulo, tinha como principal reivindicação:', options: ['A volta da monarquia', 'A independência de São Paulo', 'A reforma agrária', 'A convocação de uma Assembleia Constituinte e o fim do governo provisório'], answer: 3 },
    { q: 'Quem presidiu a Assembleia Constituinte e chamou a Constituição de 1988 de “Constituição Cidadã”?', options: ['Ulysses Guimarães', 'Tancredo Neves', 'José Sarney', 'Leonel Brizola'], answer: 0 },
    { q: 'O Plano Real (1994) foi elaborado, no governo de Itamar Franco, sob a liderança de qual ministro da Fazenda?', options: ['Delfim Netto', 'Dilson Funaro', 'Zélia Cardoso de Mello', 'Fernando Henrique Cardoso'], answer: 3 },
    { q: 'Qual general cartaginês atravessou os Alpes com elefantes durante a Segunda Guerra Púnica?', options: ['Aníbal', 'Amílcar Barca', 'Cipião Africano', 'Pirro'], answer: 0 },
    { q: 'A Primeira Cruzada foi convocada, em 1095, por qual papa?', options: ['Gregório VII', 'Urbano II', 'Inocêncio III', 'Leão X'], answer: 1 },
    { q: 'Qual pensador iluminista defendeu a separação dos poderes em “O Espírito das Leis”?', options: ['Montesquieu', 'Jean-Jacques Rousseau', 'Voltaire', 'John Locke'], answer: 0 },
    { q: 'A frase “O Estado sou eu”, atribuída a Luís XIV, sintetiza qual sistema político?', options: ['Parlamentarismo', 'Feudalismo', 'Absolutismo', 'Liberalismo'], answer: 2 }
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
  if (selected.length >= MASTER_THEME_ORDER.length) return MASTER_BOARD;

  var fill = 0;
  return MASTER_BOARD.map(function (space) {
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
}

/* Temas válidos de uma sala (com fallback para todos os temas). */
function masterRoomThemes(room) {
  return masterCleanThemes((room && room.themes) || []);
}

/* Tabuleiro de uma sala (com fallback para o tabuleiro padrão). */
function masterRoomBoard(room) {
  if (room && room.board && room.board.length) return room.board;
  return MASTER_BOARD;
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
