import rss from '@astrojs/rss';
import { journal } from '../lib/journal';
import { getRecentArticles, formatAuthors } from '../lib/content';

export async function GET(context) {
  const articles = await getRecentArticles();
  return rss({
    title: `${journal.shortName} — Latest Articles`,
    description: journal.description,
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      pubDate: article.data.publishDate,
      description: `${formatAuthors(article.data.authors)} — ${article.data.abstract.slice(0, 280)}`,
      link: `/articles/${article.id}`,
    })),
    customData: `<language>en</language>`,
  });
}
