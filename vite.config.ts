import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      // Allow imports like `@phaser/game.config` -> `src/phaser/game.config`
      '@phaser': path.resolve(__dirname, 'src/phaser'),
      // Other path aliases used in the project
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
