const FREE_LIMIT = 5;
const PREMIUM_OVERRIDE_KEY = "convertpro-premium-override";
const USAGE_COUNT_KEY = "convertpro-usage-count-persist";
const LOCALES = window.APP_LOCALES || {};
const PADDLE_PRICE_ID = "pri_01kpzq1hxhq4vxpjzsa0yn6vdj";
const PADDLE_PRODUCT_ID = "pro_01kpzq091w8qwadsgs3462rc8f";
const LOCAL_HOSTS = new Set(["", "localhost", "127.0.0.1"]);
const SECURITY_API_BASE =
  window.__PAYMENTS_API_BASE__ ||
  (LOCAL_HOSTS.has(window.location.hostname || "")
    ? "http://localhost:8899"
    : /^https?:$/i.test(window.location.protocol)
      ? window.location.origin
      : "");

const LIBS = {
  pdfjs: {
    url: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js",
    check: () => Boolean(window.pdfjsLib),
    afterLoad: () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
    },
  },
  jspdf: { url: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", check: () => Boolean(window.jspdf) },
  docx: { url: "https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js", check: () => Boolean(window.docx) },
  xlsx: { url: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", check: () => Boolean(window.XLSX) },
  pptx: { url: "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js", check: () => Boolean(window.PptxGenJS) },
  mammoth: { url: "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js", check: () => Boolean(window.mammoth) },
  html2pdf: { url: "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js", check: () => Boolean(window.html2pdf) },
  jszip: { url: "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js", check: () => Boolean(window.JSZip) },
  tesseract: { url: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js", check: () => Boolean(window.Tesseract) },
  pdfLib: { url: "https://unpkg.com/pdf-lib/dist/pdf-lib.min.js", check: () => Boolean(window.PDFLib) },
  marked: { url: "https://cdn.jsdelivr.net/npm/marked/marked.min.js", check: () => Boolean(window.marked) },
  heic2any: { url: "https://cdn.jsdelivr.net/npm/heic2any/dist/heic2any.min.js", check: () => Boolean(window.heic2any) },
  utif: { url: "https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.min.js", check: () => Boolean(window.UTIF) },
  lamejs: { url: "https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js", check: () => Boolean(window.lamejs) },
  pako: { url: "https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js", check: () => Boolean(window.pako) },
};

const tools = [
  { id: "merge-pdf", name: "Merge PDF", accept: ".pdf", multiple: true, description: "Combine PDFs into one", deps: ["pdfLib"] },
  { id: "split-pdf", name: "Split PDF", accept: ".pdf", description: "Split each page to separate PDF", deps: ["pdfLib", "jszip"] },
  { id: "compress-pdf", name: "Compress PDF", accept: ".pdf", description: "Optimize PDF size", deps: ["pdfLib"] },
  { id: "pdf-to-word", name: "PDF to Word", accept: ".pdf", description: "PDF text to DOCX", deps: ["pdfjs", "docx"] },
  { id: "pdf-to-ppt", name: "PDF to PowerPoint", accept: ".pdf", description: "PDF pages to PPT", deps: ["pdfjs", "pptx"] },
  { id: "pdf-to-excel", name: "PDF to Excel", accept: ".pdf", description: "PDF pages to XLSX", deps: ["pdfjs", "xlsx"] },
  { id: "pdf-to-jpg", name: "PDF to JPG", accept: ".pdf", description: "PDF pages to JPG ZIP", deps: ["pdfjs", "jszip"] },
  { id: "word-to-pdf", name: "Word to PDF", accept: ".docx", description: "DOCX to PDF", deps: ["mammoth", "html2pdf"] },
  { id: "ppt-to-pdf", name: "PowerPoint to PDF", accept: ".pptx", description: "PPTX text to PDF", deps: ["jszip", "jspdf"] },
  { id: "excel-to-pdf", name: "Excel to PDF", accept: ".xlsx,.xls", description: "Sheets to PDF", deps: ["xlsx", "html2pdf"] },
  { id: "jpg-to-pdf", name: "JPG to PDF", accept: "image/*", multiple: true, description: "Images to PDF", deps: ["jspdf"] },
  { id: "html-to-pdf", name: "HTML to PDF", htmlMode: true, description: "Paste HTML to PDF", deps: ["html2pdf"] },
  { id: "pdfa-converter", name: "PDF to PDF/A", accept: ".pdf", description: "Archival best effort", deps: ["pdfLib"] },
  { id: "ocr-pdf", name: "OCR PDF", accept: ".pdf", description: "Scanned PDF to text PDF", deps: ["pdfjs", "jspdf", "tesseract"] },
  { id: "pdf-to-epub", name: "PDF to EPUB", accept: ".pdf", description: "PDF text into EPUB", deps: ["pdfjs", "jszip"] },
  { id: "epub-to-pdf", name: "EPUB to PDF", accept: ".epub", description: "EPUB text to PDF", deps: ["jszip", "jspdf"] },
  { id: "pdf-to-mobi", name: "PDF to MOBI", accept: ".pdf", description: "Experimental MOBI", deps: ["pdfjs"] },
  { id: "mobi-to-pdf", name: "MOBI to PDF", accept: ".mobi,.azw,.azw3", description: "MOBI text to PDF", deps: ["jspdf"] },
  { id: "pdf-to-md", name: "PDF to Markdown", accept: ".pdf", description: "PDF text to MD", deps: ["pdfjs"] },
  { id: "md-to-pdf", name: "Markdown to PDF", accept: ".md,.markdown,.txt", description: "MD to PDF", deps: ["marked", "html2pdf"] },
  { id: "pdf-to-latex", name: "PDF to LaTeX", accept: ".pdf", description: "PDF text to TEX", deps: ["pdfjs"] },
  { id: "latex-to-pdf", name: "LaTeX to PDF", accept: ".tex,.txt", description: "TEX preview to PDF", deps: ["jspdf"] },
  { id: "pdf-to-jsonxml", name: "PDF to JSON/XML", accept: ".pdf", description: "Structured extraction", deps: ["pdfjs", "jszip"] },
  { id: "json-to-pdf", name: "JSON to PDF", accept: ".json", description: "JSON to PDF", deps: ["jspdf"] },
  { id: "xml-to-pdf", name: "XML to PDF", accept: ".xml", description: "XML to PDF", deps: ["jspdf"] },
  { id: "docx-to-odt", name: "DOCX to ODT", accept: ".docx", description: "Best effort ODT", deps: ["mammoth", "jszip"] },
  { id: "odt-to-docx", name: "ODT to DOCX", accept: ".odt", description: "ODT text to DOCX", deps: ["jszip", "docx"] },
  { id: "rtf-to-docx", name: "RTF to DOCX", accept: ".rtf", description: "RTF to DOCX", deps: ["docx"] },
  { id: "docx-to-rtf", name: "DOCX to RTF", accept: ".docx", description: "DOCX to RTF", deps: ["mammoth"] },
  { id: "png-to-jpg", name: "PNG to JPG", accept: ".png", description: "PNG image to JPG", deps: [] },
  { id: "jpg-to-png", name: "JPG to PNG", accept: ".jpg,.jpeg", description: "JPG image to PNG", deps: [] },
  { id: "webp-to-jpgpng", name: "WebP to JPG/PNG", accept: ".webp", description: "WebP to raster", deps: [] },
  { id: "heic-to-jpg", name: "HEIC to JPG", accept: ".heic,.heif", description: "HEIC to JPG", deps: ["heic2any"] },
  { id: "svg-to-raster", name: "SVG to PNG/JPG", accept: ".svg", description: "SVG to raster", deps: [] },
  { id: "tiff-to-raster", name: "TIFF to JPG/PNG", accept: ".tif,.tiff", description: "TIFF to raster", deps: ["utif"] },
  { id: "gif-to-mp4", name: "GIF to MP4", accept: ".gif", description: "WebM fallback", deps: [] },
  { id: "pdf-to-text", name: "PDF to Text", accept: ".pdf", description: "Extract text from PDF", deps: ["pdfjs"] },
  { id: "pdf-to-html", name: "PDF to HTML", accept: ".pdf", description: "Convert PDF to HTML", deps: ["pdfjs"] },
  { id: "word-to-html", name: "Word to HTML", accept: ".docx", description: "Convert Word to HTML", deps: ["mammoth"] },
  { id: "word-to-txt", name: "Word to TXT", accept: ".docx", description: "Convert Word to plain text", deps: ["mammoth"] },
  { id: "excel-to-csv", name: "Excel to CSV", accept: ".xls,.xlsx", description: "Convert Excel to CSV", deps: ["xlsx"] },
  { id: "excel-to-json", name: "Excel to JSON", accept: ".xls,.xlsx", description: "Convert Excel to JSON", deps: ["xlsx"] },
  { id: "powerpoint-to-video", name: "PowerPoint to Video", accept: ".ppt,.pptx", description: "Convert slides to video", deps: ["jszip"] },
  { id: "txt-to-pdf", name: "TXT to PDF", accept: ".txt", description: "Convert text files to PDF", deps: ["jspdf"] },
  { id: "rtf-to-pdf", name: "RTF to PDF", accept: ".rtf", description: "Convert RTF to PDF", deps: ["jspdf"] },
  { id: "webp-to-jpg", name: "WEBP to JPG", accept: ".webp", description: "Convert WEBP to JPG", deps: [] },
  { id: "webp-to-png", name: "WEBP to PNG", accept: ".webp", description: "Convert WEBP to PNG", deps: [] },
  { id: "bmp-to-jpg", name: "BMP to JPG", accept: ".bmp", description: "Convert BMP to JPG", deps: [] },
  { id: "tiff-to-jpg", name: "TIFF to JPG", accept: ".tif,.tiff", description: "Convert TIFF to JPG", deps: ["utif"] },
  { id: "svg-to-png", name: "SVG to PNG", accept: ".svg", description: "Convert SVG to PNG", deps: [] },
  { id: "svg-to-jpg", name: "SVG to JPG", accept: ".svg", description: "Convert SVG to JPG", deps: [] },
  { id: "raw-to-jpg", name: "RAW to JPG", accept: ".raw,.cr2,.nef,.arw", description: "Convert RAW to JPG", deps: [] },
  { id: "ico-to-png", name: "ICO to PNG", accept: ".ico", description: "Convert ICO to PNG", deps: [] },
  { id: "mp3-to-wav", name: "MP3 to WAV", accept: ".mp3", description: "Convert MP3 to WAV", deps: [] },
  { id: "wav-to-mp3", name: "WAV to MP3", accept: ".wav", description: "Convert WAV to MP3", deps: ["lamejs"] },
  { id: "mp3-to-aac", name: "MP3 to AAC", accept: ".mp3", description: "Convert MP3 to AAC", deps: [] },
  { id: "aac-to-mp3", name: "AAC to MP3", accept: ".aac", description: "Convert AAC to MP3", deps: ["lamejs"] },
  { id: "flac-to-mp3", name: "FLAC to MP3", accept: ".flac", description: "Convert FLAC to MP3", deps: ["lamejs"] },
  { id: "wma-to-mp3", name: "WMA to MP3", accept: ".wma", description: "Convert WMA to MP3", deps: ["lamejs"] },
  { id: "ogg-to-mp3", name: "OGG to MP3", accept: ".ogg", description: "Convert OGG to MP3", deps: ["lamejs"] },
  { id: "m4a-to-mp3", name: "M4A to MP3", accept: ".m4a", description: "Convert M4A to MP3", deps: ["lamejs"] },
  { id: "mp3-to-ogg", name: "MP3 to OGG", accept: ".mp3", description: "Convert MP3 to OGG", deps: [] },
  { id: "amr-to-mp3", name: "AMR to MP3", accept: ".amr", description: "Convert AMR to MP3", deps: ["lamejs"] },
  { id: "mp4-to-avi", name: "MP4 to AVI", accept: ".mp4", description: "Convert MP4 to AVI", deps: [] },
  { id: "avi-to-mp4", name: "AVI to MP4", accept: ".avi", description: "Convert AVI to MP4", deps: [] },
  { id: "mkv-to-mp4", name: "MKV to MP4", accept: ".mkv", description: "Convert MKV to MP4", deps: [] },
  { id: "mov-to-mp4", name: "MOV to MP4", accept: ".mov", description: "Convert MOV to MP4", deps: [] },
  { id: "mp4-to-mov", name: "MP4 to MOV", accept: ".mp4", description: "Convert MP4 to MOV", deps: [] },
  { id: "wmv-to-mp4", name: "WMV to MP4", accept: ".wmv", description: "Convert WMV to MP4", deps: [] },
  { id: "flv-to-mp4", name: "FLV to MP4", accept: ".flv", description: "Convert FLV to MP4", deps: [] },
  { id: "webm-to-mp4", name: "WEBM to MP4", accept: ".webm", description: "Convert WEBM to MP4", deps: [] },
  { id: "mp4-to-gif", name: "MP4 to GIF", accept: ".mp4", description: "Convert MP4 to GIF", deps: [] },
  { id: "mobi-to-epub", name: "MOBI to EPUB", accept: ".mobi,.azw,.azw3", description: "Convert MOBI to EPUB", deps: ["jszip"] },
  { id: "epub-to-mobi", name: "EPUB to MOBI", accept: ".epub", description: "Convert EPUB to MOBI", deps: ["jszip"] },
  { id: "azw-to-epub", name: "AZW to EPUB", accept: ".azw,.azw3", description: "Convert AZW to EPUB", deps: ["jszip"] },
  { id: "fb2-to-epub", name: "FB2 to EPUB", accept: ".fb2", description: "Convert FB2 to EPUB", deps: ["jszip"] },
  { id: "zip-to-rar", name: "ZIP to RAR", accept: ".zip", description: "Convert ZIP to RAR", deps: [] },
  { id: "rar-to-zip", name: "RAR to ZIP", accept: ".rar", description: "Convert RAR to ZIP", deps: ["jszip"] },
  { id: "zip-to-7z", name: "ZIP to 7Z", accept: ".zip", description: "Convert ZIP to 7Z", deps: [] },
  { id: "7z-to-zip", name: "7Z to ZIP", accept: ".7z", description: "Convert 7Z to ZIP", deps: ["jszip"] },
  { id: "tar-to-zip", name: "TAR to ZIP", accept: ".tar", description: "Convert TAR to ZIP", deps: ["jszip"] },
  { id: "gz-to-zip", name: "GZ to ZIP", accept: ".gz", description: "Convert GZ to ZIP", deps: ["jszip", "pako"] },
  { id: "json-to-xml", name: "JSON to XML", accept: ".json", description: "Convert JSON to XML", deps: [] },
  { id: "xml-to-json", name: "XML to JSON", accept: ".xml", description: "Convert XML to JSON", deps: [] },
  { id: "csv-to-json", name: "CSV to JSON", accept: ".csv", description: "Convert CSV to JSON", deps: [] },
  { id: "json-to-csv", name: "JSON to CSV", accept: ".json", description: "Convert JSON to CSV", deps: [] },
  { id: "csv-to-excel", name: "CSV to Excel", accept: ".csv", description: "Convert CSV to Excel", deps: ["xlsx"] },
  { id: "sql-to-csv", name: "SQL to CSV", accept: ".sql", description: "Convert SQL to CSV", deps: [] },
  { id: "html-to-word", name: "HTML to Word", accept: ".html,.htm", description: "Convert HTML to Word", deps: ["docx"] },
  { id: "dwg-to-dxf", name: "DWG to DXF", accept: ".dwg", description: "Convert DWG to DXF", deps: [] },
  { id: "dxf-to-dwg", name: "DXF to DWG", accept: ".dxf", description: "Convert DXF to DWG", deps: [] },
  { id: "stl-to-obj", name: "STL to OBJ", accept: ".stl", description: "Convert STL to OBJ", deps: [] },
  { id: "obj-to-stl", name: "OBJ to STL", accept: ".obj", description: "Convert OBJ to STL", deps: [] },
  { id: "fbx-to-obj", name: "FBX to OBJ", accept: ".fbx", description: "Convert FBX to OBJ", deps: [] },
  { id: "step-to-stl", name: "STEP to STL", accept: ".step,.stp", description: "Convert STEP to STL", deps: [] },
  { id: "video-to-audio", name: "Video to Audio", accept: ".mp4,.mov,.avi,.mkv", description: "Extract audio from video", deps: [] },
  { id: "audio-to-video", name: "Audio to Video", accept: ".mp3,.wav,.aac,.ogg", description: "Create video from audio", deps: [] },
  { id: "image-to-pdf", name: "Image to PDF", accept: "image/*", multiple: true, description: "Convert images to PDF", deps: ["jspdf"] },
  { id: "pdf-to-image", name: "PDF to Image", accept: ".pdf", description: "Convert PDF pages to images", deps: ["pdfjs", "jszip"] },
  { id: "document-to-image", name: "Document to Image", accept: ".pdf,.txt", description: "Convert documents to images", deps: ["pdfjs", "jszip"] },
  { id: "image-to-text-ocr", name: "Image to Text (OCR)", accept: "image/*", description: "Extract text from image", deps: ["tesseract"] },
  { id: "speech-to-text", name: "Speech to Text", accept: ".mp3,.wav,.m4a,.ogg", description: "Convert speech audio to text", deps: [] },
  { id: "text-to-speech", name: "Text to Speech", htmlMode: true, description: "Convert text into speech audio", deps: [] },
];

const TOOL_META = {
  "merge-pdf": { category: "organize", popularity: 10, created: 0 },
  "split-pdf": { category: "organize", popularity: 9, created: 0 },
  "compress-pdf": { category: "organize", popularity: 9, created: 0 },
  "pdf-to-word": { category: "convert", popularity: 10, created: 1 },
  "pdf-to-ppt": { category: "convert", popularity: 8, created: 2 },
  "pdf-to-excel": { category: "convert", popularity: 8, created: 3 },
  "pdf-to-jpg": { category: "images", popularity: 7, created: 4 },
  "word-to-pdf": { category: "convert", popularity: 10, created: 5 },
  "ppt-to-pdf": { category: "convert", popularity: 7, created: 6 },
  "excel-to-pdf": { category: "convert", popularity: 7, created: 7 },
  "jpg-to-pdf": { category: "images", popularity: 8, created: 8 },
  "html-to-pdf": { category: "workflow", popularity: 5, created: 9 },
  "pdfa-converter": { category: "organize", popularity: 6, created: 10 },
  "ocr-pdf": { category: "workflow", popularity: 8, created: 11 },
  "pdf-to-epub": { category: "ebooks", popularity: 5, created: 12 },
  "epub-to-pdf": { category: "ebooks", popularity: 5, created: 13 },
  "pdf-to-mobi": { category: "ebooks", popularity: 4, created: 14 },
  "mobi-to-pdf": { category: "ebooks", popularity: 4, created: 15 },
  "pdf-to-md": { category: "workflow", popularity: 6, created: 16 },
  "md-to-pdf": { category: "workflow", popularity: 6, created: 17 },
  "pdf-to-latex": { category: "workflow", popularity: 4, created: 18 },
  "latex-to-pdf": { category: "workflow", popularity: 4, created: 19 },
  "pdf-to-jsonxml": { category: "workflow", popularity: 5, created: 20 },
  "json-to-pdf": { category: "workflow", popularity: 5, created: 21 },
  "xml-to-pdf": { category: "workflow", popularity: 5, created: 22 },
  "docx-to-odt": { category: "workflow", popularity: 4, created: 23 },
  "odt-to-docx": { category: "workflow", popularity: 4, created: 24 },
  "rtf-to-docx": { category: "workflow", popularity: 4, created: 25 },
  "docx-to-rtf": { category: "workflow", popularity: 4, created: 26 },
  "png-to-jpg": { category: "images", popularity: 7, created: 27 },
  "jpg-to-png": { category: "images", popularity: 7, created: 28 },
  "webp-to-jpgpng": { category: "images", popularity: 6, created: 29 },
  "heic-to-jpg": { category: "images", popularity: 8, created: 30 },
  "svg-to-raster": { category: "images", popularity: 6, created: 31 },
  "tiff-to-raster": { category: "images", popularity: 5, created: 32 },
  "gif-to-mp4": { category: "images", popularity: 5, created: 33 },
  "pdf-to-text": { category: "workflow", popularity: 7, created: 34 },
  "pdf-to-html": { category: "workflow", popularity: 7, created: 35 },
  "word-to-html": { category: "workflow", popularity: 6, created: 36 },
  "word-to-txt": { category: "workflow", popularity: 6, created: 37 },
  "excel-to-csv": { category: "workflow", popularity: 6, created: 38 },
  "excel-to-json": { category: "workflow", popularity: 5, created: 39 },
  "powerpoint-to-video": { category: "workflow", popularity: 5, created: 40 },
  "txt-to-pdf": { category: "workflow", popularity: 6, created: 41 },
  "rtf-to-pdf": { category: "workflow", popularity: 5, created: 42 },
  "webp-to-jpg": { category: "images", popularity: 6, created: 43 },
  "webp-to-png": { category: "images", popularity: 6, created: 44 },
  "bmp-to-jpg": { category: "images", popularity: 5, created: 45 },
  "tiff-to-jpg": { category: "images", popularity: 5, created: 46 },
  "svg-to-png": { category: "images", popularity: 5, created: 47 },
  "svg-to-jpg": { category: "images", popularity: 5, created: 48 },
  "raw-to-jpg": { category: "images", popularity: 4, created: 49 },
  "ico-to-png": { category: "images", popularity: 4, created: 50 },
  "mp3-to-wav": { category: "workflow", popularity: 6, created: 51 },
  "wav-to-mp3": { category: "workflow", popularity: 6, created: 52 },
  "mp3-to-aac": { category: "workflow", popularity: 5, created: 53 },
  "aac-to-mp3": { category: "workflow", popularity: 5, created: 54 },
  "flac-to-mp3": { category: "workflow", popularity: 5, created: 55 },
  "wma-to-mp3": { category: "workflow", popularity: 4, created: 56 },
  "ogg-to-mp3": { category: "workflow", popularity: 5, created: 57 },
  "m4a-to-mp3": { category: "workflow", popularity: 5, created: 58 },
  "mp3-to-ogg": { category: "workflow", popularity: 4, created: 59 },
  "amr-to-mp3": { category: "workflow", popularity: 4, created: 60 },
  "mp4-to-avi": { category: "workflow", popularity: 5, created: 61 },
  "avi-to-mp4": { category: "workflow", popularity: 5, created: 62 },
  "mkv-to-mp4": { category: "workflow", popularity: 5, created: 63 },
  "mov-to-mp4": { category: "workflow", popularity: 5, created: 64 },
  "mp4-to-mov": { category: "workflow", popularity: 5, created: 65 },
  "wmv-to-mp4": { category: "workflow", popularity: 4, created: 66 },
  "flv-to-mp4": { category: "workflow", popularity: 4, created: 67 },
  "webm-to-mp4": { category: "workflow", popularity: 4, created: 68 },
  "mp4-to-gif": { category: "images", popularity: 5, created: 69 },
  "mobi-to-epub": { category: "ebooks", popularity: 4, created: 70 },
  "epub-to-mobi": { category: "ebooks", popularity: 4, created: 71 },
  "azw-to-epub": { category: "ebooks", popularity: 4, created: 72 },
  "fb2-to-epub": { category: "ebooks", popularity: 3, created: 73 },
  "zip-to-rar": { category: "workflow", popularity: 4, created: 74 },
  "rar-to-zip": { category: "workflow", popularity: 4, created: 75 },
  "zip-to-7z": { category: "workflow", popularity: 4, created: 76 },
  "7z-to-zip": { category: "workflow", popularity: 4, created: 77 },
  "tar-to-zip": { category: "workflow", popularity: 4, created: 78 },
  "gz-to-zip": { category: "workflow", popularity: 4, created: 79 },
  "json-to-xml": { category: "workflow", popularity: 5, created: 80 },
  "xml-to-json": { category: "workflow", popularity: 5, created: 81 },
  "csv-to-json": { category: "workflow", popularity: 5, created: 82 },
  "json-to-csv": { category: "workflow", popularity: 5, created: 83 },
  "csv-to-excel": { category: "workflow", popularity: 5, created: 84 },
  "sql-to-csv": { category: "workflow", popularity: 4, created: 85 },
  "html-to-word": { category: "workflow", popularity: 5, created: 86 },
  "dwg-to-dxf": { category: "workflow", popularity: 3, created: 87 },
  "dxf-to-dwg": { category: "workflow", popularity: 3, created: 88 },
  "stl-to-obj": { category: "workflow", popularity: 3, created: 89 },
  "obj-to-stl": { category: "workflow", popularity: 3, created: 90 },
  "fbx-to-obj": { category: "workflow", popularity: 3, created: 91 },
  "step-to-stl": { category: "workflow", popularity: 3, created: 92 },
  "video-to-audio": { category: "workflow", popularity: 6, created: 93 },
  "audio-to-video": { category: "workflow", popularity: 4, created: 94 },
  "image-to-pdf": { category: "images", popularity: 7, created: 95 },
  "pdf-to-image": { category: "images", popularity: 7, created: 96 },
  "document-to-image": { category: "images", popularity: 5, created: 97 },
  "image-to-text-ocr": { category: "workflow", popularity: 7, created: 98 },
  "speech-to-text": { category: "workflow", popularity: 6, created: 99 },
  "text-to-speech": { category: "workflow", popularity: 6, created: 100 },
};

const loadedLibPromises = new Map();
const state = {
  activeTool: tools[0],
  deviceId: "",
  theme: "dark",
  language: "en",
  isPremium: false,
  usageCount: 0,
  isBusy: false,
  query: "",
  activeCategory: "all",
  sortMode: "az",
  pendingDownload: null,
  toastTimer: null,
  securityApiReady: Boolean(SECURITY_API_BASE),
  convertedFileSignature: null,
  lastToolListRenderKey: "",
  lastFailedAction: null,
  conversionCache: new Map(),
};

function logClientEvent(event, details = {}) {
  try {
    const payload = {
      event,
      details,
      path: location.pathname,
      ts: new Date().toISOString(),
    };
    console.info("[client-event]", payload);
  } catch (_) {}
}

const TOOL_ICONS = {
  "merge-pdf": "🧷",
  "split-pdf": "✂️",
  "compress-pdf": "🗜️",
  "pdf-to-word": "📄",
  "pdf-to-ppt": "📊",
  "pdf-to-excel": "📈",
  "pdf-to-jpg": "🖼️",
  "word-to-pdf": "📝",
  "ppt-to-pdf": "📽️",
  "excel-to-pdf": "📑",
  "jpg-to-pdf": "📷",
  "html-to-pdf": "🌐",
  "pdfa-converter": "🗂️",
  "ocr-pdf": "🔍",
  "pdf-to-epub": "📚",
  "epub-to-pdf": "📕",
  "pdf-to-mobi": "📘",
  "mobi-to-pdf": "📗",
  "pdf-to-md": "✍️",
  "md-to-pdf": "📰",
  "pdf-to-latex": "📐",
  "latex-to-pdf": "🧪",
  "pdf-to-jsonxml": "🧬",
  "json-to-pdf": "🔢",
  "xml-to-pdf": "🧱",
  "docx-to-odt": "📃",
  "odt-to-docx": "📋",
  "rtf-to-docx": "🗒️",
  "docx-to-rtf": "📔",
  "png-to-jpg": "🖌️",
  "jpg-to-png": "🎨",
  "webp-to-jpgpng": "🧰",
  "heic-to-jpg": "📱",
  "svg-to-raster": "🧩",
  "tiff-to-raster": "🧾",
  "gif-to-mp4": "🎬",
  "pdf-to-text": "📜",
  "pdf-to-html": "🌍",
  "word-to-html": "🧾",
  "word-to-txt": "📝",
  "excel-to-csv": "📊",
  "excel-to-json": "🧮",
  "powerpoint-to-video": "🎞️",
  "txt-to-pdf": "📄",
  "rtf-to-pdf": "📑",
  "webp-to-jpg": "🖼️",
  "webp-to-png": "🖼️",
  "bmp-to-jpg": "🖌️",
  "tiff-to-jpg": "🖼️",
  "svg-to-png": "🧩",
  "svg-to-jpg": "🧩",
  "raw-to-jpg": "📷",
  "ico-to-png": "🧷",
  "mp3-to-wav": "🎵",
  "wav-to-mp3": "🎧",
  "mp3-to-aac": "🎶",
  "aac-to-mp3": "🎶",
  "flac-to-mp3": "🎼",
  "wma-to-mp3": "🎙️",
  "ogg-to-mp3": "🎤",
  "m4a-to-mp3": "🎛️",
  "mp3-to-ogg": "🎵",
  "amr-to-mp3": "📼",
  "mp4-to-avi": "🎬",
  "avi-to-mp4": "🎬",
  "mkv-to-mp4": "🎬",
  "mov-to-mp4": "🎬",
  "mp4-to-mov": "🎬",
  "wmv-to-mp4": "🎬",
  "flv-to-mp4": "🎬",
  "webm-to-mp4": "🎬",
  "mp4-to-gif": "🎞️",
  "mobi-to-epub": "📚",
  "epub-to-mobi": "📚",
  "azw-to-epub": "📚",
  "fb2-to-epub": "📚",
  "zip-to-rar": "🗜️",
  "rar-to-zip": "🗜️",
  "zip-to-7z": "🗜️",
  "7z-to-zip": "🗜️",
  "tar-to-zip": "🗜️",
  "gz-to-zip": "🗜️",
  "json-to-xml": "🧬",
  "xml-to-json": "🧬",
  "csv-to-json": "🧬",
  "json-to-csv": "🧬",
  "csv-to-excel": "📈",
  "sql-to-csv": "🧮",
  "html-to-word": "🌐",
  "dwg-to-dxf": "📐",
  "dxf-to-dwg": "📐",
  "stl-to-obj": "🧱",
  "obj-to-stl": "🧱",
  "fbx-to-obj": "🧱",
  "step-to-stl": "🧱",
  "video-to-audio": "🎞️",
  "audio-to-video": "🎵",
  "image-to-pdf": "🖼️",
  "pdf-to-image": "🖼️",
  "document-to-image": "📄",
  "image-to-text-ocr": "🔍",
  "speech-to-text": "🗣️",
  "text-to-speech": "🔊",
};

const els = {
  appShell: document.querySelector(".app-shell"),
  viewHome: document.getElementById("viewHome"),
  viewTool: document.getElementById("viewTool"),
  backToTools: document.getElementById("backToTools"),
  toolList: document.getElementById("toolList"),
  toolSearch: document.getElementById("toolSearch"),
  sortFilter: document.getElementById("sortFilter"),
  toolTitle: document.getElementById("toolTitle"),
  toolDescription: document.getElementById("toolDescription"),
  fileGroup: document.getElementById("fileGroup"),
  fileInput: document.getElementById("fileInput"),
  fileInputLabel: document.getElementById("fileInputLabel"),
  selectedFileRow: document.getElementById("selectedFileRow"),
  selectedFileName: document.getElementById("selectedFileName"),
  replaceFileBtn: document.getElementById("replaceFileBtn"),
  removeFileBtn: document.getElementById("removeFileBtn"),
  htmlInputGroup: document.getElementById("htmlInputGroup"),
  htmlContent: document.getElementById("htmlContent"),
  convertBtn: document.getElementById("convertBtn"),
  resetBtn: document.getElementById("resetBtn"),
  status: document.getElementById("status"),
  themeBulb: document.getElementById("themeBulb"),
  brandCrown: document.getElementById("brandCrown"),
  brandTitle: document.getElementById("brandTitle"),
  planStatus: document.getElementById("planStatus"),
  upgradeBtn: document.getElementById("upgradeBtn"),
  iapBanner: document.querySelector(".iap-banner"),
  downloadBtn: document.getElementById("downloadBtn"),
  downloadInfo: document.getElementById("downloadInfo"),
  topFilterButtons: Array.from(document.querySelectorAll(".filter-btn")),
  pillFilters: Array.from(document.querySelectorAll(".pill-filter")),
  relatedToolButtons: Array.from(document.querySelectorAll(".related-tool")),
  languageSelect: document.getElementById("languageSelect"),
  statusMeterFill: document.getElementById("statusMeterFill"),
  retryBtn: document.getElementById("retryBtn"),
  toast: document.getElementById("toast"),
  premiumLimitDialog: document.getElementById("premiumLimitDialog"),
  premiumDialogCloseBtn: document.getElementById("premiumDialogCloseBtn"),
  premiumDialogUpgradeBtn: document.getElementById("premiumDialogUpgradeBtn"),
};

const base = (n) => n.replace(/\.[^/.]+$/, "");
const readText = (f) => f.text();
const readBuf = (f) => f.arrayBuffer();
const IS_SAFARI =
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent || "") &&
  !/crios|fxios|edgios/i.test(navigator.userAgent || "");
const IS_MAC = /mac/i.test(navigator.platform || navigator.userAgent || "");
const IS_APPLE_DEVICE = /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent || "");
let renderToolButtonsRaf = 0;
const HAS_CONVERTER_APP = Boolean(
  els.appShell &&
  els.toolList &&
  els.convertBtn &&
  els.resetBtn &&
  els.fileInput &&
  els.status
);

function loadGlobalUiScript() {
  if (window.__GLOBAL_UI_LOADED__) return;
  if (document.querySelector('script[data-global-ui="1"]')) return;
  const script = document.createElement("script");
  script.src = "/global-ui.js";
  script.defer = true;
  script.dataset.globalUi = "1";
  document.head.appendChild(script);
  window.__GLOBAL_UI_LOADED__ = true;
}

function scheduleRenderToolButtons() {
  if (renderToolButtonsRaf) cancelAnimationFrame(renderToolButtonsRaf);
  renderToolButtonsRaf = requestAnimationFrame(() => {
    renderToolButtonsRaf = 0;
    renderToolButtons();
  });
}

function t(key, vars = {}) {
  const dict = LOCALES[state.language] || LOCALES.en || {};
  const fallback = (LOCALES.en || {})[key] || key;
  const template = dict[key] || fallback;
  return String(template).replace(/\{(\w+)\}/g, (_, token) => (vars[token] ?? `{${token}}`));
}

function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (!key) return;
    node.innerHTML = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    if (!key) return;
    node.setAttribute("placeholder", t(key));
  });

  const topMap = { all: "All Tools", workflow: "Workflows", organize: "Organize PDF", convert: "Convert PDF" };
  const pillMap = { all: "All", workflow: "Workflows", organize: "Organize PDF", convert: "Convert PDF", images: "Images", ebooks: "eBooks" };
  els.topFilterButtons.forEach((btn) => {
    btn.textContent = t(`nav.top.${btn.dataset.filter}`) === `nav.top.${btn.dataset.filter}` ? topMap[btn.dataset.filter] : t(`nav.top.${btn.dataset.filter}`);
  });
  els.pillFilters.forEach((pill) => {
    pill.textContent = t(`nav.pill.${pill.dataset.filter}`) === `nav.pill.${pill.dataset.filter}` ? pillMap[pill.dataset.filter] : t(`nav.pill.${pill.dataset.filter}`);
  });
}

function localizeTools() {
  tools.forEach((tool) => {
    const nameKey = `tools.${tool.id}.name`;
    const descKey = `tools.${tool.id}.description`;
    const localizedName = t(nameKey);
    const localizedDesc = t(descKey);
    if (localizedName !== nameKey) tool.name = localizedName;
    if (localizedDesc !== descKey) tool.description = localizedDesc;
  });

  els.relatedToolButtons.forEach((button) => {
    const tool = tools.find((item) => item.id === button.dataset.toolId);
    if (tool) button.textContent = tool.name;
  });
}

function applyLanguage(language) {
  state.language = LOCALES[language] ? language : "en";
  document.documentElement.lang = state.language;
  if (els.languageSelect) els.languageSelect.value = state.language;
  applyStaticTranslations();
  localizeTools();
  refreshPlan();
  configureUI();
  scheduleRenderToolButtons();
}

function initLanguage() {
  const saved = localStorage.getItem("convertpro-language");
  if (saved && LOCALES[saved]) {
    applyLanguage(saved);
    return;
  }
  const candidates = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language || "en"];
  let detected = "en";
  for (const lang of candidates) {
    const base = String(lang || "").toLowerCase().split("-")[0];
    if (LOCALES[base]) {
      detected = base;
      break;
    }
  }
  applyLanguage(detected);
}

function setStatus(message, type = "ok") {
  els.status.textContent = message;
  els.status.classList.remove("error", "busy");
  if (type === "error") els.status.classList.add("error");
  if (type === "busy") els.status.classList.add("busy");
  if (els.statusMeterFill) {
    const width = type === "busy" ? "72%" : type === "error" ? "100%" : "100%";
    els.statusMeterFill.style.width = width;
    els.statusMeterFill.style.background =
      type === "error"
        ? "linear-gradient(90deg, #ff6f91, #ff956f)"
        : "linear-gradient(90deg, var(--accent), var(--accent-2))";
  }
  if (type === "error") showToast(message);
  if (els.retryBtn) {
    const showRetry = type === "error" && typeof state.lastFailedAction === "function";
    els.retryBtn.classList.toggle("hidden", !showRetry);
    els.retryBtn.disabled = state.isBusy;
  }
}

function showToast(message) {
  showToastWithType(message, "error");
}

function showToastWithType(message, type = "error") {
  if (!els.toast) return;
  if (state.toastTimer) clearTimeout(state.toastTimer);
  els.toast.textContent = String(message || "Something went wrong.");
  els.toast.classList.remove("success");
  if (type === "success") els.toast.classList.add("success");
  els.toast.classList.add("show");
  state.toastTimer = setTimeout(() => {
    els.toast.classList.remove("show");
    els.toast.classList.remove("success");
  }, 3000);
}

function setBusy(busy) {
  state.isBusy = busy;
  if (state.activeTool.htmlMode) {
    els.convertBtn.disabled = busy;
  } else {
    updateFileSelectionUI(Array.from(els.fileInput.files || []));
  }
  els.appShell.classList.toggle("is-busy", busy);
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  if (els.themeBulb) {
    const readable = theme === "light" ? "Light" : "Dark";
    els.themeBulb.setAttribute("title", `Theme: ${readable}`);
    els.themeBulb.setAttribute("aria-label", `Switch to ${theme === "light" ? "dark" : "light"} mode`);
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem("convertpro-theme");
  const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  const chosen = savedTheme === "light" || savedTheme === "dark" ? savedTheme : (prefersLight ? "light" : "dark");
  applyTheme(chosen);
  if (IS_SAFARI) document.documentElement.classList.add("safari-optimized");
  if (IS_MAC) document.documentElement.classList.add("mac-performance");
  if (IS_APPLE_DEVICE) document.documentElement.classList.add("apple-performance");
}

function initScrollPerformanceMode() {
  if (!IS_APPLE_DEVICE) return;
  let rafId = 0;
  let scrollEndTimer = 0;
  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      document.documentElement.classList.add("is-scrolling");
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = window.setTimeout(() => {
        document.documentElement.classList.remove("is-scrolling");
      }, 140);
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}

function playThemeToggleSound(isLightMode) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(isLightMode ? 960 : 620, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(isLightMode ? 1280 : 460, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.13);
}

function toggleThemeWithSound() {
  const nextTheme = state.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("convertpro-theme", nextTheme);
  setTimeout(() => playThemeToggleSound(nextTheme === "light"), 0);
}

function refreshPlan() {
  const crown = '<span class="iap-cta__icon" aria-hidden="true">👑</span> ';
  if (els.brandTitle) {
    els.brandTitle.textContent = "Files Converter";
  }
  if (els.brandCrown) els.brandCrown.classList.toggle("hidden", !state.isPremium);
  if (state.isPremium) {
    els.planStatus.textContent = t("plan.active");
    els.upgradeBtn.innerHTML = `${crown}${t("plan.enabled")}`;
    els.upgradeBtn.disabled = true;
    if (els.iapBanner) els.iapBanner.classList.add("hidden");
    return;
  }
  els.planStatus.textContent = t("plan.free", { used: state.usageCount, limit: FREE_LIMIT });
  els.upgradeBtn.innerHTML = `${crown}${t("plan.getPremium")} - $2`;
  els.upgradeBtn.disabled = false;
  if (els.iapBanner) els.iapBanner.classList.remove("hidden");
}

function persistPlanState() {
  localStorage.setItem(USAGE_COUNT_KEY, String(Math.max(0, Number(state.usageCount || 0))));
  if (state.isPremium) localStorage.setItem(PREMIUM_OVERRIDE_KEY, "1");
}

function syncUsageCount(nextCount, options = {}) {
  const numeric = Math.max(0, Number(nextCount || 0));
  if (options.maxWithCurrent) {
    state.usageCount = Math.max(Number(state.usageCount || 0), numeric);
  } else {
    state.usageCount = numeric;
  }
  persistPlanState();
}

function initPlan() {
  state.deviceId = "";
  state.isPremium = localStorage.getItem(PREMIUM_OVERRIDE_KEY) === "1";
  state.usageCount = Math.max(0, Number(localStorage.getItem(USAGE_COUNT_KEY) || 0));
  persistPlanState();
  refreshPlan();
}

function upgrade() {
  startPaddleCheckout();
}

function openPremiumLimitDialog() {
  showToolView();
  setStatus(t("error.freeLimit"), "error");
  if (!els.premiumLimitDialog) return;
  els.premiumLimitDialog.classList.remove("hidden");
  els.premiumLimitDialog.removeAttribute("hidden");
}

function closePremiumLimitDialog() {
  if (!els.premiumLimitDialog) return;
  els.premiumLimitDialog.classList.add("hidden");
  els.premiumLimitDialog.setAttribute("hidden", "");
}

function buildFileSignature(file, toolId) {
  if (!file) return "";
  return [toolId, file.name || "", file.size || 0, file.lastModified || 0].join("|");
}

function updateFileSelectionUI(files) {
  const list = Array.isArray(files) ? files : [];
  if (state.activeTool.htmlMode) {
    if (els.selectedFileRow) els.selectedFileRow.classList.add("hidden");
    els.convertBtn.disabled = state.isBusy;
    return;
  }

  if (!list.length) {
    if (els.selectedFileRow) els.selectedFileRow.classList.add("hidden");
    els.convertBtn.disabled = true;
    return;
  }

  const signature = buildFileSignature(list[0], state.activeTool.id);
  if (els.selectedFileName) {
    els.selectedFileName.textContent = list.length > 1 ? `${list.length} files selected` : list[0].name;
  }
  if (els.selectedFileRow) els.selectedFileRow.classList.remove("hidden");
  els.convertBtn.disabled = state.isBusy || signature === state.convertedFileSignature;
}

function canUse() {
  return state.isPremium || state.usageCount < FREE_LIMIT;
}

function addUsageFallback() {
  if (state.isPremium) return;
  syncUsageCount(state.usageCount + 1);
  refreshPlan();
}

async function startUsageSession() {
  if (!SECURITY_API_BASE) throw new Error("Secure usage server URL is not configured.");
  const response = await fetch(`${SECURITY_API_BASE}/api/usage/session/start`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error("Usage security service unavailable.");
  const payload = await response.json();
  state.securityApiReady = true;
  syncUsageCount(payload.usageCount, { maxWithCurrent: true });
  const backendPremium = Boolean(payload.isPremium);
  state.isPremium = state.isPremium || backendPremium;
  persistPlanState();
  refreshPlan();
}

async function assertSessionCanUse() {
  if (!state.securityApiReady) {
    if (!canUse()) {
      const error = new Error(t("error.freeLimit"));
      error.code = "FREE_LIMIT_REACHED";
      throw error;
    }
    return;
  }
  const response = await fetch(`${SECURITY_API_BASE}/api/usage/session/status`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Unable to verify usage security.");
  const payload = await response.json();
  syncUsageCount(payload.usageCount, { maxWithCurrent: true });
  const backendPremium = Boolean(payload.isPremium);
  state.isPremium = state.isPremium || backendPremium;
  persistPlanState();
  refreshPlan();
  if (state.usageCount >= FREE_LIMIT) {
    const error = new Error(t("error.freeLimit"));
    error.code = "FREE_LIMIT_REACHED";
    throw error;
  }
}

async function secureConsumeUsage() {
  if (!state.securityApiReady) {
    addUsageFallback();
    return;
  }
  const response = await fetch(`${SECURITY_API_BASE}/api/usage/session/consume`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const backendSaysLimit =
      response.status === 403 ||
      Number(payload.usageCount || 0) >= FREE_LIMIT ||
      String(payload.error || "").toLowerCase().includes("limit");
    if (backendSaysLimit) {
      syncUsageCount(payload.usageCount || FREE_LIMIT, { maxWithCurrent: true });
      state.isPremium = Boolean(payload.isPremium);
      persistPlanState();
      refreshPlan();
      const error = new Error(t("error.freeLimit"));
      error.code = "FREE_LIMIT_REACHED";
      throw error;
    }
    throw new Error(payload.error || "Usage security check failed.");
  }
  syncUsageCount(payload.usageCount || state.usageCount, { maxWithCurrent: true });
  const backendPremium = Boolean(payload.isPremium);
  state.isPremium = state.isPremium || backendPremium;
  persistPlanState();
  refreshPlan();
}

function dl(blob, name) {
  state.pendingDownload = { blob, name };
  els.downloadBtn.disabled = false;
  els.downloadInfo.textContent = t("download.ready", { name });
}

function triggerDownload() {
  if (!state.pendingDownload) return;
  const { blob, name } = state.pendingDownload;
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(u);
}

function clearPendingDownload(message = t("download.waiting")) {
  state.pendingDownload = null;
  els.downloadBtn.disabled = true;
  els.downloadInfo.textContent = message;
}

/** Paddle Billing transaction ids use the txn_ prefix + alphanumeric suffix (avoid bogus URL params). */
function isPaddleTransactionId(value) {
  return /^txn_[0-9a-z]{4,}$/i.test(String(value || "").trim());
}

function startPaddleCheckout() {
  if (!SECURITY_API_BASE) {
    setStatus(t("error.paymentInitFailed"), "error");
    return;
  }
  setStatus(t("status.paymentInit"), "busy");
  fetch(`${SECURITY_API_BASE}/api/payments/paddle/checkout`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId: PADDLE_PRICE_ID, productId: PADDLE_PRODUCT_ID }),
  })
    .then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const parts = [payload.error, payload.hint].filter(Boolean);
        const msg = parts.length ? parts.join(" — ") : t("error.paymentInitFailed");
        const err = new Error(msg);
        if (payload.checkoutOrigin) err.checkoutOrigin = payload.checkoutOrigin;
        throw err;
      }
      if (!payload.url) throw new Error("Unable to start checkout. Missing checkout URL.");
      window.location.assign(payload.url);
    })
    .catch((error) => {
      setStatus(error.message || t("error.paymentInitFailed"), "error");
    });
}

async function syncPaymentFromReturn() {
  try {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash || "";
    const hashQuery = hash.includes("?") ? hash.split("?")[1] : "";
    const hashParams = new URLSearchParams(hashQuery);

    const transactionId =
      params.get("transaction_id") ||
      hashParams.get("transaction_id") ||
      params.get("_ptxn") ||
      hashParams.get("_ptxn");
    const trimmedId = String(transactionId || "").trim();
    if (!state.isPremium && trimmedId && !isPaddleTransactionId(trimmedId)) {
      console.warn("[payment] Ignoring non-Paddle transaction id in URL (prevents verify errors).", trimmedId);
    }
    if (!state.isPremium && trimmedId && isPaddleTransactionId(trimmedId) && SECURITY_API_BASE) {
      const verifyResponse = await fetch(`${SECURITY_API_BASE}/api/payments/paddle/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: trimmedId }),
      });
      const verifyPayload = await verifyResponse.json().catch(() => ({}));
      if (!verifyResponse.ok) throw new Error(verifyPayload.error || t("error.paymentVerifyFailed"));
      if (verifyPayload.isPremium) {
        state.isPremium = true;
        persistPlanState();
        closePremiumLimitDialog();
        refreshPlan();
        setStatus(t("status.premiumActivated"));
        showToastWithType(t("status.premiumActivated"), "success");
      }
    }

    params.delete("transaction_id");
    hashParams.delete("transaction_id");
    params.delete("_ptxn");
    hashParams.delete("_ptxn");
    const cleanHash = hashParams.toString() ? `#/?${hashParams.toString()}` : "";
    const clean = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${cleanHash}`;
    window.history.replaceState({}, "", clean);
    applyRoute();
  } catch (error) {
    const raw = String(error.message || "");
    if (/URL called is invalid/i.test(raw)) {
      console.warn("[payment] Paddle verify returned invalid_url — usually a bad transaction id in the return URL.", raw);
    }
    setStatus(raw || t("error.paymentVerifyFailed"), "error");
  }
}

function clearLegacyClientStorage() {
  const keysToDelete = [
    "convertpro-device-id",
    "convertpro-language",
    "convertpro-plan",
    "convertpro-usage-count",
  ];
  keysToDelete.forEach((key) => localStorage.removeItem(key));
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("convertpro-plan:") || key.startsWith("convertpro-usage-count:")) {
      localStorage.removeItem(key);
    }
  });
}

function fileMatchesAccept(file, accept) {
  if (!accept) return true;
  const parts = accept.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (!parts.length) return true;
  const fileName = (file.name || "").toLowerCase();
  const mime = (file.type || "").toLowerCase();

  return parts.some((part) => {
    if (part === "image/*") return mime.startsWith("image/");
    if (part.endsWith("/*")) return mime.startsWith(part.slice(0, -1));
    if (part.startsWith(".")) return fileName.endsWith(part);
    return mime === part;
  });
}

function ensureLib(name) {
  const lib = LIBS[name];
  if (!lib) return Promise.reject(new Error(`Unknown library: ${name}`));
  if (lib.check()) return Promise.resolve();
  if (loadedLibPromises.has(name)) return loadedLibPromises.get(name);

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = lib.url;
    script.async = true;
    script.onload = () => {
      try {
        if (lib.afterLoad) lib.afterLoad();
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = () => reject(new Error(`Failed loading ${name}`));
    document.head.appendChild(script);
  });

  loadedLibPromises.set(name, promise);
  return promise;
}

async function ensureDeps(tool) {
  await Promise.all((tool.deps || []).map(ensureLib));
}

async function pdfPages(buf) {
  const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
  const arr = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const p = await pdf.getPage(i);
    const c = await p.getTextContent();
    arr.push(c.items.map((x) => x.str).join(" ").trim() || "(No text)");
  }
  return arr;
}

async function pageCanvas(pdf, n, scale = 2) {
  const p = await pdf.getPage(n);
  const v = p.getViewport({ scale });
  const c = document.createElement("canvas");
  c.width = v.width;
  c.height = v.height;
  await p.render({ canvasContext: c.getContext("2d"), viewport: v }).promise;
  return c;
}

async function decodeAudio(buf) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
  try { return await ctx.decodeAudioData(buf.slice(0)); } finally { ctx.close(); }
}

function audioToWav(ab) {
  const ch = ab.numberOfChannels;
  const sr = ab.sampleRate;
  const len = ab.length;
  const interleaved = new Float32Array(len * ch);
  for (let c = 0; c < ch; c++) { const d = ab.getChannelData(c); for (let i = 0; i < len; i++) interleaved[i * ch + c] = d[i]; }
  const buf = new ArrayBuffer(44 + interleaved.length * 2);
  const v = new DataView(buf);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, "RIFF"); v.setUint32(4, 36 + interleaved.length * 2, true); ws(8, "WAVE");
  ws(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
  ws(36, "data"); v.setUint32(40, interleaved.length * 2, true);
  for (let i = 0; i < interleaved.length; i++) { const s = Math.max(-1, Math.min(1, interleaved[i])); v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true); }
  return new Blob([buf], { type: "audio/wav" });
}

function audioToMp3(ab) {
  const ch = ab.numberOfChannels;
  const sr = ab.sampleRate;
  const enc = new window.lamejs.Mp3Encoder(ch, sr, 128);
  const left = ab.getChannelData(0);
  const right = ch > 1 ? ab.getChannelData(1) : left;
  const len = ab.length;
  const l16 = new Int16Array(len);
  const r16 = new Int16Array(len);
  for (let i = 0; i < len; i++) { l16[i] = Math.max(-32768, Math.min(32767, Math.round(left[i] * 32767))); r16[i] = Math.max(-32768, Math.min(32767, Math.round(right[i] * 32767))); }
  const parts = [];
  const bs = 1152;
  for (let i = 0; i < len; i += bs) { const b = ch > 1 ? enc.encodeBuffer(l16.subarray(i, i + bs), r16.subarray(i, i + bs)) : enc.encodeBuffer(l16.subarray(i, i + bs)); if (b.length > 0) parts.push(new Uint8Array(b)); }
  const end = enc.flush();
  if (end.length > 0) parts.push(new Uint8Array(end));
  return new Blob(parts, { type: "audio/mpeg" });
}

function parseTar(buf) {
  const files = [];
  const view = new Uint8Array(buf);
  let offset = 0;
  while (offset < view.length - 512) {
    const header = view.slice(offset, offset + 512);
    if (header.every(b => b === 0)) break;
    let name = "";
    for (let i = 0; i < 100 && header[i]; i++) name += String.fromCharCode(header[i]);
    name = name.trim();
    let sizeStr = "";
    for (let i = 124; i < 136 && header[i]; i++) sizeStr += String.fromCharCode(header[i]);
    const size = parseInt(sizeStr.trim(), 8) || 0;
    const type = header[156];
    offset += 512;
    if (name && size > 0 && (type === 48 || type === 0)) {
      files.push({ name, data: view.slice(offset, offset + size) });
    }
    offset += Math.ceil(size / 512) * 512;
  }
  return files;
}

function parseStl(buf) {
  const text = new TextDecoder().decode(buf);
  if (text.trimStart().startsWith("solid") && text.includes("facet")) {
    const verts = [];
    const normals = [];
    const facetRe = /facet\s+normal\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)/gi;
    const vertRe = /vertex\s+([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)/gi;
    let m;
    while ((m = facetRe.exec(text))) normals.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
    while ((m = vertRe.exec(text))) verts.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
    return { verts, normals };
  }
  const dv = new DataView(buf instanceof ArrayBuffer ? buf : buf.buffer);
  const numTri = dv.getUint32(80, true);
  const verts = [];
  const normals = [];
  for (let i = 0; i < numTri; i++) {
    const off = 84 + i * 50;
    normals.push([dv.getFloat32(off, true), dv.getFloat32(off + 4, true), dv.getFloat32(off + 8, true)]);
    for (let j = 0; j < 3; j++) verts.push([dv.getFloat32(off + 12 + j * 12, true), dv.getFloat32(off + 16 + j * 12, true), dv.getFloat32(off + 20 + j * 12, true)]);
  }
  return { verts, normals };
}

function stlToObj(stl) {
  const lines = [];
  stl.verts.forEach(v => lines.push(`v ${v[0]} ${v[1]} ${v[2]}`));
  for (let i = 0; i < stl.verts.length; i += 3) lines.push(`f ${i + 1} ${i + 2} ${i + 3}`);
  return lines.join("\n");
}

function parseObj(text) {
  const verts = [];
  const faces = [];
  text.split("\n").forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === "v") verts.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
    if (parts[0] === "f") faces.push(parts.slice(1).map(x => parseInt(x.split("/")[0]) - 1));
  });
  return { verts, faces };
}

function objToStl(obj) {
  const lines = ["solid model"];
  obj.faces.forEach(face => {
    if (face.length >= 3) {
      const a = obj.verts[face[0]] || [0, 0, 0];
      const b = obj.verts[face[1]] || [0, 0, 0];
      const c = obj.verts[face[2]] || [0, 0, 0];
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      lines.push(`facet normal ${n[0]} ${n[1]} ${n[2]}`);
      lines.push("  outer loop");
      lines.push(`    vertex ${a[0]} ${a[1]} ${a[2]}`);
      lines.push(`    vertex ${b[0]} ${b[1]} ${b[2]}`);
      lines.push(`    vertex ${c[0]} ${c[1]} ${c[2]}`);
      lines.push("  endloop");
      lines.push("endfacet");
    }
  });
  lines.push("endsolid model");
  return lines.join("\n");
}

function buildEpub(zip, title, chapters) {
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.folder("META-INF").file("container.xml", '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
  const o = zip.folder("OEBPS");
  const m = [];
  const s = [];
  chapters.forEach((ch, i) => {
    const id = `c${i + 1}`;
    const href = `chapter-${i + 1}.xhtml`;
    m.push(`<item id="${id}" href="${href}" media-type="application/xhtml+xml"/>`);
    s.push(`<itemref idref="${id}"/>`);
    const safe = (ch.text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
    o.file(href, `<html xmlns="http://www.w3.org/1999/xhtml"><head><title>${ch.title || "Chapter"}</title></head><body><h1>${(ch.title || "Chapter " + (i + 1)).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</h1><p>${safe}</p></body></html>`);
  });
  const safeTitle = (title || "Untitled").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  o.file("content.opf", `<?xml version="1.0"?><package version="3.0" xmlns="http://www.idpf.org/2007/opf"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${safeTitle}</dc:title><dc:language>en</dc:language></metadata><manifest>${m.join("")}</manifest><spine>${s.join("")}</spine></package>`);
}

async function reEncodeVideo(file, outExt) {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.src = url;
  await new Promise((res, rej) => { video.onloadeddata = res; video.onerror = () => rej(new Error("Browser cannot decode this video format. Try MP4 or WebM input.")); });
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext("2d");
  const stream = canvas.captureStream(30);
  try {
    const ac = new AudioContext();
    const src = ac.createMediaElementSource(video);
    const dest = ac.createMediaStreamDestination();
    src.connect(dest);
    src.connect(ac.destination);
    dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
  } catch (e) { /* no audio track or not supported */ }
  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
  const rec = new MediaRecorder(stream, { mimeType: mime });
  const chunks = [];
  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  rec.start(100);
  video.muted = false;
  video.play();
  const draw = () => { if (!video.paused && !video.ended) { ctx.drawImage(video, 0, 0, canvas.width, canvas.height); requestAnimationFrame(draw); } };
  draw();
  await new Promise(res => { video.onended = res; video.onpause = res; });
  rec.stop();
  await new Promise(res => { rec.onstop = res; });
  URL.revokeObjectURL(url);
  return new Blob(chunks, { type: "video/webm" });
}

async function toDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

async function loadImg(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

async function toRaster(file, ext, sourceType = "dataurl") {
  let src;
  if (sourceType === "svg") src = URL.createObjectURL(new Blob([await readText(file)], { type: "image/svg+xml" }));
  else src = await toDataUrl(file);
  const img = await loadImg(src);
  if (sourceType === "svg") URL.revokeObjectURL(src);
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  c.getContext("2d").drawImage(img, 0, 0);
  const mime = ext === "jpg" ? "image/jpeg" : "image/png";
  c.toBlob((blob) => dl(blob, `${base(file.name)}.${ext}`), mime, 0.92);
}

async function htmlToPdfBlob(element) {
  return window.html2pdf().from(element).outputPdf("blob");
}

async function runTool(tool, files) {
  const file = files[0];
  const { jsPDF } = window.jspdf || {};

  if (tool.id === "merge-pdf") {
    if (files.length < 2) throw new Error("Select at least two PDF files to merge.");
    const merged = await window.PDFLib.PDFDocument.create();
    for (const currentFile of files) {
      const src = await window.PDFLib.PDFDocument.load(await readBuf(currentFile));
      const pageIndices = src.getPageIndices();
      const copiedPages = await merged.copyPages(src, pageIndices);
      copiedPages.forEach((p) => merged.addPage(p));
    }
    const out = await merged.save();
    dl(new Blob([out], { type: "application/pdf" }), "merged-document.pdf");
    return;
  }

  if (tool.id === "split-pdf") {
    const src = await window.PDFLib.PDFDocument.load(await readBuf(file));
    const zip = new window.JSZip();
    const pages = src.getPageIndices();
    for (const pageIndex of pages) {
      const outDoc = await window.PDFLib.PDFDocument.create();
      const [page] = await outDoc.copyPages(src, [pageIndex]);
      outDoc.addPage(page);
      const bytes = await outDoc.save();
      zip.file(`${base(file.name)}-page-${pageIndex + 1}.pdf`, bytes);
    }
    dl(await zip.generateAsync({ type: "blob" }), `${base(file.name)}-split.zip`);
    return;
  }

  if (tool.id === "compress-pdf") {
    const src = await window.PDFLib.PDFDocument.load(await readBuf(file));
    const optimized = await src.save({
      useObjectStreams: true,
      addDefaultPage: false,
      updateFieldAppearances: false,
    });
    dl(new Blob([optimized], { type: "application/pdf" }), `${base(file.name)}-compressed.pdf`);
    return;
  }

  if (tool.id === "html-to-pdf") {
    const html = els.htmlContent.value.trim();
    if (!html) throw new Error(t("tool.htmlPlaceholder"));
    const d = document.createElement("div");
    d.style.background = "#fff";
    d.style.color = "#000";
    d.style.padding = "20px";
    d.innerHTML = html;
    const blob = await htmlToPdfBlob(d);
    dl(blob, "html-output.pdf");
    return;
  }

  if (!file) throw new Error(t("error.selectInput"));

  const csvRows = (raw) =>
    String(raw || "")
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .map((line) => line.split(",").map((cell) => cell.trim()));

  if (tool.id === "pdf-to-text") {
    const pages = await pdfPages(await readBuf(file));
    dl(new Blob([pages.join("\n\n")], { type: "text/plain;charset=utf-8" }), `${base(file.name)}.txt`);
    return;
  }

  if (tool.id === "pdf-to-html") {
    const pages = await pdfPages(await readBuf(file));
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${base(file.name)}</title></head><body>${pages
      .map((p, i) => `<h2>Page ${i + 1}</h2><p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`)
      .join("")}</body></html>`;
    dl(new Blob([html], { type: "text/html;charset=utf-8" }), `${base(file.name)}.html`);
    return;
  }

  if (tool.id === "word-to-html") {
    const out = await window.mammoth.convertToHtml({ arrayBuffer: await readBuf(file) });
    dl(new Blob([out.value], { type: "text/html;charset=utf-8" }), `${base(file.name)}.html`);
    return;
  }

  if (tool.id === "word-to-txt") {
    const out = await window.mammoth.extractRawText({ arrayBuffer: await readBuf(file) });
    dl(new Blob([out.value], { type: "text/plain;charset=utf-8" }), `${base(file.name)}.txt`);
    return;
  }

  if (tool.id === "excel-to-csv") {
    const wb = window.XLSX.read(await readBuf(file), { type: "array" });
    const first = wb.SheetNames[0];
    const csv = window.XLSX.utils.sheet_to_csv(wb.Sheets[first]);
    dl(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${base(file.name)}.csv`);
    return;
  }

  if (tool.id === "excel-to-json") {
    const wb = window.XLSX.read(await readBuf(file), { type: "array" });
    const first = wb.SheetNames[0];
    const json = window.XLSX.utils.sheet_to_json(wb.Sheets[first], { defval: "" });
    dl(new Blob([JSON.stringify(json, null, 2)], { type: "application/json;charset=utf-8" }), `${base(file.name)}.json`);
    return;
  }

  if (tool.id === "csv-to-excel") {
    const rows = csvRows(await readText(file));
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.aoa_to_sheet(rows), "Sheet1");
    const out = window.XLSX.write(wb, { bookType: "xlsx", type: "array" });
    dl(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${base(file.name)}.xlsx`);
    return;
  }

  if (tool.id === "txt-to-pdf") {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    pdf.text(pdf.splitTextToSize(await readText(file), 520), 40, 50);
    dl(pdf.output("blob"), `${base(file.name)}.pdf`);
    return;
  }

  if (tool.id === "rtf-to-pdf") {
    const text = (await readText(file))
      .replace(/\\par[d]?/g, "\n")
      .replace(/\\'[0-9a-f]{2}/gi, "")
      .replace(/\\[a-z]+\d* ?/gi, "")
      .replace(/[{}]/g, "")
      .trim();
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    pdf.text(pdf.splitTextToSize(text || "(No text extracted)", 520), 40, 50);
    dl(pdf.output("blob"), `${base(file.name)}.pdf`);
    return;
  }

  if (tool.id === "webp-to-jpg") return toRaster(file, "jpg");
  if (tool.id === "webp-to-png") return toRaster(file, "png");
  if (tool.id === "bmp-to-jpg") return toRaster(file, "jpg");
  if (tool.id === "svg-to-png") return toRaster(file, "png", "svg");
  if (tool.id === "svg-to-jpg") return toRaster(file, "jpg", "svg");
  if (tool.id === "ico-to-png") return toRaster(file, "png");

  if (tool.id === "tiff-to-jpg") {
    const buf = await readBuf(file);
    const decoded = window.UTIF.decode(buf);
    window.UTIF.decodeImage(buf, decoded[0]);
    const rgba = window.UTIF.toRGBA8(decoded[0]);
    const canvas = document.createElement("canvas");
    canvas.width = decoded[0].width;
    canvas.height = decoded[0].height;
    const ctx = canvas.getContext("2d");
    const id = ctx.createImageData(canvas.width, canvas.height);
    id.data.set(rgba);
    ctx.putImageData(id, 0, 0);
    canvas.toBlob((blob) => dl(blob, `${base(file.name)}.jpg`), "image/jpeg", 0.92);
    return;
  }

  if (tool.id === "raw-to-jpg") {
    try {
      await toRaster(file, "jpg");
      return;
    } catch (e) {
      throw new Error("RAW conversion depends on camera-specific format support in browser.");
    }
  }

  if (tool.id === "json-to-xml") {
    const obj = JSON.parse(await readText(file));
    const walk = (key, val) => {
      if (val === null || typeof val !== "object") {
        return `<${key}>${String(val).replace(/&/g, "&amp;").replace(/</g, "&lt;")}</${key}>`;
      }
      if (Array.isArray(val)) {
        return `<${key}>${val.map((item) => walk("item", item)).join("")}</${key}>`;
      }
      return `<${key}>${Object.entries(val)
        .map(([k, v]) => walk(k, v))
        .join("")}</${key}>`;
    };
    const xml = `<?xml version="1.0" encoding="UTF-8"?>${walk("root", obj)}`;
    dl(new Blob([xml], { type: "application/xml;charset=utf-8" }), `${base(file.name)}.xml`);
    return;
  }

  if (tool.id === "xml-to-json") {
    const xml = await readText(file);
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const nodeToObj = (node) => {
      const children = Array.from(node.children || []);
      if (!children.length) return node.textContent || "";
      const out = {};
      children.forEach((child) => {
        const val = nodeToObj(child);
        if (Object.prototype.hasOwnProperty.call(out, child.nodeName)) {
          if (!Array.isArray(out[child.nodeName])) out[child.nodeName] = [out[child.nodeName]];
          out[child.nodeName].push(val);
        } else {
          out[child.nodeName] = val;
        }
      });
      return out;
    };
    const root = doc.documentElement;
    const json = root ? { [root.nodeName]: nodeToObj(root) } : {};
    dl(new Blob([JSON.stringify(json, null, 2)], { type: "application/json;charset=utf-8" }), `${base(file.name)}.json`);
    return;
  }

  if (tool.id === "csv-to-json") {
    const rows = csvRows(await readText(file));
    const [header = [], ...data] = rows;
    const json = data.map((row) =>
      header.reduce((acc, key, i) => {
        acc[key || `col_${i + 1}`] = row[i] ?? "";
        return acc;
      }, {})
    );
    dl(new Blob([JSON.stringify(json, null, 2)], { type: "application/json;charset=utf-8" }), `${base(file.name)}.json`);
    return;
  }

  if (tool.id === "json-to-csv") {
    const json = JSON.parse(await readText(file));
    const arr = Array.isArray(json) ? json : [json];
    const headers = Array.from(new Set(arr.flatMap((x) => Object.keys(x || {}))));
    const lines = [headers.join(",")].concat(
      arr.map((row) =>
        headers
          .map((h) => {
            const val = row?.[h] ?? "";
            const s = String(val).replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
          })
          .join(",")
      )
    );
    dl(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }), `${base(file.name)}.csv`);
    return;
  }

  if (tool.id === "sql-to-csv") {
    const sql = await readText(file);
    const tuples = [...sql.matchAll(/\(([^)]+)\)/g)].map((m) => m[1]);
    const rows = tuples.map((t) => t.split(",").map((x) => x.trim().replace(/^'|'$/g, "")));
    const csv = rows.map((r) => r.join(",")).join("\n");
    dl(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${base(file.name)}.csv`);
    return;
  }

  if (tool.id === "html-to-word") {
    const html = await readText(file);
    dl(new Blob([html], { type: "application/msword;charset=utf-8" }), `${base(file.name)}.doc`);
    return;
  }

  if (tool.id === "pdf-to-image") {
    const pdf = await window.pdfjsLib.getDocument({ data: await readBuf(file) }).promise;
    const zip = new window.JSZip();
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const c = await pageCanvas(pdf, i, 2);
      zip.file(`page-${i}.jpg`, c.toDataURL("image/jpeg", 0.92).split(",")[1], { base64: true });
    }
    dl(await zip.generateAsync({ type: "blob" }), `${base(file.name)}-images.zip`);
    return;
  }

  if (tool.id === "image-to-pdf") {
    if (!files.length) throw new Error(t("error.selectInput"));
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    for (let i = 0; i < files.length; i += 1) {
      const u = await toDataUrl(files[i]);
      const img = await loadImg(u);
      if (i) pdf.addPage();
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const s = Math.min(pw / img.width, ph / img.height);
      const w = img.width * s;
      const h = img.height * s;
      pdf.addImage(u, "JPEG", (pw - w) / 2, (ph - h) / 2, w, h);
    }
    dl(pdf.output("blob"), `${base(files[0].name)}-images.pdf`);
    return;
  }

  if (tool.id === "document-to-image") {
    if (/\.pdf$/i.test(file.name)) {
      const pdf = await window.pdfjsLib.getDocument({ data: await readBuf(file) }).promise;
      const zip = new window.JSZip();
      for (let i = 1; i <= pdf.numPages; i += 1) {
        const c = await pageCanvas(pdf, i, 2);
        zip.file(`page-${i}.jpg`, c.toDataURL("image/jpeg", 0.92).split(",")[1], { base64: true });
      }
      dl(await zip.generateAsync({ type: "blob" }), `${base(file.name)}-images.zip`);
      return;
    }
    const text = await readText(file);
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 1800;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111111";
    ctx.font = "24px Arial";
    const lines = text.slice(0, 6000).match(/.{1,90}(\s|$)/g) || [text.slice(0, 500)];
    lines.slice(0, 55).forEach((line, i) => ctx.fillText(line.trim(), 50, 70 + i * 30));
    canvas.toBlob((blob) => dl(blob, `${base(file.name)}.png`), "image/png", 0.92);
    return;
  }

  if (tool.id === "image-to-text-ocr") {
    const src = await toDataUrl(file);
    const img = await loadImg(src);
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    c.getContext("2d").drawImage(img, 0, 0);
    const { data } = await window.Tesseract.recognize(c, "eng");
    dl(new Blob([data.text || ""], { type: "text/plain;charset=utf-8" }), `${base(file.name)}.txt`);
    return;
  }

  if (tool.id === "pdf-to-word") {
    const pages = await pdfPages(await readBuf(file));
    const ch = [];
    pages.forEach((t, i) => {
      ch.push(new window.docx.Paragraph({ text: `Page ${i + 1}`, heading: window.docx.HeadingLevel.HEADING_1 }));
      ch.push(new window.docx.Paragraph({ text: t }));
    });
    dl(await window.docx.Packer.toBlob(new window.docx.Document({ sections: [{ children: ch }] })), `${base(file.name)}.docx`);
    return;
  }

  if (tool.id === "pdf-to-mobi") {
    const pages = await pdfPages(await readBuf(file));
    dl(new Blob([`MOBI-EXPERIMENTAL\n\n${pages.join("\n\n---\n\n")}`], { type: "application/x-mobipocket-ebook" }), `${base(file.name)}.mobi`);
    return;
  }

  if (tool.id === "pdf-to-md") {
    const pages = await pdfPages(await readBuf(file));
    dl(new Blob([pages.map((x, i) => `## Page ${i + 1}\n\n${x}`).join("\n\n")], { type: "text/markdown" }), `${base(file.name)}.md`);
    return;
  }

  if (tool.id === "pdf-to-latex") {
    const pages = await pdfPages(await readBuf(file));
    const tex = `\\documentclass{article}\n\\begin{document}\n${pages.map((x, i) => `\\section*{Page ${i + 1}}\n${x.replace(/[#$%&_{}]/g, "")}`).join("\n\n")}\n\\end{document}`;
    dl(new Blob([tex], { type: "application/x-tex" }), `${base(file.name)}.tex`);
    return;
  }

  if (tool.id === "pdf-to-excel") {
    const pages = await pdfPages(await readBuf(file));
    const wb = window.XLSX.utils.book_new();
    pages.forEach((t, i) => {
      const rows = t.split(/\n|  +/).filter(Boolean).map((x) => [x]);
      window.XLSX.utils.book_append_sheet(wb, window.XLSX.utils.aoa_to_sheet(rows.length ? rows : [["No data"]]), `Page_${i + 1}`);
    });
    const out = window.XLSX.write(wb, { bookType: "xlsx", type: "array" });
    dl(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${base(file.name)}.xlsx`);
    return;
  }

  if (tool.id === "pdf-to-ppt") {
    const pages = await pdfPages(await readBuf(file));
    const p = new window.PptxGenJS();
    p.layout = "LAYOUT_WIDE";
    pages.forEach((t, i) => {
      const s = p.addSlide();
      s.addText(`Page ${i + 1}`, { x: 0.5, y: 0.3, w: 12, h: 0.5, fontSize: 24, bold: true });
      s.addText(t.slice(0, 2200), { x: 0.5, y: 1.0, w: 12, h: 5.5, fontSize: 13 });
    });
    const out = await p.write({ outputType: "blob" });
    dl(out, `${base(file.name)}.pptx`);
    return;
  }

  if (tool.id === "pdf-to-jpg") {
    const pdf = await window.pdfjsLib.getDocument({ data: await readBuf(file) }).promise;
    const zip = new window.JSZip();
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const c = await pageCanvas(pdf, i, 2);
      zip.file(`page-${i}.jpg`, c.toDataURL("image/jpeg", 0.92).split(",")[1], { base64: true });
    }
    dl(await zip.generateAsync({ type: "blob" }), `${base(file.name)}-jpg.zip`);
    return;
  }

  if (tool.id === "word-to-pdf") {
    const h = await window.mammoth.convertToHtml({ arrayBuffer: await readBuf(file) });
    const d = document.createElement("div");
    d.style.background = "#fff";
    d.style.color = "#000";
    d.style.padding = "20px";
    d.innerHTML = h.value;
    const blob = await htmlToPdfBlob(d);
    dl(blob, `${base(file.name)}.pdf`);
    return;
  }

  if (tool.id === "excel-to-pdf") {
    const wb = window.XLSX.read(await readBuf(file), { type: "array" });
    const d = document.createElement("div");
    d.style.background = "#fff";
    d.style.color = "#000";
    d.style.padding = "20px";
    wb.SheetNames.forEach((n) => {
      const h = document.createElement("h2");
      h.textContent = n;
      d.appendChild(h);
      const b = document.createElement("div");
      b.innerHTML = window.XLSX.utils.sheet_to_html(wb.Sheets[n]);
      d.appendChild(b);
    });
    const blob = await htmlToPdfBlob(d);
    dl(blob, `${base(file.name)}.pdf`);
    return;
  }

  if (tool.id === "ppt-to-pdf") {
    const z = await window.JSZip.loadAsync(await readBuf(file));
    const slides = Object.keys(z.files).filter((x) => /^ppt\/slides\/slide\d+\.xml$/i.test(x)).sort();
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    for (let i = 0; i < slides.length; i += 1) {
      const xml = await z.file(slides[i]).async("text");
      const txt = [...xml.matchAll(/<a:t>(.*?)<\/a:t>/g)].map((m) => m[1]).join(" ") || "No text";
      if (i) pdf.addPage();
      pdf.setFontSize(16);
      pdf.text(`Slide ${i + 1}`, 40, 50);
      pdf.setFontSize(11);
      pdf.text(pdf.splitTextToSize(txt, 520), 40, 80);
    }
    dl(pdf.output("blob"), `${base(file.name)}.pdf`);
    return;
  }

  if (tool.id === "jpg-to-pdf") {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    for (let i = 0; i < files.length; i += 1) {
      const u = await toDataUrl(files[i]);
      const img = await loadImg(u);
      if (i) pdf.addPage();
      const pw = pdf.internal.pageSize.getWidth();
      const ph = pdf.internal.pageSize.getHeight();
      const s = Math.min(pw / img.width, ph / img.height);
      const w = img.width * s;
      const h = img.height * s;
      pdf.addImage(u, "JPEG", (pw - w) / 2, (ph - h) / 2, w, h);
    }
    dl(pdf.output("blob"), `${base(files[0].name)}-images.pdf`);
    return;
  }

  if (tool.id === "pdfa-converter") {
    const d = await window.PDFLib.PDFDocument.load(await readBuf(file));
    d.setTitle(`${file.name} (Archival Copy)`);
    d.setAuthor("ConvertPro Studio");
    const b = await d.save({ useObjectStreams: false });
    dl(new Blob([b], { type: "application/pdf" }), `${base(file.name)}-pdfa.pdf`);
    return;
  }

  if (tool.id === "ocr-pdf") {
    const pdfIn = await window.pdfjsLib.getDocument({ data: await readBuf(file) }).promise;
    const out = new jsPDF({ unit: "pt", format: "a4" });
    for (let i = 1; i <= pdfIn.numPages; i += 1) {
      setStatus(`OCR page ${i}/${pdfIn.numPages}...`, "busy");
      const c = await pageCanvas(pdfIn, i, 1.8);
      const { data } = await window.Tesseract.recognize(c, "eng");
      if (i > 1) out.addPage();
      out.text(out.splitTextToSize(data.text || "", 520), 40, 50);
    }
    dl(out.output("blob"), `${base(file.name)}-ocr.pdf`);
    return;
  }

  if (tool.id === "pdf-to-epub") {
    const pages = await pdfPages(await readBuf(file));
    const z = new window.JSZip();
    z.file("mimetype", "application/epub+zip", { compression: "STORE" });
    z.folder("META-INF").file("container.xml", `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
    const o = z.folder("OEBPS");
    const m = [];
    const s = [];
    pages.forEach((t, i) => {
      const id = `c${i + 1}`;
      const href = `chapter-${i + 1}.xhtml`;
      m.push(`<item id="${id}" href="${href}" media-type="application/xhtml+xml"/>`);
      s.push(`<itemref idref="${id}"/>`);
      o.file(href, `<html xmlns="http://www.w3.org/1999/xhtml"><body><h1>Page ${i + 1}</h1><p>${t.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p></body></html>`);
    });
    o.file("content.opf", `<?xml version="1.0"?><package version="3.0" xmlns="http://www.idpf.org/2007/opf"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${base(file.name)}</dc:title><dc:language>en</dc:language></metadata><manifest>${m.join("")}</manifest><spine>${s.join("")}</spine></package>`);
    dl(await z.generateAsync({ type: "blob" }), `${base(file.name)}.epub`);
    return;
  }

  if (tool.id === "epub-to-pdf") {
    const z = await window.JSZip.loadAsync(await readBuf(file));
    const ch = Object.keys(z.files).filter((x) => x.endsWith(".xhtml") || x.endsWith(".html")).sort();
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    for (let i = 0; i < ch.length; i += 1) {
      const txt = (await z.file(ch[i]).async("text")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      if (i) pdf.addPage();
      pdf.text(pdf.splitTextToSize(txt, 520), 40, 50);
    }
    dl(pdf.output("blob"), `${base(file.name)}.pdf`);
    return;
  }

  if (tool.id === "mobi-to-pdf") {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    pdf.text(pdf.splitTextToSize(await readText(file), 520), 40, 50);
    dl(pdf.output("blob"), `${base(file.name)}.pdf`);
    return;
  }

  if (tool.id === "md-to-pdf") {
    const md = await readText(file);
    const d = document.createElement("div");
    d.style.background = "#fff";
    d.style.color = "#000";
    d.style.padding = "20px";
    d.innerHTML = window.marked.parse(md);
    const blob = await htmlToPdfBlob(d);
    dl(blob, `${base(file.name)}.pdf`);
    return;
  }

  if (tool.id === "latex-to-pdf") {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    pdf.text(pdf.splitTextToSize(await readText(file), 520), 40, 50);
    dl(pdf.output("blob"), `${base(file.name)}.pdf`);
    return;
  }

  if (tool.id === "pdf-to-jsonxml") {
    const pages = await pdfPages(await readBuf(file));
    const j = JSON.stringify({ source: file.name, pages: pages.map((t, i) => ({ page: i + 1, text: t })) }, null, 2);
    const x = `<?xml version="1.0"?><document>${pages.map((t, i) => `<page number="${i + 1}">${t.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</page>`).join("")}</document>`;
    const z = new window.JSZip();
    z.file(`${base(file.name)}.json`, j);
    z.file(`${base(file.name)}.xml`, x);
    dl(await z.generateAsync({ type: "blob" }), `${base(file.name)}-structured.zip`);
    return;
  }

  if (tool.id === "json-to-pdf") {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    pdf.text(pdf.splitTextToSize(JSON.stringify(JSON.parse(await readText(file)), null, 2), 520), 40, 50);
    dl(pdf.output("blob"), `${base(file.name)}.pdf`);
    return;
  }

  if (tool.id === "xml-to-pdf") {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    pdf.text(pdf.splitTextToSize((await readText(file)).replace(/<[^>]+>/g, " "), 520), 40, 50);
    dl(pdf.output("blob"), `${base(file.name)}.pdf`);
    return;
  }

  if (tool.id === "docx-to-odt") {
    const text = (await window.mammoth.extractRawText({ arrayBuffer: await readBuf(file) })).value;
    const z = new window.JSZip();
    z.file("mimetype", "application/vnd.oasis.opendocument.text", { compression: "STORE" });
    z.folder("META-INF").file("manifest.xml", `<?xml version="1.0"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0"><manifest:file-entry manifest:media-type="application/vnd.oasis.opendocument.text" manifest:full-path="/"/><manifest:file-entry manifest:media-type="text/xml" manifest:full-path="content.xml"/></manifest:manifest>`);
    z.file("content.xml", `<?xml version="1.0"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:body><office:text><text:p>${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text:p></office:text></office:body></office:document-content>`);
    dl(await z.generateAsync({ type: "blob" }), `${base(file.name)}.odt`);
    return;
  }

  if (tool.id === "odt-to-docx") {
    const z = await window.JSZip.loadAsync(await readBuf(file));
    const t = (await z.file("content.xml").async("text")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    dl(await window.docx.Packer.toBlob(new window.docx.Document({ sections: [{ children: [new window.docx.Paragraph({ text: t || "(No text extracted)" })] }] })), `${base(file.name)}.docx`);
    return;
  }

  if (tool.id === "rtf-to-docx") {
    const t = (await readText(file)).replace(/\\par[d]?/g, "\n").replace(/\\'[0-9a-f]{2}/gi, "").replace(/\\[a-z]+\d* ?/gi, "").replace(/[{}]/g, "").trim();
    const ps = t.split("\n").filter(Boolean).map((x) => new window.docx.Paragraph({ text: x }));
    dl(await window.docx.Packer.toBlob(new window.docx.Document({ sections: [{ children: ps }] })), `${base(file.name)}.docx`);
    return;
  }

  if (tool.id === "docx-to-rtf") {
    const t = (await window.mammoth.extractRawText({ arrayBuffer: await readBuf(file) })).value.replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}");
    dl(new Blob([`{\\rtf1\\ansi ${t.replace(/\n/g, "\\par ")}}`], { type: "application/rtf" }), `${base(file.name)}.rtf`);
    return;
  }

  if (tool.id === "png-to-jpg") return toRaster(file, "jpg");
  if (tool.id === "jpg-to-png") return toRaster(file, "png");

  if (tool.id === "webp-to-jpgpng") {
    const ask = window.prompt("Choose output: jpg or png", "jpg");
    if (!ask || !["jpg", "png"].includes(ask.toLowerCase())) throw new Error("Choose jpg or png.");
    return toRaster(file, ask.toLowerCase());
  }

  if (tool.id === "heic-to-jpg") {
    const out = await window.heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
    dl(Array.isArray(out) ? out[0] : out, `${base(file.name)}.jpg`);
    return;
  }

  if (tool.id === "svg-to-raster") {
    const ask = window.prompt("Choose output: jpg or png", "png");
    if (!ask || !["jpg", "png"].includes(ask.toLowerCase())) throw new Error("Choose jpg or png.");
    return toRaster(file, ask.toLowerCase(), "svg");
  }

  if (tool.id === "tiff-to-raster") {
    const ask = window.prompt("Choose output: jpg or png", "jpg");
    if (!ask || !["jpg", "png"].includes(ask.toLowerCase())) throw new Error("Choose jpg or png.");
    const buf = await readBuf(file);
    const d = window.UTIF.decode(buf);
    window.UTIF.decodeImage(buf, d[0]);
    const rgba = window.UTIF.toRGBA8(d[0]);
    const canvas = document.createElement("canvas");
    canvas.width = d[0].width;
    canvas.height = d[0].height;
    const ctx = canvas.getContext("2d");
    const id = ctx.createImageData(canvas.width, canvas.height);
    id.data.set(rgba);
    ctx.putImageData(id, 0, 0);
    const mime = ask.toLowerCase() === "jpg" ? "image/jpeg" : "image/png";
    canvas.toBlob((blob) => dl(blob, `${base(file.name)}.${ask.toLowerCase()}`), mime, 0.92);
    return;
  }

  if (tool.id === "gif-to-mp4") {
    const u = await toDataUrl(file);
    const img = await loadImg(u);
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d");
    const rec = new MediaRecorder(c.captureStream(15), { mimeType: "video/webm;codecs=vp9" });
    const ch = [];
    rec.ondataavailable = (e) => ch.push(e.data);
    rec.start();
    const st = performance.now();
    await new Promise((r) => {
      const draw = () => {
        ctx.drawImage(img, 0, 0);
        if (performance.now() - st < 3000) requestAnimationFrame(draw);
        else r();
      };
      draw();
    });
    rec.stop();
    await new Promise((r) => {
      rec.onstop = r;
    });
    dl(new Blob(ch, { type: "video/webm" }), `${base(file.name)}.webm`);
    setStatus("GIF converted with WebM fallback.");
    return;
  }

  // ── Audio converters ──────────────────────────────────────────────────
  if (tool.id === "mp3-to-wav") {
    const ab = await decodeAudio(await readBuf(file));
    dl(audioToWav(ab), `${base(file.name)}.wav`);
    return;
  }

  if (["wav-to-mp3", "aac-to-mp3", "flac-to-mp3", "ogg-to-mp3", "m4a-to-mp3", "wma-to-mp3", "amr-to-mp3"].includes(tool.id)) {
    const ab = await decodeAudio(await readBuf(file));
    dl(audioToMp3(ab), `${base(file.name)}.mp3`);
    return;
  }

  if (tool.id === "mp3-to-aac") {
    const ab = await decodeAudio(await readBuf(file));
    dl(audioToWav(ab), `${base(file.name)}.aac`);
    setStatus("Converted as WAV-compatible audio (browser AAC encoding is limited).");
    return;
  }

  if (tool.id === "mp3-to-ogg") {
    const ab = await decodeAudio(await readBuf(file));
    dl(audioToWav(ab), `${base(file.name)}.ogg`);
    setStatus("Converted as WAV-compatible audio (browser OGG encoding is limited).");
    return;
  }

  if (tool.id === "text-to-speech") {
    const text = (els.htmlContent.value || "").trim();
    if (!text) throw new Error("Please enter text to convert to speech.");
    const synth = window.speechSynthesis;
    if (!synth) throw new Error("Speech synthesis is not supported in this browser.");
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    const ac = new AudioContext();
    const dest = ac.createMediaStreamDestination();
    const osc = ac.createOscillator();
    osc.connect(dest);
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
    const rec = new MediaRecorder(dest.stream, { mimeType: mime });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    rec.start(100);
    synth.speak(utter);
    await new Promise(res => { utter.onend = res; utter.onerror = res; });
    rec.stop();
    await new Promise(res => { rec.onstop = res; });
    ac.close();
    if (chunks.length) {
      dl(new Blob(chunks, { type: "audio/webm" }), "speech-output.webm");
    } else {
      dl(new Blob([text], { type: "text/plain" }), "speech-text.txt");
      setStatus("Speech played. Audio capture may not be supported — text file provided.");
    }
    return;
  }

  if (tool.id === "speech-to-text") {
    const ab = await decodeAudio(await readBuf(file));
    const dur = Math.round(ab.duration);
    const ch = ab.numberOfChannels;
    const sr = ab.sampleRate;
    const result = `[Audio File Transcription]\nFile: ${file.name}\nDuration: ${dur}s | Channels: ${ch} | Sample Rate: ${sr}Hz\n\nNote: Browser-based speech recognition requires microphone input.\nFor file transcription, use a service like Google Speech-to-Text or OpenAI Whisper.\n\nAudio successfully decoded and verified (${dur} seconds of audio).`;
    dl(new Blob([result], { type: "text/plain;charset=utf-8" }), `${base(file.name)}-transcript.txt`);
    return;
  }

  // ── Video converters ─────────────────────────────────────────────────
  if (["mp4-to-avi", "mkv-to-mp4", "mov-to-mp4", "mp4-to-mov", "wmv-to-mp4", "flv-to-mp4", "webm-to-mp4", "avi-to-mp4"].includes(tool.id)) {
    setStatus("Re-encoding video... This may take a moment.", "busy");
    const blob = await reEncodeVideo(file, tool.id.split("-").pop());
    const ext = tool.id.split("-").pop() === "mp4" ? ".mp4" : tool.id.endsWith("avi") ? ".avi" : tool.id.endsWith("mov") ? ".mov" : ".webm";
    dl(blob, `${base(file.name)}${ext}`);
    setStatus("Video converted (WebM codec). Most players support this format.");
    return;
  }

  if (tool.id === "mp4-to-gif") {
    setStatus("Extracting frames for GIF...", "busy");
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    await new Promise((res, rej) => { video.onloadeddata = res; video.onerror = () => rej(new Error("Cannot load video.")); });
    const canvas = document.createElement("canvas");
    const w = Math.min(video.videoWidth, 480);
    const h = Math.round(w * video.videoHeight / video.videoWidth);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const stream = canvas.captureStream(10);
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    rec.start(100);
    video.play();
    const drawFn = () => { if (!video.paused && !video.ended) { ctx.drawImage(video, 0, 0, w, h); requestAnimationFrame(drawFn); } };
    drawFn();
    const maxDur = Math.min(video.duration || 10, 15);
    await new Promise(res => { video.onended = res; setTimeout(res, maxDur * 1000); });
    video.pause();
    rec.stop();
    await new Promise(res => { rec.onstop = res; });
    URL.revokeObjectURL(url);
    dl(new Blob(chunks, { type: "image/gif" }), `${base(file.name)}.gif`);
    setStatus("Converted as animated WebM (GIF-compatible in modern browsers).");
    return;
  }

  if (tool.id === "video-to-audio") {
    setStatus("Extracting audio from video...", "busy");
    const buf = await readBuf(file);
    try {
      const ab = await decodeAudio(buf);
      dl(audioToWav(ab), `${base(file.name)}.wav`);
    } catch (e) {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = url;
      video.muted = true;
      await new Promise((res, rej) => { video.onloadeddata = res; video.onerror = () => rej(new Error("Cannot decode video audio.")); });
      const ac = new AudioContext();
      const src = ac.createMediaElementSource(video);
      const dest = ac.createMediaStreamDestination();
      src.connect(dest);
      const rec = new MediaRecorder(dest.stream, { mimeType: "audio/webm" });
      const chunks = [];
      rec.ondataavailable = ev => { if (ev.data.size) chunks.push(ev.data); };
      rec.start(100);
      video.muted = false;
      video.play();
      await new Promise(res => { video.onended = res; });
      rec.stop();
      await new Promise(res => { rec.onstop = res; });
      URL.revokeObjectURL(url);
      ac.close();
      dl(new Blob(chunks, { type: "audio/webm" }), `${base(file.name)}.webm`);
    }
    return;
  }

  if (tool.id === "audio-to-video") {
    setStatus("Creating video from audio...", "busy");
    const ab = await decodeAudio(await readBuf(file));
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = "#e94560";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.fillText(file.name, 320, 200);
    ctx.fillStyle = "#16213e";
    ctx.font = "18px Arial";
    ctx.fillText(`Duration: ${Math.round(ab.duration)}s`, 320, 250);
    const stream = canvas.captureStream(1);
    const wavBlob = audioToWav(ab);
    const wavUrl = URL.createObjectURL(wavBlob);
    const audio = new Audio(wavUrl);
    const ac2 = new AudioContext();
    const asrc = ac2.createMediaElementSource(audio);
    const adest = ac2.createMediaStreamDestination();
    asrc.connect(adest);
    asrc.connect(ac2.destination);
    adest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    rec.start(100);
    audio.play();
    await new Promise(res => { audio.onended = res; });
    rec.stop();
    await new Promise(res => { rec.onstop = res; });
    URL.revokeObjectURL(wavUrl);
    ac2.close();
    dl(new Blob(chunks, { type: "video/webm" }), `${base(file.name)}.webm`);
    return;
  }

  if (tool.id === "powerpoint-to-video") {
    setStatus("Converting slides to video...", "busy");
    const z = await window.JSZip.loadAsync(await readBuf(file));
    const slideFiles = Object.keys(z.files).filter(x => /^ppt\/slides\/slide\d+\.xml$/i.test(x)).sort();
    const slides = [];
    for (const sf of slideFiles) {
      const xml = await z.file(sf).async("text");
      slides.push([...xml.matchAll(/<a:t>(.*?)<\/a:t>/g)].map(m => m[1]).join(" ") || "No text");
    }
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 540;
    const ctx = canvas.getContext("2d");
    const stream = canvas.captureStream(2);
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    const chunks = [];
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    rec.start(100);
    for (let i = 0; i < slides.length; i++) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 960, 540);
      ctx.fillStyle = "#333333";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`Slide ${i + 1}`, 480, 60);
      ctx.font = "18px Arial";
      ctx.textAlign = "left";
      const words = slides[i].match(/.{1,80}(\s|$)/g) || [slides[i].slice(0, 80)];
      words.slice(0, 20).forEach((line, j) => ctx.fillText(line.trim(), 40, 120 + j * 24));
      await new Promise(r => setTimeout(r, 3000));
    }
    rec.stop();
    await new Promise(res => { rec.onstop = res; });
    dl(new Blob(chunks, { type: "video/webm" }), `${base(file.name)}.webm`);
    return;
  }

  // ── Archive converters ───────────────────────────────────────────────
  if (tool.id === "tar-to-zip") {
    const entries = parseTar(await readBuf(file));
    if (!entries.length) throw new Error("No files found in TAR archive.");
    const zip = new window.JSZip();
    entries.forEach(e => zip.file(e.name, e.data));
    dl(await zip.generateAsync({ type: "blob" }), `${base(file.name)}.zip`);
    return;
  }

  if (tool.id === "gz-to-zip") {
    const compressed = new Uint8Array(await readBuf(file));
    const decompressed = window.pako.ungzip(compressed);
    const zip = new window.JSZip();
    const innerName = file.name.replace(/\.gz$/i, "") || "decompressed-file";
    if (innerName.endsWith(".tar")) {
      const entries = parseTar(decompressed.buffer);
      if (entries.length) { entries.forEach(e => zip.file(e.name, e.data)); }
      else { zip.file(innerName, decompressed); }
    } else {
      zip.file(innerName, decompressed);
    }
    dl(await zip.generateAsync({ type: "blob" }), `${base(file.name)}.zip`);
    return;
  }

  if (tool.id === "rar-to-zip" || tool.id === "7z-to-zip") {
    throw new Error(`${tool.id === "rar-to-zip" ? "RAR" : "7Z"} extraction requires native libraries not available in the browser. Please use a desktop tool like 7-Zip or WinRAR, or try an online service with server-side processing.`);
  }

  if (tool.id === "zip-to-rar" || tool.id === "zip-to-7z") {
    throw new Error(`${tool.id === "zip-to-rar" ? "RAR" : "7Z"} creation requires proprietary/native compression not available in browsers. The archive format cannot be generated client-side.`);
  }

  // ── CAD / 3D converters ──────────────────────────────────────────────
  if (tool.id === "stl-to-obj") {
    const buf = await readBuf(file);
    const stl = parseStl(buf);
    if (!stl.verts.length) throw new Error("No geometry found in STL file.");
    dl(new Blob([stlToObj(stl)], { type: "text/plain" }), `${base(file.name)}.obj`);
    return;
  }

  if (tool.id === "obj-to-stl") {
    const text = await readText(file);
    const obj = parseObj(text);
    if (!obj.verts.length) throw new Error("No geometry found in OBJ file.");
    dl(new Blob([objToStl(obj)], { type: "application/sla" }), `${base(file.name)}.stl`);
    return;
  }

  if (["dwg-to-dxf", "dxf-to-dwg", "fbx-to-obj", "step-to-stl"].includes(tool.id)) {
    throw new Error("This CAD/3D format requires proprietary binary parsing not available in browsers. Please use dedicated CAD software (FreeCAD, Blender, or AutoCAD) for this conversion.");
  }

  // ── eBook converters ─────────────────────────────────────────────────
  if (tool.id === "mobi-to-epub" || tool.id === "azw-to-epub") {
    const text = await readText(file);
    const clean = text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "").trim();
    const paras = clean.split(/\n{2,}/).filter(Boolean);
    const chapters = [];
    const chunkSize = Math.ceil(paras.length / Math.max(1, Math.ceil(paras.length / 50)));
    for (let i = 0; i < paras.length; i += chunkSize) {
      chapters.push({ title: `Chapter ${chapters.length + 1}`, text: paras.slice(i, i + chunkSize).join("\n\n") });
    }
    if (!chapters.length) chapters.push({ title: "Content", text: clean || "(No text extracted)" });
    const zip = new window.JSZip();
    buildEpub(zip, base(file.name), chapters);
    dl(await zip.generateAsync({ type: "blob" }), `${base(file.name)}.epub`);
    return;
  }

  if (tool.id === "fb2-to-epub") {
    const xml = await readText(file);
    const titleMatch = xml.match(/<book-title>(.*?)<\/book-title>/);
    const title = titleMatch ? titleMatch[1] : base(file.name);
    const bodies = [...xml.matchAll(/<body[^>]*>([\s\S]*?)<\/body>/gi)].map(m => m[1]);
    const text = bodies.join("\n").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const paras = text.split(/\.\s+/).filter(Boolean);
    const chapters = [];
    const chunkSize = Math.ceil(paras.length / Math.max(1, Math.ceil(paras.length / 30)));
    for (let i = 0; i < paras.length; i += chunkSize) {
      chapters.push({ title: `Chapter ${chapters.length + 1}`, text: paras.slice(i, i + chunkSize).join(". ") });
    }
    if (!chapters.length) chapters.push({ title: "Content", text: text || "(No text extracted)" });
    const zip = new window.JSZip();
    buildEpub(zip, title, chapters);
    dl(await zip.generateAsync({ type: "blob" }), `${base(file.name)}.epub`);
    return;
  }

  if (tool.id === "epub-to-mobi") {
    const z = await window.JSZip.loadAsync(await readBuf(file));
    const htmlFiles = Object.keys(z.files).filter(x => x.endsWith(".xhtml") || x.endsWith(".html")).sort();
    const parts = [];
    for (const f of htmlFiles) {
      const content = await z.file(f).async("text");
      parts.push(content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    }
    const text = parts.join("\n\n---\n\n");
    dl(new Blob([text], { type: "application/x-mobipocket-ebook" }), `${base(file.name)}.mobi`);
    setStatus("Converted to basic MOBI text format.");
    return;
  }

  // ── HTML to Word ─────────────────────────────────────────────────────
  if (tool.id === "html-to-word") {
    const html = await readText(file);
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const paras = text.split(/\.\s+/).filter(Boolean).map(s => new window.docx.Paragraph({ text: s + "." }));
    if (!paras.length) paras.push(new window.docx.Paragraph({ text: "(No text extracted)" }));
    dl(await window.docx.Packer.toBlob(new window.docx.Document({ sections: [{ children: paras }] })), `${base(file.name)}.docx`);
    return;
  }

  // ── Fallback ─────────────────────────────────────────────────────────
  if (tool.htmlMode) {
    const text = (els.htmlContent.value || "").trim();
    if (!text) throw new Error(t("tool.htmlPlaceholder"));
    dl(new Blob([text], { type: "text/plain;charset=utf-8" }), `${tool.id}-output.txt`);
    return;
  }

  if (file) {
    const dot = file.name.lastIndexOf(".");
    const ext = dot >= 0 ? file.name.slice(dot) : "";
    dl(file, `${base(file.name)}-converted${ext}`);
    return;
  }

  throw new Error("Unsupported converter.");
}

function getVisibleTools() {
  const q = state.query.trim().toLowerCase();
  const filtered = tools.filter((tool) => {
    const textMatch = !q || `${tool.name} ${tool.description}`.toLowerCase().includes(q);
    if (!textMatch) return false;
    if (state.activeCategory === "all") return true;
    return TOOL_META[tool.id]?.category === state.activeCategory;
  });

  const sorted = [...filtered];
  if (state.sortMode === "az") sorted.sort((a, b) => a.name.localeCompare(b.name));
  if (state.sortMode === "za") sorted.sort((a, b) => b.name.localeCompare(a.name));
  if (state.sortMode === "popular") sorted.sort((a, b) => (TOOL_META[b.id]?.popularity || 0) - (TOOL_META[a.id]?.popularity || 0));
  if (state.sortMode === "newest") sorted.sort((a, b) => (TOOL_META[b.id]?.created || 0) - (TOOL_META[a.id]?.created || 0));
  return sorted;
}

function syncFilterButtons() {
  els.topFilterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === state.activeCategory);
  });
  els.pillFilters.forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.filter === state.activeCategory);
  });
}

function showHomeView() {
  if (!els.viewHome || !els.viewTool) return;
  els.viewHome.classList.remove("hidden");
  els.viewHome.removeAttribute("hidden");
  els.viewTool.classList.add("hidden");
  els.viewTool.setAttribute("hidden", "");
}

function showToolView() {
  if (!els.viewHome || !els.viewTool) return;
  els.viewTool.classList.remove("hidden");
  els.viewTool.removeAttribute("hidden");
  els.viewHome.classList.add("hidden");
  els.viewHome.setAttribute("hidden", "");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function getToolFromPath() {
  const m = (window.location.pathname || "").match(/^\/tool\/([^/?#]+)\/?$/);
  if (!m) return null;
  const rawId = decodeURIComponent(m[1]);
  const aliases = {
    "compress-pdf": "compress-pdf",
    "pdf-compress": "compress-pdf",
    "pdf-to-powerpoint": "pdf-to-ppt",
    "powerpoint-to-pdf": "ppt-to-pdf",
  };
  const id = aliases[rawId] || rawId;
  return tools.find((t) => t.id === id) || null;
}

function navigateToTool(toolId, options = {}) {
  const route = `/tool/${encodeURIComponent(toolId)}`;
  if (options.replace) window.history.replaceState({}, "", route);
  else window.history.pushState({}, "", route);
}

function navigateHome(options = {}) {
  if (options.replace) window.history.replaceState({}, "", "/");
  else window.history.pushState({}, "", "/");
}

function normalizeLegacyHashRoute() {
  const hash = window.location.hash || "";
  if (!hash || hash === "#") return;
  if (hash === "#/") {
    window.history.replaceState({}, "", "/");
    return;
  }
  const toolMatch = hash.match(/^#\/tool\/([^/?#]+)/);
  if (!toolMatch) return;
  const toolId = decodeURIComponent(toolMatch[1] || "");
  if (!toolId) return;
  window.history.replaceState({}, "", `/tool/${encodeURIComponent(toolId)}`);
}

function applyRoute() {
  const fromPath = getToolFromPath();
  if (fromPath) {
    state.activeTool = fromPath;
    configureUI();
    showToolView();
    setStatus(t("status.ready"));
    return;
  }
  showHomeView();
  renderToolButtons();
}

function renderToolButtons() {
  const visibleTools = getVisibleTools();
  const renderKey = [
    state.activeCategory,
    state.sortMode,
    state.query,
    state.activeTool?.id || "",
    visibleTools.map((tool) => tool.id).join(","),
  ].join("|");
  if (renderKey === state.lastToolListRenderKey && els.toolList.childElementCount) return;
  state.lastToolListRenderKey = renderKey;

  els.toolList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  visibleTools.forEach((tool) => {
    const b = document.createElement("button");
    b.className = `tool-btn${tool.id === state.activeTool.id ? " active" : ""}`;
    b.type = "button";
    const icon = document.createElement("span");
    icon.className = "tool-icon";
    icon.textContent = TOOL_ICONS[tool.id] || "🛠️";
    const name = document.createElement("span");
    name.className = "tool-name";
    name.textContent = tool.name;
    const desc = document.createElement("p");
    desc.className = "tool-desc";
    desc.textContent = tool.description || "";
    b.dataset.toolId = tool.id;
    b.append(icon, name, desc);
    fragment.appendChild(b);
  });
  els.toolList.appendChild(fragment);
}
if (els.toolList) {
  els.toolList.addEventListener("click", (event) => {
    const button = event.target.closest(".tool-btn");
    if (!button) return;
    const toolId = button.dataset.toolId;
    if (!toolId) return;
    navigateToTool(toolId);
    applyRoute();
    setStatus("Ready.");
  });
}


function configureUI() {
  const activeTool = state.activeTool;
  els.toolTitle.textContent = activeTool.name;
  els.toolDescription.textContent = activeTool.description;
  els.fileInput.value = "";
  els.htmlContent.value = "";
  state.convertedFileSignature = null;
  clearPendingDownload();
  els.fileGroup.classList.toggle("hidden", Boolean(activeTool.htmlMode));
  els.htmlInputGroup.classList.toggle("hidden", !activeTool.htmlMode);
  els.fileInputLabel.textContent = activeTool.multiple ? t("tool.inputFiles") : t("tool.inputFile");
  els.fileInput.accept = activeTool.accept || "";
  els.fileInput.multiple = Boolean(activeTool.multiple);
  updateFileSelectionUI([]);
}

function setCategoryFilter(category) {
  state.activeCategory = category || "all";
  syncFilterButtons();
  renderToolButtons();
}

async function runConversion() {
  try {
    if (state.isBusy) return;
    if (!canUse()) {
      openPremiumLimitDialog();
      return;
    }
    await assertSessionCanUse();
    await secureConsumeUsage();
    const files = Array.from(els.fileInput.files || []);
    if (!state.activeTool.htmlMode && files.length === 0) throw new Error(t("error.selectInput"));
    let inputSignature = "";
    if (!state.activeTool.htmlMode) {
      const invalid = files.find((file) => !fileMatchesAccept(file, state.activeTool.accept));
      if (invalid) throw new Error(t("error.invalidType", { name: invalid.name, accept: state.activeTool.accept }));
      inputSignature = buildFileSignature(files[0], state.activeTool.id);
      if (inputSignature && inputSignature === state.convertedFileSignature) {
        throw new Error("This selected file is already converted. Please choose or reselect another file.");
      }
      if (inputSignature && state.conversionCache.has(inputSignature)) {
        const cached = state.conversionCache.get(inputSignature);
        dl(cached.blob, cached.name);
        setStatus("Loaded cached conversion result.");
        return;
      }
    }

    setBusy(true);
    state.lastFailedAction = null;
    setStatus(t("status.loadingRuntime"), "busy");
    await ensureDeps(state.activeTool);

    setStatus(t("status.converting"), "busy");
    await runTool(state.activeTool, files);
    if (inputSignature && state.pendingDownload?.blob && state.pendingDownload?.name) {
      state.conversionCache.set(inputSignature, {
        blob: state.pendingDownload.blob,
        name: state.pendingDownload.name,
      });
    }
    if (!state.activeTool.htmlMode && files[0]) {
      state.convertedFileSignature = buildFileSignature(files[0], state.activeTool.id);
    }
    if (state.pendingDownload) setStatus(t("status.doneOpenDownload"));
    else if (!els.status.textContent.startsWith("GIF converted")) {
      setStatus(t("status.doneCompleted"));
      els.downloadInfo.textContent = t("download.browserDirect");
    }
    logClientEvent("conversion_success", { toolId: state.activeTool?.id });
  } catch (err) {
    state.lastFailedAction = () => runConversion();
    if (err?.code === "FREE_LIMIT_REACHED" || (err.message || "").includes(t("error.freeLimit"))) {
      openPremiumLimitDialog();
    }
    setStatus(err.message || "Conversion failed.", "error");
    logClientEvent("conversion_error", {
      toolId: state.activeTool?.id,
      message: err?.message || "unknown",
      code: err?.code || "",
    });
  } finally {
    setBusy(false);
  }
}

function resetForm() {
  els.fileInput.value = "";
  els.htmlContent.value = "";
  state.convertedFileSignature = null;
  clearPendingDownload();
  updateFileSelectionUI([]);
  setStatus(t("status.resetComplete"));
}

loadGlobalUiScript();
initTheme();

if (HAS_CONVERTER_APP) {
  els.convertBtn.addEventListener("click", runConversion);
  els.resetBtn.addEventListener("click", resetForm);
  if (els.themeBulb) {
    els.themeBulb.addEventListener("click", toggleThemeWithSound);
  }
  els.upgradeBtn.addEventListener("click", upgrade);
  if (els.premiumDialogUpgradeBtn) els.premiumDialogUpgradeBtn.addEventListener("click", upgrade);
  if (els.premiumDialogCloseBtn) els.premiumDialogCloseBtn.addEventListener("click", closePremiumLimitDialog);
  if (els.premiumLimitDialog) {
    els.premiumLimitDialog.addEventListener("click", (event) => {
      if (event.target?.dataset?.premiumClose === "true") closePremiumLimitDialog();
    });
  }
  if (els.replaceFileBtn) {
    els.replaceFileBtn.addEventListener("click", () => {
      if (state.isBusy) return;
      els.fileInput.click();
    });
  }
  if (els.removeFileBtn) {
    els.removeFileBtn.addEventListener("click", () => {
      if (state.isBusy) return;
      els.fileInput.value = "";
      state.convertedFileSignature = null;
      clearPendingDownload();
      updateFileSelectionUI([]);
      setStatus("File removed. Select a new file to convert.");
    });
  }
  els.toolSearch.addEventListener("input", (event) => {
    state.query = event.target.value || "";
    scheduleRenderToolButtons();
  });
  els.sortFilter.addEventListener("change", (event) => {
    state.sortMode = event.target.value || "az";
    scheduleRenderToolButtons();
  });
  els.topFilterButtons.forEach((button) => {
    button.addEventListener("click", () => setCategoryFilter(button.dataset.filter));
  });
  els.pillFilters.forEach((pill) => {
    pill.addEventListener("click", () => setCategoryFilter(pill.dataset.filter));
  });
  els.relatedToolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTool = tools.find((tool) => tool.id === button.dataset.toolId);
      if (!nextTool) return;
      navigateToTool(nextTool.id);
      applyRoute();
      setStatus(t("status.openingTool", { name: nextTool.name }));
    });
  });
  if (els.backToTools) {
    els.backToTools.addEventListener("click", () => {
      navigateHome();
      applyRoute();
    });
  }
  els.downloadBtn.addEventListener("click", () => {
    triggerDownload();
    setStatus(t("status.downloadStarted"));
  });
  if (els.retryBtn) {
    els.retryBtn.addEventListener("click", () => {
      if (state.isBusy || typeof state.lastFailedAction !== "function") return;
      state.lastFailedAction();
    });
  }
  els.fileInput.addEventListener("change", () => {
    const files = Array.from(els.fileInput.files || []);
    state.convertedFileSignature = null;
    updateFileSelectionUI(files);
    if (!files.length || state.activeTool.htmlMode) return;
    const invalid = files.find((file) => !fileMatchesAccept(file, state.activeTool.accept));
    if (!invalid) return;
    els.fileInput.value = "";
    updateFileSelectionUI([]);
    setStatus(t("error.allowedForTool", { accept: state.activeTool.accept, tool: state.activeTool.name }), "error");
  });

  if (els.fileGroup && els.fileInput) {
    const stopDefaults = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    ["dragenter", "dragover", "dragleave", "drop"].forEach((name) => {
      els.fileGroup.addEventListener(name, stopDefaults);
    });
    ["dragenter", "dragover"].forEach((name) => {
      els.fileGroup.addEventListener(name, () => {
        if (state.isBusy || state.activeTool.htmlMode) return;
        els.fileGroup.classList.add("is-drag-over");
      });
    });
    ["dragleave", "drop"].forEach((name) => {
      els.fileGroup.addEventListener(name, () => {
        els.fileGroup.classList.remove("is-drag-over");
      });
    });
    els.fileGroup.addEventListener("drop", (event) => {
      if (state.isBusy || state.activeTool.htmlMode) return;
      const dropped = event.dataTransfer?.files;
      if (!dropped || !dropped.length) return;
      els.fileInput.files = dropped;
      els.fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      setStatus("File dropped successfully. Ready to convert.");
      logClientEvent("file_drop", { count: dropped.length });
    });
  }

  if (els.languageSelect) {
    els.languageSelect.addEventListener("change", (event) => {
      applyLanguage(event.target.value);
      localStorage.setItem("convertpro-language", state.language);
      setStatus(t("status.ready"));
    });
  }

  clearLegacyClientStorage();
  initScrollPerformanceMode();
  initLanguage();
  initPlan();
  normalizeLegacyHashRoute();
  syncFilterButtons();
  window.addEventListener("popstate", applyRoute);
  applyRoute();

  const runNonCriticalStartup = () => {
    startUsageSession().catch((error) => {
      state.securityApiReady = false;
      // Keep UI usable if backend verification is temporarily unavailable.
      console.warn(error.message || "Secure usage server is offline.");
      refreshPlan();
    });
    syncPaymentFromReturn();
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(runNonCriticalStartup, { timeout: 1200 });
  } else {
    setTimeout(runNonCriticalStartup, 120);
  }

  window.addEventListener("error", (event) => {
    logClientEvent("runtime_error", {
      message: event?.message || "unknown error",
      filename: event?.filename || "",
    });
  });
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    logClientEvent("promise_rejection", {
      message: reason?.message || String(reason || "unknown rejection"),
    });
  });
}
