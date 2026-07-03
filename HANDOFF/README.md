# Handoff: FutCopa — Daily World Cup Pyramid Game

## Overview
**FutCopa** is a daily, shareable web game ("o gameshow para apaixonados por Copa do Mundo").
Each day the player ranks **10 World Cup players/teams** into a **4-level pyramid** (1 slot on
top → 2 → 3 → 4 on the base, 10 total) for a single daily category (e.g. "Mais gols em Copas").
The top slot = highest value; the base = lowest. One category per day, no replay, with a
colorful shareable result. Mobile-first, **Portuguese (BR)**, no account required.

This bundle is the **complete design system + a high-fidelity interactive prototype** of the
flagship game surface.

## Status & Approved Visual Direction
- **Reviewed & verified.** The prototype was run end-to-end (Home → Mode → Board) and renders
  cleanly; the only console output is the expected in-browser Babel dev warning (precompile for
  production). Open `design-system/ui_kits/game/index.html` to see it live.
- **Signed-off direction: the "neon pitch" brand.** Primary is **Pitch Lime** (`--grass-500
  #6fc01a`) with **trophy gold** (`--gold-400`) and the **"stadium at night"** dark theme
  (`data-theme="dark"`: neon green on deep pitch-black). Both light and dark themes ship with a
  persisted toggle — the neon/dark stadium look is the hero/marketing treatment. Festival
  gradient + glows are reserved for celebratory moments (hero, win, share) only.
- **Scope note for the developer:** an earlier "draft game" wireframe exploration existed but is
  **superseded** — the daily pyramid concept documented here is the real product. Ignore any
  draft-game artifacts.

## About the Design Files
The files in `design-system/` are **design references created in HTML/CSS/JSX** — prototypes
showing the intended look, motion, and behavior. They are **not production code to copy
verbatim**. The prototype uses React + Babel loaded from a CDN and in-browser transpilation,
tap-to-place instead of real drag-and-drop, and illustrative (hard-coded) data.

Your task is to **recreate these designs in the target codebase's environment** using its
established patterns and libraries. If there is no codebase yet, choose an appropriate stack
(a React/Next.js or Vue SPA suits this well — it's a small, state-driven single-screen game)
and implement there. **Reuse the design tokens directly**: `design-system/colors_and_type.css`
is framework-agnostic and can drop into any project as-is.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, shadows, and motion are final and
expressed as tokens. Recreate the UI pixel-accurately using the tokens in `colors_and_type.css`
and the component styles in `ui_kits/game/kit.css` as the source of truth. The `.jsx` files show
structure and interaction intent — translate them into your framework's idioms rather than
porting them literally.

---

## Screens / Views

The game is a single-column, mobile-first flow (max content width ~480px, centered on larger
screens). State machine: **Home → Mode select → Board → Result**, with **Stats / Archive /
How-to / Help** as modals over any screen.

### 1. Home
- **Purpose:** Landing / entry. Shows the brand, today's status, and the primary CTA.
- **Layout:** Full-height flex column, centered text. Treated as a **dark-green football pitch**:
  horizontal mowing stripes + faint white pitch markings (center circle, halfway line, penalty
  box). See `.fc-home` in `kit.css`.
  - **Upper field:** a row with a **blue "COPA 2026 · AO VIVO" marquee** (cyan `--cyan-500` fill,
    **3px gold `--gold-400` outline**, pill radius, pulsing red live-dot) on the left, and a
    light/dark theme toggle icon button (translucent white) on the right.
  - **Center:** the **FUTCOPA wordmark** (display font, UPPERCASE) — "FUT" in lime
    `--grass-300`, "COPA" in gold `--gold-400`; sub-headline below in `--cfe9d6`-ish light green.
  - **Below:** a primary CTA **"Jogar agora"** (single line) and a ghost secondary **"Como
    jogar"**; a **countdown** ("Próximo desafio em" + mono timer in lime `--grass-300`).
- **Key copy:** wordmark "FUTCOPA"; sub "O gameshow para apaixonados por Copa do Mundo. Monte o
  pódio de 10 craques todo dia."; CTA "Jogar agora"; "Como jogar"; "Próximo desafio em".

### 2. Mode select
- **Purpose:** Choose difficulty before starting.
- **Layout:** Two stacked option cards — **Fácil** (shows the 📍 "Nível N" hint badges) and
  **Normal** (no hints). Each card: title, one-line description, selected state = lime border +
  `--glow-grass`. Primary CTA **"Começar"** at the bottom.

### 3. Board (core gameplay)
- **Purpose:** Place the 10 players into the pyramid, then submit.
- **Layout (top → bottom):**
  - **Sticky top bar:** wordmark (small) + icon buttons (Stats `bar-chart-3`, Archive
    `calendar`, How-to `help-circle`, theme toggle). Translucent surface + backdrop-blur.
  - **Category badge:** tracked-out label "CATEGORIA DO DIA" + the day's category text.
  - **Pyramid (hero, centered):** 4 rows of slots (1 / 2 / 3 / 4). Empty slot = white fill,
    **dashed** `--slot-border`, `14px` radius, ≥44px. **Active (selected target) slot** = lime
    tint + `--glow-grass`. **Filled slot = gold:** `--gold-100` fill, solid `--gold-400` border,
    dark ink text `#2a1c00`, `--sh-2`. Card drops in with `--ease-bounce` over `--dur-3`.
  - **Player queue (docked near bottom, thumb reach):** horizontally scrollable player chips
    (avatar = flag emoji + initials + name). Tap a player to select, then tap a slot to place;
    tap a filled slot to return its player to the queue.
  - **Submit:** **"Enviar pódio"** primary CTA, enabled only when all 10 slots are filled.

### 4. Result
- **Purpose:** Score + reveal + share.
- **Layout:** Modal/overlay. Shows **score "7/10 · Mandou bem!"** (gold), the player's podium vs
  the **correct podium** (each slot marked with the **shape+icon feedback marks**, not color
  alone), current **streak** ("Sua sequência: 4 dias 🔥"), and **Share** (`share-2`) which
  produces the 🟩🟨🟥 grid + festival-gradient share card. Festival gradient + a confetti burst
  appear ONLY here (the one celebratory moment).

### Modals: Stats, Archive, How-to, Help
- **Stats:** games played, win %, streak, a distribution. **Archive:** past days (calendar).
  **How-to:** rules with the pyramid diagram. **Help (Dica):** a confirm sheet ("Usar uma dica?
  Isto revela o nível certo de 1 jogador.") then highlights one player's correct level.
- All modals: translucent dark scrim, sheet with `--r-card` top corners, `--sh-4`, `--dur-4`.

---

## Interactions & Behavior
- **Tap-to-place** (prototype): select a queue player → tap a slot. Production may implement
  real drag-and-drop, but keep tap-to-place as an accessible fallback. Tapping a filled slot
  returns the player to the queue.
- **Submit gating:** "Enviar pódio" disabled until all 10 slots filled.
- **Theme toggle:** flips `data-theme="dark"` on the root; all tokens swap to the "stadium at
  night" set. Persist the choice (e.g. localStorage).
- **Hover** = slight lift + brightness up. **Press** = scale to ~0.97 + darker shade. **Focus** =
  2px `--ring` outline with offset.
- **Motion timings:** taps/hovers `--dur-1` (120ms), toggles/fades `--dur-2` (200ms), card drop
  `--dur-3` (320ms, `--ease-bounce`), modal/result reveal `--dur-4` (500ms). Honor
  `prefers-reduced-motion` (the system already disables animations under it).
- **Live dot** on the home marquee pulses (1.2s loop) — the only persistent decorative motion
  besides the countdown tick.

## State Management
- `screen`: `"home" | "mode" | "board" | "result"`.
- `mode`: `"facil" | "normal"`.
- `theme`: `"light" | "dark"` (persist).
- `selectedPlayerId`: currently picked queue player (or null).
- `slots`: array of 10 (level/position → playerId | null).
- `queue`: remaining unplaced players.
- `result`: `{ score, correctOrder, sharedGrid }` computed on submit.
- `modal`: `null | "stats" | "archive" | "howto" | "help"`.
- Daily puzzle is fetched once per day; "no replay" → lock the board after submit for that date.

## Design Tokens
The full, authoritative token set is in **`design-system/colors_and_type.css`** (light + dark).
Highlights:

**Brand color**
- Primary (Pitch Lime) `--grass-500: #6fc01a` (hover `#57a010`, press `#437d10`); on-primary ink
  `#18280b`. Full ramp `--grass-50…900`.
- Gold `--gold-400: #ffc21e` (secondary/achievement). Magenta `--magenta-500: #ff2e63`,
  Cyan `--cyan-500: #15b8e8` (accents).
- **Neutrals are "green ink"** (pitch-green-tinted ramp): `--ink-950 #04140c` → `--ink-50 #f4faf6`.
  Text: `--fg #07210f`, `--fg-2 #265a37`, `--fg-3 #4a8b60`.

**Semantic (colorblind-safe — always color + shape + icon)**
- success = circle + check `#4aa70f` · error = diamond + ✕ `#ff3b47` · warning/partial = triangle
  + ! `#ff9e1b` · info = square + i `#15b8e8`. Each has `-bg` and `-ink` variants.

**Gradients** (celebratory only): `--grad-festival` (green→cyan→magenta→gold), `--grad-pitch`,
`--grad-night`.

**Type** — Display **Russo One** (self-hosted, UPPERCASE, wordmark/hero/big numbers); UI/body
**Hanken Grotesk** (500–800); scoreboard mono **Space Mono** (countdown, tabular figures).
Fluid `clamp()` scale: `--t-display-xl/-display/-h1/-h2/-h3/-body-lg/-body/-body-sm/-label/
-caption/-mono`. Use `.fc-tnum` / `font-variant-numeric: tabular-nums` wherever numbers compare.

**Spacing** — 4pt base: `--sp-1 4` … `--sp-16 64`.
**Radii** — `--r-xs 6`, `--r-sm 10`, `--r-md 14`, `--r-lg 18`, `--r-xl 24`, `--r-card 20`,
`--r-pill 999`.
**Elevation** — `--sh-1…4` soft shadows; colored glows `--glow-grass/-magenta/-gold` for "live"
elements (active slot, primary CTA, win card) instead of bigger gray shadows.
**Motion** — durations `--dur-1…4`; easings `--ease-standard`, `--ease-out`, `--ease-bounce`.
**Breakpoints** (mobile-first) — sm 390 · md 600 · lg 900 · xl 1200.

## Assets
In `design-system/assets/` and `design-system/fonts/`:
- `assets/logo-mark.svg` — wordmark / ball-dot mark.
- `assets/favicon.svg` — favicon.
- `assets/pattern-confetti.svg` — confetti/pennant pattern for hero & share surfaces (low opacity).
- `fonts/RussoOne-Regular.ttf` — **self-hosted display font** (wired via `@font-face` in
  `colors_and_type.css`). Hanken Grotesk + Space Mono load from Google Fonts CDN.
- **Icons:** [Lucide](https://lucide.dev) (CDN) — clean 2px-stroke outline set. Core glyphs:
  `help-circle, bar-chart-3, calendar, share-2, x, check, flame, lightbulb, chevron-left/right,
  flag, info, triangle-alert`. Use your codebase's Lucide package (e.g. `lucide-react`).
- **Flags:** Unicode flag emoji (🇧🇷 🇦🇷 🇫🇷…) on avatars — zero-asset, portable.
- **Functional emoji** (UI, not decoration): 📍 (Nível N hint), 🏆 (result), 🔥 (streak),
  🟩🟨🟥 (shareable grid).

## Files (in this bundle)
```
design_handoff_futcopa/
├── README.md                      ← this file (implementable on its own)
└── design-system/
    ├── colors_and_type.css        ← AUTHORITATIVE design tokens (drop in as-is)
    ├── DESIGN_SYSTEM_README.md     ← full brand: content + visual foundations, iconography
    ├── SKILL.md                    ← agent-skill manifest (optional, for Claude Code)
    ├── assets/                     ← logo, favicon, confetti pattern (SVG)
    ├── fonts/                      ← RussoOne-Regular.ttf (self-hosted)
    └── ui_kits/game/
        ├── index.html             ← interactive prototype entry (open in a browser)
        ├── kit.css                ← component styles (SOURCE OF TRUTH for component visuals)
        ├── data.js                ← illustrative puzzle data shape
        ├── Icons.jsx              ← Lucide glyph wrapper
        ├── Components.jsx         ← TopBar, CategoryBadge, Pyramid, Slot, PlayerQueue, Avatar,
        │                            ModeSelect, FeedbackMark, Toast, Countdown
        ├── Modals.jsx             ← HowTo, Help, Result, Stats, Archive
        ├── App.jsx                ← state machine + Home screen wiring
        └── README.md              ← kit run notes & fidelity caveats
```

**Start here:** open `design-system/ui_kits/game/index.html` in a browser to see the live
prototype, then read `colors_and_type.css` (tokens) and `ui_kits/game/kit.css` (component
visuals). `DESIGN_SYSTEM_README.md` has the full content/voice and visual-foundations rules.

### Not implemented (intentionally — build these for production)
Real persistence/back-end puzzles, real drag-and-drop, the "puzzle indisponível" / 404 empty
states, and account-free daily-lock logic. Data in `data.js` is illustrative only.
