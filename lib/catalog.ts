export type ServicePackage = {
  id: string;
  name: string;
  category: "personal" | "grub" | "couple" | "prewed";
  shootType: "graduation" | "prewedding" | "wedding" | "portrait" | "event" | "family" | "other";
  price: number;
  durationHours: number;
  editedFiles: number;
  allSoftFiles: boolean;
  maxPeople: string;
  locationsCount: number;
  description: string;
};

export const PO_GRADUATION_CATALOG: ServicePackage[] = [
  // ── Personal Graduation ──
  {
    id: "personal_basic",
    name: "Personal Basic Package",
    category: "personal",
    shootType: "graduation",
    price: 300000,
    durationHours: 1,
    editedFiles: 25,
    allSoftFiles: true,
    maxPeople: "1 Client, Keluarga, dan Teman",
    locationsCount: 1,
    description: "1 Client, Keluarga & Teman • Durasi 1 Jam • 25 File Edit + All Soft File"
  },
  {
    id: "personal_standard",
    name: "Personal Standard Package",
    category: "personal",
    shootType: "graduation",
    price: 350000,
    durationHours: 1.5,
    editedFiles: 30,
    allSoftFiles: true,
    maxPeople: "1 Client, Keluarga, dan Teman",
    locationsCount: 1,
    description: "1 Client, Keluarga & Teman • Durasi 1.5 Jam • 30 File Edit + All Soft File"
  },
  {
    id: "personal_premium",
    name: "Personal Premium Package",
    category: "personal",
    shootType: "graduation",
    price: 400000,
    durationHours: 2,
    editedFiles: 35,
    allSoftFiles: true,
    maxPeople: "1 Client, Keluarga, dan Teman",
    locationsCount: 1,
    description: "1 Client, Keluarga & Teman • Durasi 2 Jam • 35 File Edit + All Soft File"
  },

  // ── Photo Grub (Group) ──
  {
    id: "grub_basic",
    name: "Basic Grub Package",
    category: "grub",
    shootType: "graduation",
    price: 450000,
    durationHours: 1.5,
    editedFiles: 20,
    allSoftFiles: true,
    maxPeople: "2 - 5 Graduates",
    locationsCount: 1,
    description: "2-5 Graduates • Durasi 1.5 Jam • 20 File Edit + All Soft File • 1 Lokasi"
  },
  {
    id: "grub_standard",
    name: "Standard Grub Package",
    category: "grub",
    shootType: "graduation",
    price: 550000,
    durationHours: 2,
    editedFiles: 30,
    allSoftFiles: true,
    maxPeople: "2 - 5 Graduates",
    locationsCount: 1,
    description: "2-5 Graduates • Durasi 2 Jam • 30 File Edit + All Soft File • 1 Lokasi"
  },

  // ── Photo Couple ──
  {
    id: "couple_basic",
    name: "Basic Couple Package",
    category: "couple",
    shootType: "graduation",
    price: 400000,
    durationHours: 1,
    editedFiles: 20,
    allSoftFiles: true,
    maxPeople: "2 Graduates Inc. Family & Friends",
    locationsCount: 1,
    description: "2 Graduates inc. Family & Friends • Durasi 1 Jam • 20 File Edit + All Soft File"
  },
  {
    id: "couple_standard",
    name: "Standard Couple Package",
    category: "couple",
    shootType: "graduation",
    price: 500000,
    durationHours: 2,
    editedFiles: 30,
    allSoftFiles: true,
    maxPeople: "2 Graduates Inc. Family & Friends",
    locationsCount: 1,
    description: "2 Graduates inc. Family & Friends • Durasi 2 Jam • 30 File Edit + All Soft File"
  },

  // ── PreWedding ──
  {
    id: "prewed_basic",
    name: "Basic Prewed Package",
    category: "prewed",
    shootType: "prewedding",
    price: 600000,
    durationHours: 2,
    editedFiles: 20,
    allSoftFiles: true,
    maxPeople: "Pasangan",
    locationsCount: 1,
    description: "Prewedding • Durasi 2 Jam • 20 File Edit + All Soft File • 1 Lokasi"
  },
  {
    id: "prewed_standard",
    name: "Standard Prewed Package",
    category: "prewed",
    shootType: "prewedding",
    price: 750000,
    durationHours: 3,
    editedFiles: 30,
    allSoftFiles: true,
    maxPeople: "Pasangan",
    locationsCount: 1,
    description: "Prewedding • Durasi 3 Jam • 30 File Edit + All Soft File • 1 Lokasi"
  }
];

export const PO_GRADUATION_TNC = {
  dpAmountMin: 50000,
  rescheduleMaxDays: 14,
  clientSelectionMaxDays: 14,
  editingDurationDays: "1 - 7 hari",
  driveRetentionMonths: "2 - 3 bulan",
  bankAccount: {
    bank: "BRI",
    number: "6927 0100 3058 501",
    name: "Fauzan Alfikri"
  }
};

/**
 * Match a raw text package name against the catalog
 */
export function matchPackageFromCatalog(rawPackageText: string): ServicePackage | null {
  const text = rawPackageText.toLowerCase().replace(/[^a-z0-9]/g, " ");

  // Check Grub
  if (text.includes("grub") || text.includes("grup") || text.includes("group")) {
    if (text.includes("standard") || text.includes("550")) {
      return PO_GRADUATION_CATALOG.find((p) => p.id === "grub_standard") || null;
    }
    return PO_GRADUATION_CATALOG.find((p) => p.id === "grub_basic") || null;
  }

  // Check Couple
  if (text.includes("couple") || text.includes("pasangan")) {
    if (text.includes("standard") || text.includes("500")) {
      return PO_GRADUATION_CATALOG.find((p) => p.id === "couple_standard") || null;
    }
    return PO_GRADUATION_CATALOG.find((p) => p.id === "couple_basic") || null;
  }

  // Check Prewed
  if (text.includes("prewed") || text.includes("prewedding")) {
    if (text.includes("standard") || text.includes("750")) {
      return PO_GRADUATION_CATALOG.find((p) => p.id === "prewed_standard") || null;
    }
    return PO_GRADUATION_CATALOG.find((p) => p.id === "prewed_basic") || null;
  }

  // Check Personal Graduation (Default)
  if (text.includes("premium") || text.includes("400")) {
    return PO_GRADUATION_CATALOG.find((p) => p.id === "personal_premium") || null;
  }
  if (text.includes("standard") || text.includes("350")) {
    return PO_GRADUATION_CATALOG.find((p) => p.id === "personal_standard") || null;
  }
  if (text.includes("basic") || text.includes("300")) {
    return PO_GRADUATION_CATALOG.find((p) => p.id === "personal_basic") || null;
  }

  // If text mentions graduation premium
  if (text.includes("graduation")) {
    if (text.includes("prem")) return PO_GRADUATION_CATALOG.find((p) => p.id === "personal_premium") || null;
    if (text.includes("stand")) return PO_GRADUATION_CATALOG.find((p) => p.id === "personal_standard") || null;
    return PO_GRADUATION_CATALOG.find((p) => p.id === "personal_basic") || null;
  }

  return null;
}
