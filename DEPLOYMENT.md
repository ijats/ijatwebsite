# IJATS — Deployment & Operations Guide

This site is an [Astro](https://astro.build) static site hosted free on **GitHub
Pages**, with a git-based editor console (**Sveltia CMS**) at `/admin`. Adding an
issue in `/admin` commits to the repo, which triggers an automatic rebuild and
publish. **No server, no database, $0/month hosting.**

---

## One-time setup (do these once, in order)

### 1. Publish the new site to GitHub Pages

1. Merge the `rebuild-astro` branch into `master` (or push it directly).
2. In the repo on GitHub: **Settings → Pages → Build and deployment → Source**,
   choose **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` runs on every push to `master`
   and publishes `dist/` to `ijats.org`. The `public/CNAME` file keeps the
   custom domain — no DNS changes are needed.

### 2. Create a GitHub OAuth App (for admin login)

The editor console signs in with GitHub. Create an OAuth App:

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
   (or use an organization's developer settings if the repo is org-owned).
2. Fill in:
   - **Application name:** `IJATS Editor Console`
   - **Homepage URL:** `https://ijats.org`
   - **Authorization callback URL:** `https://<your-worker-url>/callback`
     (you'll get the worker URL in the next step — you can edit this field
     afterwards).
3. Click **Register application**, then **Generate a new client secret**.
4. Copy the **Client ID** and **Client secret** — you'll paste them into the
   Cloudflare Worker next. Treat the secret like a password.

### 3. Deploy the OAuth relay (free Cloudflare Worker)

The code is in [`oauth-worker/worker.js`](oauth-worker/worker.js). See
[`oauth-worker/README.md`](oauth-worker/README.md) for click-by-click steps. In
short:

1. Create a free account at <https://dash.cloudflare.com>.
2. **Workers & Pages → Create → Worker**, name it e.g. `ijats-cms-auth`, deploy.
3. **Edit code**, paste the contents of `oauth-worker/worker.js`, and deploy.
4. **Settings → Variables and Secrets**, add two **encrypted** secrets:
   - `GITHUB_CLIENT_ID` = the Client ID from step 2
   - `GITHUB_CLIENT_SECRET` = the Client secret from step 2
5. Copy your Worker URL, e.g.
   `https://ijats-cms-auth.<subdomain>.workers.dev`.
6. Go back to the GitHub OAuth App (step 2) and set the **Authorization callback
   URL** to `https://ijats-cms-auth.<subdomain>.workers.dev/callback`.

### 4. Point the CMS at the relay

Edit [`public/admin/config.yml`](public/admin/config.yml) and set:

```yaml
backend:
  base_url: https://ijats-cms-auth.<subdomain>.workers.dev
```

Commit and push. Once the deploy finishes, visit `https://ijats.org/admin`,
click **Sign in with GitHub**, and you're in.

---

## Day-to-day: publishing an issue

1. Go to **https://ijats.org/admin** and sign in.
2. **Issues → New Issue** — set volume, issue number, publication date, an
   optional title/summary/cover, set **Status = published**, and Save.
3. **Articles → New Article** — for each paper: title, authors, abstract,
   keywords, page range, **upload the PDF**, pick the **Issue** you just created,
   set order and date, **Status = published**, and Save.
4. **Publish** the changes. The site rebuilds automatically (about 1–2 minutes)
   and the issue appears at `https://ijats.org/issues`.

> Tip: leave things as **draft** while preparing; drafts are hidden on the live
> site but visible when running the site locally (`npm run dev`).

---

## Running locally

```bash
npm install     # first time only
npm run dev     # http://localhost:4321  (drafts visible)
npm run build   # production build into dist/
npm run preview # serve the built dist/ locally
```

---

## How it all fits together

| Concern | Where |
|---|---|
| Journal-wide facts (name, ISSN, emails, EIC, scope) | `src/lib/journal.ts` |
| Issue & article data model | `src/content.config.ts` |
| Content (issues, articles) | `src/content/issues`, `src/content/articles` |
| PDFs & images | `public/pdfs` (uploaded via /admin) |
| Editor console | `public/admin/` (Sveltia CMS) |
| Admin login relay | `oauth-worker/` (Cloudflare Worker) |
| Auto-deploy | `.github/workflows/deploy.yml` |

## Upgrade paths (when you outgrow the basics)

- **Large PDF volume:** if the repo grows big, move PDFs to Cloudflare R2 object
  storage and point the CMS media library there. The article schema already
  stores PDFs as URLs, so no code change is needed for existing content.
- **Non-technical editors without GitHub accounts:** swap the GitHub backend for
  an email/password identity service; the collections stay the same.
