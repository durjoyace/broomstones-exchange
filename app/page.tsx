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
  Zap,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

function countColor(n: number) {
  if (n <= 1) return "text-red-500";
  if (n <= 2) return "text-orange-500";
  return "text-green-600";
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
        <Skeleton className="h-[220px] w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
        <p className="font-bold text-gray-900">Unable to load dashboard</p>
        <p className="text-sm text-gray-500 mt-1">Please refresh the page.</p>
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

  const totalShoeAvail = stats.availableShoesBySize.reduce(
    (s, x) => s + Number(x.count), 0
  );
  const totalBroomAvail = stats.availableBroomsBySize.reduce(
    (s, x) => s + Number(x.count), 0
  );

  return (
    <div className="space-y-6">
      {/* ──── Hero ──── */}
      <div className="bg-gray-900 rounded-xl p-8 md:p-10 shadow-lg">
        <div className="inline-block bg-red-800 text-white rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase mb-6">
          Little Rockers Program
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Equipment Exchange
        </h1>

        <p className="text-gray-400 max-w-2xl mb-8 text-lg">
          Borrow curling shoes and brooms for the season — completely free.
          Register your child, pick a size, and grab it from Scott at the rink.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/register"
            className="border border-gray-600 text-white rounded-lg px-4 py-2.5 hover:bg-gray-800 flex items-center gap-2 transition-colors font-medium text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Register Child
          </Link>
          <Link
            href="/request"
            className="border border-gray-600 text-white rounded-lg px-4 py-2.5 hover:bg-gray-800 flex items-center gap-2 transition-colors font-medium text-sm"
          >
            <ClipboardList className="w-4 h-4" />
            Request Equipment
          </Link>
          <Link
            href="/lookup"
            className="border border-gray-600 text-white rounded-lg px-4 py-2.5 hover:bg-gray-800 flex items-center gap-2 transition-colors font-medium text-sm"
          >
            <Eye className="w-4 h-4" />
            Look Up My Stuff
          </Link>
        </div>
      </div>

      {/* ──── Stats ──── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="uppercase text-xs tracking-wider text-gray-500 font-semibold mb-2">
            Available
          </div>
          <div className="text-3xl font-bold text-green-600">
            {stats.equipment.available}
          </div>
          <div className="text-sm text-gray-500">of {stats.equipment.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="uppercase text-xs tracking-wider text-gray-500 font-semibold mb-2">
            Checked Out
          </div>
          <div className="text-3xl font-bold text-orange-500">
            {stats.checkouts.activeCheckouts}
          </div>
          <div className="text-sm text-gray-500">
            {stats.kids.total} kids registered
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="uppercase text-xs tracking-wider text-gray-500 font-semibold mb-2">
            Shoes
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.equipment.totalShoes}
          </div>
          <div className="text-sm text-gray-500">{totalShoeAvail} available</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="uppercase text-xs tracking-wider text-gray-500 font-semibold mb-2">
            Brooms
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.equipment.totalBrooms}
          </div>
          <div className="text-sm text-gray-500">{totalBroomAvail} available</div>
        </div>
      </div>

      {/* ──── Low Stock Alert ──── */}
      {lowStockSizes.length > 0 && (
        <div className="w-full bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
          <div className="text-orange-600 text-sm">
            <span className="font-semibold mr-1">Low stock:</span>
            {lowStockSizes.map((item, i) => (
              <span key={item!.size}>
                Size {item!.size} ({item!.available} left)
                {i < lowStockSizes.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ──── Search ──── */}
      <form onSubmit={handleSearch}>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent transition-shadow shadow-sm"
            placeholder="Search by child's name..."
          />
        </div>
      </form>

      {/* ──── Inventory Grid ──── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shoes */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Footprints className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="font-bold text-gray-900 text-lg">Shoes</h2>
            </div>
            <span className="bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 text-xs font-medium">
              {totalShoeAvail} avail
            </span>
          </div>
          {stats.availableShoesBySize.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              None available right now
            </div>
          ) : (
            <div className="flex flex-col">
              {stats.availableShoesBySize.map((item, i) => (
                <div
                  key={item.size}
                  className={cn(
                    "flex justify-between py-3 px-5 hover:bg-gray-50 transition-colors",
                    i < stats.availableShoesBySize.length - 1 &&
                      "border-b border-gray-100"
                  )}
                >
                  <span className="text-gray-700">Size {item.size}</span>
                  <span className={cn("font-semibold", countColor(Number(item.count)))}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Brooms */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm self-start">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                <Brush className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="font-bold text-gray-900 text-lg">Brooms</h2>
            </div>
            <span className="bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 text-xs font-medium">
              {totalBroomAvail} avail
            </span>
          </div>
          {stats.availableBroomsBySize.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">
              None available right now
            </div>
          ) : (
            <div className="flex flex-col">
              {stats.availableBroomsBySize.map((item, i) => (
                <div
                  key={item.size || "std"}
                  className={cn(
                    "flex justify-between py-3 px-5 hover:bg-gray-50 transition-colors",
                    i < stats.availableBroomsBySize.length - 1 &&
                      "border-b border-gray-100"
                  )}
                >
                  <span className="text-gray-700">
                    {item.size || "Standard"}
                  </span>
                  <span className={cn("font-semibold", countColor(Number(item.count)))}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ──── How It Works ──── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Info className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-bold text-gray-900">How it works</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { n: "1", label: "Register", desc: "Add your child's name & shoe size", href: "/register" },
            { n: "2", label: "Request", desc: "Pick shoes or a broom by size", href: "/request" },
            { n: "3", label: "Pick up", desc: "See Scott at the rink", href: null },
            { n: "4", label: "Return", desc: "Bring it back end of season", href: null },
          ].map((step) => (
            <div key={step.n} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {step.n}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{step.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {step.desc}
                </p>
                {step.href && (
                  <Link
                    href={step.href}
                    className="text-xs text-red-800 font-semibold mt-1 inline-flex items-center gap-0.5 hover:underline"
                  >
                    Go <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── Honor System ──── */}
      <div className="bg-gray-100 rounded-lg px-5 py-3 text-sm text-gray-500 flex gap-2">
        <span className="font-semibold text-gray-700 shrink-0">Honor system:</span>
        <span>
          Return at end of season · Report damage · 1 pair shoes + 1 broom per
          child · First come, first served
        </span>
      </div>

      {/* ──── Coordinator ──── */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Coordinator
          </span>
          {authenticated ? (
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <LogOut className="h-3 w-3" />
              Logout
            </button>
          ) : (
            <Link
              href="/admin"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <LogIn className="h-3 w-3" />
              Login
            </Link>
          )}
        </div>

        {authenticated ? (
          <div className="space-y-4">
            {/* Quick actions */}
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
                  <div className="bg-white border border-gray-200 rounded-xl py-3.5 text-center hover:border-gray-300 hover:shadow-sm transition-all">
                    <a.icon className="h-4 w-4 mx-auto mb-1.5 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">
                      {a.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Demand + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Demand */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Demand vs Supply
                  </span>
                </div>
                <div className="p-5">
                  {stats.kidsSizeDistribution.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
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
                        const pct = Math.min(
                          (available / Math.max(needed, 1)) * 100,
                          100
                        );
                        return (
                          <div key={sizeInfo.shoeSize}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-gray-700">
                                Size {sizeInfo.shoeSize}
                              </span>
                              <span
                                className={cn(
                                  "font-semibold",
                                  short ? "text-red-500" : "text-green-600"
                                )}
                              >
                                {available}/{needed}
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-700",
                                  short ? "bg-red-400" : "bg-green-400"
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
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Recent Activity
                  </span>
                  <Link
                    href="/checkouts"
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    View all
                  </Link>
                </div>
                {stats.recentActivity.length === 0 ? (
                  <div className="p-5 text-sm text-gray-400 text-center">
                    No activity yet
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {stats.recentActivity.slice(0, 6).map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            a.returnedAt ? "bg-green-400" : "bg-orange-400"
                          )}
                        />
                        <div className="flex-1 min-w-0 text-sm">
                          <span className="font-medium text-gray-900">
                            {a.kidName}
                          </span>
                          <span className="text-gray-400 ml-1.5">
                            {a.returnedAt ? "returned" : "borrowed"}{" "}
                            {a.equipmentType}
                            {a.equipmentSize ? ` (${a.equipmentSize})` : ""}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {formatDate(a.returnedAt || a.checkedOutAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl py-10 text-center shadow-sm">
            <p className="text-sm text-gray-400 mb-3">
              Coordinator tools require login.
            </p>
            <Button size="sm" render={<Link href="/admin" />}>
              <LogIn className="h-3.5 w-3.5 mr-1.5" />
              Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
