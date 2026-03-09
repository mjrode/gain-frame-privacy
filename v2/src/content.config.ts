import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        category: z.string(),
        date: z.coerce.string(),
        dateModified: z.coerce.string().optional(),
        ogImage: z.string(),
        coverImage: z.string(),
        coverAlt: z.string(),
        readTime: z.string(),
        subtitle: z.string(),
        keywords: z.string().optional(),
        faq: z.array(z.object({
            question: z.string(),
            answer: z.string(),
        })).optional(),
        relatedPosts: z.array(z.object({
            slug: z.string(),
            title: z.string(),
        })).optional(),
    }),
});

export const collections = { blog };
