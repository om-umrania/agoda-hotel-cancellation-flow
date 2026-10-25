// Client helpers that actually fetch the (mock) Agoda Demand API over the network.
export type PreviewResult = {
  reference: number;
  paid: number;
  refund: number;
  currency: string;
  policyText: string;
};
export type ConfirmResult = {
  ok: boolean;
  status?: "CANCELLED" | "PENDING";
  cancellationId?: string;
  refund?: number;
  currency?: string;
  idempotent?: boolean;
  error?: { id: number; subId: number; message: string };
};

export async function previewCancellation(scenarioId: string, bookingId: number): Promise<PreviewResult> {
  const res = await fetch("/api/cancellation/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioId, bookingId }),
  });
  const data = await res.json();
  const cs = data.cancellationSummary;
  return {
    reference: cs.reference,
    paid: cs.paymentRate?.[0]?.inclusive ?? 0,
    refund: cs.refundRate?.[0]?.inclusive ?? 0,
    currency: cs.refundRate?.[0]?.currency ?? "INR",
    policyText: cs.cancellationPolicy?.[0]?.policyText ?? "",
  };
}

export async function confirmCancellation(
  scenarioId: string,
  bookingId: number,
  reference: number,
  cancelReason: number,
  idempotencyKey: string
): Promise<ConfirmResult> {
  const res = await fetch("/api/cancellation/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ scenarioId, bookingId, reference, cancelReason }),
  });
  const data = await res.json();
  if (!res.ok || data.errorMessage) {
    return { ok: false, error: data.errorMessage ?? { id: res.status, subId: 0, message: "Request failed" } };
  }
  return {
    ok: true,
    status: data.status,
    cancellationId: data.cancellationId,
    refund: data.refundRate?.[0]?.inclusive,
    currency: data.refundRate?.[0]?.currency,
    idempotent: data.idempotent,
  };
}
