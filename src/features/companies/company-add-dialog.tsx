"use client";

import * as React from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/confirm-dialog";
import { CompanyForm } from "@/features/companies/company-form";
import { CompanyFormValues } from "@/schemas/company-schema";

interface CompanyAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (values: CompanyFormValues) => void;
  onAddCompany?: (values: CompanyFormValues) => void;
  isSubmitting?: boolean;
}

export function CompanyAddDialog({
  open,
  onOpenChange,
  onSubmit,
  onAddCompany,
  isSubmitting,
}: CompanyAddDialogProps) {
  const handleSubmit = (values: CompanyFormValues) => {
    if (onSubmit) {
      onSubmit(values);
    } else if (onAddCompany) {
      onAddCompany(values);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>Add New Client</DialogTitle>
        <p className="text-xs text-slate-600 font-medium mt-1">
          Enter client contact details, PAN number, and assign categories.
        </p>
        <div className="mt-4">
          <CompanyForm
            mode="add"
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
