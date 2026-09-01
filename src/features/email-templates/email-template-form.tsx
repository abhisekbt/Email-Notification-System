"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { List } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/form-field";
import { EmailTemplateFormValues, emailTemplateSchema } from "@/schemas/email-template-schema";

interface EmailTemplateFormProps {
  defaultValues?: Partial<EmailTemplateFormValues>;
  onSubmit: (values: EmailTemplateFormValues) => void;
  mode: "add" | "edit";
  onCancel?: () => void;
}

export function EmailTemplateForm({ defaultValues, onSubmit, mode, onCancel }: EmailTemplateFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      templateName: defaultValues?.templateName ?? "",
      subject: defaultValues?.subject ?? "",
      body: defaultValues?.body ?? "",
    },
  });

  const insertToken = (token: string) => {
    const current = getValues("body") || "";
    setValue("body", current + (current ? " " : "") + token, { shouldValidate: true });
  };

  const insertSnippet = (snippet: string) => {
    const current = getValues("body") || "";
    setValue("body", current ? `${current}\n${snippet}` : snippet, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
      <FormField label="Template Name" required error={errors.templateName?.message}>
        <Controller
          control={control}
          name="templateName"
          render={({ field }) => (
            <Input {...field} placeholder="e.g. Tax Deadline Reminder" />
          )}
        />
      </FormField>

      <FormField label="Default Subject" required error={errors.subject?.message}>
        <Controller
          control={control}
          name="subject"
          render={({ field }) => (
            <Input {...field} placeholder="e.g. Important: Tax Filing Due Date Notice" />
          )}
        />
      </FormField>

      <FormField label="Template Content" required error={errors.body?.message}>
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-t-md border border-b-0 border-slate-200 bg-slate-50 p-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-600 mr-1">Insert Tags:</span>
              <button
                type="button"
                onClick={() => insertToken("{{contactPerson}}")}
                className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                + &#123;&#123;contactPerson&#125;&#125;
              </button>
              <button
                type="button"
                onClick={() => insertToken("{{companyName}}")}
                className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] font-bold text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                + &#123;&#123;companyName&#125;&#125;
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => insertSnippet("1. Key Provision\n2. Compliance Window\n3. Penalty Reference")}
                className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <List className="h-3 w-3" />
                Add List Points
              </button>
            </div>
          </div>
          <Controller
            control={control}
            name="body"
            render={({ field }) => (
              <Textarea
                {...field}
                rows={8}
                placeholder="Dear {{contactPerson}},\n\nPlease be reminded of the upcoming statutory deadline for {{companyName}}...\n\n1. Required Submissions\n2. Due Date"
                className="rounded-t-none text-xs leading-relaxed text-slate-900"
              />
            )}
          />
        </div>
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
            ? "Create Template"
            : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
