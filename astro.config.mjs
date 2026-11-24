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
  // sanitize-html is CommonJS and requires an ESM-only parser: bundle both so the Netlify function never calls require() on ESM.
  vite: { ssr: { noExternal: ['sanitize-html', 'htmlparser2'] } },
});
