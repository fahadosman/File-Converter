require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const Stripe = require("stripe");

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-06-20" });

const PORT = Number(process.env.STRIPE_SERVER_PORT || 8899);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * In production, replace this with a real DB and transactions.
 * Tables mirror: users, subscriptions, payment_attempts, webhook_events, audit_logs.
 */
const db = {
  users: new Map(),
  subscriptions: new Map(),
  paymentAttempts: new Map(),
  webhookEvents: new Map(),
  auditLogs: [],
};

const PLAN_STATES = {
  FREE_ACTIVE: "free_active",
  PREMIUM_ACTIVE: "premium_active",
  PAYMENT_INCOMPLETE: "payment_incomplete",
  PAYMENT_FAILED: "payment_failed",
  DOWNGRADE_SCHEDULED: "downgrade_scheduled",
  CANCELED_BUT_ACTIVE_UNTIL_PERIOD_END: "canceled_but_active_until_period_end",
  PROCESSING: "processing",
};

const PLAN_PRICE_MAP = {
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "",
  premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || "",
};

function nowIso() {
  return new Date().toISOString();
}

function randomId(prefix) {
  return `${prefix}_${crypto.randomBytes(10).toString("hex")}`;
}

function getOrCreateUser(userId) {
  const found = db.users.get(userId);
  if (found) return found;
  const user = {
    id: userId,
    email: `${userId}@example.local`,
    stripeCustomerId: null,
    createdAt: nowIso(),
  };
  db.users.set(userId, user);
  db.subscriptions.set(userId, {
    userId,
    state: PLAN_STATES.FREE_ACTIVE,
    planCode: "free",
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    scheduledPlanCode: null,
    updatedAt: nowIso(),
  });
  return user;
}

function getSubscription(userId) {
  const row = db.subscriptions.get(userId);
  if (!row) throw new Error("Subscription row missing");
  return row;
}

function getUserIdFromAuth(req) {
  const header = String(req.headers["x-user-id"] || "").trim();
  return header || "demo_user";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function sanitizeText(input) {
  return String(input || "").replace(/[<>]/g, "").slice(0, 5000);
}

function putAuditLog(userId, action, details) {
  db.auditLogs.push({
    id: randomId("audit"),
    userId,
    action,
    details,
    createdAt: nowIso(),
  });
}

function createOrGetCustomer(user) {
  if (user.stripeCustomerId) return Promise.resolve(user.stripeCustomerId);
  return stripe.customers
    .create({ email: user.email, metadata: { userId: user.id } })
    .then((customer) => {
      user.stripeCustomerId = customer.id;
      return customer.id;
    });
}

function assertCsrf(req, res, next) {
  // Double submit cookie pattern for SPA APIs.
  const cookieToken = req.cookies.csrf_token;
  const headerToken = req.headers["x-csrf-token"];
  if (req.method === "GET" || req.path.startsWith("/api/webhooks/stripe")) return next();
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: "CSRF validation failed." });
  }
  return next();
}

function issueCsrfToken(req, res, next) {
  const cookieToken = req.cookies.csrf_token;
  if (!cookieToken) {
    res.cookie("csrf_token", crypto.randomBytes(24).toString("hex"), {
      httpOnly: false,
      sameSite: "lax",
      secure: String(process.env.NODE_ENV).toLowerCase() === "production",
      path: "/",
    });
  }
  next();
}

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment attempts. Try again shortly." },
});

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://js.stripe.com"],
        frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
        connectSrc: ["'self'", "https://api.stripe.com"],
        imgSrc: ["'self'", "data:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(issueCsrfToken);
app.use((req, res, next) => {
  if (req.path === "/api/webhooks/stripe") return next();
  return express.json({ limit: "100kb" })(req, res, next);
});
app.use(assertCsrf);

app.get("/api/csrf-token", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/me/subscription", (req, res) => {
  const userId = getUserIdFromAuth(req);
  getOrCreateUser(userId);
  const subscription = getSubscription(userId);
  res.json({ activePlan: subscription });
});

app.post("/api/payments/setup-intent", paymentLimiter, async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    const user = getOrCreateUser(userId);
    const customerId = await createOrGetCustomer(user);
    const consentText = sanitizeText(req.body?.consentText);
    if (!consentText) return res.status(400).json({ error: "Consent text is required." });

    const setupIntent = await stripe.setupIntents.create(
      {
        customer: customerId,
        usage: "off_session",
        payment_method_types: ["card"],
        metadata: { userId },
      },
      { idempotencyKey: req.headers["idempotency-key"] || randomId("seti") }
    );

    putAuditLog(userId, "payment_method_save_requested", { consentText, consentAt: nowIso() });
    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: "Unable to create setup intent." });
  }
});

app.post("/api/payments/payment-intent", paymentLimiter, async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    const user = getOrCreateUser(userId);
    const customerId = await createOrGetCustomer(user);

    // Recompute amount server-side. Never trust frontend price.
    const productId = String(req.body?.productId || "").trim();
    const allowedProducts = new Map([
      ["premium_one_time", 990],
      ["credits_100", 500],
    ]);
    if (!allowedProducts.has(productId)) return res.status(400).json({ error: "Invalid product ID." });
    const amount = allowedProducts.get(productId);

    const saveForLater = Boolean(req.body?.saveForLater);
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount,
        currency: "usd",
        customer: customerId,
        payment_method_types: ["card", "link"],
        setup_future_usage: saveForLater ? "off_session" : undefined,
        metadata: { userId, productId },
      },
      { idempotencyKey: req.headers["idempotency-key"] || randomId("pi") }
    );

    db.paymentAttempts.set(paymentIntent.id, {
      id: paymentIntent.id,
      userId,
      kind: "one_time",
      state: "processing",
      amount,
      currency: "usd",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: "processing",
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to create payment intent." });
  }
});

app.post("/api/subscriptions/create", paymentLimiter, async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    const user = getOrCreateUser(userId);
    const planCode = String(req.body?.planCode || "");
    const priceId = PLAN_PRICE_MAP[planCode];
    if (!priceId) return res.status(400).json({ error: "Invalid plan." });

    const customerId = await createOrGetCustomer(user);
    const existing = getSubscription(userId);
    if (existing.state === PLAN_STATES.PREMIUM_ACTIVE) {
      return res.status(409).json({ error: "Already premium." });
    }

    const subscription = await stripe.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
        metadata: { userId, planCode },
      },
      { idempotencyKey: req.headers["idempotency-key"] || randomId("sub_create") }
    );

    db.subscriptions.set(userId, {
      ...existing,
      state: PLAN_STATES.PAYMENT_INCOMPLETE,
      planCode: "free",
      stripeSubscriptionId: subscription.id,
      updatedAt: nowIso(),
    });

    const latestPi = subscription.latest_invoice?.payment_intent;
    res.json({
      subscriptionId: subscription.id,
      status: "payment_incomplete",
      clientSecret: latestPi?.client_secret || null,
    });
  } catch (error) {
    res.status(500).json({ error: "Unable to create subscription." });
  }
});

app.post("/api/subscriptions/change-plan", paymentLimiter, async (req, res) => {
  try {
    const userId = getUserIdFromAuth(req);
    getOrCreateUser(userId);
    const mode = String(req.body?.mode || "period_end");
    const current = getSubscription(userId);
    if (!current.stripeSubscriptionId) return res.status(400).json({ error: "No active Stripe subscription." });

    if (mode === "immediate_free") {
      await stripe.subscriptions.cancel(current.stripeSubscriptionId, {
        prorate: true,
      });
      db.subscriptions.set(userId, {
        ...current,
        state: PLAN_STATES.FREE_ACTIVE,
        planCode: "free",
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
        updatedAt: nowIso(),
      });
      putAuditLog(userId, "downgrade_immediate", { source: "api" });
      return res.json({ activePlan: getSubscription(userId) });
    }

    await stripe.subscriptions.update(current.stripeSubscriptionId, {
      cancel_at_period_end: true,
      proration_behavior: "none",
    });
    db.subscriptions.set(userId, {
      ...current,
      state: PLAN_STATES.DOWNGRADE_SCHEDULED,
      cancelAtPeriodEnd: true,
      updatedAt: nowIso(),
    });
    putAuditLog(userId, "downgrade_scheduled", { source: "api" });
    return res.json({ activePlan: getSubscription(userId) });
  } catch (error) {
    return res.status(500).json({ error: "Unable to change plan." });
  }
});

app.post("/api/payments/redirect/reconcile", paymentLimiter, (req, res) => {
  // Never trust return URL params. Frontend can call this endpoint, but backend waits on webhooks.
  const intentId = String(req.body?.paymentIntentId || "").trim();
  if (!intentId) return res.status(400).json({ error: "paymentIntentId is required." });
  const row = db.paymentAttempts.get(intentId);
  if (!row) return res.json({ status: "processing" });
  return res.json({ status: row.state });
});

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), (req, res) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return res.status(400).send("Invalid Stripe signature.");
  }

  if (db.webhookEvents.has(event.id)) {
    return res.status(200).json({ deduplicated: true });
  }

  try {
    // Mark consumed first so retry processing is idempotent.
    db.webhookEvents.set(event.id, { id: event.id, type: event.type, receivedAt: nowIso() });
    const object = event.data.object;

    switch (event.type) {
      case "payment_intent.succeeded": {
        const record = db.paymentAttempts.get(object.id);
        if (record) {
          db.paymentAttempts.set(object.id, { ...record, state: "succeeded", updatedAt: nowIso() });
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const record = db.paymentAttempts.get(object.id);
        if (record) {
          db.paymentAttempts.set(object.id, { ...record, state: "failed", updatedAt: nowIso() });
        }
        break;
      }
      case "invoice.paid": {
        const userId = object.metadata?.userId;
        if (userId && db.subscriptions.has(userId)) {
          const current = getSubscription(userId);
          db.subscriptions.set(userId, {
            ...current,
            state: PLAN_STATES.PREMIUM_ACTIVE,
            planCode: object.metadata?.planCode || "premium_monthly",
            updatedAt: nowIso(),
          });
          putAuditLog(userId, "subscription_paid", { invoiceId: object.id });
        }
        break;
      }
      case "invoice.payment_failed": {
        const userId = object.metadata?.userId;
        if (userId && db.subscriptions.has(userId)) {
          const current = getSubscription(userId);
          db.subscriptions.set(userId, {
            ...current,
            state: PLAN_STATES.PAYMENT_FAILED,
            updatedAt: nowIso(),
          });
          putAuditLog(userId, "subscription_payment_failed", { invoiceId: object.id });
        }
        break;
      }
      case "customer.subscription.updated": {
        const userId = object.metadata?.userId;
        if (userId && db.subscriptions.has(userId)) {
          const cancelAtPeriodEnd = Boolean(object.cancel_at_period_end);
          const current = getSubscription(userId);
          db.subscriptions.set(userId, {
            ...current,
            state: cancelAtPeriodEnd
              ? PLAN_STATES.CANCELED_BUT_ACTIVE_UNTIL_PERIOD_END
              : PLAN_STATES.PREMIUM_ACTIVE,
            cancelAtPeriodEnd,
            currentPeriodEnd: object.current_period_end
              ? new Date(object.current_period_end * 1000).toISOString()
              : null,
            updatedAt: nowIso(),
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const userId = object.metadata?.userId;
        if (userId && db.subscriptions.has(userId)) {
          const current = getSubscription(userId);
          db.subscriptions.set(userId, {
            ...current,
            state: PLAN_STATES.FREE_ACTIVE,
            planCode: "free",
            stripeSubscriptionId: null,
            cancelAtPeriodEnd: false,
            currentPeriodEnd: null,
            updatedAt: nowIso(),
          });
          putAuditLog(userId, "subscription_deleted", { subscriptionId: object.id });
        }
        break;
      }
      default:
        break;
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ error: "Webhook processing failure." });
  }
});

app.get("/api/debug/state", (req, res) => {
  res.json({
    users: [...db.users.values()],
    subscriptions: [...db.subscriptions.values()],
    paymentAttempts: [...db.paymentAttempts.values()],
    webhookEvents: [...db.webhookEvents.values()],
    auditLogs: db.auditLogs,
  });
});

app.listen(PORT, () => {
  console.log(`Stripe server listening on http://localhost:${PORT}`);
});
