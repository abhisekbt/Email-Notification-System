"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, RotateCcw, Search, Trash2, Users, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, DataTablePagination } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { SectionCard } from "@/components/ui/section-card";
import { useCompanies } from "@/hooks/use-companies";
import { useTableQuery } from "@/hooks/use-table-query";
import { Company } from "@/types";

type Recipient = {
  id: number;
  company: string;
  email: string;
  matchedCategories: string[];
};

function toRecipients(companies: Company[], categories: string[]): Recipient[] {
  // Only active clients are eligible for circulars
  const activeCompanies = companies.filter((c) => c.status === "Active");
  const filtered =
    categories.length === 0
      ? activeCompanies
      : activeCompanies.filter((company) => company.categories.some((category) => categories.includes(category)));

  return filtered.map((company) => ({
    id: company.id,
    company: company.companyName,
    email: company.email,
    matchedCategories: categories.length === 0 ? company.categories : company.categories.filter((c) => categories.includes(c)),
  }));
}

function RecipientPreviewContent() {
  const searchParams = useSearchParams();
  const categories = React.useMemo(() => {
    const raw = searchParams.get("categories");
    return raw ? raw.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const { data: companies = [], isLoading, isError } = useCompanies();
  const [removedIds, setRemovedIds] = React.useState<Set<number>>(new Set());

  const recipients = React.useMemo(
    () => toRecipients(companies, categories).filter((recipient) => !removedIds.has(recipient.id)),
    [companies, categories, removedIds]
  );

  const { search, setSearch, page, setPage, paged, filtered, totalPages } = useTableQuery<Recipient>({
    data: recipients,
    searchKeys: ["company", "email", "matchedCategories"],
    pageSize: 8,
  });

  const removeRecipient = (id: number) => {
    setRemovedIds((prev) => new Set(prev).add(id));
  };

  const restoreAll = () => {
    setRemovedIds(new Set());
  };

  const removeDuplicates = () => {
    const seen = new Set<string>();
    const toRemove = new Set<number>();
    recipients.forEach((recipient) => {
      if (seen.has(recipient.email)) {
        toRemove.add(recipient.id);
      } else {
        seen.add(recipient.email);
      }
    });
    setRemovedIds((prev) => new Set([...prev, ...toRemove]));
  };

  const uniqueCategories = Array.from(new Set(filtered.flatMap((recipient) => recipient.matchedCategories)));
  const duplicateCount = filtered.length - new Set(filtered.map((r) => r.email)).size;

  const columns: ColumnDef<Recipient>[] = [
    {
      accessorKey: "company",
      header: "Client Name",
      cell: ({ row }) => <span className="font-bold text-slate-900 text-xs">{row.original.company}</span>,
    },
    {
      accessorKey: "email",
      header: "Email Address",
      cell: ({ row }) => <span className="font-mono text-[11px] text-slate-700 font-medium">{row.original.email}</span>,
    },
    {
      accessorKey: "matchedCategories",
      header: "Matched Industries",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.matchedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="text-[10px] font-semibold">
              {category}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: "remove",
      header: "Action",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs font-semibold text-rose-700 hover:bg-rose-50" onClick={() => removeRecipient(row.original.id)}>
          <Trash2 className="h-3 w-3 text-rose-600" />
          Exclude
        </Button>
      ),
    },
  ];

  return (
    <section className="space-y-5">
      <PageHeader
        title="Recipient Preview"
        description={
          categories.length > 0
            ? `Viewing active clients matching industries: ${categories.join(", ")}`
            : "Reviewing all active clients eligible to receive email broadcasts."
        }
        actions={
          <Button size="sm" asChild className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
            <Link
              href={
                categories.length > 0
                  ? `/send-regulatory-update?categories=${encodeURIComponent(categories.join(","))}`
                  : "/send-regulatory-update"
              }
            >
              Compose Email
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
        <SectionCard
          title="Eligible Recipients"
          description="Review the list of recipients and exclude specific clients if needed."
          action={<Badge variant="default">{recipients.length} clients</Badge>}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by client name, email, or industry..."
                className="w-full sm:w-72"
              />
              {search ? (
                <Button variant="outline" size="sm" onClick={() => setSearch("")} className="font-semibold text-slate-800">
                  <X className="h-3.5 w-3.5" />
                  Clear
                </Button>
              ) : null}
              {removedIds.size > 0 ? (
                <Button variant="outline" size="sm" onClick={restoreAll} className="font-semibold text-slate-800">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore {removedIds.size} Excluded
                </Button>
              ) : null}
            </div>

            <DataTable
              columns={columns}
              data={paged}
              isLoading={isLoading}
              pageSize={8}
              emptyState={
                <EmptyState
                  title={isError ? "Could not load recipients" : "No clients matched"}
                  description={
                    isError
                      ? "Please verify database connection."
                      : "Adjust search filters or assign industries to your clients."
                  }
                  action={
                    <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                      <Search className="h-3.5 w-3.5" />
                      Reset Filters
                    </Button>
                  }
                />
              }
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
              <p className="text-xs text-slate-700 font-semibold font-mono">
                Showing {filtered.length} of {recipients.length} eligible client(s)
              </p>
              <DataTablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Audience Summary" description="Distribution across industry sectors.">
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Total Active Clients</span>
                <span className="font-mono font-bold text-slate-900">{recipients.length}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Distinct Industries</span>
                <span className="font-mono font-bold text-slate-900">{uniqueCategories.length}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Potential Duplicates</span>
                <span className="font-mono font-bold text-slate-900">
                  {duplicateCount > 0 ? `${duplicateCount} duplicate(s)` : "None"}
                </span>
              </div>

              {duplicateCount > 0 ? (
                <Button variant="outline" size="sm" className="w-full font-semibold text-slate-800" onClick={removeDuplicates}>
                  Remove Duplicate Emails
                </Button>
              ) : null}

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                  Targeted Industries
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {uniqueCategories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Ready to Send?" description="Load these recipients directly into the composer.">
            <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold" asChild>
              <Link
                href={
                  categories.length > 0
                    ? `/send-regulatory-update?categories=${encodeURIComponent(categories.join(","))}`
                    : "/send-regulatory-update"
                }
              >
                <Users className="h-4 w-4 mr-1.5" />
                Compose Update for this Group
              </Link>
            </Button>
          </SectionCard>
        </div>
      </div>
    </section>
  );
}

export default function RecipientPreviewPage() {
  return (
    <Suspense fallback={null}>
      <RecipientPreviewContent />
    </Suspense>
  );
}
