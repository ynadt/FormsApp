import React, { createContext, useContext, useState, useEffect } from 'react';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('theme-mode');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  console.log('No window object found; defaulting to light theme');
  return 'light';
}

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProviderCustom: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    document.body.setAttribute('data-toolpad-color-scheme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeCustom = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeCustom must be used within a ThemeProviderCustom');
  }
  return context;
};
