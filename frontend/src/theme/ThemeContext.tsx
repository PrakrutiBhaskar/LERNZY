import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '@/utils/constants';
import { getItem, setItem } from '@/utils/storage';
import { darkColors, lightColors, type ColorsType } from './colors';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  colors: ColorsType;
  isReady: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const storedMode = await getItem(STORAGE_KEYS.THEME_MODE);
        if (storedMode === 'light' || storedMode === 'dark') {
          setModeState(storedMode);
        }
      } catch (error) {
        console.error('Failed to load selected theme:', error);
      } finally {
        setIsReady(true);
      }
    }

    loadTheme();
  }, []);

  const setMode = async (nextMode: ThemeMode) => {
    try {
      await setItem(STORAGE_KEYS.THEME_MODE, nextMode);
      setModeState(nextMode);
    } catch (error) {
      console.error('Failed to save selected theme:', error);
    }
  };

  const value = useMemo<ThemeContextValue>(() => ({
    colors: mode === 'dark' ? darkColors : lightColors,
    isReady,
    mode,
    setMode,
    toggleMode: () => setMode(mode === 'dark' ? 'light' : 'dark'),
  }), [isReady, mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
}

export { ThemeContext };
