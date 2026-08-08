"use server";

import { createClient } from "@/lib/supabase/server";

export type ClientPortalData = {
  job: {
    id: string;
    title: string;
    shoot_type: string;
    start_at: string;
    end_at: string;
    location: string | null;
    total_price: number;
    currency: string;
    status: string;
    concept: string | null;
    notes: string | null;
    created_at: string;
    workflow_status: string;
    client_name?: string;
    client_phone?: string | null;
    client_instagram?: string | null;
    drive_url?: string | null;
    culling_selection?: string | null;
    model_release_approved?: boolean;
  };
  financial: {
    paid: number;
    outstanding: number;
    payment_status: string;
  };
  profile: {
    business_name: string;
    phone: string;
  };
};

export async function getClientPortalDataAction(jobId: string): Promise<ClientPortalData | null> {
  const supabase = await createClient();

  const [{ data: job }, { data: financial }] = await Promise.all([
    supabase
      .from("jobs")
      .select("*, job_contacts(role, contact:contacts(display_name, phone, instagram_handle))")
      .eq("id", jobId)
      .maybeSingle(),
    supabase
      .from("job_financials")
      .select("*")
      .eq("job_id", jobId)
      .maybeSingle()
  ]);

  if (!job) return null;

  const clientContact = (job.job_contacts || []).find((jc: any) => jc.role === "client")?.contact;
  const paid = Number(financial?.paid_income ?? 0);
  const gross = Number(financial?.gross_income ?? job.total_price);
  const outstanding = Math.max(gross - paid, 0);

  // Extract drive link and culling from notes or concept if present
  let driveUrl = "";
  const notesText = job.notes || "";
  const driveMatch = notesText.match(/https:\/\/drive\.google\.com[^\s\n\r]+/i);
  if (driveMatch) driveUrl = driveMatch[0];

  return {
    job: {
      id: job.id,
      title: job.title,
      shoot_type: job.shoot_type,
      start_at: job.start_at,
      end_at: job.end_at,
      location: job.location,
      total_price: Number(job.total_price),
      currency: job.currency,
      status: job.status,
      concept: job.concept,
      notes: job.notes,
      created_at: job.created_at,
      workflow_status: job.workflow_status || "scheduled",
      client_name: financial?.client_name || clientContact?.display_name || "Klien",
      client_phone: clientContact?.phone,
      client_instagram: clientContact?.instagram_handle,
      drive_url: driveUrl
    },
    financial: {
      paid,
      outstanding,
      payment_status: financial?.payment_status || (paid >= gross ? "paid" : paid > 0 ? "partially_paid" : "unpaid")
    },
    profile: {
      business_name: "Po.Graduation Photography",
      phone: "+62 877-6533-4496"
    }
  };
}

export async function saveClientPhotoSelectionAction(payload: {
  jobId: string;
  selectedPhotos: string;
  editorNotes?: string;
  modelReleaseApproved: boolean;
  clientName: string;
}): Promise<{ success: boolean; message: string; whatsAppText: string; whatsAppUrl: string }> {
  const supabase = await createClient();

  const { data: job } = await supabase.from("jobs").select("notes, concept, title").eq("id", payload.jobId).single();

  const currentNotes = job?.notes || "";
  const updatedNotes = `${currentNotes}\n\n📸 [PILIHAN FOTO KLIEN]:\n${payload.selectedPhotos}\nCatatan Editor: ${payload.editorNotes || "-"}\nIzin IG Portofolio: ${payload.modelReleaseApproved ? "Disetujui ✓" : "Tidak Disetujui ✕"}`;

  await supabase
    .from("jobs")
    .update({
      notes: updatedNotes,
      workflow_status: "editing"
    })
    .eq("id", payload.jobId);

  const count = payload.selectedPhotos.split(/[\n,;]+/).filter((s) => s.trim().length > 0).length;

  const whatsAppText = `Halo Kak Tim Editor Po.Graduation! 🎓✨

Berikut daftar foto pilihan dari Klien *${payload.clientName}* (${job?.title || "Graduation"}):

📸 *Daftar Foto (${count} foto terpilih):*
${payload.selectedPhotos}

📝 *Catatan Khusus:*
${payload.editorNotes || "Tolong retouch tone warna & perapian standar ya kak"}

Persetujuan IG Portofolio: ${payload.modelReleaseApproved ? "Boleh di-upload ✓" : "Private (Jangan di-upload) ✕"}

Terima kasih 🙏`;

  const whatsAppUrl = `https://wa.me/6287765334496?text=${encodeURIComponent(whatsAppText)}`;

  return {
    success: true,
    message: "Foto pilihan berhasil disimpan dan dikirim ke editor!",
    whatsAppText,
    whatsAppUrl
  };
}
