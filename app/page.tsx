"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
    <article className="overflow-hidden rounded-2xl border border-[#D9DEE1] bg-white shadow-[0_16px_40px_rgba(44,46,53,0.07)]">
      <header className="flex items-start justify-between gap-4 border-b border-[#E3E7E9] px-5 py-5 sm:px-6">
        <div className="flex gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-[#E8ECEE] text-[#2C2E35]">
            <Icon className="size-5" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold tracking-[-0.025em] text-[#2C2E35]">
              {title}
            </h3>
            <p className="mt-1 text-sm text-[#5B6870]">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="block font-display text-3xl leading-none text-[#BC1F25]">
            {total}
          </span>
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#5B6870]">
            available
          </span>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="font-bold text-[#2C2E35]">Nothing on the rack today</p>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#5B6870]">
            Request the size you need and we’ll add your child to the waitlist.
          </p>
          <Link
            href="/request"
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-bold text-[#BC1F25] hover:underline"
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
                  index < items.length - 1 && "border-b border-[#E8ECEE]",
                  index % 2 === 0 && "sm:border-r sm:border-[#E8ECEE]",
                  index >= items.length - 2 && "sm:border-b-0"
                )}
              >
                <div>
                  <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#69767E]">
                    {title === "Curling shoes" ? "Shoe size" : "Broom"}
                  </span>
                  <p className="mt-0.5 text-lg font-extrabold text-[#2C2E35]">
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

function RinkAvailability({
  available,
  shoes,
  brooms,
}: {
  available: number;
  shoes: number;
  brooms: number;
}) {
  return (
    <div className="relative mx-auto min-h-[27rem] w-full max-w-[31rem] overflow-hidden rounded-t-[12rem] rounded-b-[1.5rem] border border-white/18 bg-[#5B6870] shadow-[0_30px_70px_rgba(20,21,25,0.34)] lg:min-h-[31rem]">
      <Image
        src="https://broomstones.com/hero-banner.png"
        alt="The curling sheets inside Broomstones Curling Club"
        fill
        priority
        sizes="(min-width: 1024px) 42vw, 92vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2C2E35]/95 via-[#2C2E35]/15 to-[#2C2E35]/5" />
      <div className="absolute right-5 top-16 rounded-full border border-white/35 bg-[#BC1F25]/95 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white shadow-lg backdrop-blur">
        Live inventory
      </div>
      <div className="absolute inset-x-5 bottom-5 rounded-xl border border-white/18 bg-[#2C2E35]/88 p-4 text-white shadow-xl backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-5">
        <div className="flex items-end justify-between gap-4 border-b border-white/14 pb-4">
          <div>
            <span className="font-display text-5xl font-bold leading-none">{available}</span>
            <span className="ml-2 text-xs font-black uppercase tracking-[0.16em] text-white/62">
              pieces ready
            </span>
          </div>
          <span className="size-3 rounded-full bg-[#69B88F] shadow-[0_0_0_5px_rgba(105,184,143,0.15)]" />
        </div>
        <div className="grid grid-cols-2 divide-x divide-white/14 pt-4">
          <div>
            <span className="block text-[0.66rem] font-bold uppercase tracking-[0.14em] text-white/52">
              Shoes
            </span>
            <span className="font-display text-2xl font-bold">{shoes}</span>
          </div>
          <div className="pl-5">
            <span className="block text-[0.66rem] font-bold uppercase tracking-[0.14em] text-white/52">
              Brooms
            </span>
            <span className="font-display text-2xl font-bold">{brooms}</span>
          </div>
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
      <section className="flex flex-col justify-between gap-5 rounded-2xl border border-[#D9DEE1] bg-white px-5 py-6 sm:flex-row sm:items-center sm:px-7">
        <div>
          <h2 className="text-xl font-extrabold tracking-[-0.025em] text-[#2C2E35]">
            Running the exchange today?
          </h2>
          <p className="mt-1 text-sm text-[#5B6870]">
            Open checkouts, inventory, match tools, and print sheets.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#C9D0D4] px-5 text-sm font-bold text-[#2C2E35] transition-colors hover:border-[#BC1F25] hover:bg-[#E8ECEE]"
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
    <section className="overflow-hidden rounded-2xl border border-[#454850] bg-[#2C2E35] text-white shadow-[0_18px_50px_rgba(44,46,53,0.14)]">
      <header className="flex flex-col justify-between gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
        <h2 className="text-2xl font-extrabold tracking-[-0.03em]">
          Season operations
        </h2>
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
            className="group flex min-h-28 flex-col justify-between bg-[#2C2E35] p-4 transition-colors hover:bg-[#353840]"
          >
            <action.icon className="size-5 text-[#CBD1D5]" />
            <span className="flex items-center justify-between text-sm font-bold">
              {action.label}
              <ChevronRight className="size-4 opacity-50 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="border-b border-white/10 p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#CBD1D5]">
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
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[#CBD1D5]">
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
                      activity.returnedAt ? "bg-[#53b28d]" : "bg-[#BC1F25]"
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
        <h1 className="mt-5 text-2xl font-extrabold text-[#2C2E35]">
          Availability is temporarily off the ice
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#5B6870]">
          Refresh the page, or email Scott if you need equipment for the next
          Little Rockers session.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#BC1F25] px-5 text-sm font-bold text-white hover:bg-[#99191E]"
          >
            Refresh availability
          </button>
          <a
            href="mailto:Scott.Price@broomstones.org"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#C9D0D4] px-5 text-sm font-bold text-[#2C2E35]"
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
      <section className="relative isolate overflow-hidden rounded-2xl border border-[#454850] bg-[#2C2E35] text-white shadow-[0_24px_64px_rgba(44,46,53,0.18)]">
        <div aria-hidden="true" className="absolute -left-28 -top-28 size-80 rounded-full border-[42px] border-[#BC1F25]/16" />
        <div className="relative grid items-center gap-10 px-5 py-8 sm:px-9 sm:py-12 lg:min-h-[38rem] lg:grid-cols-[1.02fr_0.98fr] lg:px-14">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/[0.06] px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/78">
              <span className="size-2 rounded-full bg-[#69B88F] shadow-[0_0_0_4px_rgba(105,184,143,0.14)]" />
              2026–27 lending is open
            </div>
            <h1 className="mt-6 max-w-3xl font-display text-[clamp(3.4rem,8vw,6rem)] font-bold uppercase leading-[0.86] tracking-[-0.035em] text-white">
              Little Rockers,
              <span className="block text-[#F1B9BC]">ready for the ice.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/68 sm:text-lg">
              Borrow curling shoes and a broom for the whole season—free for
              every Little Rocker. Find a size, send a request, and pick it up
              from Scott at the club.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/request"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#BC1F25] px-6 text-sm font-black text-white transition-transform hover:-translate-y-0.5 hover:bg-[#A51B20]"
              >
                <ClipboardCheck className="size-4" />
                Request gear
              </Link>
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/24 bg-white px-6 text-sm font-black text-[#2C2E35] transition-transform hover:-translate-y-0.5"
              >
                <UserPlus className="size-4" />
                Register a child
              </Link>
            </div>
            <Link
              href="/lookup"
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-white/62 hover:text-white"
            >
              <Eye className="size-4" />
              See what my child has
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <RinkAvailability
            available={Number(stats.equipment.available)}
            shoes={availableShoes}
            brooms={availableBrooms}
          />
        </div>
      </section>

      <section id="availability" className="scroll-mt-28">
        <div className="grid gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <h2 className="max-w-2xl font-display text-4xl leading-[0.96] tracking-[-0.04em] text-[#2C2E35] sm:text-5xl">
              FIND THE RIGHT FIT BEFORE PRACTICE.
            </h2>
          </div>
          <div>
            <p className="max-w-xl text-base leading-7 text-[#5B6870]">
              Counts update as gear is checked out and returned. Search your
              child’s name to see their current equipment, or browse what is
              ready now.
            </p>
            <form onSubmit={handleSearch} className="mt-4" role="search">
              <label htmlFor="child-search" className="sr-only">
                Search by child’s name
              </label>
              <div className="flex min-h-14 overflow-hidden rounded-xl border border-[#B9C1C6] bg-white focus-within:border-[#BC1F25] focus-within:ring-2 focus-within:ring-[#BC1F25]/20">
                <Search className="ml-4 size-5 shrink-0 self-center text-[#69767E]" />
                <input
                  id="child-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by child’s name"
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent px-3 text-base text-[#2C2E35] outline-none placeholder:text-[#7C878D]"
                />
                <button
                  type="submit"
                  className="m-1 inline-flex min-w-12 items-center justify-center rounded-lg bg-[#2C2E35] px-4 text-sm font-black text-white hover:bg-[#1D2026]"
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
          <div className="mt-5 flex flex-col justify-between gap-4 rounded-xl border border-[#E5D3A8] bg-[#FFF9E9] px-5 py-4 sm:flex-row sm:items-center">
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
              className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-full bg-[#BC1F25] px-5 text-sm font-black text-white hover:bg-[#99191E]"
            >
              Request a size
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : null}
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-28 overflow-hidden rounded-2xl bg-[#2C2E35] text-white"
      >
        <div className="grid lg:grid-cols-[0.7fr_1.3fr]">
          <div className="border-b border-white/10 p-6 sm:p-9 lg:border-b-0 lg:border-r">
            <h2 className="font-display text-4xl leading-[0.96] tracking-[-0.04em] sm:text-5xl">
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
                <step.icon className="size-6 text-[#BC1F25]" />
                <h3 className="mt-8 text-xl font-extrabold">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-white/60">
                  {step.copy}
                </p>
                {step.href ? (
                  <Link
                    href={step.href}
                    className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-[#CBD1D5] hover:text-white"
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

      <section className="overflow-hidden rounded-2xl border border-[#D9DEE1] bg-white lg:grid lg:grid-cols-[0.62fr_1.38fr]">
        <div className="bg-[#BC1F25] px-6 py-8 text-white sm:px-8 lg:py-10">
          <h2 className="font-display text-4xl leading-[0.94] tracking-[-0.035em] sm:text-5xl">
            THE CLUB LENDING AGREEMENT.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/72">
            Free equipment works because every family helps care for the shared rack.
          </p>
        </div>
        <ul className="divide-y divide-[#E3E7E9]">
          {[
            {
              icon: ShieldCheck,
              title: "Free for Little Rockers",
              copy: "The club community covers the exchange, so families never pay a lending fee.",
            },
            {
              icon: PackageCheck,
              title: "One set per curler",
              copy: "Borrow one pair of shoes and one broom per child so every family gets a fair shot.",
            },
            {
              icon: Clock3,
              title: "Back at season’s end",
              copy: "Report damage when it happens and return gear promptly for the next young curler.",
            },
          ].map((item) => (
            <li key={item.title} className="flex gap-4 px-6 py-6 sm:px-8">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4E4E5] text-[#BC1F25]">
                <item.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-[#2C2E35]">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#5B6870]">{item.copy}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <CoordinatorPanel stats={stats} />
    </div>
  );
}
