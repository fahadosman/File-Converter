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
