# Product Requirements — Hotel Cancellation Flow

**Product:** Voya (Android) · hotels booked via Agoda's Demand API
**Use case:** Self-serve cancellation of an existing hotel booking
**Author:** PM101 Mid-Course Case · Masters' Union
**Status:** v1 spec for wireframe review

## 1. Problem
Users can book in Voya, but cannot cancel in Voya. When plans change they call support
or dispute via their bank — the highest-anxiety, lowest-trust moment in travel. That drives
support cost, chargebacks, and churn, and it leaks a moment that could *build* loyalty.

## 2. Goal
Let a user cancel a confirmed booking themselves, with **zero surprises about the refund** —
they always see exactly what they get back, and when, *before* they commit.

**North-star principle:** *No surprises.* The refund shown is the refund paid.

## 3. Users
- **Primary:** a traveller whose plans changed, on mobile, often time-pressured and anxious.
- **Secondary:** support agents (fewer "how do I cancel / where's my refund" tickets).

## 4. Scope
**In (v1):** user-initiated **full** cancellation of a single **confirmed, prepaid** booking;
three policy outcomes (free / partial / non-refundable); refund preview + confirmation +
status; core edge/error states.
**Out (v1):** modifications, partial/per-room cancellation, no-show, group/corporate,
offline/agent cancellation. *(see [assumptions](./assumptions.md))*

## 5. Functional requirements
- **FR1** View bookings and open Booking Details (Agoda *Retrieve Booking*).
- **FR2** Surface the cancellation policy + free-cancel deadline **before** the user commits.
- **FR3** Show a server-authoritative **refund preview** (Agoda *Cancellation Preview*):
  Paid − Fee = Refund, plus method + ETA.
- **FR4** Handle the three outcomes with distinct, honest copy and CTA labels.
- **FR5** Require a deliberate **confirm + re-auth** before the destructive action.
- **FR6** Cancel via Agoda *Cancellation Confirm* with the Preview `reference` + idempotency key.
- **FR7** Show a **processing** state tolerant of the ~120 s SLA / async `PENDING`.
- **FR8** Show a **confirmation** with cancellation reference, refund amount + timeline, receipt.
- **FR9** Recover gracefully from every error (network, API, auth, past-window) — no dead ends.
- **FR10** Provide a **refund status tracker** after cancellation.

## 6. Non-functional
- Refund is **never** computed client-side. Confirm is **idempotent**. Deadlines in **hotel
  local time**, amounts in **booking currency**. Destructive action is **re-authenticated**.
  Raw Agoda error codes are **never** shown to users.

## 7. Success metrics
| Metric | Why |
|---|---|
| Self-serve cancellation rate | Deflects support; measures flow adoption |
| Cancellation-related support tickets ↓ | Core cost saving |
| Refund disputes / chargebacks ↓ | Transparency working |
| Flow completion & drop-off (esp. Refund Preview) | Where trust breaks |
| Post-cancellation rebooking rate | Revenue recovery |
| Refund SLA met (time to "refunded") | Promise kept |
| CSAT on the cancel flow | The trust outcome |

## 8. Release
**v1** this flow · **v1.1** refund status push + "modify instead" · **vNext** partial/per-room
cancel, non-refundable → travel-credit, group bookings.
