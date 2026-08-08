"use server";

import { createClient } from "@/lib/supabase/server";

export type CopilotResponse = {
  answer: string;
  type: "text" | "jobs_list" | "financial_summary" | "schedule" | "shotlist";
  data?: any;
  suggestedActions?: Array<{
    label: string;
    href?: string;
    actionType?: string;
    payload?: any;
  }>;
};

export async function askAiCopilotAction(query: string): Promise<CopilotResponse> {
  const cleanQuery = query.trim().toLowerCase();
  const supabase = await createClient();

  // Fetch recent jobs, contacts, and financials for live context
  const [
    { data: jobs },
    { data: contacts },
    { data: financials }
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, title, shoot_type, status, start_at, end_at, location, total_price")
      .order("start_at", { ascending: true })
      .limit(30),
    supabase
      .from("contacts")
      .select("id, display_name, kind, phone, instagram_handle")
      .limit(30),
    supabase
      .from("job_financials")
      .select("*")
      .limit(30)
  ]);

  const unpaidJobs = (financials || []).filter((f) => Number(f.outstanding_balance || 0) > 0);
  const totalGross = (financials || []).reduce((sum, f) => sum + Number(f.gross_income || 0), 0);
  const totalNet = (financials || []).reduce((sum, f) => sum + Number(f.net_income || 0), 0);
  const totalOutstanding = (financials || []).reduce((sum, f) => sum + Number(f.outstanding_balance || 0), 0);

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-3.5-flash"];
      const prompt = `Anda adalah KalaAI, asisten cerdas sistem manajemen fotografi KalaVisual.
Jawab pertanyaan user dalam Bahasa Indonesia secara singkat, ramah, to-the-point, dan actionable.

Konteks Data Studio Saat Ini:
- Total Pekerjaan: ${(jobs || []).length} job
- Total Omset (Gross): Rp ${totalGross.toLocaleString("id-ID")}
- Total Laba Bersih (Net): Rp ${totalNet.toLocaleString("id-ID")}
- Total Sisa Piutang Klien Belum Lunas: Rp ${totalOutstanding.toLocaleString("id-ID")}
- Daftar Job Belum Lunas (${unpaidJobs.length} job):
${unpaidJobs.map((j) => `- ${j.title}: Sisa Rp ${Number(j.outstanding_balance).toLocaleString("id-ID")} (Status: ${j.payment_status})`).join("\n")}
- Jadwal Job Terdekat:
${(jobs || []).slice(0, 5).map((j) => `- ${j.title} (${j.shoot_type}): ${j.start_at} di ${j.location || "TBA"}`).join("\n")}

Pertanyaan User:
"${query}"

Berikan jawaban yang membantu dan relevan dengan data di atas.`;

      for (const model of models) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2 }
            })
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            answer: text,
            type: cleanQuery.includes("lunas") || cleanQuery.includes("piutang") ? "jobs_list" : "text",
            suggestedActions: [
              { label: "Lihat Semua Pekerjaan", href: "/jobs" },
              { label: "Buka Halaman Keuangan", href: "/finance" }
            ]
          };
        }
      }
    } catch {
      // Fallback below
    }
  }

  // Smart Rule-Based Offline Engine
  if (cleanQuery.includes("lunas") || cleanQuery.includes("piutang") || cleanQuery.includes("belum bayar")) {
    if (unpaidJobs.length === 0) {
      return {
        answer: "🎉 Luar biasa! Semua pekerjaan saat ini sudah lunas 100%. Tidak ada sisa piutang klien.",
        type: "text",
        suggestedActions: [{ label: "Cek Keuangan", href: "/finance" }]
      };
    }

    const listText = unpaidJobs
      .map((j, i) => `${i + 1}. **${j.title}**\n   • Sisa Tagihan: Rp ${Number(j.outstanding_balance).toLocaleString("id-ID")}\n   • Klien: ${j.client_name || "Klien"}`)
      .join("\n\n");

    return {
      answer: `Terdapat **${unpaidJobs.length} pekerjaan** yang belum lunas dengan total piutang **Rp ${totalOutstanding.toLocaleString("id-ID")}**:\n\n${listText}`,
      type: "jobs_list",
      data: unpaidJobs,
      suggestedActions: [
        { label: "Lihat Daftar Pekerjaan", href: "/jobs?status=confirmed" },
        { label: "Buka Rekap Pembayaran", href: "/payments" }
      ]
    };
  }

  if (cleanQuery.includes("laba") || cleanQuery.includes("keuangan") || cleanQuery.includes("omset") || cleanQuery.includes("profit")) {
    const margin = totalGross > 0 ? Math.round((totalNet / totalGross) * 100) : 0;
    return {
      answer: `📊 **Ringkasan Finansial KalaVisual Saat Ini:**\n\n• **Gross Income (Omset)**: Rp ${totalGross.toLocaleString("id-ID")}\n• **Net Profit (Laba Bersih)**: Rp ${totalNet.toLocaleString("id-ID")} (Margin ~${margin}%)\n• **Sisa Piutang**: Rp ${totalOutstanding.toLocaleString("id-ID")}\n\nKondisi margin Anda saat ini berada dalam level yang ${margin >= 50 ? "sangat sehat! 🚀" : "perlu dipantau (kurangi biaya sewa/kru)." }`,
      type: "financial_summary",
      suggestedActions: [
        { label: "Buka Laporan Finance", href: "/finance" },
        { label: "Lihat Rekap Fee Kru", href: "/fee-recap" }
      ]
    };
  }

  if (cleanQuery.includes("jadwal") || cleanQuery.includes("shoot") || cleanQuery.includes("kosong") || cleanQuery.includes("kapan")) {
    const upcoming = (jobs || []).slice(0, 4);
    if (upcoming.length === 0) {
      return {
        answer: "Jadwal Anda saat ini masih kosong. Siap menerima booking baru!",
        type: "text",
        suggestedActions: [{ label: "+ Buat Pekerjaan Baru", href: "/jobs/new" }]
      };
    }

    const scheduleList = upcoming
      .map((j) => `• **${j.title}** (${j.shoot_type})\n  📅 ${new Date(j.start_at).toLocaleDateString("id-ID", { dateStyle: "full" })} | 📍 ${j.location || "Lokasi TBA"}`)
      .join("\n\n");

    return {
      answer: `Berikut **jadwal pemotretan terdekat Anda**:\n\n${scheduleList}`,
      type: "schedule",
      suggestedActions: [
        { label: "Buka Kalender", href: "/calendar" },
        { label: "+ Buat Job Baru", href: "/jobs/new" }
      ]
    };
  }

  if (cleanQuery.includes("ide") || cleanQuery.includes("pose") || cleanQuery.includes("konsep") || cleanQuery.includes("wisuda")) {
    return {
      answer: `🎓 **Rekomendasi Shotlist & Konsep Wisuda (Outdoor/Kampus):**\n\n1. **Formal Shots (Must-Have)**:\n   • Pose berdiri tegak pegang map ijazah/tabung.\n   • Pose setengah badan (portrait) senyum elegan.\n   • Foto bersama orang tua (ayah di kanan, ibu di kiri, klien di tengah).\n\n2. **Fun & Action Shots**:\n   • Lempar toga ke atas (pakai shutter speed min 1/1000s).\n   • Foto candid tawa bareng teman seangkatan / sahabat.\n   • Foto berjalan santai sambil menoleh ke kamera.\n\n3. **Detail Shots**:\n   • Close-up selempang nama gelar & buket bunga.\n   • Detail medali kelulusan di dada.\n\n🎨 **Dresscode**: Earthy Sage, Broken White, Navy Blue.\n⏰ **Waktu Terbaik**: 08.00–09.30 WIB atau 15.30–17.00 WIB (Golden Hour).`,
      type: "shotlist",
      suggestedActions: [{ label: "+ Buat Job Wisuda Baru", href: "/jobs/new" }]
    };
  }

  return {
    answer: `Halo! Saya **KalaAI**, asisten pintar KalaVisual Management.\n\nAnda bisa menanyakan berbagai hal seputar studio foto Anda:\n• *"Tampilkan job yang belum lunas"*\n• *"Berapa total laba bersih bulan ini?"*\n• *"Jadwal pemotretan terdekat"*\n• *"Ide konsep pose wisuda 4 orang"*\n• *"Import form booking WhatsApp"*\n\nAda yang bisa saya bantu sekarang?`,
    type: "text",
    suggestedActions: [
      { label: "Cek Job Belum Lunas", href: "/jobs" },
      { label: "Buka Kalender", href: "/calendar" },
      { label: "Cek Laba Bersih", href: "/finance" }
    ]
  };
}
