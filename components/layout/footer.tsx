export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-red-800 rounded-full flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">B</span>
            </div>
            <span className="text-gray-500 font-medium">
              Broomstones Curling Club
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="mailto:Scott.Price@broomstones.org"
              className="hover:text-gray-600 transition-colors"
            >
              Scott.Price@broomstones.org
            </a>
            <span className="text-gray-200">|</span>
            <a
              href="https://broomstones.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 transition-colors"
            >
              broomstones.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
