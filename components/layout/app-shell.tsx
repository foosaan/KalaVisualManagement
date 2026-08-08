"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  Bell,
  CalendarClock,
  CalendarDays,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  TrendingUp,
  Users2,
  Wallet,
  X,
  Sparkles,
  MessageSquare
} from "lucide-react";

import { cn } from "@/lib/utils";
import { type Locale, type TranslationKey, t } from "@/lib/i18n";
import { AiCopilotModal } from "@/components/ai/ai-copilot-modal";

type NavItem = {
  href: string;
  labelKey: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Operasional",
    items: [
      { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
      { href: "/chat", labelKey: "nav.chat", icon: MessageSquare },
      { href: "/calendar", labelKey: "nav.calendar", icon: CalendarDays },
      { href: "/jobs", labelKey: "nav.jobs", icon: CalendarClock }
    ]
  },
  {
    label: "Keuangan",
    items: [
      { href: "/payments", labelKey: "nav.payments", icon: CircleDollarSign },
      { href: "/expenses", labelKey: "nav.expenses", icon: Receipt },
      { href: "/finance", labelKey: "nav.finance", icon: TrendingUp },
      { href: "/fee-recap", labelKey: "nav.feeRecap", icon: Wallet }
    ]
  },
  {
    label: "Lainnya",
    items: [
      { href: "/contacts", labelKey: "nav.contacts", icon: Users2 },
      { href: "/reminders", labelKey: "nav.reminders", icon: Bell }
    ]
  }
];

const bottomNav: NavItem[] = [
  { href: "/settings", labelKey: "nav.settings", icon: Settings }
];

type AppShellProps = {
  children: React.ReactNode;
  profile: {
    fullName: string | null;
    businessName: string | null;
  } | null;
  locale: Locale;
};

function NavLink({ item, pathname, locale }: { item: NavItem; pathname: string; locale: Locale }) {
  const Icon = item.icon;
  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const label = t(item.labelKey, locale);

  return (
    <Link
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        active
          ? "bg-white/10 text-white"
          : "text-white/55 hover:bg-white/5 hover:text-white/85"
      )}
      href={item.href}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-emerald-400" />
      )}
      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-emerald-400" : "text-white/40 group-hover:text-white/60")} />
      {label}
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      )}
    </Link>
  );
}

export function AppShell({ children, profile, locale }: AppShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const close = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => { close(); }, [pathname, close]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Keyboard shortcut Cmd+K or Ctrl+K for AI Copilot
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCopilotOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const initials = (profile?.fullName || profile?.businessName || "K")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
            <CalendarClock className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">KalaVisual</p>
            <p className="text-[11px] text-white/40">Management</p>
          </div>
        </div>
      </div>

      {/* AI Copilot Quick Button in Sidebar */}
      <div className="px-3 pt-3 pb-1">
        <button
          type="button"
          onClick={() => setCopilotOpen(true)}
          className="flex w-full items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-transparent border border-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-all shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>KalaAI Copilot</span>
          </div>
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-mono text-white/60">⌘K</kbd>
        </button>
      </div>

      {/* Main nav */}
      <nav className="mt-3 flex-1 space-y-4 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-0.5">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/25">{group.label}</p>
            {group.items.map((item) => (
              <NavLink item={item} key={item.href} locale={locale} pathname={pathname} />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="space-y-1 border-t border-white/5 px-3 pt-3 pb-4">
        {bottomNav.map((item) => (
          <NavLink item={item} key={item.href} locale={locale} pathname={pathname} />
        ))}

        {/* User */}
        <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white/85">
              {profile?.fullName || profile?.businessName || "Photographer"}
            </p>
            <p className="truncate text-[11px] text-white/40">
              {profile?.businessName && profile.fullName ? profile.businessName : t("nav.freePlan", locale)}
            </p>
          </div>
          <a
            className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/5 hover:text-white/60"
            href="/api/auth/logout"
            title={t("nav.signOut", locale)}
          >
            <LogOut className="h-4 w-4" />
          </a>
        </div>
      </div>
    </>
  );

  return (
    <div className="app-layout">
      {/* Global AI Copilot Modal */}
      <AiCopilotModal isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />

      {/* Floating AI Trigger Button */}
      <button
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all border border-white/20"
      >
        <Sparkles className="h-4 w-4 text-emerald-200 animate-pulse" />
        <span>KalaAI Copilot</span>
        <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-mono">⌘K</span>
      </button>

      {/* Desktop sidebar */}
      <aside className="app-sidebar hidden lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <button
            aria-label="Open menu"
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-muted"
            onClick={() => setDrawerOpen(true)}
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/15">
              <CalendarClock className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <span className="text-sm font-semibold">KalaVisual</span>
          </div>
        </div>

        <button
          onClick={() => setCopilotOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>KalaAI</span>
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-[hsl(var(--sidebar-bg))] animate-slide-in-left">
            <div className="absolute right-3 top-4">
              <button
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                onClick={close}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="app-main animate-fade-in">
        {children}
      </main>
    </div>
  );
}

