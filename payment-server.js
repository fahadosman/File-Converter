const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

const PORT = Number(process.env.PORT || 8787);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const FRONTEND_RETURN_URL = process.env.FRONTEND_RETURN_URL || `${FRONTEND_ORIGIN}/#/`;
const EASYPAISA_STORE_ID = process.env.EASYPAISA_STORE_ID || "";
const EASYPAISA_HASH_KEY = process.env.EASYPAISA_HASH_KEY || "";
const EASYPAISA_SANDBOX = String(process.env.EASYPAISA_SANDBOX || "true") === "true";
const PREMIUM_AMOUNT_PKR = Number(process.env.PREMIUM_AMOUNT_PKR || 1);

const checkoutUrl = EASYPAISA_SANDBOX
  ? "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf"
  : "https://easypay.easypaisa.com.pk/easypay/Index.jsf";

const payments = new Map();

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.post("/api/payments/easypaisa/create", (req, res) => {
  try {
    if (!EASYPAISA_STORE_ID) {
      return res.status(500).json({ error: "EASYPAISA_STORE_ID is not configured." });
    }

    const ref = orderRef();
    const amount = normalizeAmount(PREMIUM_AMOUNT_PKR);
    const callbackUrl = `${req.protocol}://${req.get("host")}/api/payments/easypaisa/callback`;

    const fields = {
      storeId: EASYPAISA_STORE_ID,
      amount,
      postBackURL: callbackUrl,
      orderRefNum: ref,
      autoRedirect: "1",
      paymentMethod: "MA_PAYMENT_METHOD",
    };

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
  const redirectUrl = `${FRONTEND_RETURN_URL}${FRONTEND_RETURN_URL.includes("?") ? "&" : "?"}payment=${result}&orderRef=${encodeURIComponent(ref)}`;
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

