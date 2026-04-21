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

## EasyPaisa IAP Integration

The Premium button is wired to a backend payment server (`payment-server.js`) that:

- Creates EasyPaisa checkout payloads
- Redirects to EasyPaisa hosted checkout
- Receives callback/postback
- Verifies payment status in-app and unlocks Premium

### Setup

1. Install backend dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and set:
   - `EASYPAISA_STORE_ID`
   - `EASYPAISA_HASH_KEY`
   - `EASYPAISA_SANDBOX` (`true` for staging)

3. Start payment server:

```bash
npm run payment-server
```

4. Start static frontend (e.g. `serve -l 5173`) and open:

`http://localhost:5173`

The frontend calls `http://localhost:8787/api/payments/easypaisa/*` for payment creation and verification.

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
