require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

const PORT = Number(process.env.PORT || 8787);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const FRONTEND_RETURN_URL = process.env.FRONTEND_RETURN_URL || `${FRONTEND_ORIGIN}/#/`;
const APP_BASE_URL = process.env.APP_BASE_URL || "";
const EASYPAISA_STORE_ID = process.env.EASYPAISA_STORE_ID || "";
const EASYPAISA_HASH_KEY = process.env.EASYPAISA_HASH_KEY || "";
const EASYPAISA_SANDBOX = String(process.env.EASYPAISA_SANDBOX || "true") === "true";
const PREMIUM_AMOUNT_PKR = Number(process.env.PREMIUM_AMOUNT_PKR || 2);
const EASYPAISA_PAYMENT_METHOD = process.env.EASYPAISA_PAYMENT_METHOD || "MA_PAYMENT_METHOD";
const EASYPAISA_ACCOUNT_NUMBER = process.env.EASYPAISA_ACCOUNT_NUMBER || "";
const EASYPAISA_ACCOUNT_FIELD = process.env.EASYPAISA_ACCOUNT_FIELD || "mobileNum";
const EASYPAISA_EXPIRY_MINUTES = Number(process.env.EASYPAISA_EXPIRY_MINUTES || 30);
const FREE_LIMIT = Number(process.env.FREE_LIMIT || 5);

const checkoutUrl = EASYPAISA_SANDBOX
  ? "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf"
  : "https://easypay.easypaisa.com.pk/easypay/Index.jsf";

const payments = new Map();
const usageSessions = new Map();
const usageIdentityBucket = new Map();
const rateBucket = new Map();
app.set("trust proxy", true);
app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (origin === FRONTEND_ORIGIN) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/i.test(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
  next();
});

app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "32kb" }));

function checkRateLimit(req, res, next) {
  const ip = String(req.ip || req.headers["x-forwarded-for"] || "unknown");
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxHits = 80;
  const prev = rateBucket.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > prev.resetAt) {
    prev.count = 0;
    prev.resetAt = now + windowMs;
  }
  prev.count += 1;
  rateBucket.set(ip, prev);
  if (prev.count > maxHits) {
    return res.status(429).json({ error: "Too many requests. Please retry shortly." });
  }
  return next();
}

app.use(checkRateLimit);

function parseCookies(req) {
  const source = req.headers.cookie || "";
  return source.split(";").reduce((acc, part) => {
    const [k, ...v] = part.trim().split("=");
    if (!k) return acc;
    acc[k] = decodeURIComponent(v.join("=") || "");
    return acc;
  }, {});
}

function getUsageIdentityKey(req) {
  const ip = String(req.ip || req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const ua = String(req.headers["user-agent"] || "unknown").trim().toLowerCase();
  const raw = `${ip}|${ua}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function syncIdentityUsage(identityKey, session) {
  usageIdentityBucket.set(identityKey, {
    usageCount: Number(session.usageCount || 0),
    isPremium: Boolean(session.isPremium),
    updatedAt: Date.now(),
  });
}

function getOrCreateUsageSession(req, res) {
  const cookies = parseCookies(req);
  const identityKey = getUsageIdentityKey(req);
  let sessionId = cookies.fc_session_id;
  let session = sessionId ? usageSessions.get(sessionId) : null;
  const identityUsage = usageIdentityBucket.get(identityKey);
  if (!session) {
    sessionId = crypto.randomBytes(24).toString("hex");
    session = {
      usageCount: Number(identityUsage?.usageCount || 0),
      isPremium: Boolean(identityUsage?.isPremium),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    usageSessions.set(sessionId, session);
    res.setHeader("Set-Cookie", `fc_session_id=${sessionId}; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000`);
  }
  session.updatedAt = Date.now();
  syncIdentityUsage(identityKey, session);
  return { sessionId, session };
}

app.post("/api/usage/session/start", (req, res) => {
  const { session } = getOrCreateUsageSession(req, res);
  return res.json({ usageCount: session.usageCount, isPremium: Boolean(session.isPremium), freeLimit: FREE_LIMIT });
});

app.get("/api/usage/session/status", (req, res) => {
  const { session } = getOrCreateUsageSession(req, res);
  return res.json({ usageCount: session.usageCount, isPremium: Boolean(session.isPremium), freeLimit: FREE_LIMIT });
});

app.post("/api/usage/session/consume", (req, res) => {
  const { session } = getOrCreateUsageSession(req, res);
  if (session.isPremium) {
    return res.json({ usageCount: session.usageCount, isPremium: true, freeLimit: FREE_LIMIT });
  }
  if (session.usageCount >= FREE_LIMIT) {
    return res.status(403).json({ error: "Free conversion limit reached.", usageCount: session.usageCount, isPremium: false, freeLimit: FREE_LIMIT });
  }
  session.usageCount += 1;
  session.updatedAt = Date.now();
  syncIdentityUsage(getUsageIdentityKey(req), session);
  return res.json({ usageCount: session.usageCount, isPremium: false, freeLimit: FREE_LIMIT });
});

app.get("/api/payments/session/status", (req, res) => {
  const { session } = getOrCreateUsageSession(req, res);
  return res.json({ isPremium: Boolean(session.isPremium) });
});

app.post("/api/payments/session/activate", (req, res) => {
  const { session } = getOrCreateUsageSession(req, res);
  const orderRef = String(req.body?.orderRef || "").trim();
  if (!orderRef) {
    return res.status(400).json({ error: "orderRef is required." });
  }

  const paymentRecord = payments.get(orderRef);
  if (!paymentRecord || paymentRecord.status !== "success") {
    return res.status(403).json({ error: "Payment is not verified.", isPremium: Boolean(session.isPremium) });
  }

  session.isPremium = true;
  session.updatedAt = Date.now();
  syncIdentityUsage(getUsageIdentityKey(req), session);
  return res.json({ isPremium: true });
});

function orderRef() {
  return `IAP-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function normalizeAmount(amount) {
  return Number(amount).toFixed(2);
}

function buildMerchantHash(fields, key) {
  if (!key) return null;
  const keyBuffer = Buffer.from(key, "utf8");
  if (![16, 24, 32].includes(keyBuffer.length)) {
    throw new Error("EASYPAISA_HASH_KEY must be 16/24/32 bytes for AES-ECB hashing.");
  }

  const mapString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join("&");

  const algo = keyBuffer.length === 16 ? "aes-128-ecb" : keyBuffer.length === 24 ? "aes-192-ecb" : "aes-256-ecb";
  const cipher = crypto.createCipheriv(algo, keyBuffer, null);
  cipher.setAutoPadding(true);
  const encrypted = Buffer.concat([cipher.update(mapString, "utf8"), cipher.final()]);
  return encrypted.toString("base64");
}

function buildCallbackUrl(req) {
  if (APP_BASE_URL) return `${APP_BASE_URL.replace(/\/$/, "")}/api/payments/easypaisa/callback`;
  return `${req.protocol}://${req.get("host")}/api/payments/easypaisa/callback`;
}

function expiryDate(minutes) {
  const date = new Date(Date.now() + Math.max(1, minutes) * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())} ${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function appendQuery(url, query) {
  const [base, hash = ""] = String(url).split("#");
  const sep = base.includes("?") ? "&" : "?";
  const q = Object.entries(query)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return `${base}${sep}${q}${hash ? `#${hash}` : ""}`;
}

app.post("/api/payments/easypaisa/create", (req, res) => {
  try {
    if (!EASYPAISA_STORE_ID) {
      return res.status(500).json({ error: "EASYPAISA_STORE_ID is not configured." });
    }

    const ref = orderRef();
    const amount = normalizeAmount(PREMIUM_AMOUNT_PKR);
    const callbackUrl = buildCallbackUrl(req);

    const fields = {
      storeId: EASYPAISA_STORE_ID,
      amount,
      postBackURL: callbackUrl,
      orderRefNum: ref,
      autoRedirect: "1",
      paymentMethod: EASYPAISA_PAYMENT_METHOD,
      expiryDate: expiryDate(EASYPAISA_EXPIRY_MINUTES),
    };
    if (EASYPAISA_ACCOUNT_NUMBER) fields[EASYPAISA_ACCOUNT_FIELD] = EASYPAISA_ACCOUNT_NUMBER;

    const merchantHashedReq = buildMerchantHash(fields, EASYPAISA_HASH_KEY);
    if (merchantHashedReq) fields.merchantHashedReq = merchantHashedReq;

    payments.set(ref, { status: "pending", amount, createdAt: Date.now() });

    return res.json({
      checkoutUrl,
      orderRef: ref,
      fields,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to create payment." });
  }
});

app.post("/api/payments/easypaisa/callback", (req, res) => {
  const payload = req.body || {};
  const ref = payload.orderRefNum || payload.orderRef || payload.txnRefNo || "";
  const paymentState =
    String(payload.responseCode || "").trim() === "0000" ||
    String(payload.transactionStatus || "").toLowerCase() === "success" ||
    String(payload.paymentStatus || "").toLowerCase() === "success";

  if (ref) {
    const previous = payments.get(ref) || {};
    payments.set(ref, {
      ...previous,
      status: paymentState ? "success" : "failed",
      callbackPayload: payload,
      updatedAt: Date.now(),
    });
  }

  const result = paymentState ? "success" : "failed";
  const redirectUrl = appendQuery(FRONTEND_RETURN_URL, { payment: result, orderRef: ref });
  return res.redirect(302, redirectUrl);
});

app.get("/api/payments/easypaisa/verify/:orderRef", (req, res) => {
  const entry = payments.get(req.params.orderRef);
  if (!entry) return res.status(404).json({ status: "unknown" });
  return res.json({ status: entry.status, orderRef: req.params.orderRef });
});

app.listen(PORT, () => {
  console.log(`EasyPaisa payment server listening on http://localhost:${PORT}`);
});

