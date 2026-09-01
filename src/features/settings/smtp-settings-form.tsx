"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/form-field";
import { SmtpConfig } from "@/lib/api/smtp-service";
import { SmtpSettingsFormValues, SmtpSettingsInput, smtpSettingsSchema } from "@/schemas/smtp-schema";

interface SmtpSettingsFormProps {
  defaultValues: SmtpConfig;
  onSubmit: (values: SmtpSettingsFormValues) => void;
  isSubmitting?: boolean;
}

export function SmtpSettingsForm({ defaultValues, onSubmit, isSubmitting }: SmtpSettingsFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SmtpSettingsInput, unknown, SmtpSettingsFormValues>({
    resolver: zodResolver(smtpSettingsSchema),
    defaultValues: {
      host: defaultValues.host,
      port: defaultValues.port,
      username: defaultValues.username,
      password: "",
      encryption: defaultValues.encryption,
      senderEmail: defaultValues.senderEmail,
      senderName: defaultValues.senderName,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2 text-xs">
      <FormField label="Mail Server Host" required error={errors.host?.message}>
        <Controller
          control={control}
          name="host"
          render={({ field }) => <Input {...field} placeholder="smtp.gmail.com" />}
        />
      </FormField>

      <FormField label="Port Number" required error={errors.port?.message}>
        <Controller
          control={control}
          name="port"
          render={({ field }) => (
            <Input
              {...field}
              value={field.value as number | string}
              type="number"
              min={1}
              max={65535}
              placeholder="587"
            />
          )}
        />
      </FormField>

      <FormField label="Username / Email" error={errors.username?.message}>
        <Controller
          control={control}
          name="username"
          render={({ field }) => <Input {...field} placeholder="yourname@gmail.com" />}
        />
      </FormField>

      <FormField label="Password / App Password" error={errors.password?.message}>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input {...field} type="password" placeholder="Leave empty to keep current password" autoComplete="new-password" />
          )}
        />
      </FormField>

      <FormField label="Encryption Protocol" required error={errors.encryption?.message}>
        <Controller
          control={control}
          name="encryption"
          render={({ field }) => (
            <select
              {...field}
              className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-800"
            >
              <option value="tls">TLS (Port 587 - Recommended)</option>
              <option value="ssl">SSL (Port 465)</option>
              <option value="none">None (Port 25)</option>
            </select>
          )}
        />
      </FormField>

      <FormField label="Sender Display Name" required error={errors.senderName?.message}>
        <Controller
          control={control}
          name="senderName"
          render={({ field }) => <Input {...field} placeholder="RecoNepal & Co." />}
        />
      </FormField>

      <FormField label="Sender Email Address" required error={errors.senderEmail?.message} className="sm:col-span-2">
        <Controller
          control={control}
          name="senderEmail"
          render={({ field }) => <Input {...field} type="email" placeholder="noreply@reconepal.com" />}
        />
      </FormField>

      <div className="sm:col-span-2 flex justify-end pt-2 border-t border-slate-200">
        <Button type="submit" disabled={isSubmitting} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
          {isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}
