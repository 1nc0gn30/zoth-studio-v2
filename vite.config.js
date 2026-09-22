import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { studioMiddleware } from './server/studio-api.mjs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'zoth-studio-api',
      configureServer(server) {
        server.middlewares.use(studioMiddleware());
      },
      configurePreviewServer(server) {
        server.middlewares.use(studioMiddleware());
      },
    },
  ],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
  },
});
