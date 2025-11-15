# Senkou Agent Manual

## Mission & Pillars
- Build a cinematic, IMDB-style AniList browser with buttery infinite scroll, URL-driven filters, and rich micro-interactions.
- Hold performance budgets (cached TTFB <200 ms, LCP <2.5 s, CLS <0.05) and stay resilient to AniList rate limits.
- Keep the architecture ready for authenticated watchlists, recommendations, and social features without rewrites.

## Delivery Stages
### Stage 1 — MVP “Beautiful Infinite Scroll”
- Ship sidebar-first Anime/Characters/Manga/Staff routes with a sticky filter/search bar.
- Load the first page in RSC loaders, then paginate with `useInfiniteQuery` + IntersectionObserver sentinels.
- Treat URLSearchParams as the only source of truth for every search/sort/filter input before fetching.
- Build responsive card grids with skeletons, lazy images, empty/error states, and retry/backoff messaging.
- Reuse cached list data for detail pages and prefetch character info.

### Stage 2 — Auth + Watchlists
- Configure Auth.js OAuth (GitHub, Google) plus optional magic link using edge-safe cookies.
- Implement optimistic, CSRF-protected, rate-limited watchlist Server Actions for add/remove/toggle.
- Launch “My Library” mirroring list UX with filters/pagination and profile controls (avatar, display name, theme, content rating).

### Stage 3 — Advanced Features
- Add shareable collections, ratings/reviews with moderation + helpful votes, an activity feed, and co-occurrence-based recommendations.
- Provide offline/PWA caching (install prompt, background sync) and debounced faceted search (year, season, format, studios, tags) synced to the URL.
- Support CDN/blobs for cover art, i18n routing, and admin tooling (feature flags, moderation queue).

## Architecture & Module Organization
- Keep app code inside `src/` feature folders (`routes`, `components`, `lib`, `data`).
- Store AniList GraphQL queries/fragments in `src/data/queries` with typed helpers or generated artifacts.
- Static assets live in `public/`; builds output to `.output/` or `dist/`; leave generated files (e.g., `src/routeTree.gen.ts`) untouched.
- Use absolute imports (TS aliases), kebab-case filenames, and colocate hooks/utilities near their consumers.
- Prefer reusable components in `src/components/` (e.g., `layouts/`, `helpers/`, `ui/`) and keep main route files focused on routing logic.

## API & Data Guidance
- Rely on AniList GraphQL (`https://graphql.anilist.co`) and follow their schema + rate-limit docs.
- Validate every loader input with zod/valibot before querying AniList and sanitize GraphQL variables.
- Add exponential backoff with jitter for HTTP 429/5xx and surface actionable retry timing in the UI.
- Let RSC loaders fetch the first page and pass cursors to client queries for infinite scroll; share fragments between list/detail routes.
- Stage future internal APIs (watchlists, reviews, etc.) under `src/server/` via TanStack Start server actions.

## UI & Experience Conventions
- Persist a sidebar shell across routes, highlight the active link, and collapse gracefully on narrow viewports.
- Keep the filter/search bar sticky, keyboard-accessible, and fully synced with URL state; include quick toggles for format/season/year.
- Cards must follow shadcn tokens, maintain aspect ratios, use lazy images, and expose CTA chips (format, episodes, popularity).
- Provide bespoke empty and error illustrations; rate-limit errors should recommend when to retry.
- Meet accessibility standards with visible focus styles, `prefers-reduced-motion` fallbacks, and semantic headings.

## Styling & Components
- Use Tailwind CSS v4 with design tokens defined in `src/lib/theme`.
- Lean on shadcn/ui components (install via `pnpx shadcn@latest init`) and grow variants with `class-variance-authority`.
- Keep themes ready from day one (default dark cinematic) by importing Radix UI color scales into `src/styles.css`, aliasing them to CSS variables per `data-theme`, extending those blocks for new palettes, and syncing both `document.documentElement.dataset.theme` and the Radix `.dark/.light` class when toggling.

## Testing & Quality
- Test with Vitest + @testing-library/react (jsdom) and colocate specs as `*.test.ts(x)`.
- Cover loader param parsing, IntersectionObserver pagination, optimistic watchlist toggles, search URL syncing, and accessibility regressions.
- Avoid snapshots unless safeguarding critical layouts.
- Run `pnpm test` and `pnpm build` before submitting; builds must remain warning-free.

## Tooling & Commands
- `pnpm dev` – Vite dev server (`http://localhost:3000`).
- `pnpm build` – production build.
- `pnpm serve` – preview the built output.
- `pnpm test` – Vitest CI mode.

## Process, Git, & Reviews
- Write short imperative commits (≤72 chars), e.g., `feat(routes): add anime infinite scroll`.
- PRs need a summary, UI screenshots, test plan, linked issues, and performance notes when relevant.
- Keep scope tight and avoid mixing generated files unless required.
- Update the README after any notable code or UX change.

## Security & Observability
- Never commit secrets; rely on `.env`.
- Sanitize and authorize all server action inputs, enforce CSRF protection, and rate-limit mutations before Stage 2 launch.
- Integrate Sentry on client and server and trace AniList queries to catch slow or rate-limited calls.
