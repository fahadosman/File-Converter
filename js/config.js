export const FREE_LIMIT = 5;
export const THEME_KEY = "convertpro-theme";
export const PLAN_KEY = "convertpro-plan";
export const USAGE_KEY = "convertpro-usage-count";

export const LIBS = {
  pdfjs: {
    url: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js",
    check: () => Boolean(window.pdfjsLib),
    afterLoad: () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
    },
  },
  jspdf: { url: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", check: () => Boolean(window.jspdf) },
  docx: { url: "https://cdnjs.cloudflare.com/ajax/libs/docx/8.5.0/docx.js", check: () => Boolean(window.docx) },
  xlsx: { url: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js", check: () => Boolean(window.XLSX) },
  pptx: { url: "https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js", check: () => Boolean(window.PptxGenJS) },
  mammoth: { url: "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js", check: () => Boolean(window.mammoth) },
  jszip: { url: "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js", check: () => Boolean(window.JSZip) },
  tesseract: { url: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js", check: () => Boolean(window.Tesseract) },
  pdfLib: { url: "https://unpkg.com/pdf-lib/dist/pdf-lib.min.js", check: () => Boolean(window.PDFLib) },
  marked: { url: "https://cdn.jsdelivr.net/npm/marked/marked.min.js", check: () => Boolean(window.marked) },
  heic2any: { url: "https://cdn.jsdelivr.net/npm/heic2any/dist/heic2any.min.js", check: () => Boolean(window.heic2any) },
  utif: { url: "https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.min.js", check: () => Boolean(window.UTIF) },
};

export const tools = [
  { id: "pdf-to-word", name: "PDF to Word", accept: ".pdf", deps: ["pdfjs", "docx"] },
  { id: "pdf-to-ppt", name: "PDF to PowerPoint", accept: ".pdf", deps: ["pdfjs", "pptx"] },
  { id: "pdf-to-excel", name: "PDF to Excel", accept: ".pdf", deps: ["pdfjs", "xlsx"] },
  { id: "pdf-to-jpg", name: "PDF to JPG", accept: ".pdf", deps: ["pdfjs", "jszip"] },
  { id: "word-to-pdf", name: "Word to PDF", accept: ".docx", deps: ["mammoth", "jspdf"] },
  { id: "ppt-to-pdf", name: "PowerPoint to PDF", accept: ".pptx", deps: ["jszip", "jspdf"] },
  { id: "excel-to-pdf", name: "Excel to PDF", accept: ".xlsx,.xls", deps: ["xlsx", "jspdf"] },
  { id: "jpg-to-pdf", name: "JPG to PDF", accept: "image/*", multiple: true, deps: ["jspdf"] },
  { id: "html-to-pdf", name: "HTML to PDF", htmlMode: true, deps: ["jspdf"] },
  { id: "pdfa-converter", name: "PDF to PDF/A", accept: ".pdf", deps: ["pdfLib"] },
  { id: "ocr-pdf", name: "OCR PDF", accept: ".pdf", deps: ["pdfjs", "jspdf", "tesseract"] },
  { id: "pdf-to-epub", name: "PDF to EPUB", accept: ".pdf", deps: ["pdfjs", "jszip"] },
  { id: "epub-to-pdf", name: "EPUB to PDF", accept: ".epub", deps: ["jszip", "jspdf"] },
  { id: "pdf-to-mobi", name: "PDF to MOBI", accept: ".pdf", deps: ["pdfjs"] },
  { id: "mobi-to-pdf", name: "MOBI to PDF", accept: ".mobi,.azw,.azw3", deps: ["jspdf"] },
  { id: "pdf-to-md", name: "PDF to Markdown", accept: ".pdf", deps: ["pdfjs"] },
  { id: "md-to-pdf", name: "Markdown to PDF", accept: ".md,.markdown,.txt", deps: ["marked", "jspdf"] },
  { id: "pdf-to-latex", name: "PDF to LaTeX", accept: ".pdf", deps: ["pdfjs"] },
  { id: "latex-to-pdf", name: "LaTeX to PDF", accept: ".tex,.txt", deps: ["jspdf"] },
  { id: "pdf-to-jsonxml", name: "PDF to JSON/XML", accept: ".pdf", deps: ["pdfjs", "jszip"] },
  { id: "json-to-pdf", name: "JSON to PDF", accept: ".json", deps: ["jspdf"] },
  { id: "xml-to-pdf", name: "XML to PDF", accept: ".xml", deps: ["jspdf"] },
  { id: "docx-to-odt", name: "DOCX to ODT", accept: ".docx", deps: ["mammoth", "jszip"] },
  { id: "odt-to-docx", name: "ODT to DOCX", accept: ".odt", deps: ["jszip", "docx"] },
  { id: "rtf-to-docx", name: "RTF to DOCX", accept: ".rtf", deps: ["docx"] },
  { id: "docx-to-rtf", name: "DOCX to RTF", accept: ".docx", deps: ["mammoth"] },
  { id: "png-to-jpg", name: "PNG to JPG", accept: ".png", deps: [] },
  { id: "jpg-to-png", name: "JPG to PNG", accept: ".jpg,.jpeg", deps: [] },
  { id: "webp-to-jpgpng", name: "WebP to JPG/PNG", accept: ".webp", deps: [] },
  { id: "heic-to-jpg", name: "HEIC to JPG", accept: ".heic,.heif", deps: ["heic2any"] },
  { id: "svg-to-raster", name: "SVG to PNG/JPG", accept: ".svg", deps: [] },
  { id: "tiff-to-raster", name: "TIFF to JPG/PNG", accept: ".tif,.tiff", deps: ["utif"] },
  { id: "gif-to-mp4", name: "GIF to MP4", accept: ".gif", deps: [] },
];
