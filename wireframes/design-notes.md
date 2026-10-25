# Wireframes — Design, Developer & Business Notes

Each screen below is annotated with three lenses, as the brief requires:
**🎨 Design (UI/UX)** · **⚙️ Developer (API usage)** · **📈 Business**.
Rendered screens live in [`screens/`](./screens/). Flow order follows
[`../flows/cancellation-flow.mmd`](../flows/cancellation-flow.mmd).

---

## 1. My Trips — entry (`screens/01-my-trips.png`)
Tabs: Upcoming · Completed · Cancelled. Each booking is a card: hotel image, name, dates,
status chip, and a policy hint ("Free cancellation until 26 Oct").

- **🎨 Design** — Lead with the booking the user most likely wants to act on (soonest
  upcoming). Show the free-cancel hint on the card so the deadline is visible *before* the
  user drills in. "Cancelled" tab doubles as the refund-status home.
- **⚙️ Developer** — List renders from our cache, reconciled with Agoda **Retrieve Booking**
  for live `status` + `cancellationPolicy`. Paginate; handle empty state.
- **📈 Business** — Surfacing the deadline early nudges users to cancel inside the free
  window → fewer penalties, fewer "why was I charged" tickets.

## 2. Booking Details (`screens/02-booking-details.png`)
Hotel summary, dates, guests, amount paid, cancellation policy (plain text + deadline), and
actions: **Cancel booking**, Modify *(disabled v1)*, Contact.

- **🎨 Design** — "Cancel" is present but not the loudest control (place below primary trip
  actions to avoid misfires); deadline shown as a countdown when inside the free window.
- **⚙️ Developer** — **Retrieve Booking** → `cancellationPolicy{code, cancellationText,
  parameter[], date[]}`; derive the deadline from `date[]`. Guard: if `now ≥ check-in − 1 day`,
  hide self-serve cancel, show **assisted / fee-waiver**.
- **📈 Business** — Offer "Modify instead of cancel" here later to retain the booking; this
  is the best place to recover revenue before intent hardens.

## 3. Refund Preview — HERO (`screens/03-refund-preview.png`) + branch variants
The make-or-break screen. Shows **Paid − Fee = Refund**, method, ETA, deadline countdown,
and an optional reason selector. Three variants:
`screens/03a-free.png` · `screens/03b-partial.png` · `screens/03c-nonrefundable.png`.

- **🎨 Design** — Refund amount is the hero; the math is explicit; policy in plain language.
  CTA states the outcome: *"Cancel & get ₹18,240 back"* / *"Cancel — no refund"*. Don't gate
  on choosing a reason. Non-refundable uses a calm warning, not alarm-red everything.
- **⚙️ Developer** — Call **Cancellation Preview** `{bookingId}` on entry → show `refundRate`
  (server truth; never compute locally). Keep `reference` for Confirm. Refresh if the quote
  is stale; format currency/locale.
- **📈 Business** — Transparency here is the single biggest lever on disputes/chargebacks.
  Instrument drop-off. Non-refundable → offer **travel credit** (fast-follow) to save CSAT.

## 4. Confirm + re-authenticate (`screens/04-confirm.png`)
Final summary, irreversible-action warning, biometric/device re-auth, deliberate confirm.

- **🎨 Design** — One last plain summary (what's cancelled, refund). Re-auth + an
  intentional confirm (not a stray tap). Easy back-out. Honest "this can't be undone".
- **⚙️ Developer** — **Cancellation Confirm** `{bookingId, reference, cancelReason, refundRate,
  remark?}` + our **idempotency key**. Map reason → `cancelReason` 0–44. Timeout/retry safe.
- **📈 Business** — Deliberate friction prevents regret cancellations & fraud; reason codes
  feed analytics and supply insight back to Agoda.

## 5. Processing (`screens/05-processing.png`)
Honest wait state for the ~120 s SLA; supports async `PENDING`.

- **🎨 Design** — Show progress + reassurance ("we're confirming with the hotel"); allow
  leaving — we'll notify. Never an infinite spinner.
- **⚙️ Developer** — Await Confirm; if `PENDING`, poll refund status / await webhook
  `refund.completed`. Persist `cancellationId`.
- **📈 Business** — Managing the wait honestly prevents duplicate cancels and "did it work?"
  tickets.

## 6. Cancellation Confirmed (`screens/06-confirmed.png`)
Cancellation reference, refund amount + **timeline**, receipt, rebook nudge.

- **🎨 Design** — Clear success; the refund timeline is the anxiety-reliever; offer receipt
  (email/push) and a gentle "find another stay".
- **⚙️ Developer** — Render from Confirm result + refund status; send email/push receipt;
  move booking to **Cancelled**.
- **📈 Business** — Confirmation is a trust artifact (deflects tickets); the rebook CTA
  recovers revenue; track refund SLA.

## 7. Edge & error states (`screens/07-edge-states.png`)
Grid: **(a)** non-refundable confirm · **(b)** cancellation failed (retry + support) ·
**(c)** past free-cancel deadline → assisted/fee-waiver · **(d)** offline / refund tracker.

- **🎨 Design** — Every failure has a next step; plain-language errors; never a dead end.
- **⚙️ Developer** — Map Agoda `errorMessage{id,subId,message}` + `error 108`; distinguish
  retriable vs terminal; idempotent retry; graceful offline.
- **📈 Business** — Good failure UX = fewer chargebacks and calls; track failure reasons to
  fix the top causes.
