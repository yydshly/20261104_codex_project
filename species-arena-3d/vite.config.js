import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        hub: fileURLToPath(new URL('./index.html', import.meta.url)),
        arena: fileURLToPath(new URL('./arena.html', import.meta.url)),
        rescue: fileURLToPath(new URL('./rescue.html', import.meta.url)),
        orbit: fileURLToPath(new URL('./orbit.html', import.meta.url)),
        magnetLab: fileURLToPath(new URL('./magnet-lab.html', import.meta.url)),
        journey: fileURLToPath(new URL('./journey.html', import.meta.url)),
      },
    },
  },
});
