
import React, { createContext, useEffect, useState } from 'react';
import { useTenant } from '@/hooks/useTenantContext';
import { ThemeConfig, themePresets } from '@/types/theme';
import { applyThemeToDOM } from '@/utils/themeUtils';

interface ThemeContextType {
  currentTheme: string;
  themeConfig: ThemeConfig;
  setTheme: (themeName: string) => void;
  applyCustomTheme: (customConfig: Partial<ThemeConfig>) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tenantContext = useTenant();
  const [currentTheme, setCurrentTheme] = useState('light');
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(themePresets.light);

  // Update theme when tenant settings change
  useEffect(() => {
    if (tenantContext?.currentTenant?.settings?.theme) {
      const themeName = tenantContext.currentTenant.settings.theme;
      if (themePresets[themeName]) {
        setCurrentTheme(themeName);
        setThemeConfig(themePresets[themeName]);
      }
    }
  }, [tenantContext?.currentTenant]);

  // Apply CSS variables to document root
  useEffect(() => {
    applyThemeToDOM(themeConfig);
  }, [themeConfig]);

  const setTheme = (themeName: string) => {
    if (themePresets[themeName]) {
      setCurrentTheme(themeName);
      setThemeConfig(themePresets[themeName]);
    }
  };

  const applyCustomTheme = (customConfig: Partial<ThemeConfig>) => {
    setThemeConfig(prevConfig => ({
      ...prevConfig,
      ...customConfig,
      colors: {
        ...prevConfig.colors,
        ...(customConfig.colors || {}),
      },
      fontSizes: {
        ...prevConfig.fontSizes,
        ...(customConfig.fontSizes || {}),
      },
      spacing: {
        ...prevConfig.spacing,
        ...(customConfig.spacing || {}),
      },
    }));
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, themeConfig, setTheme, applyCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export the hook from here as well for backward compatibility
export { useTheme } from '@/hooks/useThemeContext';
