import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/volley-positions/',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
