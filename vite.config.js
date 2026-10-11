import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { studioMiddleware } from './server/studio-api.mjs';

export default defineConfig({
  define: {
    // Only request the WebMCP demo MP4 when it actually ships; otherwise the
    // console shows its simulation reel without a 404 on every page load.
    __WEBMCP_DEMO_VIDEO__: JSON.stringify(existsSync('public/assets/videos/webmcp-zoth-os.mp4')),
  },
  cacheDir: './.vite_cache',
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
  optimizeDeps: {
    holdUntilCrawlEnd: true,
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
  },
});
