export type Step =
  | "trips" | "details" | "preview" | "confirm"
  | "processing" | "done" | "error" | "assisted" | "tracker";

// right-panel visual rail (icon-led)
export const RAIL: { id: string; icon: string; title: string; action: string }[] = [
  { id: "find", icon: "🧳", title: "Open your booking", action: "Tap the trip you want to cancel" },
  { id: "review", icon: "🧾", title: "See your refund", action: "Check exactly what you get back — before you commit" },
  { id: "confirm", icon: "🔒", title: "Confirm it's you", action: "Re-authenticate, then confirm the cancellation" },
  { id: "process", icon: "⏳", title: "We cancel it", action: "We confirm with the hotel through Agoda (~120s)" },
  { id: "done", icon: "✅", title: "Refund on its way", action: "Reference, amount and timeline — all tracked" },
];

export const RAIL_ORDER = ["find", "review", "confirm", "process", "done"];

export const STEP_TO_RAIL: Record<Step, string> = {
  trips: "find", details: "find", assisted: "find",
  preview: "review",
  confirm: "confirm", error: "confirm",
  processing: "process",
  done: "done", tracker: "done",
};

export const COACH: Partial<Record<Step, { text: string; pos: "cta" | "up" }>> = {
  trips: { text: "Tap a booking above to begin", pos: "up" },
  details: { text: "Tap “Cancel booking” below", pos: "cta" },
  preview: { text: "Review the refund, then tap the orange button", pos: "cta" },
  confirm: { text: "Scan to authenticate, then confirm", pos: "cta" },
  error: { text: "Tap “Try again” — it's safe to retry", pos: "cta" },
  assisted: { text: "Pick how you'd like help", pos: "cta" },
};

export const NOTES: Record<Step, { title: string; api: string; design: string; dev: string; biz: string }> = {
  trips: { title: "My Trips — the entry point", api: "GET Retrieve Booking",
    design: "Lead with the soonest trip; show the free-cancel hint on the card itself.",
    dev: "List from cache, reconciled with Retrieve Booking → status + cancellationPolicy.",
    biz: "Surfacing the deadline early nudges cancels inside the free window." },
  details: { title: "Booking Details", api: "GET Retrieve Booking → cancellationPolicy.date[]",
    design: "'Cancel' is present but not the loudest control; deadline as a live countdown.",
    dev: "Derive deadline from date[]. If now ≥ check-in − 1 day → route to assisted.",
    biz: "Best place to offer 'modify instead of cancel' and retain the booking." },
  preview: { title: "Refund Preview — the make-or-break screen", api: "POST Cancellation · Preview → reference, refundRate",
    design: "Refund is the hero; the math is explicit. CTA states the outcome.",
    dev: "Refund is server-authoritative (refundRate) — fetched live, never computed on device.",
    biz: "Transparency here is the biggest lever on disputes & chargebacks." },
  confirm: { title: "Confirm + re-authenticate", api: "POST Cancellation · Confirm {reference, cancelReason}",
    design: "A plain last summary + honest 'can't be undone'. Re-auth + deliberate confirm.",
    dev: "Confirm carries the Preview reference + an idempotency key → never double-cancels.",
    biz: "Deliberate friction prevents regret cancellations & fraud." },
  processing: { title: "Processing (~120s)", api: "await Confirm / poll status",
    design: "Show progress + reassurance and let the user leave — never an infinite spinner.",
    dev: "On PENDING, poll refund status / await webhook refund.completed.",
    biz: "Managing the wait honestly prevents duplicate cancels and 'did it work?' tickets." },
  done: { title: "Confirmed — a trust artifact", api: "refund.completed (webhook)",
    design: "Lead with the refund timeline — the real anxiety-reliever. Offer receipt + rebook.",
    dev: "Render from Confirm result + refund status; email/push; move booking to Cancelled.",
    biz: "Confirmation deflects tickets; the rebook CTA recovers revenue." },
  error: { title: "Error — never a dead end", api: "errorMessage{id,subId,message} / 108",
    design: "Plain-language error + a clear next step. Reassure: booking unchanged.",
    dev: "Map Agoda codes to friendly copy; retriable vs terminal; idempotent retry.",
    biz: "Good failure UX = fewer chargebacks and calls." },
  assisted: { title: "Assisted / Fee-Waiver", api: "Fee-Waiver Cancellation (manual)",
    design: "Don't hard-fail past the window — offer a human path with context pre-filled.",
    dev: "Self-serve only up to 1 day before check-in; beyond that, escalate with context.",
    biz: "Protects goodwill in the worst moments; captures waiver reasons." },
  tracker: { title: "Refund status tracker", api: "refund status / webhook",
    design: "Answer 'where's my money?' with an honest timeline and the destination.",
    dev: "Poll/subscribe to refund events; escalate automatically if past SLA.",
    biz: "Visible refund progress is the biggest deflector of post-cancel contacts." },
};

const GH = "https://github.com/om-umrania/agoda-hotel-cancellation-flow/blob/main/";
export const DOCS: { icon: string; title: string; desc: string; path: string; href: string }[] = [
  { icon: "📄", title: "Product Requirements", desc: "Problem, users, scope, success metrics.", path: "docs/product-requirements.md", href: GH + "docs/product-requirements.md" },
  { icon: "📝", title: "Product Note", desc: "The 1–2 page narrative on the whole flow.", path: "docs/product-note.md", href: GH + "docs/product-note.md" },
  { icon: "📐", title: "Assumptions", desc: "Every clearly-stated assumption.", path: "docs/assumptions.md", href: GH + "docs/assumptions.md" },
  { icon: "🔌", title: "API Integration", desc: "Agoda Demand API, screen → call map.", path: "docs/api-integration.md", href: GH + "docs/api-integration.md" },
  { icon: "🧭", title: "Information Architecture", desc: "Where cancellation lives + nav map.", path: "flows/information-architecture.md", href: GH + "flows/information-architecture.md" },
  { icon: "🔀", title: "Flowchart", desc: "Logic + information flow (Mermaid).", path: "flows/cancellation-flow.mmd", href: GH + "flows/cancellation-flow.mmd" },
  { icon: "🎨", title: "Wireframe Notes", desc: "Per-screen Design / Dev / Business notes.", path: "wireframes/design-notes.md", href: GH + "wireframes/design-notes.md" },
  { icon: "📊", title: "Presentation (PDF)", desc: "The 13-page graded deck.", path: "presentation/final-submission.pdf", href: GH + "presentation/final-submission.pdf" },
];
