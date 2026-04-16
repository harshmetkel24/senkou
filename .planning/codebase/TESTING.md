# Testing Patterns

**Analysis Date:** 2026-04-17

## Test Framework

**Status:** No active test framework configured

**Framework:**
- `vitest` ^3.0.5 is installed as devDependency in `package.json`
- No `vitest.config.ts` or `vitest.config.js` found
- No test files (`.test.*`, `.spec.*`) exist in the codebase

**Run Commands:**
```bash
npm run test      # Runs: vitest run
```

**Test Dependencies:**
- `@testing-library/react` ^16.2.0 - React component testing utilities
- `@testing-library/dom` ^10.4.0 - DOM testing utilities
- `jsdom` ^27.0.0 - DOM implementation for Node.js

## Test File Organization

**Current State:**
- No test files exist in the project
- Recommended location (based on standard conventions): co-located with source files or dedicated `tests/` directory

**Proposed Pattern:**
```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── button.test.tsx
│   └── characters/
│       ├── character-card.tsx
│       └── character-card.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
└── lib/
    ├── utils.ts
    └── utils.test.ts
```

**Naming Convention (when tests are added):**
- Test files: `<module>.test.ts` or `<module>.test.tsx` format
- Co-locate tests with source files for easier discovery

## Test Structure

**Proposed Setup:**
Since no tests exist, recommendations based on available testing libraries:

**Unit Test Pattern (for utilities):**
```typescript
import { describe, it, expect } from 'vitest';
import { deriveRelatedResults } from '@/lib/search-helpers';

describe('search-helpers', () => {
  it('should return visible results within limit', () => {
    const items = [{ id: 1, title: 'Test' }];
    const result = deriveRelatedResults(
      items,
      'test',
      (item) => [item.title]
    );
    expect(result.visible).toHaveLength(1);
  });
});
```

**Component Test Pattern (with React Testing Library):**
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

**Hook Test Pattern:**
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth', () => {
  it('should throw error when not in __root__ route', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within __root__ route only'
    );
  });
});
```

## Mocking

**Framework:** Vitest has built-in mocking support (`vi` module)

**Patterns to establish:**
- Mock external API calls (fetch, AniList GraphQL)
- Mock localStorage/sessionStorage for state management
- Mock server functions created with `@tanstack/react-start`
- Mock TanStack Query for hooks

**What to Mock:**
- External API calls (e.g., `fetchAniList`, AniList GraphQL endpoint)
- Server functions (e.g., `loginFn`, `addToWatchlistFn`)
- TanStack Query mutations and queries
- localStorage/sessionStorage
- External services (MinIO, S3)

**What NOT to Mock:**
- Internal utility functions (should be tested directly)
- Type definitions
- Pure components (minimal mocking needed)
- Helper functions like `cn()`, `deriveRelatedResults()`

## Fixtures and Test Data

**Recommended Pattern:**
Create fixture files in `src/__tests__/fixtures/` or `src/testing/`:

```typescript
// src/testing/fixtures/users.ts
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  displayName: 'Test User',
  profileImg: null,
  experienceLevel: 'BEGINNER',
  bio: null,
  createdAt: new Date(),
  passwordHash: 'hashed',
};

// src/testing/fixtures/watchlist.ts
export const mockWatchlistEntry = {
  id: 1,
  userId: 1,
  anilistId: 12345,
  kind: 'ANIME',
  status: 'PLANNING',
  progress: 0,
};
```

**Where Fixtures Live:**
- Central location: `src/testing/fixtures/` or `src/__tests__/fixtures/`
- Import in test files as needed
- Keep organized by domain (users, watchlist, media, etc.)

## Coverage

**Requirements:** No coverage configuration found in project

**Recommended Setup:**
- Target: 80% coverage for critical paths (auth, data mutations)
- Lower requirements for UI components (60%)
- View coverage with: `npm run test -- --coverage`

## Test Types

**Unit Tests:**
- Scope: Individual functions and utilities
- Approach: Test pure functions directly (no mocks)
- Examples: `cn()`, `deriveRelatedResults()`, validation schemas
- Expected: Fast, isolated, high coverage

**Integration Tests:**
- Scope: Multiple units working together (components + hooks, utils + API)
- Approach: Mock external services, test real interactions
- Examples: `useWatchlistAdd` hook behavior, auth flow
- Expected: Medium speed, realistic scenarios

**E2E Tests:**
- Status: Not implemented
- Framework: Not configured
- Recommendation: Consider Playwright or Cypress for future implementation

## Common Patterns

**Async Testing:**
```typescript
// Use async/await in test functions
it('should fetch user data', async () => {
  const result = await getUserById(1);
  expect(result).toBeDefined();
  expect(result?.email).toBe('test@example.com');
});
```

**Error Testing:**
From codebase patterns, errors are thrown and caught:
```typescript
// Test error handling in try-catch blocks
it('should throw error on invalid input', () => {
  expect(() => {
    throw new Error('Invalid input');
  }).toThrow('Invalid input');
});

// Test async errors
it('should catch async errors', async () => {
  await expect(getUserById(-1)).rejects.toThrow();
});
```

**Server Function Testing:**
```typescript
// Mock createServerFn behavior
it('should validate input before handler', async () => {
  // Create mock server function
  const mockFn = vitest.fn().mockResolvedValue({ success: true });
  
  // Test validation
  expect(() => loginFn({ email: 'invalid', password: '' })).toThrow();
});
```

## Testing Checklist for Common Code Patterns

**Utility Functions:**
- ✓ Test with valid inputs
- ✓ Test with edge cases (empty arrays, null, undefined)
- ✓ Test with invalid inputs

**Components:**
- ✓ Render without crashing
- ✓ Accept and render props correctly
- ✓ Handle user interactions (clicks, form submissions)
- ✓ Display conditional content based on props

**Hooks:**
- ✓ Return expected values
- ✓ Update state correctly
- ✓ Handle errors gracefully
- ✓ Clean up on unmount

**Server Functions:**
- ✓ Validate input schema
- ✓ Handle successful responses
- ✓ Throw on errors with appropriate messages
- ✓ Update session/state correctly

**API Calls:**
- ✓ Mock fetch/GraphQL endpoints
- ✓ Test success and error paths
- ✓ Test retry logic (exponential backoff in `fetchAniList`)
- ✓ Test rate limiting handling

## Setting Up Tests (When Ready)

**Initial Configuration:**
```bash
# Create vitest config if starting tests
npm install --save-dev @testing-library/user-event

# Create test structure
mkdir -p src/__tests__/fixtures
mkdir -p src/__tests__/mocks
```

**Create `vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testing/setup.ts',
  },
});
```

**Create `src/testing/setup.ts`:**
```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => cleanup());

// Mock fetch globally
global.fetch = vi.fn();
```

---

*Testing analysis: 2026-04-17*
