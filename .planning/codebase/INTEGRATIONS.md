# External Integrations

**Analysis Date:** 2026-04-17

## APIs & External Services

**AniList GraphQL API:**
- Service: AniList public GraphQL API (https://graphql.anilist.co)
- What it's used for: Fetching anime and manga data, character information, search results, trending media
- SDK/Client: Custom fetch-based client in `src/lib/anilist-client.ts`
- Auth: No authentication required (public API)
- Features: 
  - Exponential backoff retry logic with 3 max retries for rate-limited/server error responses
  - GraphQL request handling with custom error types
  - Base delay of 250ms + random jitter for throttling

## Data Storage

**Databases:**
- PostgreSQL (Neon Serverless)
  - Connection: Via `DATABASE_URL` environment variable
  - Client: `@neondatabase/serverless` (HTTP-based driver)
  - ORM: Drizzle ORM 0.44.7
  - Schema location: `src/db/schema.ts`
  - Migrations: Managed via drizzle-kit
  - Tables:
    - `users` - User accounts with email, password hash, display name, bio, profile image URL
    - `catalog_entities` - Cached anime/manga entries from AniList (anilistId, title, images, format)
    - `watchlist_entries` - User watchlist items with status, progress, notes, visibility settings

**File Storage:**
- Supabase Storage (S3-compatible object storage)
  - Provider: Supabase Storage via S3-compatible API
  - Use case: User profile avatar storage
  - Client: `@aws-sdk/client-s3` (connects to Supabase Storage S3 endpoint with forcePathStyle option)
  - Configuration:
    - Endpoint: `SUPABASE_S3_ENDPOINT` (e.g. https://your-project-ref.supabase.co/storage/v1/s3)
    - Public URL: `SUPABASE_STORAGE_PUBLIC_URL` (e.g. https://your-project-ref.supabase.co/storage/v1/object/public)
    - Region: `SUPABASE_S3_REGION` (default: us-east-1)
    - Bucket: `SUPABASE_STORAGE_BUCKET` (default: avatars)
    - Credentials: `SUPABASE_S3_ACCESS_KEY_ID` and `SUPABASE_S3_SECRET_ACCESS_KEY` (from Supabase dashboard → Settings → Storage → S3 Access)
    - Avatar prefix: `SUPABASE_STORAGE_AVATAR_PREFIX` (optional, leave empty to store at bucket root)
  - Implementation:
    - Avatar upload in `src/lib/storage/supabase.ts`
    - Image validation: max 256KB, image/* MIME types only
    - URL/path builder: `src/lib/storage/avatar.ts`
  - No local container needed — uses Supabase hosted storage directly

**Caching:**
- TanStack React Query 5.66.5 - Client-side server state caching
  - Configured in `src/integrations/tanstack-query/root-provider.tsx`
  - Used for API responses and watchlist data
  - DevTools available via @tanstack/react-query-devtools

## Authentication & Identity

**Auth Provider:**
- Custom session-based authentication
  - Implementation: `src/lib/auth/` directory
  - Password hashing: bcryptjs 3.0.3
  - Session storage: Encrypted cookies via `useSession()` from @tanstack/react-start
  - Session configuration in `src/lib/auth/session.ts`:
    - Cookie name: `app-session`
    - Max age: 24 hours (or 30 days with "Remember Me")
    - Settings: httpOnly, secure in production, lax SameSite
    - Password requirement: 32+ characters via `SESSION_SECRET` env var
  
**Authentication Flows:**
- Login: `src/lib/auth/login.ts` - Email/password authentication via `loginFn` server function
- Register: `src/lib/auth/register.ts` - User account creation via `registerFn` server function
- Session: `src/lib/auth/session.ts` - Cookie-based session management
- Validation: `src/lib/auth/validation.ts` - Schema validation for auth inputs
- Current user: `src/lib/auth/index.ts` - `getCurrentUserFn` server function for session lookup

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- Console-based (default browser console for client-side)
- Server-side errors logged via Nitro/TanStack Start runtime

## CI/CD & Deployment

**Hosting:**
- Not detected in codebase (application is deployment-ready via TanStack Start)

**CI Pipeline:**
- Not detected in codebase

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection string (Neon serverless)
- `SESSION_SECRET` - At least 32 characters for session cookie encryption
- `SUPABASE_S3_ENDPOINT` - Supabase Storage S3 endpoint URL
- `SUPABASE_S3_REGION` - Region (default: us-east-1)
- `SUPABASE_S3_ACCESS_KEY_ID` - Supabase S3 access key ID (from Supabase dashboard → Settings → Storage → S3 Access)
- `SUPABASE_S3_SECRET_ACCESS_KEY` - Supabase S3 secret access key
- `SUPABASE_STORAGE_BUCKET` - Storage bucket name (default: avatars)
- `SUPABASE_STORAGE_PUBLIC_URL` - Public base URL for serving files (no trailing slash, no bucket name)

**Optional env vars:**
- `NODE_ENV` - Environment mode (development/production)
- `SUPABASE_STORAGE_AVATAR_PREFIX` - Key prefix inside bucket for avatars (default: empty, stores at bucket root)

**Secrets location:**
- `.env` file (root directory, not committed to git)
- Example template: `.env.example`

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Server Functions (RPC Endpoints)

TanStack React Start provides RPC-style server functions callable from the client:

**Authentication:**
- `loginFn` (POST) - `src/lib/auth/login.ts`
- `registerFn` (POST) - `src/lib/auth/register.ts`
- `logoutFn` (POST) - `src/lib/auth/login.ts`
- `getCurrentUserFn` (GET) - `src/lib/auth/index.ts`

**User Management:**
- `updateUserFn` (POST) - `src/lib/server/user.ts` - Update profile info and avatar
- `getUserInfo` (GET) - `src/lib/server/user.ts` - Fetch user details

**Watchlist Operations:**
- `addToWatchlistFn` (POST) - `src/lib/server/watchlist.ts`
- `getWatchlistFn` (GET) - `src/lib/server/watchlist.ts`
- `updateWatchlistStatusFn` (POST) - `src/lib/server/watchlist.ts`
- `removeFromWatchlistFn` (POST) - `src/lib/server/watchlist.ts`
- `getWatchlistStatsFn` (GET) - `src/lib/server/watchlist.ts`

These functions bridge the client and server, executing database operations and file uploads within Nitro's server context.

## Internationalization (i18n)

**Framework:** i18next 25.7.4 with react-i18next

**Configuration:** `src/lib/i18n/index.ts`

**Supported Languages:**
- English (en) - default
- Japanese (ja)

**Translation Files:** `src/lib/i18n/locales/{lang}/` with namespaces:
- common.json
- nav.json
- auth.json
- home.json
- anime.json
- manga.json
- characters.json
- watchlist.json
- search.json
- errors.json
- settings.json

**Client Detection:**
- Browser language detection via `i18next-browser-languagedetector`
- Storage: localStorage key `senkou-language`
- Fallback order: localStorage → navigator language → HTML lang attribute

---

*Integration audit: 2026-04-17*
