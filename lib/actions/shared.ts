import { revalidatePath } from "next/cache";

import { ZodError } from "zod";

import { ensureErrorMessage } from "@/lib/utils";

export type ActionResult<T = void> = {
  success: boolean;
  message?: string;
  data?: T;
};

export function cleanText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function actionValidationError(error: ZodError) {
  const issue = error.issues[0];
  return {
    success: false,
    message: issue?.message || "Invalid form data."
  } satisfies ActionResult;
}

export function actionErrorResult(error: unknown) {
  return {
    success: false,
    message: ensureErrorMessage(error)
  } satisfies ActionResult;
}

export function revalidateJobSurfaces(jobId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/jobs");
  revalidatePath("/payments");
  revalidatePath("/expenses");
  revalidatePath("/reminders");
  revalidatePath("/finance");

  if (jobId) {
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath(`/jobs/${jobId}/edit`);
  }
}
