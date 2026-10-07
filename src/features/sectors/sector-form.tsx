"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/form-field";
import { SectorFormValues, sectorSchema } from "@/schemas/sector-schema";

interface SectorFormProps {
  defaultValues?: Partial<SectorFormValues>;
  onSubmit: (values: SectorFormValues) => void;
  mode: "add" | "edit";
  onCancel?: () => void;
}

export function SectorForm({ defaultValues, onSubmit, mode, onCancel }: SectorFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SectorFormValues>({
    resolver: zodResolver(sectorSchema),
    defaultValues: {
      sector: defaultValues?.sector ?? "",
      description: defaultValues?.description ?? "",
      status: defaultValues?.status ?? "Active",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
      <FormField label="Sector Name" required error={errors.sector?.message}>
        <Controller
          control={control}
          name="sector"
          render={({ field }) => <Input {...field} placeholder="e.g. Education, Manufacturing, IT" />}
        />
      </FormField>

      <FormField label="Description" required error={errors.description?.message}>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea {...field} rows={3} placeholder="Describe this sector." />
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          )}
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
        {onCancel ? (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="font-semibold text-slate-800">
            Cancel
          </Button>
        ) : null}
        <Button type="submit" size="sm" disabled={isSubmitting} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
          {isSubmitting ? "Saving..." : mode === "add" ? "Add Sector" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
