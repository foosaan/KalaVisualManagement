"use client";

import { useState, useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type DeleteButtonProps = {
  action: () => Promise<void>;
  entityName: string;
  className?: string;
};

export function DeleteButton({ action, entityName, className }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await action();
      setOpen(false);
    });
  };

  return (
    <>
      <button
        className={className || buttonVariants({ variant: "ghost", size: "sm" })}
        onClick={() => setOpen(true)}
        type="button"
      >
        Delete
      </button>
      <ConfirmDialog
        confirmLabel={`Delete ${entityName}`}
        description={`Are you sure you want to delete this ${entityName}? This action cannot be undone.`}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        open={open}
        pending={pending}
        title={`Delete ${entityName}?`}
        variant="destructive"
      />
    </>
  );
}
