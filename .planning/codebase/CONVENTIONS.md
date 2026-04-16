# Coding Conventions

**Analysis Date:** 2026-04-17

## Naming Patterns

**Files:**
- Components: lowercase with hyphens (e.g., `character-card.tsx`, `media-detail-panel.tsx`)
- Utilities/helpers: lowercase with hyphens (e.g., `search-helpers.ts`, `search-autocomplete.ts`)
- Hooks: camelCase prefixed with `use` (e.g., `useAuth.ts`, `use-watchlist-add.ts`)
- Constants: lowercase with hyphens (e.g., `experience-levels.ts`, `search.ts`)
- Server functions: camelCase with `Fn` suffix (e.g., `loginFn`, `addToWatchlistFn`)

**Functions:**
- React components (exported): PascalCase (e.g., `function SearchPlusUltraPanel()`, `function CharacterCard()`)
- Custom hooks: camelCase with `use` prefix (e.g., `useAuth`, `useWatchlistAdd`)
- Helper functions: camelCase (e.g., `findExistingEntry`, `handleAddToWatchlist`)
- Server functions: camelCase with `Fn` suffix (e.g., `getUserById`, `updateUserFn`)
- Private component functions: camelCase (e.g., `deriveRelatedResults`)

**Variables:**
- Constants: UPPER_SNAKE_CASE for truly immutable module-level constants (e.g., `MAX_RETRIES`, `BASE_DELAY_MS`, `ANILIST_GRAPHQL_ENDPOINT`)
- Regular variables: camelCase (e.g., `isRateLimited`, `nextProfileImg`, `activeEntry`)
- Boolean variables: prefix with `is`, `has`, or verb (e.g., `isOpen`, `hasValue`, `collapsed`)

**Types:**
- Type definitions: PascalCase (e.g., `User`, `SessionData`, `AuthContextType`)
- Type aliases: PascalCase (e.g., `LoginInput`, `MediaDetailData`, `SearchPlusUltraPanelProps`)
- Optional type utility: `Props` suffix for component props (e.g., `CharacterCardProps`, `MediaDetailPanelProps`)
- Partial/pick types: descriptive naming (e.g., `UserInfo`, `UserWithoutSensitiveInfo`, `RemoveWatchlistPayload`)

## Code Style

**Formatting:**
- No explicit formatter config detected (Prettier not found in repo config)
- Consistent 2-space indentation throughout codebase
- Line length: no strict enforcer detected, but most lines reasonable (~90-100 chars)
- Semicolons: used consistently throughout

**Linting:**
- TypeScript strict mode enabled in `tsconfig.json`
- Compiler options enforce:
  - `noUnusedLocals: true` - unused variables not allowed
  - `noUnusedParameters: true` - unused function parameters not allowed
  - `noFallthroughCasesInSwitch: true` - switch fallthrough prevented
  - `noUncheckedSideEffectImports: true` - side effects must be explicit
- No ESLint config found; relies on TypeScript strict checking

**Code Patterns:**
- Spread operator used for props forwarding (e.g., `{...props}`, `{...rqContext}`)
- Type extraction from schema using infer: `typeof usersTable.$inferSelect`
- Optional chaining and nullish coalescing heavily used (e.g., `data?.id`, `options?.limit ?? 6`)

## Import Organization

**Order:**
1. External libraries (`react`, `lucide-react`, `@tanstack/*`, etc.)
2. Type imports from external libraries (`import type { ... } from`)
3. Internal absolute imports (`import { ... } from "@/..."`)
4. Internal type imports (`import type { ... } from "@/"`)
5. Relative imports (same directory, less common)

**Path Aliases:**
- `@/*` → `./src/*` (defined in `tsconfig.json`)
- Used throughout for absolute imports from src directory

**Example from `use-watchlist-add.ts`:**
```typescript
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import type { MediaDetailData } from "@/components/media/media-detail-panel";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
```

**Named exports preferred:**
- Barrel files use individual exports, not re-exports
- Components export with explicit `export` keyword (e.g., `export { Input }`, `export { Button, buttonVariants }`)

## Error Handling

**Patterns:**
- Try-catch blocks for async operations and error-prone code (e.g., in `login.ts`, `user.ts`)
- Custom error classes: `AniListError extends Error` in `anilist-client.ts` for specialized errors
- Instance checks: `error instanceof Error` to safely extract message
- Fallback messages: always provide user-friendly fallback if error message unavailable

**Example from `anilist-client.ts`:**
```typescript
export class AniListError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AniListError";
    this.status = status;
  }
}

if (!response.ok) {
  if ((isRateLimited || isServerError) && attempt < MAX_RETRIES) {
    const jitter = Math.random() * 100;
    await sleep(BASE_DELAY_MS * 2 ** attempt + jitter);
    continue;
  }
  throw new AniListError(...);
}
```

**Error propagation:**
- Errors logged with `console.error()` before rethrowing (provides context for debugging)
- User-facing errors wrapped with toast notifications using `toast.error()`
- Network errors retried with exponential backoff (e.g., rate limits, server errors)

## Logging

**Framework:** `console` methods (no logging library)

**Patterns:**
- `console.error()` for errors: always used in catch blocks (e.g., `console.error("Error updating user:", error)`)
- `console.warn()` for warnings: rare, used for unrecoverable but non-fatal issues
- `console.log()` for debug info: minimal, mostly in PWA initialization

**Conventions:**
- Error logs include context prefix (e.g., `"[PWA] Service worker registration failed"`)
- Avoid logging sensitive data (passwords, tokens, etc.)
- Error context provided alongside error object for debugging

## Comments

**When to Comment:**
- FIXME comments used to mark known limitations needing improvement
- No JSDoc/TSDoc comments found in codebase
- Comments sparse - code is self-documenting through type annotations and clear naming

**Examples:**
- `// FIXME: make this object as Light weight as possible. We may remove email, displayName also from this context` (types/index.ts)
- `// FIXME: should use route matching here to find active route` (components/layouts/Sidebar.tsx)

## Function Design

**Size:**
- Functions keep single responsibility: `deriveRelatedResults()` handles one search algorithm
- Longer functions (30-100 lines) break into smaller helper functions or use clear phases
- Server functions are larger due to transaction logic but maintain readable structure

**Parameters:**
- Props typically passed as single object parameter for components (destructured)
- Utility functions accept parameters individually when count is small (<3)
- Options object pattern used for optional/many parameters (e.g., `Options` type in `search-helpers.ts`)

**Return Values:**
- Functions return objects with clear properties: `{ visible, suggestions }`, `{ success, user }`
- Always return both success and error states explicitly (no magic undefined returns)
- Server mutations return: `{ success: true, data }` on success, throw on error

## Module Design

**Exports:**
- Named exports preferred over default exports (except UI components from Radix)
- Component exports are explicit: `export { Input }`, `export { Button, buttonVariants }`
- Helper functions exported as named exports

**Barrel Files:**
- Used in `types/index.ts` to centralize type exports
- Pattern: individual named imports and re-exports
- Not used extensively - most modules import directly from source

**Example from `types/index.ts`:**
```typescript
import { usersTable, type catalogEntitiesTable, type watchlistEntriesTable } from "@/db/schema";

export type User = typeof usersTable.$inferSelect;
export type SessionData = { userId: User["id"]; email: User["email"] };
```

## Type Annotations

**Inferred types from database:**
- Use `typeof table.$inferSelect` for select queries
- Use `typeof table.$inferInsert` for insert operations
- Allows types to stay in sync with schema automatically

**Component props:**
- Define `Props` type above component for readability
- Use intersection types for extending native props: `React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>`

**Generic typing:**
- Server functions use generic type parameters for data/variables
- Utility functions use generics for reusability (e.g., `deriveRelatedResults<T>`)

---

*Convention analysis: 2026-04-17*
