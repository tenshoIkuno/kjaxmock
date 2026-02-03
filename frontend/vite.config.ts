import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // tsconfig のパスエイリアス設定で '@' → 'src' に対応させている
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // shim next/navigation for nextstepjs when building with Vite
      'next/navigation': path.resolve(
        __dirname,
        './src/shims/next-navigation.ts',
      ),
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        // /api をバックエンドのルートにリライト
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
