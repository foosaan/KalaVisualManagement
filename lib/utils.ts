import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string, currency = "IDR") {
  const amount = typeof value === "number" ? value : Number(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Belum diatur";
  }

  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;

    const formatter = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    const parts = formatter.formatToParts(d);
    let day = "";
    let month = "";
    let year = "";
    let hour = "";
    let minute = "";

    for (const p of parts) {
      if (p.type === "day") day = p.value;
      if (p.type === "month") month = p.value;
      if (p.type === "year") year = p.value;
      if (p.type === "hour") hour = p.value;
      if (p.type === "minute") minute = p.value;
    }

    return `${day} ${month} ${year}, ${hour}:${minute}`;
  } catch {
    return format(new Date(value), "dd MMM yyyy, HH:mm");
  }
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Belum diatur";
  }

  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;

    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(d);
  } catch {
    return format(new Date(value), "dd MMM yyyy");
  }
}

export function toDateTimeLocal(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function ensureErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
