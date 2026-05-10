'use client';

import { useEffect } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

interface HomeWrapperProps {
  children: React.ReactNode;
}

export default function HomeWrapper({ children }: HomeWrapperProps) {
  const { stopLoading } = useLoading();

  useEffect(() => {
    // Stop loading immediately when home page loads
    stopLoading();
  }, [stopLoading]);

  return <>{children}</>;
}
