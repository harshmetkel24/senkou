# Contribution Guide

Senkou is currently in Stage 1 (“Beautiful Infinite Scroll”), so every contribution should reinforce the sidebar-first browsing experience, buttery pagination, and readiness for future auth/watchlist work. The notes below capture the development workflow that lived in `README.md`, plus a few extra pointers pulled from `AGENTS.md`.

## Local Environment
- Use Node 20+ with PNPM installed globally.
- Install dependencies with `pnpm install`.
- Start the dev server with `pnpm dev` (Vite on `http://localhost:3000`).
- Preview a production build locally with `pnpm serve` (runs `vite preview`).

## Build & Quality Gates
- `pnpm build` &mdash; Vite production build (ensure the output is warning-free).
- `pnpm test` &mdash; Vitest suite (jsdom + @testing-library/react). Run before every PR.
- Optional: after `pnpm build`, use `pnpm serve` to verify the SSR/RSC payload.

## Working Agreements
- Keep scope focused on Stage 1 features (Anime, Characters, Manga routes; Staff is queued next). Treat URLSearchParams as the single source of truth for search/sort/filter state.
- Preserve the cinematic shell: sticky sidebar/filter bar, responsive cards with skeletons, lazy media, and rate-limit aware error/empty states.
- Follow the feature-folder layout inside `src/` (`routes/`, `components/`, `lib/`, `data/`). Keep hooks/utilities close to their consumers and prefer absolute imports.
- When introducing watchlist-ready plumbing or loaders, ensure future Stage 2/3 work (auth, collections, reviews) will not require rewrites.

## Component Library & Styling
- If shadcn/ui is not initialized yet, run `pnpx shadcn@latest init`.
- Generate UI primitives via `pnpx shadcn@latest add <component>` and align tokens with the Senkou dark-cinematic palette.
- Tailwind CSS v4 lives in `src/styles.css`; extend tokens through `src/lib/theme` and keep theme toggles synced between `data-theme` attributes and Radix `.dark/.light` classes.

## Data & Query Guidelines
- Route loaders should fetch the first AniList page and hand cursors to client components. Use `@tanstack/react-query` for pagination/mutations with `useInfiniteQuery` + IntersectionObserver sentinels.
- Validate every loader parameter (zod) before building AniList GraphQL variables. Sanitize inputs and keep fragments reusable inside `src/data/queries`.
- Persist search/filter/sort in the URL (e.g., `?query=...&sort=POPULARITY_DESC`). Never read directly from uncontrolled inputs when building queries.

## Testing Expectations
- Co-locate tests as `*.test.ts(x)` next to the unit they cover.
- Cover loader param parsing, infinite scroll pagination boundaries, optimistic mutations, URL syncing, and accessibility behavior.
- Avoid brittle snapshots unless protecting a critical layout.
- Always run `pnpm test` and `pnpm build` locally before submitting a PR.

## Observability & Performance
- Integrate Sentry on both client and server paths. Trace AniList requests to flag slow or rate-limited calls.
- Implement exponential backoff with jitter for HTTP 429/5xx responses and surface retry timing in the UI.
- Track Web Vitals (TTFB < 200 ms cached, LCP < 2.5 s, CLS < 0.05) and log rate-limit hits for future tuning.

## Git & PR Hygiene
- Use short, imperative commit messages (≤72 chars), e.g., `feat(routes): add anime infinite scroll`.
- PRs should include a summary, screenshots of UX changes, a test plan, relevant issues, and performance notes when applicable.
- Keep scope tight; avoid bundling generated files unless absolutely necessary.
- Update `README.md` (or this guide) whenever you introduce notable code or UX behavior changes.
