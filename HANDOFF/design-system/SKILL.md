---
name: futcopa-design
description: Use this skill to generate well-branded interfaces and assets for FutCopa — the gameshow for World Cup lovers (a daily World Cup pyramid game, PT-BR, mobile-first) — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and a UI kit of components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

Start with `colors_and_type.css` (all design tokens — light + dark, type, spacing, radii,
shadows, motion) and `README.md` (CONTENT FUNDAMENTALS, VISUAL FOUNDATIONS, ICONOGRAPHY).
Visual specimens live in `preview/`; the interactive product recreation is in `ui_kits/game/`.

Key rules to honor:
- **Vibe:** festival of nations, 2026 World Cup energy — vibrant, animated, celebratory, but
  highly legible. Flat color by default; the festival gradient is a treat for win/share moments.
- **Type:** Russo One (display, UPPERCASE — self-hosted), Hanken Grotesk (UI/body), Space Mono (scoreboard/countdown).
- **Accessibility (non-negotiable):** light + dark themes, WCAG AA, and **colorblind-safe**
  feedback — every success/error/partial state pairs color with a dedicated **shape + icon**.
- **Language:** Portuguese (BR), informal "você", encouraging tone, sparing functional emoji.
- **Mobile-first**, hit targets ≥ 44px, generous radii, soft shadows + colored glow for live elements.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out of `assets/`
and build static HTML files for the user to view. If working on production code, copy assets and
read the rules here to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask what they want to build or design,
ask a few focused questions, and act as an expert designer who outputs HTML artifacts _or_
production code, depending on the need.
