import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

import { JobForm } from "@/components/jobs/job-form";
import { getJobFormData } from "@/lib/queries/jobs";

type EditJobPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { jobId } = await params;
  const { contacts, job } = await getJobFormData(jobId);

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Custom Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/jobs/${jobId}`}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-white text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="gradient-icon gradient-icon-amber">
            <Pencil className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Edit Pekerjaan</h1>
            <p className="text-xs text-muted-foreground">
              Perbarui jadwal, kontak, dan harga klien.
            </p>
          </div>
        </div>
      </div>

      <JobForm
        contacts={contacts}
        jobId={jobId}
        mode="edit"
        initialValues={{
          title: job.job.title,
          shootType: job.job.shoot_type,
          startAt: job.job.start_at,
          endAt: job.job.end_at,
          location: job.job.location ?? "",
          totalPrice: Number(job.job.total_price),
          currency: job.job.currency,
          status: job.job.status,
          notes: job.job.notes ?? "",
          concept: job.job.concept ?? "",
          workflowStatus: job.job.workflow_status ?? "scheduled",
          deliveryDeadline: job.job.delivery_deadline ?? "",
          actualDeliveryDate: job.job.actual_delivery_date ?? "",
          contactAssignments:
            job.job.job_contacts?.map((assignment) => ({
              contactId: assignment.contact?.id ?? "",
              role: assignment.role,
              isPrimary: assignment.is_primary,
              sendReminder: assignment.send_reminder,
              feeAmount: assignment.fee_amount ? Number(assignment.fee_amount) : null,
              notes: assignment.notes ?? "",
              confirmationStatus: assignment.confirmation_status ?? "accepted",
              feeStatus: assignment.fee_status ?? "unpaid"
            })) ?? []
        }}
      />
    </div>
  );
}
