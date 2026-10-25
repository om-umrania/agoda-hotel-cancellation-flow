// Scenario + corner-case model for the Voya × Agoda cancellation prototype.
// Refund numbers are illustrative (INR). In production the refund is server-authoritative,
// returned by Agoda's Cancellation Preview call — never computed on the client.

export type Policy = "free" | "partial" | "multitier" | "nonref" | "payathotel";
export type Timing = "free" | "penalty" | "within24h" | "postcheckin";
export type Fault =
  | "ok"
  | "error"      // Agoda errorMessage (terminal-ish, retriable)
  | "auth108"    // credentials / auth failure
  | "timeout"    // no response in ~120s -> PENDING -> reconcile
  | "stale"      // preview quote expired -> must refresh
  | "offline"    // no network
  | "refundDelay"; // cancelled OK but refund past SLA

export type Scenario = {
  id: string;
  label: string;
  emoji: string;
  category: string;
  hotel: string;
  city: string;
  dates: string;
  nights: number;
  guests: number;
  policy: Policy;
  timing: Timing;
  fault: Fault;
  paid: number;
  fee: number;
  refund: number;
  currency: string;
  deadline: string;        // human label
  countdown: string;       // e.g. "17h 42m"
  ringPct: number;         // deadline ring fill
  etaDays: string;
  reference: number;       // Agoda Preview reference
  bookingId: number;
  handling: string;        // what the flow does (shown in notes)
};

const INR = "INR";

export const SCENARIOS: Scenario[] = [
  {
    id: "free", label: "Free cancellation", emoji: "✅", category: "Policy & refund",
    hotel: "The Leela Palace", city: "Bengaluru", dates: "26–28 Oct", nights: 2, guests: 2,
    policy: "free", timing: "free", fault: "ok",
    paid: 18240, fee: 0, refund: 18240, currency: INR,
    deadline: "26 Oct, 2:00 PM (hotel time)", countdown: "17h 42m", ringPct: 62, etaDays: "5–7 business days",
    reference: 70421, bookingId: 889001234,
    handling: "Inside the free window → full refund. CTA states the exact amount back.",
  },
  {
    id: "partial", label: "Partial refund (penalty)", emoji: "➗", category: "Policy & refund",
    hotel: "Taj Santacruz", city: "Mumbai", dates: "12–14 Nov", nights: 2, guests: 2,
    policy: "partial", timing: "penalty", fault: "ok",
    paid: 15960, fee: 4788, refund: 11172, currency: INR,
    deadline: "Free window ended 10 Nov", countdown: "—", ringPct: 100, etaDays: "5–7 business days",
    reference: 70422, bookingId: 889001235,
    handling: "A penalty tier applies. Paid − fee is shown explicitly; CTA names the net refund.",
  },
  {
    id: "multitier", label: "Multi-tier policy", emoji: "📊", category: "Policy & refund",
    hotel: "Novotel", city: "Goa", dates: "02–05 Dec", nights: 3, guests: 2,
    policy: "multitier", timing: "penalty", fault: "ok",
    paid: 21000, fee: 10500, refund: 10500, currency: INR,
    deadline: "Now in the 50% tier (100% after 30 Nov)", countdown: "—", ringPct: 100, etaDays: "5–7 business days",
    reference: 70423, bookingId: 889001236,
    handling: "Several penalty tiers (free → 50% → 100%). We show which tier applies now and the next cliff.",
  },
  {
    id: "nonref", label: "Non-refundable", emoji: "⛔", category: "Policy & refund",
    hotel: "Ibis", city: "Delhi", dates: "20–21 Nov", nights: 1, guests: 1,
    policy: "nonref", timing: "penalty", fault: "ok",
    paid: 6800, fee: 6800, refund: 0, currency: INR,
    deadline: "Non-refundable rate", countdown: "—", ringPct: 100, etaDays: "—",
    reference: 70424, bookingId: 889001237,
    handling: "₹0 refund. Calm, honest warning (not alarm-red). We offer travel credit as an alternative.",
  },
  {
    id: "payathotel", label: "Pay at hotel", emoji: "🏨", category: "Policy & refund",
    hotel: "Treebo Trend", city: "Jaipur", dates: "15–16 Nov", nights: 1, guests: 2,
    policy: "payathotel", timing: "free", fault: "ok",
    paid: 0, fee: 0, refund: 0, currency: INR,
    deadline: "Free cancellation — nothing paid yet", countdown: "22h 05m", ringPct: 48, etaDays: "—",
    reference: 70425, bookingId: 889001238,
    handling: "Nothing was charged, so there's nothing to refund — we just release the reservation.",
  },
  {
    id: "within24h", label: "Within 24h of check-in", emoji: "⏱️", category: "Timing",
    hotel: "Hyatt Regency", city: "Chennai", dates: "Tomorrow", nights: 2, guests: 2,
    policy: "partial", timing: "within24h", fault: "ok",
    paid: 17400, fee: 17400, refund: 0, currency: INR,
    deadline: "Self-serve window closed (within 24h)", countdown: "—", ringPct: 100, etaDays: "—",
    reference: 70426, bookingId: 889001239,
    handling: "Agoda allows cancel up to 1 day before check-in. We route to assisted / fee-waiver, not a hard fail.",
  },
  {
    id: "postcheckin", label: "After check-in (no-show)", emoji: "🚪", category: "Timing",
    hotel: "Radisson Blu", city: "Pune", dates: "In progress", nights: 3, guests: 2,
    policy: "nonref", timing: "postcheckin", fault: "ok",
    paid: 24300, fee: 24300, refund: 0, currency: INR,
    deadline: "Stay has started", countdown: "—", ringPct: 100, etaDays: "—",
    reference: 70427, bookingId: 889001240,
    handling: "On/after check-in needs manual handling. We offer assisted cancellation / early-checkout support.",
  },
  {
    id: "error", label: "Agoda returns an error", emoji: "⚠️", category: "API & system",
    hotel: "The Leela Palace", city: "Bengaluru", dates: "26–28 Oct", nights: 2, guests: 2,
    policy: "free", timing: "free", fault: "error",
    paid: 18240, fee: 0, refund: 18240, currency: INR,
    deadline: "26 Oct, 2:00 PM (hotel time)", countdown: "17h 42m", ringPct: 62, etaDays: "5–7 business days",
    reference: 70421, bookingId: 889001234,
    handling: "Confirm fails with errorMessage{id,subId,message}. Booking is unchanged; we offer retry + support.",
  },
  {
    id: "auth108", label: "Auth failure (error 108)", emoji: "🔑", category: "API & system",
    hotel: "Taj Santacruz", city: "Mumbai", dates: "12–14 Nov", nights: 2, guests: 2,
    policy: "partial", timing: "penalty", fault: "auth108",
    paid: 15960, fee: 4788, refund: 11172, currency: INR,
    deadline: "Free window ended 10 Nov", countdown: "—", ringPct: 100, etaDays: "5–7 business days",
    reference: 70422, bookingId: 889001235,
    handling: "Agoda error 108 (credentials/IP). Never shown raw — mapped to a safe 'try again shortly' message; alert ops.",
  },
  {
    id: "timeout", label: "Timeout → PENDING", emoji: "⌛", category: "API & system",
    hotel: "Novotel", city: "Goa", dates: "02–05 Dec", nights: 3, guests: 2,
    policy: "free", timing: "free", fault: "timeout",
    paid: 19500, fee: 0, refund: 19500, currency: INR,
    deadline: "27 Nov, 6:00 PM (hotel time)", countdown: "3d 04h", ringPct: 30, etaDays: "5–7 business days",
    reference: 70428, bookingId: 889001241,
    handling: "No response within ~120s. We DON'T spin forever — we show PENDING and reconcile via status/webhook.",
  },
  {
    id: "stale", label: "Quote expired (refresh)", emoji: "♻️", category: "API & system",
    hotel: "Ibis", city: "Delhi", dates: "20–22 Nov", nights: 2, guests: 2,
    policy: "partial", timing: "penalty", fault: "stale",
    paid: 9400, fee: 2820, refund: 6580, currency: INR,
    deadline: "Quote valid 10 min", countdown: "—", ringPct: 100, etaDays: "5–7 business days",
    reference: 70429, bookingId: 889001242,
    handling: "The Preview reference expired before Confirm. We re-fetch the quote and show any change before proceeding.",
  },
  {
    id: "offline", label: "Offline", emoji: "📴", category: "Network & device",
    hotel: "Hyatt Regency", city: "Chennai", dates: "05–07 Dec", nights: 2, guests: 2,
    policy: "free", timing: "free", fault: "offline",
    paid: 16800, fee: 0, refund: 16800, currency: INR,
    deadline: "04 Dec, 12:00 PM (hotel time)", countdown: "9d", ringPct: 18, etaDays: "5–7 business days",
    reference: 70430, bookingId: 889001243,
    handling: "No connection. We block Confirm (never queue a destructive action) and show a clear offline state.",
  },
];

export const SCENARIO_BY_ID: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s])
);

// Agoda cancelReason codes (subset of 0–44) surfaced as human reasons.
export const REASONS: { code: number; label: string }[] = [
  { code: 1, label: "Change of plans" },
  { code: 7, label: "Found a better price" },
  { code: 12, label: "Trip cancelled" },
  { code: 19, label: "Booked by mistake" },
  { code: 23, label: "Hotel / room issue" },
  { code: 31, label: "Personal / medical" },
  { code: 44, label: "Natural disaster" },
  { code: 0, label: "Prefer not to say" },
];

// ---- 55-item corner-case catalog --------------------------------------------
export type Corner = {
  id: string;
  title: string;
  trigger: string;
  handling: string;
  demo?: string; // scenario id that demonstrates it live
};
export type CornerGroup = { category: string; emoji: string; items: Corner[] };

export const CORNER_CASES: CornerGroup[] = [
  {
    category: "Policy & refund", emoji: "💸", items: [
      { id: "c1", title: "Free cancellation", trigger: "Inside the free window", handling: "Full refund; CTA states amount back.", demo: "free" },
      { id: "c2", title: "Partial refund", trigger: "Penalty tier active", handling: "Show Paid − Fee = Refund; CTA names net.", demo: "partial" },
      { id: "c3", title: "Multi-tier policy", trigger: "free → 50% → 100% tiers", handling: "Show current tier + next cliff date.", demo: "multitier" },
      { id: "c4", title: "Non-refundable", trigger: "Non-refundable rate", handling: "₹0, calm warning, offer travel credit.", demo: "nonref" },
      { id: "c5", title: "Pay at hotel", trigger: "Nothing charged yet", handling: "Nothing to refund; just release the room.", demo: "payathotel" },
      { id: "c6", title: "Taxes/fees split", trigger: "Some fees non-refundable", handling: "Itemise refundable vs non-refundable." },
      { id: "c7", title: "Promo / discount applied", trigger: "Coupon on booking", handling: "Refund net paid, not gross; show both." },
      { id: "c8", title: "Loyalty points used", trigger: "Points part-payment", handling: "Reverse points + cash proportionally." },
      { id: "c9", title: "Currency ≠ card currency", trigger: "FX at booking", handling: "Refund in charge currency; note FX variance." },
      { id: "c10", title: "Price changed since booking", trigger: "Rate moved", handling: "Refund is what was paid, not current price." },
    ],
  },
  {
    category: "Timing & window", emoji: "⏱️", items: [
      { id: "c11", title: "Within free window", trigger: "now < deadline", handling: "Live countdown ring to the deadline.", demo: "free" },
      { id: "c12", title: "Just past free window", trigger: "now > deadline", handling: "Penalty kicks in; explain the change.", demo: "partial" },
      { id: "c13", title: "Within 24h of check-in", trigger: "now ≥ check-in − 1d", handling: "Route to assisted / fee-waiver.", demo: "within24h" },
      { id: "c14", title: "After check-in", trigger: "stay started", handling: "Manual / early-checkout path.", demo: "postcheckin" },
      { id: "c15", title: "Deadline boundary", trigger: "now == deadline", handling: "Server decides; client shows provisional." },
      { id: "c16", title: "Hotel vs device timezone", trigger: "TZ mismatch", handling: "Always hotel local time; label it." },
      { id: "c17", title: "DST change near deadline", trigger: "clock shift", handling: "Compute against hotel TZ offset, not device." },
    ],
  },
  {
    category: "Booking state", emoji: "🧾", items: [
      { id: "c18", title: "Already cancelled", trigger: "status = CANCELLED", handling: "Show cancellation + refund status; no action." },
      { id: "c19", title: "Cancellation already pending", trigger: "in progress", handling: "Show PENDING; block duplicate submit.", demo: "timeout" },
      { id: "c20", title: "Recently modified", trigger: "dates/room changed", handling: "Re-fetch policy; it may have changed." },
      { id: "c21", title: "Booking not found", trigger: "delinked / wrong id", handling: "Graceful 'can't find it' + support." },
      { id: "c22", title: "Multi-room booking", trigger: "N rooms", handling: "v1: cancel all; per-room is future scope." },
      { id: "c23", title: "Multi-night partial", trigger: "shorten stay", handling: "Out of v1 scope; offer modify (future)." },
      { id: "c24", title: "Group / corporate", trigger: "group rate", handling: "Blocked self-serve; route to desk." },
      { id: "c25", title: "Shared / booked by other", trigger: "not the payer", handling: "Permission check; only owner can cancel." },
      { id: "c26", title: "Deep link to cancelled", trigger: "email link, already done", handling: "Land on status, not the cancel flow." },
    ],
  },
  {
    category: "Auth & security", emoji: "🔐", items: [
      { id: "c27", title: "Re-auth fails", trigger: "wrong biometric", handling: "Stay on confirm; retry; no cancel sent." },
      { id: "c28", title: "Biometric unavailable", trigger: "no sensor / not enrolled", handling: "Fallback to device PIN / password." },
      { id: "c29", title: "Session expired mid-flow", trigger: "token timeout", handling: "Re-login, then resume at the same step." },
      { id: "c30", title: "Account locked", trigger: "security hold", handling: "Block + explain; route to support." },
      { id: "c31", title: "Agoda error 108", trigger: "creds/IP whitelist", handling: "Safe message; alert ops; never show raw.", demo: "auth108" },
      { id: "c32", title: "Replay / tampered request", trigger: "mutated payload", handling: "reference + idempotency key reject it." },
    ],
  },
  {
    category: "API & system", emoji: "🧩", items: [
      { id: "c33", title: "Preview timeout", trigger: "no quote", handling: "Retry; don't let user proceed blind." },
      { id: "c34", title: "Confirm timeout → PENDING", trigger: ">120s", handling: "Show PENDING; reconcile via status/webhook.", demo: "timeout" },
      { id: "c35", title: "Generic Agoda error", trigger: "errorMessage", handling: "Map to friendly copy; retry + support.", demo: "error" },
      { id: "c36", title: "Rate limited (429)", trigger: "too many calls", handling: "Back off; 'try again in a moment'." },
      { id: "c37", title: "Double-tap confirm", trigger: "two taps", handling: "Idempotency key → single cancel only." },
      { id: "c38", title: "Retry after failure", trigger: "user retries", handling: "Reuse same reference — safe, no double refund." },
      { id: "c39", title: "Quote expired", trigger: "stale reference", handling: "Refresh quote; show any change.", demo: "stale" },
      { id: "c40", title: "Partial success", trigger: "cancelled, refund failed", handling: "Confirm cancel; track refund separately; auto-retry." },
      { id: "c41", title: "Webhook never arrives", trigger: "refund stuck", handling: "Poll fallback + manual reconcile after SLA." },
      { id: "c42", title: "Unknown Confirm result", trigger: "network drop post-send", handling: "Reconcile before resend; never blind-retry a cancel." },
    ],
  },
  {
    category: "Network & device", emoji: "📶", items: [
      { id: "c43", title: "Offline at preview", trigger: "no network", handling: "Can't quote; clear offline state + retry.", demo: "offline" },
      { id: "c44", title: "Offline at confirm", trigger: "drops at confirm", handling: "Block destructive action; never queue it.", demo: "offline" },
      { id: "c45", title: "Flaky / slow network", trigger: "high latency", handling: "Skeletons; generous timeouts; keep state." },
      { id: "c46", title: "App killed mid-processing", trigger: "OS kills app", handling: "On relaunch, resume + show real status." },
      { id: "c47", title: "Background + notify", trigger: "user leaves", handling: "Finish server-side; push on completion." },
    ],
  },
  {
    category: "Refund tracking", emoji: "📈", items: [
      { id: "c48", title: "Refund initiated", trigger: "t0", handling: "Timeline step 1; show reference." },
      { id: "c49", title: "Refund processing", trigger: "in rails", handling: "Honest 'with your bank' status." },
      { id: "c50", title: "Refund completed", trigger: "settled", handling: "Confirm + receipt; move to Cancelled." },
      { id: "c51", title: "Refund past SLA", trigger: "> promised days", handling: "Proactive escalate + support offer." },
      { id: "c52", title: "Refund to expired card", trigger: "card changed", handling: "Route to alt method / support." },
    ],
  },
  {
    category: "Content & accessibility", emoji: "♿", items: [
      { id: "c53", title: "Very long hotel name", trigger: "overflow", handling: "Truncate with ellipsis; full on tap." },
      { id: "c54", title: "RTL / localization", trigger: "ar/he locale", handling: "Mirror layout; localise currency/dates." },
      { id: "c55", title: "Screen reader + large text", trigger: "a11y settings", handling: "Labels, focus order, reduced motion honored." },
    ],
  },
];

export const CORNER_COUNT = CORNER_CASES.reduce((n, g) => n + g.items.length, 0);
