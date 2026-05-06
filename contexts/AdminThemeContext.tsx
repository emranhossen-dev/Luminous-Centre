"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'blue';

interface AdminThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark'); // Default to dark theme

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    // Apply theme to document element for global styles
    document.documentElement.classList.toggle('admin-dark', theme === 'dark');
    document.documentElement.classList.toggle('admin-blue', theme === 'blue');
    document.documentElement.classList.toggle('admin-light', theme === 'light');
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
  };

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      <div className={`admin-theme-wrapper ${theme}`}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (context === undefined) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}
