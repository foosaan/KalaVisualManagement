import { Badge } from "@/components/ui/badge";
import type { Enums } from "@/lib/database.types";

const STATUS_VARIANTS: Record<Enums<"job_status">, "default" | "success" | "warning" | "destructive" | "secondary"> =
  {
    draft: "warning",
    confirmed: "secondary",
    completed: "success",
    delivered: "success",
    cancelled: "destructive"
  };

export function JobStatusBadge({ status }: { status: Enums<"job_status"> }) {
  return <Badge variant={STATUS_VARIANTS[status]}>{status.replace("_", " ")}</Badge>;
}
