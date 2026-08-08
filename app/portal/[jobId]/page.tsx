import { notFound } from "next/navigation";
import { getClientPortalDataAction } from "@/lib/actions/portal";
import { ClientPortalView } from "@/components/portal/client-portal-view";

type ClientPortalPageProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function ClientPortalPage({ params }: ClientPortalPageProps) {
  const { jobId } = await params;
  const data = await getClientPortalDataAction(jobId);

  if (!data) {
    notFound();
  }

  return <ClientPortalView data={data} />;
}
