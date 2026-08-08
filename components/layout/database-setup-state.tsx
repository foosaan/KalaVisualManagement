import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DatabaseSetupStateProps = {
  firstErrorMessage?: string | null;
  missingResources: string[];
};

export function DatabaseSetupState({
  firstErrorMessage,
  missingResources
}: DatabaseSetupStateProps) {
  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50/90">
        <CardHeader>
          <CardTitle>Database Setup Required</CardTitle>
          <CardDescription className="text-amber-900/80">
            Your Supabase project is connected, but this app schema has not been created there yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <p>
            Missing or unavailable resources:{" "}
            <span className="font-medium">{missingResources.join(", ")}</span>
          </p>
          {firstErrorMessage ? (
            <p className="rounded-2xl border border-amber-200 bg-white/80 px-4 py-3 font-medium text-amber-900">
              Supabase said: {firstErrorMessage}
            </p>
          ) : null}
          <div className="space-y-2">
            <p className="font-medium text-slate-900">Do this in Supabase SQL Editor:</p>
            <p>1. Open your Supabase project.</p>
            <p>2. Go to SQL Editor.</p>
            <p>
              3. Run the SQL from{" "}
              <code>supabase/migrations/202604230001_init.sql</code>.
            </p>
            <p>4. Refresh this page after the query finishes.</p>
          </div>
          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="font-medium text-slate-900">Why you are seeing this</p>
            <p className="mt-2">
              The frontend can authenticate with your publishable key, but creating tables, enums,
              RLS, and views still requires the schema migration to be executed in Supabase.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
