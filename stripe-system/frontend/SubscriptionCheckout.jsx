import React, { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "");
const LOCAL_UI_PLAN_KEY = "uiSelectedPlan";

const PLAN_STATES = {
  free_active: "free_active",
  premium_active: "premium_active",
  payment_incomplete: "payment_incomplete",
  payment_failed: "payment_failed",
  downgrade_scheduled: "downgrade_scheduled",
  canceled_but_active_until_period_end: "canceled_but_active_until_period_end",
  processing: "processing",
};

function useApi() {
  const [csrfReady, setCsrfReady] = useState(false);

  useEffect(() => {
    fetch("/api/csrf-token", { credentials: "include" }).finally(() => setCsrfReady(true));
  }, []);

  async function request(path, options = {}) {
    const csrfToken = readCookie("csrf_token");
    const headers = {
      "Content-Type": "application/json",
      "x-user-id": "demo_user",
      "x-csrf-token": csrfToken || "",
      ...(options.headers || {}),
    };
    const response = await fetch(path, {
      ...options,
      headers,
      credentials: "include",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Request failed.");
    return payload;
  }

  return { request, csrfReady };
}

function readCookie(name) {
  return document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.split("=")[1];
}

function CheckoutForm({ clientSecret, returnUrl, onFinish, mode }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const clickGuardRef = useRef(false);

  async function submit(event) {
    event.preventDefault();
    if (!stripe || !elements || processing || clickGuardRef.current) return;
    clickGuardRef.current = true;
    setProcessing(true);
    setError("");

    // Stripe validates card number/expiry/cvc inside Payment Element.
    const result =
      mode === "setup"
        ? await stripe.confirmSetup({
            elements,
            confirmParams: { return_url: returnUrl },
            redirect: "if_required",
          })
        : await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: returnUrl },
            redirect: "if_required",
          });

    if (result.error) {
      setError(result.error.message || "Payment confirmation failed.");
      setProcessing(false);
      clickGuardRef.current = false;
      return;
    }

    // Frontend confirmation is not trusted for access changes.
    onFinish({ status: "processing" });
  }

  return (
    <form onSubmit={submit}>
      <PaymentElement
        onChange={(event) => {
          if (event.error) setError(event.error.message || "Card details invalid.");
          else setError("");
        }}
      />
      <button type="submit" disabled={!stripe || !elements || processing}>
        {processing ? "Processing..." : "Submit"}
      </button>
      {error ? <p>{error}</p> : null}
    </form>
  );
}

export default function SubscriptionCheckoutPage() {
  const { request, csrfReady } = useApi();
  const [loading, setLoading] = useState(true);
  const [uiSelectedPlan, setUiSelectedPlan] = useState(localStorage.getItem(LOCAL_UI_PLAN_KEY) || "free");
  const [activePlan, setActivePlan] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [flowMode, setFlowMode] = useState("payment");
  const [consentText, setConsentText] = useState(
    "I authorize saving this payment method for future purchases and subscription renewals."
  );
  const [email, setEmail] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [status, setStatus] = useState("");

  async function reloadFromBackend() {
    const result = await request("/api/me/subscription");
    setActivePlan(result.activePlan);
    setStatus("");
  }

  useEffect(() => {
    if (!csrfReady) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // UI state can persist for display intent only.
        const restoredUiPlan = localStorage.getItem(LOCAL_UI_PLAN_KEY) || "free";
        if (mounted) setUiSelectedPlan(restoredUiPlan);

        // Backend is source of truth and overwrites effective access.
        const payload = await request("/api/me/subscription");
        if (mounted) setActivePlan(payload.activePlan);
      } catch (error) {
        if (mounted) setStatus(error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [csrfReady]);

  useEffect(() => {
    localStorage.setItem(LOCAL_UI_PLAN_KEY, uiSelectedPlan);
  }, [uiSelectedPlan]);

  const premiumGranted = useMemo(() => {
    return activePlan?.state === PLAN_STATES.premium_active || activePlan?.state === PLAN_STATES.canceled_but_active_until_period_end;
  }, [activePlan]);

  async function startOneTimePayment(saveForLater = false) {
    if (!isValidEmail(email)) throw new Error("Enter a valid email.");
    if (!billingZip.trim()) throw new Error("Billing ZIP is required.");
    const idempotencyKey = cryptoRandom();
    const payload = await request("/api/payments/payment-intent", {
      method: "POST",
      headers: { "idempotency-key": idempotencyKey },
      body: JSON.stringify({ productId: "premium_one_time", saveForLater }),
    });
    setFlowMode("payment");
    setClientSecret(payload.clientSecret || "");
    setStatus("Payment intent created. Complete payment securely.");
  }

  async function startSetupIntentOnly() {
    if (!isValidEmail(email)) throw new Error("Enter a valid email.");
    const idempotencyKey = cryptoRandom();
    const payload = await request("/api/payments/setup-intent", {
      method: "POST",
      headers: { "idempotency-key": idempotencyKey },
      body: JSON.stringify({
        consentText,
        consentAt: new Date().toISOString(),
      }),
    });
    setFlowMode("setup");
    setClientSecret(payload.clientSecret || "");
    setStatus("Setup intent created. Confirm to save payment method.");
  }

  async function startSubscription(planCode = "premium_monthly") {
    const idempotencyKey = cryptoRandom();
    const payload = await request("/api/subscriptions/create", {
      method: "POST",
      headers: { "idempotency-key": idempotencyKey },
      body: JSON.stringify({ planCode }),
    });
    setFlowMode("payment");
    setClientSecret(payload.clientSecret || "");
    setStatus("Subscription initialized. Complete first payment.");
  }

  async function scheduleDowngrade() {
    await request("/api/subscriptions/change-plan", {
      method: "POST",
      body: JSON.stringify({ mode: "period_end" }),
    });
    await reloadFromBackend();
  }

  async function immediateDowngrade() {
    await request("/api/subscriptions/change-plan", {
      method: "POST",
      body: JSON.stringify({ mode: "immediate_free" }),
    });
    await reloadFromBackend();
  }

  async function handleFinish() {
    // Handle delayed webhooks/redirect abandons by polling backend truth.
    setStatus("Awaiting webhook confirmation...");
    const pollStart = Date.now();
    while (Date.now() - pollStart < 60_000) {
      await reloadFromBackend();
      if (premiumGranted || activePlan?.state === PLAN_STATES.payment_failed) break;
      await sleep(2500);
    }
  }

  if (loading) return <div>Loading subscription state...</div>;

  return (
    <div>
      <h1>Billing</h1>
      <p>UI selected plan: {uiSelectedPlan}</p>
      <p>Backend active plan: {activePlan?.state || "unknown"}</p>
      <p>Premium access: {premiumGranted ? "granted" : "not granted"}</p>
      {activePlan?.state === PLAN_STATES.downgrade_scheduled ? <p>Downgrade scheduled at period end.</p> : null}
      {activePlan?.state === PLAN_STATES.payment_failed ? <p>Payment failed. Retry available.</p> : null}
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Billing ZIP
        <input value={billingZip} onChange={(e) => setBillingZip(e.target.value)} />
      </label>
      <div>
        <button onClick={() => setUiSelectedPlan("premium")}>UI select Premium</button>
        <button onClick={() => setUiSelectedPlan("free")}>UI select Free</button>
      </div>
      <div>
        <button onClick={() => startOneTimePayment(false)}>One-time payment</button>
        <button onClick={() => startOneTimePayment(true)}>Pay now + save for later</button>
        <button onClick={startSetupIntentOnly}>Save payment method only</button>
        <button onClick={() => startSubscription("premium_monthly")}>Start subscription</button>
      </div>
      <div>
        <button onClick={immediateDowngrade}>Downgrade immediately</button>
        <button onClick={scheduleDowngrade}>Downgrade at period end</button>
      </div>
      <label>
        Consent text
        <textarea value={consentText} onChange={(e) => setConsentText(e.target.value)} />
      </label>
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            clientSecret={clientSecret}
            mode={flowMode}
            returnUrl={`${window.location.origin}/billing`}
            onFinish={handleFinish}
          />
        </Elements>
      ) : null}
      {status ? <p>{status}</p> : null}
    </div>
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function cryptoRandom() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
