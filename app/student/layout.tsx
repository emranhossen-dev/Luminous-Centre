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

  if (hideNavbarAndFooter) {
    return <>{children}</>;
  }

  return <StudentLayout>{children}</StudentLayout>;
}
