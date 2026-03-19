import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const glReactSrc = /\/packages\/gl-react(-dom)?\/src\/.*\.tsx?$/

// Shim Node.js `global` → `globalThis` for browser compat in gl-react sources
const glReactGlobalShim = () => ({
  name: 'gl-react-global-shim',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!glReactSrc.test(id)) return null
    const shimmed = code.replace(/\bglobal\b(?!This)/g, 'globalThis')
    if (shimmed === code) return null
    return { code: shimmed, map: null }
  },
})

export default defineConfig({
  plugins: [glReactGlobalShim(), react()],
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
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
