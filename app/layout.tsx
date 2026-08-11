import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
import LoadingOverlay from "@/components/LoadingOverlay";

// Font for English and general UI
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// High-quality Bengali font — Hind Siliguri
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LSDTC",
    template: "%s | LSDTC"
  },
  description: "Luminous Skill Development Training Center - Illuminate your skills with professional training.",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning on <html> prevents mismatch from browser extensions (e.g., Grammarly)
    <html lang="bn" className={`${inter.variable} ${hindSiliguri.variable} light`} suppressHydrationWarning>
      {/* suppressHydrationWarning on body prevents cz-shortcut-listen attribute mismatch */}
      <body
        className={`${hindSiliguri.className} antialiased selection:bg-[#2e31e1] selection:text-white transition-colors duration-300`}
        suppressHydrationWarning
      >
        <LoadingProvider>
          <AuthProvider>
            <LayoutProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
              <LoadingOverlay />
            </LayoutProvider>
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}