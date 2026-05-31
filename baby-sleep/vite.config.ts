import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages: https://<user>.github.io/AI-Projects/baby-sleep/
const base = process.env.GITHUB_PAGES === 'true' ? '/AI-Projects/baby-sleep/' : '/'

const buildId = process.env.VITE_APP_BUILD_ID ?? 'dev'

export default defineConfig({
  base,
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Little Dream — Baby Sleep Intelligence',
        short_name: 'Little Dream',
        description: 'Professional baby sleep tracking, patterns, and nap guidance',
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
