export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#71717a]">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#911f1f] flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">B</span>
            </div>
            <span>Broomstones Curling Club</span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              Contact:{" "}
              <a
                href="mailto:Scott.Price@broomstones.org"
                className="text-[#0a0a0a] hover:underline"
              >
                Scott Price
              </a>
            </span>
            <span className="text-[#e4e4e7]">|</span>
            <a
              href="https://broomstones.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0a0a0a] transition-colors"
            >
              broomstones.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
