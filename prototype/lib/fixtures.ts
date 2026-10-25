// Invented test fixtures. None of this is Agoda data and none of it is a real reservation.
// Demo date: Sunday 25 October 2026. Check-in Thursday 10 December 2026, check-out Saturday 12 December 2026.

export type Fixture = {
  id: string;
  label: string;
  what: string; // what this fixture demonstrates
  voyaRef: string;
  bookingId: number; // sample Agoda booking ID
  reference: number; // sample Cancel Preview reference
  hotel: string;
  checkIn: string;
  checkOut: string;
  checkInLabel: string;
  checkOutLabel: string;
  currency: "INR";
  paid: number;
  fee: number;
  refund: number;
  policyText: string;
  status: string; // Booking Detail status before any cancellation
  isFeeWaiverAllowed: boolean;
  assistedReason?: string; // Voya rule, not an Agoda response
  previewFault?: "error";
  confirmFault?: "timeout" | "mismatch914";
  timeoutOutcome?: "cancelled" | "active";
  waiverOutcome?: "Accept" | "Reject";
  refundAfterMismatch?: number;
};

const base = {
  hotel: "Sample Hotel, Bengaluru",
  checkIn: "2026-12-10",
  checkOut: "2026-12-12",
  checkInLabel: "Thu 10 Dec 2026",
  checkOutLabel: "Sat 12 Dec 2026",
  currency: "INR" as const,
  status: "BookingConfirmed",
  isFeeWaiverAllowed: false,
};

export const FIXTURES: Fixture[] = [
  { ...base, id: "full", label: "1. Full refund", what: "Before the penalty cutoff. Refund equals paid, assuming price parity.",
    voyaRef: "VY-1042", bookingId: 900001042, reference: 70421, paid: 18240, fee: 0, refund: 18240,
    policyText: "Free cancellation until Mon 7 Dec 2026, 6:00 PM (hotel time)." },
  { ...base, id: "partial", label: "2. Partial refund", what: "After the penalty cutoff. Simulated date is after Mon 7 Dec 2026, 6:00 PM.",
    voyaRef: "VY-1057", bookingId: 900001057, reference: 70422, paid: 18240, fee: 6240, refund: 12000,
    policyText: "Cancelled after Mon 7 Dec 2026, 6:00 PM (hotel time): a fee of ₹6,240 applies." },
  { ...base, id: "zero", label: "3. No refund, waiver allowed", what: "Refund is ₹0 but cancelling is still allowed. Waiver link shown because isFeeWaiverAllowed is true.",
    voyaRef: "VY-1063", bookingId: 900001063, reference: 70423, paid: 18240, fee: 18240, refund: 0, isFeeWaiverAllowed: true, waiverOutcome: "Accept",
    policyText: "Non-refundable rate. The full amount is kept." },
  { ...base, id: "zero-nowaiver", label: "4. No refund, no waiver", what: "Same refund, but isFeeWaiverAllowed is false, so there is no waiver link.",
    voyaRef: "VY-1064", bookingId: 900001064, reference: 70424, paid: 18240, fee: 18240, refund: 0,
    policyText: "Non-refundable rate. The full amount is kept." },
  { ...base, id: "waiver-declined", label: "5. Waiver declined", what: "Waiver requested, pending, then rejected by the hotel.",
    voyaRef: "VY-1065", bookingId: 900001065, reference: 70425, paid: 18240, fee: 18240, refund: 0, isFeeWaiverAllowed: true, waiverOutcome: "Reject",
    policyText: "Non-refundable rate. The full amount is kept." },
  { ...base, id: "already", label: "6. Already cancelled", what: "Booking Detail says cancelled. No Preview or Confirm is sent.",
    voyaRef: "VY-1070", bookingId: 900001070, reference: 0, paid: 18240, fee: 0, refund: 18240, status: "BookingCancelledByCustomer",
    policyText: "Free cancellation until Mon 7 Dec 2026, 6:00 PM (hotel time)." },
  { ...base, id: "assisted", label: "7. Too close to check-in", what: "Voya's own rule sends it to support. The exact API cutoff is unresolved.",
    voyaRef: "VY-1071", bookingId: 900001071, reference: 0, paid: 9800, fee: 0, refund: 9800,
    checkIn: "2026-10-26", checkOut: "2026-10-27", checkInLabel: "Mon 26 Oct 2026", checkOutLabel: "Tue 27 Oct 2026",
    assistedReason: "Check-in is tomorrow. Self-service cutoff is not confirmed with Agoda.",
    policyText: "Free cancellation until Sun 25 Oct 2026, 12:00 PM (hotel time)." },
  { ...base, id: "preview-error", label: "8. Preview fails", what: "Cancel Preview returns an error. No quote is shown.",
    voyaRef: "VY-1072", bookingId: 900001072, reference: 70426, paid: 18240, fee: 0, refund: 18240, previewFault: "error",
    policyText: "Free cancellation until Mon 7 Dec 2026, 6:00 PM (hotel time)." },
  { ...base, id: "timeout", label: "9. Confirm times out", what: "No reply from Confirm. Voya reads Booking Detail before any retry. Here the cancellation went through.",
    voyaRef: "VY-1073", bookingId: 900001073, reference: 70427, paid: 18240, fee: 0, refund: 18240, confirmFault: "timeout", timeoutOutcome: "cancelled",
    policyText: "Free cancellation until Mon 7 Dec 2026, 6:00 PM (hotel time)." },
  { ...base, id: "mismatch", label: "10. Refund mismatch (914)", what: "Confirm is rejected because the refund no longer matches. Voya gets a fresh Preview.",
    voyaRef: "VY-1074", bookingId: 900001074, reference: 70428, paid: 18240, fee: 6240, refund: 12000, confirmFault: "mismatch914", refundAfterMismatch: 10500,
    policyText: "Cancelled after Mon 7 Dec 2026, 6:00 PM (hotel time): a fee applies." },
];

export const FIXTURE_BY_ID: Record<string, Fixture> = Object.fromEntries(FIXTURES.map((f) => [f.id, f]));
export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

// Documented cancelReason values only (see the Agoda cancellation guide). 0 is sent when the traveler skips the question.
export const REASONS: { code: number; label: string }[] = [
  { code: 0, label: "Prefer not to say" },
  { code: 13, label: "Change of plans" },
  { code: 14, label: "Booked by mistake" },
  { code: 15, label: "Found a better price" },
  { code: 25, label: "Other" },
];
// NOTE: the mapping of codes to wording is a Voya design choice [A]. Check each code's meaning in Agoda's table before launch [V].
