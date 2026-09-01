"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Download,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  SendHorizontal,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/confirm-dialog";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  FilterDropdown,
  SearchInput,
  TableToolbar,
} from "@/components/ui/table-toolbar";
import { CompanyAddDialog } from "@/features/companies/company-add-dialog";
import { CompanyForm } from "@/features/companies/company-form";
import {
  useCompanies,
  useCreateCompany,
  useDeleteCompany,
  useUpdateCompany,
} from "@/hooks/use-companies";
import { CompanyFormValues } from "@/schemas/company-schema";
import { Company, CompanyStatus } from "@/types";

const statusVariant: Record<CompanyStatus, "success" | "default"> = {
  Active: "success",
  Inactive: "default",
};

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | CompanyStatus>("");
  const [page, setPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [viewing, setViewing] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState<Company | null>(null);

  const { data: companies = [], isLoading, isError } = useCompanies();
  const createCompany = useCreateCompany();
  const updateCompany = useUpdateCompany();
  const deleteCompany = useDeleteCompany();

  const handleAddCompany = (values: CompanyFormValues) => {
    createCompany.mutate(values, {
      onSuccess: () => {
        toast.success(`Client "${values.companyName}" added successfully.`);
        setShowAddDialog(false);
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to add client.";
        toast.error(msg);
      },
    });
  };

  const handleUpdateCompany = (values: CompanyFormValues) => {
    if (!editing) return;
    updateCompany.mutate(
      { id: editing.id, payload: values },
      {
        onSuccess: () => {
          toast.success(`Client details for "${values.companyName}" updated successfully.`);
          setEditing(null);
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update client details.";
          toast.error(msg);
        },
      }
    );
  };

  const handleDelete = (company: Company) => {
    deleteCompany.mutate(company.id, {
      onSuccess: () => {
        toast.success(`Client "${company.companyName}" removed.`);
        setDeleting(null);
      },
      onError: () => toast.error("Failed to delete client."),
    });
  };

  const filtered = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        company.companyName.toLowerCase().includes(search.toLowerCase()) ||
        company.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        company.email.toLowerCase().includes(search.toLowerCase()) ||
        company.pan.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || company.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [companies, search, statusFilter]);

  const paged = useMemo(() => {
    const start = (page - 1) * 8;
    return filtered.slice(start, start + 8);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / 8);

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.error("No client records available to export");
      return;
    }
    const headers = [
      "ID",
      "Company Name",
      "Contact Person",
      "Email",
      "Alternative Email",
      "Mobile",
      "PAN",
      "Industry",
      "Status",
      "Categories",
      "Created Date",
      "Address",
    ];
    const rows = filtered.map((c) => [
      c.id,
      `"${(c.companyName || "").replace(/"/g, '""')}"`,
      `"${(c.contactPerson || "").replace(/"/g, '""')}"`,
      `"${c.email || ""}"`,
      `"${c.alternativeEmail || ""}"`,
      `"${c.mobile || ""}"`,
      `"${c.pan || ""}"`,
      `"${c.industry || ""}"`,
      `"${c.status || ""}"`,
      `"${(c.categories || []).join("; ")}"`,
      `"${c.createdDate || ""}"`,
      `"${(c.address || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Clients_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filtered.length} client record(s) to CSV`);
  };

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "companyName",
      header: "Client Name",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 text-xs">{row.original.companyName}</span>
          <p className="text-[11px] text-slate-600 font-medium">{row.original.industry}</p>
        </div>
      ),
    },
    {
      accessorKey: "contactPerson",
      header: "Primary Contact",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-900 text-xs">{row.original.contactPerson}</span>
          <p className="text-[11px] font-mono text-slate-600">{row.original.email}</p>
        </div>
      ),
    },
    {
      id: "pan",
      header: "PAN Number",
      cell: ({ row }) => (
        <div className="font-mono text-xs font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
          {row.original.pan}
        </div>
      ),
    },
    {
      accessorKey: "categories",
      header: "Assigned Industries",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {row.original.categories.map((category) => (
            <Badge key={category} variant="secondary" className="text-[10px] py-0 px-1.5 font-semibold">
              {category}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs font-semibold text-slate-800 hover:text-slate-900"
            onClick={() => setViewing(row.original)}
            title="View Details"
          >
            <Eye className="h-3 w-3" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs font-semibold text-slate-800 hover:text-slate-900"
            onClick={() => setEditing(row.original)}
            title="Edit Client Details"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs text-rose-700 hover:bg-rose-50 hover:border-rose-300 font-semibold"
            onClick={() => setDeleting(row.original)}
            title="Remove Client"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-5">
      <PageHeader
        title="Clients Directory"
        description="Manage your client list, contact information, PAN, and assigned industries."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={filtered.length === 0} className="font-semibold text-slate-800">
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
              <Plus className="h-3.5 w-3.5" />
              Add Client
            </Button>
          </div>
        }
      />

      <TableToolbar>
        <SearchInput
          placeholder="Search by company name, contact, email, or PAN..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <div className="flex items-center gap-2">
          <FilterDropdown
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "" | CompanyStatus)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active (Receives Emails)</option>
            <option value="Inactive">Inactive (Excluded)</option>
          </FilterDropdown>
          {search || statusFilter ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
              className="font-semibold text-slate-800"
            >
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
            title={isError ? "Could not load clients" : "No clients found"}
            description={isError ? "Please check database connection." : "Add a new client to get started."}
            icon={<Building2 className="h-5 w-5" />}
          />
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-700 font-semibold font-mono">
          Showing {filtered.length} of {companies.length} clients
        </p>
        <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <CompanyAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddCompany}
        isSubmitting={createCompany.isPending}
      />

      {/* Edit Dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(open) => (open ? null : setEditing(null))}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Edit Client Details</DialogTitle>
          {editing ? (
            <CompanyForm
              defaultValues={{
                companyName: editing.companyName,
                contactPerson: editing.contactPerson,
                email: editing.email,
                alternativeEmail: editing.alternativeEmail ?? "",
                mobile: editing.mobile,
                address: editing.address,
                pan: editing.pan,
                industry: editing.industry,
                status: editing.status,
                categories: editing.categories,
              }}
              onSubmit={handleUpdateCompany}
              isSubmitting={updateCompany.isPending}
              submitLabel="Save Changes"
              onCancel={() => setEditing(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* View Client Details Modal */}
      <Dialog open={Boolean(viewing)} onOpenChange={(open) => (open ? null : setViewing(null))}>
        <DialogContent className="max-w-xl">
          <DialogTitle>Client Details</DialogTitle>
          {viewing ? (
            <div className="mt-3 space-y-3.5 text-xs">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{viewing.companyName}</h3>
                  <p className="text-slate-600 font-medium">{viewing.industry} • Added on {viewing.createdDate}</p>
                </div>
                <Badge variant={statusVariant[viewing.status]}>{viewing.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-slate-200 p-2.5 space-y-1 bg-white">
                  <span className="text-[10px] uppercase font-bold text-slate-600">Primary Contact</span>
                  <p className="font-bold text-slate-900 text-xs">{viewing.contactPerson}</p>
                  <p className="font-mono text-[11px] text-slate-700">{viewing.email}</p>
                  <p className="font-mono text-[11px] text-slate-700">Phone: {viewing.mobile}</p>
                </div>

                <div className="rounded border border-slate-200 p-2.5 space-y-1 bg-white">
                  <span className="text-[10px] uppercase font-bold text-slate-600">Tax Identification</span>
                  <p className="font-mono text-xs font-bold text-slate-900">PAN: {viewing.pan}</p>
                  {viewing.alternativeEmail ? (
                    <p className="font-mono text-[11px] text-slate-600 truncate">Alt: {viewing.alternativeEmail}</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded border border-slate-200 p-2.5 space-y-1 bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-600">Office Address</span>
                <p className="text-slate-900 font-medium">{viewing.address}</p>
              </div>

              <div className="rounded border border-slate-200 p-2.5 space-y-1.5 bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-600">Assigned Industries</span>
                <div className="flex flex-wrap gap-1">
                  {viewing.categories.map((cat) => (
                    <Badge key={cat} variant="secondary">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <Button variant="outline" size="sm" asChild className="font-semibold text-slate-800">
                  <Link href={`/send-regulatory-update?categories=${encodeURIComponent(viewing.categories.join(","))}`}>
                    <SendHorizontal className="h-3.5 w-3.5 mr-1" />
                    Send Update to this Client
                  </Link>
                </Button>
                <Button size="sm" onClick={() => setViewing(null)} className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => (open ? null : setDeleting(null))}
        title={`Remove "${deleting?.companyName ?? ""}"?`}
        description={`Are you sure you want to remove "${deleting?.companyName}"? This client will no longer receive scheduled or broadcast emails.`}
        onConfirm={() => deleting && handleDelete(deleting)}
        isDeleting={deleteCompany.isPending}
      />
    </section>
  );
}
