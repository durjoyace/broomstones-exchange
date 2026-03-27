"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import {
  Search,
  UserPlus,
  ClipboardList,
  Eye,
  Package,
  Users,
  CheckCircle,
  Printer,
  Clock,
  AlertTriangle,
  LogIn,
  LogOut,
  Footprints,
  Brush,
  ArrowRight,
  ArrowUpRight,
  Zap,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Stats = {
  equipment: {
    total: number;
    available: number;
    checkedOut: number;
    retired: number;
    totalShoes: number;
    totalBrooms: number;
  };
  kids: { total: number };
  checkouts: { activeCheckouts: number };
  kidsSizeDistribution: Array<{ shoeSize: string; count: number }>;
  availableShoesBySize: Array<{ size: string; count: number }>;
  availableBroomsBySize: Array<{ size: string; count: number }>;
  recentActivity: Array<{
    id: number;
    kidName: string;
    equipmentType: string;
    equipmentSize: string;
    checkedOutAt: string;
    returnedAt: string | null;
  }>;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { authenticated, logout } = useAuth(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/lookup?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <p className="font-semibold text-sm">Unable to load dashboard</p>
        <p className="text-xs text-[#71717a] mt-1">
          Please refresh the page.
        </p>
      </div>
    );
  }

  const lowStockSizes = stats.kidsSizeDistribution
    .map((s) => {
      const available =
        stats.availableShoesBySize.find((a) => a.size === s.shoeSize)?.count ?? 0;
      const needed = Number(s.count);
      return needed > available
        ? { size: s.shoeSize, needed, available, shortage: needed - available }
        : null;
    })
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* ──── Hero ──── */}
      <section className="relative rounded-2xl overflow-hidden bg-[#0a0a0a] px-6 sm:px-8 py-8 sm:py-10">
        {/* Gradient accent */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#911f1f] rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#911f1f] rounded-full blur-[100px] opacity-10" />

        <div className="relative">
          <Badge className="bg-[#911f1f] text-white hover:bg-[#911f1f] text-[10px] font-semibold tracking-wide uppercase px-2.5 py-0.5 mb-4">
            Little Rockers Program
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight mb-2">
            Equipment Exchange
          </h1>
          <p className="text-[#a1a1aa] text-sm max-w-md leading-relaxed mb-6">
            Borrow curling shoes and brooms for the season — completely free.
            Register your child, pick a size, and grab it from Scott at the rink.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-white text-[#0a0a0a] hover:bg-[#f4f4f5] font-semibold text-xs h-9 px-4"
              render={<Link href="/register" />}
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Register Child
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[#27272a] text-white hover:bg-[#18181b] hover:text-white font-medium text-xs h-9 px-4"
              render={<Link href="/request" />}
            >
              <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
              Request Equipment
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[#27272a] text-white hover:bg-[#18181b] hover:text-white font-medium text-xs h-9 px-4"
              render={<Link href="/lookup" />}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Look Up My Stuff
            </Button>
          </div>
        </div>
      </section>

      {/* ──── Stats Grid ──── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Available",
            value: stats.equipment.available,
            change: `of ${stats.equipment.total}`,
            color: "text-emerald-600",
          },
          {
            label: "Checked Out",
            value: stats.checkouts.activeCheckouts,
            change: `${stats.kids.total} kids registered`,
            color: "text-amber-600",
          },
          {
            label: "Shoes",
            value: stats.equipment.totalShoes,
            change: `${stats.availableShoesBySize.reduce((s, x) => s + Number(x.count), 0)} available`,
            color: "text-[#0a0a0a]",
          },
          {
            label: "Brooms",
            value: stats.equipment.totalBrooms,
            change: `${stats.availableBroomsBySize.reduce((s, x) => s + Number(x.count), 0)} available`,
            color: "text-[#0a0a0a]",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-[#e4e4e7] p-4"
          >
            <p className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={cn("text-2xl font-bold tracking-tight mt-1", stat.color)}>
              {stat.value}
            </p>
            <p className="text-[11px] text-[#a1a1aa] mt-0.5">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* ──── Low Stock Alert ──── */}
      {lowStockSizes.length > 0 && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-700">
            <span className="font-semibold">Low stock:</span>{" "}
            {lowStockSizes.map((item, i) => (
              <span key={item!.size}>
                Size {item!.size} ({item!.available} left)
                {i < lowStockSizes.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* ──── Search ──── */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa]" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 text-sm rounded-xl bg-white border-[#e4e4e7]"
            placeholder="Search by child's name..."
          />
        </div>
      </form>

      {/* ──── Equipment Availability ──── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          {
            title: "Shoes",
            icon: Footprints,
            items: stats.availableShoesBySize,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
          },
          {
            title: "Brooms",
            icon: Brush,
            items: stats.availableBroomsBySize,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
          },
        ].map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-xl border border-[#e4e4e7] overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#f4f4f5]">
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center",
                  section.iconBg
                )}
              >
                <section.icon className={cn("h-3.5 w-3.5", section.iconColor)} />
              </div>
              <span className="text-sm font-semibold text-[#0a0a0a]">
                {section.title}
              </span>
              <Badge
                variant="secondary"
                className="ml-auto text-[10px] font-medium"
              >
                {section.items.reduce((s, x) => s + Number(x.count), 0)} avail
              </Badge>
            </div>
            {section.items.length === 0 ? (
              <p className="text-xs text-[#a1a1aa] py-6 text-center">
                None available
              </p>
            ) : (
              <div className="divide-y divide-[#f4f4f5]">
                {section.items.map((item) => (
                  <div
                    key={item.size || "std"}
                    className="flex justify-between items-center px-4 py-2.5 hover:bg-[#fafafa] transition-colors"
                  >
                    <span className="text-sm text-[#3f3f46]">
                      {section.title === "Shoes" ? `Size ${item.size}` : item.size || "Standard"}
                    </span>
                    <span className="text-sm font-semibold text-emerald-600 tabular-nums">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ──── How It Works ──── */}
      <div className="bg-white rounded-xl border border-[#e4e4e7] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-4 w-4 text-[#71717a]" />
          <h3 className="text-sm font-semibold text-[#0a0a0a]">
            How it works
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { n: "1", label: "Register", desc: "Add your child's info", href: "/register" },
            { n: "2", label: "Request", desc: "Pick a size & type", href: "/request" },
            { n: "3", label: "Pick up", desc: "See Scott at the rink", href: null },
            { n: "4", label: "Return", desc: "End of season", href: null },
          ].map((step) => (
            <div key={step.n} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0a0a0a] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {step.n}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0a0a0a] leading-tight">
                  {step.label}
                </p>
                <p className="text-xs text-[#71717a] mt-0.5">{step.desc}</p>
                {step.href && (
                  <Link
                    href={step.href}
                    className="text-[11px] text-[#911f1f] font-medium mt-1 inline-flex items-center gap-0.5 hover:underline"
                  >
                    Go <ArrowUpRight className="h-2.5 w-2.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── Guidelines ──── */}
      <div className="flex gap-3 text-xs text-[#71717a] bg-[#f4f4f5] rounded-xl px-4 py-3">
        <span className="font-medium text-[#3f3f46] shrink-0">Honor system:</span>
        <span>
          Return at end of season · Report damage · 1 pair shoes + 1 broom per child · First come, first served
        </span>
      </div>

      {/* ──── Coordinator ──── */}
      <section className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider">
            Coordinator
          </p>
          {authenticated ? (
            <button
              onClick={logout}
              className="text-[11px] text-[#a1a1aa] hover:text-[#71717a] transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/admin"
              className="text-[11px] text-[#a1a1aa] hover:text-[#71717a] transition-colors"
            >
              Login
            </Link>
          )}
        </div>

        {authenticated ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { href: "/equipment", icon: Package, label: "Equipment" },
                { href: "/kids", icon: Users, label: "Kids" },
                { href: "/checkouts", icon: CheckCircle, label: "Checkouts" },
                { href: "/match", icon: Zap, label: "Match" },
                { href: "/print", icon: Printer, label: "Print" },
                { href: "/waitlist", icon: ClipboardList, label: "Waitlist" },
              ].map((a) => (
                <Link key={a.href} href={a.href}>
                  <div className="bg-white border border-[#e4e4e7] rounded-xl py-3 text-center hover:border-[#d4d4d8] hover:shadow-sm transition-all">
                    <a.icon className="h-4 w-4 mx-auto mb-1 text-[#71717a]" />
                    <span className="text-[11px] font-medium text-[#3f3f46]">
                      {a.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Demand */}
              <div className="bg-white rounded-xl border border-[#e4e4e7] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#f4f4f5]">
                  <p className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider">
                    Demand vs Supply
                  </p>
                </div>
                <div className="p-4">
                  {stats.kidsSizeDistribution.length === 0 ? (
                    <p className="text-xs text-[#a1a1aa] py-4 text-center">
                      No data yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {stats.kidsSizeDistribution.map((sizeInfo) => {
                        const available =
                          stats.availableShoesBySize.find(
                            (s) => s.size === sizeInfo.shoeSize
                          )?.count ?? 0;
                        const needed = Number(sizeInfo.count);
                        const short = needed > available;
                        const pct = Math.min((available / Math.max(needed, 1)) * 100, 100);
                        return (
                          <div key={sizeInfo.shoeSize}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium text-[#3f3f46] tabular-nums">
                                Size {sizeInfo.shoeSize}
                              </span>
                              <span className={short ? "text-red-500 font-medium" : "text-emerald-600 font-medium"}>
                                {available}/{needed}
                              </span>
                            </div>
                            <div className="h-1 bg-[#f4f4f5] rounded-full">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-700",
                                  short ? "bg-red-400" : "bg-emerald-400"
                                )}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Activity */}
              <div className="bg-white rounded-xl border border-[#e4e4e7] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#f4f4f5] flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider">
                    Activity
                  </p>
                  <Link
                    href="/checkouts"
                    className="text-[11px] text-[#a1a1aa] hover:text-[#71717a] transition-colors"
                  >
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-[#f4f4f5]">
                  {stats.recentActivity.length === 0 ? (
                    <p className="text-xs text-[#a1a1aa] py-6 text-center">
                      No activity yet
                    </p>
                  ) : (
                    stats.recentActivity.slice(0, 6).map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-2.5 px-4 py-2.5"
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            a.returnedAt ? "bg-emerald-400" : "bg-amber-400"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium text-[#3f3f46]">
                            {a.kidName}
                          </span>
                          <span className="text-xs text-[#a1a1aa] ml-1.5">
                            {a.returnedAt ? "returned" : "borrowed"}{" "}
                            {a.equipmentType}
                            {a.equipmentSize ? ` ${a.equipmentSize}` : ""}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#a1a1aa] tabular-nums shrink-0">
                          {formatDate(a.returnedAt || a.checkedOutAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#e4e4e7] rounded-xl py-8 text-center">
            <p className="text-xs text-[#a1a1aa] mb-3">
              Coordinator tools require login.
            </p>
            <Button size="sm" className="text-xs h-8" render={<Link href="/admin" />}>
              <LogIn className="h-3 w-3 mr-1.5" />
              Login
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
