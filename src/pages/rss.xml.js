import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const allEssays = await getCollection('essays');
  
  // Unikátní slugi pro eliminaci duplicit cz/en verzí v hlavním feedu
  const uniqueSlugs = Array.from(
    new Set(allEssays.map(e => e.id.replace(/^.*[\\/]/, '').replace(/\.md$/, '')))
  );

  const items = uniqueSlugs.map(slug => {
    const czEntry = allEssays.find(e => e.id.replace(/\\/g, '/').includes(`cz/${slug}`));
    const entry = czEntry || allEssays.find(e => e.id.replace(/\\/g, '/').includes(`en/${slug}`));
    
    return {
      title: entry?.data.title || slug,
      description: entry?.data.excerpt || entry?.data.description || '',
      pubDate: new Date(entry?.data.date || '1970-01-01'),
      link: `/essays/${slug}/`,
    };
  });

  items.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'Polygon Beater Cinema',
    description: 'Filmové eseje a analýzy o kinematografii, estetice a temných zákoutích filmové historie.',
    site: context.site,
    items: items,
    customData: `<language>cs</language>`,
  });
}
