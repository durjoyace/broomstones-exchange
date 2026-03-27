export function Footer() {
  return (
    <footer className="mt-auto border-t border-warm-200 bg-warm-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-burgundy/10 rounded flex items-center justify-center">
              <span className="text-burgundy text-xs font-bold">B</span>
            </div>
            <span className="text-foreground/70 font-medium">
              Broomstones Curling Club
            </span>
            <span className="text-muted-foreground/50 hidden sm:inline">
              &mdash;
            </span>
            <span className="text-muted-foreground text-xs hidden sm:inline">
              Junior Curling Program
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              Coordinator:{" "}
              <a
                href="mailto:Scott.Price@broomstones.org"
                className="text-burgundy hover:underline"
              >
                Scott Price
              </a>
            </span>
            <span className="text-muted-foreground/30">|</span>
            <a
              href="https://juniors.broomstones.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              juniors.broomstones.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
