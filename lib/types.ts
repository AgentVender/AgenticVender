export interface Agent {
  id: string;
  name: string;
  role: string;
  avatarSeed: string;
  walletAddress: string;
  reputationScore: number;
  jobsCompleted: number;
  successfulPayments: number;
  isProvider: boolean;
  /** Marks agents imported from an OpenClaw workspace */
  source?: "local" | "openclaw";
  openclawId?: string;
  /** ISO timestamp of when this agent was created */
  createdAt?: string;
  /** Skills this agent offers or uses (free-form tags) */
  skills?: string[];
}

export interface Delegation {
  agentId: string;
  dailyLimit: number;
  spentToday: number;
  expiresAt: string;
  status: "active" | "expired" | "revoked";
  onchainTxHash?: string;
  /** True when grant() was actually submitted to Stellar (Freighter or relayer). */
  onchainLive?: boolean;
  /** ISO timestamp of when the delegation was created */
  grantedAt?: string;
}

export interface Service {
  id: string;
  providerAgentId: string;
  providerName: string;
  providerReputation: number;
  title: string;
  description: string;
  price: number;
  category: string;
  onchainListingId?: number;
  /** ISO timestamp of when this listing was created */
  listedAt?: string;
}

export type JobStatus =
  | "pending"
  | "paid"
  | "delivered"
  | "completed"
  | "failed";

export interface Job {
  id: string;
  serviceId: string;
  buyerAgentId: string;
  providerAgentId: string;
  amount: number;
  status: JobStatus;
  stellarTxHash?: string;
  resultPayload?: unknown;
  createdAt: string;
  completedAt?: string;
  /** Human-readable title of the purchased service (denormalized for display) */
  serviceTitle?: string;
}

export type EventType =
  | "discovered"
  | "requested"
  | "paid"
  | "delivered"
  | "rep_updated"
  | "blocked"
  | "provisioned"
  | "delegated"
  | "revoked";

export interface ActivityEvent {
  id: string;
  agentId?: string;
  type: EventType;
  message: string;
  txHash?: string;
  createdAt: string;
}

/** Leaderboard entry — provider agent extended with earnings data */
export type LeaderboardEntry = Agent & {
  totalEarned: number;
  paidJobCount: number;
  jobCount: number;
  lastActivityAt: string | null;
  lastActivityMessage: string | null;
};
