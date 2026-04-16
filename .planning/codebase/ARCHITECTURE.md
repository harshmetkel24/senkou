# Architecture

**Analysis Date:** 2026-04-17

## Pattern Overview

**Overall:** Full-stack React with TanStack ecosystem (Router, Query, React Start) + PostgreSQL backend with Drizzle ORM

**Key Characteristics:**
- Server-Driven Rendering (SSR) powered by TanStack React Start with Nitro
- Client-side state management via TanStack Query + Zustand
- File-based routing with TanStack Router
- GraphQL proxying to AniList API
- Multi-user authentication with session management
- Watchlist/catalog entity management with PostgreSQL persistence
- File storage via MinIO S3-compatible API
- i18n support (English/Japanese)

## Layers

**Presentation (Components):**
- Purpose: React components rendering UI, handling user interactions
- Location: `src/components/`
- Contains: 
  - UI primitives (`components/ui/`) - Radix UI + Tailwind based components
  - Feature components (`components/characters/`, `components/media/`, `components/watchlist/`)
  - Layout components (`components/layouts/`)
  - Helper components (`components/helpers/`)
  - Search UI (`components/search/`)
  - Context providers (`components/contexts/`)
- Depends on: React Router, React Query hooks, Zustand stores, type definitions
- Used by: Route handlers in `src/routes/`

**Route/Page Layer:**
- Purpose: TanStack Router file-based routes defining page structure and data loading
- Location: `src/routes/`
- Contains:
  - Root layout (`__root.tsx`) - app shell with auth loader, devtools, layout wrapper
  - Auth routes (`login.tsx`, `register.tsx`)
  - Protected routes (`_authed/profile.tsx`)
  - Feature pages (`index.tsx`, `characters.tsx`, `anime.tsx`, `manga.tsx`, `search.tsx`)
- Depends on: Components, server functions, query hooks, auth context
- Used by: Router initialization in `router.tsx`

**Server Functions Layer:**
- Purpose: Backend logic executed server-side, called from client via TanStack React Start
- Location: `src/lib/server/`, `src/lib/auth/`
- Contains:
  - Auth handlers (`lib/auth/login.ts`, `lib/auth/register.ts`)
  - User management (`lib/server/user.ts` - updateUserFn, getUserInfo)
  - Watchlist operations (`lib/server/watchlist.ts` - add/remove/status updates)
  - Session management (`lib/auth/session.ts`)
- Depends on: Database client, Drizzle ORM, bcryptjs for password hashing
- Used by: Route loaders and client components via `useServerFn`

**Data Access Layer:**
- Purpose: Queries to external AniList API and internal data fetching
- Location: `src/data/queries/`
- Contains: GraphQL queries for anime, manga, characters with pagination support
- Depends on: AniList client (`lib/anilist-client.ts`)
- Used by: TanStack Query hooks in route loaders and components

**External API Integration:**
- Purpose: Communicate with AniList GraphQL API with retry logic
- Location: `src/lib/anilist-client.ts`
- Contains: Configurable GraphQL request handler with exponential backoff
- Depends on: Fetch API, custom error handling
- Used by: All data query functions

**Database Layer:**
- Purpose: ORM and schema definitions
- Location: `src/db/`
- Contains: 
  - `index.ts` - Drizzle instance with Neon PostgreSQL client
  - `schema.ts` - Table definitions (users, catalogEntities, watchlistEntries)
- Depends on: Drizzle ORM, Neon serverless Postgres driver
- Used by: Server functions for CRUD operations

**Storage Layer:**
- Purpose: File uploads and avatar management via MinIO
- Location: `src/lib/storage/`
- Contains:
  - `minio.ts` - S3 client setup, image validation, bucket management
  - `avatar.ts` - Avatar URL resolution and public URL construction
- Depends on: AWS SDK S3 client, Node.js path utilities
- Used by: User profile update handlers

**State Management:**
- Purpose: Client-side state for UI and auth context
- Location: `src/lib/stores/` (Zustand), router context
- Contains:
  - Sidebar state (`sidebar.ts`) - collapsed, mobile open, search focus
  - Query client (TanStack Query) - data fetching and caching
  - Auth context - passed via router context from root loader
- Used by: Components, hooks

**Hooks & Utilities:**
- Purpose: Custom React hooks and helper functions
- Location: `src/hooks/`, `src/lib/`
- Contains:
  - `useAuth()` - access auth context from __root loader
  - `use-watchlist-add()` - mutation for adding to watchlist
  - `use-watchlist-remove()` - mutation for removing from watchlist
  - `use-watchlist-status()` - mutation for updating status
  - `use-spotlight-deck()` - carousel deck management
  - Utility functions for search, watchlist helpers
- Used by: Components and routes

**Type System:**
- Purpose: TypeScript type definitions inferred from database and API contracts
- Location: `src/types/index.ts`
- Contains: User, UserInfo, AuthContextType, WatchlistEntry, WatchlistEntity, AddWatchlistInput types
- Used by: All layers

**Internationalization:**
- Purpose: Multi-language support
- Location: `src/lib/i18n/`
- Contains: i18next config, locale files (English/Japanese)
- Used by: Components via `useTranslation` hook

## Data Flow

**Authentication Flow:**

1. User lands on app → `__root.tsx` loader calls `getCurrentUserFn`
2. `getCurrentUserFn` (server function) → reads session → queries user from DB
3. Auth context passed to router context: `{ user: AuthContextType }`
4. Components access user via `useAuth()` hook → returns `{ user }`
5. Protected routes in `_authed/` guard access based on user context

**Login/Register Flow:**

1. User submits form on `/login` or `/register` route
2. Component calls `loginFn`/`registerFn` (server functions) via `useServerFn`
3. Server validates input with Zod schemas
4. Password hashed with bcryptjs, user inserted/verified in DB
5. Session created/updated via `useAppSession`
6. Mutation success navigates to `/` (home)

**Watchlist Management Flow:**

1. User clicks "Add to Watchlist" on media detail panel
2. Component mutation calls `addToWatchlistFn` server function
3. Server validates auth (session must exist)
4. Catalog entity inserted/updated (AniList ID + metadata)
5. Watchlist entry created linking user → entity with status/visibility
6. Query cache invalidated, UI updates with new state
7. Status updates use `updateWatchlistStatusFn` following same pattern

**Data Fetching Flow:**

1. Route loaders call `queryClient.ensureQueryData(queryOptions)`
2. Query options define `queryKey` and `queryFn` (calls data query function)
3. Data query function (e.g., `fetchTrendingAnime`) calls `fetchAniList()`
4. GraphQL request sent to AniList with pagination/filters
5. Response cached by TanStack Query with `staleTime` configuration
6. Component uses `useSuspenseQuery` or `useQuery` to access cached data
7. Route suspense boundary handles loading state
8. Pagination/infinite scroll triggers new queries with different `queryKey`

**Avatar Upload Flow:**

1. User selects file on profile page
2. File converted to base64 data URL
3. Component passes data URL to `updateUserFn` server function
4. Server validates file size (<256KB) and format (image/*)
5. MinIO client ensures bucket exists, uploads file
6. Avatar URL stored in users table as absolute URL
7. `resolveProfileImageUrl` builds public URL if needed on retrieval

## Key Abstractions

**Server Function Pattern:**
- Purpose: Type-safe RPC between client and server
- Examples: `loginFn`, `updateUserFn`, `addToWatchlistFn`
- Pattern: `createServerFn` with input validator (Zod) → handler
- Benefits: Server-side execution, automatic serialization, input validation

**Query Options:**
- Purpose: Cacheable, reusable data fetching configuration
- Examples: `trendingAnimeQueryOptions()`, `characterSearchQueryOptions()`
- Pattern: Function returning `{ queryKey, queryFn, staleTime, placeholderData }`
- Benefits: Consistent cache keys, placeholder data for optimistic updates

**Route Loaders:**
- Purpose: Pre-fetch data before route renders
- Pattern: Loader functions called by TanStack Router before component renders
- Benefits: Prevents waterfalls, enables suspense boundaries

**Component-Level Mutations:**
- Purpose: Client-initiated mutations with loading/error states
- Examples: Login form, watchlist actions, profile update
- Pattern: `useMutation` wrapping server function, with `onSuccess`/`onError`
- Benefits: Optimistic updates, toast notifications, error handling

## Entry Points

**Application Entry:**
- Location: `src/router.tsx`
- Triggers: Application startup
- Responsibilities: Creates TanStack Router instance with SSR integration, context setup

**Root Route:**
- Location: `src/routes/__root.tsx`
- Triggers: Every page navigation
- Responsibilities: 
  - Load current user via `getCurrentUserFn`
  - Render layout (header, sidebar, footer)
  - Setup devtools
  - Register service worker for PWA
  - Handle theme/language setup

**Page Routes:**
- Location: `src/routes/*.tsx`
- Triggers: User navigation
- Responsibilities: 
  - Define page-specific loaders for data
  - Render page component
  - Define error boundaries
  - Setup route-specific query context

## Error Handling

**Strategy:** Layered error handling with fallback boundaries

**Patterns:**

- **Server Function Errors:** Caught in try/catch, thrown to client, caught by mutation error handler
- **Query Errors:** Handled by query hook, optionally in error boundary
- **Route Errors:** Caught by `errorComponent` defined on route
- **Fallback:** Root route `defaultErrorComponent: RouteErrorBoundary`

**Error Presentation:**
- Unexpected errors → toast notifications with friendly message
- Form validation errors → inline field-level feedback via Zod schemas
- Network errors → retry logic in AniList client (exponential backoff)
- Auth errors → redirect to login, clear session

## Cross-Cutting Concerns

**Logging:** `console.error()` used in server functions and client error handlers. No centralized logging service configured.

**Validation:** 
- Client-side: Zod schemas (login, register, watchlist inputs)
- Server-side: Zod parsing in `.inputValidator()` of server functions
- Example: `emailSchema`, `passwordSchema` in `lib/auth/validation.ts`

**Authentication:** 
- Session-based with cookies managed by TanStack React Start
- User context passed through router loader → available via `useAuth()` hook
- Protected routes check `user` existence in context

**Authorization:** 
- Server-side checks in mutations (verify userId matches session)
- Example: `data.id !== session.data.userId` throws error in updateUserFn

**Internationalization:**
- i18next with browser language detection
- Translation files in `src/lib/i18n/locales/{ja,en}/`
- Used via `useTranslation()` hook in components

---

*Architecture analysis: 2026-04-17*
