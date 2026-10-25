# Agoda Partner (Demand) API, Reference Notes

> Grounding for the Developer / API-usage notes in this assignment.
> Each fact is tagged **[DOCUMENTED]** (found in Agoda's public Demand docs) or
> **[INFERRED]** (our reasonable assumption, since the full partner docs sit behind
> a login). The assignment permits assumptions as long as they are stated, see
> [`docs/assumptions.md`](../docs/assumptions.md).

Agoda migrated its partner docs from `partners.agoda.com/DeveloperPortal` (the URL
printed on the assignment) to **developer.agoda.com/demand**. The old links now
301-redirect there. An OpenAPI / doc index is published at
`developer.pps.agoda.com/llms.txt`.

---

## 1. API families & integration models

**[DOCUMENTED]** The B2B product is the **Agoda Demand API** (a.k.a. the Affiliate /
Connectivity API). Its core APIs:

| API | Purpose |
|---|---|
| **Content API** | Static property content, names, images, descriptions, amenities, address |
| **Search API** (+ Search API 2.0) | Live availability, rates, and **cancellation policy** per offer |
| **Pre-check API** | Re-validates rate, price and policy immediately before booking |
| **Book API** | Creates a booking → returns a `bookingId` |
| **Post-Book API** | **Retrieve / Amend / Cancel** existing bookings |
| **Cancellation API** | The dedicated two-step cancel flow (Preview → Confirm) |
| **Special Requests API** | Guest requests attached to a booking |

**[DOCUMENTED]** Three integration models:

1. **Online Affiliates / MSE**, Search only (price comparison / meta).
2. **Agoda Fulfill-Assisted**, Search + Book; **Agoda** handles payment & post-booking.
3. **Partner Fulfillment**, Search + Book + Post-Book; the **partner** owns payment
   and customer service, **including cancellations**.

> **Our product (Voya) uses the Partner Fulfillment model**, this is why we own the
> in-app cancellation experience and surface the refund ourselves. *(Stated assumption.)*

**[DOCUMENTED]** Portals: `developer.agoda.com/demand` (demand/affiliate),
`developer.agoda.com/supply` (hotel supply / YCS). `ycs.agoda.com` (Yield Control
System) is the hotelier extranet, a different product. `affiliates.agoda.com` is the
marketing link-affiliate program (deep links + a `cid`), distinct from the booking API.
**[INFERRED]** The informal "Long Tail" name refers to that marketing link program; it
is not a booking-API endpoint.

---

## 2. Authentication

**[DOCUMENTED]** Two methods, **API-Key** (legacy) and **OAuth 2.0** (recommended).
Auth headers are mandatory on every request.

- **API-Key:** single header `Authorization: <Site-ID>:<API-Key>`
  (e.g. `Authorization: 123456:00000000-0000-0000-0000-000000000000`),
  plus `Content-Type: application/json`.
  Site ID + API Key must **also** appear inside the request body.
  **IP whitelisting is required.** Invalid/missing credentials → **error code 108**.
  API-Key auth is slated for deprecation (~end 2026) in favour of OAuth bearer tokens.
- **OAuth 2.0:** bearer token on the `Authorization` header (recommended for new builds).
- **[DOCUMENTED]** Separate **Sandbox** and **Live** environments; site credentials are
  issued on partner approval.
- **[INFERRED]** The marketing-affiliate side uses a **`cid`** (campaign/site ID), which
  is *not* the booking-API Site-ID, worth distinguishing.

---

## 3. Booking lifecycle (field names [DOCUMENTED]; exact REST paths [INFERRED], as they
live in the interactive OpenAPI explorer)

### Search (availability + policy)
- Request: `criteria { propertyIds[≤100], checkIn, checkOut, rooms, adults, children,
  language, currency, userCountry }`, `features { ratesPerProperty, extra }`.
- Response (per offer): `roomId, blockId, ratePlanId, rate{inclusive,exclusive},
  totalPayment, perRoomPerNightRate, dailyRate`, plus `cancellationPolicy` +
  `freeCancellation`.

### Pre-check
- **[DOCUMENTED it exists]**, validates rate/availability/price/policy just before Book.
  Field schema not public → **[INFERRED]**.

### Book
- Submit guest + payment details → returns a `bookingId`.

### Retrieve Booking (Post-Book)
- Returns booking **status + details** (used to render "My Trips" / Booking Details and
  to check status before cancelling).

### Cancellation, **two-step** [DOCUMENTED]
1. **Preview / Estimate**, request `{ bookingId (long) }` →
   `cancellationSummary { bookingId, reference (int), cancellationPolicy[] (policyText
   by language), paymentRate[], refundRate[] }`, each rate has a currency + `inclusive`
   amount. *(This is what powers the in-app refund-preview screen.)*
2. **Confirm**, request `{ bookingId, reference, cancelReason (int code 0–44, e.g.
   0 = None, 44 = Natural disaster), refundRate { currency, inclusive }, remark? (string) }`
   → **HTTP 200, empty body**. Errors return `errorMessage { id, subId, message }`.

- **Response SLA ≈ 120 s.**
- Cancellations allowed **up to 1 day before check-in**; on/after check-in needs manual
  escalation.
- A **Fee Waiver Cancellation** flow exists for special cases (e.g. disaster, duplicate).

> The `reference` returned by **Preview** must be passed to **Confirm**, it binds the
> confirmation to the exact refund the user was shown, and doubles as an anti-double-cancel
> guard (we also attach our own idempotency key, *stated assumption*).

---

## 4. Cancellation-policy data model (from Search / Retrieve)

**[DOCUMENTED]**
- `freeCancellation`, boolean.
- `cancellationPolicy.code`, policy-format code.
- `cancellationPolicy.cancellationText`, human-readable
  (e.g. *"You can cancel until November 27, 2021 and pay nothing!"*).
- `cancellationPolicy.parameter`, penalty tiers: `days`, `charge` (type), `value`.
- `cancellationPolicy.date`, datetime refund thresholds, each with a `rate` amount.
- Non-refundable is encoded as *"365 Days with 100 Percent"*.

**[INFERRED]** Agoda exposes the *pieces* rather than one tidy `refundableAmount`. The app
should derive the free-cancellation **deadline timestamp** and the **refundable amount** for
the UI from `cancellationPolicy.date[].rate` + `paymentRate` / `refundRate`. Safest to treat
the exact refund as **server-authoritative** (from the Cancellation Preview call), never
computed on the client.

---

## 5. What we treat as an assumption in this project

- Exact REST paths / hosts for each endpoint (docs expose them via the OpenAPI explorer only).
- Pre-check request/response schema (`developer.pps.agoda.com/docs/pre-check-api.md` → 404).
- A refund-**status** / webhook channel (`booking.cancelled`, `refund.completed`) for the
  async refund timeline, modelled on standard payment-settlement practice.
- Our own idempotency key on Confirm, and our mapping of Agoda `errorMessage` → user copy.

---

## Sources
- https://developer.agoda.com/demand/docs/getting-started
- https://developer.pps.agoda.com/docs/api-key.md
- https://developer.agoda.com/demand/docs/cancel-bookings  (+ `.../fee-waiver-cancellation`)
- https://developer.agoda.com/demand/docs/json-search-api
- https://developer.pps.agoda.com/llms.txt  (OpenAPI / doc index)
- Assignment brief links (now redirecting): `partners.agoda.com/DeveloperPortal/APIDoc/GettingStarted`, `.../SearchAPI`
