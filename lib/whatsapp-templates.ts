import { formatCurrency } from "@/lib/utils";

type JobData = {
  title: string;
  startAt: string;
  endAt: string;
  location: string | null;
  totalPrice?: number;
  currency?: string;
};

type ContactData = {
  name: string;
  phone?: string | null;
  fee?: number | null;
};

type PaymentData = {
  outstandingBalance?: number;
  currency?: string;
};

function formatDateID(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatTimeID(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/**
 * Template for photographer/FG — job assignment details
 */
export function getPhotographerJobTemplate(job: JobData, photographer: ContactData): string {
  return `Halo Kak ${photographer.name}, berikut detail job:

Job: ${job.title}
Tanggal: ${formatDateID(job.startAt)}
Jam: ${formatTimeID(job.startAt)} - ${formatTimeID(job.endAt)}
Lokasi: ${job.location || "TBA"}
Fee: ${photographer.fee ? formatCurrency(photographer.fee, job.currency || "IDR") : "Sesuai kesepakatan"}

Terima kasih 🙏`;
}

/**
 * Template for client — H-1 confirmation (Po.Graduation style)
 */
export function getClientReminderTemplate(job: JobData, client: ContactData, senderName?: string): string {
  const greeting = getGreeting();
  const sender = senderName || "KalaVisual";
  const clientPhone = client.phone || "-";

  return `Halo, selamat ${greeting} Kak ${client.name} ☺️
Saya ${sender} dari tim fotografer Po.Graduation. Mau mengonfirmasi jadwal photoshoot Kakak untuk besok, ya. Detailnya sebagai berikut:

Nama : ${client.name}
Hari/Tanggal : ${formatDateID(job.startAt)}
Lokasi foto : ${job.location || "TBA"}
Waktu photoshoot : ${formatTimeID(job.startAt)} - ${formatTimeID(job.endAt)}
WhatsApp : ${clientPhone}

Kalau Kakak ada referensi gaya foto atau moodboard yang ingin dicoba, boleh banget dikirim ke saya 🙌🏻
Untuk meeting point, kira-kira enaknya ketemu di sebelah mana ya, Kak?
Terima kasih banyak sebelumnya! 🙏`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "pagi";
  if (hour < 15) return "siang";
  if (hour < 18) return "sore";
  return "malam";
}

/**
 * Template for client — DP reminder
 */
export function getDpReminderTemplate(job: JobData, client: ContactData, payment: PaymentData): string {
  return `Halo Kak ${client.name}, kami ingin mengingatkan untuk pembayaran DP:

Job: ${job.title}
Tanggal Foto: ${formatDateID(job.startAt)}
Total Harga: ${formatCurrency(job.totalPrice || 0, job.currency || "IDR")}
Sisa Pembayaran: ${formatCurrency(payment.outstandingBalance || 0, payment.currency || "IDR")}

Mohon untuk melakukan pembayaran sebelum hari-H. Terima kasih 🙏`;
}

/**
 * Template for client — pelunasan reminder
 */
export function getPaymentReminderTemplate(job: JobData, client: ContactData, payment: PaymentData): string {
  return `Halo Kak ${client.name}, kami ingin mengingatkan sisa pembayaran:

Job: ${job.title}
Sisa Pembayaran: ${formatCurrency(payment.outstandingBalance || 0, payment.currency || "IDR")}

Mohon untuk melakukan pelunasan. Terima kasih 🙏`;
}

/**
 * Template for client — file delivery notification
 */
export function getDeliveryNotificationTemplate(job: JobData, client: ContactData): string {
  return `Halo Kak ${client.name}, file foto sudah selesai! 🎉

Job: ${job.title}
Tanggal Foto: ${formatDateID(job.startAt)}

File akan segera dikirimkan. Terima kasih sudah mempercayakan momen berharga kepada kami 📸`;
}

/**
 * Template for freelance — fee reminder
 */
export function getFeeReminderTemplate(photographer: ContactData, job: JobData): string {
  return `Halo Kak ${photographer.name}, terima kasih sudah membantu di job berikut:

Job: ${job.title}
Tanggal: ${formatDateID(job.startAt)}
Fee: ${photographer.fee ? formatCurrency(photographer.fee, job.currency || "IDR") : "-"}

Fee akan segera kami transfer. Terima kasih atas kerjasamanya 🙏`;
}

/**
 * Build wa.me URL with pre-filled message
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  // Clean phone number — remove spaces, dashes, and ensure country code
  let cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  if (!cleaned.startsWith("+") && !cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  cleaned = cleaned.replace("+", "");

  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
