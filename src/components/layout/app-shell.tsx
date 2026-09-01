"use client";

import {
  Briefcase,
  Building2,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  SendHorizontal,
  Settings2,
  SlidersHorizontal,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Logo } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils/cn";

interface NavGroup {
  group: string;
  items: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    group: "CLIENTS & INDUSTRIES",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/" },
      { label: "Clients", icon: Building2, href: "/companies" },
      { label: "Industries", icon: Briefcase, href: "/categories" },
      { label: "Assign Industries", icon: SlidersHorizontal, href: "/category-assignment" },
    ],
  },
  {
    group: "MESSAGES & TEMPLATES",
    items: [
      { label: "Send Update", icon: SendHorizontal, href: "/send-regulatory-update" },
      { label: "Recipient Preview", icon: Users2, href: "/recipient-preview" },
      { label: "Email Templates", icon: FileText, href: "/email-templates" },
    ],
  },
  {
    group: "LOGS & SETTINGS",
    items: [
      { label: "Sent History", icon: History, href: "/communication-history" },
      { label: "Settings", icon: Settings2, href: "/settings" },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  // If unauthenticated and not already on /login, force redirect to /login
  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  // If on login page, render full screen without app chrome
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // If checking authentication, show clean loading state
  if (isLoading || (!isAuthenticated && pathname !== "/login")) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center text-slate-700">
        <div className="flex flex-col items-center gap-3">
          <Logo size="lg" />
          <div className="h-5 w-5 rounded-full border-2 border-slate-800 border-t-transparent animate-spin mt-2" />
          <p className="text-xs font-semibold tracking-wide text-slate-600">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50/80 text-slate-900">
      {/* Top Header - Fixed & Pinned */}
      <header className="h-13 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between shadow-xs z-30">
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 lg:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[270px] p-0 bg-white border-r border-slate-200 flex flex-col h-full">
              <div className="p-4 border-b border-slate-200 shrink-0">
                <SheetTitle>
                  <Logo size="md" />
                </SheetTitle>
              </div>
              <nav className="p-3 space-y-4 overflow-y-auto flex-1">
                {navGroups.map((group) => (
                  <div key={group.group} className="space-y-1">
                    <p className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {group.group}
                    </p>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-semibold transition-colors",
                            active
                              ? "bg-slate-100 text-slate-900 font-bold border border-slate-200"
                              : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                          )}
                        >
                          <Icon className={cn("h-4 w-4 shrink-0", active ? "text-slate-900" : "text-slate-500")} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>

              {user ? (
                <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 pr-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-600 truncate">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={logout}
                      className="rounded-md p-1.5 text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}
            </SheetContent>
          </Sheet>

          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center gap-2.5 pr-4 border-r border-slate-200">
            <Logo size="md" />
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              RecoNepal Client Advisory Portal
            </span>
          </div>
        </div>

        {/* Right Actions & User Controls */}
        <div className="flex items-center gap-2.5">
          <Button size="sm" className="h-8 text-xs font-bold gap-1.5 bg-slate-900 hover:bg-slate-800 text-white shadow-xs" asChild>
            <Link href="/send-regulatory-update">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Send Update</span>
            </Link>
          </Button>

          {user ? (
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2.5">
              <div className="hidden sm:flex items-center gap-2 border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-md text-xs">
                <span className="font-bold text-slate-900">{user.fullName}</span>
                <Badge variant="success" className="text-[10px] py-0 px-1.5 font-bold">
                  Full Access
                </Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="h-8 px-3 text-xs text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-md transition-all duration-200 gap-1.5 font-bold cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Main App Body (Fixed height, no parent scroll) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sleek Light Sidebar (Fixed height with pinned bottom profile) */}
        <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex h-full min-h-0">
          {/* Scrollable Navigation Groups */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 min-h-0" aria-label="Navigation">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                <p className="px-2.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-md px-2.5 py-2 text-xs font-semibold transition-colors",
                          active
                            ? "bg-slate-100 text-slate-900 font-bold border border-slate-200 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={cn("h-4 w-4 shrink-0", active ? "text-slate-900" : "text-slate-500")} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span className="text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-bold">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Locked Bottom User Profile Card */}
          {user ? (
            <div className="shrink-0 p-3 border-t border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                  <p className="text-[11px] text-slate-600 truncate font-mono">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-md p-1.5 text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 hover:shadow-md transition-all duration-200 cursor-pointer shrink-0"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : null}
        </aside>

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 min-h-0">
          <div className="max-w-7xl w-full mx-auto pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
