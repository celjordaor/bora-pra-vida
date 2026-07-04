import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    VitePWA({
      // injectManifest: escrevemos nosso próprio service worker (src/sw.ts)
      // em vez de deixar o plugin gerar um sozinho. Necessário porque mais
      // pra frente (Fase 7) o sw.ts vai também escutar eventos de push.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectRegister: null, // registramos manualmente em main.tsx
      registerType: 'autoUpdate',
      injectManifest: {
        // por padrão só js/css/html entram no precache; sem isso, os
        // ícones do manifest ficam de fora e falham ao abrir offline
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'Bora pra Vida',
        short_name: 'Bora pra Vida',
        description: 'Atividades diárias, compras e notas rápidas.',
        theme_color: '#1e2c41',
        background_color: '#fafafa',
        display: 'standalone',
        // @ts-expect-error display_override ainda não está no tipo oficial do manifest
        display_override: ['window-controls-overlay', 'standalone'],
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
})
