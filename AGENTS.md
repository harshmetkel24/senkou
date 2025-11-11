# Senkou Agent Manual

## Mission & Pillars
- Craft a cinematic, IMDB-style AniList browser with buttery infinite scroll, URL-driven filters, and delightful micro-interactions.
- Maintain strict performance (TTFB < 200 ms cached, LCP < 2.5 s, CLS < 0.05) and resilience against AniList rate limits.
- Architecture must scale toward authenticated watchlists, recommendations, and social features without rewrites.

## Delivery Stages
### Stage 1 — MVP “Beautiful Infinite Scroll”
- Routes: Anime, Characters, Manga, Staff inside a sidebar-first layout with sticky filter/search bar.
- Initial data loads in RSC loaders; client hydration continues pagination via `useInfiniteQuery` + IntersectionObserver sentinel per grid.
- URLSearchParams are the single source of truth for search/sort/filter; syncing is mandatory before fetching.
- Card grids require skeletons, responsive breakpoints, lazy images, empty + error states with retry/backoff messaging.
- Detail pages reuse cached list data when possible and prefetch character info.

### Stage 2 — Auth + Watchlists
- Auth.js OAuth (GitHub, Google) + optional magic link; edge-safe cookies only.
- Watchlist Server Actions (add/remove/toggle) must be optimistic, rate-limited, and CSRF-protected.
- “My Library” page mirrors list UX with filters/pagination; include profile (avatar, display name, theme, content rating filter).

### Stage 3 — Advanced Features
- Collections/lists with shareable slugs, ratings & reviews (with moderation + helpful votes), activity feed, recommendations using co-occurrence data.
- Offline/PWA caching (install prompt, background sync) and faceted advanced search (year/season/format/studios/tags) with debounced URL syncing.
- CDN/blobs for cover art, i18n routing, admin tooling (feature flags, moderation queue).

## Architecture & Module Organization
- App code lives in `src/` with feature folders: `src/routes/`, `src/components/`, `src/lib/`, `src/data/`.
- Place AniList GraphQL operations/fragments in `src/data/queries` and keep them typed via generated artifacts or `graphql-request` helpers.
- Static assets → `public/`. Build outputs → `.output/`, `dist/`. Generated files like `src/routeTree.gen.ts` stay untouched.
- Use absolute imports (TS path aliases). Files follow kebab-case; hooks/utilities colocated near usage when feasible.
- Prefer creating reusable components in `src/components/` organized by appropriate subfolders (e.g., `layouts/`, `helpers/`, `ui/`). Avoid writing JSX directly in main route components like `__root.tsx` to keep them clean and focused on routing logic.

## API & Data Guidance
- Primary datasource: AniList GraphQL (`https://graphql.anilist.co`). Reference https://docs.anilist.co/guide/introduction for schema and rate limits.
- Always validate loader inputs with zod/valibot before hitting AniList; guard against injection in GraphQL variables.
- Implement exponential backoff + jitter for HTTP 429/5xx responses and surface helpful UI messaging.
- Cache-aware design: RSC loaders fetch the first page, then pass cursors to client queries for infinite scroll; keep fragments reusable across list/detail routes.
- Prepare for future internal APIs (watchlists, reviews) exposed via TanStack Start server actions—structure handlers in `src/server/`.

## UI & Experience Conventions
- Sidebar shell persists across routes; highlight active route, collapse gracefully on narrow viewports.
- Filter bar is sticky, keyboard-accessible, and mirrors URL state; include quick toggles for format/season/year.
- Cards follow shadcn tokens, include aspect-ratio-safe images, CTA chips (format, episodes, popularity).
- Empty and error states are bespoke illustrations/messages; rate-limit errors should suggest retry timing.
- Accessibility: all interactive elements need focus styles, `prefers-reduced-motion` fallbacks, and semantic headings.

## Styling & Components
- Tailwind CSS (v4) with design tokens documented in `src/lib/theme`.
- Strongly use shadcn/ui components; install via `pnpx shadcn@latest init` if not set up. Extend via `class-variance-authority` when variants grow.
- Theme-ready from Day 1 (light/dark), but default is dark cinematic palette.
- Palette values must come from Radix UI Colors via `@radix-ui/colors`; import the official scales into `src/styles.css` (per the Radix usage guide) before aliasing them to our semantic tokens.
- Color palette lives in `src/styles.css`: consume tokens via the exposed CSS variables/utility classes (or Tailwind `theme()` helpers) instead of hard-coding hex/oklch values. Toggle palettes by switching the `data-theme` attribute (default `senkou-dark`) and define new variables there before using them anywhere else.
- When adding another palette, extend the existing `data-theme` blocks in `src/styles.css` so every theme keeps the same token names available to components and Tailwind.
- When changing a theme at runtime, update both `document.documentElement.dataset.theme` and the matching Radix class (`.dark` / `.light`) so the imported scales provide the correct primitive tokens.

## Testing & Quality
- Vitest + @testing-library/react (jsdom). Tests colocated as `*.test.ts(x)`.
- Cover: loader param parsing, intersection observer pagination, optimistic watchlist toggles, search URL syncing, and accessibility regressions.
- Snapshot tests are discouraged unless guarding critical layouts.
- Always run `pnpm test` and `pnpm build` before submitting work.

## Tooling & Commands
- `pnpm dev` – Vite dev server (`http://localhost:3000`).
- `pnpm build` – production build (must stay warning-free).
- `pnpm serve` – preview built output.
- `pnpm test` – Vitest CI mode.

## Process, Git, & Reviews
- Commits: short imperative subject (≤72 chars). Example: `feat(routes): add anime infinite scroll`.
- PRs require summary, screenshots of UI changes, test plan, linked issues. Mention perf impact if relevant.
- Keep scope tight; avoid mixing generated files unless necessary.
- After any substantial code or UX change, check whether README needs a minimal, targeted update and apply it immediately.

## Security & Observability
- No secrets checked in; use `.env` ignored by git. Server actions must sanitize and authorize inputs.
- Hook Sentry (client/server) and trace AniList queries to identify slow terms or rate-limit patterns.
- Ensure CSRF protection and mutation rate-limiting before launching Stage 2.
