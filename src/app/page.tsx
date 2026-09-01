"use client";

import {
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  History,
  Mail,
  Plus,
  Send,
  ShieldAlert,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryState } from "@/components/ui/query-state";
import { StatCard } from "@/components/ui/stat-card";
import { useCategories } from "@/hooks/use-categories";
import { useCommunications } from "@/hooks/use-communications";
import { useCompanies } from "@/hooks/use-companies";

export default function DashboardPage() {
  const { data: companies = [], isLoading: isCompaniesLoading, isError: isCompaniesError } = useCompanies();
  const { data: categories = [], isLoading: isCategoriesLoading, isError: isCategoriesError } = useCategories();
  const { data: communications = [], isLoading: isCommsLoading, isError: isCommsError } = useCommunications();

  const isLoading = isCompaniesLoading || isCategoriesLoading || isCommsLoading;
  const isError = isCompaniesError || isCategoriesError || isCommsError;

  const stats = useMemo(() => {
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter((c) => c.status === "Active").length;
    const totalCategories = categories.length;
    const activeCategories = categories.length;

    const totalEmailsSent = communications
      .filter((c) => c.status === "Sent")
      .reduce((sum, c) => sum + (c.recipientCount || 0), 0);

    const scheduledComms = communications.filter((c) => c.status === "Scheduled").length;
    const sentCount = communications.filter((c) => c.status === "Sent").length;
    const draftComms = communications.filter((c) => c.status === "Draft").length;

    return {
      totalCompanies,
      activeCompanies,
      totalCategories,
      activeCategories,
      totalEmailsSent,
      scheduledComms,
      sentCount,
      draftComms,
    };
  }, [companies, categories, communications]);

  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      counts[cat.category] = 0;
    });
    companies.forEach((company) => {
      if (company.status === "Active") {
        company.categories.forEach((cat) => {
          counts[cat] = (counts[cat] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [categories, companies]);

  const statusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {
      Sent: 0,
      Scheduled: 0,
      Draft: 0,
      Failed: 0,
    };
    communications.forEach((comm) => {
      if (statusCounts[comm.status] !== undefined) {
        statusCounts[comm.status] += 1;
      }
    });
    return Object.entries(statusCounts)
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));
  }, [communications]);

  const recentCommunications = useMemo(() => {
    return communications.slice(0, 5);
  }, [communications]);

  const recentCompanies = useMemo(() => {
    return companies.slice(-5).reverse();
  }, [companies]);

  return (
    <section className="space-y-6">
      {/* Overview Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Advisory Dashboard
              </h1>
              <span className="text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded">
                Current Period
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Overview of active clients, category coverage, and scheduled email updates.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/companies">
                <Building2 className="h-3.5 w-3.5" />
                View Clients
              </Link>
            </Button>
            <Button size="sm" asChild className="bg-slate-900 hover:bg-slate-800 text-white font-bold">
              <Link href="/send-regulatory-update">
                <Send className="h-3.5 w-3.5" />
                Send Update
              </Link>
            </Button>
          </div>
        </div>

        {/* Advisory Compliance Banner */}
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">
                Upcoming Compliance Notice:
              </span>{" "}
              <span className="text-amber-900 font-medium">
                Advance Tax Instalment &amp; Periodic Return Filing Deadlines Approaching.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] font-bold text-amber-950 bg-amber-100 px-2.5 py-1 rounded border border-amber-300">
            <Calendar className="h-3.5 w-3.5" />
            <span>Filing Deadline: 15th of month</span>
          </div>
        </div>
      </div>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        errorTitle="Could not load practice data"
        errorDescription="Please check the server connection and try again."
        skeletonCount={4}
      >
        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Clients"
            value={String(stats.totalCompanies)}
            change={`${stats.activeCompanies} active client accounts`}
            variant="primary"
            icon={<Building2 className="h-4 w-4" />}
          />
          <StatCard
            title="Industries"
            value={String(stats.activeCategories)}
            change={`${stats.totalCategories} active industry sectors`}
            variant="default"
            icon={<Tags className="h-4 w-4" />}
          />
          <StatCard
            title="Emails Sent"
            value={stats.totalEmailsSent.toLocaleString()}
            change={`${stats.sentCount} broadcasts delivered`}
            variant="emerald"
            icon={<Mail className="h-4 w-4" />}
          />
          <StatCard
            title="Upcoming & Drafts"
            value={String(stats.scheduledComms + stats.draftComms)}
            change={`${stats.scheduledComms} scheduled • ${stats.draftComms} drafts saved`}
            variant="amber"
            icon={<Clock className="h-4 w-4" />}
          />
        </div>

        {/* Analytics Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Industry Distribution */}
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Clients by Industry Sector
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-600">
                  Number of active clients assigned to each industry sector
                </CardDescription>
              </div>
              <Briefcase className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent className="p-4">
              {categoryDistribution.length === 0 ? (
                <EmptyState
                  title="No industry data"
                  description="Assign industry sectors to clients to see the distribution."
                  className="py-10"
                />
              ) : (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryDistribution} layout="vertical" margin={{ left: 25, right: 20 }}>
                      <XAxis type="number" allowDecimals={false} stroke="#64748b" className="text-[11px] font-mono text-slate-600" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        stroke="#334155"
                        className="text-xs text-slate-800 font-semibold"
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderColor: "#e2e8f0",
                          borderRadius: "0.375rem",
                          color: "#0f172a",
                          fontSize: "0.75rem",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar dataKey="count" fill="#1e293b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Delivery Status */}
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Email Delivery Status
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-600">
                  Breakdown of sent, scheduled, and draft messages
                </CardDescription>
              </div>
              <History className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent className="p-4">
              {statusDistribution.length === 0 ? (
                <EmptyState
                  title="No emails sent yet"
                  description="Compose and send your first email update."
                  className="py-10"
                />
              ) : (
                <div className="flex h-60 flex-col items-center justify-center sm:flex-row">
                  <div className="h-44 w-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          innerRadius={45}
                          outerRadius={68}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => {
                            const colorMap: Record<string, string> = {
                              Sent: "#059669",
                              Scheduled: "#d97706",
                              Draft: "#475569",
                              Failed: "#dc2626",
                            };
                            return (
                              <Cell key={`cell-${index}`} fill={colorMap[entry.name] || "#3b82f6"} />
                            );
                          })}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            borderColor: "#e2e8f0",
                            borderRadius: "0.375rem",
                            color: "#0f172a",
                            fontSize: "0.75rem",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-0 sm:ml-4 sm:flex sm:flex-col sm:gap-1.5 text-xs">
                    {statusDistribution.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Tables */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Emails */}
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Recent Email Updates
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-600">
                  Latest circulars, reminders, and updates sent
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-slate-800 hover:text-slate-900" asChild>
                <Link href="/communication-history">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentCommunications.length === 0 ? (
                <EmptyState
                  title="No recent messages"
                  description="Sent and scheduled emails will appear here."
                  className="py-8"
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentCommunications.map((comm) => (
                    <div
                      key={comm.id}
                      className="flex items-start justify-between p-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 pr-3">
                        <p className="text-xs font-bold text-slate-900 truncate">{comm.subject}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 font-mono">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <Users className="h-3 w-3 text-slate-600" /> {comm.recipientCount} clients
                          </span>
                          <span>•</span>
                          <span>{comm.sentDate ?? (comm.scheduledFor ? `Scheduled: ${new Date(comm.scheduledFor).toLocaleDateString()}` : "Draft")}</span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          comm.status === "Sent"
                            ? "success"
                            : comm.status === "Scheduled"
                            ? "warning"
                            : comm.status === "Failed"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {comm.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Clients */}
          <Card className="border border-slate-200 bg-white">
            <CardHeader className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Recent Clients
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-600">
                  Recently added corporate clients
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs font-semibold text-slate-800 hover:text-slate-900" asChild>
                <Link href="/companies">
                  All Clients <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentCompanies.length === 0 ? (
                <EmptyState
                  title="No clients found"
                  description="Add new clients to begin sending updates."
                  className="py-8"
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-start justify-between p-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 pr-3">
                        <p className="text-xs font-bold text-slate-900 truncate">{company.companyName}</p>
                        <p className="text-[11px] text-slate-600 truncate">
                          {company.contactPerson} • {company.email}
                        </p>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {company.categories.map((cat) => (
                            <Badge key={cat} variant="secondary" className="text-[10px] py-0 px-1.5">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge variant={company.status === "Active" ? "success" : "default"}>
                        {company.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </QueryState>
    </section>
  );
}
