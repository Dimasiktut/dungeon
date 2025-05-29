// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    server: {
      host: true, // 🔥 Чтобы можно было подключаться по IP (например, с телефона)
      port: 5173, // по желанию — можно задать явно
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'), // Пример alias
      },
    },
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
  };
});
