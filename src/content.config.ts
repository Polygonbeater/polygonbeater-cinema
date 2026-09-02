import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const essaysCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
  }),
});

export const collections = {
  essays: essaysCollection,
};
