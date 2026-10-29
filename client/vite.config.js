import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const { PORT = '5000' } = loadEnv(mode, root, 'PORT');

  return {
    server: {
      proxy: { '/api': `http://localhost:${PORT}` },
    },
  };
});
