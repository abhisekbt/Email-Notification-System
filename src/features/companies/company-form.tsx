"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/form-field";
import { useSectors } from "@/hooks/use-sectors";
import { CompanyFormInput, CompanyFormValues, companySchema } from "@/schemas/company-schema";

interface CompanyFormProps {
  defaultValues?: Partial<CompanyFormValues>;
  onSubmit: (values: CompanyFormValues) => void;
  mode?: "add" | "edit";
  submitLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function CompanyForm({
  defaultValues,
  onSubmit,
  mode = "add",
  submitLabel,
  isSubmitting: isSubmittingProp,
  onCancel,
}: CompanyFormProps) {
  const {
    data: sectorOptions = [],
    isError: sectorsLoadError,
    isFetching: isFetchingSectors,
    isSuccess: hasLoadedSectors,
  } = useSectors();
  const sectors = sectorOptions.filter((option) => option.status === "Active").map((option) => option.sector);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CompanyFormInput, unknown, CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: defaultValues?.companyName ?? "",
      contactPerson: defaultValues?.contactPerson ?? "",
      email: defaultValues?.email ?? "",
      alternativeEmail: defaultValues?.alternativeEmail ?? "",
      mobile: defaultValues?.mobile ?? "",
      address: defaultValues?.address ?? "",
      pan: defaultValues?.pan ?? "",
      sector: defaultValues?.sector ?? "",
      status: defaultValues?.status ?? "Active",
      categories: defaultValues?.categories ?? [],
    },
  });

  const selectedSector = useWatch({ control, name: "sector" });
  React.useEffect(() => {
    if (hasLoadedSectors && !isFetchingSectors && selectedSector && !sectors.includes(selectedSector)) {
      setValue("sector", "", { shouldValidate: true });
    }
  }, [hasLoadedSectors, isFetchingSectors, sectors, selectedSector, setValue]);

  const submitting = isSubmittingProp ?? isFormSubmitting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3.5 sm:grid-cols-2 text-xs">
      <FormField label="Company / Client Name" required error={errors.companyName?.message}>
        <Controller
          control={control}
          name="companyName"
          render={({ field }) => <Input {...field} placeholder="e.g. Acme Corporation" />}
        />
      </FormField>

      <FormField label="Contact Person" required error={errors.contactPerson?.message}>
        <Controller
          control={control}
          name="contactPerson"
          render={({ field }) => <Input {...field} placeholder="e.g. Alicia Grant" />}
        />
      </FormField>

      <FormField label="Primary Email" required error={errors.email?.message}>
        <Controller
          control={control}
          name="email"
          render={({ field }) => <Input type="email" {...field} placeholder="e.g. contact@acme.com" />}
        />
      </FormField>

      <FormField label="Alternative Email" error={errors.alternativeEmail?.message}>
        <Controller
          control={control}
          name="alternativeEmail"
          render={({ field }) => <Input type="email" {...field} placeholder="e.g. accounts@acme.com" />}
        />
      </FormField>

      <FormField label="Mobile / Phone Number" required error={errors.mobile?.message}>
        <Controller
          control={control}
          name="mobile"
          render={({ field }) => <Input {...field} placeholder="9876543210" />}
        />
      </FormField>

      <FormField label="PAN (Permanent Account Number)" required error={errors.pan?.message}>
        <Controller
          control={control}
          name="pan"
          render={({ field }) => <Input {...field} placeholder="ABCPG1234H" />}
        />
      </FormField>

      <FormField label="Sector" required error={errors.sector?.message}>
        <Controller
          control={control}
          name="sector"
          render={({ field }) => (
            <select
              {...field}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-800"
            >
              <option value="">Select sector</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          )}
        />
        {sectorsLoadError ? <p className="text-rose-700">Could not load available sectors.</p> : null}
        <p className="mt-1 text-[10px] text-slate-500 font-medium">
          Each client has one sector. Assign multiple Acts separately from the Assign Acts screen.
        </p>
      </FormField>

      <FormField label="Status" required error={errors.status?.message}>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <select
              {...field}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-800"
            >
              <option value="Active">Active (Receives Emails)</option>
              <option value="Inactive">Inactive (Excluded from Emails)</option>
            </select>
          )}
        />
      </FormField>

      <FormField label="Office Address" required error={errors.address?.message} className="sm:col-span-2">
        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <Textarea {...field} placeholder="Street, Floor, City, Region" rows={2} />
          )}
        />
      </FormField>

      <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-200">
        {onCancel ? (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="font-semibold text-slate-800">
            Cancel
          </Button>
        ) : null}
        <Button type="submit" size="sm" disabled={submitting || isFetchingSectors || sectorsLoadError || sectors.length === 0} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
          {submitting ? "Saving..." : submitLabel ?? (mode === "add" ? "Add Client" : "Save Changes")}
        </Button>
      </div>
    </form>
  );
}
