"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useLayout } from "@/contexts/LayoutContext";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hideNavbarAndFooter } = useLayout();
  const isPanel = pathname.startsWith('/admin') || 
                  pathname.startsWith('/student') || 
                  pathname.startsWith('/mentor') || 
                  pathname.startsWith('/employee');

  if (isPanel || hideNavbarAndFooter) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <AuthModal />
    </>
  );
}
