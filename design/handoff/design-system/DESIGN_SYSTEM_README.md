# FutCopa — Design System

> **Positioning:** *FutCopa — o gameshow para apaixonados por Copa do Mundo.*
> The brand wears a TV-gameshow energy: bright broadcast graphics, a host's warmth, the
> thrill of "go!". That spirit drives every color, animation and word here.

**FutCopa** is a daily, share-able web game in the spirit of Wordle, built around the
energy of the **2026 World Cup**. Each day players rank **10 World Cup players / national
teams** into a **4-level pyramid** (1 slot on top, then 2, 3, 4 on the base — 10 total).
The top = highest value in the day's category (e.g. goals scored); the base = lowest.
One fresh category per day, no replay, a colorful shareable result.

- **Audience:** football fans, casual & daily players.
- **Platform:** web, **mobile-first** (the pyramid must work at ~360px wide).
- **Language:** **Portuguese (BR)**. No account required.
- **Tone:** modern, fun, fast, legible.
- **Brand mood:** a *gameshow / festival of nations* — vibrant, animated, loud, celebratory.
  Think confetti, flags, stage lights, a host's energy, trophy gold and electric pitch green.

This is a **from-scratch brand**: there was no prior codebase, Figma, or visual identity to
recreate. Everything here was designed against the brief below.

---

## Sources

The only input was a written brief (in Portuguese):

- **`design/CLAUDE_DESIGN_BRIEF.md`** — the product/design brief. Describes the game
  mechanics (pyramid 1-2-3-4, daily category, shareable result), the required screens and
  components, and the non-negotiables: **light + dark themes**, **WCAG AA contrast**, and
  **colorblind-safe** success/error feedback (never rely on green/red alone — always pair
  with an **icon + shape**).
- Brief referenced `https://futbol11.netlify.app/futbol11-pyramid` *as a layout reference
  only* — its visual identity was **not** copied. FutCopa's look is original.

> The brief calls the game "WorldCup Pyramid"; the user named the company/site **FutCopa**.
> We use **FutCopa** as the brand and "a Pirâmide" / "o desafio do dia" for the game itself.

---

## What's in here (index)

| File / folder | What it is |
|---|---|
| `README.md` | This file — context, content + visual foundations, iconography, index. |
| `colors_and_type.css` | All design tokens: color (light+dark), type scale, spacing, radii, shadows, motion. Import this first. |
| `SKILL.md` | Agent-Skill manifest so this system can be used from Claude Code. |
| `assets/` | Logo / wordmark, favicon, brand pattern, share-card background. |
| `preview/` | Small HTML specimen cards that populate the Design System tab. |
| `ui_kits/game/` | The flagship UI kit: the daily pyramid game (mobile-first), interactive. |

UI kits:
- **`ui_kits/game/`** — `index.html` (interactive click-thru) + JSX components
  (Pyramid, PlayerCard, PlayerQueue, CategoryBadge, ModeSelect, modals, toasts…).

No slide template was provided, so no `slides/` deck was produced.

---

## CONTENT FUNDAMENTALS

All copy is **Portuguese (BR)**, written to feel like a friendly stadium host — energetic
but never childish.

- **Voice:** second person, informal **"você"** (and implicit imperative: *"Arraste",
  *"Toque", "Compartilhe"*). Warm and direct, like a friend explaining a game.
- **Casing:** Sentence case for body and buttons (*"Jogar agora", "Como jogar"*).
  **UPPERCASE** reserved for the wordmark, the big display numbers/score, and small
  tracked-out labels (*"CATEGORIA DO DIA", "NÍVEL 1"*). Never SHOUT full sentences.
- **Length:** short. Headlines ≤ 5 words. Helper text one line. Buttons 1–3 words.
- **Numbers lead.** Scores, streaks, ranks and the countdown are first-class — shown big,
  in tabular figures, often in the scoreboard mono.
- **Tone words:** *desafio, hoje, pódio, craque, seleção, ranking, sequência (streak),
  pódio do dia.* Football vocabulary, lightly used — flavor, not jargon.
- **Encouraging, never punishing.** A wrong answer is *"Quase!"* / *"Faltou pouco"*, a win
  is *"Mandou bem!"* / *"Craque!"*. Results celebrate effort: *"Você acertou 7 de 10"*.
- **Emoji:** used **deliberately and sparingly** as functional UI, not decoration —
  flag emoji on player avatars, 📍 for the "Nível N" hint badge in Easy mode, 🏆 in the
  result, and the colored square grid (🟩🟨🟥) in the shareable result. Not littered through
  body copy.
- **Example strings**
  - Category: *"CATEGORIA DO DIA · Mais gols em Copas"*
  - Empty/queue: *"Próximo: arraste para a pirâmide"*
  - Help confirm: *"Usar uma dica? Isto revela o nível certo de 1 jogador."*
  - Result: *"7/10 · Mandou bem!"* · *"Sua sequência: 4 dias 🔥"*
  - Toast: *"Copiado!"* · Countdown label: *"Próximo desafio em"*
  - Empty state: *"Puzzle indisponível — volte amanhã."*

---

## VISUAL FOUNDATIONS

The system is built to feel like a **modern football broadcast graphic** — bold, colorful,
kinetic — while staying highly legible and accessible.

### Color
- A **multicolor "festival" palette**: **electric pitch green** (primary), **trophy gold**
  (secondary), **party magenta** and **sky cyan** (accents). Used confidently and in
  saturated form — this brand is *not* muted.
- **Green** carries the brand and primary actions. **Gold** marks achievement/score.
  **Magenta** and **cyan** add energy to badges, streaks, and the festival gradient.
- **Festival gradient** (`--grad-festival`, green→cyan→magenta→gold) appears only at
  celebratory moments: the hero wordmark, the win/result card, the share image. Everywhere
  else color is flat and purposeful — gradients are a treat, not a default.
- **Neutrals** are cool with a hint of pitch in the darks. Light theme is bright and clean;
  **dark theme is "stadium at night"** — near-black pitch greens with neon accents that pop.
- **Contrast:** all text/interactive pairs target **WCAG AA**. On gold, text is near-black.

### Semantics & accessibility (non-negotiable)
- Every feedback state pairs a color with a **dedicated icon AND shape**, so it reads
  without color vision: **success = circle + check**, **error = diamond + ✕**,
  **partial/hint = triangle + !**, **info = square + i**. The pyramid's correct/incorrect
  slots use these shapes, not just green/red fills.

### Typography
- **Display:** **Russo One** (self-hosted brand font) — bold, geometric, broadcast/gameshow
  energy. Used UPPERCASE for the wordmark, hero, big scores and rank numbers. Never for body.
- **UI / Body:** **Hanken Grotesk** — friendly, rounded-feeling grotesque, very legible at
  small sizes. Weights 500–800. Carries everything functional.
- **Scoreboard mono:** **Space Mono** — the countdown timer and code-like figures, for a
  stadium-clock feel. Tabular numerals throughout for anything that gets compared.
- Type scale is **fluid (clamp)** and mobile-first.

### Shape, depth & texture
- **Corner radii** are generous and friendly: cards `20px`, buttons/pills fully rounded
  (`--r-pill`), inputs/slots `14px`. Nothing sharp.
- **Cards:** solid `--surface`, hairline `--border`, soft shadow (`--sh-2`/`--sh-3`). No
  heavy outlines. The "live" elements (active slot, primary CTA, win card) get a **colored
  glow** (`--glow-grass` / `--glow-magenta` / `--glow-gold`) instead of a bigger gray shadow.
- **Backgrounds:** mostly flat surface color. A subtle **confetti / pennant pattern** and a
  faint pitch-stripe texture are available for hero and share surfaces — used at low opacity,
  never busy behind text.
- **Transparency & blur:** sticky top bar and modal scrims use a translucent surface with
  backdrop-blur; otherwise surfaces are opaque. Modals dim the page with a dark scrim.

### Motion
- Snappy and physical. Hover/taps `--dur-1` (120ms), toggles/fades `--dur-2`, the **card
  drop into a slot** uses `--ease-bounce` over `--dur-3` for a satisfying settle, modals and
  the result reveal use `--dur-4`.
- **Win moment** is the one place we go big: confetti burst + the festival gradient sweep +
  staggered reveal of the colored mini-pyramid. Everything else stays calm.
- **Hover** = slight lift + brightness up. **Press** = scale down to ~0.97 + darker shade.
  Focus = 2px `--ring` outline with offset. Honors `prefers-reduced-motion`.
- Decorative loops are avoided on content; the only persistent motion is the countdown tick.

### Layout
- **Mobile-first**, single column, max content width ~480px centered on larger screens with
  the festival pattern in the margins. Sticky top bar (wordmark + stats/help icons), the
  pyramid centered as the hero, the player queue docked near the bottom within thumb reach.
- Hit targets ≥ **44px**. Comfortable spacing on the 4pt scale; the board breathes.

---

## ICONOGRAPHY

- **UI icons:** **[Lucide](https://lucide.dev)** (linked from CDN). Chosen for its clean,
  rounded `2px`-stroke outline style that matches FutCopa's friendly geometry. There was no
  pre-existing icon set in the brief, so Lucide is the system's icon set (not a substitution).
  Core glyphs: `help-circle`, `bar-chart-3`, `calendar`, `share-2`, `x`, `check`, `flame`
  (streak), `lightbulb` (hint/HELP), `chevron-left/right`, `flag`, `info`, `triangle-alert`.
- **Feedback marks are custom shape+icon pairs**, not generic icons: success circle-check,
  error diamond-✕, partial triangle-!, info square-i. These are simple enough to render as a
  shaped container + a Lucide glyph; see `preview/` and the game kit.
- **Flags:** player/team avatars are **flag + initials**. Flags use **Unicode flag emoji**
  (e.g. 🇧🇷 🇦🇷 🇫🇷) for zero-asset portability and instant recognition — appropriate for a
  football game. (Photos may replace initials later, per the brief.)
- **Functional emoji:** 📍 (Nível N hint), 🏆 (result), 🔥 (streak), and the 🟩🟨🟥 grid in the
  shareable result. These are part of the product vocabulary — used as UI, never as decoration.
- **No hand-drawn illustration.** The brand expresses itself through color, type and the
  pyramid form, not spot illustrations. The wordmark is typographic (Russo One) with a small
  ball/dot motif.
