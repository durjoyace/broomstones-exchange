import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  checked_out: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  retired: "bg-gray-100 text-gray-600 hover:bg-gray-100",
  pending: "bg-blue-100 text-blue-800 hover:bg-blue-100",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  checked_out: "Checked Out",
  retired: "Retired",
  pending: "Pending",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(statusStyles[status] ?? "bg-gray-100", className)}
    >
      {statusLabels[status] ?? status}
    </Badge>
  );
}
