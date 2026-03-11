// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
  output: 'static',
  base: '/v2',
  site: 'https://gainframe.app',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
