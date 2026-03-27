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
  Sparkles,
  Shield,
  Heart,
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
      <div className="space-y-8">
        <div className="rounded-2xl bg-burgundy/5 p-8">
          <Skeleton className="h-10 w-96 mb-4" />
          <Skeleton className="h-6 w-64 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <p className="text-destructive font-medium">
          Unable to load dashboard
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Please refresh the page or try again later.
        </p>
      </div>
    );
  }

  const lowStockSizes = stats.kidsSizeDistribution
    .map((s) => {
      const available =
        stats.availableShoesBySize.find((a) => a.size === s.shoeSize)?.count ??
        0;
      const needed = Number(s.count);
      return needed > available
        ? { size: s.shoeSize, needed, available, shortage: needed - available }
        : null;
    })
    .filter(Boolean);

  return (
    <div className="space-y-10">
      {/* ──── Hero Section ──── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#911f1f] via-[#7a1a1a] to-[#5c1414] px-6 sm:px-10 py-10 sm:py-14">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-white/3" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="text-amber-200 text-sm font-medium tracking-wide uppercase">
              Little Rockers Program
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white leading-tight mb-3">
            Equipment Exchange
          </h1>
          <p className="text-white/75 text-lg max-w-xl mb-8">
            Free curling shoes and brooms for kids in the program. Borrow for
            the season, return when done.
          </p>

          {/* Parent Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                href: "/register",
                icon: UserPlus,
                title: "Register My Child",
                desc: "First time? Start here",
                accent: "from-white/20 to-white/10 hover:from-white/25 hover:to-white/15",
              },
              {
                href: "/request",
                icon: ClipboardList,
                title: "Request Equipment",
                desc: "Shoes or brooms",
                accent: "from-white/20 to-white/10 hover:from-white/25 hover:to-white/15",
              },
              {
                href: "/lookup",
                icon: Eye,
                title: "My Equipment",
                desc: "Check what you have",
                accent: "from-white/20 to-white/10 hover:from-white/25 hover:to-white/15",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={cn(
                  "group relative overflow-hidden rounded-xl bg-gradient-to-br backdrop-blur-sm p-5 sm:p-6 text-white transition-all duration-200 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0",
                  card.accent
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-white/15 rounded-lg p-2.5 group-hover:bg-white/20 transition-colors">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base mb-0.5">
                      {card.title}
                    </div>
                    <div className="text-white/60 text-sm">{card.desc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Quick Search ──── */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-13 text-base rounded-xl border-warm-200 bg-white shadow-sm focus:border-burgundy focus:ring-burgundy/20"
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
        <div className="flex items-start gap-3 bg-burgundy-50 border border-burgundy/15 rounded-xl p-4">
          <AlertTriangle className="h-5 w-5 text-burgundy shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-burgundy text-sm">
              Low Stock Alert
            </h3>
            <p className="text-sm text-burgundy/80 mt-0.5">
              {lowStockSizes.map((item, i) => (
                <span key={item!.size}>
                  <strong>Size {item!.size}</strong> ({item!.available} left,
                  need {item!.shortage} more)
                  {i < lowStockSizes.length - 1 ? " · " : ""}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      {/* ──── Stats Bar ──── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Available",
            value: stats.equipment.available,
            icon: Package,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
          },
          {
            label: "Checked Out",
            value: stats.checkouts.activeCheckouts,
            icon: CheckCircle,
            color: "text-amber-700",
            bg: "bg-amber-50",
            border: "border-amber-200",
          },
          {
            label: "Shoes",
            value: stats.equipment.totalShoes,
            icon: Footprints,
            color: "text-stone",
            bg: "bg-white",
            border: "border-warm-200",
          },
          {
            label: "Brooms",
            value: stats.equipment.totalBrooms,
            icon: Brush,
            color: "text-stone",
            bg: "bg-white",
            border: "border-warm-200",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "rounded-xl border p-4 flex items-center gap-3",
              stat.bg,
              stat.border
            )}
          >
            <stat.icon className={cn("h-5 w-5 shrink-0", stat.color)} />
            <div>
              <div className="text-2xl font-bold leading-none">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ──── Available Equipment ──── */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-light text-[#363839]">
            Available Now
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-burgundy hover:text-burgundy-dark"
            render={<Link href="/request" />}
          >
            Request
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shoes */}
          <Card className="bg-white border-warm-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-ice rounded-lg p-2">
                  <Footprints className="h-4 w-4 text-sky-700" />
                </div>
                <h3 className="font-semibold">Curling Shoes</h3>
                <Badge
                  variant="secondary"
                  className="ml-auto bg-emerald-100 text-emerald-700 text-xs"
                >
                  {stats.availableShoesBySize.reduce(
                    (sum, s) => sum + Number(s.count),
                    0
                  )}{" "}
                  total
                </Badge>
              </div>
              {stats.availableShoesBySize.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No shoes available right now
                </p>
              ) : (
                <div className="space-y-1.5">
                  {stats.availableShoesBySize.map((item) => (
                    <div
                      key={item.size}
                      className="flex justify-between items-center py-1.5 px-3 rounded-lg hover:bg-warm-50 transition-colors"
                    >
                      <span className="text-sm font-medium">
                        Size {item.size}
                      </span>
                      <span className="text-sm text-emerald-600 font-medium tabular-nums">
                        {item.count} avail
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brooms */}
          <Card className="bg-white border-warm-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-amber-50 rounded-lg p-2">
                  <Brush className="h-4 w-4 text-amber-700" />
                </div>
                <h3 className="font-semibold">Curling Brooms</h3>
                <Badge
                  variant="secondary"
                  className="ml-auto bg-emerald-100 text-emerald-700 text-xs"
                >
                  {stats.availableBroomsBySize.reduce(
                    (sum, s) => sum + Number(s.count),
                    0
                  )}{" "}
                  total
                </Badge>
              </div>
              {stats.availableBroomsBySize.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No brooms available right now
                </p>
              ) : (
                <div className="space-y-1.5">
                  {stats.availableBroomsBySize.map((item) => (
                    <div
                      key={item.size || "standard"}
                      className="flex justify-between items-center py-1.5 px-3 rounded-lg hover:bg-warm-50 transition-colors"
                    >
                      <span className="text-sm font-medium">
                        {item.size || "Standard"}
                      </span>
                      <span className="text-sm text-emerald-600 font-medium tabular-nums">
                        {item.count} avail
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ──── How It Works ──── */}
      <section className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-warm-200">
          {[
            {
              n: "01",
              icon: Eye,
              title: "Check Availability",
              desc: "Browse sizes above or on the Equipment page",
            },
            {
              n: "02",
              icon: Heart,
              title: "See Scott at the Rink",
              desc: "He'll get your child fitted with the right gear",
            },
            {
              n: "03",
              icon: Shield,
              title: "Return End of Season",
              desc: "Or when outgrown — honor system",
            },
          ].map((step) => (
            <div key={step.n} className="p-6 text-center">
              <span className="font-display text-3xl font-bold text-burgundy/15">
                {step.n}
              </span>
              <step.icon className="h-5 w-5 mx-auto mt-1 mb-2 text-burgundy/60" />
              <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ──── Honor System ──── */}
      <div className="flex items-start gap-4 bg-warm-100 rounded-xl p-5 border border-warm-200">
        <Shield className="h-5 w-5 text-burgundy/60 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-warm-800 mb-1.5">
            Honor System
          </p>
          <div className="text-warm-800/70 space-y-0.5">
            <p>
              Return at end of season · Report any damage · One pair of shoes +
              one broom per child · First come, first served
            </p>
          </div>
        </div>
      </div>

      {/* ──── Coordinator Tools ──── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-light text-[#363839]">
            Coordinator
          </h2>
          {authenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              render={<Link href="/admin" />}
            >
              <LogIn className="h-4 w-4 mr-1" />
              Login
            </Button>
          )}
        </div>

        {authenticated ? (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                {
                  href: "/equipment",
                  icon: Plus,
                  label: "Equipment",
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  href: "/kids",
                  icon: Users,
                  label: "Kids",
                  color: "text-violet-600",
                  bg: "bg-violet-50",
                },
                {
                  href: "/checkouts",
                  icon: CheckCircle,
                  label: "Checkouts",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  href: "/print",
                  icon: Printer,
                  label: "Print",
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
                {
                  href: "/waitlist",
                  icon: ClipboardList,
                  label: "Waitlist",
                  color: "text-rose-600",
                  bg: "bg-rose-50",
                },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="group bg-white border border-warm-200 rounded-xl p-4 text-center hover:shadow-md hover:border-warm-300 transition-all">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2",
                        action.bg
                      )}
                    >
                      <action.icon className={cn("h-4 w-4", action.color)} />
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Size Demand + Recent Activity side by side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Size Demand */}
              <Card className="bg-white border-warm-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Size Demand vs Supply
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.kidsSizeDistribution.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                      No kids registered with shoe sizes yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
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
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="font-medium tabular-nums">
                                Size {sizeInfo.shoeSize}
                              </span>
                              <span
                                className={cn(
                                  "text-xs font-medium",
                                  needsMore
                                    ? "text-destructive"
                                    : "text-emerald-600"
                                )}
                              >
                                {available}/{needed}
                              </span>
                            </div>
                            <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  needsMore
                                    ? "bg-destructive/60"
                                    : "bg-emerald-500"
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

              {/* Recent Activity */}
              <Card className="bg-white border-warm-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentActivity.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                      No activity yet.
                    </p>
                  ) : (
                    <div className="space-y-0">
                      {stats.recentActivity.slice(0, 6).map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between py-2.5 border-b border-warm-100 last:border-0"
                        >
                          <div className="flex items-center gap-2 text-sm min-w-0">
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                a.returnedAt
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              )}
                            />
                            <span className="font-medium truncate">
                              {a.kidName}
                            </span>
                            <span className="text-muted-foreground text-xs hidden sm:inline">
                              {a.returnedAt ? "returned" : "borrowed"}{" "}
                              <span className="capitalize">
                                {a.equipmentType}
                              </span>
                              {a.equipmentSize
                                ? ` (${a.equipmentSize})`
                                : ""}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatDate(a.returnedAt || a.checkedOutAt)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Separator className="my-3 bg-warm-100" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs w-full text-muted-foreground hover:text-foreground"
                    render={<Link href="/checkouts" />}
                  >
                    View all checkouts
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-warm-200 rounded-xl py-10 text-center">
            <Lock className="h-6 w-6 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">
              Log in to access coordinator tools.
            </p>
            <Button size="sm" render={<Link href="/admin" />}>
              <LogIn className="h-4 w-4 mr-1" />
              Coordinator Login
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function Lock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
