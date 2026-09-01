"use client";

import { CheckCircle2, MailCheck, Server, ShieldCheck, XCircle } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { QueryState } from "@/components/ui/query-state";
import { SectionCard } from "@/components/ui/section-card";
import { SmtpSettingsForm } from "@/features/settings/smtp-settings-form";
import { useSmtpConfig, useTestSmtpConnection, useUpdateSmtpConfig } from "@/hooks/use-smtp";
import { SmtpSettingsFormValues } from "@/schemas/smtp-schema";

export default function SettingsPage() {
  const { data: smtpConfig, isLoading, isError } = useSmtpConfig();
  const updateSmtpConfig = useUpdateSmtpConfig();
  const testConnection = useTestSmtpConnection();

  const [lastTestResult, setLastTestResult] = React.useState<{ success: boolean; message: string } | null>(null);

  const handleSave = (values: SmtpSettingsFormValues) => {
    const payload = { ...values };
    if (!payload.password) {
      delete payload.password;
    }

    updateSmtpConfig.mutate(payload, {
      onSuccess: () => toast.success("SMTP email settings saved successfully."),
      onError: () => toast.error("Failed to save SMTP settings."),
    });
  };

  const handleTestConnection = () => {
    testConnection.mutate(undefined, {
      onSuccess: (result) => {
        setLastTestResult(result);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      },
      onError: () => {
        const result = { success: false, message: "Could not connect to SMTP email server." };
        setLastTestResult(result);
        toast.error(result.message);
      },
    });
  };

  return (
    <section className="space-y-5">
      <PageHeader
        title="Email Settings"
        description="Configure your SMTP mail server credentials used to send email updates and circulars to clients."
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <SectionCard
          title="SMTP Server Settings"
          description="Enter your mail server host, port, credentials, and default sender information."
        >
          <QueryState
            isLoading={isLoading}
            isError={isError}
            errorDescription="Could not load SMTP settings. Please check server connection."
          >
            {smtpConfig ? (
              <SmtpSettingsForm
                key={`${smtpConfig.host}-${smtpConfig.port}-${smtpConfig.senderEmail}`}
                defaultValues={smtpConfig}
                onSubmit={handleSave}
                isSubmitting={updateSmtpConfig.isPending}
              />
            ) : null}
          </QueryState>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard
            title="Test Connection"
            description="Verify that your mail server credentials and connection are working properly."
          >
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                disabled={testConnection.isPending}
                className="w-full font-semibold text-slate-800"
              >
                <MailCheck className="h-4 w-4 text-slate-700" />
                {testConnection.isPending ? "Testing Connection..." : "Test SMTP Connection"}
              </Button>

              {lastTestResult ? (
                <div
                  className={
                    "flex items-start gap-2 rounded-md border p-3 text-xs " +
                    (lastTestResult.success
                      ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-medium"
                      : "border-rose-300 bg-rose-50 text-rose-950 font-medium")
                  }
                >
                  {lastTestResult.success ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  )}
                  <span className="font-mono text-xs">{lastTestResult.message}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-600 font-medium">
                  Click the button above to verify that your mail server connects and authenticates successfully.
                </p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Current Sender Identity" description="Sender information that will appear on outgoing emails.">
            {smtpConfig ? (
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-600 font-medium">Sender Name</span>
                  <span className="font-bold text-slate-900">{smtpConfig.senderName}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-600 font-medium">Sender Email</span>
                  <span className="font-mono font-bold text-slate-900">{smtpConfig.senderEmail}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-600 font-medium">Server Host &amp; Port</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {smtpConfig.host}:{smtpConfig.port}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-600 font-medium">Encryption</span>
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {smtpConfig.encryption.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ) : null}
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
