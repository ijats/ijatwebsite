# IJATS — Deployment & Operations Guide

This site is an [Astro](https://astro.build) static site hosted free on **GitHub
Pages**, with a git-based editor console (**Sveltia CMS**) at `/admin`. Adding an
issue in `/admin` commits to the repo, which triggers an automatic rebuild and
publish. **No server, no database, $0/month hosting.**

---

## One-time setup (do these once, in order)

### 1. Publish the new site to GitHub Pages

1. Set **Settings → Pages → Build and deployment → Source** to **GitHub
   Actions** (or via API: `PUT /repos/ijats/ijatwebsite/pages` with
   `{"build_type":"workflow"}`).
2. Merge the `rebuild-astro` branch into `master` (the default branch).
3. The workflow in `.github/workflows/deploy.yml` runs on every push to `master`
   and publishes `dist/` to `ijats.org`. The `public/CNAME` file keeps the
   custom domain — no DNS changes are needed.

### 2. Admin login — sign in with a GitHub token (no extra setup)

The editor console signs in with GitHub. For a single editor this needs **no
OAuth app and no Cloudflare Worker** — you sign in with a Personal Access Token:

1. Create a token at **GitHub → Settings → Developer settings → Personal access
   tokens**. Either type works:
   - **Fine-grained token:** give it access to the `ijats/ijatwebsite`
     repository with **Contents: Read and write** permission.
   - **Classic token:** tick the **`repo`** scope.
2. Visit `https://ijats.org/admin`, click **Sign In Using Access Token**, choose
   GitHub, and paste the token. That's it — you're in. The token is stored only
   in your own browser.

> Prefer a one-click **"Sign In with GitHub"** button (nicer if several editors
> share the console)? That needs a small OAuth relay — see the optional section
> at the bottom. The token method above is otherwise all you need.

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
| Optional 1-click login relay | `oauth-worker/` (Cloudflare Worker) |
| Auto-deploy | `.github/workflows/deploy.yml` |

## Upgrade paths (when you outgrow the basics)

- **Large PDF volume:** if the repo grows big, move PDFs to Cloudflare R2 object
  storage and point the CMS media library there. The article schema already
  stores PDFs as URLs, so no code change is needed for existing content.
- **Non-technical editors without GitHub accounts:** swap the GitHub backend for
  an email/password identity service; the collections stay the same.

---

## Optional: one-click "Sign In with GitHub" (OAuth)

The token sign-in above is all a solo editor needs. If you'd rather have a
one-click **Sign In with GitHub** button (handy when several editors share the
console), deploy the small OAuth relay:

1. **Create a GitHub OAuth App** — GitHub → Settings → Developer settings →
   OAuth Apps → New OAuth App:
   - **Application name:** `IJATS Editor Console`
   - **Homepage URL:** `https://ijats.org`
   - **Authorization callback URL:** `https://<your-worker-url>/callback`
     (fill in after step 2; it's editable).
   - Register, then **Generate a new client secret**. Copy the **Client ID** and
     **Client secret**.
2. **Deploy the Cloudflare Worker** in [`oauth-worker/`](oauth-worker/README.md):
   create a free Cloudflare account, make a Worker named `ijats-cms-auth`, paste
   `oauth-worker/worker.js`, and add two encrypted secrets `GITHUB_CLIENT_ID`
   and `GITHUB_CLIENT_SECRET`. Note the Worker URL.
3. Set the OAuth App's callback URL to `https://<worker-url>/callback`.
4. In [`public/admin/config.yml`](public/admin/config.yml), uncomment `base_url`
   under `backend:` and set it to the Worker URL. Commit and push.

After the deploy, **Sign In with GitHub** works without pasting a token.
