import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { HouseMark } from "@/components/brand/house-mark";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#cfdee3] bg-[#e6f0f4]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <div className="flex items-center gap-3">
              <HouseMark className="size-11" />
              <div>
                <p className="text-sm font-extrabold text-[#15242b]">
                  Broomstones Equipment Exchange
                </p>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5d7078]">
                  Little Rockers · Wayland, MA
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#5d7078]">
              Free, community-supported curling gear so every junior can step
              onto the ice ready to play.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <a
              href="mailto:Scott.Price@broomstones.org"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#153b4d] hover:text-[#751c2b]"
            >
              <Mail className="size-4" />
              Ask Scott about equipment
            </a>
            <a
              href="https://juniors.broomstones.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#5d7078] hover:text-[#15242b]"
            >
              Visit the Little Rockers program
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-[#c5d6dc] pt-5 text-xs text-[#5d7078] sm:flex-row sm:items-center sm:justify-between">
          <span>
            2026–27 season · Run by volunteers at Broomstones Curling Club
          </span>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-semibold hover:text-[#15242b]">
              Coordinator sign in
            </Link>
            <a
              href="https://broomstones.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-[#15242b]"
            >
              broomstones.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
