import { NextResponse } from "next/server";
import { z } from "zod";
import { store, addEvent, persist } from "@/lib/demo-store";
import type { Service } from "@/lib/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category") ?? undefined;
  const search = url.searchParams.get("q")?.toLowerCase() ?? "";

  let services = [...store.services];
  if (category && category !== "all") {
    services = services.filter((s) => s.category === category);
  }
  if (search) {
    services = services.filter(
      (s) =>
        s.title.toLowerCase().includes(search) ||
        s.description.toLowerCase().includes(search) ||
        s.providerName.toLowerCase().includes(search) ||
        s.category.toLowerCase().includes(search),
    );
  }

  const sorted = services.sort(
    (a, b) => b.providerReputation - a.providerReputation || a.price - b.price,
  );

  const providers = store.agents
    .filter((a) => a.isProvider)
    .sort((a, b) => b.reputationScore - a.reputationScore);

  const categories = [...new Set(store.services.map((s) => s.category))].sort();

  return NextResponse.json({ services: sorted, providers, categories });
}

const schema = z.object({
  providerAgentId: z.string().min(1),
  title: z.string().min(1).max(120),
  description: z.string().default(""),
  price: z.number().positive().max(1000),
  category: z.string().default("general"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid service payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const provider = store.agents.find((a) => a.id === parsed.data.providerAgentId);
  if (!provider) {
    return NextResponse.json({ error: "Provider agent not found" }, { status: 404 });
  }

  const { title, description, price, category } = parsed.data;
  const service: Service = {
    id: `svc-${Date.now()}`,
    providerAgentId: provider.id,
    providerName: provider.name,
    providerReputation: provider.reputationScore,
    title,
    description,
    price,
    category,
    listedAt: new Date().toISOString(),
  };
  provider.isProvider = true;
  store.services.unshift(service);
  addEvent({
    agentId: provider.id,
    type: "rep_updated",
    message: `New service listed: "${title}" at ${price} USDC.`,
  });
  persist();
  return NextResponse.json({ service }, { status: 201 });
}
