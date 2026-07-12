# IJATS OAuth relay (Cloudflare Worker)

The `/admin` editor console signs in with GitHub. Because a static site can't
safely hold an OAuth client secret, this small Worker does the GitHub token
exchange server-side. You deploy it once.

## Deploy via the Cloudflare dashboard (no tooling required)

1. Sign up / log in at <https://dash.cloudflare.com>.
2. **Workers & Pages → Create → Create Worker**. Name it `ijats-cms-auth`,
   click **Deploy** (it deploys a hello-world first).
3. Click **Edit code**. Delete the sample and paste the entire contents of
   [`worker.js`](worker.js). Click **Deploy**.
4. **Settings → Variables and Secrets → Add**. Add two **Secret** (encrypted)
   variables:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`

   (Both come from your GitHub OAuth App — see `../DEPLOYMENT.md`, step 2.)
5. Note your Worker URL, e.g. `https://ijats-cms-auth.<subdomain>.workers.dev`.
   - Set your GitHub OAuth App's **callback URL** to `<worker-url>/callback`.
   - Set `backend.base_url` in `../public/admin/config.yml` to `<worker-url>`.

## Deploy via Wrangler (optional, for CLI users)

```bash
npm install -g wrangler
cd oauth-worker
wrangler deploy worker.js --name ijats-cms-auth
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

## How it works

- `GET /auth` → redirects to GitHub's authorize page with the `repo` scope.
- `GET /callback` → exchanges the `code` for an access token and posts it back to
  the CMS window using the Netlify-CMS `authorization:github:success:{…}`
  message protocol.

The client secret never leaves the Worker, and the token is only sent to the
opener window (the CMS on `ijats.org`).
