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
Senkou (線光) is an IMDB-style experience for anime, manga, characters. Stage 1 focuses on a best-in-class browsing experience powered by TanStack Router RSC + React Query, with a sidebar-first layout, sticky filter bar, and buttery-smooth infinite scroll. Later stages add auth, watchlists, recommendations, and social features while preserving the cinematic feel and strict performance targets (TTFB < 200 ms cached, LCP < 2.5 s, CLS < 0.05).

## Roadmap
- **Stage 1 — MVP “Beautiful Infinite Scroll” (current)**
  - Server components fetch AniList GraphQL data for fast first paint; client components hydrate infinite lists via `useInfiniteQuery` + IntersectionObserver sentinels.
  - Sidebar routes: Anime, Characters, Manga (Staff is on deck next). Each route keeps search/sort/filter state in URL params for shareable state.
  - Card grid with skeletons, responsive breakpoints, lazy-loaded art, and empty/error states that handle AniList rate limits with retry/backoff.
  - Details pages reuse cached query data when possible; images are prepared for future CDN offloading.
- **Stage 2 — Auth + Watchlists**
  - Auth.js OAuth (GitHub, Google) plus optional email magic links.
  - Server Actions mutate watchlists with optimistic React Query updates, CSRF protection, and rate-limited mutations.
  - “My Library” view with filters/pagination, user profile (avatar, display name, theme/content rating prefs).
- **Stage 3 — Advanced Features**
  - Collections & shareable slugs, ratings/reviews with moderation, popular searches, activity feed/follow graph, recommendations (“Because you watched …”), offline/PWA caching, advanced faceted search, Vercel image caching, i18n routing, and admin tooling for feature flags + moderation queues.

## Tech Stack
- **Framework**: TanStack Start (React 19, Vite, File-based routing).
- **Data**: AniList GraphQL API; loaders for RSC, React Query for client pagination, URLSearchParams for filter state.
- **Styling**: Tailwind CSS + shadcn/ui; responsive grid tokens and sensible typography scale.
- **State & Utilities**: TanStack Query/Store, class-variance-authority, zod for loader validation.
- **Tooling**: PNPM, TypeScript strict mode, Vitest + Testing Library, Sentry (client & server) for observability.

## Layout & UX Notes
- Sidebar-first shell with a sticky filter/search bar. Keep navigation persistent and highlight the active route.
- Lists must render skeleton cards immediately, stream first data chunk from RSC, then hydrate and continue infinite scroll.
- Use IntersectionObserver sentinels per grid; pause fetching when filters/search change until new params resolve.
- Detail routes share typography, include cast tabs, and reuse cached queries when revisiting the list.

## Non-Functional Requirements
- Respect AniList rate limits with exponential backoff + jitter. Surface graceful error states (`Retry`, `Report issue`) and empty-state illustrations.
- Track performance budgets via Web Vitals, and instrument AniList GraphQL requests for tracing.
- Edge-safe cookies for future auth; no secrets in the repo. All user input validated & sanitized before rendering.

## Contributing
Implementation details, development setup, and contributor workflow have moved to [`CONTRIBUTION.md`](./CONTRIBUTION.md). Check it for local environment steps, component library expectations, data/query patterns, testing gates, and release hygiene.

## Resources
- AniList Docs: https://docs.anilist.co/guide/introduction
- TanStack Start: https://tanstack.com/start/latest
- TanStack Router & Query: https://tanstack.com/router · https://tanstack.com/query
- shadcn/ui: https://ui.shadcn.com
