import rss from '@astrojs/rss';
import sanitizeHtml from 'sanitize-html';

export async function GET(context) {
  const postImportResult = import.meta.glob('./**/*.md', { eager: true });
  const posts = Object.values(postImportResult);

  return rss({ // https://docs.astro.build/en/guides/rss/#using-glob-imports
    title: 'Evan Klein | Blog',
    description: 'Thoughts and musings on software engineering, life, etc.',
    site: context.site,
    items: posts.map((post) => ({
      link: post.url,
      content: sanitizeHtml(post.compiledContent(), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt'],
        },
      }),
      ...post.frontmatter,
    })),
    customData: `<language>en-us</language>`,
    trailingSlash: false,
  });
}