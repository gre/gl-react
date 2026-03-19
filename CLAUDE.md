# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

gl-react is a universal React library for writing and composing WebGL shaders. It uses TypeScript for type checking and is structured as a Yarn workspaces monorepo.

## Commands

**Must use Yarn** (npm is blocked by a preinstall check).

```bash
yarn                              # Install dependencies
yarn build                        # Babel-compile all packages to lib/ + generate .d.ts
yarn typecheck                    # Run TypeScript type checking (tsc --noEmit)
yarn watch                        # Watch mode for development
yarn test                         # Run Jest tests (packages/tests)
yarn test-rewrite-snapshots       # Regenerate test snapshots
yarn prettier                     # Format source files
yarn cookbook-v2                   # Start modern cookbook dev server (Vite)
```

Tests run via `packages/tests/test.sh`, which executes Jest on each `__tests__/*.js` file individually. On CI (Linux), tests require `xvfb-run` for headless OpenGL.

## Monorepo Package Structure

- **`packages/gl-react/`** — Core library. Defines `Node`, `Bus`, `Shaders`, `GLSL`, `createSurface`, `Visitor`, uniforms, and the rendering pipeline. All other packages depend on this.
- **`packages/gl-react-dom/`** — WebGL implementation for React DOM (browser).
- **`packages/gl-react-native/`** — React Native standalone implementation.
- **`packages/gl-react-expo/`** — React Native via Expo GLView.
- **`packages/gl-react-headless/`** — Node.js implementation using headless-gl.
- **`packages/tests/`** — Shared Jest test suite using `gl-react-headless` + `react-test-renderer`.
- **`packages/cookbook-v2/`** — Modern examples (Vite + TypeScript + Tailwind).

## Architecture

**Build pipeline:** Babel compiles `src/` (`.ts`/`.tsx`) → `lib/` for each `gl-react*` package. `tsc --emitDeclarationOnly` generates `.d.ts` type declarations alongside compiled output.

**Rendering model:** Two-phase: `redraw()` marks nodes dirty, `flush()` performs actual GL draws. Async flushing at 60fps by default; synchronous mode available via `sync` prop on Surface.

**Surface/Node tree:** `createSurface` is a factory that produces platform-specific Surface components (used by gl-react-dom, gl-react-native, etc.). Each `Node` component manages one framebuffer. The root Node draws directly to the Surface canvas. Nodes communicate via React context (`SurfaceContext`).

**Shader composition:** `Node` components can be nested — a child Node's output texture becomes a uniform input to its parent. `Bus` enables sharing a computation across multiple consumers without re-rendering.

**Texture loading:** Extensible via `webgltexture-loader` packages. Platform implementations register their own loaders (e.g., `webgltexture-loader-dom` for browser image/video/canvas).

## Code Conventions

- Source uses **TypeScript** (`.ts`/`.tsx` files) across all packages.
- Prettier config: semicolons, double quotes, trailing commas (es5), 80 char width.
- Node 18+ required (see `.prototools`).
