import { Settings } from "lucide-react";

import { SettingsForm } from "@/components/settings/settings-form";
import { requireUser } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { t } from "@/lib/i18n";

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();
  const locale = await getLocale();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, business_name, phone, timezone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="gradient-icon gradient-icon-violet">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("settings.title", locale)}</h1>
          <p className="text-xs text-muted-foreground">{t("settings.description", locale)}</p>
        </div>
      </div>

      <SettingsForm
        initialValues={{
          fullName: profile?.full_name ?? user.user_metadata.full_name ?? "",
          businessName: profile?.business_name ?? user.user_metadata.business_name ?? "",
          phone: profile?.phone ?? user.user_metadata.phone ?? "",
          timezone: profile?.timezone ?? "Asia/Jakarta"
        }}
        locale={locale}
      />
    </div>
  );
}
