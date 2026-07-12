"use client";

import React from 'react';
import StudentLayout from '@/components/student/StudentLayout';
import { useLayout } from '@/contexts/LayoutContext';
import { usePathname } from 'next/navigation';

export default function StudentLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hideNavbarAndFooter } = useLayout();
  const pathname = usePathname();

  if (hideNavbarAndFooter || pathname === '/student') {
    return <>{children}</>;
  }

  return <StudentLayout>{children}</StudentLayout>;
}
