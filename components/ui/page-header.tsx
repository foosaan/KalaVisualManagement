import Link from "next/link";

import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function PageHeader({
  title,
  description,
  actionHref,
  actionLabel
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Button asChild size="sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
