import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-emerald-500/20 text-emerald-400",
  "bg-sky-500/20 text-sky-400",
  "bg-violet-500/20 text-violet-400",
  "bg-amber-500/20 text-amber-400",
  "bg-rose-500/20 text-rose-400",
  "bg-cyan-500/20 text-cyan-400",
  "bg-orange-500/20 text-orange-400",
  "bg-indigo-500/20 text-indigo-400",
];

function seedToIndex(seed: string, max: number): number {
  return seed.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0) % max;
}

interface AgentAvatarProps {
  seed: string;
  name: string;
  className?: string;
  /** Show a ring border around the avatar */
  ring?: boolean;
}

export function AgentAvatar({ seed, name, className, ring }: AgentAvatarProps) {
  const idx = seedToIndex(seed, PALETTE.length);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex size-10 items-center justify-center rounded-lg text-sm font-bold select-none",
        PALETTE[idx],
        ring && "ring-2 ring-primary/40",
        className,
      )}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
}
