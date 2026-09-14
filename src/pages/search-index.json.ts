import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

function getCleanSlug(entry: { id: string }) {
  return entry.id
    .replace(/^.*[\\/]/, '')
    .replace(/\.(mdx?)$/, '')
    .replace(/^(cz|cs|en)[_-]/i, '');
}

export const GET: APIRoute = async () => {
  const allEssays = await getCollection('essays');
  const uniqueSlugs = Array.from(new Set(allEssays.map(getCleanSlug)));

  const searchData = uniqueSlugs.map(slug => {
    const czEntry = allEssays.find(e => {
      const isCz = /(^|\/)(cs|cz)[/_-]/i.test(e.id) || e.data?.lang === 'cs' || e.data?.lang === 'cz';
      return isCz && getCleanSlug(e) === slug;
    }) || allEssays.find(e => getCleanSlug(e) === slug);

    const enEntry = allEssays.find(e => {
      const isEn = /(^|\/)en[/_-]/i.test(e.id) || e.data?.lang === 'en';
      return isEn && getCleanSlug(e) === slug;
    });

    const title_cs = czEntry?.data.title || '';
    const title_en = enEntry?.data.title || '';
    const director = czEntry?.data.director || enEntry?.data.director || czEntry?.data.director_name || enEntry?.data.director_name || '';
    const genres = Array.from(new Set([
      ...(czEntry?.data.genres || []),
      ...(enEntry?.data.genres || [])
    ])).join(' ');

    const body_cs = czEntry?.body?.slice(0, 1500) || '';
    const body_en = enEntry?.body?.slice(0, 1500) || '';

    return {
      slug,
      title_cs,
      title_en,
      director,
      genres,
      body_cs,
      body_en,
    };
  });

  return new Response(JSON.stringify(searchData), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
