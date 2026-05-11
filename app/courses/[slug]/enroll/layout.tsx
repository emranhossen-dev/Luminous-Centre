import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Enroll',
    template: '%s | LSDTC'
  },
};

export default function EnrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
