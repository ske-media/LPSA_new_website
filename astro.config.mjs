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
  // Styles inlined in each page: no render-blocking stylesheet request.
  build: { inlineStylesheets: 'always' },
  // sanitize-html is CommonJS and requires an ESM-only parser: bundle both so the Netlify function never calls require() on ESM.
  // Production build only: the dev server evaluates these CommonJS files natively.
  vite: { ssr: { noExternal: process.argv.includes('build') ? ['sanitize-html', 'htmlparser2'] : [] } },
});
