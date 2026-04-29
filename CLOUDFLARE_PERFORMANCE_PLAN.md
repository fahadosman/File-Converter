# Cloudflare Performance Plan

## Quick Wins (implemented)

- Worker edge cache now normalizes query strings and drops tracking params to improve cache hit ratio.
- Worker sets cache headers by content type:
  - static assets: `public, max-age=31536000, immutable`
  - HTML routes: `public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`
- Added cache telemetry header `X-Edge-Cache: HIT|MISS|BYPASS`.
- Added `/api/health` endpoint for uptime checks and alerting.
- Added runtime rewrite for `robots.txt` and `sitemap.xml` host replacement to keep production domain correct.
- Frontend now supports drag-and-drop upload, retry button on failure, and lightweight client event/error logs.
- Added minification pipeline and generated `public/script.min.js` and `public/styles.min.css`.

## Cloudflare Dashboard Cache Rules (recommended)

Create these rules in **Cloudflare > Caching > Cache Rules**:

1. **Bypass API**
   - If: `http.request.uri.path starts_with "/api/"`
   - Then: Cache eligibility = Bypass cache

2. **Cache Static Assets Aggressively**
   - If: `http.request.uri.path matches "\\.(js|css|png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?)$"`
   - Then:
     - Cache eligibility = Eligible for cache
     - Edge TTL = Respect existing headers
     - Browser TTL = Respect existing headers

3. **Cache HTML Safely**
   - If: `http.request.method eq "GET"`
   - And: `not http.request.uri.path starts_with "/api/"`
   - Then:
     - Cache eligibility = Eligible for cache
     - Origin cache control = On
     - Cache key: Ignore query string for marketing params (`utm_*`, `gclid`, `fbclid`, `msclkid`)

## Cloudflare Dashboard Speed + Compression (recommended)

- Enable **Brotli** (Speed > Optimization).
- Enable **Auto Minify** for HTML/CSS/JS only if you are not serving pre-minified bundles for all pages.
- Enable **Early Hints**.
- Enable **HTTP/3 (with QUIC)**.
- Use **Polish** + **WebP** and **AVIF** support for images.

## Monitoring and Alerts

- Enable Worker Logs and create alerts for:
  - request count drop >30% day-over-day
  - 5xx error rate >1%
  - cache hit ratio below 70%
- Add dashboard chart split by `X-Edge-Cache` header values.
- Track `/api/health` from external uptime monitor.

## Long-Term Architecture Improvements

- Move heavy/paid conversions server-side into queued Workers with R2 object storage.
- Deduplicate repeated conversion jobs by content hash:
  - request hash key in KV/D1
  - output stored in R2
  - serve existing output on repeated requests
- Add regional queue workers for burst handling and predictable latency.
- Add analytics pipeline (Workers Analytics Engine / Logpush -> BI) for conversion funnel and SEO landing performance.
