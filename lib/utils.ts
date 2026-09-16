import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a USDC amount to 2 decimal places with unit. */
export function formatUsdc(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "0.00 USDC";
  return `${n.toFixed(2)} USDC`;
}

/** Shorten a Stellar address to `chars` chars on each side. */
export function shortAddr(addr: string | null | undefined, chars = 4): string {
  if (!addr) return "—";
  if (addr.length <= chars * 2 + 2) return addr;
  return `${addr.slice(0, chars + 1)}…${addr.slice(-chars)}`;
}

/** Stellar Expert tx explorer URL (testnet by default). */
export function explorerTxUrl(hash: string, network: "testnet" | "mainnet" = "testnet"): string {
  return `https://stellar.expert/explorer/${network}/tx/${hash}`;
}

/** Stellar Expert contract explorer URL. */
export function explorerContractUrl(
  contractId: string,
  network: "testnet" | "mainnet" = "testnet",
): string {
  return `https://stellar.expert/explorer/${network}/contract/${contractId}`;
}

/** Stellar Expert account explorer URL. */
export function explorerAccountUrl(
  address: string,
  network: "testnet" | "mainnet" = "testnet",
): string {
  return `https://stellar.expert/explorer/${network}/account/${address}`;
}

/** Relative time label: "2m ago", "3h ago", etc. */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "just now";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/** Clamp a number between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Truncate a string to `maxLen` characters with an ellipsis. */
export function truncate(str: string, maxLen = 60): string {
  if (str.length <= maxLen) return str;
  return `${str.slice(0, maxLen)}…`;
}
