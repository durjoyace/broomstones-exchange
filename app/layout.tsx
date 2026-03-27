import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Little Rockers Equipment Exchange | Broomstones",
  description:
    "Free shoes and brooms lending for kids in the Little Rockers curling program at Broomstones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="max-w-[1170px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
          {children}
        </main>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
