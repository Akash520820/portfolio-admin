import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this app from a subpath (/mern-portfolio-todo/), not
  // the domain root, so the deploy workflow sets VITE_BASE_PATH to that.
  // Docker/Nginx and local dev serve from the root, so this defaults to '/'
  // when the env var isn't set.
  base: process.env.VITE_BASE_PATH || '/',
})
