import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@ecs': resolve(__dirname, './src/ecs'),
      '@framework': resolve(__dirname, './src/framework'),
      '@game': resolve(__dirname, './src/game'),
      '@ui': resolve(__dirname, './src/ui'),
      '@content': resolve(__dirname, './src/content'),
    },
  },
})
