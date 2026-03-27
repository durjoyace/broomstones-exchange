import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const conditionStyles: Record<string, string> = {
  excellent: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  good: "bg-blue-50 text-blue-700 hover:bg-blue-50",
  fair: "bg-amber-50 text-amber-700 hover:bg-amber-50",
  poor: "bg-red-50 text-red-700 hover:bg-red-50",
};

interface ConditionBadgeProps {
  condition: string;
  className?: string;
}

export function ConditionBadge({ condition, className }: ConditionBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(conditionStyles[condition] ?? "bg-gray-50", "capitalize", className)}
    >
      {condition}
    </Badge>
  );
}
