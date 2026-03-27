"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Home, Package, Users, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Equipment", href: "/equipment", icon: Package },
  { name: "Kids", href: "/kids", icon: Users },
  { name: "Checkouts", href: "/checkouts", icon: ClipboardList },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-[#911f1f] to-[#7a1a1a] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/15 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-white font-semibold text-base tracking-tight">
                Broomstones
              </span>
              <span className="text-white/50 text-xs hidden sm:block">
                Equipment Exchange
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-0.5" aria-label="Main">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-150",
                    isActive
                      ? "bg-white/15 text-white font-medium"
                      : "text-white/65 hover:text-white hover:bg-white/8"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile nav */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="sm:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-[#faf8f5]">
              <SheetTitle className="font-display text-lg font-semibold">
                Navigation
              </SheetTitle>
              <nav className="flex flex-col gap-1 mt-6" aria-label="Mobile">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "bg-burgundy/8 text-burgundy"
                          : "text-muted-foreground hover:bg-warm-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
