import { NextResponse } from "next/server";
import { store } from "@/lib/demo-store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const agentId = url.searchParams.get("agentId") ?? undefined;
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "100"), 200);

  let events = store.events;
  if (agentId) {
    events = events.filter((e) => e.agentId === agentId || !e.agentId);
  }

  return NextResponse.json({ events: events.slice(0, limit) });
}
