import { getCollection } from 'astro:content';

function getCleanSlug(id: string) {
  return id
    .replace(/^.*[\\/]/, '')
    .replace(/\.(mdx?)$/, '')
    .replace(/^(cz|en)[_-]/i, '');
}

// Odstraní Markdown syntaxi a vrátí čistý text
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')             // nadpisy
    .replace(/\*\*(.+?)\*\*/g, '$1')          // tučné
    .replace(/\*(.+?)\*/g, '$1')              // kurzíva
    .replace(/`{1,3}[^`]*`{1,3}/g, '')       // kód
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // odkazy
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')     // obrázky
    .replace(/^[-*_]{3,}$/gm, '')             // oddělovače
    .replace(/\n{3,}/g, '\n\n')               // vícenásobné prázdné řádky
    .trim();
}

export async function GET() {
  const allEssays = await getCollection('essays');

  // Seskupíme eseje podle slugu – každý slug má cz + en variantu
  const slugMap = new Map<string, { cs?: typeof allEssays[0]; en?: typeof allEssays[0] }>();

  for (const entry of allEssays) {
    const slug = getCleanSlug(entry.id);
    const isEn = entry.id.includes('en/') || entry.id.startsWith('en-') || entry.data?.lang === 'en';
    const existing = slugMap.get(slug) || {};
    if (isEn) {
      slugMap.set(slug, { ...existing, en: entry });
    } else {
      slugMap.set(slug, { ...existing, cs: entry });
    }
  }

  const index = Array.from(slugMap.entries()).map(([slug, { cs, en }]) => {
    const bodyCs = cs?.body ? stripMarkdown(cs.body).slice(0, 8000) : '';
    const bodyEn = en?.body ? stripMarkdown(en.body).slice(0, 8000) : '';

    return {
      slug,
      title_cs: cs?.data.title || en?.data.title || slug,
      title_en: en?.data.title || cs?.data.title || slug,
      director: cs?.data.director || en?.data.director || '',
      year: cs?.data.year || en?.data.year || null,
      body_cs: bodyCs,
      body_en: bodyEn,
    };
  });

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
