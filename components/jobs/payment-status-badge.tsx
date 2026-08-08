import { Badge } from "@/components/ui/badge";

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" | "default"; icon: string }
> = {
  paid: {
    label: "Lunas",
    variant: "success",
    icon: "✓"
  },
  partially_paid: {
    label: "DP",
    variant: "warning",
    icon: "◐"
  },
  unpaid: {
    label: "Belum Bayar",
    variant: "destructive",
    icon: "✗"
  }
};

type PaymentStatusBadgeProps = {
  status: string | null | undefined;
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = PAYMENT_STATUS_CONFIG[status ?? "unpaid"] ?? PAYMENT_STATUS_CONFIG.unpaid;

  return (
    <Badge variant={config.variant}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}
