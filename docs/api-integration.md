# API Integration, Developer Notes

How the cancellation flow is wired to the **Agoda Demand API** (Partner Fulfillment model).
Field names are from Agoda's public docs; exact paths and the refund-status channel are
assumptions (see [`references/agoda-api-documentation.md`](../references/agoda-api-documentation.md)).

## Auth (every call)
```
Authorization: <Site-ID>:<API-Key>        # legacy API-Key, or OAuth 2.0 bearer (recommended)
Content-Type: application/json
# Site-ID + API-Key also echoed in the body (API-Key mode); caller IP must be whitelisted.
# Invalid/missing credentials -> error 108.
```

## Screen → API map

| Screen | Agoda call | Reads / writes | Notes |
|---|---|---|---|
| My Trips (list) | **Retrieve Booking** (Post-Book) | `status`, hotel, dates, `freeCancellation`, policy summary | Hydrate from our cache first, reconcile with Agoda. Paginate. |
| Booking Details | **Retrieve Booking** | full booking + `cancellationPolicy{code, cancellationText, parameter[], date[]}` | Surface the free-cancel **deadline** early (derived from `date[]`). |
| Refund Preview | **Cancellation → Preview/Estimate** `{bookingId}` | → `cancellationSummary{reference, cancellationPolicy[], paymentRate[], refundRate[]}` | **Refund = server truth.** Hold `reference` for Confirm. Refresh if quote goes stale. |
| Confirm + re-auth | **Cancellation → Confirm** `{bookingId, reference, cancelReason, refundRate, remark?}` | → HTTP 200 (empty) or `errorMessage{id,subId,message}` | `cancelReason` ∈ 0–44. Attach our idempotency key. ~120 s SLA. |
| Processing | (await Confirm / poll) | `PENDING` tolerated | Don't block UI forever; allow background + notify. |
| Confirmed | Refund **status** (assumed) / webhook `refund.completed` | `cancellationId`, refund amount, ETA | Store cancellation ref; send email/push receipt. |
| Edge: past window | route to **Fee-Waiver / assisted** | | Agoda allows cancel up to 1 day before check-in. |

## Request sketches

**Preview** (powers the refund-preview screen):
```http
POST /cancellation/preview
Authorization: 123456:********-****-****-****-************
Content-Type: application/json

{ "bookingId": 889001234 }
```
```jsonc
// 200
{ "cancellationSummary": {
    "bookingId": 889001234,
    "reference": 70421,                         // bind this to Confirm
    "cancellationPolicy": [{ "language": "en-us",
        "policyText": "Free cancellation until 26 Oct 2026, 14:00 (hotel time)." }],
    "paymentRate":  [{ "currency": "INR", "inclusive": 18240.00 }],
    "refundRate":   [{ "currency": "INR", "inclusive": 18240.00 }]   // 0 => non-refundable
}}
```

**Confirm** (the destructive action):
```http
POST /cancellation/confirm
Idempotency-Key: voya-cxl-889001234-9f2a      // our guard (assumed)

{ "bookingId": 889001234,
  "reference": 70421,
  "cancelReason": 7,                            // from our reason picker -> Agoda code 0..44
  "refundRate": { "currency": "INR", "inclusive": 18240.00 },
  "remark": "Plans changed" }
```
```jsonc
// 200 empty body  => CANCELLED (or PENDING if refund settles async)
// error => { "errorMessage": { "id": 4xx, "subId": .., "message": ".." } } -> mapped to user copy
```

## Rules the client must respect
- **Never compute the refund locally**, always show Agoda's `refundRate`.
- **`reference` is mandatory on Confirm** and ties the confirm to the previewed amount.
- **Idempotent Confirm**, identical `(bookingId, reference, idempotency-key)` must be safe to retry.
- **Reason mapping**, our human reasons map to Agoda `cancelReason` integer codes (0–44).
- **Error copy**, map `errorMessage` / `error 108`; never surface raw codes.
- **Window guard**, if now ≥ (check-in − 1 day), hide self-serve cancel and offer assisted / fee-waiver.
