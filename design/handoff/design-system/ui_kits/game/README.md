# FutCopa — Game UI Kit

A high-fidelity, interactive recreation of the **FutCopa** daily game (mobile-first, PT-BR).
This is the flagship product surface. It cuts corners on real data/persistence but the UI and
interactions are faithful to the design system.

## Run it
Open `index.html`. It loads React + Babel from CDN, `../../colors_and_type.css` (tokens),
`kit.css` (component styles), and the JSX below. Display font **Russo One** is self-hosted
from `fonts/`; Hanken Grotesk and Space Mono come from Google Fonts.

## Flow (click-thru)
**Home** → *Jogar agora* → **Mode select** (Fácil / Normal) → *Começar* → **Board**:
tap a player in the bottom queue, then tap a pyramid slot to place them (tap a filled slot to
return it). Fill all 10 → **Enviar pódio** → **Result** (score, your podium, correct podium,
share). Top-bar icons open **Stats**, **Archive**, **How-to**, and a **light/dark** toggle.
*Dica* opens the HELP confirm, then highlights one player's correct level.

## Files
| File | What |
|---|---|
| `index.html` | Entry point — loads everything, mounts `<App>`. |
| `data.js` | Illustrative puzzle data (`window.FC_DATA`): players, category, stats, archive. |
| `Icons.jsx` | `<Icon name>` — Lucide glyph paths, 2px stroke. |
| `Components.jsx` | TopBar, CategoryBadge, Pyramid, Slot, PlayerQueue, Avatar, ModeSelect, FeedbackMark, Toast, Countdown. |
| `Modals.jsx` | Sheet, HowToPlay, HelpModal, ResultModal, StatsModal, ArchiveModal. |
| `App.jsx` | State machine + Home screen + the screens/modals wiring. |
| `kit.css` | All component styles, mobile-first, built on the tokens. |

## Notes / fidelity
- **Accessibility:** correct/incorrect slots use **shape + icon** (circle-check / diamond-✕),
  not color alone. Hit targets ≥ 44px. Honors `prefers-reduced-motion`.
- **Flags** are Unicode emoji; they render as real flags on devices (some screenshot tools
  show the two-letter fallback).
- **Not implemented (intentionally):** real persistence, drag-and-drop (uses tap-to-place),
  back-end puzzles, the 404 / "puzzle indisponível" empty states. Data is illustrative.
- Components export to `window` (each JSX file ends with `Object.assign(window, {...})`) so they
  share scope across the separate Babel scripts.
