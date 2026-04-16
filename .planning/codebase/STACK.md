# Technology Stack

**Analysis Date:** 2026-04-17

## Languages

**Primary:**
- TypeScript 5.7.2 - All application code, server functions, and configuration

**Secondary:**
- JavaScript (via JSX/TSX) - React component syntax

## Runtime

**Environment:**
- Node.js (latest compatible versions, no explicit version lock)

**Package Manager:**
- pnpm (inferred from pnpm-lock.yaml presence)
- Lockfile: `pnpm-lock.yaml` (present)

## Frameworks

**Core:**
- React 19.2.0 - UI framework
- TanStack React Start 1.132.0 - Full-stack framework for SSR and RPC server functions
- TanStack React Router 1.132.0 - Client-side routing and navigation
- TanStack Router Plugin 1.132.0 - Vite plugin for automatic route generation
- Nitro v2 (via @tanstack/nitro-v2-vite-plugin 1.132.31) - Backend HTTP server runtime

**State Management:**
- Zustand 5.0.8 - Lightweight client-side state management
- TanStack React Query 5.66.5 - Server state and caching

**Styling:**
- Tailwind CSS 4.0.6 - Utility-first CSS framework
- @tailwindcss/vite 4.0.6 - Vite integration for Tailwind
- Class Variance Authority 0.7.1 - Component variant management
- Tailwind Merge 3.0.2 - Utility class deduplication

**UI Components:**
- @radix-ui/* - Unstyled, accessible component primitives (dialog, dropdown-menu, label, slot, tabs)
- Lucide React 0.544.0 - Icon library
- Embla Carousel 8.6.0 - Carousel/slider component

**Build/Dev:**
- Vite 7.1.7 - Build tool and dev server
- @vitejs/plugin-react 5.0.4 - React plugin for Vite
- Babel Plugin React Compiler 1.0.0 - Experimental React compiler for performance
- vite-tsconfig-paths 5.1.4 - TypeScript path alias support in Vite

**Testing:**
- Vitest 3.0.5 - Fast unit test runner (TypeScript native)
- @testing-library/react 16.2.0 - React testing utilities
- @testing-library/dom 10.4.0 - DOM testing utilities
- jsdom 27.0.0 - DOM implementation for Node.js tests

## Key Dependencies

**Critical:**
- @tanstack/react-start - Server-side rendering and RPC server functions
- drizzle-orm 0.44.7 - TypeScript ORM for database access
- @neondatabase/serverless 1.0.2 - Neon PostgreSQL serverless driver
- @aws-sdk/client-s3 3.966.0 - AWS S3 and MinIO-compatible file storage client

**Authentication & Validation:**
- bcryptjs 3.0.3 - Password hashing
- zod 3.25.76 - TypeScript-first schema validation
- @tanstack/zod-adapter 1.140.0 - Zod integration with TanStack Router

**Internationalization:**
- i18next 25.7.4 - Translation management framework
- react-i18next 16.5.1 - React bindings for i18next
- i18next-browser-languagedetector 8.2.0 - Client-side language detection

**Utilities:**
- lodash 4.17.21 - Utility functions
- clsx 2.1.1 - Conditional className builder
- dotenv 17.2.3 - Environment variable loading
- sonner 2.0.7 - Toast notification component
- @unpic/react 1.0.1 - Responsive image component

**Development Tools:**
- tsx 4.20.6 - TypeScript execution and bundling
- @types/node 22.10.2 - Node.js type definitions
- @types/react 19.2.0 - React type definitions
- @types/react-dom 19.2.0 - React DOM type definitions
- @types/lodash 4.17.20 - Lodash type definitions
- web-vitals 5.1.0 - Core Web Vitals measurement

**Database Tooling:**
- drizzle-kit 0.31.7 - Schema migrations and studio

**DevTools:**
- @tanstack/react-devtools 0.7.0 - TanStack React debugging tools
- @tanstack/react-query-devtools 5.84.2 - React Query inspection
- @tanstack/react-router-devtools 1.132.0 - Router debugging

## Configuration

**Environment:**
- Configuration via `.env` file (see `.env.example`)
- Critical env vars: `DATABASE_URL`, `SESSION_SECRET`, MinIO credentials
- Environment detection via `process.env.NODE_ENV`

**Build:**
- `vite.config.ts` - Vite configuration with TanStack Start, React, Tailwind, and TypeScript path plugins
- `tsconfig.json` - TypeScript configuration with strict mode, `@/*` path alias
- `drizzle.config.ts` - Drizzle ORM configuration for PostgreSQL migrations
- `package.json` - Project metadata and script definitions

**Databases:**
- PostgreSQL via Neon serverless (configured in `src/db/index.ts`)
- Connection through `@neondatabase/serverless` driver
- Drizzle ORM for type-safe queries and schema management

## Platform Requirements

**Development:**
- TypeScript 5.7.2+
- pnpm package manager
- Node.js (compatible with latest ESM modules)
- Optional: Docker for local MinIO container (`docker/minio/docker-compose.yml`)

**Production:**
- Node.js runtime (ESM module support required)
- Environment variables: `DATABASE_URL`, `SESSION_SECRET`, MinIO credentials
- Can be deployed as a full-stack application via TanStack Start

**Browser Requirements:**
- Modern ES2022 compatible browsers
- Service Worker support (for PWA functionality)

---

*Stack analysis: 2026-04-17*
