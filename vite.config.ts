import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Élias — Le Combat d\'une Vie',
        short_name: 'Élias',
        description: 'Simulateur de vie chrétien — mémorisez les Écritures pour surmonter les épreuves',
        theme_color: '#2D1B4E',
        background_color: '#F5F0EB',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'favicon.svg', sizes: '192x192', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
})
