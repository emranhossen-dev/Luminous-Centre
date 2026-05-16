import type { Metadata } from "next";
import { Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import LoadingOverlay from "@/components/LoadingOverlay";

// Font for English and general UI
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// High-quality Bengali font
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
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
    <html lang="bn" className={`${inter.variable} ${hindSiliguri.variable}`}>
      <body className="font-sans bg-[#0b0c17] text-white antialiased selection:bg-[#2e31e1] selection:text-white transition-colors duration-300">
        <LoadingProvider>
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <LoadingOverlay />
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}