"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Boxes,
  ClipboardCheck,
  ExternalLink,
  Home,
  Menu,
  ScanSearch,
  Users,
} from "lucide-react";
import { HouseMark } from "@/components/brand/house-mark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const publicNavigation = [
  { name: "Availability", href: "/#availability" },
  { name: "How it works", href: "/#how-it-works" },
  { name: "My equipment", href: "/lookup" },
];

const coordinatorNavigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Inventory", href: "/equipment", icon: Boxes },
  { name: "Kids", href: "/kids", icon: Users },
  { name: "Checkouts", href: "/checkouts", icon: ClipboardCheck },
];

const coordinatorPrefixes = [
  "/equipment",
  "/kids",
  "/checkouts",
  "/print",
  "/waitlist",
  "/match",
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const coordinatorMode = coordinatorPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const navigation = coordinatorMode
    ? coordinatorNavigation
    : publicNavigation;

  function itemIsActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#cfdee3]/90 bg-white/92 backdrop-blur-xl">
      <nav
        aria-label={coordinatorMode ? "Coordinator navigation" : "Primary navigation"}
        className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2480a8] focus-visible:ring-offset-4"
        >
          <HouseMark className="size-10 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="leading-none">
            <span className="block text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#5d7078]">
              Broomstones
            </span>
            <span className="mt-1 block text-base font-extrabold tracking-[-0.025em] text-[#15242b]">
              {coordinatorMode ? "Season Operations" : "Equipment Exchange"}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const isActive = itemIsActive(item.href);
            const Icon = "icon" in item ? item.icon : null;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-[#e6f0f4] text-[#153b4d]"
                    : "text-[#5d7078] hover:bg-[#f2f7f9] hover:text-[#15242b]"
                )}
              >
                {Icon ? <Icon className="size-4" /> : null}
                {item.name}
              </Link>
            );
          })}
          <Button
            size="lg"
            className="ml-2 h-10 rounded-full bg-[#751c2b] px-5 text-white shadow-sm hover:bg-[#59141f]"
            render={<Link href={coordinatorMode ? "/match" : "/request"} />}
          >
            {coordinatorMode ? (
              <ScanSearch className="size-4" />
            ) : null}
            {coordinatorMode ? "Match sizes" : "Request gear"}
            {!coordinatorMode ? <ArrowRight className="size-4" /> : null}
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden">
            <Button variant="ghost" size="icon" className="size-11 rounded-full">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(22rem,90vw)] bg-white p-6">
            <SheetTitle className="flex items-center gap-3 text-left text-lg font-extrabold">
              <HouseMark className="size-9" />
              {coordinatorMode ? "Season Operations" : "Equipment Exchange"}
            </SheetTitle>
            <div
              className={cn(
                "mt-7 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
                coordinatorMode
                  ? "bg-[#e6f0f4] text-[#153b4d]"
                  : "bg-[#edf6f2] text-[#226a52]"
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  coordinatorMode ? "bg-[#2480a8]" : "bg-[#2e9a72]"
                )}
              />
              {coordinatorMode
                ? "Coordinator mode"
                : "2026–27 lending is open"}
            </div>
            <div className="mt-6 flex flex-col gap-1">
              {navigation.map((item) => {
                const isActive = itemIsActive(item.href);
                const Icon = "icon" in item ? item.icon : null;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center gap-2.5 rounded-xl px-3 py-3 text-base font-semibold transition-colors",
                      isActive
                        ? "bg-[#e6f0f4] text-[#153b4d]"
                        : "text-[#5d7078] hover:bg-[#f2f7f9] hover:text-[#15242b]"
                    )}
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                    {item.name}
                  </Link>
                );
              })}

              {coordinatorMode ? (
                <>
                  <Link
                    href="/waitlist"
                    onClick={() => setOpen(false)}
                    className="mt-3 flex min-h-12 items-center justify-between rounded-xl border border-[#cfdee3] px-4 py-3 text-base font-bold text-[#153b4d]"
                  >
                    Waitlist
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/match"
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center justify-between rounded-xl bg-[#751c2b] px-4 py-3 text-base font-bold text-white"
                  >
                    Match sizes
                    <ScanSearch className="size-4" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="mt-3 flex min-h-12 items-center justify-between rounded-xl border border-[#cfdee3] px-4 py-3 text-base font-bold text-[#153b4d]"
                  >
                    Register a child
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/request"
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center justify-between rounded-xl bg-[#751c2b] px-4 py-3 text-base font-bold text-white"
                  >
                    Request gear
                    <ArrowRight className="size-4" />
                  </Link>
                </>
              )}
            </div>

            {coordinatorMode ? (
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5d7078] hover:text-[#15242b]"
              >
                View public exchange
                <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <a
                href="https://juniors.broomstones.org"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5d7078] hover:text-[#15242b]"
              >
                Little Rockers program
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
