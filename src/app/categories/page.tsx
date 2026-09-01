"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Briefcase, Eye, Pencil, Plus, SendHorizontal, Trash2, Users } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { TableToolbar } from "@/components/ui/table-toolbar";
import { CategoryForm } from "@/features/categories/category-form";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/use-categories";
import { useCompanies } from "@/hooks/use-companies";
import { useTableQuery } from "@/hooks/use-table-query";
import { Category } from "@/types";
import { CategoryFormValues } from "@/schemas/category-schema";

export default function CategoriesPage() {
  const { data: categories = [], isLoading, isError } = useCategories();
  const { data: companies = [] } = useCompanies();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [editing, setEditing] = React.useState<Category | null>(null);
  const [viewing, setViewing] = React.useState<Category | null>(null);
  const [deleting, setDeleting] = React.useState<Category | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);

  const { search, setSearch, page, setPage, paged, filtered, totalPages } = useTableQuery<Category>({
    data: categories,
    searchKeys: ["category", "description"],
    pageSize: 8,
  });

  const handleSave = (values: CategoryFormValues, existing?: Category) => {
    if (existing) {
      updateCategory.mutate(
        { id: existing.id, payload: values },
        {
          onSuccess: () => {
            toast.success(`Industry sector "${values.category}" updated.`);
            setEditing(null);
          },
          onError: () => toast.error("Failed to update industry sector."),
        }
      );
    } else {
      createCategory.mutate(values, {
        onSuccess: () => {
          toast.success(`New industry sector "${values.category}" created.`);
          setShowAdd(false);
        },
        onError: () => toast.error("Failed to add industry sector."),
      });
    }
  };

  const handleDelete = (category: Category) => {
    deleteCategory.mutate(category.id, {
      onSuccess: () => {
        toast.success(`Industry sector "${category.category}" removed.`);
        setDeleting(null);
      },
      onError: () => toast.error("Failed to remove industry sector."),
    });
  };

  // Companies enrolled in the currently inspected category
  const enrolledCompanies = React.useMemo(() => {
    if (!viewing) return [];
    return companies.filter(
      (c) => c.status === "Active" && c.categories.includes(viewing.category)
    );
  }, [viewing, companies]);

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "category",
      header: "Industry Sector",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5 text-slate-800 shrink-0" />
          <span className="font-bold text-slate-900 text-xs">{row.original.category}</span>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description & Scope",
      cell: ({ row }) => (
        <span className="text-xs text-slate-700 font-medium line-clamp-2">{row.original.description || "—"}</span>
      ),
    },
    {
      accessorKey: "companyCount",
      header: "Assigned Clients",
      cell: ({ row }) => (
        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.original.companyCount ?? 0} clients
        </span>
      ),
    },
    {
      accessorKey: "createdDate",
      header: "Created Date",
      cell: ({ row }) => (
        <span className="text-[11px] font-mono text-slate-600 font-semibold">
          {row.original.createdDate}
        </span>
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
            title="Edit Industry"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs text-rose-700 hover:bg-rose-50 hover:border-rose-300 font-semibold"
            onClick={() => setDeleting(row.original)}
            title="Remove Industry"
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
        title="Industry Sectors"
        description="Organize clients into industry sectors (e.g. Banking, Manufacturing, Real Estate, Technology) for targeted updates."
        action={
          <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1.5 font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-xs">
            <Plus className="h-3.5 w-3.5" />
            Add Industry
          </Button>
        }
      />

      <TableToolbar
        title="All Industry Sectors"
        description={`Showing ${filtered.length} active industry sector(s)`}
      >
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search industry sectors or descriptions..."
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
            title={isError ? "Could not load industries" : "No industry sectors found"}
            description={
              isError ? "Please verify database connection." : "Create a new industry sector to group clients."
            }
          />
        }
      />

      <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Add Industry Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogTitle>Add New Industry Sector</DialogTitle>
          <div className="mt-3">
            <CategoryForm
              mode="add"
              onSubmit={(values) => handleSave(values)}
              onCancel={() => setShowAdd(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Industry Dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(open) => (open ? null : setEditing(null))}>
        <DialogContent className="max-w-md">
          <DialogTitle>Edit Industry Sector</DialogTitle>
          <div className="mt-3">
            {editing ? (
              <CategoryForm
                mode="edit"
                defaultValues={editing}
                onSubmit={(values) => handleSave(values, editing)}
                onCancel={() => setEditing(null)}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Industry Details Modal */}
      <Dialog open={Boolean(viewing)} onOpenChange={(open) => (open ? null : setViewing(null))}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Industry Sector Details</DialogTitle>
          {viewing ? (
            <div className="mt-3 space-y-4 text-xs">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-800" />
                    <h3 className="text-sm font-bold text-slate-900">{viewing.category}</h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">{viewing.description || "No description entered."}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Created</span>
                  <p className="font-mono font-semibold text-slate-800">{viewing.createdDate}</p>
                </div>
              </div>

              {/* Enrolled Clients Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-800" />
                    <span className="font-bold text-slate-900 text-xs">
                      Assigned Clients ({enrolledCompanies.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium">
                    Active clients mapped to receive updates sent to this industry
                  </span>
                </div>

                {enrolledCompanies.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-slate-600 bg-slate-50/50">
                    <p className="font-semibold text-slate-800">No clients are currently assigned to this industry sector.</p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Assign clients in <Link href="/category-assignment" className="text-slate-900 underline font-bold">Assign Industries</Link>.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-md bg-white">
                    {enrolledCompanies.map((client) => (
                      <div key={client.id} className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-slate-900 truncate">{client.companyName}</p>
                          <p className="text-[11px] text-slate-600 truncate">
                            {client.contactPerson} • <span className="font-mono text-slate-700">{client.email}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            PAN: {client.pan}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <Button size="sm" asChild className="bg-slate-900 hover:bg-slate-800 text-white font-semibold">
                  <Link href={`/send-regulatory-update?categories=${encodeURIComponent(viewing.category)}`}>
                    <SendHorizontal className="h-3.5 w-3.5 mr-1" />
                    Send Update to this Industry
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setViewing(null)} className="font-semibold text-slate-800">
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
        title={`Remove "${deleting?.category ?? ""}"?`}
        description={`Are you sure you want to remove this industry sector? It will be unassigned from all associated clients.`}
        onConfirm={() => deleting && handleDelete(deleting)}
      />
    </section>
  );
}
