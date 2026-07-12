// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The canonical, public URL of the journal. Used for absolute links in the
// sitemap, RSS feed, and the Google Scholar `citation_*` tags on article pages.
export default defineConfig({
  site: 'https://ijats.org',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
