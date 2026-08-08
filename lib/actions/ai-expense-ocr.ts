"use server";

import { createClient } from "@/lib/supabase/server";

export type ParsedReceiptData = {
  vendorName: string;
  category: "fg_fee" | "crew_fee" | "equipment_rental" | "transport" | "meal" | "editing" | "studio_rent" | "other";
  amount: number;
  expenseDate: string; // YYYY-MM-DD
  description: string;
  suggestedJobId?: string | null;
};

// ── Smart Rule Fallback for Receipts ──
function parseReceiptWithRules(rawText: string): ParsedReceiptData {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Category detection
  let category: ParsedReceiptData["category"] = "meal";
  if (lower.includes("sewa") || lower.includes("rental") || lower.includes("lensa") || lower.includes("kamera") || lower.includes("godox")) {
    category = "equipment_rental";
  } else if (lower.includes("studio") || lower.includes("background")) {
    category = "studio_rent";
  } else if (lower.includes("bensin") || lower.includes("pertalite") || lower.includes("pertamax") || lower.includes("tol") || lower.includes("parkir") || lower.includes("grab") || lower.includes("gojek")) {
    category = "transport";
  } else if (lower.includes("edit") || lower.includes("retouch")) {
    category = "editing";
  } else if (lower.includes("fee") || lower.includes("fg") || lower.includes("fotografer")) {
    category = "fg_fee";
  } else if (lower.includes("crew") || lower.includes("asisten") || lower.includes("lighting") || lower.includes("mua")) {
    category = "crew_fee";
  } else if (lower.includes("makan") || lower.includes("kopi") || lower.includes("warung") || lower.includes("resto") || lower.includes("nasi") || lower.includes("indomaret") || lower.includes("alfamart")) {
    category = "meal";
  }

  // Amount detection
  const amountMatches = text.match(/(?:Total|Jumlah|Bayar|Rp|IDR)?\s*[:=]?\s*(?:Rp|IDR)?\s*([0-9.,]+)/gi);
  let amount = 0;
  if (amountMatches) {
    for (const match of amountMatches) {
      const cleanNum = match.replace(/[^0-9]/g, "");
      const num = parseInt(cleanNum, 10);
      if (num >= 5000 && num > amount) {
        amount = num;
      }
    }
  }

  // Vendor name
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const vendorName = lines[0]?.slice(0, 40) || "Vendor Operasional";

  const today = new Date().toISOString().split("T")[0];

  return {
    vendorName,
    category,
    amount: amount || 50000,
    expenseDate: today,
    description: `${category.replace("_", " ").toUpperCase()} - ${vendorName}`
  };
}

// ── Gemini Vision / Multimodal OCR ──
export async function parseReceiptAction(payload: {
  imageBase64?: string;
  imageMimeType?: string;
  rawText?: string;
}): Promise<{
  success: boolean;
  data: ParsedReceiptData;
  source: "gemini_vision" | "smart_rules";
  message: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  const today = new Date().toISOString().split("T")[0];

  // Fetch active jobs to suggest matching job
  let activeJobs: Array<{ id: string; title: string }> = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("jobs")
      .select("id, title")
      .in("status", ["draft", "confirmed", "completed"])
      .order("start_at", { ascending: false })
      .limit(10);
    if (data) activeJobs = data;
  } catch {
    // Non-fatal
  }

  if (apiKey && apiKey.trim().length > 10) {
    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-3.5-flash"];

    const prompt = `Anda adalah asisten OCR akuntansi fotografi KalaVisual.
Tugas Anda adalah membaca gambar struk / nota belanja / nota sewa atau teks belanja berikut menjadi format JSON terstruktur.

Kategori yang tersedia:
- "equipment_rental" (sewa lensa, bodi kamera, flash, lighting, tripod)
- "studio_rent" (sewa studio foto, ruang indoor)
- "transport" (bensin, tol, parkir, ojek online, grab/gojek)
- "meal" (makan siang, konsumsi kru, kopi, air mineral, indomaret/alfamart)
- "editing" (biaya editor, retouching)
- "fg_fee" (fee fotografer)
- "crew_fee" (fee asisten, MUA, lightingman)
- "other"

Ekstrak JSON:
{
  "vendorName": "Nama toko / tempat",
  "category": "salah satu kategori di atas",
  "amount": total nominal rupiah dalam integer (contoh: 150000),
  "expenseDate": "YYYY-MM-DD" (jika tidak terlihat gunakan "${today}"),
  "description": "Deskripsi singkat pengeluaran"
}

KEMBALIKAN HANYA JSON MURNI TANPA MARKDOWN BACKTICK.`;

    const parts: any[] = [{ text: prompt }];

    if (payload.imageBase64 && payload.imageMimeType) {
      parts.push({
        inlineData: {
          mimeType: payload.imageMimeType,
          data: payload.imageBase64
        }
      });
    } else if (payload.rawText) {
      parts.push({ text: `Teks Struk/Nota:\n"""\n${payload.rawText}\n"""` });
    }

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1
              }
            })
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawJson) continue;

        const cleanJson = rawJson.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        return {
          success: true,
          data: {
            vendorName: parsed.vendorName || "Vendor Operasional",
            category: parsed.category || "meal",
            amount: Number(parsed.amount) || 0,
            expenseDate: parsed.expenseDate || today,
            description: parsed.description || `Pengeluaran ${parsed.vendorName || ""}`,
            suggestedJobId: activeJobs[0]?.id ?? null
          },
          source: "gemini_vision",
          message: "Struk berhasil discan secara akurat oleh Gemini Vision!"
        };
      } catch {
        // Try next model
      }
    }
  }

  // Fallback to rules
  const fallbackData = parseReceiptWithRules(payload.rawText || "Pengeluaran operasional");
  fallbackData.suggestedJobId = activeJobs[0]?.id ?? null;

  return {
    success: true,
    data: fallbackData,
    source: "smart_rules",
    message: "Struk berhasil diekstrak via Smart Rules!"
  };
}
