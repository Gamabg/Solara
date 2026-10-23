import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' permite publicar em subpasta (ex.: GitHub Pages)
export default defineConfig({ base: './', plugins: [react()] })
