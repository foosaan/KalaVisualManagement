"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe, User, Building2, Phone, Clock } from "lucide-react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { updateSettingsAction } from "@/lib/actions/settings";
import { setLocaleAction } from "@/lib/actions/locale";
import { settingsSchema, type SettingsValues } from "@/lib/validation/settings";
import { type Locale, LOCALE_OPTIONS, t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SettingsFormProps = {
  initialValues: SettingsValues;
  locale: Locale;
};

export function SettingsForm({ initialValues, locale }: SettingsFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialValues
  });

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await updateSettingsAction(values);

      if (!result.success) {
        setFormError(result.message || t("settings.saveFailed", currentLocale));
        return;
      }

      setSuccessMessage(t("settings.updated", currentLocale));
      router.refresh();
    });
  });

  const handleLocaleChange = (newLocale: Locale) => {
    setCurrentLocale(newLocale);
    startTransition(async () => {
      await setLocaleAction(newLocale);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Language Section */}
      <div className="form-section">
        <div className="form-section-header" data-open="true">
          <div className="form-section-step bg-blue-100 text-blue-700">
            <Globe className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t("settings.language", currentLocale)}</h3>
            <p className="text-xs text-muted-foreground">Pilih bahasa tampilan</p>
          </div>
        </div>
        <div className="form-section-body">
          <div className="flex gap-3">
            {LOCALE_OPTIONS.map((option) => (
              <button
                className={cn(
                  "flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all",
                  currentLocale === option.value
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-transparent bg-muted/30 text-muted-foreground hover:border-primary/20 hover:bg-muted/50"
                )}
                key={option.value}
                onClick={() => handleLocaleChange(option.value as Locale)}
                type="button"
              >
                <span className="text-xl">{option.value === "id" ? "🇮🇩" : "🇬🇧"}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="form-section">
        <div className="form-section-header" data-open="true">
          <div className="form-section-step bg-emerald-100 text-emerald-700">
            <User className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Profil</h3>
            <p className="text-xs text-muted-foreground">Informasi pribadi dan bisnis Anda</p>
          </div>
        </div>
        <div className="form-section-body">
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label={t("settings.yourName", currentLocale)} htmlFor="fullName" error={form.formState.errors.fullName?.message}>
                <Input id="fullName" placeholder="Raka Pratama" {...form.register("fullName")} />
              </FormField>
              <FormField
                label={t("settings.businessName", currentLocale)}
                htmlFor="businessName"
                error={form.formState.errors.businessName?.message}
              >
                <Input id="businessName" placeholder="KalaVisual Studio" {...form.register("businessName")} />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField label={t("settings.phone", currentLocale)} htmlFor="phone" error={form.formState.errors.phone?.message}>
                <Input id="phone" placeholder="081234567890" {...form.register("phone")} />
              </FormField>
              <FormField label={t("settings.timezone", currentLocale)} htmlFor="timezone" error={form.formState.errors.timezone?.message}>
                <Input id="timezone" placeholder="Asia/Jakarta" {...form.register("timezone")} />
              </FormField>
            </div>

            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-scale-in">
                {formError}
              </div>
            )}
            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 animate-scale-in">
                ✅ {successMessage}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button disabled={pending} type="submit">
                {pending ? t("settings.saving", currentLocale) : t("settings.save", currentLocale)}
              </Button>
              <Button onClick={() => router.back()} type="button" variant="outline">
                {t("settings.back", currentLocale)}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
