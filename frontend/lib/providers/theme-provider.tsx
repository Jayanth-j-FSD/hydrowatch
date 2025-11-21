'use client';

import { ReactNode, useEffect } from 'react';
import { useThemeStore } from '../stores/theme-store';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}

