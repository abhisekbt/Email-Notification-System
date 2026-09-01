"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteDialog({
  open,
  onOpenChange,
  title = "Delete item",
  description = "This action cannot be undone.",
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel={isDeleting ? "Deleting..." : "Delete"}
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      destructive
    />
  );
}
