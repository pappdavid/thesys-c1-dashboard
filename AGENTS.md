# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Single-service Next.js 14 app (Thesys C1 Developer Dashboard). No database, no Docker, no auxiliary services. The only external dependency is the Thesys C1 API at `api.thesys.dev`, which requires a valid `THESYS_API_KEY`.

### Node.js version

Use Node.js 20 (set as nvm default). The CI matrix tests on Node 18 and 20.

### Commands

See `CLAUDE.md` for the full command reference. Key commands:

- `npm run dev` — dev server on port 3000 (visit `/dashboard`)
- `npm run build` — production build (needs `THESYS_API_KEY` set, even a placeholder works for build)
- `npm run type-check` — TypeScript check
- `npm run lint` — ESLint

### Environment

Create `.env.local` from `.env.example` (`cp .env.example .env.local`). The only required secret is `THESYS_API_KEY`. Without a valid key, the dashboard UI loads fully but all panel API calls return "Generation failed" errors — this is expected behavior.

### Gotchas

- The build step reads `THESYS_API_KEY` only at runtime (API routes), so `npm run build` succeeds with a placeholder value. However, `npm run dev` will show "Internal Server Error" in panels without a real key.
- `@thesysai/genui-sdk` and `@crayonai/*` packages require client-side rendering; they are listed in `transpilePackages` in `next.config.js`. Do not attempt to SSR components that use them.
- The dev server takes ~15-20 seconds for the first `/dashboard` page load due to compilation of ~9000 modules.
