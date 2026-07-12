/**
 * GitHub OAuth relay for the IJATS editor console (Sveltia / Decap CMS).
 *
 * Static sites can't keep an OAuth client secret, so this tiny Cloudflare Worker
 * performs the GitHub handshake on the server side and hands the resulting token
 * back to the CMS popup window. Deploy it once (see oauth-worker/README.md) and
 * point `backend.base_url` in public/admin/config.yml at its URL.
 *
 * Configure two secrets on the Worker:
 *   GITHUB_CLIENT_ID      — from your GitHub OAuth App
 *   GITHUB_CLIENT_SECRET  — from your GitHub OAuth App
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Step 1 — the CMS opens this; we bounce the user to GitHub to authorize.
    if (url.pathname === '/auth') {
      const authorize = new URL('https://github.com/login/oauth/authorize');
      authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authorize.searchParams.set('redirect_uri', `${url.origin}/callback`);
      authorize.searchParams.set(
        'scope',
        url.searchParams.get('scope') || 'repo,user',
      );
      authorize.searchParams.set('state', crypto.randomUUID());
      return Response.redirect(authorize.toString(), 302);
    }

    // Step 2 — GitHub redirects back here with a code; we exchange it for a
    // token and post it to the CMS window using the Netlify-CMS protocol.
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('Missing "code".', { status: 400 });

      let result;
      try {
        const res = await fetch(
          'https://github.com/login/oauth/access_token',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'User-Agent': 'ijats-cms-auth',
            },
            body: JSON.stringify({
              client_id: env.GITHUB_CLIENT_ID,
              client_secret: env.GITHUB_CLIENT_SECRET,
              code,
            }),
          },
        );
        result = await res.json();
      } catch (err) {
        result = { error: 'Token exchange failed.' };
      }

      const ok = Boolean(result.access_token);
      const status = ok ? 'success' : 'error';
      const payload = ok
        ? { token: result.access_token, provider: 'github' }
        : { error: result.error || 'Authorization failed.' };

      const page = `<!doctype html><html><body><script>
        (function () {
          function receive(e) {
            window.opener.postMessage(
              'authorization:github:${status}:' + ${JSON.stringify(
                JSON.stringify(payload),
              )},
              e.origin
            );
            window.removeEventListener('message', receive, false);
          }
          window.addEventListener('message', receive, false);
          window.opener.postMessage('authorizing:github', '*');
        })();
      </script><p>Completing sign-in…</p></body></html>`;

      return new Response(page, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' },
      });
    }

    return new Response('IJATS OAuth relay. Use /auth to begin.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  },
};
