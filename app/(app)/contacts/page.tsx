import Link from "next/link";
import {
  ArrowRight,
  Mail,
  Phone,
  Plus,
  Search,
  Users2
} from "lucide-react";

import { deleteContactAction } from "@/lib/actions/contacts";
import { DeleteButton } from "@/components/ui/delete-button";
import { getContactsPageData } from "@/lib/queries/contacts";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Role color mapping
const ROLE_STYLE: Record<string, { bg: string; text: string; avatar: string }> = {
  client: { bg: "bg-amber-50", text: "text-amber-700", avatar: "from-amber-100 to-orange-100 text-amber-700" },
  fg_model: { bg: "bg-emerald-50", text: "text-emerald-700", avatar: "from-emerald-100 to-cyan-100 text-emerald-700" },
  crew: { bg: "bg-blue-50", text: "text-blue-700", avatar: "from-blue-100 to-indigo-100 text-blue-700" },
  editor: { bg: "bg-violet-50", text: "text-violet-700", avatar: "from-violet-100 to-purple-100 text-violet-700" },
  vendor: { bg: "bg-cyan-50", text: "text-cyan-700", avatar: "from-cyan-100 to-teal-100 text-cyan-700" },
  other: { bg: "bg-slate-50", text: "text-slate-600", avatar: "from-slate-100 to-gray-100 text-slate-600" }
};

type ContactsPageProps = {
  searchParams: Promise<{
    q?: string;
    role?: string;
  }>;
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const { q = "", role = "all" } = await searchParams;
  const locale = await getLocale();
  const contacts = await getContactsPageData();
  const search = q.trim().toLowerCase();
  const filteredContacts = contacts.filter((contact) => {
    const matchesRole = role === "all" || contact.kind === role;
    const haystack = [contact.display_name, contact.phone, contact.email].join(" ").toLowerCase();
    const matchesSearch = search.length === 0 || haystack.includes(search);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-icon gradient-icon-cyan">
            <Users2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t("contacts.title", locale)}</h1>
            <p className="text-xs text-muted-foreground">{t("contacts.description", locale)}</p>
          </div>
        </div>
        <Link href="/contacts/new" className={buttonVariants({ size: "sm" })}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          {t("contacts.addContact", locale)}
        </Link>
      </div>

      {/* ── Search / Filter ── */}
      <div className="glass-card rounded-2xl p-4">
        <form className="grid gap-3 sm:grid-cols-[1fr_160px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <Input defaultValue={q} name="q" placeholder={t("contacts.searchPlaceholder", locale)} className="pl-9" />
          </div>
          <Select
            defaultValue={role}
            name="role"
            options={[
              { label: t("contacts.allRoles", locale), value: "all" },
              { label: "Client", value: "client" },
              { label: "FG / Model", value: "fg_model" },
              { label: "Crew", value: "crew" },
              { label: "Editor", value: "editor" },
              { label: "Vendor", value: "vendor" },
              { label: "Other", value: "other" }
            ]}
          />
          <button className={buttonVariants({ variant: "outline", size: "default" })} type="submit">
            {t("jobs.filter", locale)}
          </button>
        </form>
      </div>

      {/* ── Results Count ── */}
      {contacts.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filteredContacts.length} dari {contacts.length} kontak
        </p>
      )}

      {/* ── Contact Cards ── */}
      {filteredContacts.length === 0 ? (
        <EmptyState
          title={contacts.length === 0 ? t("contacts.noContactsYet", locale) : t("contacts.noContactsMatch", locale)}
          description={
            contacts.length === 0
              ? t("contacts.createAddressBook", locale)
              : t("contacts.tryAnother", locale)
          }
          ctaHref="/contacts/new"
          ctaLabel={t("contacts.addContact", locale)}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredContacts.map((contact, i) => {
            const initials = contact.display_name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const style = ROLE_STYLE[contact.kind] || ROLE_STYLE.other;

            return (
              <div
                key={contact.id}
                className={cn(
                  "group glass-card glass-card-hover rounded-xl p-4 animate-slide-up",
                  i < 8 ? `stagger-${i + 1}` : ""
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold",
                    style.avatar
                  )}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="text-sm font-semibold hover:text-primary transition-colors truncate block"
                    >
                      {contact.display_name}
                    </Link>
                    <span className={cn("inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", style.bg, style.text)}>
                      {contact.kind.replace("_", " ")}
                    </span>

                    {/* Contact info */}
                    <div className="mt-2 space-y-0.5">
                      {contact.phone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </p>
                      )}
                      {contact.email && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                          <Mail className="h-3 w-3 shrink-0" />
                          {contact.email}
                        </p>
                      )}
                      {contact.organization_name && (
                        <p className="text-xs text-muted-foreground truncate">
                          🏢 {contact.organization_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (hover reveal) */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/contacts/${contact.id}`}
                      className="rounded-lg p-1.5 text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-colors"
                      title={t("jobs.view", locale)}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <DeleteButton action={deleteContactAction.bind(null, contact.id)} entityName={t("delete.contact", locale)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
