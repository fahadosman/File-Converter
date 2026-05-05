(function () {
  var THEME_KEY = "convertpro-theme";
  var DEFAULT_LOCALE = "en-us";
  var LOCALE_ALIASES = {
    en: "en",
    "en-us": "en",
    "en-gb": "en",
    "en-ca": "en",
    "en-au": "en",
    ru: "ru",
    "ru-ru": "ru",
    es: "es",
    "es-es": "es",
    "es-mx": "es",
    ur: "ur",
    "ur-pk": "ur",
    hi: "hi",
    "hi-in": "hi",
    ar: "ar",
    fr: "fr",
    "fr-fr": "fr",
    "fr-ca": "fr",
    de: "de",
    "de-de": "de"
  };
  var COUNTRY_TO_LOCALE = {
    pk: "ur-pk",
    in: "hi-in",
    es: "es-es",
    mx: "es-mx",
    fr: "fr-fr",
    de: "de-de",
    gb: "en-gb",
    uk: "en-gb",
    us: "en-us",
    au: "en-au",
    ca: "en-ca",
    ae: "ar",
    sa: "ar",
    qa: "ar",
    kw: "ar",
    bh: "ar",
    om: "ar"
  };
  var AUTO_TRANSLATE_LANG = {
    en: "en",
    es: "es",
    ru: "ru",
    ur: "ur",
    hi: "hi",
    ar: "ar",
    fr: "fr",
    de: "de"
  };
  var AUTO_TRANSLATE_CACHE_PREFIX = "fc-auto-i18n:v1:";
  var activeTranslationRun = 0;
  var LANGUAGE_OPTIONS_HTML = '<option value="en-us">English (US)</option><option value="en-gb">English (UK)</option><option value="en-ca">English (CA)</option><option value="en-au">English (AU)</option><option value="ru-ru">Русский</option><option value="ur-pk">اردو (Pakistan)</option><option value="hi-in">हिन्दी (India)</option><option value="es-es">Español (España)</option><option value="es-mx">Español (México)</option><option value="ar">العربية</option><option value="fr-fr">Français (France)</option><option value="fr-ca">Français (Canada)</option><option value="de-de">Deutsch (Deutschland)</option>';
  var SEO_META_BY_PATH = {
    "/index.html": {
      en: { title: "File Converters - Free Online File Conversion Tools", description: "Convert PDF, Word, Excel, images, audio, video and more — free, fast, and secure. 100+ converters all in your browser." },
      es: { title: "Convertidores de Archivos - Herramientas Gratis en Linea", description: "Convierte PDF, Word, Excel, imagenes, audio y video en linea. Gratis, rapido y seguro." },
      ur: { title: "فائل کنورٹرز - مفت آن لائن فائل کنورژن ٹولز", description: "PDF، Word، Excel، تصاویر، آڈیو اور ویڈیو فائلیں مفت، تیز اور محفوظ طریقے سے کنورٹ کریں۔" },
      hi: { title: "फाइल कन्वर्टर - मुफ्त ऑनलाइन फाइल कन्वर्ज़न टूल्स", description: "PDF, Word, Excel, इमेज, ऑडियो और वीडियो फाइलों को ऑनलाइन मुफ्त, तेज और सुरक्षित तरीके से कन्वर्ट करें।" },
      ar: { title: "محول الملفات - ادوات تحويل ملفات اونلاين مجانا", description: "حوّل ملفات PDF وWord وExcel والصور والصوت والفيديو بسرعة وامان عبر المتصفح." },
      fr: { title: "Convertisseur de Fichiers - Outils Gratuits en Ligne", description: "Convertissez PDF, Word, Excel, images, audio et video gratuitement en ligne, rapidement et en securite." },
      de: { title: "Dateikonverter - Kostenlose Online Konvertierungstools", description: "PDF, Word, Excel, Bilder, Audio und Video online kostenlos, schnell und sicher konvertieren." }
    },
    "/tools.html": {
      en: { title: "Free File Converter Tools - Convert PDF, Word, Images Online", description: "Free file converter for PDF, Word, Excel, images, audio, video, and more. Convert files online fast with secure processing and 100+ tools." },
      es: { title: "Herramientas de Conversion Gratis - PDF, Word e Imagenes", description: "Convierte archivos PDF, Word, Excel, imagenes, audio y video en linea con mas de 100 herramientas." },
      ur: { title: "مفت فائل کنورٹر ٹولز - PDF، Word اور تصاویر", description: "100+ ٹولز کے ساتھ PDF، Word، Excel، تصاویر، آڈیو اور ویڈیو فائلیں آسانی سے کنورٹ کریں۔" },
      hi: { title: "मुफ्त फाइल कन्वर्टर टूल्स - PDF, Word, इमेज कन्वर्ट करें", description: "100+ टूल्स के साथ PDF, Word, Excel, इमेज, ऑडियो और वीडियो फाइलों को ऑनलाइन कन्वर्ट करें।" },
      ar: { title: "ادوات تحويل ملفات مجانية - PDF وWord والصور", description: "حوّل ملفات PDF وWord وExcel والصور والصوت والفيديو عبر 100+ اداة." },
      fr: { title: "Outils de Conversion Gratuits - PDF, Word, Images", description: "Convertissez PDF, Word, Excel, images, audio et video en ligne avec plus de 100 outils." },
      de: { title: "Kostenlose Dateikonverter Tools - PDF, Word, Bilder", description: "Konvertieren Sie PDF, Word, Excel, Bilder, Audio und Video online mit 100+ Tools." }
    },
    "/tools/pdf-to-word.html": {
      en: { title: "PDF to Word Converter Online Free - Fast & Secure", description: "Convert PDF to Word online for free in seconds. Keep document structure readable with a fast, secure PDF to DOCX workflow." },
      es: { title: "Convertidor PDF a Word Gratis en Linea", description: "Convierte PDF a Word gratis en linea en segundos con un flujo rapido y seguro." },
      ur: { title: "PDF سے Word کنورٹر - مفت آن لائن", description: "PDF کو Word میں مفت، تیز اور محفوظ طریقے سے آن لائن کنورٹ کریں۔" },
      hi: { title: "PDF to Word कन्वर्टर ऑनलाइन फ्री", description: "PDF फाइल को Word में ऑनलाइन मुफ्त, तेज और सुरक्षित तरीके से कन्वर्ट करें।" },
      ar: { title: "تحويل PDF الى Word مجانا اونلاين", description: "حوّل ملف PDF الى Word بسرعة وامان عبر الانترنت." },
      fr: { title: "Convertisseur PDF en Word Gratuit en Ligne", description: "Convertissez un PDF en Word gratuitement en ligne avec un processus rapide et securise." },
      de: { title: "PDF zu Word Konverter Kostenlos Online", description: "PDF online kostenlos in Word umwandeln - schnell und sicher." }
    },
    "/tools/word-to-pdf.html": {
      en: { title: "Word to PDF Converter Online Free - Fast & Secure", description: "Convert Word to PDF online for free in a few clicks. Create shareable PDF files quickly with a secure DOCX to PDF converter." },
      es: { title: "Convertidor Word a PDF Gratis en Linea", description: "Convierte Word a PDF gratis en linea en pocos clics con una conversion rapida y segura." },
      ur: { title: "Word سے PDF کنورٹر - مفت آن لائن", description: "Word فائل کو PDF میں چند کلکس کے ساتھ مفت آن لائن کنورٹ کریں۔" },
      hi: { title: "Word to PDF कन्वर्टर ऑनलाइन फ्री", description: "Word डॉक्यूमेंट को PDF में ऑनलाइन मुफ्त और तेज तरीके से कन्वर्ट करें।" },
      ar: { title: "تحويل Word الى PDF مجانا اونلاين", description: "حوّل ملفات Word الى PDF بسرعة وامان عبر الانترنت." },
      fr: { title: "Convertisseur Word en PDF Gratuit en Ligne", description: "Convertissez Word en PDF gratuitement en ligne en quelques clics." },
      de: { title: "Word zu PDF Konverter Kostenlos Online", description: "Word-Dokumente online kostenlos und sicher in PDF konvertieren." }
    },
    "/blog-pdf-to-word.html": {
      en: { title: "PDF to Word Converter Online: Keep Formatting Intact (2026 Guide)", description: "Convert PDF to Word online with better formatting quality. Learn how to handle scanned PDFs, table-heavy files, and layout cleanup for DOCX output." }
    },
    "/blog-split-pdf.html": {
      en: { title: "How to Split PDF Pages Online Free (Fast and Clean Workflow)", description: "Split PDF pages online for free. Learn how to extract pages, create smaller PDF files, and organize large documents without quality loss." }
    },
    "/blog-pdf-to-powerpoint.html": {
      en: { title: "PDF to PowerPoint Converter: Turn Reports into Slides (2026)", description: "Convert PDF to PowerPoint online for free. Learn practical tips to turn reports into editable slides with better text flow and presentation-ready layout." }
    },
    "/blog-heic-to-jpg.html": {
      en: { title: "HEIC to JPG Converter Online: iPhone Photos Made Compatible", description: "Convert HEIC to JPG online for easier sharing and compatibility. Learn the best HEIC conversion settings for web uploads, email, and legacy apps." }
    }
  };
  var NAV_ITEMS = [
    { href: "/index.html", label: "Home" },
    { href: "/features.html", label: "Features" },
    { href: "/tools.html", label: "Tools" },
    { href: "/faq.html", label: "FAQ" },
    { href: "/about.html", label: "About Us" },
    { href: "/contact.html", label: "Contact Us" },
  ];
  var UI_TEXT = {
    en: {
      nav: ["Home", "Features", "Tools", "FAQ", "About Us", "Contact Us"],
      footerBrand: "Files Converter",
      footerTagline: "Fast, secure, and simple document tools built to save your time.",
      paddle: "Premium checkout is processed by Paddle.",
      product: "Product",
      legal: "Legal",
      company: "Company",
      terms: "Terms & conditions",
      privacy: "Privacy policy",
      refund: "Refund policy",
      security: "Security",
      home: "Home",
      features: "Features",
      tools: "Tools",
      faq: "FAQ",
      about: "About us",
      contact: "Contact us",
      menu: "Menu"
    },
    es: {
      nav: ["Inicio", "Funciones", "Herramientas", "FAQ", "Sobre nosotros", "Contacto"],
      footerBrand: "Files Converter",
      footerTagline: "Herramientas de documentos rapidas, seguras y simples para ahorrar tiempo.",
      paddle: "El pago Premium se procesa con Paddle.",
      product: "Producto",
      legal: "Legal",
      company: "Empresa",
      terms: "Terminos y condiciones",
      privacy: "Politica de privacidad",
      refund: "Politica de reembolsos",
      security: "Seguridad",
      home: "Inicio",
      features: "Funciones",
      tools: "Herramientas",
      faq: "FAQ",
      about: "Sobre nosotros",
      contact: "Contacto",
      menu: "Menu"
    },
    ru: {
      nav: ["Главная", "Функции", "Инструменты", "FAQ", "О нас", "Контакты"],
      footerBrand: "Files Converter",
      footerTagline: "Быстрые, безопасные и простые инструменты для работы с документами.",
      paddle: "Оплата Premium обрабатывается через Paddle.",
      product: "Продукт",
      legal: "Правовая информация",
      company: "Компания",
      terms: "Условия использования",
      privacy: "Политика конфиденциальности",
      refund: "Политика возврата",
      security: "Безопасность",
      home: "Главная",
      features: "Функции",
      tools: "Инструменты",
      faq: "FAQ",
      about: "О нас",
      contact: "Связаться с нами",
      menu: "Меню"
    },
    ur: {
      nav: ["ہوم", "فیچرز", "ٹولز", "سوالات", "ہمارے بارے میں", "رابطہ"],
      footerBrand: "Files Converter",
      footerTagline: "تیز، محفوظ اور آسان ڈاکیومنٹ ٹولز جو آپ کا وقت بچائیں۔",
      paddle: "Premium ادائیگی Paddle کے ذریعے پروسیس ہوتی ہے۔",
      product: "پروڈکٹ",
      legal: "قانونی",
      company: "کمپنی",
      terms: "شرائط و ضوابط",
      privacy: "پرائیویسی پالیسی",
      refund: "ریفنڈ پالیسی",
      security: "سیکیورٹی",
      home: "ہوم",
      features: "فیچرز",
      tools: "ٹولز",
      faq: "سوالات",
      about: "ہمارے بارے میں",
      contact: "رابطہ",
      menu: "مینو"
    },
    hi: {
      nav: ["होम", "फीचर्स", "टूल्स", "FAQ", "हमारे बारे में", "संपर्क"],
      footerBrand: "Files Converter",
      footerTagline: "तेज़, सुरक्षित और आसान डॉक्यूमेंट टूल्स जो आपका समय बचाते हैं।",
      paddle: "Premium भुगतान Paddle द्वारा प्रोसेस किया जाता है।",
      product: "प्रोडक्ट",
      legal: "कानूनी",
      company: "कंपनी",
      terms: "नियम और शर्तें",
      privacy: "प्राइवेसी पॉलिसी",
      refund: "रिफंड पॉलिसी",
      security: "सिक्योरिटी",
      home: "होम",
      features: "फीचर्स",
      tools: "टूल्स",
      faq: "FAQ",
      about: "हमारे बारे में",
      contact: "संपर्क",
      menu: "मेनू"
    },
    ar: {
      nav: ["الرئيسية", "المميزات", "الادوات", "الاسئلة الشائعة", "من نحن", "اتصل بنا"],
      footerBrand: "Files Converter",
      footerTagline: "ادوات مستندات سريعة وامنة وبسيطة لتوفير وقتك.",
      paddle: "يتم معالجة دفع Premium عبر Paddle.",
      product: "المنتج",
      legal: "القانوني",
      company: "الشركة",
      terms: "الشروط والاحكام",
      privacy: "سياسة الخصوصية",
      refund: "سياسة الاسترجاع",
      security: "الامان",
      home: "الرئيسية",
      features: "المميزات",
      tools: "الادوات",
      faq: "الاسئلة الشائعة",
      about: "من نحن",
      contact: "اتصل بنا",
      menu: "القائمة"
    },
    fr: {
      nav: ["Accueil", "Fonctionnalites", "Outils", "FAQ", "A propos", "Contact"],
      footerBrand: "Files Converter",
      footerTagline: "Des outils document rapides, securises et simples pour vous faire gagner du temps.",
      paddle: "Le paiement Premium est traite par Paddle.",
      product: "Produit",
      legal: "Mentions legales",
      company: "Entreprise",
      terms: "Conditions generales",
      privacy: "Politique de confidentialite",
      refund: "Politique de remboursement",
      security: "Securite",
      home: "Accueil",
      features: "Fonctionnalites",
      tools: "Outils",
      faq: "FAQ",
      about: "A propos",
      contact: "Contact",
      menu: "Menu"
    },
    de: {
      nav: ["Startseite", "Funktionen", "Tools", "FAQ", "Uber uns", "Kontakt"],
      footerBrand: "Files Converter",
      footerTagline: "Schnelle, sichere und einfache Dokument-Tools, die Zeit sparen.",
      paddle: "Die Premium-Zahlung wird von Paddle verarbeitet.",
      product: "Produkt",
      legal: "Rechtliches",
      company: "Unternehmen",
      terms: "AGB",
      privacy: "Datenschutz",
      refund: "Ruckerstattung",
      security: "Sicherheit",
      home: "Startseite",
      features: "Funktionen",
      tools: "Tools",
      faq: "FAQ",
      about: "Uber uns",
      contact: "Kontakt",
      menu: "Menü"
    }
  };
  var PAGE_LOCALIZED_TEXT = {
    "/tools.html": {
      en: {
        h1: "All Conversion Tools",
        lead: "Choose from our complete converter collection. Every tool page is standalone and reload-safe.",
        popular: 'Popular searches: <a href="/tools/pdf-to-word.html">PDF to Word</a>, <a href="/tools/word-to-pdf.html">Word to PDF</a>, <a href="/convert-pdf-online.html">Convert PDF online</a>, <a href="/free-file-converter.html">Free file converter</a>.'
      },
      es: {
        h1: "Todas las herramientas de conversion",
        lead: "Elige de nuestra coleccion completa de convertidores. Cada herramienta funciona como pagina independiente.",
        popular: 'Busquedas populares: <a href="/tools/pdf-to-word.html">PDF a Word</a>, <a href="/tools/word-to-pdf.html">Word a PDF</a>, <a href="/convert-pdf-online.html">Convertir PDF online</a>, <a href="/free-file-converter.html">Convertidor gratis</a>.'
      },
      ur: {
        h1: "تمام کنورژن ٹولز",
        lead: "ہمارے مکمل کنورٹر کلیکشن میں سے انتخاب کریں۔ ہر ٹول پیج علیحدہ طور پر کام کرتا ہے۔",
        popular: 'مشہور تلاشیں: <a href="/tools/pdf-to-word.html">PDF سے Word</a>, <a href="/tools/word-to-pdf.html">Word سے PDF</a>, <a href="/convert-pdf-online.html">PDF آن لائن کنورٹ کریں</a>, <a href="/free-file-converter.html">مفت فائل کنورٹر</a>.'
      },
      hi: {
        h1: "सभी कन्वर्ज़न टूल्स",
        lead: "हमारे पूर्ण कन्वर्टर कलेक्शन में से चुनें। हर टूल पेज स्वतंत्र रूप से काम करता है।",
        popular: 'लोकप्रिय खोजें: <a href="/tools/pdf-to-word.html">PDF to Word</a>, <a href="/tools/word-to-pdf.html">Word to PDF</a>, <a href="/convert-pdf-online.html">Convert PDF online</a>, <a href="/free-file-converter.html">Free file converter</a>.'
      },
      ar: {
        h1: "جميع ادوات التحويل",
        lead: "اختر من مجموعة المحولات الكاملة. كل صفحة اداة تعمل بشكل مستقل.",
        popular: 'عمليات البحث الشائعة: <a href="/tools/pdf-to-word.html">PDF الى Word</a>، <a href="/tools/word-to-pdf.html">Word الى PDF</a>، <a href="/convert-pdf-online.html">تحويل PDF اونلاين</a>، <a href="/free-file-converter.html">محول ملفات مجاني</a>.'
      },
      fr: {
        h1: "Tous les outils de conversion",
        lead: "Choisissez parmi notre collection complete de convertisseurs. Chaque page outil est autonome.",
        popular: 'Recherches populaires : <a href="/tools/pdf-to-word.html">PDF vers Word</a>, <a href="/tools/word-to-pdf.html">Word vers PDF</a>, <a href="/convert-pdf-online.html">Convertir PDF en ligne</a>, <a href="/free-file-converter.html">Convertisseur gratuit</a>.'
      },
      de: {
        h1: "Alle Konvertierungstools",
        lead: "Wahlen Sie aus unserer kompletten Konverter-Sammlung. Jede Tool-Seite funktioniert eigenstandig.",
        popular: 'Beliebte Suchen: <a href="/tools/pdf-to-word.html">PDF zu Word</a>, <a href="/tools/word-to-pdf.html">Word zu PDF</a>, <a href="/convert-pdf-online.html">PDF online konvertieren</a>, <a href="/free-file-converter.html">Kostenloser Dateikonverter</a>.'
      }
    },
    "/features.html": {
      en: { h1: "Our Features", lead: "Files Converter is built to be simple, clear, and beginner-friendly." },
      es: { h1: "Nuestras funciones", lead: "Files Converter esta pensado para ser simple, claro y facil de usar." },
      ru: { h1: "Наши возможности", lead: "Files Converter создан как простой и понятный сервис для всех пользователей." },
      ur: { h1: "ہماری خصوصیات", lead: "Files Converter کو آسان، واضح اور ہر صارف کے لئے مفید بنایا گیا ہے۔" },
      hi: { h1: "हमारी विशेषताएं", lead: "Files Converter को सरल, स्पष्ट और उपयोगकर्ता-अनुकूल बनाया गया है।" },
      ar: { h1: "مميزاتنا", lead: "تم تصميم Files Converter ليكون بسيطا وواضحا وسهل الاستخدام." },
      fr: { h1: "Nos fonctionnalites", lead: "Files Converter est concu pour etre simple, clair et facile a utiliser." },
      de: { h1: "Unsere Funktionen", lead: "Files Converter ist einfach, klar und benutzerfreundlich aufgebaut." }
    },
    "/about.html": {
      en: { h1: "About Us", lead: "Files Converter was built to make document conversion easy and helpful for everyone." },
      es: { h1: "Sobre nosotros", lead: "Files Converter fue creado para hacer la conversion de documentos simple y util para todos." },
      ru: { h1: "О нас", lead: "Files Converter создан, чтобы упростить и ускорить конвертацию документов для всех." },
      ur: { h1: "ہمارے بارے میں", lead: "Files Converter کو ہر ایک کے لئے دستاویز کنورژن آسان بنانے کے لئے تیار کیا گیا ہے۔" },
      hi: { h1: "हमारे बारे में", lead: "Files Converter को दस्तावेज़ कन्वर्ज़न को सभी के लिए आसान बनाने हेतु बनाया गया है।" },
      ar: { h1: "من نحن", lead: "تم بناء Files Converter لجعل تحويل المستندات اسهل للجميع." },
      fr: { h1: "A propos de nous", lead: "Files Converter a ete cree pour rendre la conversion de documents simple pour tous." },
      de: { h1: "Uber uns", lead: "Files Converter wurde entwickelt, um die Dokumentkonvertierung fur alle zu vereinfachen." }
    },
    "/contact.html": {
      en: { h1: "Contact", lead: "Contact us to report an issue, ask a question, or learn more about Files Converter.", send: "Send message" },
      es: { h1: "Contacto", lead: "Contactanos para reportar un problema, hacer una pregunta o conocer mas sobre Files Converter.", send: "Enviar mensaje" },
      ru: { h1: "Контакты", lead: "Свяжитесь с нами, чтобы сообщить о проблеме, задать вопрос или узнать больше о Files Converter.", send: "Отправить сообщение" },
      ur: { h1: "رابطہ", lead: "مسئلہ رپورٹ کرنے، سوال پوچھنے یا Files Converter کے بارے میں مزید جاننے کے لئے ہم سے رابطہ کریں۔", send: "پیغام بھیجیں" },
      hi: { h1: "संपर्क", lead: "समस्या बताने, प्रश्न पूछने या Files Converter के बारे में अधिक जानने के लिए संपर्क करें।", send: "संदेश भेजें" },
      ar: { h1: "اتصل بنا", lead: "تواصل معنا للابلاغ عن مشكلة او طرح سؤال او معرفة المزيد عن Files Converter.", send: "إرسال الرسالة" },
      fr: { h1: "Contact", lead: "Contactez-nous pour signaler un probleme, poser une question ou en savoir plus sur Files Converter.", send: "Envoyer le message" },
      de: { h1: "Kontakt", lead: "Kontaktieren Sie uns, um ein Problem zu melden, eine Frage zu stellen oder mehr uber Files Converter zu erfahren.", send: "Nachricht senden" }
    },
    "/faq.html": {
      en: { h1: "Frequently Asked Questions", lead: "Our support team answers the following questions nearly every day." },
      es: { h1: "Preguntas frecuentes", lead: "Nuestro equipo de soporte responde estas preguntas casi todos los dias." },
      ru: { h1: "Частые вопросы", lead: "Наша команда поддержки отвечает на эти вопросы практически каждый день." },
      ur: { h1: "اکثر پوچھے گئے سوالات", lead: "ہماری سپورٹ ٹیم روزانہ ان سوالات کے جوابات دیتی ہے۔" },
      hi: { h1: "अक्सर पूछे जाने वाले प्रश्न", lead: "हमारी सपोर्ट टीम इन सवालों के जवाब लगभग हर दिन देती है।" },
      ar: { h1: "الاسئلة الشائعة", lead: "فريق الدعم لدينا يجيب على هذه الاسئلة بشكل متكرر." },
      fr: { h1: "Questions frequentes", lead: "Notre equipe support repond a ces questions presque chaque jour." },
      de: { h1: "Haufig gestellte Fragen", lead: "Unser Support-Team beantwortet diese Fragen fast taglich." }
    },
    "/blog.html": {
      en: { h1: "Files Converter Blog", lead: "Learn about PDF tools, conversion tips, and document management best practices." },
      es: { h1: "Blog de Files Converter", lead: "Aprende sobre herramientas PDF, consejos de conversion y mejores practicas de documentos." },
      ru: { h1: "Блог Files Converter", lead: "Узнайте о PDF-инструментах, советах по конвертации и лучших практиках работы с документами." },
      ur: { h1: "Files Converter بلاگ", lead: "PDF ٹولز، کنورژن ٹپس اور ڈاکیومنٹ مینجمنٹ کے بہترین طریقے سیکھیں۔" },
      hi: { h1: "Files Converter ब्लॉग", lead: "PDF टूल्स, कन्वर्ज़न टिप्स और डॉक्यूमेंट मैनेजमेंट की बेहतरीन प्रैक्टिस सीखें।" },
      ar: { h1: "مدونة Files Converter", lead: "تعرف على ادوات PDF ونصائح التحويل وافضل ممارسات ادارة المستندات." },
      fr: { h1: "Blog Files Converter", lead: "Decouvrez des guides PDF, des astuces de conversion et de bonnes pratiques documentaires." },
      de: { h1: "Files Converter Blog", lead: "Erfahren Sie mehr uber PDF-Tools, Konvertierungstipps und bewahrte Dokument-Workflows." }
    },
    "/blog-pdf-to-excel.html": {
      en: { h1: "PDF to Excel Converter Guide: Extract Tables Without Breaking Formatting (2026)", lead: "Convert PDF to Excel online with better table accuracy and less manual cleanup." },
      es: { h1: "Guia PDF a Excel: extrae tablas sin romper el formato (2026)", lead: "Convierte PDF a Excel con mejor precision de tablas y menos limpieza manual." },
      ru: { h1: "Руководство PDF в Excel: извлечение таблиц без потери структуры (2026)", lead: "Конвертируйте PDF в Excel с более точным извлечением таблиц и меньшей ручной правкой." },
      ur: { h1: "PDF سے Excel گائیڈ: ٹیبلز کو فارمیٹنگ خراب کیے بغیر نکالیں (2026)", lead: "PDF کو Excel میں بہتر ٹیبل درستگی کے ساتھ کنورٹ کریں اور دستی ایڈٹ کم کریں۔" },
      hi: { h1: "PDF to Excel गाइड: टेबल बिना फॉर्मेट बिगाड़े निकालें (2026)", lead: "PDF को Excel में बेहतर टेबल सटीकता के साथ कन्वर्ट करें और मैनुअल सफाई कम करें।" },
      ar: { h1: "دليل تحويل PDF الى Excel بدون كسر تنسيق الجداول (2026)", lead: "حوّل PDF الى Excel بدقة افضل للجداول وتقليل التعديل اليدوي." },
      fr: { h1: "Guide PDF vers Excel: extraire les tableaux sans casser la mise en forme (2026)", lead: "Convertissez PDF vers Excel avec une meilleure precision des tableaux et moins de corrections manuelles." },
      de: { h1: "PDF-zu-Excel-Leitfaden: Tabellen ohne Formatverlust extrahieren (2026)", lead: "PDF nach Excel mit besserer Tabellengenauigkeit und weniger manueller Nacharbeit konvertieren." }
    },
    "/blog-image-to-text-ocr.html": {
      en: { h1: "Image to Text OCR Online: Improve Accuracy for Scans and Photos (2026)", lead: "Use practical OCR steps to extract cleaner text from scans, screenshots, and phone photos." },
      es: { h1: "OCR de imagen a texto: mejora la precision en escaneos y fotos (2026)", lead: "Usa pasos practicos de OCR para extraer texto mas limpio de escaneos y fotos." },
      ru: { h1: "OCR изображение в текст: как повысить точность для сканов и фото (2026)", lead: "Используйте практичные шаги OCR для более чистого текста из сканов и фото." },
      ur: { h1: "امیج سے ٹیکسٹ OCR: اسکین اور تصاویر میں درستگی کیسے بڑھائیں (2026)", lead: "اسکین اور تصاویر سے صاف متن حاصل کرنے کے لئے عملی OCR طریقے استعمال کریں۔" },
      hi: { h1: "Image to Text OCR: स्कैन और फोटो के लिए बेहतर सटीकता (2026)", lead: "स्कैन, स्क्रीनशॉट और फोटो से साफ टेक्स्ट निकालने के लिए व्यावहारिक OCR स्टेप्स अपनाएं।" },
      ar: { h1: "تحويل الصورة الى نص OCR: تحسين الدقة للصور والمستندات الممسوحة (2026)", lead: "استخدم خطوات OCR عملية لاستخراج نص انظف من الصور والملفات الممسوحة." },
      fr: { h1: "OCR image vers texte: ameliorer la precision pour scans et photos (2026)", lead: "Suivez des etapes OCR pratiques pour extraire un texte plus propre des scans et photos." },
      de: { h1: "Bild-zu-Text-OCR: Genauigkeit fur Scans und Fotos verbessern (2026)", lead: "Mit praktischen OCR-Schritten saubereren Text aus Scans und Fotos extrahieren." }
    },
    "/blog-webp-to-jpg.html": {
      en: { h1: "WEBP to JPG Converter: When to Use JPG vs WEBP for Web and Social (2026)", lead: "Learn when to keep WEBP and when to convert to JPG for compatibility and visual quality." },
      es: { h1: "Convertidor WEBP a JPG: cuando usar JPG vs WEBP para web y redes (2026)", lead: "Aprende cuando mantener WEBP y cuando convertir a JPG para compatibilidad y calidad visual." },
      ru: { h1: "WEBP в JPG: когда лучше JPG или WEBP для сайта и соцсетей (2026)", lead: "Узнайте, когда оставить WEBP, а когда конвертировать в JPG для совместимости и качества." },
      ur: { h1: "WEBP سے JPG کنورٹر: ویب اور سوشل کے لیے JPG یا WEBP کب استعمال کریں (2026)", lead: "جانیں کب WEBP رکھنا بہتر ہے اور کب مطابقت کے لیے JPG میں تبدیل کرنا چاہیے۔" },
      hi: { h1: "WEBP to JPG कन्वर्टर: वेब और सोशल के लिए JPG vs WEBP कब चुनें (2026)", lead: "जानें कब WEBP रखें और कब बेहतर कम्पैटिबिलिटी के लिए JPG में कन्वर्ट करें।" },
      ar: { h1: "محول WEBP الى JPG: متى تستخدم JPG او WEBP للويب والسوشيال (2026)", lead: "تعرف متى تبقي WEBP ومتى تحول الى JPG للتوافق وجودة العرض." },
      fr: { h1: "Convertisseur WEBP en JPG: quand utiliser JPG ou WEBP pour le web et social (2026)", lead: "Apprenez quand conserver WEBP et quand convertir en JPG pour la compatibilite." },
      de: { h1: "WEBP-zu-JPG-Konverter: Wann JPG oder WEBP fur Web und Social nutzen (2026)", lead: "Lernen Sie, wann WEBP sinnvoll ist und wann JPG fur Kompatibilitat besser passt." }
    },
    "/blog-word-to-pdf.html": {
      en: { h1: "How to Convert Word to PDF Online Free (DOCX to PDF Converter)", lead: "Convert Word documents to PDF online for free while keeping layout and readability intact." },
      es: { h1: "Como convertir Word a PDF gratis en linea (DOCX a PDF)", lead: "Convierte documentos Word a PDF gratis manteniendo formato y legibilidad." },
      ru: { h1: "Как конвертировать Word в PDF онлайн бесплатно (DOCX в PDF)", lead: "Конвертируйте Word в PDF бесплатно онлайн с сохранением структуры документа." },
      ur: { h1: "Word کو PDF میں مفت آن لائن کیسے کنورٹ کریں (DOCX to PDF)", lead: "Word دستاویزات کو PDF میں مفت آن لائن کنورٹ کریں اور فارمیٹنگ برقرار رکھیں۔" },
      hi: { h1: "Word to PDF ऑनलाइन फ्री कैसे कन्वर्ट करें (DOCX to PDF)", lead: "Word डॉक्यूमेंट को फॉर्मेट सुरक्षित रखते हुए PDF में ऑनलाइन मुफ्त कन्वर्ट करें।" },
      ar: { h1: "كيفية تحويل Word الى PDF مجانا اونلاين (DOCX الى PDF)", lead: "حوّل مستندات Word الى PDF مجانا مع الحفاظ على التنسيق." },
      fr: { h1: "Comment convertir Word en PDF gratuitement en ligne (DOCX vers PDF)", lead: "Convertissez des documents Word en PDF gratuitement en conservant la mise en page." },
      de: { h1: "So konvertieren Sie Word kostenlos online in PDF (DOCX zu PDF)", lead: "Word-Dokumente kostenlos online in PDF umwandeln und Layout beibehalten." }
    },
    "/blog-jpg-to-pdf.html": {
      en: { h1: "How to Convert JPG to PDF Online Without Watermark (2026 Guide)", lead: "Turn JPG images into clean PDF files online without watermarking and with better quality control." },
      es: { h1: "Como convertir JPG a PDF online sin marca de agua (guia 2026)", lead: "Convierte imagenes JPG a PDF limpio sin marca de agua y con mejor control de calidad." },
      ru: { h1: "Как конвертировать JPG в PDF онлайн без водяного знака (2026)", lead: "Преобразуйте JPG в аккуратный PDF онлайн без водяных знаков." },
      ur: { h1: "JPG کو PDF میں بغیر واٹرمارک آن لائن کیسے کنورٹ کریں (2026)", lead: "JPG تصاویر کو صاف PDF میں بغیر واٹرمارک کے آن لائن تبدیل کریں۔" },
      hi: { h1: "JPG to PDF ऑनलाइन बिना वॉटरमार्क कैसे कन्वर्ट करें (2026)", lead: "JPG इमेज को साफ PDF में बिना वॉटरमार्क के ऑनलाइन कन्वर्ट करें।" },
      ar: { h1: "كيفية تحويل JPG الى PDF اونلاين بدون علامة مائية (2026)", lead: "حوّل صور JPG الى PDF نظيف بدون علامة مائية وبجودة افضل." },
      fr: { h1: "Comment convertir JPG en PDF en ligne sans filigrane (guide 2026)", lead: "Transformez des images JPG en PDF propre sans filigrane avec un meilleur controle qualite." },
      de: { h1: "JPG online ohne Wasserzeichen in PDF konvertieren (2026 Leitfaden)", lead: "JPG-Bilder online sauber in PDF ohne Wasserzeichen umwandeln." }
    },
    "/blog-pdf-to-jpg.html": {
      en: { h1: "How to Convert PDF to JPG Online Free (Extract Images from PDF)", lead: "Extract pages and images from PDF files as JPG online for free with clearer output settings." },
      es: { h1: "Como convertir PDF a JPG gratis en linea (extraer imagenes de PDF)", lead: "Extrae paginas e imagenes de PDF como JPG gratis en linea con mejor calidad de salida." },
      ru: { h1: "Как конвертировать PDF в JPG онлайн бесплатно (извлечь изображения)", lead: "Извлекайте страницы и изображения из PDF в JPG бесплатно онлайн." },
      ur: { h1: "PDF کو JPG میں مفت آن لائن کیسے کنورٹ کریں (تصاویر نکالیں)", lead: "PDF فائل سے صفحات اور تصاویر JPG میں مفت آن لائن نکالیں۔" },
      hi: { h1: "PDF to JPG ऑनलाइन फ्री कैसे कन्वर्ट करें (इमेज निकालें)", lead: "PDF फाइल से पेज और इमेज को JPG में ऑनलाइन मुफ्त निकालें।" },
      ar: { h1: "كيفية تحويل PDF الى JPG مجانا اونلاين (استخراج الصور من PDF)", lead: "استخرج الصفحات والصور من PDF الى JPG مجانا عبر الانترنت." },
      fr: { h1: "Comment convertir PDF en JPG gratuitement en ligne (extraire des images)", lead: "Extrayez les pages et images d'un PDF en JPG gratuitement en ligne." },
      de: { h1: "PDF kostenlos online in JPG konvertieren (Bilder aus PDF extrahieren)", lead: "Seiten und Bilder aus PDF kostenlos online als JPG extrahieren." }
    },
    "/blog-merge-pdf.html": {
      en: { h1: "How to Merge PDF Files Online Free (Combine Multiple PDFs)", lead: "Combine multiple PDFs into a single file online for free with a simple, fast workflow." },
      es: { h1: "Como unir archivos PDF gratis en linea (combinar varios PDFs)", lead: "Combina varios PDF en un solo archivo online gratis con un flujo simple y rapido." },
      ru: { h1: "Как объединить PDF файлы онлайн бесплатно (несколько PDF в один)", lead: "Объединяйте несколько PDF в один файл бесплатно онлайн за пару шагов." },
      ur: { h1: "PDF فائلز کو مفت آن لائن کیسے مرج کریں (متعدد PDFs یکجا کریں)", lead: "متعدد PDF فائلز کو ایک فائل میں مفت آن لائن آسانی سے یکجا کریں۔" },
      hi: { h1: "PDF फाइलों को ऑनलाइन फ्री कैसे मर्ज करें (कई PDF जोड़ें)", lead: "कई PDF फाइलों को एक फाइल में ऑनलाइन मुफ्त तेज़ी से जोड़ें।" },
      ar: { h1: "كيفية دمج ملفات PDF مجانا اونلاين (جمع عدة ملفات PDF)", lead: "ادمج عدة ملفات PDF في ملف واحد مجانا عبر الانترنت." },
      fr: { h1: "Comment fusionner des fichiers PDF gratuitement en ligne", lead: "Combinez plusieurs PDF en un seul fichier avec un flux rapide et simple." },
      de: { h1: "PDF-Dateien kostenlos online zusammenfugen", lead: "Mehrere PDFs in einer Datei kostenlos online zusammenfassen." }
    },
    "/blog-compress.html": {
      en: { h1: "Best Free Ways to Compress PDF Files Online (Reduce File Size Easily)", lead: "Reduce PDF size online for free while keeping documents readable and easy to share." },
      es: { h1: "Mejores formas gratis de comprimir PDF online (reducir tamano facilmente)", lead: "Reduce el tamano de PDF gratis online manteniendo buena legibilidad." },
      ru: { h1: "Лучшие бесплатные способы сжатия PDF онлайн", lead: "Уменьшайте размер PDF онлайн бесплатно с сохранением читаемости." },
      ur: { h1: "PDF فائل سائز کم کرنے کے بہترین مفت طریقے (آن لائن)", lead: "PDF کا سائز مفت آن لائن کم کریں اور پڑھنے کی کوالٹی برقرار رکھیں۔" },
      hi: { h1: "PDF को ऑनलाइन फ्री कंप्रेस करने के बेहतरीन तरीके", lead: "PDF फाइल साइज ऑनलाइन मुफ्त कम करें और पठनीयता बनाए रखें।" },
      ar: { h1: "افضل الطرق المجانية لضغط ملفات PDF اونلاين", lead: "قلل حجم PDF مجانا مع الحفاظ على وضوح المحتوى." },
      fr: { h1: "Meilleures methodes gratuites pour compresser un PDF en ligne", lead: "Reduisez la taille d'un PDF en ligne gratuitement en gardant une bonne lisibilite." },
      de: { h1: "Beste kostenlose Methoden zum PDF-Komprimieren online", lead: "PDF-Dateigroße kostenlos online reduzieren und Lesbarkeit erhalten." }
    },
    "/blog-terms-online-converter.html": {
      en: { h1: "Terms of Service for Online File Converters: What to Check Before You Upload (2026)", lead: "Understand terms, privacy, and format policies before uploading files to any online converter." },
      es: { h1: "Terminos de servicio para convertidores online: que revisar antes de subir (2026)", lead: "Comprende terminos, privacidad y politicas de formato antes de subir archivos." },
      ru: { h1: "Условия использования онлайн-конвертеров: что проверить перед загрузкой (2026)", lead: "Разберитесь в условиях, приватности и форматах перед загрузкой файлов." },
      ur: { h1: "آن لائن فائل کنورٹرز کے قواعد: اپ لوڈ سے پہلے کیا چیک کریں (2026)", lead: "فائل اپ لوڈ کرنے سے پہلے شرائط، پرائیویسی اور فارمیٹ پالیسی کو سمجھیں۔" },
      hi: { h1: "ऑनलाइन फाइल कन्वर्टर की शर्तें: अपलोड से पहले क्या जांचें (2026)", lead: "फ़ाइल अपलोड से पहले टर्म्स, प्राइवेसी और फॉर्मेट पॉलिसी समझें।" },
      ar: { h1: "شروط خدمة محولات الملفات اونلاين: ماذا تفحص قبل الرفع (2026)", lead: "افهم الشروط والخصوصية وسياسات الصيغ قبل رفع ملفاتك." },
      fr: { h1: "Conditions d'utilisation des convertisseurs en ligne : que verifier avant l'envoi (2026)", lead: "Comprenez les conditions, la confidentialite et les formats avant de televerser vos fichiers." },
      de: { h1: "Nutzungsbedingungen fur Online-Dateikonverter: Was vor dem Upload zu prufen ist (2026)", lead: "Prufen Sie Bedingungen, Datenschutz und Formatrichtlinien vor dem Hochladen." }
    },
    "/blog-pdf-to-word.html": {
      en: { h1: "PDF to Word Converter Online: Keep Formatting Intact (2026 Guide)", lead: "Convert PDF to Word with cleaner structure, better OCR handling, and fewer DOCX formatting fixes." }
    },
    "/blog-split-pdf.html": {
      en: { h1: "How to Split PDF Pages Online Free (Fast and Clean Workflow)", lead: "Extract page ranges and split large PDFs into shareable files with a quick, reliable flow." }
    },
    "/blog-pdf-to-powerpoint.html": {
      en: { h1: "PDF to PowerPoint Converter: Turn Reports into Slides (2026)", lead: "Turn PDF reports into editable slides and improve structure for presentation-ready decks." }
    },
    "/blog-heic-to-jpg.html": {
      en: { h1: "HEIC to JPG Converter Online: iPhone Photos Made Compatible", lead: "Convert HEIC photos to JPG for better compatibility across forms, websites, and older apps." }
    }
  };

  function safeGetTheme() {
    try {
      var raw = localStorage.getItem(THEME_KEY);
      return raw === "light" || raw === "dark" ? raw : null;
    } catch (e) {
      return null;
    }
  }

  function safeSetTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // Ignore storage write failures.
    }
  }

  function applyTheme(theme) {
    if (theme !== "light" && theme !== "dark") return;
    document.documentElement.setAttribute("data-theme", theme);
    var toggle = document.getElementById("themeBulb");
    if (!toggle) return;
    toggle.setAttribute("title", "Theme: " + (theme === "light" ? "Light" : "Dark"));
    toggle.setAttribute("aria-label", "Switch to " + (theme === "light" ? "dark" : "light") + " mode");
  }

  function initTheme() {
    var saved = safeGetTheme();
    applyTheme(saved || "light");
    var toggle = document.getElementById("themeBulb");
    if (!toggle || toggle.dataset.globalThemeBound === "1") return;
    toggle.dataset.globalThemeBound = "1";
    toggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      var next = current === "light" ? "dark" : "light";
      applyTheme(next);
      safeSetTheme(next);
    });
  }

  function getUiText(locale) {
    var dictLocale = LOCALE_ALIASES[String(locale || "").toLowerCase()] || "en";
    return UI_TEXT[dictLocale] || UI_TEXT.en;
  }

  function buildNav(currentPath, locale) {
    var ui = getUiText(locale);
    return NAV_ITEMS.map(function (item) {
      var active = currentPath === item.href || (item.href === "/index.html" && currentPath === "/");
      var index = NAV_ITEMS.indexOf(item);
      var label = ui.nav[index] || item.label;
      return '<a href="' + item.href + '"' + (active ? ' aria-current="page"' : "") + ">" + label + "</a>";
    }).join("");
  }

  function toDisplayLocale(locale) {
    var normalized = String(locale || "").toLowerCase();
    if (normalized === "en") return "en-us";
    if (normalized === "es") return "es-es";
    if (normalized === "ru") return "ru-ru";
    if (normalized === "ur") return "ur-pk";
    if (normalized === "hi") return "hi-in";
    if (normalized === "fr") return "fr-fr";
    if (normalized === "de") return "de-de";
    return normalized || DEFAULT_LOCALE;
  }

  function normalizePath(pathname) {
    var path = pathname || "/";
    if (path === "/") return "/index.html";
    return path;
  }

  function getBaseLocale(locale) {
    return LOCALE_ALIASES[String(locale || "").toLowerCase()] || "en";
  }

  function shouldSkipAutoTranslateNode(node) {
    if (!node || !node.parentElement) return true;
    var parent = node.parentElement;
    if (!parent.tagName) return true;
    var tag = String(parent.tagName).toUpperCase();
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT" || tag === "CODE" || tag === "PRE" || tag === "TEXTAREA") return true;
    if (parent.closest && parent.closest("[data-no-auto-translate='1']")) return true;
    return false;
  }

  function collectTranslatableTextNodes() {
    var nodes = [];
    if (!document.body) return nodes;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (shouldSkipAutoTranslateNode(node)) return NodeFilter.FILTER_REJECT;
        var value = String(node.nodeValue || "");
        if (!value.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var current = walker.nextNode();
    while (current) {
      nodes.push(current);
      current = walker.nextNode();
    }
    return nodes;
  }

  function collectTranslatableAttributes() {
    var entries = [];
    if (!document.body) return entries;
    var attrs = ["placeholder", "title", "aria-label", "aria-placeholder", "alt"];
    var elements = document.body.querySelectorAll("*");
    elements.forEach(function (el) {
      if (el.closest && el.closest("[data-no-auto-translate='1']")) return;
      var tag = String(el.tagName || "").toUpperCase();
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return;
      attrs.forEach(function (attr) {
        var value = el.getAttribute(attr);
        if (!value || !String(value).trim()) return;
        entries.push({ el: el, attr: attr, value: value });
      });
    });
    return entries;
  }

  function getOriginalTextForNode(node) {
    if (!node) return "";
    if (node.__fcOriginalText == null) node.__fcOriginalText = String(node.nodeValue || "");
    return String(node.__fcOriginalText || "");
  }

  function restoreOriginalAutoTranslatedText() {
    var nodes = collectTranslatableTextNodes();
    nodes.forEach(function (node) {
      if (node.__fcOriginalText != null) node.nodeValue = String(node.__fcOriginalText || "");
    });
    var attrs = collectTranslatableAttributes();
    attrs.forEach(function (entry) {
      var key = "__fcOriginalAttr_" + entry.attr;
      if (entry.el[key] != null) entry.el.setAttribute(entry.attr, String(entry.el[key] || ""));
    });
  }

  function getAutoTranslateCache(locale) {
    try {
      var key = AUTO_TRANSLATE_CACHE_PREFIX + getBaseLocale(locale) + ":" + (window.location.pathname || "/");
      var raw = localStorage.getItem(key);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function setAutoTranslateCache(locale, cache) {
    try {
      var key = AUTO_TRANSLATE_CACHE_PREFIX + getBaseLocale(locale) + ":" + (window.location.pathname || "/");
      localStorage.setItem(key, JSON.stringify(cache || {}));
    } catch (e) {
      // Ignore cache storage failures.
    }
  }

  async function translateTextValue(text, targetLang) {
    var url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t&tl=" +
      encodeURIComponent(targetLang) +
      "&q=" +
      encodeURIComponent(text);
    var response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("translate_request_failed");
    var payload = await response.json();
    var chunks = Array.isArray(payload && payload[0]) ? payload[0] : [];
    var translated = chunks.map(function (part) {
      return Array.isArray(part) ? String(part[0] || "") : "";
    }).join("");
    return translated || text;
  }

  async function applyAutoPageTranslation(locale) {
    var runId = ++activeTranslationRun;
    var baseLocale = getBaseLocale(locale);
    var targetLang = AUTO_TRANSLATE_LANG[baseLocale] || "en";
    restoreOriginalAutoTranslatedText();
    if (baseLocale === "en") return;

    var cache = getAutoTranslateCache(locale);
    var changedCache = false;

    var textNodes = collectTranslatableTextNodes();
    for (var i = 0; i < textNodes.length; i += 1) {
      if (runId !== activeTranslationRun) return;
      var node = textNodes[i];
      var source = getOriginalTextForNode(node);
      var key = "t:" + source;
      if (cache[key]) {
        node.nodeValue = cache[key];
        continue;
      }
      try {
        var translated = await translateTextValue(source, targetLang);
        if (runId !== activeTranslationRun) return;
        node.nodeValue = translated;
        cache[key] = translated;
        changedCache = true;
      } catch (e) {
        // Keep source text if translation fails.
      }
    }

    var attrs = collectTranslatableAttributes();
    for (var j = 0; j < attrs.length; j += 1) {
      if (runId !== activeTranslationRun) return;
      var entry = attrs[j];
      var attrKey = "__fcOriginalAttr_" + entry.attr;
      if (entry.el[attrKey] == null) entry.el[attrKey] = String(entry.value || "");
      var sourceAttr = String(entry.el[attrKey] || "");
      var cacheKey = "a:" + entry.attr + ":" + sourceAttr;
      if (cache[cacheKey]) {
        entry.el.setAttribute(entry.attr, cache[cacheKey]);
        continue;
      }
      try {
        var translatedAttr = await translateTextValue(sourceAttr, targetLang);
        if (runId !== activeTranslationRun) return;
        entry.el.setAttribute(entry.attr, translatedAttr);
        cache[cacheKey] = translatedAttr;
        changedCache = true;
      } catch (e2) {
        // Keep source attribute if translation fails.
      }
    }

    if (changedCache) setAutoTranslateCache(locale, cache);
  }

  function setSeoMetadataForLocale(locale) {
    var path = normalizePath(window.location.pathname || "/");
    var dictLocale = LOCALE_ALIASES[String(locale || "").toLowerCase()] || "en";
    var pathMeta = SEO_META_BY_PATH[path];
    if (!pathMeta) return;
    var meta = pathMeta[dictLocale] || pathMeta.en;
    if (!meta) return;
    if (meta.title) document.title = meta.title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc && meta.description) desc.setAttribute("content", meta.description);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && meta.title) ogTitle.setAttribute("content", meta.title);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && meta.description) ogDesc.setAttribute("content", meta.description);
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle && meta.title) twTitle.setAttribute("content", meta.title);
    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc && meta.description) twDesc.setAttribute("content", meta.description);
  }

  function applyPageTextForLocale(locale) {
    var path = normalizePath(window.location.pathname || "/");
    var dictLocale = LOCALE_ALIASES[String(locale || "").toLowerCase()] || "en";
    var pathText = PAGE_LOCALIZED_TEXT[path];
    if (!pathText) return;
    var text = pathText[dictLocale] || pathText.en;
    if (!text) return;
    if (path === "/tools.html" || path === "/features.html" || path === "/about.html" || path === "/contact.html" || path === "/faq.html") {
      var hero = document.querySelector(".info-section.card");
      if (!hero) return;
      var h1 = hero.querySelector("h1");
      if (h1 && text.h1) h1.textContent = text.h1;
      var paragraphs = hero.querySelectorAll("p");
      if (paragraphs[0] && text.lead) paragraphs[0].textContent = text.lead;
      if (path === "/tools.html" && paragraphs[1] && text.popular) paragraphs[1].innerHTML = text.popular;
      if (path === "/contact.html") {
        var sendBtn = hero.querySelector('button[type="submit"]');
        if (sendBtn && text.send) sendBtn.textContent = text.send;
      }
      return;
    }
    if (path === "/blog.html") {
      var blogH1 = document.querySelector("main h1");
      if (blogH1 && text.h1) blogH1.textContent = text.h1;
      var blogLead = document.querySelector("main > p");
      if (blogLead && text.lead) blogLead.textContent = text.lead;
      return;
    }
    if (path.indexOf("/blog-") === 0) {
      var articleTitle = document.querySelector("main article h1");
      if (articleTitle && text.h1) articleTitle.textContent = text.h1;
      var articleLead = document.querySelector("main article p");
      if (articleLead && text.lead) articleLead.textContent = text.lead;
      var firstSection = document.querySelector("main article h2");
      if (firstSection && text.h2_1) firstSection.textContent = text.h2_1;
    }
  }

  function applyLocalePresentation(locale) {
    var display = toDisplayLocale(locale);
    document.documentElement.lang = display;
    document.documentElement.dir = String(display).toLowerCase().indexOf("ar") === 0 ? "rtl" : "ltr";
    setSeoMetadataForLocale(display);
    applyPageTextForLocale(display);
    applyAutoPageTranslation(display);
  }

  function getPreferredLanguage() {
    try {
      var saved = localStorage.getItem("convertpro-language");
      var savedNormalized = String(saved || "").toLowerCase();
      if (LOCALE_ALIASES[savedNormalized]) return toDisplayLocale(savedNormalized);
    } catch (e) {}
    var candidates = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || "en-US"];
    for (var i = 0; i < candidates.length; i += 1) {
      var normalized = String(candidates[i] || "").toLowerCase();
      if (LOCALE_ALIASES[normalized]) return toDisplayLocale(normalized);
      var base = normalized.split("-")[0];
      if (base === "ur") return "ur-pk";
      if (base === "hi") return "hi-in";
      if (base === "ar") return "ar";
      if (base === "fr") return "fr-fr";
      if (base === "de") return "de-de";
      if (base === "es") return "es-es";
      if (base === "en") return "en-us";
    }
    return DEFAULT_LOCALE;
  }

  async function detectGeoLocale() {
    try {
      var controller = new AbortController();
      var timeoutId = setTimeout(function () { controller.abort(); }, 1500);
      var response = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });
      clearTimeout(timeoutId);
      if (!response.ok) return "";
      var data = await response.json();
      var country = String(data && data.country_code || "").toLowerCase();
      return COUNTRY_TO_LOCALE[country] || "";
    } catch (e) {
      return "";
    }
  }

  function ensureHeader() {
    var currentPath = window.location.pathname || "/";
    var header = document.querySelector(".topbar");
    if (!header) {
      var existingHeader = document.querySelector("header");
      var main = document.querySelector("main");
      var shell = document.querySelector(".app-shell");
      var host = shell || main || document.body;
      var wrapper = document.createElement("header");
      wrapper.className = "topbar global-topbar glass-navbar";
      wrapper.innerHTML =
        '<a href="/index.html" class="brand brand-link"><span class="brand-logo-wrap"><img class="brand-logo" src="/logo-v2.png" alt="Files Converter logo" /></span><span>Files Converter</span></a>' +
        '<nav class="topbar-nav">' + buildNav(currentPath, getPreferredLanguage()) + "</nav>" +
        '<button type="button" class="nav-toggle" aria-expanded="false">Menu</button>' +
        '<div class="topbar-controls"><select id="languageSelect" class="language-select" aria-label="Select language">' + LANGUAGE_OPTIONS_HTML + '</select><button id="themeBulb" class="theme-toggle" type="button" aria-label="Switch to light mode" title="Theme: Dark"><span class="theme-toggle__track"><span class="theme-toggle__sun" aria-hidden="true">☀</span><span class="theme-toggle__knob" aria-hidden="true"><span class="theme-toggle__moon">☾</span></span></span></button></div>';
      if (existingHeader) {
        existingHeader.replaceWith(wrapper);
      } else {
        host.insertBefore(wrapper, host.firstChild);
      }
      header = wrapper;
    }
    header.classList.add("global-topbar", "glass-navbar");
    header.setAttribute("data-glass-navbar", "");
    header.setAttribute("data-no-auto-translate", "1");

    var brandLabel = header.querySelector(".brand span:last-child");
    if (brandLabel) brandLabel.textContent = "Files Converter";

    var nav = header.querySelector(".topbar-nav");
    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "topbar-nav";
      var controls = header.querySelector(".topbar-controls");
      if (controls) header.insertBefore(nav, controls);
      else header.appendChild(nav);
    }
    nav.innerHTML = buildNav(currentPath, getPreferredLanguage());

    var controls = header.querySelector(".topbar-controls");
    if (!controls) {
      controls = document.createElement("div");
      controls.className = "topbar-controls";
      controls.innerHTML = '<select id="languageSelect" class="language-select" aria-label="Select language">' + LANGUAGE_OPTIONS_HTML + '</select><button id="themeBulb" class="theme-toggle" type="button" aria-label="Switch to light mode" title="Theme: Dark"><span class="theme-toggle__track"><span class="theme-toggle__sun" aria-hidden="true">☀</span><span class="theme-toggle__knob" aria-hidden="true"><span class="theme-toggle__moon">☾</span></span></span></button>';
      header.appendChild(controls);
    }
    if (!controls.querySelector("#languageSelect") || !controls.querySelector("#themeBulb")) {
      controls.innerHTML = '<select id="languageSelect" class="language-select" aria-label="Select language">' + LANGUAGE_OPTIONS_HTML + '</select><button id="themeBulb" class="theme-toggle" type="button" aria-label="Switch to light mode" title="Theme: Dark"><span class="theme-toggle__track"><span class="theme-toggle__sun" aria-hidden="true">☀</span><span class="theme-toggle__knob" aria-hidden="true"><span class="theme-toggle__moon">☾</span></span></span></button>';
    }
    var languageSelect = controls.querySelector("#languageSelect");
    if (languageSelect) {
      languageSelect.value = getPreferredLanguage();
      applyLocalePresentation(languageSelect.value);
      nav.innerHTML = buildNav(currentPath, languageSelect.value);
      var initialMenuBtn = header.querySelector(".nav-toggle");
      if (initialMenuBtn) initialMenuBtn.textContent = getUiText(languageSelect.value).menu;
      if (languageSelect.dataset.globalLanguageBound !== "1") {
        languageSelect.dataset.globalLanguageBound = "1";
        languageSelect.addEventListener("change", function (event) {
          var selected = String(event.target && event.target.value || "").toLowerCase();
          if (!LOCALE_ALIASES[selected]) return;
          var displayLocale = toDisplayLocale(selected);
          try { localStorage.setItem("convertpro-language", displayLocale); } catch (e) {}
          applyLocalePresentation(displayLocale);
          nav.innerHTML = buildNav(currentPath, displayLocale);
          var menuBtn = header.querySelector(".nav-toggle");
          if (menuBtn) menuBtn.textContent = getUiText(displayLocale).menu;
          ensureFooter(displayLocale);
        });
      }
    }

    if (controls && !header.querySelector(".nav-toggle")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nav-toggle";
      btn.textContent = getUiText(getPreferredLanguage()).menu;
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function () {
        var open = header.classList.toggle("nav-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      header.insertBefore(btn, controls);
    }
  }

  function ensureFooter(locale) {
    var ui = getUiText(locale || getPreferredLanguage());
    var footer = document.querySelector(".site-footer");
    var footerHtml =
      '<div class="footer-grid footer-grid--clean">' +
      '<section class="footer-col footer-col--brand"><h4>' + ui.footerBrand + '</h4><p class="footer-tagline">' + ui.footerTagline + '</p><p class="footer-tagline" style="margin-top:0.75rem;">' + ui.paddle + ' <a href="/terms.html">' + ui.terms + '</a> · <a href="/privacy.html">' + ui.privacy + '</a> · <a href="/refund.html">' + ui.refund + '</a></p></section>' +
      '<section class="footer-col"><h4>' + ui.product + '</h4><a href="/index.html">' + ui.home + '</a><a href="/features.html">' + ui.features + '</a><a href="/tools.html">' + ui.tools + '</a><a href="/faq.html">' + ui.faq + '</a></section>' +
      '<section class="footer-col"><h4>' + ui.legal + '</h4><a href="/terms.html">' + ui.terms + '</a><a href="/privacy.html">' + ui.privacy + '</a><a href="/refund.html">' + ui.refund + '</a><a href="/security.html">' + ui.security + '</a></section>' +
      '<section class="footer-col"><h4>' + ui.company + '</h4><a href="/about.html">' + ui.about + '</a><a href="/contact.html">' + ui.contact + '</a></section>' +
      "</div>" +
      '<div class="footer-copyline">Copyright ©2026 fahad usman All Rights Reserved.</div>';
    if (footer) {
      footer.setAttribute("data-no-auto-translate", "1");
      footer.innerHTML = footerHtml;
      return;
    }
    footer = document.querySelector("footer");
    if (footer) {
      footer.className = "site-footer";
      footer.setAttribute("data-no-auto-translate", "1");
      footer.innerHTML = footerHtml;
      return;
    }
    footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.setAttribute("data-no-auto-translate", "1");
    footer.innerHTML = footerHtml;
    document.body.appendChild(footer);
  }

  function boot() {
    ensureHeader();
    ensureFooter(getPreferredLanguage());
    initTheme();
    applyLocalePresentation(getPreferredLanguage());
    var hasSavedLocale = false;
    try { hasSavedLocale = Boolean(localStorage.getItem("convertpro-language")); } catch (e) {}
    if (!hasSavedLocale) {
      detectGeoLocale().then(function (geoLocale) {
        if (!geoLocale || !LOCALE_ALIASES[geoLocale]) return;
        var displayGeoLocale = toDisplayLocale(geoLocale);
        try { localStorage.setItem("convertpro-language", displayGeoLocale); } catch (e) {}
        var select = document.getElementById("languageSelect");
        if (select) select.value = displayGeoLocale;
        applyLocalePresentation(displayGeoLocale);
        ensureFooter(displayGeoLocale);
        var nav = document.querySelector(".topbar-nav");
        var currentPath = window.location.pathname || "/";
        if (nav) nav.innerHTML = buildNav(currentPath, displayGeoLocale);
      });
    }
    if ((window.location.pathname || "").indexOf("/tools/") === 0) {
      var script = document.createElement("script");
      script.src = "/articles/related-articles-widget.js";
      script.defer = true;
      document.body.appendChild(script);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

