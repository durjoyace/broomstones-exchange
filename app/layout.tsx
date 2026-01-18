import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Little Rockers Equipment Exchange | Broomstones",
  description: "Free shoes and brooms lending for kids in the Little Rockers curling program at Broomstones",
};

const navigation = [
  { name: "Home", href: "/" },
  { name: "Equipment", href: "/equipment" },
  { name: "Kids", href: "/kids" },
  { name: "Checkouts", href: "/checkouts" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased min-h-screen bg-gray-50`}>
        {/* Header */}
        <header style={{ backgroundColor: '#911f1f' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <span className="text-white font-bold text-xl">Broomstones</span>
                  <span className="text-white/80 ml-2 text-sm hidden sm:block">Equipment Exchange</span>
                </Link>
              </div>
              <nav className="flex space-x-1 sm:space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-white/90 hover:text-white hover:bg-white/10 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer style={{ backgroundColor: '#363839' }} className="mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-white/80 text-sm text-center">
              <strong>Broomstones Curling Club</strong> - Little Rockers Program
            </p>
            <p className="text-white/60 text-xs text-center mt-1">
              Equipment Coordinator: Scott Price
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
