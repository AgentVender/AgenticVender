import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReputationBadgeProps {
  score: number;
  /** Show numeric value alongside the star */
  showValue?: boolean;
  className?: string;
}

export function ReputationBadge({ score, showValue = true, className }: ReputationBadgeProps) {
  const variant = score >= 90 ? "default" : score >= 70 ? "accent" : "muted";
  const label = score > 0 ? (showValue ? score : undefined) : "new";
  return (
    <Badge variant={variant} className={cn("gap-1", className)}>
      <Star className="size-3 fill-current" />
      {label}
    </Badge>
  );
}
