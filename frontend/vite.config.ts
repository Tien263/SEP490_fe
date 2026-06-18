import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  server: {
    proxy: {
      // Proxy tất cả request /api/* → backend ASP.NET Core
      // Thay đổi port nếu backend chạy trên port khác
      '/api': {
        target: 'https://localhost:7003',
        changeOrigin: true,
        secure: false, // Bỏ qua self-signed SSL cert khi dev
      },
    },
  },
})