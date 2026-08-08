import { AppShell } from "@/components/layout/app-shell";
import { DatabaseSetupState } from "@/components/layout/database-setup-state";
import { requireUser } from "@/lib/auth";
import { getLocale } from "@/lib/locale";
import { getDatabaseSetupState } from "@/lib/supabase/setup";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, setupState, locale] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, business_name")
      .eq("id", user.id)
      .maybeSingle(),
    getDatabaseSetupState(supabase),
    getLocale()
  ]);

  const content = setupState.ready ? (
    children
  ) : (
    <DatabaseSetupState
      firstErrorMessage={setupState.firstErrorMessage}
      missingResources={setupState.blockingChecks.map((check) => check.label)}
    />
  );

  return (
    <AppShell
      locale={locale}
      profile={{
        fullName: profile?.full_name ?? user.user_metadata.full_name ?? null,
        businessName: profile?.business_name ?? user.user_metadata.business_name ?? null
      }}
    >
      {content}
    </AppShell>
  );
}
