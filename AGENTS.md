# Repository Guidelines

## Project Structure & Module Organization
- App code lives in `src/` with feature folders:
  - `src/routes/` (TanStack Router routes), `src/components/`, `src/lib/`, `src/data/`.
- Static assets are in `public/` (served as-is). Build output goes to `.output/` and `dist/`.
- Config files: `vite.config.ts`, `tsconfig.json`, `components.json`.
- Generated files like `src/routeTree.gen.ts` should not be edited directly.

## Build, Test, and Development Commands
- `pnpm dev` — start Vite dev server on `http://localhost:3000`.
- `pnpm build` — production build via Vite.
- `pnpm serve` — preview the built app locally.
- `pnpm test` — run unit tests with Vitest in CI mode.

## Coding Style & Naming Conventions
- Language: TypeScript + React 19. Use functional components and hooks.
- Indentation: 2 spaces. Filenames are `kebab-case.tsx` for components and `kebab-case.ts` for utilities.
- Components: export a default UI component; colocate small helpers next to usage.
- Imports: prefer absolute paths resolved by `tsconfig` (e.g., `import { Button } from "src/components/button"`).
- Styling: Tailwind CSS (v4). Keep class lists readable; extract variants with `class-variance-authority` where helpful.
- Lint/format: use Prettier defaults (run your editor integration before committing).

## Testing Guidelines
- Framework: Vitest with `@testing-library/react` and `jsdom`.
- Place tests adjacent to code as `*.test.ts(x)` (e.g., `button.test.tsx`).
- Aim for meaningful unit tests of components, hooks, and route loaders. Prefer queries by role/text.
- Run `pnpm test` locally; keep tests deterministic and DOM-focused.

## Commit & Pull Request Guidelines
- Commits: concise imperative subject (max ~72 chars). Example: `feat(routes): add dashboard loader`.
- Scope changes narrowly; commit generated files only if necessary.
- PRs must include: summary, screenshots for UI changes, steps to test, and linked issues.
- Ensure `pnpm build` and `pnpm test` pass; mention any follow-ups.

## Security & Configuration Tips
- Do not commit secrets. Use environment variables and local `.env` files ignored by Git.
- Validate route loader inputs and sanitize any user-provided data before rendering.
