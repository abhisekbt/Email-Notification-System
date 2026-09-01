"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Bold,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck,
  FileText,
  FlaskConical,
  Italic,
  Link2,
  List,
  Mail,
  Paperclip,
  Send,
  ShieldCheck,
  Underline,
  Upload,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/confirm-dialog";
import { FormField, Input, Textarea } from "@/components/ui/form-field";
import { PageHeader } from "@/components/ui/page-header";
import { QueryState } from "@/components/ui/query-state";
import { SectionCard } from "@/components/ui/section-card";
import { useAuth } from "@/context/auth-context";
import { useCategories } from "@/hooks/use-categories";
import { useCompanies } from "@/hooks/use-companies";
import {
  useDraftCommunication,
  useScheduleCommunication,
  useSendCommunication,
  useTestDispatchCommunication,
} from "@/hooks/use-communications";
import { useEmailTemplates } from "@/hooks/use-email-templates";
import { EmailSendFormValues, emailSendSchema } from "@/schemas/email-send-schema";
import { EmailAttachment } from "@/types";

const allowedExtensions = [".pdf", ".docx", ".xlsx", ".png", ".jpg", ".jpeg"];
const maxFileSizeBytes = 10 * 1024 * 1024;

type UploadedFile = {
  name: string;
  size: number;
  type: string;
  base64: string;
};

function formatDatetimeForInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function formatReadableDatetime(dtStr: string): string {
  if (!dtStr) return "";
  const d = new Date(dtStr);
  if (isNaN(d.getTime())) return dtStr;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function SendRegulatoryUpdateContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showRecipientsDialog, setShowRecipientsDialog] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState(() => {
    const nextHour = new Date(Date.now() + 60 * 60 * 1000);
    nextHour.setMinutes(0, 0, 0);
    return formatDatetimeForInput(nextHour);
  });
  const [testEmailAddress, setTestEmailAddress] = useState(user?.email || "partner@reconepal.com");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: companies = [], isLoading: companiesLoading, isError: companiesError } = useCompanies();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: templates = [] } = useEmailTemplates();

  const sendMutation = useSendCommunication();
  const draftMutation = useDraftCommunication();
  const scheduleMutation = useScheduleCommunication();
  const testMutation = useTestDispatchCommunication();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<EmailSendFormValues>({
    resolver: zodResolver(emailSendSchema),
    defaultValues: {
      subject: "",
      templateId: "",
      body: "",
      categories: [],
    },
  });

  // Pre-fill from query params if directed from Templates or Preview
  useEffect(() => {
    const templateIdParam = searchParams.get("templateId");
    const categoriesParam = searchParams.get("categories");

    if (templateIdParam && templates.length > 0) {
      const template = templates.find((item) => String(item.id) === templateIdParam);
      if (template) {
        setValue("templateId", templateIdParam);
        setValue("subject", template.subject);
        setValue("body", template.body);
      }
    }

    if (categoriesParam) {
      const cats = categoriesParam.split(",").filter(Boolean);
      if (cats.length > 0) {
        setValue("categories", cats);
      }
    }
  }, [searchParams, templates, setValue]);

  const subject = useWatch({ control, name: "subject" });
  const templateId = useWatch({ control, name: "templateId" });
  const body = useWatch({ control, name: "body" });
  const rawCategories = useWatch({ control, name: "categories" });
  const selectedCategories = useMemo(() => rawCategories || [], [rawCategories]);

  const recipients = useMemo(() => {
    if (selectedCategories.length === 0) return [];
    const matches = companies.filter(
      (company) =>
        company.status === "Active" &&
        company.categories.some((category) => selectedCategories.includes(category))
    );
    const seen = new Set<string>();
    return matches.filter((company) => {
      if (seen.has(company.email)) return false;
      seen.add(company.email);
      return true;
    });
  }, [companies, selectedCategories]);

  const toggleCategory = (category: string) => {
    const next = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category];
    setValue("categories", next, { shouldValidate: true });
  };

  const applyTemplate = (id: string) => {
    setValue("templateId", id);
    const template = templates.find((item) => String(item.id) === id);
    if (template) {
      setValue("subject", template.subject, { shouldValidate: true });
      setValue("body", template.body, { shouldValidate: true });
    }
  };

  const insertToken = (token: string) => {
    const current = getValues("body") || "";
    setValue("body", current + (current ? " " : "") + token, { shouldValidate: true });
  };

  const applyFormatting = (tag: "bold" | "italic" | "underline" | "link" | "list") => {
    const current = getValues("body") || "";
    let addition = "";
    switch (tag) {
      case "bold":
        addition = "**Statutory Reference: Section / Notification No.**";
        break;
      case "italic":
        addition = "*Action required on or before statutory due date.*";
        break;
      case "underline":
        addition = "<u>Important Compliance Directive</u>";
        break;
      case "link":
        addition = "[Official Gazette / Circular Document Link](https://)";
        break;
      case "list":
        addition = "\n1. Key Amendment / Provision\n2. Applicability & Thresholds\n3. Compliance Procedure & Deadlines";
        break;
    }
    setValue("body", current ? `${current}\n${addition}` : addition, { shouldValidate: true });
  };

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const invalid: string[] = [];
    const oversized: string[] = [];

    Array.from(list).forEach((file) => {
      const lower = file.name.toLowerCase();
      const isValidExtension = allowedExtensions.some((ext) => lower.endsWith(ext));
      if (!isValidExtension) {
        invalid.push(file.name);
      } else if (file.size > maxFileSizeBytes) {
        oversized.push(file.name);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          const base64Data = res.includes(",") ? res.split(",")[1] : res;
          setFiles((prev) => [
            ...prev.filter((item) => item.name !== file.name),
            {
              name: file.name,
              size: file.size,
              type: file.type || "application/octet-stream",
              base64: base64Data,
            },
          ]);
        };
        reader.readAsDataURL(file);
      }
    });

    if (invalid.length > 0) {
      setFileError(`Unsupported file formats: ${invalid.join(", ")}`);
    } else if (oversized.length > 0) {
      setFileError(`Files exceed 10MB individual limit: ${oversized.join(", ")}`);
    } else {
      setFileError(null);
    }
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
  };

  const formatSize = (size: number) => `${(size / 1024).toFixed(1)} KB`;

  const getPayloadAttachments = (): EmailAttachment[] | undefined => {
    if (files.length === 0) return undefined;
    return files.map((f) => ({
      filename: f.name,
      content: f.base64,
      contentType: f.type,
    }));
  };

  const handleSaveDraft = () => {
    const values = getValues();
    if (!values.subject || !values.body) {
      toast.error("Enter a subject and circular body before saving as draft");
      return;
    }
    draftMutation.mutate(
      {
        subject: values.subject,
        body: values.body,
        categories: values.categories,
        attachments: getPayloadAttachments(),
      },
      {
        onSuccess: () => toast.success("Statutory circular draft saved successfully"),
        onError: () => toast.error("Failed to save draft"),
      }
    );
  };

  const handleScheduleConfirm = () => {
    const values = getValues();
    if (!scheduleDateTime) {
      toast.error("Please specify a scheduled dispatch date & time");
      return;
    }
    if (new Date(scheduleDateTime).getTime() <= Date.now()) {
      toast.error("Scheduled time must be in the future");
      return;
    }
    if (!values.subject || !values.body || values.categories.length === 0) {
      toast.error("Complete circular subject, body, and practice discipline selection before scheduling");
      return;
    }
    scheduleMutation.mutate(
      {
        subject: values.subject,
        body: values.body,
        categories: values.categories,
        scheduledFor: new Date(scheduleDateTime).toISOString(),
        attachments: getPayloadAttachments(),
      },
      {
        onSuccess: () => {
          toast.success(`Statutory broadcast scheduled for ${formatReadableDatetime(scheduleDateTime)}`);
          setShowScheduleDialog(false);
          reset();
          setFiles([]);
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Failed to schedule statutory circular";
          toast.error(msg);
        },
      }
    );
  };

  const applyPresetTime = (preset: "1h" | "tomorrow9" | "tomorrow14" | "monday") => {
    const now = new Date();
    let target = new Date();
    if (preset === "1h") {
      target = new Date(now.getTime() + 60 * 60 * 1000);
    } else if (preset === "tomorrow9") {
      target.setDate(now.getDate() + 1);
      target.setHours(9, 0, 0, 0);
    } else if (preset === "tomorrow14") {
      target.setDate(now.getDate() + 1);
      target.setHours(14, 0, 0, 0);
    } else if (preset === "monday") {
      const day = now.getDay();
      const diff = day === 0 ? 1 : 8 - day;
      target.setDate(now.getDate() + diff);
      target.setHours(10, 0, 0, 0);
    }
    setScheduleDateTime(formatDatetimeForInput(target));
  };

  const handleTestDispatch = () => {
    const values = getValues();
    if (!testEmailAddress) {
      toast.error("Please provide a recipient email address for test dispatch");
      return;
    }
    if (!values.subject || !values.body) {
      toast.error("Add a circular subject and message body before sending test preview");
      return;
    }

    testMutation.mutate(
      {
        subject: values.subject,
        body: values.body,
        testEmail: testEmailAddress,
        attachments: getPayloadAttachments(),
      },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          setShowTestDialog(false);
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Failed to send test preview email";
          toast.error(msg);
        },
      }
    );
  };

  const onSubmit = (values: EmailSendFormValues) => {
    if (recipients.length === 0) {
      toast.error("No corporate clients match the selected practice disciplines");
      return;
    }
    sendMutation.mutate(
      {
        subject: values.subject,
        body: values.body,
        categories: values.categories,
        attachments: getPayloadAttachments(),
      },
      {
        onSuccess: () => {
          toast.success(
            `Statutory bulletin dispatched with ${files.length} attachment(s) to ${recipients.length} corporate client(s)`
          );
          reset();
          setFiles([]);
          setFileError(null);
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Failed to dispatch statutory circular";
          toast.error(msg);
        },
      }
    );
  };

  const isSending = sendMutation.isPending;
  const isSavingDraft = draftMutation.isPending;
  const isScheduling = scheduleMutation.isPending;
  const isTesting = testMutation.isPending;

  return (
    <section className="space-y-5">
      <PageHeader
        title="Send Email Update"
        description="Compose updates, choose target client categories, attach documents, and send now or schedule for later."
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-5 lg:grid-cols-[1.45fr_0.85fr]">
          <SectionCard
            title="Compose Message"
            description="Enter subject, load a template (optional), and write your email content."
          >
            <div className="grid gap-3.5">
              <FormField label="Subject" required error={errors.subject?.message}>
                <Controller
                  control={control}
                  name="subject"
                  render={({ field }) => (
                    <Input {...field} placeholder="e.g. Statutory Deadline: Advance Tax Deposit Notice" />
                  )}
                />
              </FormField>

              <FormField label="Email Template (Optional)">
                <select
                  value={templateId}
                  onChange={(event) => applyTemplate(event.target.value)}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-800"
                >
                  <option value="">Select a saved template (optional)</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.templateName} — {template.subject}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Message Content" required error={errors.body?.message}>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-t-md border border-b-0 border-border bg-slate-50 dark:bg-slate-800/40 p-1.5">
                    <div className="flex items-center gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => applyFormatting("bold")}
                        title="Bold Section"
                      >
                        <Bold className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => applyFormatting("italic")}
                        title="Italicize"
                      >
                        <Italic className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => applyFormatting("underline")}
                        title="Underline"
                      >
                        <Underline className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => applyFormatting("link")}
                        title="Gazette Link"
                      >
                        <Link2 className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => applyFormatting("list")}
                        title="Numbered Points"
                      >
                        <List className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Insert Tokens:</span>
                      <button
                        type="button"
                        onClick={() => insertToken("{{contactPerson}}")}
                        className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary hover:bg-muted"
                      >
                        + &#123;&#123;contactPerson&#125;&#125;
                      </button>
                      <button
                        type="button"
                        onClick={() => insertToken("{{companyName}}")}
                        className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary hover:bg-muted"
                      >
                        + &#123;&#123;companyName&#125;&#125;
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
                        placeholder="Dear {{contactPerson}},\n\nKindly note the following regulatory directives issued for {{companyName}}...\n\n1. Provision Summary\n2. Compliance Mandate & Due Date"
                        className="rounded-t-none font-sans text-xs leading-relaxed"
                      />
                    )}
                  />
                </div>
              </FormField>

              <FormField label="Target Industry Sectors" required error={errors.categories?.message}>
                <QueryState
                  isLoading={categoriesLoading}
                  isEmpty={!categoriesLoading && categories.length === 0}
                  emptyTitle="No industry sectors defined"
                  emptyDescription="Create industry sectors before sending updates."
                  skeletonCount={4}
                >
                  <div className="grid gap-2 sm:grid-cols-2">
                    {categories.map((category) => {
                      const active = selectedCategories.includes(category.category);
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.category)}
                          className={
                            "flex items-center justify-between rounded-md border p-2 text-left text-xs transition-colors cursor-pointer " +
                            (active
                              ? "border-slate-800 bg-slate-100 text-slate-900 font-bold shadow-2xs"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900 font-medium")
                          }
                        >
                          <span>{category.category}</span>
                          {active ? (
                            <Badge variant="default" className="text-[9px] py-0 font-bold">Included</Badge>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-semibold">+ Add</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </QueryState>
              </FormField>

              <FormField label="Document Attachments (PDF, DOCX, XLSX)" required={false}>
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleFiles(event.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Upload className="h-4 w-4 text-slate-700" />
                  <p className="font-bold text-slate-900 text-xs">Drag &amp; drop files or click to browse</p>
                  <p className="text-[10px] text-slate-500 font-medium">PDF, DOCX, XLSX, PNG, JPG (max 10MB per file)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(event) => handleFiles(event.target.files)}
                  />
                </div>
                {fileError ? <p className="text-xs text-rose-600 font-medium mt-1">{fileError}</p> : null}
                {files.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {files.map((file) => (
                      <div
                        key={file.name}
                        className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-3 w-3 text-slate-600 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900">{file.name}</p>
                            <p className="text-[10px] font-mono text-slate-500">{formatSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(file.name)}
                          className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </FormField>
            </div>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Target Audience" description="Active clients matching the selected industries.">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-slate-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Matched Clients</span>
                  </div>
                  <span className="font-mono font-bold text-xs bg-slate-200 text-slate-900 px-2 py-0.5 rounded">
                    {recipients.length} client(s)
                  </span>
                </div>

                <QueryState
                  isLoading={companiesLoading}
                  isError={companiesError}
                  errorDescription="Could not load clients."
                  isEmpty={!companiesLoading && !companiesError && recipients.length === 0}
                  emptyTitle="No clients in selection"
                  emptyDescription="Select at least one industry sector above."
                >
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {recipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-2 text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate font-bold text-slate-900">{recipient.companyName}</p>
                          <p className="truncate text-[11px] font-mono text-slate-600">{recipient.email}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-[10px] font-semibold">
                          {recipient.categories.slice(0, 1).join(", ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </QueryState>
              </div>
            </SectionCard>

            <SectionCard title="Summary" description="Overview before sending.">
              <div className="space-y-1.5 text-xs divide-y divide-slate-100">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-600 font-medium">Subject</span>
                  <span className="font-bold text-slate-900 truncate max-w-[170px] text-right">{subject || "—"}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-600 font-medium">Industries</span>
                  <span className="font-mono font-bold text-slate-900">{selectedCategories.length} selected</span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-600 font-medium">Recipients</span>
                  <span className="font-mono font-bold text-slate-900">{recipients.length} clients</span>
                </div>
                <div className="flex items-center justify-between pt-1.5">
                  <span className="text-slate-600 font-medium">Attachments</span>
                  <span className="font-mono font-bold text-slate-900">
                    {files.length > 0 ? `${files.length} file(s)` : "None"}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end border-t border-slate-200 pt-4">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setShowRecipientsDialog(true)}
            disabled={recipients.length === 0}
            className="font-semibold text-slate-800"
          >
            <Eye className="h-3.5 w-3.5" />
            Inspect Recipients ({recipients.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setShowTestDialog(true)}
            disabled={isTesting || isSending || !body || !subject}
            className="border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 font-semibold"
          >
            <FlaskConical className="h-3.5 w-3.5 text-amber-700" />
            Send Test Email
          </Button>
          <Button variant="outline" size="sm" type="button" onClick={handleSaveDraft} disabled={isSavingDraft || isSending || isScheduling} className="font-semibold text-slate-800">
            {isSavingDraft ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setShowScheduleDialog(true)}
            disabled={isSending || isSavingDraft || isScheduling || !body || !subject || recipients.length === 0}
            className="font-semibold text-slate-800"
          >
            <Calendar className="h-3.5 w-3.5" />
            Schedule Email
          </Button>
          <Button size="sm" type="submit" disabled={isSending || isSavingDraft || isScheduling || !body || !subject || recipients.length === 0} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
            <Send className="h-3.5 w-3.5" />
            {isSending ? "Sending..." : "Send Now"}
          </Button>
        </div>
      </form>

      {/* Inline Recipient Inspection Modal */}
      <Dialog open={showRecipientsDialog} onOpenChange={setShowRecipientsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Matched Corporate Client Recipients ({recipients.length})</DialogTitle>
          <div className="mt-3 space-y-3 text-xs">
            <p className="text-muted-foreground">
              These corporate client accounts are mapped to the selected practice disciplines (
              <span className="font-semibold text-foreground">{selectedCategories.join(", ")}</span>) and will receive this bulletin.
            </p>
            <div className="max-h-72 overflow-y-auto divide-y divide-border border border-border rounded-md">
              {recipients.map((r) => (
                <div key={r.id} className="p-2 flex items-center justify-between hover:bg-muted/30">
                  <div>
                    <p className="font-bold text-foreground">{r.companyName}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{r.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {r.categories.join(", ")}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-1">
              <DialogClose asChild>
                <Button size="sm">Done</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Preview Email Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-md">
          <DialogTitle>Send Test Preview Dispatch</DialogTitle>
          <div className="mt-3 space-y-3 text-xs">
            <p className="text-muted-foreground">
              Send a test delivery with all attached PDFs to your inbox to inspect styling and layout before broadcasting to {recipients.length} clients.
            </p>
            <FormField label="Target Preview Email Address" required>
              <Input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="partner@reconepal.com"
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button variant="outline" size="sm">Cancel</Button>
              </DialogClose>
              <Button size="sm" onClick={handleTestDispatch} disabled={!testEmailAddress || isTesting}>
                <FlaskConical className="h-3.5 w-3.5" />
                {isTesting ? "Sending..." : "Dispatch Test Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Schedule Dialog with Date & Time Picker */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-md">
          <DialogTitle>Schedule Circular Dispatch</DialogTitle>
          <div className="mt-3 space-y-3.5 text-xs">
            <p className="text-muted-foreground">
              Choose the exact date and time to automatically broadcast this circular to {recipients.length} corporate client(s).
            </p>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Quick Dispatch Presets
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPresetTime("1h")}
                  className="rounded border border-border bg-card p-2 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <p className="font-bold text-foreground">In 1 Hour</p>
                  <p className="text-[10px] text-muted-foreground">Quick review buffer</p>
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetTime("tomorrow9")}
                  className="rounded border border-border bg-card p-2 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <p className="font-bold text-foreground">Tomorrow 09:00 AM</p>
                  <p className="text-[10px] text-muted-foreground">Opening bell notice</p>
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetTime("tomorrow14")}
                  className="rounded border border-border bg-card p-2 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <p className="font-bold text-foreground">Tomorrow 02:00 PM</p>
                  <p className="text-[10px] text-muted-foreground">Mid-day update</p>
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetTime("monday")}
                  className="rounded border border-border bg-card p-2 text-left hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <p className="font-bold text-foreground">Next Monday 10:00 AM</p>
                  <p className="text-[10px] text-muted-foreground">Start of week briefing</p>
                </button>
              </div>
            </div>

            {/* Custom Datetime Input */}
            <FormField label="Exact Scheduled Date &amp; Time" required>
              <Input
                type="datetime-local"
                value={scheduleDateTime}
                min={formatDatetimeForInput(new Date())}
                onChange={(e) => setScheduleDateTime(e.target.value)}
              />
            </FormField>

            {scheduleDateTime ? (
              <div className="rounded-md border border-border bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Scheduled Dispatch:</span>
                <p className="font-bold text-foreground mt-0.5">
                  📅 {formatReadableDatetime(scheduleDateTime)}
                </p>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-1 border-t border-border">
              <DialogClose asChild>
                <Button variant="outline" size="sm">Cancel</Button>
              </DialogClose>
              <Button size="sm" onClick={handleScheduleConfirm} disabled={!scheduleDateTime || isScheduling}>
                <Clock className="h-3.5 w-3.5" />
                {isScheduling ? "Scheduling..." : "Confirm Schedule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default function SendRegulatoryUpdatePage() {
  return (
    <Suspense fallback={null}>
      <SendRegulatoryUpdateContent />
    </Suspense>
  );
}
