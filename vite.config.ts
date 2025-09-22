import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { injectSEODataPlugin } from './scripts/vite-seo-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), injectSEODataPlugin()],
  base: '/Gas-Leak-Incidents/',
})
