import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Courses',
    template: '%s | LSDTC'
  },
};

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
