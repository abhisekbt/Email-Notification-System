"use client";

import { Check, Plus, RotateCcw, Save, Tags, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { QueryState } from "@/components/ui/query-state";
import { SearchInput } from "@/components/ui/search-input";
import { SectionCard } from "@/components/ui/section-card";
import { useAssignCompanyCategories, useCompanies } from "@/hooks/use-companies";
import { useCategories } from "@/hooks/use-categories";

export default function CategoryAssignmentPage() {
  const { data: companies = [], isLoading: companiesLoading, isError: companiesError } = useCompanies();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const assignCategories = useAssignCompanyCategories();

  const [search, setSearch] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [pendingEdits, setPendingEdits] = useState<Record<number, string[]>>({});
  const [categoryFilter, setCategoryFilter] = useState("");

  const effectiveCompanyId = selectedCompanyId ?? companies[0]?.id ?? null;
  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === effectiveCompanyId) ?? null,
    [companies, effectiveCompanyId]
  );

  const draftCategories = selectedCompany
    ? pendingEdits[selectedCompany.id] ?? selectedCompany.categories
    : [];

  const filteredCompanies = companies.filter((company) =>
    company.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCategoryOptions = categories.filter((category) =>
    category.category.toLowerCase().includes(categoryFilter.toLowerCase())
  );

  const isDirty = selectedCompany
    ? JSON.stringify([...draftCategories].sort()) !== JSON.stringify([...selectedCompany.categories].sort())
    : false;

  const updateDraft = (next: string[]) => {
    if (!selectedCompany) return;
    setPendingEdits((prev) => ({ ...prev, [selectedCompany.id]: next }));
  };

  const toggleCategory = (category: string) => {
    updateDraft(
      draftCategories.includes(category)
        ? draftCategories.filter((item) => item !== category)
        : [...draftCategories, category]
    );
  };

  const removeCategory = (category: string) => {
    updateDraft(draftCategories.filter((item) => item !== category));
  };

  const handleSave = () => {
    if (!selectedCompany) return;
    assignCategories.mutate(
      { id: selectedCompany.id, categories: draftCategories },
      {
        onSuccess: () => {
          toast.success(`Industry sectors updated for ${selectedCompany.companyName}`);
          setPendingEdits((prev) => {
            const next = { ...prev };
            delete next[selectedCompany.id];
            return next;
          });
        },
        onError: () => toast.error("Failed to update industry sectors"),
      }
    );
  };

  return (
    <section className="space-y-5">
      <PageHeader
        title="Assign Industries to Clients"
        description="Choose which industry sectors apply to each client so they receive the right updates and notices."
      />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <SectionCard
          title="Select Client"
          description="Click a client below to view and edit their assigned industries."
        >
          <div className="space-y-3">
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clients..."
            />
            <QueryState
              isLoading={companiesLoading}
              isError={companiesError}
              errorDescription="Could not load clients."
              isEmpty={!companiesLoading && !companiesError && filteredCompanies.length === 0}
              emptyTitle="No clients found"
              emptyDescription="Try adjusting your search term."
            >
              <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                {filteredCompanies.map((company) => {
                  const isActive = company.id === selectedCompany?.id;
                  const categoryCount = pendingEdits[company.id]?.length ?? company.categories.length;
                  return (
                    <button
                      key={company.id}
                      onClick={() => setSelectedCompanyId(company.id)}
                      className={
                        "w-full rounded-md border p-3 text-left transition-colors cursor-pointer " +
                        (isActive
                          ? "border-slate-800 bg-slate-100 text-slate-900 font-bold shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-400 text-slate-700 hover:text-slate-900")
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{company.companyName}</p>
                          <p className="text-[11px] text-slate-600 truncate">{company.industry}</p>
                        </div>
                        <Badge variant={isActive ? "default" : "secondary"} className="shrink-0 text-[10px] font-semibold">
                          {categoryCount} {categoryCount === 1 ? "industry" : "industries"}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </QueryState>
          </div>
        </SectionCard>

        <SectionCard
          title="Assigned Industries"
          description="Select the industry sectors this client belongs to."
          action={
            <Button size="sm" onClick={handleSave} disabled={!selectedCompany || !isDirty || assignCategories.isPending} className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
              <Save className="h-3.5 w-3.5" />
              {assignCategories.isPending ? "Saving..." : "Save Industries"}
            </Button>
          }
        >
          {!selectedCompany ? (
            <EmptyState title="No client selected" description="Select a client from the left pane to manage their industry assignments." />
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Selected Client</span>
                    <p className="text-sm font-bold text-slate-900">{selectedCompany.companyName}</p>
                    <p className="text-xs text-slate-600 font-medium">
                      {selectedCompany.contactPerson} • {selectedCompany.email}
                    </p>
                  </div>
                  <Badge variant={selectedCompany.status === "Active" ? "success" : "default"}>
                    {selectedCompany.status}
                  </Badge>
                </div>

                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    Currently Assigned ({draftCategories.length})
                  </p>
                  {draftCategories.length === 0 ? (
                    <p className="text-xs text-amber-800 font-medium py-1">
                      No industry sectors assigned yet. This client will not receive automated updates.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {draftCategories.map((category) => (
                        <Badge key={category} variant="secondary" className="flex items-center gap-1.5 text-xs py-1 px-2 font-semibold">
                          <Tags className="h-3 w-3 text-slate-700" />
                          <span>{category}</span>
                          <button
                            onClick={() => removeCategory(category)}
                            className="ml-1 rounded-full p-0.5 text-slate-600 hover:text-slate-900 cursor-pointer"
                            aria-label={`Remove ${category}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Available Industry Sectors (Click to toggle)</p>
                <SearchInput
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  placeholder="Filter available industries..."
                />
                <QueryState
                  isLoading={categoriesLoading}
                  isEmpty={!categoriesLoading && filteredCategoryOptions.length === 0}
                  emptyTitle="No industries available"
                  emptyDescription="Create an industry sector first in the Industries page."
                  skeletonCount={4}
                >
                  <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                    {filteredCategoryOptions.map((category) => {
                      const isAssigned = draftCategories.includes(category.category);
                      return (
                        <button
                          key={category.id}
                          onClick={() => toggleCategory(category.category)}
                          className={
                            "flex items-center justify-between rounded-md border p-2.5 text-left text-xs transition-colors cursor-pointer " +
                            (isAssigned
                              ? "border-slate-800 bg-slate-100 text-slate-900 font-bold shadow-2xs"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:text-slate-900 font-medium")
                          }
                        >
                          <span>{category.category}</span>
                          {isAssigned ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                              <Check className="h-3 w-3" /> Assigned
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-semibold">+ Add</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </QueryState>
              </div>

              {draftCategories.length > 0 ? (
                <div className="flex justify-end pt-2">
                  <Button variant="outline" size="sm" onClick={() => updateDraft([])} className="font-semibold text-rose-700 hover:bg-rose-50 border-rose-200">
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    Remove All Industries
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </SectionCard>
      </div>

      {selectedCompany ? (
        <SectionCard title="Client Overview" description="Contact details and assigned industry count.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
            <div className="rounded-md border border-slate-200 bg-white p-3 font-mono">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-sans">PAN</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedCompany.pan || "—"}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500">Phone Number</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">{selectedCompany.mobile || "—"}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500">Sector</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedCompany.industry || "—"}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Industries</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{draftCategories.length} Sectors</p>
            </div>
          </div>
        </SectionCard>
      ) : null}
    </section>
  );
}
