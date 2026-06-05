# Brief — Design System no Claude Design

Guia passo a passo para você criar o design system do **WorldCup Pyramid** no
**Claude Design** (https://claude.ai/code → ferramenta de Design, ou claude.ai/design).
A saída (handoff bundle) volta para o Claude Code, que faz a integração (tokens, Tailwind,
Storybook) — a Parte B.

> **Pré-requisito:** o Claude Design está em *research preview* — requer plano
> **Pro, Max, Team ou Enterprise**. Se você não tiver acesso, me avise: a Parte B pode
> partir de tokens fornecidos manualmente, usando este brief como especificação.

---

## Passo 1 — Criar o projeto e colar o brief

Crie um novo projeto no Claude Design e **cole o texto abaixo** como prompt inicial:

> Crie o **design system** de um jogo web diário estilo Wordle chamado **WorldCup Pyramid**.
>
> **Mecânica:** o jogador ordena **10 jogadores/seleções** de Copa do Mundo numa **pirâmide
> de 4 níveis** (1 slot no topo, depois 2, 3 e 4 na base — total 10). O topo = maior valor da
> categoria (ex.: gols), a base = menor. Uma categoria nova por dia, sem replay, resultado
> compartilhável.
>
> **Público:** fãs de futebol, **mobile-first**, interface em **português (BR)**, **sem
> necessidade de conta**. **Tom:** moderno, divertido, legível, rápido.
>
> Quero **2 a 3 direções visuais distintas** para eu escolher.
>
> **Requisitos não-negociáveis:**
> - **Temas claro e escuro** (paletas completas para os dois).
> - Contraste **WCAG AA** em texto e elementos interativos.
> - Cores de feedback **acerto/erro seguras para daltônicos**: não depender só de
>   verde/vermelho — usar também **ícone e/ou forma**.
> - Layout **mobile-first** (a pirâmide precisa funcionar bem em ~360px de largura).

## Passo 2 — (Opcional) Inspiração

Use a ferramenta **web capture** do Claude Design apontando para
`https://futbol11.netlify.app/futbol11-pyramid` apenas como **referência de layout/jogo** —
não copie a identidade visual.

## Passo 3 — Escolher a direção

Entre as 2-3 direções propostas, escolha **uma**. (Se quiser, me diga qual escolheu e por quê.)

## Passo 4 — Pedir as Foundations (tokens)

Na direção escolhida, peça explicitamente os **tokens** (em **claro e escuro**):

- **Cores:** primária, superfícies/fundos, texto (primário/secundário), bordas, e
  **semânticas**: `success` (acerto), `error` (erro), `warning` — cada uma com um **par**
  de ícone/forma associado para acessibilidade.
- **Tipografia:** família(s) + escala (display, título, corpo, legenda) com pesos.
- **Espaçamento:** escala (ex.: 4/8/12/16/24/32...).
- **Raios** (border-radius) e **sombras** (elevação).
- **Breakpoints** mobile-first.
- **Motion:** durações e easings padrão (ex.: hover, drop, flash do HELP).

> Peça para o Claude Design **listar os valores dos tokens** (não só mostrar visualmente),
> para facilitar a tradução em CSS variables/Tailwind.

## Passo 5 — Pedir as telas/componentes

Peça cada item abaixo em **claro + escuro** e em **mobile + desktop**:

**Tabuleiro e jogo**
- **Pyramid** (pirâmide 1-2-3-4) nos estados: vazio · slot **ativo/drop-target** ·
  preenchido · **correto** · **incorreto** · **flash do HELP**.
- **PlayerCard**: avatar = **bandeira do país + iniciais** (as fotos virão depois), nome,
  país e o badge **"📍 Nível N"** (usado no Modo Fácil).
- **PlayerQueue** (fila com o próximo jogador "ativo").
- **CategoryBadge** (categoria + descrição do dia).
- **ModeSelect** (escolha Fácil/Normal antes de jogar).

**Modais e estados**
- **HowToPlay** (overlay de onboarding "Como jogar").
- **HELP** (modal de confirmação "usar dica?").
- **ResultModal** (score X/10 + mini-pirâmide colorida + pirâmide correta + botão compartilhar).
- **StatsModal** (streak atual/recorde + **histograma de distribuição** de acertos).
- **Archive** (calendário de dias jogáveis; marca jogados/score).
- **Toast** (ex.: "Copiado!"), **Countdown** (tempo até o próximo puzzle).
- Estados vazios: **"Puzzle indisponível — volte amanhã"** e **404**.
- **Reportar erro** (link/botão para reportar dado incorreto).

## Passo 6 — Iterar

Use **comentários inline** e os **adjustment knobs** (cor/espaçamento/layout) para refinar.
Ao final, peça "aplicar essas mudanças em todo o design" para manter consistência.

## Passo 7 — Exportar o handoff

1. Gere o **handoff bundle** (botão de handoff/"passar para o Claude Code").
2. **Traga ao Claude Code** numa única instrução **ou** salve os arquivos exportados em
   `design/handoff/` neste repositório.
3. Me avise que o handoff chegou — eu inicio a **Parte B** (tokens → Tailwind/`globals.css`,
   `ThemeProvider`, primitivos em `components/ui/*` + Storybook, `DESIGN_SYSTEM.md`).

---

## O que me enviar de volta (resumo)

- Qual **direção visual** você escolheu.
- O **handoff bundle** (em `design/handoff/`) **ou** os valores dos **tokens** (claro+escuro)
  se o handoff não exportar tudo.
- Qualquer preferência forte (ex.: fonte específica, cor primária) que eu deva respeitar.
