# Agoda Hotel Cancellation Flow

**PM101 · Mid-Course Case · Masters' Union** — end-to-end product design of a hotel-booking
**cancellation** experience for an Android app ("Voya"), built on **Agoda's Demand API**:
information architecture, flowchart, annotated wireframes, API integration, and a product note.

> **One promise to the traveller: no surprises about the refund.** The refund shown is the
> refund paid — it's always Agoda's number, surfaced before the user commits.

## 🔴 Live interactive prototype
**→ https://agoda-cancellation-flow.vercel.app** — Next.js app: toggle **wireframe ⇄ hi-fi**,
walk the full 7-screen flow, switch between 12 scenarios, and browse **55 corner cases**
(tap *▶ demo* to load one into the phone). Source in [`prototype/`](prototype/).

## 📦 Submission

**→ [`presentation/final-submission.pdf`](presentation/final-submission.pdf)** — the graded deck
(13 pages): cover · context & metrics · assumptions · IA · logic/information flow · Agoda API
map · 5 annotated wireframe pages (Design / Developer / Business notes) · 2-page product note.
Built from [`presentation/deck.html`](presentation/deck.html) (open in a browser → ⌘P → Save as PDF).

## 🗂 Repository

| Path | What |
|---|---|
| `docs/product-requirements.md` | PRD — problem, users, scope, success metrics |
| `docs/product-note.md` | The 1–2 page product note |
| `docs/assumptions.md` | All clearly-stated assumptions |
| `docs/api-integration.md` | Developer notes — Agoda Demand API, screen → call map |
| `flows/information-architecture.md` | IA / navigation map |
| `flows/cancellation-flow.mmd` | Flowchart (Mermaid source — logic + information flow) |
| `flows/cancellation-flow.png` | Rendered flow diagram |
| `wireframes/design-notes.md` | Per-screen Design / Developer / Business notes |
| `wireframes/screens/*.png` | Rendered mobile wireframes (8 screens) |
| `references/agoda-api-documentation.md` | Grounded Agoda API research + sources |
| `presentation/` | The deck (`deck.html`) + the submission PDF |
| `prototype/` | **Interactive Next.js app** → [live on Vercel](https://agoda-cancellation-flow.vercel.app) (`cd prototype && npm i && npm run dev`) |

## 🧭 The flow (7 screens)
My Trips → Booking Details → **Refund Preview** (the make-or-break screen) → Confirm + re-auth
→ Processing (~120s) → Confirmed + refund timeline → (edge/error states + refund tracker).

Agoda's cancellation is a documented **two-step Preview → Confirm**, which maps 1:1 onto the
refund-preview and confirm screens. See the flow in [`flows/cancellation-flow.mmd`](flows/cancellation-flow.mmd).

## 🔌 Agoda API (grounding)
Partner Fulfillment model. Auth `Authorization: <Site-ID>:<API-Key>` (or OAuth 2.0).
Cancellation: **Preview** `{bookingId}` → `reference` + `refundRate`, then **Confirm**
`{bookingId, reference, cancelReason 0–44, refundRate}`. Refund is server-authoritative; Confirm
is idempotent (`reference` + our key). Details + `[DOCUMENTED]`/`[INFERRED]` tags in
[`references/agoda-api-documentation.md`](references/agoda-api-documentation.md).

## 🛠 Regenerate the PDF / screens
The deck is a self-contained HTML file. To re-export PNGs + PDF, a Playwright render script is
used (kept outside the repo). Or simply open `presentation/deck.html` and print to PDF.

---
*Team: Member 1–5 · Group X (replace with real names on the cover before submitting).*
