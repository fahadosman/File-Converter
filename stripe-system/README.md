# Stripe Payment + Plan Management Module

This module provides a secure-by-default implementation for:
- One-time payments (`PaymentIntent`)
- Save payment method (`SetupIntent`)
- Pay now + save for later (`setup_future_usage`)
- Subscriptions with incomplete/failed/renewal/SCA handling
- Redirect/delayed method reconciliation
- Webhook-authoritative plan/payment updates

## Files

- Backend: `stripe-system/backend/server.js`
- Frontend (React + Stripe Elements): `stripe-system/frontend/SubscriptionCheckout.jsx`
- API contracts: `stripe-system/shared/api-contracts.md`
- DB design: `stripe-system/shared/schema.sql`

## Core Implementation Rules

- Backend creates all Stripe intents and subscriptions.
- Frontend only gets `clientSecret`, never computes amount or plan authority.
- Order/plan is not marked paid from frontend confirmation.
- Webhook events are the source of truth for payment/subscription state transitions.
- `uiSelectedPlan` is persisted in localStorage for UI only.
- `activePlan` is fetched from backend on every load and controls access.

## Frontend State Model

```js
const uiSelectedPlan = localStorage.getItem("uiSelectedPlan") || "free"; // UI only
const activePlan = await api.get("/api/me/subscription"); // backend truth
const hasPremium = ["premium_active", "canceled_but_active_until_period_end"].includes(activePlan.state);
```

On load:
1. Render loading state
2. Read localStorage for UI preference
3. Fetch `/api/me/subscription`
4. Overwrite display/effective access with backend state
5. Render final UI

## Failure Scenarios Covered

- User refresh during payment: page reload fetches backend subscription state.
- Double click pay: disabled submit + click guard + idempotency key.
- Network failure: safe error surfaced, no premium grant.
- 3DS abandoned: remains `processing`/`payment_incomplete` until webhook.
- Redirect not returned: webhook still updates backend.
- Webhook delayed: frontend polls backend state.
- Payment succeeded but frontend missed it: backend state still upgraded by webhook.
- Stale `client_secret`: backend returns error and user can regenerate intent.
- Multiple tabs: backend authoritative state prevents fake premium drift.

## Security Middleware

Implemented in backend:
- `helmet` with CSP (Stripe script/frame/connect allowlist)
- CORS allowlist
- CSRF double-submit cookie + `x-csrf-token`
- Payment endpoint rate limiting
- Stripe webhook signature verification
- Webhook deduplication by `event.id`
- Idempotency keys for Stripe write calls
- Input sanitation and server-side validation

## Validation

- Frontend: required fields + email format + disable submit while processing.
- Stripe Elements: card/expiry/CVC validation via `PaymentElement`.
- Server:
  - Recompute amount from server product map
  - Validate product IDs and subscription plan codes
  - Validate user/customer ownership
  - Enforce idempotent payment/subscription writes
  - Block invalid transitions (for example, duplicate premium activation)

## Important Notes

- Do not log or persist Stripe `client_secret`.
- Use HTTPS for frontend, backend, and webhook endpoints in production.
- Replace in-memory storage in `server.js` with transactional DB operations (see `schema.sql`) before production.
