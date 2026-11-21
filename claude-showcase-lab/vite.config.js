import { defineConfig } from 'vite';
import { haikuGeneration } from './server/haiku-generation.js';

export default defineConfig({
  base: './',
  plugins: [haikuGeneration()],
});
