// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { EnumChangefreq } from 'sitemap';

// Remark plugin pro automatické přidání prefixu 'en-' do anglických poznámek pod čarou
function remarkPrefixEnFootnotes() {
  /** @param {import('mdast').Root} tree @param {import('vfile').VFile} file */
  return (tree, file) => {
    const filePath = file.history?.[0] || file.path || '';
    if (filePath.includes('/en/') || filePath.includes('\\en\\')) {
      /** @param {unknown} node */
      const walk = (node) => {
        if (!node || typeof node !== 'object') return;
        const remarkNode = /** @type {{ type?: string, identifier?: string, label?: string | null, children?: unknown[] }} */ (node);
        if (remarkNode.type === 'footnoteReference' || remarkNode.type === 'footnoteDefinition') {
          if (remarkNode.identifier) remarkNode.identifier = `en-${remarkNode.identifier}`;
          if (remarkNode.label) remarkNode.label = `en-${remarkNode.label}`;
        }
        if (remarkNode.children) remarkNode.children.forEach(walk);
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
        if (item.url.includes('/essays/') && item.url !== 'https://cinema.polygonbeater.eu/essays/') {
          return { ...item, priority: 0.9, changefreq: EnumChangefreq.MONTHLY };
        }
        if (item.url === 'https://cinema.polygonbeater.eu/') {
          return { ...item, priority: 1.0, changefreq: EnumChangefreq.WEEKLY };
        }
        if (item.url === 'https://cinema.polygonbeater.eu/essays/') {
          return { ...item, priority: 0.8, changefreq: EnumChangefreq.DAILY };
        }
        return { ...item, priority: 0.5, changefreq: EnumChangefreq.MONTHLY };
      },
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkPrefixEnFootnotes],
    }),
  },
});
