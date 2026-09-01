"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/form-field";
import { useCategories } from "@/hooks/use-categories";
import { CompanyFormValues, companySchema } from "@/schemas/company-schema";

const industries = ["Tax Advisory", "Compliance", "Audit", "Payroll", "Corporate Advisory"];

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
  const { data: categoryOptions = [] } = useCategories();
  const categories = categoryOptions.map((option) => option.category);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: defaultValues?.companyName ?? "",
      contactPerson: defaultValues?.contactPerson ?? "",
      email: defaultValues?.email ?? "",
      alternativeEmail: defaultValues?.alternativeEmail ?? "",
      mobile: defaultValues?.mobile ?? "",
      address: defaultValues?.address ?? "",
      pan: defaultValues?.pan ?? "",
      industry: defaultValues?.industry ?? "",
      status: defaultValues?.status ?? "Active",
      categories: defaultValues?.categories ?? [],
    },
  });

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

      <FormField label="Industry / Sector" required error={errors.industry?.message}>
        <Controller
          control={control}
          name="industry"
          render={({ field }) => (
            <select
              {...field}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-800"
            >
              <option value="">Select industry</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          )}
        />
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

      <FormField label="Assigned Industries" required error={errors.categories?.message} className="sm:col-span-2">
        <Controller
          control={control}
          name="categories"
          render={({ field }) => (
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((category) => {
                const checked = field.value?.includes(category) ?? false;
                return (
                  <label key={category} className="flex items-center gap-2 text-xs font-normal text-slate-700 bg-slate-50 border border-slate-200 rounded p-2 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        if (event.target.checked) {
                          field.onChange([...(field.value ?? []), category]);
                        } else {
                          field.onChange((field.value ?? []).filter((item) => item !== category));
                        }
                      }}
                    />
                    <span className="font-semibold text-slate-800">{category}</span>
                  </label>
                );
              })}
            </div>
          )}
        />
      </FormField>

      <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-slate-200">
        {onCancel ? (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="font-semibold text-slate-800">
            Cancel
          </Button>
        ) : null}
        <Button type="submit" size="sm" disabled={submitting} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
          {submitting ? "Saving..." : submitLabel ?? (mode === "add" ? "Add Client" : "Save Changes")}
        </Button>
      </div>
    </form>
  );
}
