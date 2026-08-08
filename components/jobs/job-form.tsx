"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Camera,
  ChevronDown,
  Crown,
  GraduationCap,
  Heart,
  Mic2,
  Package,
  Plus,
  Sparkles,
  Star,
  Trash2,
  Users,
  Check,
  Bell,
  BellOff,
  X
} from "lucide-react";
import { useFieldArray, useForm, Controller } from "react-hook-form";

import { createJobAction, updateJobAction } from "@/lib/actions/jobs";
import { JOB_CONTACT_ROLE_OPTIONS, JOB_STATUS_OPTIONS, SHOOT_TYPE_OPTIONS } from "@/lib/constants";
import { toDateTimeLocal } from "@/lib/utils";
import { jobSchema, type JobValues } from "@/lib/validation/jobs";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QuickAddContact } from "@/components/contacts/quick-add-contact";
import { cn } from "@/lib/utils";

type ContactOption = {
  id: string;
  display_name: string;
  kind: string;
  phone: string | null;
};

type JobFormProps = {
  mode: "create" | "edit";
  jobId?: string;
  contacts: ContactOption[];
  initialValues?: Partial<JobValues>;
};

// ── Shoot type visual config ──
const SHOOT_TYPE_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; emoji: string }> = {
  portrait: { icon: Camera, emoji: "📷" },
  prewedding: { icon: Heart, emoji: "💍" },
  wedding: { icon: Crown, emoji: "👰" },
  graduation: { icon: GraduationCap, emoji: "🎓" },
  brand: { icon: Package, emoji: "📦" },
  event: { icon: Mic2, emoji: "🎤" },
  family: { icon: Users, emoji: "👨‍👩‍👧‍👦" },
  other: { icon: Sparkles, emoji: "✨" }
};

// ── Workflow steps ──
const WORKFLOW_STEPS = [
  { value: "scheduled", label: "Scheduled", emoji: "📅" },
  { value: "shot", label: "Shot", emoji: "📸" },
  { value: "editing", label: "Editing", emoji: "✏️" },
  { value: "ready", label: "Ready", emoji: "📦" },
  { value: "delivered", label: "Delivered", emoji: "✅" }
];

const CONFIRMATION_OPTIONS = [
  { label: "✓ Accepted", value: "accepted" },
  { label: "⏳ Pending", value: "pending" },
  { label: "✕ Declined", value: "declined" },
  { label: "? Tentative", value: "tentative" }
];

const FEE_STATUS_OPTIONS = [
  { label: "Belum Dibayar", value: "unpaid" },
  { label: "✓ Lunas", value: "paid" }
];

// ── Section Accordion ──
function FormSection({
  step,
  title,
  description,
  icon: Icon,
  accentColor,
  defaultOpen = false,
  children
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="form-section animate-slide-up" style={{ animationDelay: `${step * 0.05}s` }}>
      <button
        type="button"
        className="form-section-header w-full"
        data-open={open ? "true" : "false"}
        onClick={() => setOpen(!open)}
      >
        <div className={cn("form-section-step", accentColor)}>
          {step}
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Icon className="h-4 w-4 text-muted-foreground/50 shrink-0 mr-1" />
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground/50 shrink-0 transition-transform",
          open && "rotate-180"
        )} />
      </button>
      {open && (
        <div className="form-section-body animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Toggle Switch ──
function ToggleSwitch({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        className="toggle-switch"
        data-checked={checked ? "true" : "false"}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-switch-thumb" />
      </button>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </label>
  );
}

import { WhatsAppImportModal } from "@/components/jobs/whatsapp-import-modal";
import type { ParsedBookingData } from "@/lib/actions/ai-import";

// ── Main Form ──
export function JobForm({ mode, jobId, contacts: initialContacts, initialValues }: JobFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ContactOption[]>(initialContacts);
  const [showWaModal, setShowWaModal] = useState(false);

  const form = useForm<JobValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      shootType: initialValues?.shootType ?? "portrait",
      startAt: initialValues?.startAt ? toDateTimeLocal(initialValues.startAt) : "",
      endAt: initialValues?.endAt ? toDateTimeLocal(initialValues.endAt) : "",
      location: initialValues?.location ?? "",
      totalPrice: initialValues?.totalPrice ?? 0,
      currency: initialValues?.currency ?? "IDR",
      status: initialValues?.status ?? "draft",
      notes: initialValues?.notes ?? "",
      concept: initialValues?.concept ?? "",
      contactAssignments: initialValues?.contactAssignments ?? [],
      workflowStatus: initialValues?.workflowStatus ?? "scheduled",
      deliveryDeadline: initialValues?.deliveryDeadline ? toDateTimeLocal(initialValues.deliveryDeadline) : "",
      actualDeliveryDate: initialValues?.actualDeliveryDate ? toDateTimeLocal(initialValues.actualDeliveryDate) : ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contactAssignments"
  });

  const handleApplyWaData = (data: ParsedBookingData, assignedContactId?: string) => {
    form.setValue("title", data.title, { shouldDirty: true, shouldValidate: true });
    form.setValue("shootType", data.shootType, { shouldDirty: true, shouldValidate: true });
    form.setValue("startAt", data.startAt, { shouldDirty: true, shouldValidate: true });
    form.setValue("endAt", data.endAt, { shouldDirty: true, shouldValidate: true });
    form.setValue("location", data.location, { shouldDirty: true, shouldValidate: true });
    form.setValue("totalPrice", data.totalPrice, { shouldDirty: true, shouldValidate: true });
    form.setValue("concept", data.concept, { shouldDirty: true, shouldValidate: true });
    form.setValue("notes", data.notes, { shouldDirty: true, shouldValidate: true });

    if (assignedContactId) {
      const existingClientIdx = form.getValues("contactAssignments").findIndex(a => a.role === "client");
      if (existingClientIdx >= 0) {
        form.setValue(`contactAssignments.${existingClientIdx}.contactId`, assignedContactId);
      } else {
        append({
          contactId: assignedContactId,
          role: "client",
          isPrimary: true,
          sendReminder: true,
          feeAmount: null,
          notes: null,
          confirmationStatus: "accepted",
          feeStatus: "unpaid"
        });
      }
    }
  };

  const handleContactCreated = (newContact: { id: string; display_name: string; kind: string; phone: string | null }) => {
    setContacts(prev => [newContact, ...prev]);
  };

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);

    startTransition(async () => {
      const payload = {
        ...values,
        startAt: new Date(values.startAt).toISOString(),
        endAt: new Date(values.endAt).toISOString(),
        deliveryDeadline: values.deliveryDeadline ? new Date(values.deliveryDeadline).toISOString() : null,
        actualDeliveryDate: values.actualDeliveryDate ? new Date(values.actualDeliveryDate).toISOString() : null
      };

      const result =
        mode === "create"
          ? await createJobAction(payload)
          : await updateJobAction(jobId!, payload);

      if (!result.success || !result.data) {
        setFormError(result.message || "Unable to save job.");
        return;
      }

      router.push(`/jobs/${result.data.id}`);
      router.refresh();
    });
  });

  const watchedShootType = form.watch("shootType");
  const watchedStatus = form.watch("status");
  const watchedWorkflow = form.watch("workflowStatus");

  return (
    <>
      <WhatsAppImportModal
        isOpen={showWaModal}
        onClose={() => setShowWaModal(false)}
        onApply={handleApplyWaData}
        existingContacts={contacts}
        onContactCreated={handleContactCreated}
      />

      <form className="space-y-4" onSubmit={onSubmit}>
        {/* Quick Import Hero Banner (in Create Mode) */}
        {mode === "create" && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent p-4 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Quick Import dari WhatsApp
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    AI Auto-Fill
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Paste teks form chat dari klien di WhatsApp, biarkan AI mengisi form secara otomatis.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setShowWaModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shrink-0 flex items-center gap-1.5 w-full sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              Import Form WhatsApp
            </Button>
          </div>
        )}

        {/* ═══════════════════════════════════════
            SECTION 1: JOB DETAILS
           ═══════════════════════════════════════ */}
        <FormSection
          step={1}
          title="Detail Pekerjaan"
          description="Jenis foto, judul, dan status"
          icon={Camera}
          accentColor="bg-emerald-100 text-emerald-700"
          defaultOpen
        >
        {/* Shoot Type Grid */}
        <div className="mb-5">
          <label className="text-sm font-medium text-foreground mb-2.5 block">Jenis Foto</label>
          <Controller
            control={form.control}
            name="shootType"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {SHOOT_TYPE_OPTIONS.map((opt) => {
                  const config = SHOOT_TYPE_ICONS[opt.value];
                  const selected = field.value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className="shoot-type-card"
                      data-selected={selected ? "true" : "false"}
                      onClick={() => field.onChange(opt.value)}
                    >
                      <span className="shoot-type-icon text-2xl transition-transform">
                        {config?.emoji ?? "📷"}
                      </span>
                      <span className="text-xs font-medium text-foreground/80">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        {/* Title */}
        <div className="mb-4">
          <FormField
            label="Judul Pekerjaan"
            htmlFor="title"
            error={form.formState.errors.title?.message}
          >
            <Input
              id="title"
              placeholder="Prewedding Raka & Sinta"
              className="h-12 text-base font-medium"
              {...form.register("title")}
            />
          </FormField>
        </div>

        {/* Status Pills */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2.5 block">Status</label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {JOB_STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="status-pill"
                    data-selected={field.value === opt.value ? "true" : "false"}
                    onClick={() => field.onChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          />
        </div>
      </FormSection>

      {/* ═══════════════════════════════════════
          SECTION 2: SCHEDULE & LOCATION
         ═══════════════════════════════════════ */}
      <FormSection
        step={2}
        title="Jadwal & Lokasi"
        description="Tanggal, waktu, dan tempat"
        icon={Camera}
        accentColor="bg-blue-100 text-blue-700"
        defaultOpen={mode === "create"}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Mulai"
            htmlFor="startAt"
            error={form.formState.errors.startAt?.message}
          >
            <Input id="startAt" type="datetime-local" {...form.register("startAt")} />
          </FormField>
          <FormField
            label="Selesai"
            htmlFor="endAt"
            error={form.formState.errors.endAt?.message}
          >
            <Input id="endAt" type="datetime-local" {...form.register("endAt")} />
          </FormField>
        </div>

        <div className="mt-4">
          <FormField
            label="Lokasi"
            htmlFor="location"
            error={form.formState.errors.location?.message}
          >
            <Input id="location" placeholder="Studio Kemang, Jakarta Selatan" {...form.register("location")} />
          </FormField>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormField label="Deadline Pengiriman" htmlFor="deliveryDeadline">
            <Input id="deliveryDeadline" type="datetime-local" {...form.register("deliveryDeadline")} />
          </FormField>
          <FormField label="Tanggal Pengiriman Aktual" htmlFor="actualDeliveryDate">
            <Input id="actualDeliveryDate" type="datetime-local" {...form.register("actualDeliveryDate")} />
          </FormField>
        </div>
      </FormSection>

      {/* ═══════════════════════════════════════
          SECTION 3: PRICING
         ═══════════════════════════════════════ */}
      <FormSection
        step={3}
        title="Harga"
        description="Harga klien dan mata uang"
        icon={Camera}
        accentColor="bg-amber-100 text-amber-700"
        defaultOpen={mode === "create"}
      >
        <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <FormField
            label="Harga Total Klien"
            htmlFor="totalPrice"
            error={form.formState.errors.totalPrice?.message}
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                Rp
              </span>
              <Input
                id="totalPrice"
                min="0"
                step="1000"
                type="number"
                className="pl-10 h-12 text-lg font-semibold tabular-nums"
                {...form.register("totalPrice", { valueAsNumber: true })}
              />
            </div>
          </FormField>
          <FormField
            label="Mata Uang"
            htmlFor="currency"
            error={form.formState.errors.currency?.message}
          >
            <Input
              id="currency"
              maxLength={3}
              className="h-12 text-center text-lg font-semibold uppercase"
              {...form.register("currency")}
            />
          </FormField>
        </div>
      </FormSection>

      {/* ═══════════════════════════════════════
          SECTION 4: CONCEPT & NOTES
         ═══════════════════════════════════════ */}
      <FormSection
        step={4}
        title="Konsep & Catatan"
        description="Brief konsep dan catatan operasional"
        icon={Camera}
        accentColor="bg-violet-100 text-violet-700"
      >
        <FormField label="Konsep" htmlFor="concept" error={form.formState.errors.concept?.message}>
          <Textarea
            id="concept"
            placeholder="Clean editorial mood, warm natural light, neutral wardrobe, sunset backup plan."
            {...form.register("concept")}
          />
        </FormField>

        <div className="mt-4">
          <FormField label="Catatan Operasional" htmlFor="notes" error={form.formState.errors.notes?.message}>
            <Textarea
              id="notes"
              placeholder="Bawa reflector, model datang jam 2, parkir di basement."
              {...form.register("notes")}
            />
          </FormField>
        </div>
      </FormSection>

      {/* ═══════════════════════════════════════
          SECTION 5: TEAM & WORKFLOW
         ═══════════════════════════════════════ */}
      <FormSection
        step={5}
        title="Tim & Workflow"
        description="Assign orang dan tracking progress"
        icon={Users}
        accentColor="bg-cyan-100 text-cyan-700"
        defaultOpen={mode === "create"}
      >
        {/* Workflow Stepper */}
        <div className="mb-6">
          <label className="text-sm font-medium text-foreground mb-3 block">Workflow Progress</label>
          <Controller
            control={form.control}
            name="workflowStatus"
            render={({ field }) => {
              const currentIdx = WORKFLOW_STEPS.findIndex((s) => s.value === field.value);
              return (
                <div className="flex items-center gap-0">
                  {WORKFLOW_STEPS.map((step, i) => {
                    const isActive = i === currentIdx;
                    const isCompleted = i < currentIdx;

                    return (
                      <div key={step.value} className="flex items-center flex-1 last:flex-initial">
                        <button
                          type="button"
                          className="workflow-step"
                          onClick={() => field.onChange(step.value)}
                        >
                          <div
                            className="workflow-step-dot"
                            data-active={isActive ? "true" : "false"}
                            data-completed={isCompleted ? "true" : "false"}
                            data-inactive={!isActive && !isCompleted ? "true" : "false"}
                          >
                            {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.emoji}
                          </div>
                          <span className={cn(
                            "text-[10px] font-medium whitespace-nowrap",
                            isActive ? "text-primary" : "text-muted-foreground/60"
                          )}>
                            {step.label}
                          </span>
                        </button>
                        {i < WORKFLOW_STEPS.length - 1 && (
                          <div className={cn(
                            "workflow-step-line mt-[-18px]",
                            i < currentIdx ? "bg-primary/30" : "bg-border"
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
        </div>

        {/* Contact Assignments */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold">Assignment</h4>
              <p className="text-xs text-muted-foreground">
                Photographer, crew, editor, dan klien.
              </p>
            </div>
            <Button
              disabled={contacts.length === 0}
              onClick={() =>
                append({
                  contactId: contacts[0]?.id ?? "",
                  role: "fg_model",
                  isPrimary: fields.length === 0,
                  sendReminder: true,
                  feeAmount: null,
                  notes: "",
                  confirmationStatus: "accepted",
                  feeStatus: "unpaid"
                })
              }
              type="button"
              variant="secondary"
              size="sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah orang
            </Button>
          </div>

          {/* Quick Add Contact */}
          <QuickAddContact
            onCreated={(newContact) => {
              setContacts((prev) => [...prev, newContact]);
              append({
                contactId: newContact.id,
                role: newContact.kind === "client" ? "client" : newContact.kind === "fg_model" ? "fg_model" : "crew",
                isPrimary: fields.length === 0,
                sendReminder: true,
                feeAmount: null,
                notes: "",
                confirmationStatus: "accepted",
                feeStatus: "unpaid"
              });
            }}
          />

          {contacts.length === 0 && fields.length === 0 && (
            <p className="text-sm text-muted-foreground py-3">
              Belum ada kontak. Buat kontak baru di atas.
            </p>
          )}

          {fields.length === 0 && contacts.length > 0 && (
            <div className="text-center py-6 rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                Belum ada yang ditugaskan. Klik &quot;Tambah orang&quot; untuk mulai.
              </p>
            </div>
          )}

          {/* Assignment Cards */}
          {fields.map((field, index) => {
            const contactId = form.watch(`contactAssignments.${index}.contactId`);
            const contact = contacts.find((c) => c.id === contactId);
            const initials = (contact?.display_name || "?")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={field.id}
                className="rounded-xl border border-border/60 bg-white overflow-hidden animate-scale-in"
              >
                {/* Card Header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/20 border-b border-border/40">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-cyan-100 text-xs font-bold text-emerald-700">
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0 grid gap-2 sm:grid-cols-[1fr_120px]">
                    <Select
                      id={`contactAssignments.${index}.contactId`}
                      options={contacts.map((c) => ({
                        value: c.id,
                        label: `${c.display_name} • ${c.kind}`
                      }))}
                      {...form.register(`contactAssignments.${index}.contactId`)}
                    />
                    <Select
                      id={`contactAssignments.${index}.role`}
                      options={JOB_CONTACT_ROLE_OPTIONS.map((o) => ({ ...o }))}
                      {...form.register(`contactAssignments.${index}.role`)}
                    />
                  </div>

                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-muted-foreground/40 hover:bg-red-50 hover:text-red-500 transition-colors"
                    onClick={() => remove(index)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Card Body */}
                <div className="px-4 py-3 space-y-3">
                  {/* Fee + Confirmation + Fee Status */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <FormField
                      label="Fee"
                      htmlFor={`contactAssignments.${index}.feeAmount`}
                      error={form.formState.errors.contactAssignments?.[index]?.feeAmount?.message}
                    >
                      <Input
                        id={`contactAssignments.${index}.feeAmount`}
                        min="0"
                        step="1000"
                        type="number"
                        placeholder="500000"
                        {...form.register(`contactAssignments.${index}.feeAmount`, {
                          setValueAs: (value) => (value === "" ? null : Number(value))
                        })}
                      />
                    </FormField>

                    <FormField
                      label="Konfirmasi"
                      htmlFor={`contactAssignments.${index}.confirmationStatus`}
                    >
                      <Select
                        id={`contactAssignments.${index}.confirmationStatus`}
                        options={CONFIRMATION_OPTIONS.map((o) => ({ ...o }))}
                        {...form.register(`contactAssignments.${index}.confirmationStatus`)}
                      />
                    </FormField>

                    <FormField
                      label="Status Fee"
                      htmlFor={`contactAssignments.${index}.feeStatus`}
                    >
                      <Select
                        id={`contactAssignments.${index}.feeStatus`}
                        options={FEE_STATUS_OPTIONS.map((o) => ({ ...o }))}
                        {...form.register(`contactAssignments.${index}.feeStatus`)}
                      />
                    </FormField>
                  </div>

                  {/* Toggles + Notes */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Controller
                      control={form.control}
                      name={`contactAssignments.${index}.isPrimary`}
                      render={({ field: f }) => (
                        <ToggleSwitch
                          checked={!!f.value}
                          onChange={f.onChange}
                          label="Utama"
                        />
                      )}
                    />
                    <Controller
                      control={form.control}
                      name={`contactAssignments.${index}.sendReminder`}
                      render={({ field: f }) => (
                        <ToggleSwitch
                          checked={!!f.value}
                          onChange={f.onChange}
                          label="Auto Reminder"
                        />
                      )}
                    />
                    <div className="flex-1 min-w-[180px]">
                      <Input
                        id={`contactAssignments.${index}.notes`}
                        placeholder="Catatan assignment..."
                        className="h-8 text-xs"
                        {...form.register(`contactAssignments.${index}.notes`)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </FormSection>

      {/* ═══════════════════════════════════════
          SUBMIT AREA
         ═══════════════════════════════════════ */}
      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-scale-in">
          {formError}
        </div>
      )}

      <div className="sticky bottom-0 z-20 -mx-1 px-1 pt-3 pb-1">
        <div className="glass-card rounded-2xl px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn(
              "h-2 w-2 rounded-full",
              watchedStatus === "draft" ? "bg-amber-400" :
              watchedStatus === "confirmed" ? "bg-emerald-400" :
              watchedStatus === "cancelled" ? "bg-red-400" :
              "bg-cyan-400"
            )} />
            <span>{watchedShootType} • {watchedStatus} • {watchedWorkflow}</span>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.back()} type="button" variant="outline" size="sm">
              Batal
            </Button>
            <Button disabled={pending} type="submit" size="sm">
              {pending ? "Menyimpan..." : mode === "create" ? "🚀 Buat Pekerjaan" : "💾 Simpan"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  </>
  );
}

