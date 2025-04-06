
import { ThemeConfig } from '@/types/theme';

export const applyThemeToDOM = (themeConfig: ThemeConfig): void => {
  const root = document.documentElement;
  
  // Apply colors
  Object.entries(themeConfig.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Apply font sizes
  Object.entries(themeConfig.fontSizes).forEach(([key, value]) => {
    root.style.setProperty(`--font-size-${key}`, value);
  });
  
  // Apply spacing
  Object.entries(themeConfig.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
};
