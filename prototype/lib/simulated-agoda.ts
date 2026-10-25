// Simulated Agoda Demand API. Shapes follow Agoda's cancellation guide where it documents them.
// Nothing here calls Agoda. Response shapes for Booking Detail are simplified for the demo.
import type { Fixture } from "./fixtures";

// The demo keeps no server memory. The client sends what has already happened.
export type Sim = { previews?: number; confirmed?: "accepted" | "unknown"; waiverSent?: boolean; polls?: number };

type AgodaError = { errorMessage: { id: number; subId: number; message: string } };

export function cancelPreview(f: Fixture, body: { bookingId: number }, sim: Sim): AgodaError | { cancellationSummary: unknown } {
  if (body.bookingId !== f.bookingId) return { errorMessage: { id: 910, subId: 0, message: "Booking not found (simulated)" } };
  if (f.previewFault === "error") return { errorMessage: { id: 500, subId: 0, message: "Temporary error (simulated)" } };
  const refund = f.confirmFault === "mismatch914" && (sim.previews ?? 0) >= 1 ? f.refundAfterMismatch ?? f.refund : f.refund;
  return {
    cancellationSummary: {
      bookingId: f.bookingId,
      reference: f.reference,
      cancellationPolicy: [{ language: "en-us", policyText: f.policyText }],
      paymentRate: [{ currency: f.currency, inclusive: f.paid }],
      refundRate: [{ currency: f.currency, inclusive: refund }],
    },
  };
}

export type ConfirmBody = {
  bookingId: number; reference: number; cancelReason: number; remark?: string;
  refundRate: { currency: string; inclusive: number };
  requestingFeeWaiver?: boolean; feeWaiverReason?: number;
};

// Returns "ok" (HTTP 200, empty body), "no-response" (nothing comes back in time), or an error.
export function cancelConfirm(f: Fixture, b: ConfirmBody): "ok" | "no-response" | AgodaError {
  if (b.bookingId !== f.bookingId) return { errorMessage: { id: 910, subId: 0, message: "Booking not found (simulated)" } };
  if (b.reference !== f.reference) return { errorMessage: { id: 913, subId: 0, message: "Reference not valid (simulated)" } };
  const current = f.confirmFault === "mismatch914" ? f.refundAfterMismatch ?? f.refund : f.refund; // the quote moved after it was shown
  if (!b.refundRate || b.refundRate.currency !== f.currency || b.refundRate.inclusive !== current)
    return { errorMessage: { id: 914, subId: 0, message: "Refund amount does not match the current quote (simulated)" } };
  if (b.requestingFeeWaiver && !f.isFeeWaiverAllowed) return { errorMessage: { id: 924, subId: 0, message: "Fee waiver not allowed (simulated)" } };
  if (f.confirmFault === "timeout") return "no-response";
  return "ok";
}

export function bookingDetail(f: Fixture, sim: Sim) {
  const processed = sim.confirmed === "accepted" || (sim.confirmed === "unknown" && f.timeoutOutcome === "cancelled");
  const out: Record<string, unknown> = {
    bookingId: f.bookingId,
    status: processed ? "BookingCancelledByCustomer" : f.status,
    cancellationPolicy: f.policyText,
    isFeeWaiverAllowed: f.isFeeWaiverAllowed,
  };
  if (sim.waiverSent) {
    const decided = (sim.polls ?? 0) >= 2; // demo shortcut; real waiver decisions can take up to 72 hours
    out.feeWaiverStatus = decided ? f.waiverOutcome ?? "Reject" : "Pending";
  }
  return out;
}
