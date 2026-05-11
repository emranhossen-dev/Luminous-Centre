import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Seminar',
    template: '%s | LSDTC'
  },
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
