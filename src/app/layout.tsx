import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PortfolioCraft - Multi-User SaaS Portfolio Platform",
  description:
    "Create, customize, and publish professional portfolio websites with modular sections, custom themes, and instant public URLs.",
  keywords: [
    "portfolio builder",
    "developer portfolio",
    "academic portfolio",
    "student portfolio",
    "saas portfolio platform",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen flex flex-col antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
