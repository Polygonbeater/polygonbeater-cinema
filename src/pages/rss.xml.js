import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const siteUrl = context.site || 'https://cinema.polygonbeater.eu';
  const allEssays = await getCollection('essays');

  const items = allEssays.map((entry) => {
    const rawId = entry.id.replace(/\\/g, '/');
    const slug = rawId.replace(/^(cz|en)[/]/, '').replace(/\.md$/, '');

    const data = entry.data || {};
    const title = data.title || slug;
    const description = data.description || data.excerpt || '';
    
    // Bezpečné ověření platnosti data, aby nedošlo k chybě Invalid Date
    let pubDate = new Date();
    const dateCandidate = data.date || data.pubDate;
    if (dateCandidate) {
      const parsed = new Date(dateCandidate);
      if (!isNaN(parsed.getTime())) {
        pubDate = parsed;
      }
    }

    return {
      title,
      description,
      pubDate,
      link: `/essays/${slug}/`,
    };
  });

  // Eliminace duplicitních odkazů pro CZ/EN mutace
  const uniqueItemsMap = new Map();
  items.forEach(item => {
    if (!uniqueItemsMap.has(item.link)) {
      uniqueItemsMap.set(item.link, item);
    }
  });

  const finalItems = Array.from(uniqueItemsMap.values()).sort(
    (a, b) => b.pubDate.valueOf() - a.pubDate.valueOf()
  );

  return rss({
    title: 'Polygon Beater Cinema',
    description: 'Filmové eseje a analýzy o kinematografii, estetice a temných zákoutích filmové historie.',
    site: siteUrl,
    items: finalItems,
    customData: `<language>cs</language>`,
  });
}
