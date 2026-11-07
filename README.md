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
| `data.js` | **dados editáveis**: temas, tabuleiro e banco de perguntas |
| `main.js` | lógica do jogo (estado, turnos, apostas, respostas, ranking, salas) |
| `firebase-config.js` | configuração do Firestore (opcional) |
| `board.js` / `board.css` | painel do tabuleiro 6×6 com peões e pote |
| `fichas.js` / `fichas.css` | painel das fichas de aposta e do pote |
| `placar.js` / `placar.css` | classificação ao vivo + registro completo |
| `regras.js` / `regras.css` | regras do Novo Master (transcritas das fotos) |
| `admin.js` / `admin.css` | controles do anfitrião (pular, devolver fichas, reiniciar) |
| `panel-nav.js` / `panel-nav.css` | navegação por abas entre os painéis |

Cada painel é independente: lê o estado por `window.MasterApp` e se redesenha
quando o `main.js` dispara o evento `master:update`.

---

## Editar o conteúdo do jogo (`data.js`)

### Temas

`MASTER_THEMES` define nome, ícone, cores e descrição dos 6 temas oficiais.
`MASTER_THEME_ORDER` define a ordem exibida nos menus e sorteios.

### Tabuleiro

`MASTER_BOARD` é uma lista de 36 casas em serpentina 6×6:

- índice `0` = **INÍCIO**
- índice `35` = **FIM**
- cada casa tem `themes: [...]`
- casas com dois temas usam `split: true` (o jogador escolhe um dos temas)

Para mudar o caminho, basta reordenar/editar as casas. O painel do tabuleiro
desenha a serpentina automaticamente (linha 1 da esquerda para a direita, linha 2
da direita para a esquerda, e assim por diante).

### Perguntas

`MASTER_QUESTIONS` tem 12 perguntas por tema (72 no total) como **banco inicial de
exemplo**. O baralho físico tem 350 cartas com 6 temas cada; substitua/amplie as
perguntas reais neste formato:

```js
{ q: 'Enunciado da pergunta?',
  options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
  answer: 1 }   // índice da correta: 0 = A, 1 = B, 2 = C, 3 = D
```

O sorteio evita repetir a mesma pergunta na partida; quando o tema se esgota, as
perguntas daquele tema são recicladas.

---

## Regras implementadas

- 2 a 6 jogadores, 5 fichas de aposta (valores 1 a 5) por jogador.
- 6 temas: Artes, Ciências, Entretenimento, Esportes, Geografia e História.
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
imagens visualmente. As perguntas de `data.js` são um banco inicial, não o
conteúdo exato das 350 cartas físicas.

Se você tiver o texto das cartas (ou uma foto mais nítida), basta substituir o
conteúdo de `MASTER_QUESTIONS` em `data.js`.
