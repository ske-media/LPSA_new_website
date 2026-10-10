import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import react from '@astrojs/react';
export default defineConfig({
  site: 'https://laplongesadapte.com',
  output: 'static',
  adapter: netlify(),
  integrations: [react()],
  devToolbar: { enabled: false },
  trailingSlash: 'always',
});
