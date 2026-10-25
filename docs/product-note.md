# Product Note — Hotel Cancellation Flow

*A 1–2 page narrative on the overall flow. Product: **Voya** (Android), hotels fulfilled via
Agoda's Demand API.*

## The moment we're designing for
Cancellation is the most emotional step in a travel product. The user's plans just fell
through; they're anxious about their money and half-expecting a fight. If we make it clear,
fast, and honest, a *negative* moment becomes a reason to trust us — and to book again. If
we make it opaque, they call support, dispute with their bank, and leave a one-star review.
So the entire flow is built around one promise: **no surprises about the refund.**

## The flow, end to end
A user opens **Trips → Booking Details** and taps **Cancel booking**. Before anything is
committed, we call Agoda's **Cancellation Preview** and show a **Refund Preview**: the money
they paid, the penalty (if any), the refund they'll receive, the method, and the ETA — in
plain language, with the free-cancellation deadline shown as a live countdown while it's
still free. The refund number is **Agoda's, not ours** — we never calculate it on the device,
so what's shown is what's paid.

The screen adapts to the policy: **Free** (full refund), **Partial** (penalty deducted), or
**Non-refundable** (we say so plainly and, in a future version, offer travel credit instead).
The primary button states the outcome — *"Cancel & get ₹18,240 back"* or *"Cancel — no
refund"* — so the consequence is impossible to miss.

If the user continues, they pick an optional **reason** (mapped to Agoda's `cancelReason`
codes for analytics and supply insight), then hit a deliberate **Confirm** gated by
**re-authentication** (biometric). That friction is intentional: it prevents accidental and
regretted cancellations. We then call Agoda's **Cancellation Confirm**, passing the
`reference` from the Preview plus our own **idempotency key**, so a double-tap or retry can
never cancel twice or double-refund.

Because Agoda's cancellation SLA is ~120 seconds and refunds can settle asynchronously, we
show an honest **Processing** state and tolerate a `PENDING` result rather than spinning
forever. The flow ends on a **Confirmation** screen — cancellation reference, refund amount,
and a refund **timeline** — backed by an email/push receipt and a **refund status tracker**
in Trips. Every failure path (network, API error, auth, or a request made past the
cancellation window) resolves to a clear next step: retry, contact support, or route to
**assisted / fee-waiver** cancellation. Nothing dead-ends.

## Why these choices
- **Transparency over optimism.** Showing the real refund up front costs us some completed
  cancellations but saves far more in disputes, chargebacks, and support load — and it's the
  honest thing to do.
- **Server-authoritative money.** The refund is Agoda's number, surfaced, never recomputed.
- **Deliberate, reversible-feeling friction.** Re-auth + an outcome-stating CTA protect the
  user from themselves without feeling like a trap.
- **Designed for the unhappy path.** The policy branches and error states *are* the product;
  the happy path is the easy 20%.

## What we'll watch
Self-serve cancel rate, cancellation support tickets, disputes/chargebacks, drop-off at the
Refund Preview, refund-SLA adherence, post-cancel rebooking, and CSAT on the flow. The
Refund Preview is the make-or-break screen — if people abandon there, our refund copy or
policy transparency needs work, not the funnel.

## Risks & open questions
- Exact Agoda cancellation **REST paths** and a **refund-status/webhook** channel are
  assumed and must be confirmed against the live partner docs.
- **Non-refundable** bookings are a satisfaction cliff — travel-credit as an alternative is
  the most valuable fast-follow.
- **Timezone correctness** on the deadline (hotel local time) is a common, costly bug class.

*Supporting docs:* [PRD](./product-requirements.md) · [Assumptions](./assumptions.md) ·
[API integration](./api-integration.md) · [IA](../flows/information-architecture.md) ·
[Flowchart](../flows/cancellation-flow.mmd) · [Wireframe notes](../wireframes/design-notes.md)
