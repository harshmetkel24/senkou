# Codebase Concerns

**Analysis Date:** 2026-04-17

## Tech Debt

**Lightweight Authentication Context:**
- Issue: `AuthContextType` contains `id`, `email`, and `displayName` fields which could be optimized for bundle size and re-render performance
- Files: `src/types/index.ts:31-34`
- Impact: Larger context object causes unnecessary re-renders in components that only need user ID or email; affects memory footprint
- Fix approach: Split context into minimal (id only) and extended (with email/displayName) variants, or use separate atoms for different data

**Route Matching Logic in Sidebar:**
- Issue: Manual string comparison with `pathname.startsWith()` for route matching instead of using router's built-in utilities
- Files: `src/components/layouts/Sidebar.tsx:105-108`
- Impact: Fragile to route structure changes; doesn't handle route parameters or nested routes correctly; duplicates router logic
- Fix approach: Use TanStack Router's `useRouterState` with proper route matching utilities or link context from `<Link>` component which already has `isActive` state

**Supabase S3 Client Caching with Global State:**
- Issue: S3Client stored in module-level `cachedClient` variable — no thread-safety guarantees if the module is ever re-evaluated
- Files: `src/lib/storage/supabase.ts:13-38`
- Impact: Benign in practice under Node.js single-thread model, but a missing credential error after first successful init would be silently swallowed
- Fix approach: Validate credentials eagerly at startup rather than lazily on first upload; throw on missing env vars at module load time

**Unvalidated Password Requirements:**
- Issue: Password validation schema only checks length (min 1, max 255) with no complexity requirements (uppercase, numbers, symbols)
- Files: `src/lib/auth/validation.ts:11-14`
- Impact: Users can set weak passwords like "a", creating security vulnerability; doesn't match typical security standards
- Fix approach: Add minimum length (e.g., 8 characters) and consider complexity requirements (mix of character types)

## Known Issues

**Database Timestamp Update Not Automated:**
- Symptoms: `updatedAt` field in catalog_entities table never updates on subsequent modifications
- Files: `src/db/schema.ts:24-27` (usersTable), `src/db/schema.ts:62-64` (catalogEntitiesTable)
- Trigger: Schema comment notes "IDEA: add trigger to update on row update" but not implemented; only defaultNow() on creation
- Workaround: Manual SQL trigger creation or application-layer update in mutation handlers

**MaxRetries Exhaustion Not Reported Separately:**
- Symptoms: Generic error message when AniList retries are exhausted, no distinction from actual API failures
- Files: `src/lib/anilist-client.ts:74-77`
- Trigger: After 3 retries of 429/5xx errors, final error message is generic "exhausted retries"
- Workaround: Add specific AniListError subclass or include retry count in error message

**Profile Avatar FileReader Not Cleaned Up:**
- Symptoms: Multiple rapid file selections could create memory leaks if reader errors not handled
- Files: `src/routes/_authed/profile.tsx:78-83`
- Trigger: FileReader.readAsDataURL() has no error handler (reader.onerror); large files could exceed memory limits
- Workaround: Current code path has 256KB limit but error case would silently fail with no user feedback

## Security Considerations

**Missing Supabase Storage Credentials Fail at Request Time:**
- Risk: `SUPABASE_S3_ACCESS_KEY_ID` / `SUPABASE_S3_SECRET_ACCESS_KEY` are only validated on the first upload attempt, not at startup
- Files: `src/lib/storage/supabase.ts:18-25`
- Current mitigation: Error is thrown and surfaces to the user on first avatar upload attempt
- Recommendations: Check for required storage env vars at server startup so misconfiguration is caught immediately on deploy

**Password Hash Algorithm Strength:**
- Risk: Using bcryptjs with default salt rounds (10 by default) - acceptable but could be configured higher
- Files: `src/lib/auth/index.ts:24` and registration flow
- Current mitigation: bcryptjs provides reasonable hashing by default
- Recommendations: Explicitly set salt rounds to 12+ in bcrypt.hash/compare calls to harden against GPU attacks

**Session Data Not Invalidated on Password Change:**
- Risk: User session remains valid after password reset, allowing account hijacking via active session
- Files: `src/lib/auth/login.ts:14-38` and `src/lib/server/user.ts` (update handler)
- Current mitigation: None visible - no session invalidation in update flows
- Recommendations: Implement session invalidation on password/email changes; force re-authentication

**Validation Schemas Missing Sanitization:**
- Risk: User-provided strings trimmed but no XSS protection for displayName, bio fields that appear in UI
- Files: `src/lib/auth/validation.ts:16-20` and watchlist schema `src/lib/server/watchlist.ts:30-35`
- Current mitigation: React's default JSX escaping, but no explicit sanitization
- Recommendations: Add DOMPurify or similar for rich content fields (bio, notes); verify React version has proper escaping

## Performance Bottlenecks

**Large Component Files Approaching Complexity Limits:**
- Problem: search.tsx (675 lines), search-bar.tsx (588 lines), watchlist-shelf.tsx (533 lines) make refactoring difficult
- Files: `src/routes/search.tsx`, `src/components/ui/search-bar.tsx`, `src/components/watchlist/watchlist-shelf.tsx`
- Cause: Mixed concerns (state management, UI, query logic) in single files; heavy use of closures and callbacks
- Improvement path: Extract query option factories into separate files; create custom hooks for state management (useSearchFilters, useWatchlistUI); split into presentational and container components

**Search Autocomplete Fetches All Categories:**
- Problem: fetchSearchAutocomplete likely queries anime, manga, and characters simultaneously for every keystroke
- Files: `src/lib/search-autocomplete.ts:137` (Promise.all), `src/components/ui/search-bar.tsx` (debouncedSearchQuery triggers)
- Cause: No scoping to selected categories; full 3-category search even when user has filtered scope
- Improvement path: Add scope parameter to fetchSearchAutocomplete; only query selected categories; implement request deduplication

**Image URL Validation at Multiple Layers:**
- Problem: Cover/banner image URLs stored without validation, loaded in <Image /> components with potential 404s
- Files: `src/db/schema.ts:60-61` and all media routes that use coverImage/bannerImage
- Cause: AniList API provides URLs that may become stale; no fallback mechanism except default logo
- Improvement path: Implement image validation middleware; cache image existence checks; use srcset with fallbacks; lazy load banner images

## Fragile Areas

**Watchlist Entry Duplicate Detection Logic:**
- Files: `src/lib/server/watchlist.ts:94-131`
- Why fragile: Race condition between onConflictDoNothing() and subsequent findFirst() query - if another request creates same entry, findFirst() still succeeds but doesn't match inserted entry. Multiple requests for same (userId, entityId) could create orphaned entities
- Safe modification: Wrap entire add-to-watchlist in transaction; return 409 Conflict if entry exists instead of silently returning existing entry
- Test coverage: No integration tests for concurrent watchlist additions

**DateTimeFormat Locale Fallback:**
- Files: `src/routes/_authed/profile.tsx:48-52` (formatJoinedSince function)
- Why fragile: Uses `new Intl.DateTimeFormat(undefined, ...)` which relies on browser default locale; inconsistent display across regions
- Safe modification: Pass explicit locale from i18n system instead of undefined; test with multiple browser locales
- Test coverage: No tests for date formatting across different locales

**Error Boundary Fallback Without Context:**
- Files: `src/components/helpers/RouteErrorBoundary.tsx:26-32`
- Why fragile: reset() function check only verifies "typeof === function" but doesn't verify it actually resets route state; calling on wrong route context could cause unexpected behavior
- Safe modification: Add explicit route context validation; log which route boundary caught error for debugging
- Test coverage: No error boundary tests

## Scaling Limits

**Database Connection Pool Not Configured:**
- Current capacity: Single Neon HTTP connection, no connection pooling configured
- Limit: Will hit concurrent request limits during traffic spikes; no retry/backoff for connection exhaustion
- Files: `src/db/index.ts:8-9`
- Scaling path: Configure Neon connection pool settings; implement exponential backoff in server functions; add queue for database operations

**Carousel Not Paginated:**
- Current capacity: Renders all watchlist items in single carousel, no virtualization
- Limit: Performance degrades with >30-50 watchlist items due to DOM size
- Files: `src/components/watchlist/watchlist-shelf.tsx:147-149` (comment notes "IDEA: paginate this carousel")
- Scaling path: Implement pagination with page size 10-15; use embla-carousel pagination or split into multiple carousels; implement infinite scroll if using carousel

**Search Results No Pagination in Overview:**
- Current capacity: OVERVIEW_PAGE_SIZE = 6 items per category hardcoded
- Limit: Cannot show more results without navigating to category-specific pages
- Files: `src/routes/search.tsx:42`
- Scaling path: Add pagination controls to overview; implement cursor-based pagination for search results

## Dependencies at Risk

**AWS SDK V3 with Breaking Minor Updates:**
- Risk: @aws-sdk/client-s3 ^3.966.0 uses caret versioning allowing 3.x updates; SDK v4 incompatible
- Impact: Future npm updates could break Supabase Storage uploads if breaking changes in HTTP client layer
- Files: `package.json:17`, `src/lib/storage/supabase.ts`
- Migration plan: Lock to v3 with tilde (~3.966.0) until v4 migration tested; verify Supabase S3 compatibility before upgrading

**Babel Plugin React Compiler Pre-release:**
- Risk: babel-plugin-react-compiler ^1.0.0 is pre-release (not 1.0.0+); could have breaking changes
- Impact: Future builds could fail silently or produce unexpected component optimization
- Files: `package.json:67`
- Migration plan: Pin to exact version (1.0.0) until stable release; monitor React compiler changelog for breaking changes

**Drizzle ORM at 0.44.7:**
- Risk: Pre-1.0 version (0.44.7); migrations and schema changes could have breaking behavior
- Impact: schema migrations might require manual intervention in future updates
- Files: `package.json:41`, `src/db/schema.ts`, `src/db/index.ts`
- Migration plan: Set up comprehensive integration tests before any minor version updates; review CHANGELOG for breaking changes

## Test Coverage Gaps

**No Authentication Tests:**
- What's not tested: Login success/failure paths, password validation, session creation, logout
- Files: `src/lib/auth/login.ts`, `src/lib/auth/register.ts`, `src/lib/auth/index.ts`
- Risk: Login/logout could silently fail without detection; SQL injection or auth bypass could ship unnoticed
- Priority: **High** - authentication is security-critical

**No Server Function Tests:**
- What's not tested: Server-side mutations (addToWatchlistFn, updateWatchlistStatusFn, removeWatchlistFn, updateUserFn)
- Files: `src/lib/server/watchlist.ts`, `src/lib/server/user.ts`
- Risk: Database constraints, race conditions, or permission checks could be broken by refactoring
- Priority: **High** - data mutations directly affect user data

**No Integration Tests for Search:**
- What's not tested: Search query flow from input → autocomplete → result categories → detail panels
- Files: `src/routes/search.tsx`, `src/lib/search-autocomplete.ts`, query functions
- Risk: Search could break due to API changes or state management issues with no detection
- Priority: **Medium** - core feature but not security-critical

**No Component Snapshot or UI Tests:**
- What's not tested: Carousel rendering, responsive layout, error state UI, loading skeleton visibility
- Files: All components in `src/components/`
- Risk: Visual regressions, accessibility issues, broken responsive design ship unnoticed
- Priority: **Medium** - affects user experience but not core functionality

**No AniList Client Retry Logic Tests:**
- What's not tested: Retry behavior for 429/5xx, exponential backoff, final failure after MAX_RETRIES
- Files: `src/lib/anilist-client.ts`
- Risk: Rate limiting behavior could be broken; unexpected errors from external API could propagate uncaught
- Priority: **Low** - edge case but affects reliability during high load

**No Concurrent Request Tests:**
- What's not tested: Multiple simultaneous watchlist additions, profile updates, file uploads
- Files: All server functions and mutation hooks
- Risk: Race conditions in database operations could corrupt user data
- Priority: **High** - data integrity risk

---

*Concerns audit: 2026-04-17*
