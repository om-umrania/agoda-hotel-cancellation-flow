// Situations that drive the cancellation flow, plus the corner-case catalogue.
// Refund numbers here are examples (INR). In a real build the refund always comes
// back from Agoda's Cancellation Preview call, never worked out on the phone.

export type Policy = "free" | "partial" | "multitier" | "nonref" | "payathotel";
export type Timing = "free" | "penalty" | "within24h" | "postcheckin";
export type Fault =
  | "ok"
  | "error"      // Agoda sends back an error
  | "auth108"    // credentials / auth problem behind the scenes
  | "timeout"    // no answer in time, so we show it as pending
  | "stale"      // the earlier quote has expired
  | "offline"    // no internet
  | "refundDelay"; // cancelled fine, but the refund is running late

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
  deadline: string;
  countdown: string;
  ringPct: number;
  etaDays: string;
  reference: number;
  bookingId: number;
  handling: string;
};

const INR = "INR";

export const SCENARIOS: Scenario[] = [
  {
    id: "free", label: "Free cancellation", emoji: "✅", category: "Policy & refund",
    hotel: "The Leela Palace", city: "Bengaluru", dates: "26–28 Oct", nights: 2, guests: 2,
    policy: "free", timing: "free", fault: "ok",
    paid: 18240, fee: 0, refund: 18240, currency: INR,
    deadline: "Free until 26 Oct, 2:00 PM (hotel time)", countdown: "17h 42m", ringPct: 62, etaDays: "5 to 7 working days",
    reference: 70421, bookingId: 889001234,
    handling: "You are still inside the free window, so you get all of your money back. The button even tells you how much.",
  },
  {
    id: "partial", label: "Partial refund (penalty)", emoji: "➗", category: "Policy & refund",
    hotel: "Taj Santacruz", city: "Mumbai", dates: "12–14 Nov", nights: 2, guests: 2,
    policy: "partial", timing: "penalty", fault: "ok",
    paid: 15960, fee: 4788, refund: 11172, currency: INR,
    deadline: "The free window ended on 10 Nov", countdown: "", ringPct: 100, etaDays: "5 to 7 working days",
    reference: 70422, bookingId: 889001235,
    handling: "A cancellation fee applies now. We show what you paid, the fee, and what is left, so nothing is a surprise.",
  },
  {
    id: "multitier", label: "Multi-tier policy", emoji: "📊", category: "Policy & refund",
    hotel: "Novotel", city: "Goa", dates: "02–05 Dec", nights: 3, guests: 2,
    policy: "multitier", timing: "penalty", fault: "ok",
    paid: 21000, fee: 10500, refund: 10500, currency: INR,
    deadline: "You are in the 50% stage (nothing back after 30 Nov)", countdown: "", ringPct: 100, etaDays: "5 to 7 working days",
    reference: 70423, bookingId: 889001236,
    handling: "The policy has a few stages: free, then half back, then nothing. We tell you which stage you are in and when it changes.",
  },
  {
    id: "nonref", label: "Non-refundable", emoji: "⛔", category: "Policy & refund",
    hotel: "Ibis", city: "Delhi", dates: "20–21 Nov", nights: 1, guests: 1,
    policy: "nonref", timing: "penalty", fault: "ok",
    paid: 6800, fee: 6800, refund: 0, currency: INR,
    deadline: "This was a non-refundable rate", countdown: "", ringPct: 100, etaDays: "",
    reference: 70424, bookingId: 889001237,
    handling: "This rate cannot be refunded, so you would get nothing back. We say that plainly, and offer travel credit instead.",
  },
  {
    id: "payathotel", label: "Pay at hotel", emoji: "🏨", category: "Policy & refund",
    hotel: "Treebo Trend", city: "Jaipur", dates: "15–16 Nov", nights: 1, guests: 2,
    policy: "payathotel", timing: "free", fault: "ok",
    paid: 0, fee: 0, refund: 0, currency: INR,
    deadline: "Free cancellation, nothing paid yet", countdown: "22h 05m", ringPct: 48, etaDays: "",
    reference: 70425, bookingId: 889001238,
    handling: "You had not paid yet, so there is nothing to refund. We simply let the hotel know you are not coming.",
  },
  {
    id: "within24h", label: "Within 24h of check-in", emoji: "⏱️", category: "Timing",
    hotel: "Hyatt Regency", city: "Chennai", dates: "Tomorrow", nights: 2, guests: 2,
    policy: "partial", timing: "within24h", fault: "ok",
    paid: 17400, fee: 17400, refund: 0, currency: INR,
    deadline: "Self-serve cancellation has closed (within 24h)", countdown: "", ringPct: 100, etaDays: "",
    reference: 70426, bookingId: 889001239,
    handling: "Agoda lets people cancel on their own up to a day before check-in. After that we help by hand instead of just failing.",
  },
  {
    id: "postcheckin", label: "After check-in (no-show)", emoji: "🚪", category: "Timing",
    hotel: "Radisson Blu", city: "Pune", dates: "In progress", nights: 3, guests: 2,
    policy: "nonref", timing: "postcheckin", fault: "ok",
    paid: 24300, fee: 24300, refund: 0, currency: INR,
    deadline: "The stay has already started", countdown: "", ringPct: 100, etaDays: "",
    reference: 70427, bookingId: 889001240,
    handling: "Once the stay has started it needs a person to help. We offer assisted cancellation or an early checkout.",
  },
  {
    id: "error", label: "Agoda returns an error", emoji: "⚠️", category: "API & system",
    hotel: "The Leela Palace", city: "Bengaluru", dates: "26–28 Oct", nights: 2, guests: 2,
    policy: "free", timing: "free", fault: "error",
    paid: 18240, fee: 0, refund: 18240, currency: INR,
    deadline: "Free until 26 Oct, 2:00 PM (hotel time)", countdown: "17h 42m", ringPct: 62, etaDays: "5 to 7 working days",
    reference: 70421, bookingId: 889001234,
    handling: "The cancel request failed on Agoda's side. Your booking is untouched, and you can try again or talk to us.",
  },
  {
    id: "auth108", label: "Auth failure (error 108)", emoji: "🔑", category: "API & system",
    hotel: "Taj Santacruz", city: "Mumbai", dates: "12–14 Nov", nights: 2, guests: 2,
    policy: "partial", timing: "penalty", fault: "auth108",
    paid: 15960, fee: 4788, refund: 11172, currency: INR,
    deadline: "The free window ended on 10 Nov", countdown: "", ringPct: 100, etaDays: "5 to 7 working days",
    reference: 70422, bookingId: 889001235,
    handling: "A behind-the-scenes sign-in problem (Agoda error 108). The traveller just sees a friendly 'please try again', and our team gets a ping.",
  },
  {
    id: "timeout", label: "Timeout, then pending", emoji: "⌛", category: "API & system",
    hotel: "Novotel", city: "Goa", dates: "02–05 Dec", nights: 3, guests: 2,
    policy: "free", timing: "free", fault: "timeout",
    paid: 19500, fee: 0, refund: 19500, currency: INR,
    deadline: "Free until 27 Nov, 6:00 PM (hotel time)", countdown: "3d 04h", ringPct: 30, etaDays: "5 to 7 working days",
    reference: 70428, bookingId: 889001241,
    handling: "Agoda did not answer within about two minutes. We do not spin forever, we mark it pending and keep checking in the background.",
  },
  {
    id: "stale", label: "Quote expired (refresh)", emoji: "♻️", category: "API & system",
    hotel: "Ibis", city: "Delhi", dates: "20–22 Nov", nights: 2, guests: 2,
    policy: "partial", timing: "penalty", fault: "stale",
    paid: 9400, fee: 2820, refund: 6580, currency: INR,
    deadline: "This quote is only valid for 10 minutes", countdown: "", ringPct: 100, etaDays: "5 to 7 working days",
    reference: 70429, bookingId: 889001242,
    handling: "The quote we fetched earlier has expired. We get a fresh one and show you any change before you go ahead.",
  },
  {
    id: "offline", label: "Offline", emoji: "📴", category: "Network & device",
    hotel: "Hyatt Regency", city: "Chennai", dates: "05–07 Dec", nights: 2, guests: 2,
    policy: "free", timing: "free", fault: "offline",
    paid: 16800, fee: 0, refund: 16800, currency: INR,
    deadline: "Free until 04 Dec, 12:00 PM (hotel time)", countdown: "9d", ringPct: 18, etaDays: "5 to 7 working days",
    reference: 70430, bookingId: 889001243,
    handling: "There is no internet. We will not fire off a cancellation in the dark, we just ask you to reconnect first.",
  },
];

export const SCENARIO_BY_ID: Record<string, Scenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s])
);

// Agoda cancelReason codes (a few of the 0 to 44) shown as plain reasons.
export const REASONS: { code: number; label: string }[] = [
  { code: 1, label: "My plans changed" },
  { code: 7, label: "I found a better price" },
  { code: 12, label: "My trip got cancelled" },
  { code: 19, label: "I booked this by mistake" },
  { code: 23, label: "Something's wrong with the room" },
  { code: 31, label: "A personal or medical reason" },
  { code: 44, label: "A natural disaster" },
  { code: 0, label: "I'd rather not say" },
];

// ---- corner-case catalogue ---------------------------------------------------
export type Corner = {
  id: string;
  title: string;
  trigger: string;
  handling: string;
  demo?: string;
};
export type CornerGroup = { category: string; emoji: string; items: Corner[] };

export const CORNER_CASES: CornerGroup[] = [
  {
    category: "Policy & refund", emoji: "💸", items: [
      { id: "c1", title: "Free cancellation", trigger: "still inside the free window", handling: "Full refund, and the button says the exact amount.", demo: "free" },
      { id: "c2", title: "Partial refund", trigger: "a penalty applies now", handling: "Show paid, fee and what is left, clearly.", demo: "partial" },
      { id: "c3", title: "Multi-tier policy", trigger: "free, then 50%, then nothing", handling: "Show the current stage and when it changes.", demo: "multitier" },
      { id: "c4", title: "Non-refundable", trigger: "a non-refundable rate", handling: "Say it plainly, offer travel credit instead.", demo: "nonref" },
      { id: "c5", title: "Pay at hotel", trigger: "nothing charged yet", handling: "Nothing to refund, just release the room.", demo: "payathotel" },
      { id: "c6", title: "Taxes and fees split", trigger: "some fees are non-refundable", handling: "List what comes back and what does not." },
      { id: "c7", title: "Promo or discount used", trigger: "a coupon on the booking", handling: "Refund what was actually paid, not the full price." },
      { id: "c8", title: "Loyalty points used", trigger: "points paid part of it", handling: "Return points and cash in the right proportion." },
      { id: "c9", title: "Paid in another currency", trigger: "foreign exchange at booking", handling: "Refund in the currency charged, and note any FX." },
      { id: "c10", title: "Price moved since booking", trigger: "the rate changed", handling: "Refund is what was paid, not today's price." },
    ],
  },
  {
    category: "Timing & window", emoji: "⏱️", items: [
      { id: "c11", title: "Inside the free window", trigger: "before the deadline", handling: "A live countdown ring to the cut-off.", demo: "free" },
      { id: "c12", title: "Just past the free window", trigger: "after the deadline", handling: "A fee starts, and we explain the change.", demo: "partial" },
      { id: "c13", title: "Within 24h of check-in", trigger: "close to arrival", handling: "Hand it to assisted or a fee waiver.", demo: "within24h" },
      { id: "c14", title: "After check-in", trigger: "the stay has started", handling: "A manual or early-checkout path.", demo: "postcheckin" },
      { id: "c15", title: "Right on the deadline", trigger: "the exact cut-off minute", handling: "Agoda decides, we show it as provisional." },
      { id: "c16", title: "Hotel vs phone timezone", trigger: "times do not match", handling: "Always hotel local time, and we label it." },
      { id: "c17", title: "Clocks change near deadline", trigger: "daylight saving shift", handling: "Count against the hotel's timezone, not the phone's." },
    ],
  },
  {
    category: "Booking state", emoji: "🧾", items: [
      { id: "c18", title: "Already cancelled", trigger: "status is cancelled", handling: "Show the cancellation and refund, no action." },
      { id: "c19", title: "Cancellation already running", trigger: "one is in progress", handling: "Show it as pending, block a second one.", demo: "timeout" },
      { id: "c20", title: "Recently changed", trigger: "dates or room edited", handling: "Fetch the policy again, it may have moved." },
      { id: "c21", title: "Booking not found", trigger: "wrong or missing id", handling: "A gentle 'we can't find it' plus support." },
      { id: "c22", title: "More than one room", trigger: "a multi-room booking", handling: "v1 cancels all; per-room comes later." },
      { id: "c23", title: "Shorten the stay", trigger: "drop a night", handling: "Out of scope for v1, offer modify later." },
      { id: "c24", title: "Group or corporate", trigger: "a group rate", handling: "Not self-serve, send them to the desk." },
      { id: "c25", title: "Booked by someone else", trigger: "not the person who paid", handling: "Only the owner can cancel, so we check." },
      { id: "c26", title: "Email link, already done", trigger: "a link to a cancelled trip", handling: "Land on the status, not the cancel flow." },
    ],
  },
  {
    category: "Sign-in & safety", emoji: "🔐", items: [
      { id: "c27", title: "Re-auth fails", trigger: "wrong face or finger", handling: "Stay put, let them retry, send nothing." },
      { id: "c28", title: "No biometric set up", trigger: "no Face ID or fingerprint", handling: "Fall back to the phone passcode." },
      { id: "c29", title: "Signed out midway", trigger: "the session timed out", handling: "Sign in again, then pick up where they were." },
      { id: "c30", title: "Account on hold", trigger: "a security lock", handling: "Stop and explain, point them to support." },
      { id: "c31", title: "Agoda error 108", trigger: "a credentials or IP issue", handling: "Friendly message to the user, a ping to us.", demo: "auth108" },
      { id: "c32", title: "Tampered request", trigger: "the payload was changed", handling: "The reference and key simply reject it." },
    ],
  },
  {
    category: "API & system", emoji: "🧩", items: [
      { id: "c33", title: "Preview times out", trigger: "no quote comes back", handling: "Let them retry, never guess the number." },
      { id: "c34", title: "Confirm times out", trigger: "over two minutes", handling: "Show pending, keep checking in the background.", demo: "timeout" },
      { id: "c35", title: "General Agoda error", trigger: "an error comes back", handling: "Turn it into friendly words, offer retry.", demo: "error" },
      { id: "c36", title: "Too many requests", trigger: "we get rate-limited", handling: "Back off and say 'try again in a moment'." },
      { id: "c37", title: "Double tap on confirm", trigger: "two quick taps", handling: "The idempotency key keeps it to one cancel." },
      { id: "c38", title: "Retry after a failure", trigger: "they try again", handling: "Reuse the same reference, so no double refund." },
      { id: "c39", title: "Quote expired", trigger: "the reference went stale", handling: "Refresh it and show any change first.", demo: "stale" },
      { id: "c40", title: "Cancelled but refund failed", trigger: "half worked", handling: "Confirm the cancel, chase the refund on its own." },
      { id: "c41", title: "Webhook never arrives", trigger: "refund seems stuck", handling: "Poll as a backup and chase it after the SLA." },
      { id: "c42", title: "Result unknown", trigger: "the network dropped after sending", handling: "Check first, never blindly resend a cancel." },
    ],
  },
  {
    category: "Network & device", emoji: "📶", items: [
      { id: "c43", title: "Offline at preview", trigger: "no internet", handling: "We can't quote, so we ask to reconnect.", demo: "offline" },
      { id: "c44", title: "Offline at confirm", trigger: "drops at the last step", handling: "Block it, never queue a cancel in the dark.", demo: "offline" },
      { id: "c45", title: "Slow or flaky network", trigger: "high latency", handling: "Skeletons, patient timeouts, keep the state." },
      { id: "c46", title: "App closed mid-way", trigger: "the OS kills the app", handling: "On reopen, pick up and show the real status." },
      { id: "c47", title: "Leave and get notified", trigger: "they close the screen", handling: "Finish on the server, send a notification." },
    ],
  },
  {
    category: "Refund tracking", emoji: "📈", items: [
      { id: "c48", title: "Refund started", trigger: "we send it", handling: "Step one of the timeline, with the reference." },
      { id: "c49", title: "Refund processing", trigger: "it's with the bank", handling: "An honest 'with your bank' status." },
      { id: "c50", title: "Refund done", trigger: "money is back", handling: "Confirm it and move the trip to Cancelled." },
      { id: "c51", title: "Refund running late", trigger: "past the promised days", handling: "Reach out first and offer help." },
      { id: "c52", title: "Card no longer valid", trigger: "the card changed", handling: "Offer another method or support." },
    ],
  },
  {
    category: "Words & access", emoji: "♿", items: [
      { id: "c53", title: "Very long hotel name", trigger: "it overflows", handling: "Shorten with a tail, show the full name on tap." },
      { id: "c54", title: "Other languages", trigger: "Arabic or Hebrew", handling: "Flip the layout, translate dates and money." },
      { id: "c55", title: "Screen reader and big text", trigger: "accessibility is on", handling: "Clear labels, sensible order, less motion." },
    ],
  },
];

export const CORNER_COUNT = CORNER_CASES.reduce((n, g) => n + g.items.length, 0);
