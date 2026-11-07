/* ============================================================================
   MASTER — regras.js
   Painel de regras do Novo Master. O texto abaixo foi transcrito das regras
   oficiais (fotos regras1.jpg / regras2.jpg) e inclui uma seção final
   explicando as adaptações desta versão web.

   Uso:
     <div id="regras-painel"></div>
     <script src="regras.js"></script>
     <script>mountRegras('#regras-painel');</script>
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

  function themeCards() {
    var order = window.MASTER_THEME_ORDER || [];
    return order.map(function (k) {
      var t = window.masterTheme ? window.masterTheme(k) : null;
      if (!t) return '';
      return '<div class="regra-tema" style="--rtc:' + t.color + '">' +
        '<span class="regra-tema-icon">' + t.icon + '</span>' +
        '<div><div class="regra-tema-name">' + esc(t.name) + '</div>' +
        '<div class="regra-tema-desc">' + esc(t.desc) + '</div></div>' +
      '</div>';
    }).join('');
  }

  function render() {
    if (!host) return;

    host.innerHTML =
      '<div class="panel-handle">' +
        '<h3>Regras — Novo Master</h3>' +
        '<button type="button" class="panel-toggle" onclick="closePanelNav()">Minimizar</button>' +
      '</div>' +
      '<div class="panel-body regras-body">' +

        '<div class="regras-hero">' +
          '<h4>Objetivo</h4>' +
          '<p>Ser o primeiro a chegar com o seu peão à última casa do tabuleiro e responder corretamente à última pergunta.</p>' +
        '</div>' +

        '<div class="regra-bloco">' +
          '<h5>Componentes</h5>' +
          '<ul>' +
            '<li>1 tabuleiro</li>' +
            '<li>1 baralho de 350 cartas</li>' +
            '<li>30 fichas de apostas (5 de cada cor)</li>' +
            '<li>6 peões (1 de cada cor)</li>' +
          '</ul>' +
          '<p style="margin-top:8px;">Idade recomendada: <b>14 anos ou mais</b> · Participantes: <b>2 a 6 jogadores</b>.</p>' +
        '</div>' +

        '<div class="regra-bloco">' +
          '<h5>As cartas</h5>' +
          '<p>Cada carta do jogo tem <b>6 temas</b>, com perguntas e respostas de <b>4 alternativas</b> para cada tema. Apenas uma alternativa está correta.</p>' +
        '</div>' +

        '<div class="regra-bloco">' +
          '<h5>Os temas</h5>' +
          '<div class="regra-temas">' + themeCards() + '</div>' +
        '</div>' +

        '<div class="regra-bloco">' +
          '<h5>Preparação</h5>' +
          '<ol class="regra-numerada">' +
            '<li>Entregue 1 peão e as 5 fichas de apostas da mesma cor para cada jogador.</li>' +
            '<li>Coloque todos os peões na casa <b>INÍCIO</b>.</li>' +
            '<li>Embaralhe o baralho e deixe-o ao alcance de todos.</li>' +
            '<li>O jogador mais novo começa respondendo; a partida segue em sentido horário.</li>' +
          '</ol>' +
        '</div>' +

        '<div class="regra-bloco">' +
          '<h5>Como jogar</h5>' +
          '<ol class="regra-numerada">' +
            '<li>O jogador da vez escolhe o <b>tema</b> permitido pela casa em que está. Na casa INÍCIO é possível escolher qualquer tema.</li>' +
            '<li>Outro jogador lê em voz alta a pergunta e as alternativas daquele tema.</li>' +
            '<li>As fichas são numeradas de <b>1 a 5</b>: o jogador aposta mais ou menos pontos conforme sua confiança na resposta.</li>' +
            '<li>O jogador <b>não pode responder antes de colocar a ficha no centro do tabuleiro</b>.</li>' +
            '<li>Se acertar, avança o peão no tabuleiro exatamente o número de casas igual ao valor da ficha apostada.</li>' +
            '<li>A ficha apostada fica acumulada no centro (pote) até ser recolhida.</li>' +
          '</ol>' +
        '</div>' +

        '<div class="regra-aviso">' +
          '<b>Atenção:</b> se o jogador responder antes de apostar, é obrigado a descartar uma das fichas <em>sem saber qual</em>. ' +
          'Além de perder os pontos, perde a chance de andar no tabuleiro naquela rodada.' +
        '</div>' +

        '<div class="regra-bloco">' +
          '<h5>Resposta errada</h5>' +
          '<p>Quando o jogador erra, ele <b>permanece na mesma casa</b> e perde a ficha apostada naquela rodada. ' +
          'Na rodada seguinte responde a outra pergunta, aposta uma nova ficha e, se acertar, anda o número de pontos indicado.</p>' +
        '</div>' +

        '<div class="regra-bloco">' +
          '<h5>Tabuleiro</h5>' +
          '<ul>' +
            '<li>As casas trazem o tema da pergunta que será feita ao jogador da vez.</li>' +
            '<li>Nas <b>casas divididas em dois temas</b>, o jogador escolhe qual deseja responder.</li>' +
            '<li>Na última casa (<b>FIM</b>), o jogador responde a um tema escolhido <b>de comum acordo pelos outros participantes</b>.</li>' +
            '<li>Vence quem responder corretamente à última pergunta.</li>' +
          '</ul>' +
        '</div>' +

        '<div class="regra-bloco">' +
          '<h5>Fichas: quando acabam</h5>' +
          '<p>À medida que responde, o jogador gasta suas fichas até acabarem — o que costuma ocorrer a cada 5 rodadas. ' +
          'Quando os jogadores não tiverem mais fichas nas mãos, <b>recolhem as fichas do centro do tabuleiro</b> e o jogo continua. ' +
          'Nesta versão web, ao ficar sem fichas o jogador recebe automaticamente outras 5.</p>' +
        '</div>' +

        '<div class="regra-bloco">' +
          '<h5>Nesta versão web</h5>' +
          '<ul>' +
            '<li>O tabuleiro, o sorteio de perguntas, a conferência da resposta e a movimentação são automáticos.</li>' +
            '<li>Há dois modos: <b>partida local</b> (2 a 6 jogadores no mesmo aparelho) e <b>sala online</b> (cada um no seu celular).</li>' +
            '<li>O banco de perguntas em <b>data.js</b> é um conjunto inicial de exemplo; troque pelo conteúdo real das cartas quando quiser.</li>' +
            '<li>A ordem dos turnos é a ordem em que os jogadores aparecem na preparação da mesa.</li>' +
          '</ul>' +
        '</div>' +

        '<div class="regras-footer">' +
          'Novo Master · regras transcritas das fotos do manual · versão web 1.0' +
        '</div>' +
      '</div>';
  }

  window.mountRegras = function (target) {
    if (mounted) return;
    host = typeof target === 'string' ? document.querySelector(target) : target;
    if (!host) return;
    mounted = true;
    render();
  };
})();
