import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Estrae il nome del pacchetto gestendo anche i @scope (es. @vitejs/plugin-react)
            const directories = id
              .toString()
              .split('node_modules/')[1]
              .split('/')
            if (directories[0].startsWith('@')) {
              return `${directories[0]}/${directories[1]}`
            }
            return directories[0]
          }
        },
      },
    },
  },
})
