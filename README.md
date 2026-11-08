# MASTER — jogo de perguntas, apostas e tabuleiro

Versão web do jogo de tabuleiro **Novo Master**, feita em HTML, CSS e JavaScript puro
(sem framework e sem build). Segue a mesma arquitetura modular do jogo
**Detetive** em `C:\xampp\htdocs\detetive`: um arquivo por painel, dados do jogo
separados e Firebase opcional para salas online.

---

## Como abrir

O projeto fica em `C:\xampp\htdocs\master`. Com o Apache do XAMPP ligado:

```
http://localhost/master/
```

Também é possível abrir `index.html` diretamente, mas o modo online e o
armazenamento local funcionam melhor servidos por HTTP (recomendado).

---

## Modos de jogo

### Partida local (funciona sem internet)

1. Clique em **Começar partida local**.
2. Escolha de 2 a 6 jogadores e digite os nomes (a ordem dos campos é a ordem dos turnos).
3. Clique em **Criar mesa** e depois em **Iniciar partida**.
4. O aparelho passa de mão em mão: cada jogador aposta, responde e continua o turno.

Todo o estado fica salvo no `localStorage` do navegador. Fechar a aba e abrir de
novo retoma a mesma mesa.

### Sala online (opcional, usa Firebase)

Cada jogador usa o próprio celular. É preciso configurar um projeto Firebase
gratuito — veja a seção abaixo. Sem essa configuração, o modo local continua
funcionando normalmente e os botões online aparecem desabilitados.

---

## Configurar o Firebase (somente para o modo online)

1. Crie um projeto em <https://console.firebase.google.com>.
2. Ative **Compilação → Firestore Database** (modo de produção).
3. Em **Configurações do projeto → Geral → Seus apps**, crie um app Web e copie as credenciais.
4. Cole as credenciais em `firebase-config.js`, no objeto `firebaseConfig`.
5. No console do Firestore, aba **Regras**, libere a coleção `master_rooms`.

Exemplo de regra para uso casual entre amigos (sem autenticação):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /master_rooms/{roomCode} {
      allow read, write: if true;
    }
  }
}
```

> **Atenção:** essa regra deixa a coleção aberta para qualquer pessoa que tenha a
> URL do projeto. Use apenas em testes/partidas entre amigos. O Master usa a
> coleção `master_rooms`, separada da coleção `rooms` do Detetive, então os dois
> jogos não se misturam.

### Limitações do modo online

- O jogador é identificado pelo navegador (`master_device_id_v1` no `localStorage`). Dois jogadores não podem entrar na mesma sala pelo mesmo navegador/dispositivo — cada um precisa do seu próprio aparelho.
- Se a partida já começou, quem entrar pelo código vira **espectador** (assiste, mas não joga).
- O tema da pergunta final é escolhido pelos outros jogadores; na versão online, o primeiro que escolher define o tema (não há votação formal ainda).

---

## Arquivos

| Arquivo | Função |
|---|---|
| `index.html` | estrutura da página, ordem dos scripts e cache busting |
| `theme.css` | tokens de cor, espaçamento, raios e camadas |
| `panels.css` | moldura comum dos painéis (`.panel-handle`, `.panel-body`, etc.) |
| `style.css` | visual das telas principais (início, preparação, partida, resultado) |
| `data.js` | registro de matérias, helpers e tabuleiro |
| `themes/*.js` | metadados e perguntas, separados por matéria |
| `theme-manifest.js` / `theme-loader.js` | lista e carregamento das matérias antes do jogo |
| `main.js` | lógica do jogo (estado, turnos, apostas, respostas, ranking, salas) |
| `firebase-config.js` | configuração do Firestore (opcional) |
| `board.js` / `board.css` | percurso sinuoso com peões e pote |
| `fichas.js` / `fichas.css` | painel das fichas de aposta e do pote |
| `placar.js` / `placar.css` | classificação ao vivo + registro completo |
| `regras.js` / `regras.css` | regras do Novo Master (transcritas das fotos) |
| `admin.js` / `admin.css` | controles do anfitrião (pular, devolver fichas, reiniciar) |
| `panel-nav.js` / `panel-nav.css` | navegação por abas entre os painéis |

Cada painel é independente: lê o estado por `window.MasterApp` e se redesenha
quando o `main.js` dispara o evento `master:update`.

---

## Editar o conteúdo do jogo

### Temas

Cada arquivo em `themes/` registra os metadados e as perguntas de uma matéria.
As perguntas seguem este formato:

```js
masterRegisterTheme(
  {
    key: 'biologia',
    name: 'Biologia',
    short: 'Bio.',
    icon: '🧬',
    color: '#16a34a',
    color2: '#166534',
    desc: 'Biologia e ciências da vida.'
  },
  [
    { q: 'Enunciado da pergunta?',
      options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
      answer: 1 }
  ]
);
```

Para destacar palavras ou trechos no enunciado ou nas alternativas, envolva o
texto com `[[` e `]]`, por exemplo: `"q": "A palavra [[destacada]]..."`.
O realce é aplicado com segurança tanto na pergunta quanto na tela de resposta.

Para adicionar uma matéria:

1. Crie `themes/biologia.js` usando `masterRegisterTheme` e inclua pelo menos uma pergunta.
2. Adicione `'themes/biologia.js'` ao array `MASTER_THEME_FILES` em `theme-manifest.js`.

O navegador não consegue descobrir sozinho quais arquivos existem em uma hospedagem
estática; o manifesto é o registro que permite ao carregador buscar cada arquivo.
As matérias registradas aparecem automaticamente na seleção da sala, no tabuleiro
e nas perguntas, sem precisar alterar `main.js`.

### Tabuleiro

`MASTER_BOARD` é um percurso de 20 casas em quatro fileiras sinuosas:

- índice `0` = **INÍCIO**
- índices `1` a `18` = casas do percurso
- índice `19` = **FIM**
- cada casa tem `themes: [...]`
- casas com dois temas usam `split: true` (o jogador escolhe um dos temas)
- medalhas marcam o caminho nas casas 5, 10 e 15; os peões ficam sobrepostos às casas.

Para mudar a sequência, basta reordenar/editar as casas. O painel desenha o
percurso sinuoso automaticamente.

### Perguntas

O jogo inclui 50 perguntas de exemplo em cada uma das seis matérias originais. O
sorteio evita repetir perguntas na partida; quando o banco de uma matéria se
esgota, as perguntas dela são recicladas.

---

## Regras implementadas

- 2 a 6 jogadores, 5 fichas de aposta (valores 1 a 5) por jogador.
- Matérias selecionadas pelo anfitrião na sala de espera; pelo menos uma deve ser escolhida.
- O jogador da vez escolhe o tema permitido pela casa (no INÍCIO, qualquer tema).
- É obrigatório apostar uma ficha antes de responder.
- Acertou: avança no tabuleiro o número de casas igual ao valor da ficha.
- Errou: permanece na mesma casa e perde a ficha.
- A ficha apostada vai para o pote no centro; quando todos ficam sem fichas, cada
  jogador recebe outras 5 e o pote é recolhido.
- Casas divididas em dois temas permitem escolher qual responder.
- No FIM, o tema é escolhido pelos outros participantes; acertar a pergunta final
  vence a partida.

---

## Personalização rápida

- **Forçar atualização dos arquivos no navegador:** mude `window.APP_VERSION` no
  topo de `index.html`.
- **Cores gerais:** `theme.css`.
- **Visual de um painel específico:** o CSS do próprio painel.
- **Nome/quantidade de jogadores:** constantes `MIN_PLAYERS` e `MAX_PLAYERS` no
  topo de `main.js`.

---

## Observações sobre as fotos originais

As regras em `regras.js` foram transcritas por OCR das fotos `regras1.jpg` e
`regras2.jpg`. O tabuleiro, as peças e as fichas foram reconstruídos a partir das
fotos `tabuleiro.jpg`, `pecas.jpg` e `fichas.jpeg`, com cores e layout
aproximados — o modelo de IA usado na criação não conseguiu interpretar as
imagens visualmente. As perguntas em `themes/` são um banco inicial, não o
conteúdo exato das 350 cartas físicas.

Se você tiver o texto das cartas (ou uma foto mais nítida), substitua ou amplie
as perguntas nos arquivos correspondentes em `themes/`.
