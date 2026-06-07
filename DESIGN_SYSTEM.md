# FutCopa — Design System

**Vibe:** festival of nations · 2026 World Cup energy · vibrant, animated, legible  
**Linguagem:** Português (BR) · informal "você" · emoji funcional e parcimonioso

---

## Tokens

Todos os tokens vivem em `app/globals.css` como CSS variables e são consumidos pelo Tailwind via `tailwind.config.ts`.

### Cores

| Token Tailwind         | CSS Var               | Uso |
|------------------------|-----------------------|-----|
| `bg-primary`           | `--primary`           | Ação principal (verde grama) |
| `bg-gold-400`          | `--gold-400`          | Troféu, resultado, destaque |
| `bg-magenta-500`       | `--magenta-500`       | Accent festa |
| `bg-cyan-500`          | `--cyan-500`          | Accent céu / AO VIVO |
| `bg-bg`                | `--bg`                | Fundo do app |
| `bg-surface`           | `--surface`           | Cards |
| `bg-surface-2`         | `--surface-2`         | Wells / insets |
| `text-fg`              | `--fg`                | Texto principal |
| `text-fg-2`            | `--fg-2`              | Texto secundário |
| `text-fg-3`            | `--fg-3`              | Captions / placeholders |

**Feedback (colorblind-safe — cada estado tem cor + forma + ícone):**

| Estado  | Forma    | Ícone | Token             |
|---------|----------|-------|-------------------|
| success | ● círculo | ✓     | `--success`       |
| error   | ◆ diamante | ✕   | `--error`         |
| warning | ▲ triângulo | !  | `--warning`       |
| info    | ■ quadrado | i   | `--info`          |

### Tipografia

| Família      | Uso                          |
|--------------|------------------------------|
| Russo One    | Display / headings uppercase |
| Hanken Grotesk | UI / body                  |
| Space Mono   | Placar / countdown / mono    |

**Utilitários:** `.fc-display-xl` `.fc-display` `.fc-h1` `.fc-h2` `.fc-h3` `.fc-body-lg` `.fc-body` `.fc-body-sm` `.fc-label` `.fc-caption` `.fc-mono` `.fc-tnum`

### Espaçamento

Base 4pt: `--sp-1` (4px) → `--sp-16` (64px). Mapeados como `spacing` no Tailwind.

### Raios

`rounded-xs` (6px) · `rounded-sm` (10px) · `rounded-md` (14px) · `rounded-lg` (18px) · `rounded-xl` (24px) · `rounded-card` (20px) · `rounded-pill` (999px)

### Sombras

`shadow-1` → `shadow-4` (intensidade crescente) + `shadow-glow-grass` / `shadow-glow-gold` / `shadow-glow-magenta` para elementos "ao vivo".

### Motion

| Token          | Valor  | Uso                          |
|----------------|--------|------------------------------|
| `--dur-1`      | 120ms  | Taps, hovers                 |
| `--dur-2`      | 200ms  | Toggles, fades               |
| `--dur-3`      | 320ms  | Drops, reveals               |
| `--dur-4`      | 500ms  | Modal / resultado             |
| `--ease-bounce`| cubic  | Card caindo no slot           |

---

## Temas

Ativado por classe `.dark` **ou** atributo `data-theme="dark"` no `<html>`.

| Tema  | Paleta base     |
|-------|-----------------|
| Light | Verde-menta claro, backgrounds claros |
| Dark  | Verde-noite escuro, neons pop |

**ThemeProvider** (`components/ThemeProvider.tsx`):
- Lê `prefers-color-scheme` na primeira visita
- Override manual persistido em `localStorage` (`fc-theme`)
- Script inline no `<head>` evita flash de tema incorreto
- Hook: `useTheme()` → `{ theme, resolvedTheme, setTheme }`

---

## Componentes Primitivos

Todos em `components/ui/`. Importáveis via barrel:

```ts
import { Button, Badge, Card, Modal, Avatar, Slot, Toast, IconButton } from '@/components/ui'
```

| Componente  | Props principais                                    | Story |
|-------------|-----------------------------------------------------|-------|
| `Button`    | `variant` (primary/gold/secondary/ghost), `size`, `block` | Button.stories.tsx |
| `IconButton`| `label` (aria), `children` (ícone)                 | IconButton.stories.tsx |
| `Card`      | `elevated`                                          | Card.stories.tsx |
| `Badge`     | `variant` (success/error/warning/info/default), `icon` | Badge.stories.tsx |
| `Avatar`    | `src`, `name`, `flag`, `size`                       | Avatar.stories.tsx |
| `Slot`      | `state` (empty/active/filled/correct/incorrect), `rank` | Slot.stories.tsx |
| `Toast`     | `message`, `variant`, `duration`, `onDismiss`       | Toast.stories.tsx |
| `Modal`     | `open`, `onClose`, `title`                          | Modal.stories.tsx |

---

## Acessibilidade

- **Contraste:** todos os tokens de texto atendem WCAG AA (mínimo 4.5:1)
- **Feedback:** `Badge` e `Slot` nunca usam só cor — cada estado tem forma + ícone
- **Teclado:** `Modal` fecha com `Escape`; `IconButton` tem `aria-label`
- **Motion:** `prefers-reduced-motion` corta todas as animações (`globals.css`)
- **Touch:** alvos mínimos ≥ 44px em todos os primitivos interativos

---

## Storybook

```bash
npm run storybook   # http://localhost:6006
```

O toolbar "Tema" alterna entre light/dark em todas as stories.

---

## Fontes

- **Russo One:** self-hosted em `public/fonts/RussoOne-Regular.ttf`
- **Hanken Grotesk + Space Mono:** Google Fonts CDN (`globals.css`)
