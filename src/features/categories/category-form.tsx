"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/form-field";
import { CategoryFormValues, categorySchema } from "@/schemas/category-schema";

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues>;
  onSubmit: (values: CategoryFormValues) => void;
  mode: "add" | "edit";
  onCancel?: () => void;
}

export function CategoryForm({ defaultValues, onSubmit, mode, onCancel }: CategoryFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      category: defaultValues?.category ?? "",
      description: defaultValues?.description ?? "",
      status: "Active",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
      <FormField label="Industry Sector Name" required error={errors.category?.message}>
        <Controller
          control={control}
          name="category"
          render={({ field }) => <Input {...field} placeholder="e.g. Banking & Financial Services" />}
        />
      </FormField>

      <FormField label="Description & Scope" required error={errors.description?.message}>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea
              {...field}
              rows={3}
              placeholder="e.g. Regulatory compliance, periodic returns, and statutory advisory updates."
            />
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
          {isSubmitting
            ? "Saving..."
            : mode === "add"
            ? "Add Industry"
            : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
