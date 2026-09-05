// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';

// Remark plugin pro automatické přidání prefixu 'en-' do anglických poznámek pod čarou
function remarkPrefixEnFootnotes() {
  return (/** @type {any} */ tree, /** @type {any} */ file) => {
    const filePath = file.history?.[0] || file.path || '';
    if (filePath.includes('/en/') || filePath.includes('\\en\\')) {
      const walk = (/** @type {any} */ node) => {
        if (node.type === 'footnoteReference' || node.type === 'footnoteDefinition') {
          node.identifier = `en-${node.identifier}`;
          node.label = `en-${node.label}`;
        }
        if (node.children) node.children.forEach(walk);
      };
      walk(tree);
    }
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://cinema.polygonbeater.eu',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'weekly',
      priority: 0.8,
      serialize(item) {
        // Eseje mají nejvyšší prioritu, homepage střední, ostatní nižší
        if (item.url.includes('/essays/') && item.url !== 'https://cinema.polygonbeater.eu/essays/') {
          return { ...item, priority: 0.9, changefreq: 'monthly' };
        }
        if (item.url === 'https://cinema.polygonbeater.eu/') {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }
        if (item.url === 'https://cinema.polygonbeater.eu/essays/') {
          return { ...item, priority: 0.8, changefreq: 'daily' };
        }
        return { ...item, priority: 0.5, changefreq: 'monthly' };
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkPrefixEnFootnotes],
  },
});
