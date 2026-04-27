import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Florify — Флорист',
        short_name: 'Florify',
        theme_color: '#3D7A5E',
        background_color: '#F8F8F6',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/orders',
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\/orders/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'orders-cache' },
          },
          {
            urlPattern: /\/api\/v1\/inventory/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'inventory-cache' },
          },
          {
            urlPattern: /\/api\/v1\/.*\/status/,
            handler: 'NetworkFirst',
            options: { cacheName: 'status-mutations' },
          },
          {
            urlPattern: /\/api\/v1\/inventory\/write-off/,
            handler: 'NetworkFirst',
            options: { cacheName: 'writeoff-mutations' },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5176,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
