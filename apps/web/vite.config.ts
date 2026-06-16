/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://tschbnmf03.execute-api.eu-west-1.amazonaws.com/dev',
        changeOrigin: true,
        secure: true,
      },
      '/health': {
        target: 'https://tschbnmf03.execute-api.eu-west-1.amazonaws.com/dev',
        changeOrigin: true,
        secure: true,
      },
      '/ai-api': {
        target: 'https://finpals-prototype.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-api/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['node_modules/', 'src/setupTests.ts', 'dist/'],
    },
  },
});
