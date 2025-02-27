import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/smart-elderly-care/',
  plugins: [vue()],
  server: {
    port: 3000
  }
}) 