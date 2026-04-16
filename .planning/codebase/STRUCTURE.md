# Codebase Structure

**Analysis Date:** 2026-04-17

## Directory Layout

```
senkou/
├── src/                          # Application source code
│   ├── components/               # React components
│   │   ├── characters/           # Character-specific components
│   │   ├── contexts/             # React context providers
│   │   ├── helpers/              # Utility components (auth, analytics, modals)
│   │   ├── layouts/              # Layout wrapper components
│   │   ├── media/                # Media (anime/manga) components
│   │   ├── search/               # Search UI components
│   │   ├── ui/                   # UI primitives (Radix + Tailwind)
│   │   └── watchlist/            # Watchlist display components
│   ├── data/                     # Data fetching queries
│   │   └── queries/              # GraphQL query functions
│   ├── db/                       # Database configuration
│   │   ├── index.ts              # Drizzle ORM instance
│   │   └── schema.ts             # Table definitions
│   ├── hooks/                    # Custom React hooks
│   ├── integrations/             # Third-party service integration
│   │   └── tanstack-query/       # TanStack Query setup
│   ├── lib/                      # Utility libraries
│   │   ├── auth/                 # Authentication logic
│   │   ├── constants/            # Constant values
│   │   ├── hooks/                # Hooks directory (legacy)
│   │   ├── i18n/                 # Internationalization config
│   │   ├── server/               # Server-side functions
│   │   ├── storage/              # File storage (MinIO)
│   │   ├── stores/               # Zustand state stores
│   │   ├── anilist-client.ts    # AniList GraphQL client
│   │   ├── pwa.ts               # PWA service worker setup
│   │   ├── search-*.ts          # Search utilities
│   │   ├── watchlist-helpers.ts # Watchlist utility functions
│   │   └── utils.ts             # General utilities
│   ├── routes/                   # TanStack Router file-based routes
│   │   ├── _authed/             # Protected routes
│   │   ├── __root.tsx           # Root layout
│   │   ├── index.tsx            # Home page
│   │   ├── login.tsx            # Login page
│   │   ├── register.tsx         # Registration page
│   │   ├── anime.tsx            # Anime browsing
│   │   ├── manga.tsx            # Manga browsing
│   │   ├── characters.tsx       # Character browsing
│   │   ├── search.tsx           # Search page
│   │   ├── router.tsx           # Router factory
│   │   └── routeTree.gen.ts     # Auto-generated route tree
│   ├── types/                    # TypeScript type definitions
│   ├── logo.svg                  # Application logo
│   ├── router.tsx                # TanStack Router setup
│   └── styles.css                # Global styles
├── public/                       # Static assets (manifest, icons, etc)
├── docker/                       # Docker configuration
│   └── minio/                    # MinIO Docker compose
├── drizzle.config.ts             # Drizzle ORM config
├── vite.config.ts                # Vite build config
├── tsconfig.json                 # TypeScript config
├── components.json               # shadcn/ui config
├── package.json                  # Dependencies
├── pnpm-lock.yaml               # Dependency lock file
└── vercel.json                   # Vercel deployment config
```

## Directory Purposes

**src/components/**
- Purpose: All React components organized by feature domain
- Contains: Component files (.tsx), no logic files
- Key files: 
  - `ui/` - ~17 Radix-based UI primitives (button, card, input, dialog, etc)
  - `helpers/` - Cross-app helpers (ProfileAnalytics, RouteErrorBoundary, FloatingHelpButton, ThemeToggle, etc)
  - `layouts/` - Sidebar, Header, Footer, MainContent wrapper

**src/components/characters/**
- Purpose: Character browsing and detail display
- Contains: CharacterCard, CharacterGrid, CharacterDetailPanel, character-related queries

**src/components/media/**
- Purpose: Media (anime/manga) browsing and detail display
- Contains: MediaCard, MediaGrid, MediaDetailPanel

**src/components/watchlist/**
- Purpose: Watchlist display and shelf components
- Contains: WatchlistShelf with user's saved items

**src/data/queries/**
- Purpose: GraphQL query functions for fetching from AniList API
- Key files: 
  - `anime.ts` - fetchTrendingAnime, fetchAnimeSearch
  - `manga.ts` - fetchTrendingManga, fetchMangaSearch
  - `characters.ts` - fetchTrendingCharacters, fetchCharacterSearch
  - `utils.ts` - Query helpers (sanitization, parsing)

**src/db/**
- Purpose: Database layer configuration and schema
- Key files:
  - `index.ts` - Drizzle instance with Neon PostgreSQL
  - `schema.ts` - usersTable, catalogEntitiesTable, watchlistEntriesTable with enums

**src/hooks/**
- Purpose: Custom React hooks for client-side logic
- Key files:
  - `useAuth.ts` - Access auth context from router
  - `use-watchlist-add.ts` - Add to watchlist mutation + state
  - `use-watchlist-remove.ts` - Remove from watchlist
  - `use-watchlist-status.ts` - Update watchlist entry status
  - `use-spotlight-deck.ts` - Carousel state management

**src/lib/auth/**
- Purpose: Authentication logic (login, register, session, validation)
- Key files:
  - `index.ts` - getCurrentUserFn, authenticateUser
  - `login.ts` - loginFn server function
  - `register.ts` - registerFn server function
  - `session.ts` - Session management with cookies
  - `validation.ts` - Zod schemas for email/password

**src/lib/server/**
- Purpose: Server-side functions exposed to client
- Key files:
  - `user.ts` - updateUserFn, getUserInfo, getUserById, getUserByEmail
  - `watchlist.ts` - addToWatchlistFn, removeWatchlistEntryFn, updateWatchlistStatusFn, getWatchlistStatsFn

**src/lib/storage/**
- Purpose: File upload and avatar management via MinIO S3
- Key files:
  - `minio.ts` - S3Client setup, image upload, bucket management
  - `avatar.ts` - Avatar URL resolution, public URL building

**src/lib/i18n/**
- Purpose: Internationalization setup with i18next
- Contains: Config, locale files (en/, ja/) with translations

**src/lib/stores/**
- Purpose: Client-side state with Zustand
- Key files:
  - `sidebar.ts` - Sidebar collapsed/mobile state

**src/routes/**
- Purpose: File-based routing with TanStack Router
- Key files:
  - `__root.tsx` - Root layout, auth loader, devtools setup
  - `index.tsx` - Home page with trending anime
  - `login.tsx`, `register.tsx` - Auth forms
  - `anime.tsx`, `manga.tsx`, `characters.tsx` - Browse pages
  - `search.tsx` - Search with filters
  - `_authed/route.tsx` - Protected route wrapper
  - `_authed/profile.tsx` - User profile page
  - `router.tsx` - Router factory function
  - `routeTree.gen.ts` - Auto-generated (do not edit)

## Key File Locations

**Entry Points:**
- `src/router.tsx` - Creates router instance
- `src/routes/__root.tsx` - Root layout and auth context
- `src/routes/index.tsx` - Home page

**Configuration:**
- `vite.config.ts` - Build config (TanStack Start, React, Tailwind, TypeScript paths)
- `tsconfig.json` - TypeScript configuration
- `drizzle.config.ts` - Database migration config
- `components.json` - shadcn/ui settings

**Core Logic:**
- `src/lib/auth/` - Authentication (login, register, session, validation)
- `src/lib/server/` - Server functions (user, watchlist operations)
- `src/lib/anilist-client.ts` - AniList GraphQL client with retry logic

**Testing:**
- No test directory currently. Test files would follow `*.test.ts` or `*.spec.ts` pattern

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `ProfileAvatar.tsx`, `SearchBar.tsx`)
- Utilities/hooks: camelCase (e.g., `useAuth.ts`, `watchlist-helpers.ts`)
- Server functions: camelCase with Fn suffix (e.g., `loginFn`, `updateUserFn`)
- Config files: camelCase (e.g., `vite.config.ts`, `drizzle.config.ts`)
- Routes: camelCase or underscore-prefixed special routes (e.g., `__root.tsx`, `_authed/`)

**Directories:**
- Feature folders: kebab-case (e.g., `search`, `character-grid`)
- Utilities: descriptive plural or descriptive names (e.g., `components`, `helpers`, `hooks`, `stores`)

**Functions & Variables:**
- Components: PascalCase (React components)
- Hooks: camelCase starting with `use` prefix (e.g., `useAuth`, `useWatchlistAdd`)
- Server functions: camelCase with `Fn` suffix (e.g., `updateUserFn`, `addToWatchlistFn`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `ANILIST_GRAPHQL_ENDPOINT`)
- Event handlers: camelCase starting with `on` (e.g., `onClose`, `onSelect`, `onSuccess`)

**Types:**
- Interfaces/Types: PascalCase (e.g., `User`, `AuthContextType`, `WatchlistEntry`)
- Type utilities: PascalCase with suffix (e.g., `MediaDetailData`, `AddWatchlistInput`)
- Enums: PascalCase (defined in schema: `entityKindEnum`, `watchStatusEnum`)

## Where to Add New Code

**New Feature (Auth, Watchlist, etc):**
- Primary code: `src/lib/server/` for server functions, `src/lib/auth/` for auth-related
- UI components: `src/components/[feature-name]/`
- Routes: `src/routes/[feature-name].tsx`
- Hooks: `src/hooks/use-[feature].ts`
- Tests: `src/lib/server/[feature].test.ts` or `src/hooks/use-[feature].test.ts`

**New UI Component:**
- Primitive: `src/components/ui/[component-name].tsx`
- Feature-specific: `src/components/[feature]/[component-name].tsx`

**New Query/Data Fetching:**
- GraphQL queries: `src/data/queries/[entity].ts` (following anime.ts, characters.ts pattern)
- Local queries: Colocate in `src/lib/server/` if server-side

**New Database Table/Schema:**
- Schema definition: `src/db/schema.ts`
- Queries: `src/lib/server/[entity].ts`
- Migrations: Run `npm run drizzle:generate` after schema changes

**Utilities:**
- Shared helpers: `src/lib/[category].ts` (e.g., `search-helpers.ts`, `watchlist-helpers.ts`)
- UI utilities: `src/lib/utils.ts` (cn function for class merging)

**State Management:**
- Global state: `src/lib/stores/[store-name].ts` (Zustand)
- Route context: Passed via router context in `src/routes/__root.tsx`

## Special Directories

**src/routes/_authed/**
- Purpose: Protected routes requiring authentication
- Pattern: Routes under `_authed/` are wrapped with auth guard (route parameter)
- Generated: No, but routeTree.gen.ts is auto-generated
- Committed: Yes

**src/lib/i18n/locales/**
- Purpose: Translation files organized by language code
- Generated: No, manually maintained
- Committed: Yes
- Structure: `locales/{en,ja}/` with JSON translation objects

**public/**
- Purpose: Static assets served directly
- Generated: Some files (manifest.json, icons) might be auto-generated
- Committed: Yes
- Contains: Manifest, favicons, PWA assets

**node_modules/**
- Purpose: Installed dependencies
- Generated: Yes, from package.json + pnpm-lock.yaml
- Committed: No (in .gitignore)

---

*Structure analysis: 2026-04-17*
