"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Briefcase, Eye, Pencil, Plus, Trash2, Users } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/confirm-dialog";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { SectorForm } from "@/features/sectors/sector-form";
import { useCreateSector, useDeleteSector, useSectors, useUpdateSector } from "@/hooks/use-sectors";
import { useCompanies } from "@/hooks/use-companies";
import { useTableQuery } from "@/hooks/use-table-query";
import { Sector } from "@/types";
import { SectorFormValues } from "@/schemas/sector-schema";

export default function SectorsPage() {
  const { data: sectors = [], isLoading, isError } = useSectors();
  const { data: companies = [] } = useCompanies();
  const createSector = useCreateSector();
  const updateSector = useUpdateSector();
  const deleteSector = useDeleteSector();

  const [editing, setEditing] = React.useState<Sector | null>(null);
  const [viewing, setViewing] = React.useState<Sector | null>(null);
  const [deleting, setDeleting] = React.useState<Sector | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);

  const { search, setSearch, page, setPage, paged, filtered, totalPages } = useTableQuery<Sector>({
    data: sectors,
    searchKeys: ["sector", "description"],
    pageSize: 8,
  });

  const handleSave = (values: SectorFormValues, existing?: Sector) => {
    if (existing) {
      updateSector.mutate(
        { id: existing.id, payload: values },
        {
          onSuccess: () => {
            toast.success(`Sector "${values.sector}" updated.`);
            setEditing(null);
          },
          onError: () => toast.error("Failed to update sector."),
        }
      );
    } else {
      createSector.mutate(values, {
        onSuccess: () => {
          toast.success(`Sector "${values.sector}" created.`);
          setShowAdd(false);
        },
        onError: () => toast.error("Failed to add sector."),
      });
    }
  };

  const handleDelete = (sector: Sector) => {
    deleteSector.mutate(sector.id, {
      onSuccess: () => {
        toast.success(`Sector "${sector.sector}" removed.`);
        setDeleting(null);
      },
      onError: () => toast.error("Failed to remove sector."),
    });
  };

  const assignedCompanies = React.useMemo(
    () => viewing ? companies.filter((company) => company.sector === viewing.sector) : [],
    [companies, viewing]
  );

  const columns: ColumnDef<Sector>[] = [
    {
      accessorKey: "sector",
      header: "Sector",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5 text-slate-800 shrink-0" />
          <span className="font-bold text-slate-900 text-xs">{row.original.sector}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium line-clamp-2">{row.original.description || "—"}</span>
      ),
    },
    {
      accessorKey: "companyCount",
      header: "Assigned Clients",
      cell: ({ row }) => (
        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.original.companyCount} clients
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "Active" ? "success" : "default"}>{row.original.status}</Badge>
      ),
    },
    {
      accessorKey: "createdDate",
      header: "Created Date",
      cell: ({ row }) => <span className="text-[11px] font-mono text-slate-600 font-semibold">{row.original.createdDate}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs font-semibold text-slate-800" onClick={() => setViewing(row.original)}>
            <Eye className="h-3 w-3" />
            View
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs font-semibold text-slate-800" onClick={() => setEditing(row.original)}>
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="h-7 px-2 text-xs text-rose-700 hover:bg-rose-50 font-semibold" onClick={() => setDeleting(row.original)} title="Remove Sector">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-5">
      <PageHeader
        title="Sectors"
        description="Manage the industries and business sectors assigned to clients."
        action={
          <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1.5 font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs">
            <Plus className="h-3.5 w-3.5" />
            Add Sector
          </Button>
        }
      />

      <TableToolbar title="All Sectors" description={`Showing ${filtered.length} sector(s)`}>
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search sectors or descriptions..."
          className="w-full sm:w-72"
        />
      </TableToolbar>

      <DataTable
        columns={columns}
        data={paged}
        isLoading={isLoading}
        pageSize={8}
        emptyState={
          <EmptyState
            title={isError ? "Could not load sectors" : "No sectors found"}
            description={isError ? "Please verify database connection." : "Create a sector to assign it to clients."}
          />
        }
      />
      <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogTitle>Add New Sector</DialogTitle>
          <div className="mt-3">
            <SectorForm mode="add" onSubmit={(values) => handleSave(values)} onCancel={() => setShowAdd(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => (open ? null : setEditing(null))}>
        <DialogContent className="max-w-md">
          <DialogTitle>Edit Sector</DialogTitle>
          <div className="mt-3">
            {editing ? <SectorForm mode="edit" defaultValues={editing} onSubmit={(values) => handleSave(values, editing)} onCancel={() => setEditing(null)} /> : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewing)} onOpenChange={(open) => (open ? null : setViewing(null))}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Sector Details</DialogTitle>
          {viewing ? (
            <div className="mt-3 space-y-4 text-xs">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-800" />
                    <h3 className="text-sm font-bold text-slate-900">{viewing.sector}</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium mt-1">{viewing.description || "No description entered."}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Created</span>
                  <p className="font-mono font-semibold text-slate-800">{viewing.createdDate}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-800" />
                  <span className="font-bold text-slate-900">Assigned Clients ({assignedCompanies.length})</span>
                </div>
                {assignedCompanies.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-slate-600 bg-slate-50/50">
                    No clients are currently assigned to this sector.
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-md bg-white">
                    {assignedCompanies.map((company) => (
                      <div key={company.id} className="p-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{company.companyName}</p>
                          <p className="text-[11px] text-slate-600 truncate">{company.contactPerson} • {company.email}</p>
                        </div>
                        <Badge variant={company.status === "Active" ? "success" : "default"}>{company.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-200">
                <Button variant="outline" size="sm" onClick={() => setViewing(null)} className="font-semibold text-slate-800">Close</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => (open ? null : setDeleting(null))}
        title={`Remove "${deleting?.sector ?? ""}"?`}
        description="Are you sure you want to remove this sector? Clients assigned to it will become unassigned."
        onConfirm={() => deleting && handleDelete(deleting)}
        isDeleting={deleteSector.isPending}
      />
    </section>
  );
}
