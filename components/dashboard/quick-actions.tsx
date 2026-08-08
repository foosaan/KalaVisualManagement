import Link from "next/link";
import { CalendarDays, CircleDollarSign, Plus, Receipt, TrendingUp, Users2 } from "lucide-react";

import { type Locale, t } from "@/lib/i18n";

type QuickActionsProps = {
  locale: Locale;
};

const actions = [
  {
    href: "/jobs/new",
    labelKey: "dashboard.newJob" as const,
    icon: Plus,
    gradient: "gradient-icon-emerald"
  },
  {
    href: "/payments/new",
    labelKey: "dashboard.addPayment" as const,
    icon: CircleDollarSign,
    gradient: "gradient-icon-cyan"
  },
  {
    href: "/expenses/new",
    labelKey: "dashboard.addExpense" as const,
    icon: Receipt,
    gradient: "gradient-icon-amber"
  },
  {
    href: "/contacts/new",
    labelKey: "dashboard.addContact" as const,
    icon: Users2,
    gradient: "gradient-icon-violet"
  },
  {
    href: "/calendar",
    labelKey: "dashboard.openCalendar" as const,
    icon: CalendarDays,
    gradient: "gradient-icon-blue"
  },
  {
    href: "/finance",
    labelKey: "dashboard.openFinance" as const,
    icon: TrendingUp,
    gradient: "gradient-icon-emerald"
  }
];

export function QuickActions({ locale }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={`group glass-card glass-card-hover rounded-2xl p-4 flex flex-col items-center gap-3 text-center animate-scale-in stagger-${i + 1}`}
          >
            <div className={`gradient-icon ${action.gradient} transition-transform group-hover:scale-110`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground">
              {t(action.labelKey, locale)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
