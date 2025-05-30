import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Проксирование всех запросов, начинающихся с "/api"
      '/api': {
        target: 'http://localhost:8000',  // Адрес вашего FastAPI-сервера
        changeOrigin: true,
        secure: false,  // Для HTTP в разработке
        rewrite: (path) => path.replace(/^\/api/, '')  // Удаляет /api из пути
      }
    }
  }
})