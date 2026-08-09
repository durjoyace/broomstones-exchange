import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t-4 border-[#BC1F25] bg-[#2C2E35] text-white">
      <div className="mx-auto max-w-7xl px-4 py-11 sm:px-6 lg:px-8">
        <div className="grid gap-9 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <Image
              src="https://broomstones.com/wide-logo-white.png"
              alt="Broomstones Curling Club"
              width={230}
              height={68}
              className="h-10 w-auto"
            />
            <p className="mt-4 font-display text-base font-bold uppercase tracking-[0.1em] text-white/72">
              Equipment Exchange · Little Rockers
            </p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/62">
              Free, community-supported curling gear so every junior can step
              onto the ice ready to play.
            </p>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-white/45">
              Tradition · Community · Excellence
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <a
              href="mailto:Scott.Price@broomstones.org"
              className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-white hover:text-[#F1B9BC]"
            >
              <Mail className="size-4 text-[#F1B9BC]" />
              Ask Scott about equipment
            </a>
            <a
              href="https://juniors.broomstones.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-white/60 hover:text-white"
            >
              Visit the Little Rockers program
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
        <div className="mt-9 flex flex-col gap-3 border-t border-white/12 pt-5 text-xs text-white/48 sm:flex-row sm:items-center sm:justify-between">
          <span>2026–27 season · Run by volunteers in Wayland, Massachusetts</span>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-semibold hover:text-white">
              Coordinator sign in
            </Link>
            <a
              href="https://broomstones.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:text-white"
            >
              broomstones.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
