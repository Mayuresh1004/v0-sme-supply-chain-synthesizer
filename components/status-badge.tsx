import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status = "active" | "at-risk" | "inactive" | "low" | "ok" | "critical"

const STATUS_STYLES: Record<Status, string> = {
  active: "bg-success/15 text-success border-success/30",
  ok: "bg-success/15 text-success border-success/30",
  "at-risk": "bg-warning/15 text-warning border-warning/30",
  low: "bg-destructive/15 text-destructive border-destructive/30",
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  inactive: "bg-muted text-muted-foreground border-muted",
}

/** Coloured status badge for inventory / vendor states */
export function StatusBadge({ status, label }: { status: Status; label?: string }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium capitalize", STATUS_STYLES[status])}>
      {label ?? status}
    </Badge>
  )
}
