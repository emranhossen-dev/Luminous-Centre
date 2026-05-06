"use client";

import React from 'react';
import StudentLayout from '@/components/student/StudentLayout';

export default function StudentLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentLayout>{children}</StudentLayout>;
}
