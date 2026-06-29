import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
    manifest: {
      name: 'Mapa Interactivo Terremoto Venezuela',
      short_name: 'Mapa Terremoto',
      description: 'Mapa colaborativo de zonas de emergencia, refugios y rescate en Venezuela',
      theme_color: '#0f172a',
      background_color: '#0f172a',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/?v=2',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/{s}\.basemaps\.cartocdn\.com\/.*/i,
          handler: 'CacheFirst',
          options: { cacheName: 'map-tiles', expiration: { maxEntries: 200, maxAgeSeconds: 86400 * 30 } },
        },
        {
          urlPattern: /^https:\/\/nominatim\.openstreetmap\.org\/.*/i,
          handler: 'NetworkOnly',
        },
        {
          urlPattern: /^https:\/\/mapa-interactivo-295\.pages\.dev\/api\/.*/i,
          handler: 'NetworkFirst',
          options: { cacheName: 'api-cache', expiration: { maxEntries: 50, maxAgeSeconds: 300 } },
        },
      ],
    },
  })],
  server: {
    host: true,
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 600,
  },
})
