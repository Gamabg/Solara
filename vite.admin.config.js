import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'admin-panel',
  envDir: '..',
  plugins: [react()],
  build: {
    outDir: '../dist-admin',
    emptyOutDir: true,
  },
})
