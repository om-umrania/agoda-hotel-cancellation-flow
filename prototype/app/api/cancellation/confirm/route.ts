// Mock of Agoda Demand API, Cancellation CONFIRM (two-step cancel, step 2).
// Mirrors Agoda: 200 (empty-ish) on success, errorMessage{id,subId,message} on failure,
// PENDING when the refund settles async. Idempotency-Key is honoured (same key => same result).
import { NextResponse } from "next/server";
import { SCENARIO_BY_ID } from "@/lib/scenarios";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const seen = new Map<string, number>(); // idempotency demo (in-memory)

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sid: string = body.scenarioId ?? "free";
  const s = SCENARIO_BY_ID[sid] ?? SCENARIO_BY_ID["free"];
  const idem: string = req.headers.get("Idempotency-Key") ?? body.idempotencyKey ?? "";

  // idempotency: a repeat with the same key does not create a second cancellation
  const replay = idem && seen.has(idem);
  if (idem) seen.set(idem, (seen.get(idem) ?? 0) + 1);

  await wait(s.fault === "timeout" ? 3200 : 1500);

  if (s.fault === "error") {
    return NextResponse.json(
      { errorMessage: { id: 5002, subId: 14, message: "Hotel system temporarily unavailable" } },
      { status: 502 }
    );
  }
  if (s.fault === "auth108") {
    return NextResponse.json(
      { errorMessage: { id: 108, subId: 0, message: "Authorization failed (Site-ID / API-Key / IP)" } },
      { status: 401 }
    );
  }

  const status = s.fault === "timeout" ? "PENDING" : "CANCELLED";
  return NextResponse.json({
    cancellationId: `VOYA-CXL-${s.reference}`,
    status,
    idempotent: replay,
    refundRate: [{ currency: s.currency, inclusive: s.refund }],
    refundEta: s.etaDays,
    _meta: { source: "mock-agoda-demand-api", endpoint: "cancellation/confirm" },
  });
}
