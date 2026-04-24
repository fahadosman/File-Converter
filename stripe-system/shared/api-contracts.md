# API Contracts

All write endpoints require:
- `x-user-id`
- `x-csrf-token`
- `idempotency-key` (recommended and enforced for payment/subscription writes)

## `GET /api/me/subscription`
Response:
```json
{
  "activePlan": {
    "userId": "demo_user",
    "state": "free_active",
    "planCode": "free",
    "stripeSubscriptionId": null,
    "currentPeriodEnd": null,
    "cancelAtPeriodEnd": false,
    "scheduledPlanCode": null,
    "updatedAt": "2026-04-22T00:00:00.000Z"
  }
}
```

## `POST /api/payments/payment-intent`
Request:
```json
{ "productId": "premium_one_time", "saveForLater": true }
```
Response:
```json
{
  "clientSecret": "pi_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "status": "processing"
}
```

## `POST /api/payments/setup-intent`
Request:
```json
{
  "consentText": "I authorize saving this payment method...",
  "consentAt": "2026-04-22T12:00:00.000Z"
}
```
Response:
```json
{ "clientSecret": "seti_secret_xxx" }
```

## `POST /api/subscriptions/create`
Request:
```json
{ "planCode": "premium_monthly" }
```
Response:
```json
{
  "subscriptionId": "sub_xxx",
  "status": "payment_incomplete",
  "clientSecret": "pi_secret_xxx"
}
```

## `POST /api/subscriptions/change-plan`
Request:
```json
{ "mode": "period_end" }
```
or
```json
{ "mode": "immediate_free" }
```
Response:
```json
{ "activePlan": { "...": "..." } }
```

## `POST /api/payments/redirect/reconcile`
Request:
```json
{ "paymentIntentId": "pi_xxx" }
```
Response:
```json
{ "status": "processing" }
```

## `POST /api/webhooks/stripe`
Raw Stripe event endpoint.
- Verifies signature
- Deduplicates on `event.id`
- Updates state atomically in handler
- Source of truth for paid/unpaid transitions
