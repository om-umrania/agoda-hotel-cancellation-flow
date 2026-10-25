# Assumptions

The brief allows assumptions "as long as they're clearly stated." These hold across the
flowchart, wireframes, and product note.

## Product & scope
1. **Product.** "Voya" is a young startup's Android app that books hotels via Agoda's
   APIs. Agoda is the backend inventory + fulfilment partner; Voya owns the UX.
2. **Integration model.** Voya uses Agoda's **Partner Fulfillment** model, so Voya owns
   payment *and* post-booking (including cancellations). This is why cancellation is
   self-serve in-app rather than a "call Agoda" redirect. *(see references)*
3. **Scope of this flow.** User-initiated **full cancellation** of a single, **confirmed,
   prepaid** hotel booking made in-app.
4. **Out of scope (v1).** Date/room **modifications**, **partial** (per-room / per-night)
   cancellation, no-show handling, group/corporate bookings, and agent/offline
   cancellation. These are noted as future scope.

## Booking, money & identity
5. **Booking linkage.** Every in-app booking stores Agoda's `bookingId`, mapped to the
   Voya user — so we can Retrieve and Cancel it later.
6. **Payment model.** Primary case is **prepaid** (captured at booking). "Pay at hotel"
   is handled as an edge case (nothing to refund; just release the reservation).
7. **Refunds.** Refunds go back to the **original payment method** and are **settled by
   Agoda / the payment rails**. Voya surfaces status and timeline but does not move money
   itself. Refund amount is **server-authoritative** — taken from Agoda's Cancellation
   **Preview** call, never computed on the client.
8. **Auth.** The user is already signed into Voya. The destructive confirm step requires
   a **re-authentication** (biometric / device credential) — assumed, not Agoda-mandated.

## Policy, locale & timing
9. **Currency & locale.** Amounts are shown in the **booking currency**; deadlines are
   shown in the **hotel's local time** (the timezone the policy is written against).
10. **Cancellation window.** Per Agoda, cancellations are allowed **up to 1 day before
    check-in**; on/after check-in the app routes the user to **assisted cancellation /
    fee-waiver** instead of a hard failure.
11. **Policy types.** We model three outcomes the UI must handle:
    **Free** (full refund within window), **Partial** (penalty deducted), and
    **Non-refundable** (no refund). These are derived from Agoda's `cancellationPolicy`
    fields + the Preview `refundRate`.

## Technical
12. **Latency.** Agoda's cancellation SLA is **~120 s**; the app shows an explicit
    processing state and tolerates an async `PENDING` result (resolved by polling a refund
    status endpoint or an Agoda webhook — *assumed channel*).
13. **Idempotency.** Confirm carries Agoda's `reference` (from Preview) **plus** our own
    idempotency key, so a retry or double-tap can never cancel twice or double-refund.
14. **Error mapping.** Agoda `errorMessage{id,subId,message}` and auth `error 108` are
    mapped to plain-language, recoverable user messages — never shown raw.
