import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from https://cstier-tech.github.io/SOMIForm/ on GitHub Pages
  base: process.env.GITHUB_ACTIONS ? '/SOMIForm/' : '/',
})
