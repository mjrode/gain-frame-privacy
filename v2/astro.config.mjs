// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
  output: 'static',
  site: 'https://gainframe.app',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
