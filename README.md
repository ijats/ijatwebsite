# IJATS — International Journal of Applied Technology Solutions

The official website for **IJATS**, an open-access, peer-reviewed journal of
applied technology research. Live at **[ijats.org](https://ijats.org)**.

- **Public site** — home, about, per-issue archive, per-article pages with PDF
  downloads, call for papers, submission info, editorial policies, contact.
- **Editor console** at `/admin` — add issues and upload article PDFs; changes
  publish to the live site automatically.

## Tech stack

| | |
|---|---|
| Site generator | [Astro](https://astro.build) (static output) |
| Styling | [Tailwind CSS](https://tailwindcss.com) v4 |
| Editor console | [Sveltia CMS](https://github.com/sveltia/sveltia-cms) (git-based) |
| Hosting | GitHub Pages (free, auto-deploy) |
| Admin login | GitHub token (optional one-click OAuth via a Cloudflare Worker) |

Everything is static → free to host, low-maintenance, and secure (no server or
database to patch).

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
```

## Project structure

```
src/
  lib/journal.ts        Journal-wide facts (name, ISSN, emails, EIC, scope)
  content.config.ts     Data model for issues & articles
  content/              Issue and article entries (Markdown front-matter)
  components/           Header, Footer, cards, SEO/citation tags
  layouts/              Base + page layouts
  pages/                Routes (home, issues, articles, info pages, RSS)
  styles/global.css     Tailwind theme + prose styles
public/
  admin/                Sveltia CMS (editor console) + config.yml
  pdfs/                 Article & issue PDFs (uploaded via /admin)
oauth-worker/           Cloudflare Worker for admin GitHub login
.github/workflows/      Auto build + deploy to GitHub Pages
```

## Publishing content & deploying

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for one-time setup (GitHub Pages, OAuth
App, Cloudflare Worker) and the day-to-day workflow for publishing an issue.

## SEO & indexing

Article pages emit Google Scholar `citation_*` tags; the build produces a
sitemap and an RSS feed — supporting the journal's Google Scholar / DOAJ / Scopus
indexing roadmap.
