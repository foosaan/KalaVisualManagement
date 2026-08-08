export const JOB_STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" }
] as const;

export const SHOOT_TYPE_OPTIONS = [
  { label: "Portrait", value: "portrait" },
  { label: "Prewedding", value: "prewedding" },
  { label: "Wedding", value: "wedding" },
  { label: "Graduation", value: "graduation" },
  { label: "Brand / Product", value: "brand" },
  { label: "Event", value: "event" },
  { label: "Family", value: "family" },
  { label: "Other", value: "other" }
] as const;

export const CONTACT_KIND_OPTIONS = [
  { label: "Client", value: "client" },
  { label: "FG / Model", value: "fg_model" },
  { label: "Crew", value: "crew" },
  { label: "Editor", value: "editor" },
  { label: "Vendor", value: "vendor" },
  { label: "Other", value: "other" }
] as const;

export const JOB_CONTACT_ROLE_OPTIONS = [
  { label: "Client", value: "client" },
  { label: "FG / Model", value: "fg_model" },
  { label: "Crew", value: "crew" },
  { label: "Editor", value: "editor" },
  { label: "Other", value: "other" }
] as const;

export const PAYMENT_TYPE_OPTIONS = [
  { label: "DP", value: "dp" },
  { label: "Partial", value: "partial" },
  { label: "Final", value: "final" },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { label: "Cash", value: "cash" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "E-Wallet", value: "ewallet" },
  { label: "Credit Card", value: "credit_card" },
  { label: "Other", value: "other" }
] as const;

export const EXPENSE_CATEGORY_OPTIONS = [
  { label: "FG Fee", value: "fg_fee" },
  { label: "Crew Fee", value: "crew_fee" },
  { label: "Equipment Rental", value: "equipment_rental" },
  { label: "Transport", value: "transport" },
  { label: "Meal", value: "meal" },
  { label: "Editing", value: "editing" },
  { label: "Studio Rent", value: "studio_rent" },
  { label: "Other", value: "other" }
] as const;

export const REMINDER_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Sent", value: "sent" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" }
] as const;

export const REMINDER_TYPE_OPTIONS = [
  { label: "H-7", value: "h_7" },
  { label: "H-3", value: "h_3" },
  { label: "H-1", value: "h_1" },
  { label: "Same day", value: "same_day" },
  { label: "Custom", value: "custom" }
] as const;

export const REMINDER_RECIPIENT_LABELS = {
  self: "Me",
  client: "Client",
  fg_model: "FG / Model",
  crew: "Crew",
  custom: "Custom"
} as const;

export const AUTO_REMINDER_RULES = [
  { reminderType: "h_7", hoursBefore: 7 * 24 },
  { reminderType: "h_3", hoursBefore: 3 * 24 },
  { reminderType: "h_1", hoursBefore: 24 },
  { reminderType: "same_day", hoursBefore: 3 }
] as const;

export const CONFIRMATION_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Declined", value: "declined" },
  { label: "Tentative", value: "tentative" }
] as const;

export const FEE_PAYMENT_STATUS_OPTIONS = [
  { label: "Unpaid", value: "unpaid" },
  { label: "Paid", value: "paid" }
] as const;

export const WORKFLOW_STATUS_OPTIONS = [
  { label: "📅 Scheduled", value: "scheduled" },
  { label: "📸 Shot", value: "shot" },
  { label: "✏️ Editing", value: "editing" },
  { label: "📦 Ready", value: "ready" },
  { label: "✅ Delivered", value: "delivered" }
] as const;

