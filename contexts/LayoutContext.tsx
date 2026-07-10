'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  hideNavbarAndFooter: boolean;
  setHideNavbarAndFooter: (hide: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

interface LayoutProviderProps {
  children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [hideNavbarAndFooter, setHideNavbarAndFooter] = useState(false);

  return (
    <LayoutContext.Provider value={{ hideNavbarAndFooter, setHideNavbarAndFooter }}>
      {children}
    </LayoutContext.Provider>
  );
};

export default LayoutContext;
