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
  Plus,
  Footprints,
  Brush,
  ArrowRight,
  Shield,
  ChevronRight,
  CircleDot,
  Zap,
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
        <Skeleton className="h-[280px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <p className="font-medium text-[#363839]">Unable to load dashboard</p>
        <p className="text-sm text-muted-foreground mt-1">
          Please refresh the page or try again later.
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

  const totalAvailableShoes = stats.availableShoesBySize.reduce(
    (sum, s) => sum + Number(s.count),
    0
  );
  const totalAvailableBrooms = stats.availableBroomsBySize.reduce(
    (sum, s) => sum + Number(s.count),
    0
  );

  return (
    <div className="space-y-8">
      {/* ──── Hero ──── */}
      <section className="relative rounded-2xl overflow-hidden bg-[#911f1f]">
        {/* Pattern overlay for texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative px-6 sm:px-10 py-10 sm:py-12">
          <p className="text-white/60 text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            Broomstones Curling Club
          </p>
          <h1 className="font-display text-[2rem] sm:text-[2.5rem] text-white leading-[1.15] mb-2">
            Little Rockers<br />Equipment Exchange
          </h1>
          <p className="text-white/70 text-[15px] max-w-md mb-8">
            Borrow curling shoes and brooms for free. Pick up at the rink,
            return at end of season.
          </p>

          {/* Three big CTA buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                href: "/register",
                icon: UserPlus,
                label: "Register My Child",
                sub: "New to the program? Start here",
              },
              {
                href: "/request",
                icon: ClipboardList,
                label: "Request Equipment",
                sub: "Browse shoes & brooms by size",
              },
              {
                href: "/lookup",
                icon: Eye,
                label: "Look Up My Stuff",
                sub: "See what your child has out",
              },
            ].map((cta) => (
              <Link
                key={cta.href}
                href={cta.href}
                className="group flex items-center gap-3 bg-white rounded-xl px-5 py-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <div className="bg-[#911f1f]/10 rounded-lg p-2.5 group-hover:bg-[#911f1f]/15 transition-colors shrink-0">
                  <cta.icon className="h-5 w-5 text-[#911f1f]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#363839]">
                    {cta.label}
                  </div>
                  <div className="text-xs text-[#78716c]">{cta.sub}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#d4d4d4] group-hover:text-[#911f1f] transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──── How It Works — Step-by-step guide ──── */}
      <section className="bg-[#f5f5f5] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1170px] mx-auto">
          <h2 className="font-display text-lg text-[#363839] mb-5 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              {
                step: "1",
                title: "Register",
                desc: "Add your child's name, grade, and shoe size",
                href: "/register",
              },
              {
                step: "2",
                title: "Request",
                desc: "Pick shoes or a broom in your child's size",
                href: "/request",
              },
              {
                step: "3",
                title: "Pick Up",
                desc: "See Scott at the rink — he'll have it ready",
                href: null,
              },
              {
                step: "4",
                title: "Return",
                desc: "Bring it back to Scott at end of season",
                href: null,
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white rounded-xl p-5 text-center relative"
              >
                <div className="w-8 h-8 rounded-full bg-[#911f1f] text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">
                  {s.step}
                </div>
                <h3 className="font-semibold text-sm text-[#363839] mb-1">
                  {s.title}
                </h3>
                <p className="text-xs text-[#78716c] leading-relaxed">
                  {s.desc}
                </p>
                {s.href && (
                  <Link
                    href={s.href}
                    className="text-xs text-[#911f1f] font-medium mt-2 inline-flex items-center gap-0.5 hover:underline"
                  >
                    Go <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Quick Search ──── */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716c]" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-11 text-sm rounded-xl bg-white border-[#e5e5e5]"
            placeholder="Search by child's name to see their equipment..."
          />
          {searchTerm && (
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              Search
            </Button>
          )}
        </div>
      </form>

      {/* ──── Low Stock Alert ──── */}
      {lowStockSizes.length > 0 && (
        <div className="flex items-start gap-3 bg-[#fdf2f2] border border-[#911f1f]/15 rounded-xl p-4">
          <AlertTriangle className="h-4 w-4 text-[#911f1f] shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-[#911f1f]">Low stock: </span>
            <span className="text-[#860f29]">
              {lowStockSizes.map((item, i) => (
                <span key={item!.size}>
                  Size {item!.size} ({item!.available} left)
                  {i < lowStockSizes.length - 1 ? ", " : ""}
                </span>
              ))}
            </span>
          </div>
        </div>
      )}

      {/* ──── Available Equipment ──── */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-display text-lg text-[#363839]">
            Available Equipment
          </h2>
          <Link
            href="/request"
            className="text-sm text-[#911f1f] font-medium hover:underline inline-flex items-center gap-1"
          >
            Request <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shoes */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
                    <Footprints className="h-4 w-4 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#363839]">
                      Curling Shoes
                    </h3>
                    <p className="text-xs text-[#78716c]">
                      {totalAvailableShoes} pairs available
                    </p>
                  </div>
                </div>
              </div>
              {stats.availableShoesBySize.length === 0 ? (
                <p className="text-sm text-[#78716c] py-4 text-center">
                  None available right now
                </p>
              ) : (
                <div className="space-y-1">
                  {stats.availableShoesBySize.map((item) => (
                    <div
                      key={item.size}
                      className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-[#f5f5f5] transition-colors"
                    >
                      <span className="text-sm text-[#444]">
                        Size {item.size}
                      </span>
                      <span className="text-sm font-medium text-emerald-600 tabular-nums">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brooms */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Brush className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#363839]">
                      Curling Brooms
                    </h3>
                    <p className="text-xs text-[#78716c]">
                      {totalAvailableBrooms} available
                    </p>
                  </div>
                </div>
              </div>
              {stats.availableBroomsBySize.length === 0 ? (
                <p className="text-sm text-[#78716c] py-4 text-center">
                  None available right now
                </p>
              ) : (
                <div className="space-y-1">
                  {stats.availableBroomsBySize.map((item) => (
                    <div
                      key={item.size || "standard"}
                      className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-[#f5f5f5] transition-colors"
                    >
                      <span className="text-sm text-[#444]">
                        {item.size || "Standard"}
                      </span>
                      <span className="text-sm font-medium text-emerald-600 tabular-nums">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ──── Quick Stats ──── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Available", value: stats.equipment.available, color: "text-emerald-600" },
          { label: "Checked Out", value: stats.checkouts.activeCheckouts, color: "text-amber-600" },
          { label: "Shoes", value: stats.equipment.totalShoes, color: "text-[#444]" },
          { label: "Brooms", value: stats.equipment.totalBrooms, color: "text-[#444]" },
        ].map((s) => (
          <div key={s.label} className="text-center py-3">
            <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            <div className="text-[11px] text-[#78716c] uppercase tracking-wider mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ──── Guidelines ──── */}
      <div className="bg-[#f5f5f5] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4 text-[#911f1f]" />
          <h3 className="font-semibold text-sm text-[#363839]">
            Honor System Guidelines
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-[#555]">
          <div className="flex items-start gap-2">
            <CircleDot className="h-3 w-3 text-[#911f1f] shrink-0 mt-1" />
            <span>Return equipment at end of season or when outgrown</span>
          </div>
          <div className="flex items-start gap-2">
            <CircleDot className="h-3 w-3 text-[#911f1f] shrink-0 mt-1" />
            <span>Report any damage — accidents happen, just let us know</span>
          </div>
          <div className="flex items-start gap-2">
            <CircleDot className="h-3 w-3 text-[#911f1f] shrink-0 mt-1" />
            <span>One pair of shoes and one broom per child</span>
          </div>
          <div className="flex items-start gap-2">
            <CircleDot className="h-3 w-3 text-[#911f1f] shrink-0 mt-1" />
            <span>First come, first served — check availability first</span>
          </div>
        </div>
      </div>

      {/* ──── Coordinator Section ──── */}
      <section className="border-t border-[#e5e5e5] pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm text-[#78716c] uppercase tracking-wider">
            Coordinator
          </h2>
          {authenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-[#78716c] text-xs"
            >
              <LogOut className="h-3.5 w-3.5 mr-1" />
              Logout
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-[#78716c] text-xs"
              render={<Link href="/admin" />}
            >
              <LogIn className="h-3.5 w-3.5 mr-1" />
              Login
            </Button>
          )}
        </div>

        {authenticated ? (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { href: "/equipment", icon: Package, label: "Equipment", color: "bg-blue-50 text-blue-600" },
                { href: "/kids", icon: Users, label: "Kids", color: "bg-violet-50 text-violet-600" },
                { href: "/checkouts", icon: CheckCircle, label: "Checkouts", color: "bg-emerald-50 text-emerald-600" },
                { href: "/match", icon: Zap, label: "Match", color: "bg-amber-50 text-amber-600" },
                { href: "/print", icon: Printer, label: "Print", color: "bg-gray-100 text-gray-600" },
                { href: "/waitlist", icon: ClipboardList, label: "Waitlist", color: "bg-rose-50 text-rose-600" },
              ].map((a) => (
                <Link key={a.href} href={a.href}>
                  <div className="bg-white border border-[#e5e5e5] rounded-xl p-3 text-center hover:shadow-md transition-all group">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5",
                        a.color
                      )}
                    >
                      <a.icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[11px] font-medium text-[#555]">
                      {a.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Demand + Activity side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-[#78716c] uppercase tracking-wider">
                    Size Demand vs Supply
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.kidsSizeDistribution.length === 0 ? (
                    <p className="text-sm text-[#78716c] py-4 text-center">
                      No kids registered with shoe sizes yet.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {stats.kidsSizeDistribution.map((sizeInfo) => {
                        const available =
                          stats.availableShoesBySize.find(
                            (s) => s.size === sizeInfo.shoeSize
                          )?.count ?? 0;
                        const needed = Number(sizeInfo.count);
                        const needsMore = needed > available;
                        const ratio = Math.min(
                          (available / Math.max(needed, 1)) * 100,
                          100
                        );
                        return (
                          <div key={sizeInfo.shoeSize}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-medium text-[#444] tabular-nums">
                                Size {sizeInfo.shoeSize}
                              </span>
                              <span
                                className={cn(
                                  "font-medium",
                                  needsMore ? "text-[#860f29]" : "text-emerald-600"
                                )}
                              >
                                {available}/{needed}
                              </span>
                            </div>
                            <div className="h-1.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  needsMore ? "bg-[#860f29]/50" : "bg-emerald-400"
                                )}
                                style={{ width: `${ratio}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-[#78716c] uppercase tracking-wider">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentActivity.length === 0 ? (
                    <p className="text-sm text-[#78716c] py-4 text-center">
                      No activity yet.
                    </p>
                  ) : (
                    <div className="space-y-0">
                      {stats.recentActivity.slice(0, 6).map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between py-2 border-b border-[#f5f5f5] last:border-0"
                        >
                          <div className="flex items-center gap-2 text-xs min-w-0">
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                a.returnedAt ? "bg-emerald-400" : "bg-amber-400"
                              )}
                            />
                            <span className="font-medium text-[#444] truncate">
                              {a.kidName}
                            </span>
                            <span className="text-[#78716c] hidden sm:inline">
                              {a.returnedAt ? "returned" : "borrowed"}{" "}
                              <span className="capitalize">{a.equipmentType}</span>
                              {a.equipmentSize ? ` (${a.equipmentSize})` : ""}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#78716c] whitespace-nowrap ml-2 tabular-nums">
                            {formatDate(a.returnedAt || a.checkedOutAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs w-full text-[#78716c]"
                      render={<Link href="/checkouts" />}
                    >
                      View all checkouts
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#e5e5e5] rounded-xl py-8 text-center">
            <p className="text-sm text-[#78716c] mb-3">
              Log in to access coordinator tools.
            </p>
            <Button size="sm" render={<Link href="/admin" />}>
              <LogIn className="h-3.5 w-3.5 mr-1" />
              Coordinator Login
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
