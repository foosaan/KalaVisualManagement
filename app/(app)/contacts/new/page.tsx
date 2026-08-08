import Link from "next/link";
import { ArrowLeft, Users2 } from "lucide-react";

import { ContactForm } from "@/components/contacts/contact-form";

export default function NewContactPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/contacts"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="gradient-icon gradient-icon-cyan">
          <Users2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Tambah Kontak</h1>
          <p className="text-xs text-muted-foreground">Tambahkan klien, fotografer, crew, atau vendor baru.</p>
        </div>
      </div>
      <ContactForm mode="create" />
    </div>
  );
}
