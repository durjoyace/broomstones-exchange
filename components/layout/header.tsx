"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Boxes,
  ClipboardCheck,
  ExternalLink,
  Home,
  Inbox,
  Menu,
  Printer,
  ScanSearch,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/useAuth";

type NavigationItem = { name: string; href: string; icon?: LucideIcon };

const publicNavigation: NavigationItem[] = [
  { name: "Availability", href: "/#availability" },
  { name: "How it works", href: "/#how-it-works" },
  { name: "My equipment", href: "/lookup" },
];

const coordinatorNavigation: NavigationItem[] = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Inventory", href: "/equipment", icon: Boxes },
  { name: "Kids", href: "/kids", icon: Users },
  { name: "Checkouts", href: "/checkouts", icon: ClipboardCheck },
  { name: "Requests", href: "/waitlist", icon: Inbox },
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
  const { authenticated } = useAuth(false);
  const coordinatorMode =
    coordinatorPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    (pathname === "/" && authenticated === true);
  const navigation = coordinatorMode
    ? coordinatorNavigation
    : publicNavigation;

  function itemIsActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b-4 border-[#BC1F25] bg-[#2C2E35]/95 text-white shadow-[0_10px_30px_rgba(44,46,53,0.16)] backdrop-blur-xl">
      <nav
        aria-label={coordinatorMode ? "Coordinator navigation" : "Primary navigation"}
        className="mx-auto flex h-[4.75rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-[#2C2E35]"
        >
          <Image
            src="https://broomstones.com/wide-logo-white.png"
            alt="Broomstones Curling Club"
            width={206}
            height={60}
            priority
            className="h-8 w-auto sm:h-9"
          />
          <span className="hidden h-8 w-px bg-white/25 sm:block" aria-hidden="true" />
          <span className="hidden leading-none sm:block">
            <span className="block font-display text-sm font-bold uppercase tracking-[0.08em] text-white">
              Equipment
            </span>
            <span className="mt-0.5 block font-display text-sm font-bold uppercase tracking-[0.08em] text-white/65">
              {coordinatorMode ? "Operations" : "Exchange"}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const isActive = itemIsActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-white/12 text-white"
                    : "text-white/68 hover:bg-white/8 hover:text-white"
                )}
              >
                {Icon ? <Icon className="size-4" /> : null}
                {item.name}
              </Link>
            );
          })}
          <Button
            size="lg"
            className="ml-2 h-10 rounded-full bg-[#BC1F25] px-5 text-white shadow-sm hover:bg-[#99191E]"
            render={<Link href={coordinatorMode ? "/match" : "/request"} />}
          >
            {coordinatorMode ? <ScanSearch className="size-4" /> : null}
            {coordinatorMode ? "Match sizes" : "Request gear"}
            {!coordinatorMode ? <ArrowRight className="size-4" /> : null}
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-11 rounded-full text-white hover:bg-white/10 hover:text-white md:hidden"
              >
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            }
          />
          <SheetContent side="right" className="w-[min(22rem,90vw)] bg-[#F6F7F8] p-6">
            <SheetTitle className="text-left">
              <Image
                src="https://broomstones.com/images/branding/logo.png"
                alt="Broomstones Curling Club"
                width={154}
                height={154}
                className="h-20 w-auto"
              />
              <span className="mt-3 block font-display text-lg font-bold uppercase tracking-[0.08em] text-[#2C2E35]">
                {coordinatorMode ? "Season Operations" : "Equipment Exchange"}
              </span>
            </SheetTitle>
            <div
              className={cn(
                "mt-6 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold",
                coordinatorMode
                  ? "border-[#D5DADD] bg-white text-[#2C2E35]"
                  : "border-[#D7E8E0] bg-[#EDF6F2] text-[#226A52]"
              )}
            >
              <span
                className={cn(
                  "size-2 rounded-full",
                  coordinatorMode ? "bg-[#5B6870]" : "bg-[#2E9A72]"
                )}
              />
              {coordinatorMode ? "Coordinator mode" : "2026–27 lending is open"}
            </div>
            <div className="mt-6 flex flex-col gap-1">
              {navigation.map((item) => {
                const isActive = itemIsActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center gap-2.5 rounded-lg px-3 py-3 text-base font-semibold transition-colors",
                      isActive
                        ? "bg-[#F4E4E5] text-[#99191E]"
                        : "text-[#5B6870] hover:bg-white hover:text-[#2C2E35]"
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
                    href="/print"
                    onClick={() => setOpen(false)}
                    className="mt-3 flex min-h-12 items-center justify-between rounded-lg border border-[#C9D0D4] bg-white px-4 py-3 text-base font-bold text-[#2C2E35]"
                  >
                    Print session sheet
                    <Printer className="size-4" />
                  </Link>
                  <Link
                    href="/match"
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center justify-between rounded-lg bg-[#BC1F25] px-4 py-3 text-base font-bold text-white"
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
                    className="mt-3 flex min-h-12 items-center justify-between rounded-lg border border-[#C9D0D4] bg-white px-4 py-3 text-base font-bold text-[#2C2E35]"
                  >
                    Register a child
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/request"
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center justify-between rounded-lg bg-[#BC1F25] px-4 py-3 text-base font-bold text-white"
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
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5B6870] hover:text-[#2C2E35]"
              >
                View public exchange
                <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <a
                href="https://juniors.broomstones.org"
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#5B6870] hover:text-[#2C2E35]"
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
