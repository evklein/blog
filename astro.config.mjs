import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import rehypePrismPlus from 'rehype-prism-plus';

export default defineConfig({
  markdown: {
      rehypePlugins: [rehypePrismPlus]
  },
  integrations: [preact()],
  site: "https://evklein.com"
});