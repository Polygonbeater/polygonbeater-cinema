import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const essays = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/essays" }),
  schema: z.object({
    title: z.string(),
    film: z.string().optional(),
    movie: z.string().optional(),
    director: z.string().optional(),
    director_name: z.string().optional(),
    year: z.number().int().optional(),
    date: z.union([z.string(), z.date()]).optional(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    lang: z.string().optional(),
    slug: z.string().optional(),
    translationSlug: z.string().optional(),
  }),
});

export const collections = { essays };
