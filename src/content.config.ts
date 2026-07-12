import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * An "issue" is one published edition of the journal (e.g. Vol 1, Issue 1).
 * Articles reference their parent issue, so the editor creates the issue first,
 * then adds articles to it.
 */
const issues = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/issues' }),
  schema: ({ image }) =>
    z.object({
      volume: z.number().int().positive(),
      issue: z.number().int().positive(),
      // Human label such as "Spring 2026" or "Inaugural Issue". Optional.
      title: z.string().optional(),
      publishDate: z.coerce.date(),
      // Only "published" issues are listed publicly; "draft" stays hidden.
      status: z.enum(['draft', 'published']).default('draft'),
      summary: z.string().optional(),
      coverImage: image().optional(),
      // Optional single-file download of the whole issue.
      fullIssuePdf: z.string().optional(),
    }),
});

/**
 * An "article" is one paper. Each has its own PDF and citation metadata so it
 * can be indexed and cited individually (Google Scholar, DOAJ, etc.).
 */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()).min(1),
    abstract: z.string(),
    keywords: z.array(z.string()).default([]),
    // Page range within the issue, e.g. 1 and 14.
    startPage: z.number().int().positive().optional(),
    endPage: z.number().int().positive().optional(),
    // Path to the PDF under /public, e.g. "/pdfs/vol1-issue1/smith-ai-ops.pdf".
    pdf: z.string(),
    doi: z.string().optional(),
    // Which issue this article belongs to (relation to the issues collection).
    issue: reference('issues'),
    // Ordering within the issue's table of contents.
    order: z.number().int().default(0),
    publishDate: z.coerce.date(),
    status: z.enum(['draft', 'published']).default('draft'),
  }),
});

export const collections = { issues, articles };
