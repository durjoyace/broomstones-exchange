"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Brush,
  CalendarDays,
  Footprints,
  LockKeyhole,
  PackageSearch,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

type CheckoutInfo = {
  id: number;
  equipmentType: string;
  equipmentSize: string | null;
  equipmentBrand: string | null;
  checkedOutAt: string;
};

type KidInfo = {
  id: number;
  name: string;
  shoeSize: string | null;
  checkouts: CheckoutInfo[];
};

const fullDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function LookupContent() {
  const searchParams = useSearchParams();
  const [childName, setChildName] = useState(searchParams.get("q") || "");
  const [parentEmail, setParentEmail] = useState("");
  const [result, setResult] = useState<KidInfo | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  async function performSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setLookupError("");

    try {
      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_name: childName,
          parent_email: parentEmail,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setResult(null);
        setLookupError(
          data.error === "Validation failed"
            ? "Enter the child’s full name and a valid parent email."
            : "Equipment lookup is temporarily unavailable."
        );
      } else {
        setResult(data[0] || null);
        setSearched(true);
      }
    } catch {
      setResult(null);
      setLookupError("Equipment lookup is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/"
        className="mb-6 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#5B6870] hover:text-[#2C2E35]"
      >
        <ArrowLeft className="size-4" />
        Back to availability
      </Link>

      <div className="grid overflow-hidden rounded-2xl border border-[#D9DEE1] bg-white shadow-[0_20px_56px_rgba(44,46,53,0.09)] lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="relative overflow-hidden bg-[#2C2E35] p-6 text-white sm:p-9">
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-24 size-64 rounded-full border-[42px] border-[#BC1F25]/30"
          />
          <h1 className="relative font-display text-4xl leading-[0.95] tracking-[-0.04em] sm:text-5xl">
            KNOW WHAT’S IN YOUR HACK.
          </h1>
          <p className="relative mt-5 max-w-md text-sm leading-6 text-white/65">
            Check the gear currently assigned to your child and when it left the
            equipment room.
          </p>

          <div className="relative mt-10 flex gap-3 border-t border-white/10 pt-6">
            <LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#F1B9BC]" />
            <div>
              <p className="text-sm font-extrabold">Private family access</p>
              <p className="mt-1 text-xs leading-5 text-white/55">
                Enter the same child name and parent email used at registration.
                No public roster or partial-name search.
              </p>
            </div>
          </div>
        </aside>

        <div className="p-5 sm:p-9">
          <div className="border-b border-[#D9DEE1] pb-6">
            <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-[#2C2E35]">
              Find a family registration
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5B6870]">
              We’ll match both fields before showing any equipment.
            </p>
          </div>

          <form onSubmit={performSearch} className="mt-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="child-name">Child’s full name</Label>
                <Input
                  id="child-name"
                  name="child_name"
                  value={childName}
                  onChange={(event) => setChildName(event.target.value)}
                  required
                  autoComplete="name"
                  placeholder="As registered"
                  className="mt-2 h-11 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="parent-email">Parent email</Label>
                <Input
                  id="parent-email"
                  name="parent_email"
                  type="email"
                  value={parentEmail}
                  onChange={(event) => setParentEmail(event.target.value)}
                  required
                  autoComplete="email"
                  placeholder="Used at registration"
                  className="mt-2 h-11 bg-white"
                />
              </div>
            </div>

            {lookupError ? (
              <p
                role="alert"
                className="mt-3 rounded-xl border border-[#E5C5CA] bg-[#FBEDEF] px-3 py-2 text-sm font-medium text-[#8E2635]"
              >
                {lookupError}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              className="mt-5 h-12 w-full rounded-full bg-[#BC1F25] text-white hover:bg-[#99191E]"
              disabled={loading || !childName || !parentEmail}
            >
              {loading ? "Checking the roster…" : "View equipment"}
              {!loading ? <Search className="size-4" /> : null}
            </Button>
          </form>

          {loading ? (
            <div className="mt-8 space-y-3 border-t border-[#D9DEE1] pt-7">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : null}

          {!loading && searched && !result ? (
            <div className="mt-8 border-t border-[#D9DEE1] pt-8 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#E8ECEE] text-[#2C2E35]">
                <PackageSearch className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold text-[#2C2E35]">
                No matching registration
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#5B6870]">
                Check the spelling and use the email entered at registration. If
                the child is new, register them first.
              </p>
              <Link
                href="/register"
                className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-bold text-[#BC1F25] hover:underline"
              >
                Register a child
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : null}

          {!loading && result ? (
            <div className="mt-8 border-t border-[#D9DEE1] pt-7">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#2e7c60]">
                    Registration matched
                  </p>
                  <h3 className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#2C2E35]">
                    {result.name}
                  </h3>
                  {result.shoeSize ? (
                    <p className="mt-1 text-sm text-[#5B6870]">
                      Registered shoe size: {result.shoeSize}
                    </p>
                  ) : null}
                </div>
                <span className="self-start rounded-full bg-[#edf6f2] px-3 py-1.5 text-xs font-bold text-[#226a52]">
                  {result.checkouts.length} item
                  {result.checkouts.length === 1 ? "" : "s"} checked out
                </span>
              </div>

              {result.checkouts.length === 0 ? (
                <div className="mt-5 rounded-xl border border-[#D9DEE1] bg-[#F6F7F8] px-5 py-7 text-center">
                  <p className="font-extrabold text-[#2C2E35]">
                    No equipment is currently assigned
                  </p>
                  <p className="mt-1 text-sm text-[#5B6870]">
                    Need gear for the season? Send a request.
                  </p>
                  <Link
                    href="/request"
                    className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-bold text-[#BC1F25] hover:underline"
                  >
                    Request equipment
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              ) : (
                <div className="mt-5 divide-y divide-[#D9DEE1] overflow-hidden rounded-xl border border-[#D9DEE1]">
                  {result.checkouts.map((checkout) => {
                    const Icon =
                      checkout.equipmentType === "shoes" ? Footprints : Brush;
                    return (
                      <article
                        key={checkout.id}
                        className="flex flex-col justify-between gap-4 px-4 py-5 sm:flex-row sm:items-center sm:px-5"
                      >
                        <div className="flex items-center gap-4">
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#E8ECEE] text-[#2C2E35]">
                            <Icon className="size-5" />
                          </span>
                          <div>
                            <h4 className="font-extrabold capitalize text-[#2C2E35]">
                              {checkout.equipmentType}
                              {checkout.equipmentSize
                                ? ` · ${checkout.equipmentSize}`
                                : ""}
                            </h4>
                            {checkout.equipmentBrand ? (
                              <p className="mt-0.5 text-sm text-[#5B6870]">
                                {checkout.equipmentBrand}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pl-[3.75rem] text-xs font-semibold text-[#5B6870] sm:pl-0">
                          <CalendarDays className="size-4" />
                          Borrowed {fullDate.format(new Date(checkout.checkedOutAt))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <p className="mt-4 text-xs leading-5 text-[#69767E]">
                To return or exchange an item, bring it to Scott at a Little
                Rockers session.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl space-y-5">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-[34rem] w-full" />
        </div>
      }
    >
      <LookupContent />
    </Suspense>
  );
}
