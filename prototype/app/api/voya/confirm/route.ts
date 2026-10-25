import { NextResponse } from "next/server";
import { fixtureOr404, sendConfirm } from "@/lib/voya";

// Voya internal request deduplication [A]. Best effort and per server instance. It does not make
// Agoda's Confirm exactly-once, and Agoda is not sent any idempotency key.
const seen = new Set<string>();

export async function POST(req: Request) {
  const { scenarioId, requestId, confirm } = await req.json();
  const f = fixtureOr404(scenarioId);
  if (!f) return NextResponse.json({ error: "unknown scenario" }, { status: 404 });
  if (requestId && seen.has(requestId)) return NextResponse.json({ outcome: "duplicate", trace: [] });
  if (requestId) { seen.add(requestId); if (seen.size > 500) seen.clear(); }
  await new Promise((r) => setTimeout(r, 1200)); // short demo wait. The documented limit is 120 s.
  const { res, trace } = sendConfirm(f, confirm);
  if (res === "ok") return NextResponse.json({ outcome: "accepted", trace });
  if (res === "no-response") return NextResponse.json({ outcome: "unknown", trace });
  return NextResponse.json({ outcome: "error", error: res.errorMessage, trace });
}
