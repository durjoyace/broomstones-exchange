export function Footer() {
  return (
    <footer className="bg-[#363839] mt-auto">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-2">
          <p className="text-[#d6d6d6] text-sm font-semibold">
            Broomstones Curling Club
          </p>
          <p className="text-[#b0b0b0] text-sm">
            Junior Curling Program &mdash; Equipment Exchange
          </p>
          <p className="text-[#b0b0b0] text-xs">
            Equipment Coordinator: Scott Price &ndash;{" "}
            <a
              href="mailto:Scott.Price@broomstones.org"
              className="text-[#d6d6d6] hover:text-[#f0f0f0] transition-colors duration-[400ms]"
            >
              Scott.Price@broomstones.org
            </a>
          </p>
          <p className="text-[#b0b0b0] text-xs pt-2">
            <a
              href="https://broomstones.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d6d6d6] hover:text-[#f0f0f0] transition-colors duration-[400ms]"
            >
              broomstones.com
            </a>
            <span className="mx-2 text-[#555]">&middot;</span>
            <a
              href="https://juniors.broomstones.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d6d6d6] hover:text-[#f0f0f0] transition-colors duration-[400ms]"
            >
              juniors.broomstones.org
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
