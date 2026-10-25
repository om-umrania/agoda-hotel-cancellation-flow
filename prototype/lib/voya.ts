// Voya backend (simulated). The Android UI talks to these routes only, never to Agoda.
import { FIXTURE_BY_ID, Fixture } from "./fixtures";
import { bookingDetail, cancelConfirm, cancelPreview, ConfirmBody, Sim } from "./simulated-agoda";

export type TraceEntry = { call: string; request?: unknown; response: unknown };

export function fixtureOr404(id: string): Fixture | null { return FIXTURE_BY_ID[id] ?? null; }

export function readBooking(f: Fixture, sim: Sim) {
  const detail = bookingDetail(f, sim) as { status: string; isFeeWaiverAllowed: boolean; feeWaiverStatus?: string };
  const trace: TraceEntry[] = [{ call: "Booking Detail (simulated)", request: { bookingId: f.bookingId }, response: detail }];
  const cancelled = detail.status === "BookingCancelledByCustomer" || detail.status === "BookingCancelled";
  // Voya rule [A]: some bookings go to support. This is not an Agoda response.
  const assisted = !cancelled && !!f.assistedReason;
  return { detail, cancelled, assisted, assistedReason: f.assistedReason, trace };
}

export function readPreview(f: Fixture, sim: Sim) {
  const req = { bookingId: f.bookingId };
  const res = cancelPreview(f, req, sim);
  const trace: TraceEntry[] = [{ call: "Cancel Preview (simulated, real one may take up to 120 s)", request: req, response: res }];
  if ("errorMessage" in res) return { ok: false as const, trace };
  const cs = res.cancellationSummary as { reference: number; paymentRate: { inclusive: number }[]; refundRate: { currency: string; inclusive: number }[]; cancellationPolicy: { policyText: string }[] };
  return { ok: true as const, trace, quote: { reference: cs.reference, paid: cs.paymentRate[0].inclusive, refund: cs.refundRate[0].inclusive, currency: cs.refundRate[0].currency, policyText: cs.cancellationPolicy[0].policyText } };
}

export function sendConfirm(f: Fixture, body: ConfirmBody) {
  const res = cancelConfirm(f, body);
  const trace: TraceEntry[] = [{
    call: "Cancel Confirm (simulated)", request: body,
    response: res === "ok" ? "HTTP 200, empty body" : res === "no-response" ? "no response within Voya's demo wait" : res,
  }];
  return { res, trace };
}
