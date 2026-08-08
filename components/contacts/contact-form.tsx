"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { createContactAction, updateContactAction } from "@/lib/actions/contacts";
import { CONTACT_KIND_OPTIONS } from "@/lib/constants";
import { contactSchema, type ContactValues } from "@/lib/validation/contacts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ContactFormProps = {
  mode: "create" | "edit";
  contactId?: string;
  initialValues?: Partial<ContactValues>;
};

export function ContactForm({ mode, contactId, initialValues }: ContactFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      kind: initialValues?.kind ?? "client",
      displayName: initialValues?.displayName ?? "",
      organizationName: initialValues?.organizationName ?? "",
      phone: initialValues?.phone ?? "",
      email: initialValues?.email ?? "",
      instagramHandle: initialValues?.instagramHandle ?? "",
      notes: initialValues?.notes ?? ""
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createContactAction(values)
          : await updateContactAction(contactId!, values);

      if (!result.success) {
        setFormError(result.message || "Unable to save contact.");
        return;
      }

      router.push("/contacts");
      router.refresh();
    });
  });

  return (
    <Card>
      <CardContent className="p-6">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              label="Contact type"
              htmlFor="kind"
              error={form.formState.errors.kind?.message}
            >
              <Select
                id="kind"
                options={CONTACT_KIND_OPTIONS.map((option) => ({ ...option }))}
                {...form.register("kind")}
              />
            </FormField>
            <FormField
              label="Display name"
              htmlFor="displayName"
              error={form.formState.errors.displayName?.message}
            >
              <Input id="displayName" {...form.register("displayName")} />
            </FormField>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              label="Organization"
              htmlFor="organizationName"
              error={form.formState.errors.organizationName?.message}
            >
              <Input id="organizationName" {...form.register("organizationName")} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={form.formState.errors.phone?.message}>
              <Input id="phone" {...form.register("phone")} />
            </FormField>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FormField label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
              <Input id="email" type="email" {...form.register("email")} />
            </FormField>
            <FormField
              label="Instagram handle"
              htmlFor="instagramHandle"
              error={form.formState.errors.instagramHandle?.message}
            >
              <Input id="instagramHandle" placeholder="@username" {...form.register("instagramHandle")} />
            </FormField>
          </div>

          <FormField label="Notes" htmlFor="notes" error={form.formState.errors.notes?.message}>
            <Textarea id="notes" {...form.register("notes")} />
          </FormField>

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button disabled={pending} type="submit">
              {pending ? "Saving..." : mode === "create" ? "Create contact" : "Save changes"}
            </Button>
            <Button onClick={() => router.back()} type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
