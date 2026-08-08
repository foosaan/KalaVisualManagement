import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users2 } from "lucide-react";

import { ContactForm } from "@/components/contacts/contact-form";
import { getContactById } from "@/lib/queries/contacts";

type EditContactPageProps = {
  params: Promise<{
    contactId: string;
  }>;
};

export default async function EditContactPage({ params }: EditContactPageProps) {
  const { contactId } = await params;
  const contact = await getContactById(contactId);

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href={`/contacts/${contactId}`}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="gradient-icon gradient-icon-cyan">
          <Users2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Edit Kontak</h1>
          <p className="text-xs text-muted-foreground">Perbarui data kontak {contact.display_name}.</p>
        </div>
      </div>
      <ContactForm
        contactId={contactId}
        mode="edit"
        initialValues={{
          kind: contact.kind,
          displayName: contact.display_name,
          organizationName: contact.organization_name ?? "",
          phone: contact.phone ?? "",
          email: contact.email ?? "",
          instagramHandle: contact.instagram_handle ?? "",
          notes: contact.notes ?? ""
        }}
      />
    </div>
  );
}
