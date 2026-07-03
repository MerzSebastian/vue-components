import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// Library build config: bundles src/index.ts (all components) into a
// publishable package. Type declarations are emitted separately via
// `vue-tsc --emitDeclarationOnly` (see the `build:lib` npm script) so this
// config only needs to bundle JS/CSS.
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  publicDir: false,
  build: {
    outDir: 'dist',
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueComponents',
      fileName: (format) => `vue-components.${format === 'es' ? 'js' : 'umd.cjs'}`,
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
})
