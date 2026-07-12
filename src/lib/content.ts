import { getCollection, type CollectionEntry } from 'astro:content';

export type Issue = CollectionEntry<'issues'>;
export type Article = CollectionEntry<'articles'>;

const isProd = import.meta.env.PROD;

/**
 * In production only "published" entries are shown; in dev everything is visible
 * so the editor can preview drafts. Centralised here so every page applies the
 * same rule (avoids each page re-implementing the filter).
 */
function isVisible(status: 'draft' | 'published'): boolean {
  return !isProd || status === 'published';
}

/** All visible issues, newest first (by volume then issue). */
export async function getIssues(): Promise<Issue[]> {
  const issues = await getCollection('issues', (e) => isVisible(e.data.status));
  return issues.sort(compareIssuesDesc);
}

/** The most recent visible issue, or undefined if none exist yet. */
export async function getLatestIssue(): Promise<Issue | undefined> {
  return (await getIssues())[0];
}

/** All visible articles belonging to a given issue, in table-of-contents order. */
export async function getArticlesForIssue(issueId: string): Promise<Article[]> {
  const articles = await getCollection(
    'articles',
    (e) => isVisible(e.data.status) && e.data.issue.id === issueId,
  );
  return articles.sort((a, b) => a.data.order - b.data.order);
}

/** All visible articles across the journal, newest first. */
export async function getRecentArticles(limit?: number): Promise<Article[]> {
  const articles = await getCollection('articles', (e) => isVisible(e.data.status));
  const sorted = articles.sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

function compareIssuesDesc(a: Issue, b: Issue): number {
  if (b.data.volume !== a.data.volume) return b.data.volume - a.data.volume;
  return b.data.issue - a.data.issue;
}

/** "Vol. 1, No. 2" — the canonical short label for an issue. */
export function issueLabel(issue: Issue): string {
  return `Vol. ${issue.data.volume}, No. ${issue.data.issue}`;
}

/** Format an author list for display, e.g. "A. Smith, B. Jones & C. Lee". */
export function formatAuthors(authors: string[]): string {
  if (authors.length <= 1) return authors[0] ?? '';
  return `${authors.slice(0, -1).join(', ')} & ${authors[authors.length - 1]}`;
}

/** Page range like "1–14", or empty string if pages are not set. */
export function pageRange(article: Article): string {
  const { startPage, endPage } = article.data;
  if (startPage && endPage) return `${startPage}–${endPage}`;
  if (startPage) return `${startPage}`;
  return '';
}

/** Long human date, e.g. "1 July 2026". Rendered in UTC so a date-only value
 * like `2026-07-01` never slips to the previous day in a behind-UTC timezone. */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
