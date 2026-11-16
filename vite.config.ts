import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'icons/mirsad-192.png', 'icons/mirsad-512.png'],
    manifest: {
      name: 'MIRSAD — Atmospheric & Lunar Intelligence',
      short_name: 'MIRSAD',
      description: 'Atmospheric and lunar intelligence for weather-aware crescent visibility and observation planning.',
      theme_color: '#050816', background_color: '#050816', display: 'standalone',
      orientation: 'any', start_url: '/', scope: '/',
      icons: [
        { src: '/icons/mirsad-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: '/icons/mirsad-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ]
    },
    workbox: { navigateFallback: '/index.html', globPatterns: ['**/*.{js,css,html,svg,png,ico}'] }
  })]
})
