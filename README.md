# inspoBase V16 — scalable screenshot backend (starter)

This release adds a real screenshot capture and serving pipeline to the existing V15 design. It does NOT contain 1,000 prevalidated screenshots. It can grow to 1,000+ by supplying a verified URL inventory and running the capture job. The bundled domains.txt contains a small starter list only.

## Setup

Requires Node 20+ and a machine capable of running Chromium:

```
cd backend
npm install
npx playwright install chromium
npm run capture
npm start
```

Open http://localhost:3000. The frontend fetches `/api/designs` in batches of 120, while the browser preloads validated images. The backend serves locally cached WebP files; clicking Load More reveals up to 30 already available designs. You can add more domains to `backend/domains.txt` and rerun `npm run capture`. Existing captures are preserved.

The capture process skips HTTP 4xx/5xx, timeouts, and failed screenshots; it is not a complete quality review and does not detect all soft 404 pages. For a production deployment add scheduled capture jobs, stronger URL validation, domain throttling, robots/terms compliance, editorial moderation, deduplication, licensing review, and persistent DB/object storage. Do not blindly scrape 1,000 sites without checking their terms.

## Public discovery sources

Existing free sources: Openverse and Wikimedia Commons, for creative assets and GIFs (not website screenshots). MediaWiki supports paginated discovery. A truly reliable collection of 1,000 website screenshots requires discovering 1,000 eligible URLs and capturing/caching them. Public free APIs alone do not guarantee this quantity or editorial relevance.

The existing UI is English and retains Canvas/Grid, motion GIFs, animated logo, category menu, sort selector, and load-more behavior.
