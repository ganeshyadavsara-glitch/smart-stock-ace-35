import { cn } from "@/lib/utils";
import type { StockStatus } from "@/lib/inventory-data";

const map: Record<StockStatus, string> = {
  "In Stock": "bg-success/12 text-success ring-success/20",
  "Low Stock": "bg-warning/18 text-warning-foreground ring-warning/30",
  "Out of Stock": "bg-destructive/10 text-destructive ring-destructive/20",
  Overstock: "bg-info/10 text-info ring-info/20",
};

export function StatusBadge({ status, className }: { status: StockStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        map[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
