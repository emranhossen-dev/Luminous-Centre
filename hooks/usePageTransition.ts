'use client';

import { useEffect, useState } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

export const usePageTransition = () => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handlePageTransition = (callback: () => void) => {
    setIsTransitioning(true);
    startLoading();
    
    // Small delay to ensure loading state is visible
    setTimeout(() => {
      callback();
      setTimeout(() => {
        stopLoading();
        setIsTransitioning(false);
      }, 300);
    }, 100);
  };

  const quickTransition = (callback: () => void) => {
    // For faster transitions when coming back to home
    callback();
    setTimeout(() => {
      stopLoading();
      setIsTransitioning(false);
    }, 100);
  };

  return {
    isTransitioning,
    handlePageTransition,
    quickTransition
  };
};
