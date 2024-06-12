import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
  return rss({ // https://docs.astro.build/en/guides/rss/#using-glob-imports
    title: 'Evan Klein | Blog',
    description: 'Thoughts and musings on software engineering, life, etc.',
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('./**/*.md')),
    customData: `<language>en-us</language>`,
  });
}