import { NextResponse } from "next/server";
import { fixtureOr404, readPreview } from "@/lib/voya";

export async function POST(req: Request) {
  const { scenarioId, sim } = await req.json();
  const f = fixtureOr404(scenarioId);
  if (!f) return NextResponse.json({ error: "unknown scenario" }, { status: 404 });
  await new Promise((r) => setTimeout(r, 900)); // short demo wait. The documented limit is 120 s.
  return NextResponse.json(readPreview(f, sim ?? {}));
}
