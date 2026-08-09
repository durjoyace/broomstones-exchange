"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Brush,
  Check,
  CheckCircle,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Eye,
  Footprints,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Printer,
  RotateCcw,
  ScanSearch,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/useAuth";
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
    equipmentSize: string | null;
    checkedOutAt: string;
    returnedAt: string | null;
  }>;
};

type SizeAvailability = {
  size: string;
  count: number;
};

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function availabilityTone(count: number) {
  if (count <= 1) {
    return {
      text: "text-[#a92b3d]",
      surface: "bg-[#fbedef]",
      label: "Last one",
    };
  }
  if (count <= 3) {
    return {
      text: "text-[#8b6113]",
      surface: "bg-[#fff6dc]",
      label: "Going fast",
    };
  }
  return {
    text: "text-[#226a52]",
    surface: "bg-[#edf6f2]",
    label: "Ready",
  };
}

function EquipmentAvailability({
  title,
  description,
  icon: Icon,
  items,
}: {
  title: string;
  description: string;
  icon: typeof Footprints;
  items: SizeAvailability[];
}) {
  const total = items.reduce((sum, item) => sum + Number(item.count), 0);

  return (
    <article className="overflow-hidden border border-[#cfdee3] bg-white shadow-[0_18px_50px_rgba(21,36,43,0.07)]">
      <header className="flex items-start justify-between gap-4 border-b border-[#dce7eb] px-5 py-5 sm:px-6">
        <div className="flex gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-[#e6f0f4] text-[#153b4d]">
            <Icon className="size-5" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold tracking-[-0.025em] text-[#15242b]">
              {title}
            </h3>
            <p className="mt-1 text-sm text-[#5d7078]">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="block font-display text-3xl leading-none text-[#751c2b]">
            {total}
          </span>
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#5d7078]">
            available
          </span>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="font-bold text-[#15242b]">Nothing on the rack today</p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#5d7078]">
            Request the size you need and we’ll add your child to the waitlist.
          </p>
          <Link
            href="/request"
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-bold text-[#751c2b] hover:underline"
          >
            Request this item
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2">
          {items.map((item, index) => {
            const count = Number(item.count);
            const tone = availabilityTone(count);
            return (
              <div
                key={item.size || "standard"}
                className={cn(
                  "flex min-h-[5.25rem] items-center justify-between gap-4 px-5 py-4 sm:px-6",
                  index < items.length - 1 && "border-b border-[#e5edef]",
                  index % 2 === 0 && "sm:border-r sm:border-[#e5edef]",
                  index >= items.length - 2 && "sm:border-b-0"
                )}
              >
                <div>
                  <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#75868d]">
                    {title === "Curling shoes" ? "Shoe size" : "Broom"}
                  </span>
                  <p className="mt-0.5 text-lg font-extrabold text-[#15242b]">
                    {item.size || "Standard"}
                  </p>
                </div>
                <div className={cn("rounded-lg px-3 py-2 text-right", tone.surface)}>
                  <span className={cn("block text-xl font-black leading-none", tone.text)}>
                    {count}
                  </span>
                  <span className={cn("text-[0.62rem] font-bold uppercase tracking-wide", tone.text)}>
                    {tone.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

function LiveHouse({
  available,
  shoes,
  brooms,
}: {
  available: number;
  shoes: number;
  brooms: number;
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[28rem]">
      <div className="absolute inset-0 rounded-full bg-white shadow-[0_28px_80px_rgba(43,6,16,0.3)]" />
      <div className="absolute inset-[13%] rounded-full bg-[#2480a8]" />
      <div className="absolute inset-[28%] rounded-full bg-white" />
      <div className="absolute inset-[41%] rounded-full bg-[#751c2b]" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-5xl leading-none text-white sm:text-6xl">
          {available}
        </span>
        <span className="mt-1 text-[0.67rem] font-black uppercase tracking-[0.2em] text-white/85">
          pieces ready
        </span>
      </div>

      <div className="stone-arrival absolute left-[63%] top-[18%] size-[17%] rounded-full border-[5px] border-white bg-[#e5b94a] shadow-[0_10px_22px_rgba(21,36,43,0.28)]">
        <span className="absolute left-1/2 top-[-22%] h-[35%] w-[54%] -translate-x-1/2 rounded-full border-2 border-white bg-[#751c2b]" />
      </div>

      <div className="absolute bottom-[4%] left-1/2 flex w-[76%] -translate-x-1/2 justify-between rounded-2xl border border-white/60 bg-white/95 px-5 py-3 shadow-lg backdrop-blur">
        <div>
          <span className="block text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#75868d]">
            Shoes
          </span>
          <span className="text-lg font-black text-[#153b4d]">{shoes}</span>
        </div>
        <div className="w-px bg-[#cfdee3]" />
        <div className="text-right">
          <span className="block text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#75868d]">
            Brooms
          </span>
          <span className="text-lg font-black text-[#153b4d]">{brooms}</span>
        </div>
      </div>
    </div>
  );
}

function CoordinatorPanel({ stats }: { stats: Stats }) {
  const { authenticated, logout } = useAuth(false);

  if (authenticated === null) {
    return <Skeleton className="h-28 w-full rounded-2xl" />;
  }

  if (!authenticated) {
    return (
      <section className="flex flex-col justify-between gap-5 border border-[#cfdee3] bg-white px-5 py-6 sm:flex-row sm:items-center sm:px-7">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[#751c2b]">
            Club operations
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-[-0.025em] text-[#15242b]">
            Running the exchange today?
          </h2>
          <p className="mt-1 text-sm text-[#5d7078]">
            Open checkouts, inventory, match tools, and print sheets.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#c5d6dc] px-5 text-sm font-bold text-[#153b4d] transition-colors hover:border-[#2480a8] hover:bg-[#e6f0f4]"
        >
          <LogIn className="size-4" />
          Coordinator sign in
        </Link>
      </section>
    );
  }

  const supplyBySize = new Map(
    stats.availableShoesBySize.map((item) => [item.size, Number(item.count)])
  );

  const actions = [
    { href: "/equipment", icon: Package, label: "Inventory" },
    { href: "/kids", icon: Users, label: "Kids" },
    { href: "/checkouts", icon: CheckCircle, label: "Checkouts" },
    { href: "/match", icon: ScanSearch, label: "Match sizes" },
    { href: "/print", icon: Printer, label: "Print sheets" },
    { href: "/waitlist", icon: ClipboardList, label: "Waitlist" },
  ];

  return (
    <section className="overflow-hidden border border-[#284752] bg-[#15242b] text-white shadow-[0_22px_60px_rgba(21,36,43,0.16)]">
      <header className="flex flex-col justify-between gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#9fc7d6]">
            Coordinator desk
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.03em]">
            Season operations
          </h2>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex min-h-10 items-center gap-2 self-start rounded-full border border-white/20 px-4 text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </header>

      <div className="grid grid-cols-2 gap-px bg-white/10 md:grid-cols-3 lg:grid-cols-6">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex min-h-28 flex-col justify-between bg-[#15242b] p-4 transition-colors hover:bg-[#1c3039]"
          >
            <action.icon className="size-5 text-[#9fc7d6]" />
            <span className="flex items-center justify-between text-sm font-bold">
              {action.label}
              <ChevronRight className="size-4 opacity-50 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="border-b border-white/10 p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#9fc7d6]">
            Shoe supply by registered size
          </h3>
          {stats.kidsSizeDistribution.length === 0 ? (
            <p className="mt-5 text-sm text-white/55">No size data yet.</p>
          ) : (
            <div className="mt-5 space-y-4">
              {stats.kidsSizeDistribution.slice(0, 6).map((size) => {
                const needed = Number(size.count);
                const available = supplyBySize.get(size.shoeSize) ?? 0;
                const ratio = Math.min(100, (available / Math.max(needed, 1)) * 100);
                const short = available < needed;
                return (
                  <div key={size.shoeSize}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-bold">Size {size.shoeSize}</span>
                      <span className={short ? "text-[#f0a7b1]" : "text-[#94d2b9]"}>
                        {available} ready / {needed} kids
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          short ? "bg-[#d95b6b]" : "bg-[#53b28d]"
                        )}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#9fc7d6]">
              Recent activity
            </h3>
            <Link href="/checkouts" className="text-xs font-bold text-white/55 hover:text-white">
              View all
            </Link>
          </div>
          {stats.recentActivity.length === 0 ? (
            <p className="mt-5 text-sm text-white/55">No activity yet.</p>
          ) : (
            <div className="mt-3 divide-y divide-white/10">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 py-3">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      activity.returnedAt ? "bg-[#53b28d]" : "bg-[#e5b94a]"
                    )}
                  />
                  <div className="min-w-0 flex-1 text-sm">
                    <span className="font-bold">{activity.kidName}</span>
                    <span className="ml-1.5 text-white/55">
                      {activity.returnedAt ? "returned" : "borrowed"}{" "}
                      {activity.equipmentType}
                      {activity.equipmentSize ? ` · ${activity.equipmentSize}` : ""}
                    </span>
                  </div>
                  <time className="shrink-0 text-xs text-white/45">
                    {shortDate.format(
                      new Date(activity.returnedAt || activity.checkedOutAt)
                    )}
                  </time>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-[42rem] rounded-[2rem] lg:h-[36rem]" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      try {
        const response = await fetch("/api/stats", { signal: controller.signal });
        if (!response.ok) {
          throw new Error("Stats request failed");
        }
        const data = (await response.json()) as Stats;
        setStats(data);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLoadError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadStats();
    return () => controller.abort();
  }, []);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      router.push(`/lookup?q=${encodeURIComponent(query)}`);
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (loadError || !stats) {
    return (
      <section className="mx-auto max-w-xl border border-[#e5c5ca] bg-white px-6 py-12 text-center shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#fbedef] text-[#a92b3d]">
          <AlertTriangle className="size-5" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-[#15242b]">
          Availability is temporarily off the ice
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#5d7078]">
          Refresh the page, or email Scott if you need equipment for the next
          Little Rockers session.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#751c2b] px-5 text-sm font-bold text-white hover:bg-[#59141f]"
          >
            Refresh availability
          </button>
          <a
            href="mailto:Scott.Price@broomstones.org"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#c5d6dc] px-5 text-sm font-bold text-[#153b4d]"
          >
            <Mail className="size-4" />
            Email Scott
          </a>
        </div>
      </section>
    );
  }

  const availableShoes = stats.availableShoesBySize.reduce(
    (sum, item) => sum + Number(item.count),
    0
  );
  const availableBrooms = stats.availableBroomsBySize.reduce(
    (sum, item) => sum + Number(item.count),
    0
  );
  const supplyBySize = new Map(
    stats.availableShoesBySize.map((item) => [item.size, Number(item.count)])
  );
  const shortSizes = stats.kidsSizeDistribution
    .map((size) => {
      const available = supplyBySize.get(size.shoeSize) ?? 0;
      const needed = Number(size.count);
      return available < needed
        ? { size: size.shoeSize, gap: needed - available }
        : null;
    })
    .filter((item): item is { size: string; gap: number } => item !== null);

  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#751c2b] px-5 py-8 text-white shadow-[0_28px_80px_rgba(72,17,31,0.22)] sm:px-9 sm:py-12 lg:min-h-[36rem] lg:px-14">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-[14%] hidden w-px bg-white/12 lg:block"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-[8%] h-24 w-px rotate-[28deg] bg-white/12"
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <div className="inline-flex items-center gap-2 border-b border-white/25 pb-2 text-[0.7rem] font-black uppercase tracking-[0.18em] text-white/80">
              <span className="size-2 rounded-full bg-[#e5b94a] shadow-[0_0_0_4px_rgba(229,185,74,0.16)]" />
              2026–27 lending is open
            </div>
            <h1 className="mt-7 max-w-3xl font-display text-[clamp(3.3rem,8.5vw,6.65rem)] leading-[0.88] tracking-[-0.055em] text-white">
              EVERY KID
              <span className="block text-[#9fc7d6]">DESERVES A</span>
              CLEAN SLIDE.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/75 sm:text-lg">
              Borrow curling shoes and a broom for the whole season—free for
              every Little Rocker. Find a size, send a request, and pick it up
              from Scott at the rink.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-black text-[#59141f] transition-transform hover:-translate-y-0.5"
              >
                <UserPlus className="size-4" />
                Register a child
              </Link>
              <Link
                href="/request"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e5b94a] px-6 text-sm font-black text-[#392b08] transition-transform hover:-translate-y-0.5"
              >
                <ClipboardCheck className="size-4" />
                Request gear
              </Link>
            </div>
            <Link
              href="/lookup"
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white/75 hover:text-white"
            >
              <Eye className="size-4" />
              See what my child has
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <LiveHouse
            available={Number(stats.equipment.available)}
            shoes={availableShoes}
            brooms={availableBrooms}
          />
        </div>
      </section>

      <section aria-label="Season snapshot" className="grid border-y border-[#c5d6dc] sm:grid-cols-3">
        {[
          {
            value: stats.kids.total,
            label: "Little Rockers registered",
            note: "Growing the game together",
          },
          {
            value: stats.checkouts.activeCheckouts,
            label: "Items on the ice",
            note: "Currently checked out",
          },
          {
            value: stats.equipment.available,
            label: "Items ready to borrow",
            note: "Live inventory",
          },
        ].map((item, index) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center gap-4 px-3 py-5 sm:px-6",
              index < 2 && "border-b border-[#c5d6dc] sm:border-b-0 sm:border-r"
            )}
          >
            <span className="font-display text-4xl leading-none text-[#751c2b]">
              {item.value}
            </span>
            <span>
              <span className="block text-sm font-extrabold text-[#15242b]">
                {item.label}
              </span>
              <span className="text-xs text-[#5d7078]">{item.note}</span>
            </span>
          </div>
        ))}
      </section>

      <section id="availability" className="scroll-mt-28">
        <div className="grid gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#751c2b]">
              Live from the equipment room
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-4xl leading-[0.96] tracking-[-0.04em] text-[#15242b] sm:text-5xl">
              FIND THE RIGHT FIT BEFORE PRACTICE.
            </h2>
          </div>
          <div>
            <p className="max-w-xl text-base leading-7 text-[#5d7078]">
              Counts update as gear is checked out and returned. Search your
              child’s name to see their current equipment, or browse what is
              ready now.
            </p>
            <form onSubmit={handleSearch} className="mt-4" role="search">
              <label htmlFor="child-search" className="sr-only">
                Search by child’s name
              </label>
              <div className="flex min-h-14 overflow-hidden border border-[#b8cdd4] bg-white shadow-sm focus-within:border-[#2480a8] focus-within:ring-2 focus-within:ring-[#2480a8]/20">
                <Search className="ml-4 size-5 shrink-0 self-center text-[#75868d]" />
                <input
                  id="child-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by child’s name"
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent px-3 text-base text-[#15242b] outline-none placeholder:text-[#89979c]"
                />
                <button
                  type="submit"
                  className="m-1 inline-flex min-w-12 items-center justify-center bg-[#153b4d] px-4 text-sm font-black text-white hover:bg-[#0f2c3a]"
                >
                  <span className="hidden sm:inline">Look up</span>
                  <ArrowRight className="size-4 sm:ml-2" />
                  <span className="sr-only sm:hidden">Look up equipment</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <EquipmentAvailability
            title="Curling shoes"
            description="Clean sliders, organized by size"
            icon={Footprints}
            items={stats.availableShoesBySize}
          />
          <EquipmentAvailability
            title="Junior brooms"
            description="Matched by height where available"
            icon={Brush}
            items={stats.availableBroomsBySize}
          />
        </div>

        {shortSizes.length > 0 ? (
          <div className="mt-5 flex flex-col justify-between gap-4 border-l-4 border-[#e5b94a] bg-[#fff9e9] px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#8b6113]" />
              <div>
                <p className="font-extrabold text-[#5c430f]">
                  Some popular sizes are tight
                </p>
                <p className="mt-0.5 text-sm leading-6 text-[#775c22]">
                  {shortSizes
                    .slice(0, 4)
                    .map((item) => `Size ${item.size}`)
                    .join(", ")}
                  {shortSizes.length > 4 ? " and more" : ""}. Request what you
                  need—we’ll place you on the waitlist if it is not available.
                </p>
              </div>
            </div>
            <Link
              href="/request"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full bg-[#751c2b] px-5 text-sm font-black text-white hover:bg-[#59141f]"
            >
              Request a size
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : null}
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-28 overflow-hidden bg-[#153b4d] text-white"
      >
        <div className="grid lg:grid-cols-[0.7fr_1.3fr]">
          <div className="border-b border-white/10 p-6 sm:p-9 lg:border-b-0 lg:border-r">
            <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#9fc7d6]">
              Your path onto the ice
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[0.96] tracking-[-0.04em] sm:text-5xl">
              BORROW IN FOUR EASY ENDS.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-white/65">
              The exchange runs on trust. Take what your child needs, keep it in
              playing condition, and bring it back when the season ends.
            </p>
          </div>
          <ol className="grid sm:grid-cols-2">
            {[
              {
                number: "01",
                icon: UserPlus,
                title: "Register",
                copy: "Add your child and their current shoe size.",
                href: "/register",
                action: "Register a child",
              },
              {
                number: "02",
                icon: ClipboardCheck,
                title: "Request",
                copy: "Choose shoes, a broom, or both from live inventory.",
                href: "/request",
                action: "Request gear",
              },
              {
                number: "03",
                icon: MapPin,
                title: "Pick up",
                copy: "Scott will have the gear ready at a Little Rockers session.",
              },
              {
                number: "04",
                icon: RotateCcw,
                title: "Return",
                copy: "Bring everything back at season’s end so another kid can curl.",
              },
            ].map((step, index) => (
              <li
                key={step.number}
                className={cn(
                  "relative min-h-56 p-6 sm:p-8",
                  index % 2 === 0 && "sm:border-r sm:border-white/10",
                  index < 2 && "border-b border-white/10"
                )}
              >
                <span className="absolute right-6 top-5 font-display text-5xl text-white/[0.06]">
                  {step.number}
                </span>
                <step.icon className="size-6 text-[#e5b94a]" />
                <h3 className="mt-8 text-xl font-extrabold">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-white/60">
                  {step.copy}
                </p>
                {step.href ? (
                  <Link
                    href={step.href}
                    className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-[#9fc7d6] hover:text-white"
                  >
                    {step.action}
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <span className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-white/45">
                    <Check className="size-4" />
                    At the rink
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "No fees. No fuss.",
            copy: "The exchange is free for Little Rockers families and supported by the club community.",
          },
          {
            icon: PackageCheck,
            title: "One set per curler.",
            copy: "Borrow one pair of shoes and one broom per child so every family gets a fair shot.",
          },
          {
            icon: Clock3,
            title: "Return at season’s end.",
            copy: "Report damage when it happens and return gear promptly so it is ready for next year.",
          },
        ].map((item) => (
          <div key={item.title} className="border-t-2 border-[#2480a8] bg-white px-5 py-6">
            <item.icon className="size-5 text-[#751c2b]" />
            <h3 className="mt-5 text-lg font-extrabold text-[#15242b]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#5d7078]">{item.copy}</p>
          </div>
        ))}
      </section>

      <CoordinatorPanel stats={stats} />
    </div>
  );
}
