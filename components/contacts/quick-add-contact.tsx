"use client";

import { useState, useTransition } from "react";
import { UserPlus, X } from "lucide-react";

import { quickCreateContactAction } from "@/lib/actions/contacts";
import { CONTACT_KIND_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type ContactOption = {
  id: string;
  display_name: string;
  kind: string;
  phone: string | null;
};

type QuickAddContactProps = {
  onCreated: (contact: ContactOption) => void;
};

export function QuickAddContact({ onCreated }: QuickAddContactProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [kind, setKind] = useState<"client" | "fg_model" | "crew" | "editor" | "vendor" | "other">("client");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!name.trim()) {
      setError("Nama harus diisi.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await quickCreateContactAction(name, phone, kind);
      if (result.success && result.data) {
        onCreated({
          id: result.data.id,
          display_name: result.data.display_name,
          kind: result.data.kind,
          phone: result.data.phone
        });
        // Reset
        setName("");
        setPhone("");
        setKind("client");
        setOpen(false);
      } else {
        setError(result.message || "Gagal menyimpan kontak.");
      }
    });
  }

  if (!open) {
    return (
      <Button
        className="gap-1.5"
        onClick={() => setOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Kontak baru
      </Button>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4 space-y-3 animate-scale-in border-primary/20">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-primary">✨ Tambah kontak baru</p>
        <button
          type="button"
          className="rounded-lg p-1 text-muted-foreground/40 hover:bg-muted hover:text-foreground transition-colors"
          onClick={() => { setOpen(false); setError(null); }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_130px]">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Nama *</label>
          <Input
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="Raka Sinta"
            value={name}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">No HP</label>
          <Input
            onChange={(e) => setPhone(e.target.value)}
            placeholder="081234567890"
            value={phone}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipe</label>
          <Select
            onChange={(e) => setKind(e.target.value as typeof kind)}
            options={CONTACT_KIND_OPTIONS.map((o) => ({ ...o }))}
            value={kind}
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">{error}</p>
      )}

      <div className="flex gap-2">
        <Button
          disabled={pending}
          onClick={handleSubmit}
          size="sm"
          type="button"
        >
          {pending ? "Menyimpan..." : "Simpan & Tambah"}
        </Button>
        <Button
          onClick={() => { setOpen(false); setError(null); }}
          size="sm"
          type="button"
          variant="ghost"
        >
          Batal
        </Button>
      </div>
    </div>
  );
}
