// @ts-nocheck
// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
  site: 'https://cinema.polygonbeater.eu', // Zásadní pro SEO a Sitemapu
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkPrefixEnFootnotes],
  },
});
