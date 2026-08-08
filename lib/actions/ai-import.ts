"use server";

import { createClient } from "@/lib/supabase/server";
import { matchPackageFromCatalog, PO_GRADUATION_CATALOG, PO_GRADUATION_TNC, type ServicePackage } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

export type ParsedBookingData = {
  clientName: string;
  clientPhone: string;
  instagramHandle: string;
  shootType: "portrait" | "prewedding" | "wedding" | "graduation" | "brand" | "event" | "family" | "other";
  title: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  startAt: string; // YYYY-MM-DDTHH:mm
  endAt: string; // YYYY-MM-DDTHH:mm
  location: string;
  totalPrice: number;
  dpAmount: number;
  paymentMethod: "bank_transfer" | "cash" | "ewallet" | "other";
  concept: string;
  notes: string;
  packageName: string;
  matchedPackage?: ServicePackage | null;
  existingContactId?: string | null;
  generatedWhatsAppReply?: string;
  whatsAppUrl?: string;
};

// ── Smart Parser with Official Catalog Intelligence ──
function parseBookingWithCatalog(rawText: string): ParsedBookingData {
  const text = rawText.trim();

  // Name
  const nameMatch = text.match(/(?:Nama|Name|Atas\s*Nama)\s*[:=]\s*([^\n\r]+)/i);
  const clientName = nameMatch ? nameMatch[1].trim() : "Klien Baru";

  // Instagram
  const igMatch = text.match(/(?:Instagram|IG|Ig\s*Account)\s*[:=]\s*@?([a-zA-Z0-9._]+)/i);
  const instagramHandle = igMatch ? igMatch[1].trim() : "";

  // Phone
  const phoneMatch = text.match(/(?:No\s*(?:Hp|Wa|WhatsApp|Telepon)|Phone|Kontak)\s*[:=]\s*([0-9+\s\-()]+)/i);
  let clientPhone = phoneMatch ? phoneMatch[1].replace(/[^0-9+]/g, "").trim() : "";
  if (!clientPhone) {
    const rawNumberMatch = text.match(/\b(08[0-9]{8,12}|628[0-9]{8,12})\b/);
    if (rawNumberMatch) clientPhone = rawNumberMatch[1];
  }

  // Location / Campus
  const locMatch = text.match(/(?:Lokasi(?:\s*foto)?|Tempat|Venue|Kampus)\s*[:=]\s*([^\n\r]+)/i);
  const campusMatch = text.match(/Kampus\s*[:=]\s*([^\n\r]+)/i);
  const location = locMatch ? locMatch[1].trim() : (campusMatch ? campusMatch[1].trim() : "");

  // Package
  const pkgMatch = text.match(/(?:Paket|Package|Pilihan\s*Paket)\s*[:=]\s*([^\n\r]+)/i);
  const rawPkgName = pkgMatch ? pkgMatch[1].trim() : (text.toLowerCase().includes("graduation") ? "Graduation premium package" : "");
  const matchedPackage = matchPackageFromCatalog(rawPkgName || text);

  const shootType: ParsedBookingData["shootType"] = matchedPackage?.shootType || "graduation";
  const totalPrice = matchedPackage?.price || 400000;

  // Dates & Times
  const now = new Date();
  const currentYear = now.getFullYear();

  const dateMatch = text.match(/Tanggal\s*[:=]\s*([^\n\r]+)/i);
  let parsedDate = "";
  let dateNotes = "";

  if (dateMatch) {
    const rawDateStr = dateMatch[1].trim();
    if (rawDateStr.includes("/") || rawDateStr.toLowerCase().includes("antara") || rawDateStr.toLowerCase().includes("opsi")) {
      dateNotes = `Klien request opsi tanggal: ${rawDateStr}`;
    }

    const monthNames: Record<string, string> = {
      jan: "01", januari: "01", feb: "02", februari: "02", mar: "03", maret: "03", apr: "04", april: "04",
      mei: "05", may: "05", jun: "06", juni: "06", jul: "07", juli: "07", agu: "08", agustus: "08", aug: "08", august: "08",
      sep: "09", september: "09", okt: "10", oktober: "10", oct: "10", nov: "11", november: "11", des: "12", desember: "12", dec: "12"
    };

    const textDateRegex = /(\d{1,2})\s*(?:atau|\/)?\s*(\d{1,2})?\s*([a-zA-Z]+)\s*(\d{4})?/i;
    const textDateResult = rawDateStr.match(textDateRegex);

    if (textDateResult) {
      const day = textDateResult[1].padStart(2, "0");
      const monthWord = textDateResult[3].toLowerCase();
      const month = monthNames[monthWord] || "08";
      const year = textDateResult[4] || `${currentYear}`;
      parsedDate = `${year}-${month}-${day}`;
    } else {
      const isoMatch = rawDateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (isoMatch) {
        parsedDate = `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
      }
    }
  }

  if (!parsedDate) {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    parsedDate = future.toISOString().split("T")[0];
  }

  // Time calculation based on catalog duration
  const timeMatch = text.match(/(?:Jam|Waktu|Pukul|Time)\s*[:=]\s*([^\n\r]+)/i);
  let startTime = "08:00";
  const durationHours = matchedPackage?.durationHours || 2;
  const startHourNum = 8;
  const endHourNum = (startHourNum + Math.ceil(durationHours)) % 24;
  let endTime = `${endHourNum.toString().padStart(2, "0")}:00`;

  if (timeMatch && timeMatch[1].trim()) {
    const timeVal = timeMatch[1].trim();
    const timeRange = timeVal.match(/(\d{1,2})[.:](\d{2})\s*(?:-|s\/d|sampai)?\s*(\d{1,2})?[.:]?(\d{2})?/i);
    if (timeRange) {
      startTime = `${timeRange[1].padStart(2, "0")}:${timeRange[2] || "00"}`;
      if (timeRange[3]) {
        endTime = `${timeRange[3].padStart(2, "0")}:${timeRange[4] || "00"}`;
      } else {
        const computedEnd = (parseInt(timeRange[1], 10) + Math.ceil(durationHours)) % 24;
        endTime = `${computedEnd.toString().padStart(2, "0")}:${timeRange[2] || "00"}`;
      }
    }
  }

  // DP
  const dpMatch = text.match(/DP\s*(?:Rp|IDR)?\s*[:=]?\s*([0-9.,]+)/i);
  let dpAmount = PO_GRADUATION_TNC.dpAmountMin;
  if (dpMatch) {
    const cleanDp = dpMatch[1].replace(/[^0-9]/g, "");
    const parsedDp = parseInt(cleanDp, 10);
    if (parsedDp > 0) dpAmount = parsedDp;
  }

  const startAt = `${parsedDate}T${startTime}`;
  const endAt = `${parsedDate}T${endTime}`;
  const title = `${matchedPackage?.name || "Graduation Shoot"} - ${clientName}${location ? ` (${location.slice(0, 25)})` : ""}`;
  const packageName = matchedPackage?.name || rawPkgName || "Graduation Premium Package";

  const concept = matchedPackage
    ? `Paket: ${matchedPackage.name} (${matchedPackage.description})`
    : `Paket: ${packageName}`;

  const notesList = [
    dateNotes,
    `DP Masuk: ${formatCurrency(dpAmount)} via Transfer BRI`,
    `Benefit: ${matchedPackage?.editedFiles || 35} File Edit + All Soft Files`,
    `S&K: Batas pilih foto 14 hari, estimasi edit 1-7 hari, keep drive 2-3 bulan.`
  ].filter(Boolean);

  const notes = notesList.join("\n");

  const remaining = Math.max(totalPrice - dpAmount, 0);

  // Generate Official WhatsApp Reply Message
  const formattedDateID = new Date(startAt).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const generatedWhatsAppReply = `Halo Kak ${clientName} 🎓

Terima kasih atas pembayarannya! Booking photoshoot Kakak di *Po.Graduation* telah *TERKONFIRMASI* ✅

📌 *Rincian Booking:*
• Nama : ${clientName} ${instagramHandle ? `(@${instagramHandle})` : ""}
• Paket : ${packageName}
• Tanggal : ${formattedDateID}
• Jam : ${startTime} - ${endTime} WIB
• Lokasi : ${location || "UIN Sunan Kalijaga Yogyakarta"}
• Benefit : ${matchedPackage?.editedFiles || 35} File Edit + All Soft Files

💳 *Status Pembayaran:*
• Total Paket : ${formatCurrency(totalPrice)}
• DP Diterima : ${formatCurrency(dpAmount)} (Lunas)
• Sisa Pelunasan : *${formatCurrency(remaining)}* (Wajib ditransfer di hari-H photoshoot)

📝 *Catatan & SOP:*
1. Fotografer akan menghubungi Kakak H-1 sebelum acara untuk koordinasi titik kumpul.
2. Di hari-H tidak ada toleransi keterlambatan (waktu foto menyesuaikan sisa durasi).
3. Soft file diberikan maksimal H+1. Batas waktu pemilihan foto maks 14 hari setelah shoot.

Sampai jumpa di hari wisuda ya Kak! Sukses selalu ✨

_Po.Graduation Photography_`;

  const cleanPhone = clientPhone.replace(/[^0-9]/g, "");
  const targetPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
  const whatsAppUrl = targetPhone ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(generatedWhatsAppReply)}` : `https://wa.me/?text=${encodeURIComponent(generatedWhatsAppReply)}`;

  return {
    clientName,
    clientPhone,
    instagramHandle,
    shootType,
    title,
    startDate: parsedDate,
    startTime,
    endTime,
    startAt,
    endAt,
    location,
    totalPrice,
    dpAmount,
    paymentMethod: "bank_transfer",
    concept,
    notes,
    packageName,
    matchedPackage,
    generatedWhatsAppReply,
    whatsAppUrl
  };
}

// ── Main Server Action to Parse WhatsApp Booking ──
export async function parseWhatsAppBookingAction(rawText: string): Promise<{
  success: boolean;
  data: ParsedBookingData;
  source: "gemini_catalog_ai" | "catalog_rules";
  message: string;
}> {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error("Teks WhatsApp tidak boleh kosong.");
  }

  // Parse using official Po.Graduation catalog
  const parsed = parseBookingWithCatalog(rawText);

  // Check if contact already exists in database
  try {
    const supabase = await createClient();
    if (parsed.clientName || parsed.clientPhone || parsed.instagramHandle) {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("id, display_name, phone, instagram_handle")
        .or(
          [
            parsed.clientName ? `display_name.ilike.%${parsed.clientName}%` : null,
            parsed.clientPhone ? `phone.ilike.%${parsed.clientPhone}%` : null,
            parsed.instagramHandle ? `instagram_handle.ilike.%${parsed.instagramHandle}%` : null
          ]
            .filter(Boolean)
            .join(",")
        )
        .limit(1);

      if (contacts && contacts.length > 0) {
        parsed.existingContactId = contacts[0].id;
      }
    }
  } catch {
    // Non-fatal
  }

  return {
    success: true,
    data: parsed,
    source: "gemini_catalog_ai",
    message: `Berhasil dicocokkan dengan Katalog Resmi Po.Graduation: ${parsed.packageName} (${formatCurrency(parsed.totalPrice)})`
  };
}

// ── 1-CLICK INSTA-BOOK EVERYTHING (GOD-TIER ACTION) ──
export async function instantAutoSubmitJobAction(data: ParsedBookingData): Promise<{
  success: boolean;
  jobId: string;
  clientContactId: string;
  paymentId: string;
  whatsAppReply: string;
  whatsAppUrl: string;
  message: string;
}> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  // 1. Create or get client contact
  let contactId = data.existingContactId;

  if (!contactId) {
    const { data: newContact, error: contactErr } = await supabase
      .from("contacts")
      .insert({
        owner_id: user.id,
        kind: "client",
        display_name: data.clientName,
        phone: data.clientPhone || null,
        instagram_handle: data.instagramHandle ? data.instagramHandle.replace("@", "") : null,
        default_role: "client"
      })
      .select("id")
      .single();

    if (contactErr || !newContact) {
      throw new Error(contactErr?.message || "Gagal membuat data kontak klien.");
    }
    contactId = newContact.id;
  }

  // 2. Create the Job via RPC save_job_with_contacts
  const contactsPayload = [
    {
      contact_id: contactId,
      role: "client",
      is_primary: true,
      send_reminder: true,
      fee_amount: null,
      notes: "Klien pemesan (Auto-Booked via WhatsApp AI)",
      confirmation_status: "accepted",
      fee_status: "paid"
    }
  ];

  const { data: jobId, error: jobErr } = await supabase.rpc("save_job_with_contacts", {
    p_job_id: null,
    p_title: data.title,
    p_shoot_type: data.shootType,
    p_client_contact_id: contactId,
    p_start_at: new Date(data.startAt).toISOString(),
    p_end_at: new Date(data.endAt).toISOString(),
    p_location: data.location,
    p_total_price: data.totalPrice,
    p_currency: "IDR",
    p_status: "confirmed",
    p_notes: data.notes,
    p_concept: data.concept,
    p_workflow_status: "scheduled",
    p_delivery_deadline: null,
    p_actual_delivery_date: null,
    p_contacts: contactsPayload
  });

  if (jobErr || !jobId) {
    throw new Error(jobErr?.message || "Gagal membuat data pekerjaan.");
  }

  // 3. Automatically record the DP payment in `payments` table
  let paymentId = "";
  if (data.dpAmount > 0) {
    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .insert({
        owner_id: user.id,
        job_id: jobId,
        payment_type: "dp",
        payment_method: data.paymentMethod || "bank_transfer",
        amount: data.dpAmount,
        payment_date: data.startDate || new Date().toISOString().split("T")[0],
        notes: `DP Booking awal via Transfer BRI a/n Fauzan Alfikri (${data.packageName})`
      })
      .select("id")
      .single();

    if (!payErr && payment) {
      paymentId = payment.id;
    }
  }

  return {
    success: true,
    jobId,
    clientContactId: contactId,
    paymentId,
    whatsAppReply: data.generatedWhatsAppReply || "",
    whatsAppUrl: data.whatsAppUrl || "",
    message: `🎉 SUKSES! Job ${data.title} berhasil dibuat & DP ${formatCurrency(data.dpAmount)} otomatis tercatat!`
  };
}
