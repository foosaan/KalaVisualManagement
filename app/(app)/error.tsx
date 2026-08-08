"use client";

import { useEffect } from "react";

import { DatabaseSetupState } from "@/components/layout/database-setup-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isMissingSchemaMessage } from "@/lib/queries/helpers";

type AppErrorProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  if (isMissingSchemaMessage(error.message)) {
    return (
      <DatabaseSetupState
        firstErrorMessage={error.message}
        missingResources={["Supabase app schema"]}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>
          The app hit an unexpected error while loading this page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-2xl border border-border bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {error.message || "Unexpected application error."}
        </p>
        <Button onClick={reset} type="button">
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
