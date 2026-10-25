import { NextResponse } from "next/server";
import { fixtureOr404, readBooking } from "@/lib/voya";

export async function POST(req: Request) {
  const { scenarioId, sim } = await req.json();
  const f = fixtureOr404(scenarioId);
  if (!f) return NextResponse.json({ error: "unknown scenario" }, { status: 404 });
  return NextResponse.json(readBooking(f, sim ?? {}));
}
