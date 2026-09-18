import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

function getSlug(entry) {
  const translationSlug = entry.data?.translationSlug;
  if (translationSlug) return translationSlug;

  return entry.id
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    .replace(/\.(md|mdx)$/i, '')
    .replace(/^(?:cz|en)[_-]/i, '');
}

function isCzech(entry) {
  return entry.data?.lang === 'cz'
    || entry.data?.lang === 'cs'
    || entry.id.replace(/\\/g, '/').includes('/cz/');
}

export async function GET(context) {
  const siteUrl = context.site || 'https://cinema.polygonbeater.eu';
  const allEssays = await getCollection('essays');
  const essaysBySlug = new Map();

  for (const entry of allEssays) {
    const slug = getSlug(entry);
    const existing = essaysBySlug.get(slug);
    if (!existing || (isCzech(entry) && !isCzech(existing))) {
      essaysBySlug.set(slug, entry);
    }
  }

  const finalItems = Array.from(essaysBySlug.entries()).map(([slug, entry]) => {
    const data = entry.data || {};
    const dateCandidate = data.date || data.pubDate;
    const parsedDate = dateCandidate ? new Date(dateCandidate) : null;
    const pubDate = parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate
      : new Date(0);

    return {
      title: data.title || slug,
      description: data.description || data.excerpt || '',
      pubDate,
      link: `/essays/${slug}/`,
    };
  }).sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'Polygon Beater Cinema',
    description: 'Filmové eseje a analýzy o kinematografii, estetice a temných zákoutích filmové historie.',
    site: siteUrl,
    items: finalItems,
    customData: `<language>cs</language>`,
  });
}
