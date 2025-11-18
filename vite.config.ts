import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: [
      // 路径别名配置，与 tsconfig.json 的 paths 保持一致
      // tsconfig.json: "@shared/*": ["src/shared/*"]
      { find: '@shared', replacement: path.resolve(__dirname, 'src/shared') },
      // tsconfig.json: "@plugins/*": ["src/plugins/*"]
      { find: '@plugins', replacement: path.resolve(__dirname, 'src/plugins') },
    ],
  },
  server: {
    port: 3000,
  },
});
