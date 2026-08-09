import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Broomstones Equipment Exchange",
    template: "%s | Broomstones Exchange",
  },
  description:
    "Free curling shoes and brooms for Little Rockers families at Broomstones Curling Club.",
  applicationName: "Broomstones Equipment Exchange",
  category: "sports",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#BC1F25",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${barlowCondensed.variable} scroll-smooth`}
    >
      <body
        className="min-h-screen flex flex-col antialiased"
      >
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Header />
        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
        >
          {children}
        </main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
