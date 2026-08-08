import { Camera, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { JobForm } from "@/components/jobs/job-form";
import { getJobFormData } from "@/lib/queries/jobs";

export default async function NewJobPage() {
  const { contacts } = await getJobFormData();

  return (
    <div className="space-y-6">
      {/* Custom Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/jobs"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-white text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="gradient-icon gradient-icon-emerald">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Buat Pekerjaan Baru</h1>
            <p className="text-xs text-muted-foreground">
              Isi detail pekerjaan foto, tentukan harga, dan assign tim.
            </p>
          </div>
        </div>
      </div>

      <JobForm contacts={contacts} mode="create" />
    </div>
  );
}
