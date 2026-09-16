import type { Service } from "../types";
import { getAiClient, AI_MODEL, isAiConfigured } from "./providers";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

/**
 * The agent's single decision: given a goal and available services, pick one.
 *
 * Priority order:
 * 1. If demo mode or no LLM key: fast deterministic scoring.
 * 2. If an LLM key is set: one structured JSON call; deterministic fallback on parse error.
 *
 * Deterministic scoring weights:
 *   - Keyword overlap between goal and (title + description + category): 200 pts each
 *   - Provider reputation: 1 pt per point
 *   - Lower price (normalised): up to 50 pts bonus
 */
export async function chooseService(
  goal: string,
  services: Service[],
): Promise<{ service: Service; reason: string }> {
  if (services.length === 0) throw new Error("No services available in the marketplace");

  if (DEMO_MODE || !isAiConfigured()) {
    const best = pickDeterministic(goal, services);
    return {
      service: best,
      reason: `Best match for "${goal}" by relevance score and provider reputation.`,
    };
  }

  try {
    return await llmPick(goal, services);
  } catch {
    // LLM failed — fall back gracefully.
    const best = pickDeterministic(goal, services);
    return {
      service: best,
      reason: `Selected by relevance scoring (LLM unavailable) for goal: "${goal}".`,
    };
  }
}

async function llmPick(
  goal: string,
  services: Service[],
): Promise<{ service: Service; reason: string }> {
  const client = getAiClient();
  const catalog = services
    .map(
      (s, i) =>
        `${i + 1}. id=${s.id} | "${s.title}" | ${s.price} USDC | rep=${s.providerReputation} | ${s.description}`,
    )
    .join("\n");

  const completion = await client.chat.completions.create({
    model: AI_MODEL,
    temperature: 0,
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content:
          "You are an autonomous purchasing agent. Choose exactly one service that best achieves the given goal, " +
          "balancing relevance, price, and provider reputation. " +
          'Respond ONLY as valid JSON: {"service_id":"<id>","reason":"<one sentence>"}.',
      },
      {
        role: "user",
        content: `Goal: ${goal}\n\nAvailable services:\n${catalog}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as { service_id?: string; reason?: string };
  const service =
    services.find((s) => s.id === parsed.service_id) ?? pickDeterministic(goal, services);
  return {
    service,
    reason: parsed.reason ?? `Chosen by LLM for goal: "${goal}".`,
  };
}

/**
 * Deterministic scoring: keyword overlap + reputation + price bonus.
 * Never throws; always returns a service.
 */
export function pickDeterministic(goal: string, services: Service[]): Service {
  const words = goal
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const maxPrice = Math.max(...services.map((s) => s.price), 1);

  const scored = services.map((s) => {
    const text = `${s.title} ${s.description} ${s.category} ${s.providerName}`.toLowerCase();
    const keywordHits = words.filter((w) => text.includes(w)).length;
    const priceBonus = Math.round((1 - s.price / maxPrice) * 50);
    const score = keywordHits * 200 + s.providerReputation + priceBonus;
    return { s, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].s;
}
