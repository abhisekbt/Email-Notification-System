"use client";

import { AlertCircle, Calendar, CheckCircle2, Eye, History, Mail, Paperclip, RotateCcw, ShieldCheck, Users, XCircle } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { useCommunication, useCommunications } from "@/hooks/use-communications";
import { useTableQuery } from "@/hooks/use-table-query";
import { Communication, CommunicationStatus } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

const statusVariant: Record<CommunicationStatus, "success" | "warning" | "default" | "destructive"> = {
  Sent: "success",
  Scheduled: "warning",
  Draft: "default",
  Failed: "destructive",
};

export default function CommunicationHistoryPage() {
  const { data: communications = [], isLoading, isError } = useCommunications();
  const [statusFilter, setStatusFilter] = React.useState<"" | CommunicationStatus>("");
  const [dateFilter, setDateFilter] = React.useState("");
  const [active, setActive] = React.useState<Communication | null>(null);

  const { data: detailedActive, isLoading: isDetailLoading } = useCommunication(active?.id || 0);

  const availableMonths = React.useMemo(() => {
    const months = new Set<string>();
    communications.forEach((comm) => {
      const d = comm.sentDate || comm.scheduledFor;
      if (d && d.length >= 7) {
        months.add(d.slice(0, 7));
      }
    });
    return Array.from(months).sort().reverse();
  }, [communications]);

  const { search, setSearch, page, setPage, paged, filtered, totalPages } = useTableQuery<Communication>({
    data: communications,
    searchKeys: ["subject", "body", "categories"],
    filters: {
      ...(statusFilter ? { status: (item: Communication) => item.status === statusFilter } : {}),
      ...(dateFilter
        ? { date: (item: Communication) => (item.sentDate ?? item.scheduledFor ?? "").startsWith(dateFilter) }
        : {}),
    },
    pageSize: 8,
  });

  const totalRecipients = filtered.reduce((sum, item) => sum + (item.recipientCount || 0), 0);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDateFilter("");
  };

  const hasActiveFilters = Boolean(search || statusFilter || dateFilter);

  const columns: ColumnDef<Communication>[] = [
    {
      accessorKey: "subject",
      header: "Subject & Preview",
      cell: ({ row }) => (
        <div className="space-y-0.5 max-w-[300px]">
          <span className="font-bold text-slate-900 text-xs">{row.original.subject}</span>
          <p className="text-[11px] text-slate-600 font-medium truncate">{row.original.body}</p>
        </div>
      ),
    },
    {
      accessorKey: "categories",
      header: "Target Industries",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categories.map((category) => (
            <Badge key={category} variant="secondary" className="text-[10px] py-0 px-1.5 font-semibold">
              {category}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "recipientCount",
      header: "Recipients",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-slate-900">
          {row.original.recipientCount} clients
        </span>
      ),
    },
    {
      id: "date",
      header: "Date / Schedule",
      cell: ({ row }) => {
        const item = row.original;
        if (item.status === "Scheduled" && item.scheduledFor) {
          const d = new Date(item.scheduledFor);
          const formatted = !isNaN(d.getTime())
            ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
            : item.scheduledFor;
          return <span className="font-mono text-[11px] text-amber-950 font-bold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">🕒 {formatted}</span>;
        }
        return (
          <span className="font-mono text-[11px] text-slate-700 font-semibold">
            {item.sentDate ?? item.scheduledFor ?? "Draft"}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>,
    },
    {
      id: "actions",
      header: "Details",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs font-semibold text-slate-800 hover:text-slate-900" onClick={() => setActive(row.original)}>
          <Eye className="h-3 w-3" />
          View
        </Button>
      ),
    },
  ];

  return (
    <section className="space-y-5">
      <PageHeader
        title="Sent History"
        description="Complete log of sent, scheduled, and draft email broadcasts."
      />

      <TableToolbar
        title="Email Delivery Log"
        description={`Showing ${filtered.length} entries • ${totalRecipients} total recipients`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search subjects, text, or categories..."
            className="w-full sm:w-64"
          />
          <FilterDropdown
            label="Status"
            className="w-full sm:w-36"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "" | CommunicationStatus)}
          >
            <option value="">All Statuses</option>
            <option value="Sent">Sent</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Draft">Draft</option>
            <option value="Failed">Failed</option>
          </FilterDropdown>
          <FilterDropdown
            label="Month"
            className="w-full sm:w-44"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          >
            <option value="">All Months</option>
            {availableMonths.map((m) => {
              const [year, month] = m.split("-");
              const dateObj = new Date(Number(year), Number(month) - 1, 1);
              const label = isNaN(dateObj.getTime())
                ? m
                : dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric" });
              return (
                <option key={m} value={m}>
                  {label}
                </option>
              );
            })}
          </FilterDropdown>
          {hasActiveFilters ? (
            <Button variant="outline" size="sm" onClick={resetFilters} className="font-semibold text-slate-800">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          ) : null}
        </div>
      </TableToolbar>

      <DataTable
        columns={columns}
        data={paged}
        isLoading={isLoading}
        pageSize={8}
        emptyState={
          <EmptyState
            title={isError ? "Could not load history" : "No messages found"}
            description={isError ? "Please verify database connection." : "Sent or scheduled emails will be listed here."}
            icon={<Calendar className="h-5 w-5" />}
          />
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-700 font-semibold font-mono">
          Showing {filtered.length} message(s) • {totalRecipients} total recipients
        </p>
        <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <Dialog open={Boolean(active)} onOpenChange={(open) => (open ? null : setActive(null))}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogTitle className="text-sm font-bold text-slate-900">
            {active?.subject}
          </DialogTitle>
          <div className="mt-4 space-y-4 text-xs">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Status</span>
                <div className="mt-1">
                  {active?.status ? (
                    <Badge variant={statusVariant[active.status]}>{active.status}</Badge>
                  ) : null}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Recipients</span>
                <p className="mt-0.5 font-mono font-bold text-slate-900">{active?.recipientCount} Clients</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500">Date Sent / Scheduled</span>
                <p className="mt-0.5 font-mono font-bold text-slate-900">
                  {active?.sentDate
                    ? `Sent: ${active.sentDate}`
                    : active?.scheduledFor
                    ? `Scheduled: ${new Date(active.scheduledFor).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
                    : "Draft"}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-3">
              <span className="text-[10px] uppercase font-bold text-slate-600">Target Industries</span>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {active?.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-3">
              <span className="text-[10px] uppercase font-bold text-slate-600">Message Content</span>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-900 font-sans text-xs bg-slate-50 p-3 rounded border border-slate-200">
                {active?.body}
              </p>
            </div>

            {active?.attachments && active.attachments.length > 0 ? (
              <div className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-600 flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-slate-700" />
                  Attached Files ({active.attachments.length})
                </span>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {active.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                    >
                      <Paperclip className="h-3 w-3 text-slate-500" />
                      <span className="font-bold">{att.filename}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Recipient Delivery Breakdown */}
            <div className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-600">
                  Delivery Status per Client ({detailedActive?.recipients?.length || 0} clients)
                </span>
                {isDetailLoading ? <span className="text-[10px] text-slate-500">Loading delivery details...</span> : null}
              </div>

              {detailedActive?.recipients && detailedActive.recipients.length > 0 ? (
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded">
                  {detailedActive.recipients.map((rec) => (
                    <div key={rec.id} className="p-2 flex items-center justify-between text-xs hover:bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-900">{rec.companyName || "Client"}</p>
                        <p className="font-mono text-[11px] text-slate-600">{rec.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {rec.status === "Sent" ? (
                          <Badge variant="success" className="gap-1 text-[10px]">
                            <CheckCircle2 className="h-3 w-3" />
                            Delivered
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 text-[10px]">
                            <XCircle className="h-3 w-3" />
                            Failed {rec.error ? `(${rec.error})` : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  No individual recipient logs recorded yet for this draft or scheduled message.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
