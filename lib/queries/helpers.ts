import type { PostgrestError } from "@supabase/supabase-js";

export function assertNoError(error: PostgrestError | null, message: string) {
  if (error) {
    throw new Error(`${message}: ${error.message}`);
  }
}

export function isMissingSchemaMessage(details: string) {
  return (
    /schema cache/i.test(details) ||
    /could not find the table/i.test(details) ||
    /could not find the relation/i.test(details) ||
    /relation .* does not exist/i.test(details) ||
    /could not find the function/i.test(details) ||
    /could not find the view/i.test(details)
  );
}

export function isMissingSchemaError(error: PostgrestError | null | undefined) {
  if (!error) {
    return false;
  }

  const knownCodes = new Set(["42P01", "PGRST205"]);
  const details = `${error.message} ${error.details ?? ""} ${error.hint ?? ""}`;

  return knownCodes.has(error.code ?? "") || isMissingSchemaMessage(details);
}
