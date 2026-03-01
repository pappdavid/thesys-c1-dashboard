# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build (also used in CI)
npm run type-check   # TypeScript check without emitting (tsc --noEmit)
npm run lint         # ESLint via next lint
npm run start        # Start production server (requires prior build)
```

**Required environment variable** — create `.env.local`:
```
THESYS_API_KEY=sk_thesys_...
```

## Architecture

### Request flow

A panel fetch call: `DashboardPanel (submit)` → `POST /api/panel` → `callThesysPanel()` → Thesys C1 API → response parsed for content + optional dashboard commands → state updated in `DashboardPage`.

### Key server/client split

- **`lib/thesys-client.ts`** — **server-only**. Contains all Thesys API calls, `PANEL_SYSTEM_PROMPTS` (one per named panel), the `DashboardCommand` type, and `callThesysPanel()`. Never import this on the client. The OpenAI client is a lazy singleton.
- **`lib/panel-config.ts`** — **client-safe**. Exports `PANELS` array (id + title only). No server-side imports. Used by `dashboard.tsx` to seed initial panel state.

### The panel system

`pages/dashboard.tsx` manages a `Panel[]` state array. Each `Panel` has:
- `id` — unique runtime ID
- `panelKey?: string` — if set, maps to a key in `PANEL_SYSTEM_PROMPTS` so that named panels get dedicated system prompts
- `type: 'c1' | 'chat'` — C1 panels render via `ThesysRenderer`; chat panels render via `ChatContent`
- `hasInput: boolean` — controls per-panel textarea + submit footer visibility
- `userPrompt` — current text in the panel's textarea

On mount, the 6 named panels from `PANELS` plus one chat panel are seeded and auto-fetched in parallel. Users can drag-and-drop panels to reorder them (HTML5 DnD on the header), add/remove panels, toggle type, and toggle input visibility.

### Agent layout commands

The system prompt injected in `callThesysPanel()` includes a `DASHBOARD CONTROL PROTOCOL` section. If the Thesys agent appends a JSON block delimited by `__DASHBOARD_COMMANDS_START__` / `__DASHBOARD_COMMANDS_END__`, `dashboard.tsx` parses it and applies `DashboardCommand` actions (reorder, update, add_panel, remove_panel, set_input, set_type, set_title) to panel state.

### API endpoints

- **`/api/dashboard`** — legacy endpoint; accepts `{ panelId, userContext }`, proxies to `callThesysC1Panel()`. Kept for backward compatibility.
- **`/api/panel`** — primary endpoint; accepts `{ panelId?, prompt?, panelType, panels[] }`, calls `callThesysPanel()`, returns `{ content, commands[] }`.

### Component responsibilities

| Component | Role |
|---|---|
| `DashboardLayout` | Minimal header-only shell (no sidebar). Renders breadcrumb, search pill, bell, avatar. |
| `DashboardPanel` | Single panel: drag handle, type badge, title, hover-reveal controls, content area, optional input footer. Exports the `Panel` interface. |
| `ThesysRenderer` | Client-only (`dynamic` + `ssr: false`). Wraps `@thesysai/genui-sdk`'s `C1Component` inside a dark `ThemeProvider`. One instance per C1 panel. |
| `ChatContent` | Zero-dependency inline markdown renderer for chat panels. Handles headings, lists, code blocks, inline code, bold/italic, blockquotes. |
| `C1Component` | Legacy wrapper kept in repo; no longer used by `dashboard.tsx` but still referenced by `/api/dashboard` tests. |

### Styling

All styles live in `styles/globals.css` using plain CSS classes — no CSS modules or styled-components. Design tokens are CSS custom properties on `:root` (`--bg-base`, `--accent-purple`, etc.). Tailwind is used only for layout utilities (`grid`, `flex`, spacing). Component-specific classes follow a prefix convention: `kpi-*`, `panel-*`, `chat-*`, `prompt-*`.

### Thesys SDK notes

`@thesysai/genui-sdk` and related `@crayonai/*` packages require client-side rendering. They are listed in `transpilePackages` in `next.config.js`. The API base URL is `https://api.thesys.dev/v1/embed` using the OpenAI-compatible client. The model identifier is `c1/anthropic/claude-sonnet-4/v-20251230`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs `type-check`, `lint`, and `build` on Node 18 and 20 for every push/PR to `main` or `develop`. `THESYS_API_KEY` must be set as a GitHub secret for the build step.
