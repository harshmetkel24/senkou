<div align="center">
  <img src="./public/senkou-circle-logo.png" width="150" alt="Senkou logo" />
  <h1>Senkou</h1>
  <p><strong>A beautifully designed, infinite-scrolling AniList library built with TanStack Start.</strong></p>
  <p><a href="https://docs.anilist.co/guide/introduction">AniList API Guide</a> · <a href="https://tanstack.com/start/latest">TanStack Start</a></p>
  <p>
    <a href="https://tanstack.com/start/latest">
      <img src="./public/tanstack-circle-logo.png" height="56" alt="TanStack Start logo" />
    </a>
    &nbsp;&nbsp;
    <a href="https://react.dev/">
      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" height="56" alt="React logo" />
    </a>
    &nbsp;&nbsp;
    <a href="https://orm.drizzle.team/">
      <img src="https://avatars.githubusercontent.com/u/108468352?s=200&v=4" height="56" alt="Drizzle ORM logo" />
    </a>
    &nbsp;&nbsp;
    <a href="https://tailwindcss.com/">
      <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" height="56" alt="Tailwind CSS logo" />
    </a>
    &nbsp;&nbsp;
    <a href="https://ui.shadcn.com/">
      <img src="https://avatars.githubusercontent.com/u/139895814?s=200&v=4" height="56" alt="shadcn/ui logo" />
    </a>
    &nbsp;&nbsp;
    <a href="https://anilist.co/">
      <img src="https://anilist.co/img/icons/icon.svg" height="56" alt="AniList logo" />
    </a>
  </p>
</div>

## Vision

Senkou (線光) is an IMDB-style experience for anime, manga, and characters. Stage 1 centers on a cinematic, URL-driven browsing surface powered by TanStack Start RSC loaders + React Query hydration, spotlight carousels, and infinite-scroll-ready grids. Later stages layer in auth, watchlists, recommendations, and social features while holding the performance budgets (TTFB < 200 ms cached, LCP < 2.5 s, CLS < 0.05).

## v0.1 Highlights

- Home hero with `Cmd/Ctrl+K` quick search, rotating trending placeholder prompts, a trending grid, and a signed-in watchlist shelf (Neon + Drizzle).
- Sidebar-first Anime, Manga, and Characters routes that preload AniList data in loaders, hydrate client search from URL params, and reuse cached list data inside detail panels.
- A universal `/search` route with Search Plus Ultra scope, format/season/year controls, category chips, shareable URL state, and empty/error handling.
- Auth preview: email/password registration + login with bcrypt hashes stored in Postgres, cookie sessions driven by `SESSION_SECRET`, and watchlist add/remove actions.
- Profile polish: system-generated "Joined Since" metadata alongside editable profile fields.
- UX polish: skeleton grids, lazy media, spotlight carousels, retry/backoff messaging on AniList hiccups, hero placeholder rotation (paused on focus), and hotkeys (`Cmd/Ctrl+K`, `Cmd/Ctrl+S`, Shift+?).

## Coming soon

- Infinite scroll with `useInfiniteQuery` + IntersectionObserver sentinels across list routes.
- Staff route with rich detail panels and shared AniList fragments.
- Sticky filter/search bar with quick toggles for format, season, and year.
- Auth.js OAuth (GitHub/Google) plus optional magic links.
- "My Library" watchlist management with filters, pagination, and profile controls.
- Collections, ratings/reviews, activity feed, recommendations, and offline/PWA caching.

## Roadmap

- **Stage 1 — MVP “Beautiful Infinite Scroll” (complete)**
  - [x] RSC loaders fetch AniList GraphQL data for fast first paint; client components hydrate queries and reuse cached data in detail panels and watchlist actions.
  - [x] Sidebar routes for Anime, Characters, Manga, plus a universal Search surface with URL-driven filters and shareable links.
  - [x] Cards ship skeletons, lazy art, empty/error states, and rate-limit-aware retries.
  - [x] Auth + watchlist preview backed by Neon/Drizzle so saved titles show up on the home shelf.
- **Stage 2 — Coming next**
  - [ ] Infinite scroll with `useInfiniteQuery` + IntersectionObserver sentinels across list routes.
  - [ ] Sticky filter/search bar with quick toggles for format, season, and year.
  - [ ] Swap to Auth.js OAuth (GitHub/Google) or magic links on top of hardened cookies/sessions.
  - [ ] Server Actions for watchlists with optimistic updates, CSRF protection, and rate-limited mutations.
  - [ ] "My Library" view with filters/pagination plus profile controls (avatar, display name, theme/content rating prefs).
  - [ ] Collections and shareable slugs, ratings/reviews with moderation + helpful votes, activity feed, and recommendations.
  - [ ] Offline/PWA caching and debounced faceted search (year/season/format/studios/tags).
  - [ ] CDN/blobs for cover art, i18n routing, and admin tooling for feature flags + moderation queues.

## Stack & structure

- **Framework & data**: TanStack Start (React 19 + Vite). AniList GraphQL is fetched through `src/lib/anilist-client.ts` with backoff for 429/5xx. URLSearchParams are validated (zod) before queries fire.
- **Routing & state**: TanStack Router file routes with loaders for first paint, TanStack Query for hydration/caching, Zustand for sidebar/help state.
- **Styling**: Tailwind CSS v4 + shadcn/ui. Themes and Radix color tokens live in `src/styles.css` and `src/lib/theme`; media uses `@unpic/react` for responsive images.
- **Database**: Neon Postgres + Drizzle ORM for users and watchlists (see `src/db/`), including a user experience level (0-9) and profile bio for future personalization. Server functions manage auth, watchlist mutations, and sessions (`SESSION_SECRET`-backed cookies).
- **Project layout**: Feature folders inside `src/` (`routes`, `components`, `data`, `hooks`, `lib`, `db`). AniList queries and normalizers live in `src/data/queries`; shared UI in `src/components/ui` and `src/components/media/watchlist`.

## Performance & resilience

- AniList calls retry with exponential backoff + jitter; errors bubble to UI with actionable retry/clear states.
- Skeletons and lazy images reduce layout shifts; cached list data is reused for detail panels and watchlist writes.
- Keyboard accessibility: Cmd/Ctrl+K (focus hero search), Cmd/Ctrl+S (toggle sidebar), Shift+? (open help).
- Keep Web Vitals budgets in mind (TTFB < 200 ms cached, LCP < 2.5 s, CLS < 0.05) and avoid leaking secrets.

## Getting started

1. Install dependencies with `pnpm install` (Node 20+).
2. Create a `.env` file with:

   ```
   DATABASE_URL="postgres://user:password@host:port/db"
   SESSION_SECRET="at-least-32-characters"
   ```

   Neon is the default Postgres target; `drizzle.config.ts` reads `DATABASE_URL`.

3. (Optional) Sync the schema: `pnpm drizzle:generate && pnpm drizzle:push`.
4. Run the dev server with `pnpm dev` (`http://localhost:3000`). Before shipping, run `pnpm test` and `pnpm build`; preview production output with `pnpm serve`.

Common scripts: `pnpm dev`, `pnpm build`, `pnpm serve`, `pnpm test`, `pnpm drizzle:studio` (inspect data), `pnpm drizzle:generate`, `pnpm drizzle:push`.

## Contributing

Implementation details, development setup, and contributor workflow live in [`CONTRIBUTION.md`](./CONTRIBUTION.md). Check it for environment steps, component/library expectations, data/query patterns, testing gates, and release hygiene.

## Resources

- AniList API & GraphQL guide: https://docs.anilist.co/guide/introduction
- AniList rate limits: https://anilist.gitbook.io/anilist-apiv2-docs/overview/rate-limiting
- TanStack Start: https://tanstack.com/start/latest · Router: https://tanstack.com/router · Query: https://tanstack.com/query
- Tailwind CSS v4: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com · Radix Colors: https://www.radix-ui.com/colors/docs
- Drizzle ORM: https://orm.drizzle.team/ · Neon serverless Postgres: https://neon.tech/docs
- Vite: https://vitejs.dev/guide/ · Vitest + Testing Library: https://vitest.dev/ · https://testing-library.com/docs/react-testing-library/intro
