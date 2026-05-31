import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages: https://<user>.github.io/AI-Projects/baby-sleep/
const base = process.env.GITHUB_PAGES === 'true' ? '/AI-Projects/baby-sleep/' : '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Little Dream — Baby Sleep Tracker',
        short_name: 'Little Dream',
        description: 'Track naps and get research-based next-nap guidance',
        theme_color: '#6b5b95',
        background_color: '#faf8f5',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
