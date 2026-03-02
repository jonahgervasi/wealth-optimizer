import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/layout/NavBar";
import { StoreProvider } from "@/store/StoreProvider";

export const metadata: Metadata = {
  title: "WealthOptimizer AI — Canadian Account Optimization",
  description:
    "AI-native registered account optimization for Canadian investors. TFSA, RRSP, FHSA, RESP strategies powered by Claude.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-navy-900 min-h-screen">
        <StoreProvider>
          <NavBar />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
