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
        name: 'Florify — Курьер',
        short_name: 'Курьер',
        theme_color: '#7C3AED',
        background_color: '#0F0A1A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/deliveries',
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/v1\/delivery/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'delivery-cache' },
          },
          {
            urlPattern: /\/api\/v1\/orders/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'orders-cache' },
          },
        ],
      },
    }),
  ],
  server: {
    strictPort: true,
    port: 5177,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
