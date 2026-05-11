import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Course Details',
    template: '%s | LSDTC'
  },
};

export default function CourseDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
