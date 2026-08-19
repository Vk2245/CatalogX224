import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CatalogX | AI-Powered Product Intelligence",
  description:
    "Transform product PDFs into structured, validated, tamper-proof data using autonomous AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen hero-bg flex flex-col`}
      >
        <Navbar />
        <main className="flex-1 w-full relative z-10">{children}</main>
        <footer className="w-full text-center py-8 text-[var(--muted)] text-xs relative z-10 border-t border-[var(--border)]">
          <p>© {new Date().getFullYear()} CatalogX — Built for UNIHACK 2026</p>
        </footer>
      </body>
    </html>
  );
}
