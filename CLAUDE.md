# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm build       # Build with rolldown (outputs to dist/)
pnpm test        # Run tests with vitest
pnpm lint        # Check with biome
pnpm typecheck   # TypeScript type checking (tsc --noEmit)
pnpm format      # Format and auto-fix with biome
```

To run a single test file:
```bash
pnpm vitest run test/rollbar/client.spec.ts
```

## Architecture

This is a Vite plugin that uploads sourcemaps to Rollbar after a build. The plugin hooks into Vite's `writeBundle` lifecycle.

**Data flow:** `writeBundle` → `collectSourceMappings` (scan `outputDir` for `*.map` files) → `uploadAllSourceMaps` (POST each to Rollbar API)

**Key modules:**
- `src/index.ts` — plugin entry point, exports `RollbarSourcemapsOptions` type and default plugin factory
- `src/sourceMap/` — scans output directory for `.map` files, builds `SourceMapping[]` (content + path + URL)
- `src/rollbar/client.ts` — orchestrates uploads, builds FormData for Rollbar API
- `src/rollbar/service.ts` — thin fetch wrapper around `https://api.rollbar.com/api/1/sourcemap`
- `src/state.ts` — module-level singleton `state.logger`, set once per build via `setLogger()`
- `src/logger.ts` — `Logger` class controlling `silent` and `ignoreUploadErrors` behavior

**In-source testing:** Some files (e.g., `src/rollbar/service.ts`) use Vitest's `import.meta.vitest` pattern for collocated unit tests. The build config strips these via `transform.define`.

**Build:** Uses `rolldown` (not Rollup/Vite). Outputs ESM (`dist/index.esm.js`), CJS (`dist/index.umd.cjs`), and type declarations (`dist/index.d.ts`). `vite` is kept external in the dts build but bundled in the JS outputs.
