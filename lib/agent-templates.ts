export interface AgentTemplate {
  id: string;
  name: string;
  role: string;
  category: string;
  emoji: string;
  defaultPrice: number;
  serviceTitle: string;
  serviceDescription: string;
}

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "research",
    name: "Research Agent",
    role: "Discovers and buys data autonomously.",
    category: "data",
    emoji: "🔍",
    defaultPrice: 2,
    serviceTitle: "Research & Discovery",
    serviceDescription: "Autonomous research tasks with structured JSON output.",
  },
  {
    id: "shopper",
    name: "Shopping Agent",
    role: "Finds and pays for marketplace services.",
    category: "general",
    emoji: "🛒",
    defaultPrice: 1.5,
    serviceTitle: "Autonomous Procurement",
    serviceDescription: "Your agent finds and pays for the best matching service.",
  },
  {
    id: "writer",
    name: "Writing Agent",
    role: "Drafts copy, emails, and summaries.",
    category: "nlp",
    emoji: "✍️",
    defaultPrice: 1,
    serviceTitle: "Content Writing",
    serviceDescription: "Short-form copy or email drafts on demand.",
  },
  {
    id: "analyst",
    name: "Analyst Agent",
    role: "Analyzes data and produces briefings.",
    category: "analytics",
    emoji: "📊",
    defaultPrice: 2.5,
    serviceTitle: "Data Analysis Brief",
    serviceDescription: "Turn raw inputs into an actionable analysis memo.",
  },
  {
    id: "dev",
    name: "Dev Agent",
    role: "Reviews code and generates schemas.",
    category: "dev",
    emoji: "⚡",
    defaultPrice: 3,
    serviceTitle: "Developer Assistance",
    serviceDescription: "Code review, schema generation, or API checks.",
  },
  {
    id: "creative",
    name: "Creative Agent",
    role: "Generates ideas and creative concepts.",
    category: "creative",
    emoji: "🎨",
    defaultPrice: 1.8,
    serviceTitle: "Creative Concept Pack",
    serviceDescription: "Visual or copy concepts from a short brief.",
  },
  {
    id: "compliance",
    name: "Compliance Agent",
    role: "Audits documents and processes for regulatory fit.",
    category: "analytics",
    emoji: "⚖️",
    defaultPrice: 4.0,
    serviceTitle: "Compliance Audit Report",
    serviceDescription: "Check a document against GDPR, SOC2, or a custom framework.",
  },
  {
    id: "forecaster",
    name: "Forecaster Agent",
    role: "Predicts trends from time-series data.",
    category: "data",
    emoji: "📈",
    defaultPrice: 2.5,
    serviceTitle: "Demand / Price Forecast",
    serviceDescription: "Short-term forecast from historical data with confidence intervals.",
  },
  {
    id: "legal",
    name: "Legal Agent",
    role: "Drafts and reviews legal documents.",
    category: "nlp",
    emoji: "📄",
    defaultPrice: 5.0,
    serviceTitle: "Legal Document Draft",
    serviceDescription: "NDA, ToS, or contract clause from a plain-English brief.",
  },
];

export function getAgentTemplate(id: string): AgentTemplate | undefined {
  return AGENT_TEMPLATES.find((t) => t.id === id);
}
