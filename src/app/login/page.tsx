"use client";

import { AlertCircle, ArrowRight, CheckCircle2, KeyRound, Lock, Mail, Shield, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";

import { Logo } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login({ email, password });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-200 bg-white px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="font-bold tracking-wider text-slate-900">RECONEPAL &amp; CO.</span>
          <span className="text-slate-300">|</span>
          <span className="hidden sm:inline font-medium">Chartered Accountants &amp; Advisory Practice</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          <span>Client Advisory Portal</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center space-y-1.5">
            <div className="flex justify-center mb-2">
              <Logo size="lg" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Sign In
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Enter your email and password to access the portal.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            {errorMessage ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Email Address <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@reconepal.com"
                    className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-9 text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white shadow-xs mt-1"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>

            {/* 1-Click Autofill */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 uppercase font-bold tracking-wider">Quick Access</span>
                <span className="text-slate-800 font-mono text-[10px] font-bold">1-Click Auto-Fill</span>
              </div>

              <button
                type="button"
                onClick={() => fillDemoAccount("partner@reconepal.com", "Partner@2026")}
                className="w-full rounded-md border border-slate-200 bg-slate-50 p-2.5 text-left hover:border-slate-400 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Partner Account</span>
                    <Badge variant="success" className="text-[10px] py-0 px-1.5 font-bold">Full Access</Badge>
                  </div>
                  <p className="text-[11px] font-mono text-slate-700 mt-0.5">partner@reconepal.com</p>
                </div>
                <span className="text-[11px] font-bold text-slate-900">
                  Auto-fill &rarr;
                </span>
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500 font-medium space-y-0.5">
            <p>© 2026 RecoNepal &amp; Co. Chartered Accountants.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-2 px-4 text-center text-[11px] text-slate-500 font-medium">
        RecoNepal Client Advisory &amp; Notification Portal.
      </footer>
    </div>
  );
}
