"use client";

import { Eye, FileText, Pencil, Plus, SendHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { QueryState } from "@/components/ui/query-state";
import { SearchInput } from "@/components/ui/search-input";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { EmailTemplateForm } from "@/features/email-templates/email-template-form";
import {
  useCreateEmailTemplate,
  useDeleteEmailTemplate,
  useEmailTemplates,
  useUpdateEmailTemplate,
} from "@/hooks/use-email-templates";
import { EmailTemplate } from "@/types";
import { EmailTemplateFormValues } from "@/schemas/email-template-schema";

export default function EmailTemplatesPage() {
  const { data: templates = [], isLoading, isError } = useEmailTemplates();
  const createTemplate = useCreateEmailTemplate();
  const updateTemplate = useUpdateEmailTemplate();
  const deleteTemplate = useDeleteEmailTemplate();

  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<EmailTemplate | null>(null);
  const [deleting, setDeleting] = React.useState<EmailTemplate | null>(null);
  const [previewing, setPreviewing] = React.useState<EmailTemplate | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);

  const handleSave = (values: EmailTemplateFormValues, existing?: EmailTemplate) => {
    if (existing) {
      updateTemplate.mutate(
        { id: existing.id, payload: values },
        {
          onSuccess: () => {
            toast.success(`Template "${values.templateName}" updated successfully.`);
            setEditing(null);
          },
          onError: () => toast.error("Failed to update template."),
        }
      );
    } else {
      createTemplate.mutate(values, {
        onSuccess: () => {
          toast.success(`Template "${values.templateName}" created successfully.`);
          setShowAdd(false);
        },
        onError: () => toast.error("Failed to create template."),
      });
    }
  };

  const handleDelete = (template: EmailTemplate) => {
    deleteTemplate.mutate(template.id, {
      onSuccess: () => {
        toast.success(`Template "${template.templateName}" removed.`);
        setDeleting(null);
      },
      onError: () => toast.error("Failed to remove template."),
    });
  };

  const filtered = templates.filter((template) =>
    [template.templateName, template.subject, template.body].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="space-y-5">
      <PageHeader
        title="Email Templates"
        description="Create and manage reusable email templates with personalized tags to quickly send updates."
        action={
          <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1.5 font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs">
            <Plus className="h-3.5 w-3.5" />
            Create Template
          </Button>
        }
      />

      <TableToolbar
        title="All Templates"
        description={`Showing ${filtered.length} template(s)`}
      >
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search template title, subject, or content..."
          className="w-full sm:w-80"
        />
      </TableToolbar>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        errorDescription="Could not load templates. Please try again."
        isEmpty={!isLoading && !isError && filtered.length === 0}
        emptyTitle="No templates found"
        emptyDescription="Create an email template to save time composing repetitive messages."
        emptyAction={
          <Button onClick={() => setShowAdd(true)} size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
            <Plus className="h-3.5 w-3.5" />
            Create Template
          </Button>
        }
        skeletonCount={3}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((template) => (
            <Card key={template.id} className="flex flex-col justify-between border border-slate-200 bg-white shadow-xs">
              <CardHeader className="p-4 border-b border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-800" />
                    <CardTitle className="text-xs font-bold text-slate-900">{template.templateName}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Template</Badge>
                </div>
                <CardDescription className="text-[11px] font-mono mt-0.5 text-slate-600 font-semibold">Created {template.createdDate}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{template.subject}</p>
                  <p className="mt-1.5 line-clamp-3 text-xs text-slate-700 leading-relaxed font-medium">{template.body}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs font-semibold text-slate-800 hover:text-slate-900" onClick={() => setPreviewing(template)}>
                      <Eye className="h-3 w-3" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs font-semibold text-slate-800 hover:text-slate-900" onClick={() => setEditing(template)}>
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs text-rose-700 hover:bg-rose-50 hover:border-rose-300 font-semibold"
                      onClick={() => setDeleting(template)}
                      title="Delete Template"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button size="sm" variant="default" className="h-7 text-xs gap-1 font-bold bg-slate-900 hover:bg-slate-800 text-white" asChild>
                    <Link href={`/send-regulatory-update?templateId=${template.id}`}>
                      <SendHorizontal className="h-3 w-3" />
                      Use in Email
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </QueryState>

      {/* Add Template Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Create Email Template</DialogTitle>
          <div className="mt-3">
            <EmailTemplateForm
              mode="add"
              onSubmit={(values) => handleSave(values)}
              onCancel={() => setShowAdd(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(open) => (open ? null : setEditing(null))}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Edit Email Template</DialogTitle>
          <div className="mt-3">
            {editing ? (
              <EmailTemplateForm
                mode="edit"
                defaultValues={editing}
                onSubmit={(values) => handleSave(values, editing)}
                onCancel={() => setEditing(null)}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={Boolean(previewing)} onOpenChange={(open) => (open ? null : setPreviewing(null))}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="text-sm font-bold text-slate-900">{previewing?.templateName}</DialogTitle>
          <div className="mt-3 space-y-3 text-xs">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-600">Subject Line</span>
              <p className="mt-0.5 text-xs font-bold text-slate-900">{previewing?.subject}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <span className="text-[10px] uppercase font-bold text-slate-600">Message Body</span>
              <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-900 bg-slate-50 p-3 rounded border border-slate-200">
                {previewing?.body}
              </p>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              {previewing ? (
                <Button size="sm" asChild className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
                  <Link href={`/send-regulatory-update?templateId=${previewing.id}`}>
                    <SendHorizontal className="h-3.5 w-3.5 mr-1" />
                    Use in Email
                  </Link>
                </Button>
              ) : null}
              <Button variant="outline" size="sm" onClick={() => setPreviewing(null)} className="font-semibold text-slate-800">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => (open ? null : setDeleting(null))}
        title={`Delete "${deleting?.templateName ?? ""}"?`}
        description="This template will no longer be available when composing emails."
        onConfirm={() => deleting && handleDelete(deleting)}
      />
    </section>
  );
}
