import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { transformAsync } from '@babel/core'
import { readFile } from 'fs/promises'

const glReactSrc = /\/packages\/gl-react(-dom)?\/src\/.*\.js$/

// Transforms gl-react source files (Flow + JSX in .js) before Vite's
// built-in esbuild plugin sees them. Without enforce:'pre', esbuild
// runs first and chokes on JSX in .js files.
const glReactBabel = () => ({
  name: 'gl-react-babel',
  enforce: 'pre' as const,
  async transform(code: string, id: string) {
    if (!glReactSrc.test(id)) return null
    const result = await transformAsync(code, {
      filename: id,
      presets: ['@babel/preset-flow', '@babel/preset-react'],
      sourceMaps: true,
    })
    if (!result?.code) return null
    // Shim Node.js `global` → `globalThis` for browser compat
    const shimmed = result.code.replace(/\bglobal\b(?!This)/g, 'globalThis')
    return { code: shimmed, map: result.map }
  },
})

// esbuild plugin for the optimizeDeps scanner — strips Flow types
// so esbuild can parse gl-react source during dependency discovery.
const flowStripPlugin = {
  name: 'flow-strip',
  setup(build: any) {
    build.onLoad(
      { filter: /\/packages\/gl-react(-dom)?\/src\/.*\.js$/ },
      async (args: any) => {
        const source = await readFile(args.path, 'utf8')
        const result = await transformAsync(source, {
          filename: args.path,
          presets: ['@babel/preset-flow', '@babel/preset-react'],
        })
        return { contents: result?.code || '', loader: 'jsx' as const }
      }
    )
  },
}

export default defineConfig({
  plugins: [glReactBabel(), react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'gl-react': resolve(__dirname, '../gl-react/src'),
      'gl-react-dom': resolve(__dirname, '../gl-react-dom/src'),
    },
  },
  server: {
    port: 3001,
    open: true,
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [flowStripPlugin],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
