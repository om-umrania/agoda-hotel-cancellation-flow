export type Step =
  | "trips" | "details" | "preview" | "confirm"
  | "processing" | "done" | "error" | "assisted" | "tracker";

// right-panel visual rail (icon led)
export const RAIL: { id: string; icon: string; title: string; action: string }[] = [
  { id: "find", icon: "🧳", title: "Open your booking", action: "Tap the trip you want to cancel" },
  { id: "review", icon: "🧾", title: "See your refund", action: "Check what you get back before you decide" },
  { id: "confirm", icon: "🔒", title: "Confirm it's you", action: "Sign in again, then confirm the cancellation" },
  { id: "process", icon: "⏳", title: "We cancel it", action: "We sort it out with the hotel through Agoda" },
  { id: "done", icon: "✅", title: "Refund on its way", action: "Your reference, the amount, and when it lands" },
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
  preview: { text: "Check the refund, then tap the orange button", pos: "cta" },
  confirm: { text: "Scan to prove it's you, then confirm", pos: "cta" },
  error: { text: "Tap “Try again”, it's safe to retry", pos: "cta" },
  assisted: { text: "Pick how you'd like a hand", pos: "cta" },
};

export const NOTES: Record<Step, { title: string; api: string; design: string; dev: string; biz: string }> = {
  trips: { title: "Finding your trip", api: "GET Retrieve Booking",
    design: "Lead with the soonest trip, and show the free-cancel note on the card itself.",
    dev: "List from our cache, then check against Agoda's Retrieve Booking for the live status and policy.",
    biz: "Showing the deadline early nudges people to cancel while it's still free." },
  details: { title: "The booking details", api: "GET Retrieve Booking",
    design: "Cancel is there, but it isn't the loudest button. The deadline runs as a live countdown.",
    dev: "Work out the deadline from the policy dates. If it's within a day of check-in, send them to assisted.",
    biz: "This is the right moment to offer 'change it instead' and keep the booking." },
  preview: { title: "What you'll get back", api: "POST Cancellation Preview",
    design: "The refund is the big number, and the maths is spelled out. The button says the outcome.",
    dev: "We ask Agoda for the refund and show exactly that. We never work it out on the phone.",
    biz: "Being honest here is the single biggest thing that cuts disputes and chargebacks." },
  confirm: { title: "Making sure", api: "POST Cancellation Confirm",
    design: "One last plain summary and an honest 'this can't be undone'. Sign in again, then a deliberate tap.",
    dev: "Confirm sends the reference from Preview plus our own key, so a double tap can never cancel twice.",
    biz: "A little friction here stops regret cancellations and fraud." },
  processing: { title: "Cancelling it", api: "awaiting Confirm",
    design: "Show real progress, and let people leave. Never an endless spinner.",
    dev: "If it comes back pending, we keep checking the refund status or wait for the webhook.",
    biz: "Handling the wait honestly stops duplicate cancels and 'did it work' messages." },
  done: { title: "All done", api: "refund.completed",
    design: "Lead with when the refund lands, that's what people are anxious about. Offer a receipt.",
    dev: "Built from the Confirm result and refund status. Send the receipt and move the trip to Cancelled.",
    biz: "A clear confirmation saves support contacts, and the rebook nudge wins some bookings back." },
  error: { title: "Something went wrong", api: "errorMessage / 108",
    design: "Plain words and a clear next step. Reassure them the booking is untouched.",
    dev: "Turn Agoda's codes into friendly copy. Say what's worth retrying, and make retries safe.",
    biz: "A good failure moment means fewer chargebacks and fewer calls." },
  assisted: { title: "A hand with it", api: "Fee-Waiver (manual)",
    design: "Don't just fail past the window. Offer a human path with the details filled in.",
    dev: "Self-serve runs up to a day before check-in. After that, pass it on with full context.",
    biz: "This protects goodwill in the hardest moments, like emergencies." },
  tracker: { title: "Where the refund is", api: "refund status",
    design: "Answer 'where's my money' with an honest timeline and where it's heading.",
    dev: "Follow the refund events, and chase it automatically if it runs past the promised time.",
    biz: "A visible refund is the biggest thing that stops people from contacting support." },
};

const GH = "https://github.com/om-umrania/agoda-hotel-cancellation-flow/blob/main/";
export const DOCS: { icon: string; title: string; desc: string; path: string; href: string }[] = [
  { icon: "📄", title: "Product Requirements", desc: "The problem, the users, the scope, and how we'll measure it.", path: "docs/product-requirements.md", href: GH + "docs/product-requirements.md" },
  { icon: "📝", title: "Product Note", desc: "A short, plain read on the whole flow and the thinking.", path: "docs/product-note.md", href: GH + "docs/product-note.md" },
  { icon: "📐", title: "Assumptions", desc: "Every assumption we made, stated out loud.", path: "docs/assumptions.md", href: GH + "docs/assumptions.md" },
  { icon: "🔌", title: "API Integration", desc: "How each screen talks to Agoda's API.", path: "docs/api-integration.md", href: GH + "docs/api-integration.md" },
  { icon: "🧭", title: "Information Architecture", desc: "Where cancellation lives, and how people reach it.", path: "flows/information-architecture.md", href: GH + "flows/information-architecture.md" },
  { icon: "🔀", title: "Flowchart", desc: "The logic and the information, start to finish.", path: "flows/cancellation-flow.mmd", href: GH + "flows/cancellation-flow.mmd" },
  { icon: "🎨", title: "Wireframe Notes", desc: "Design, developer, and business notes for each screen.", path: "wireframes/design-notes.md", href: GH + "wireframes/design-notes.md" },
  { icon: "📊", title: "Presentation (PDF)", desc: "The 13-page deck we hand in.", path: "presentation/final-submission.pdf", href: GH + "presentation/final-submission.pdf" },
];
