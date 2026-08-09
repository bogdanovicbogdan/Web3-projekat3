import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sealary FHE | Confidential & Yield-Generating Crypto Payroll",
  description: "FHE Encrypted Payroll Platform with Automated ERC-4626 DeFi Yield Engine for Unclaimed Salaries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
