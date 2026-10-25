// Mock of Agoda Demand API — Cancellation PREVIEW (two-step cancel, step 1).
// Real endpoint needs partner Site-ID/API-Key + IP whitelisting; this returns the
// same shape so the client flow runs end-to-end over the network.
import { NextResponse } from "next/server";
import { SCENARIO_BY_ID } from "@/lib/scenarios";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sid: string = body.scenarioId ?? "free";
  const s = SCENARIO_BY_ID[sid] ?? SCENARIO_BY_ID["free"];

  await wait(700); // simulate network + Agoda processing

  return NextResponse.json({
    cancellationSummary: {
      bookingId: s.bookingId,
      reference: s.reference, // bind to Confirm
      cancellationPolicy: [{ language: "en-us", policyText: s.deadline }],
      paymentRate: [{ currency: s.currency, inclusive: s.paid }],
      refundRate: [{ currency: s.currency, inclusive: s.refund }],
    },
    _meta: { source: "mock-agoda-demand-api", endpoint: "cancellation/preview" },
  });
}
