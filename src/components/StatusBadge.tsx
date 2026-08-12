import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/lib/types";

const MAP: Record<TaskStatus, { label: string; cls: string }> = {
  OPEN: { label: "Open", cls: "bg-success/12 text-success border-success/25" },
  BIDDING: { label: "Bidding", cls: "bg-primary/12 text-primary border-primary/25" },
  ASSIGNED: { label: "Assigned", cls: "bg-warning/15 text-warning-foreground border-warning/35" },
  IN_PROGRESS: { label: "In Progress", cls: "bg-chart-5/15 text-chart-5 border-chart-5/30" },
  COMPLETED: { label: "Completed", cls: "bg-chart-4/15 text-chart-4 border-chart-4/30" },
  CONFIRMED: { label: "Confirmed", cls: "bg-success/15 text-success border-success/30" },
  PAID: { label: "Paid", cls: "bg-success text-success-foreground border-transparent" },
  CANCELLED: {
    label: "Cancelled",
    cls: "bg-destructive/12 text-destructive border-destructive/25",
  },
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const s = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        s.cls,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
