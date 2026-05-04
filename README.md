# ConvertPro Studio (Web)

Browser-based document and media converter app with multiple tools in one UI.

## What This Project Is

This project now runs as a static website (HTML/CSS/JavaScript only).  
No Python runtime or backend is required.

## Run Locally

Use any static file server and open the app in your browser:

```bash
python -m http.server 8000
```

Then visit:

`http://localhost:8000`

## Paddle Integration (Production)

Checkout runs in the browser with **Paddle.js** and a **client-side token** (no server route to create checkout). The Cloudflare Worker only verifies payments:

- `POST /api/payments/paddle/verify` checks the `transaction_id` with the Paddle API and sets the premium cookie when paid.
- Set `window.__PADDLE_CLIENT_TOKEN__` on the site (from Paddle Dashboard → Developer tools → Authentication). Use a `test_` token for sandbox and `live_` for production; it must match `PADDLE_ENV` / your catalog.

### Setup

1. Install dependencies:

```bash
npm install
```

2. Configure Worker secrets and vars:
   - Copy `.dev.vars.example` to `.dev.vars` for local development values.
   - `PADDLE_API_KEY` (secret: set with `wrangler secret put PADDLE_API_KEY`) — used only by `/api/payments/paddle/verify`, not exposed to the browser.
   - `PADDLE_PRICE_ID` (if different from default in frontend)
   - `PADDLE_ENV` (`live` or `sandbox`, default is `live`)

3. Run locally with Worker + assets:

```bash
npx wrangler dev
```

4. Deploy:

```bash
npm run deploy:cloudflare
```

## Project Structure

```text
PDF_To_Word/
├── index.html
├── styles.css
├── script.js
├── js/
│   └── config.js
└── README.md
```

## Notes

- All conversion logic runs client-side in the browser.
- Some tools load third-party libraries from CDN at runtime.
- Output files are downloaded directly by the browser.
