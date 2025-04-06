
// Define theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  [key: string]: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  fontSizes: {
    base: string;
    small: string;
    large: string;
    [key: string]: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    [key: string]: string;
  };
  [key: string]: any;
}

// Theme presets
export const themePresets: Record<string, ThemeConfig> = {
  light: {
    colors: {
      primary: '#3478F6',
      secondary: '#6C757D',
      accent: '#FF9500',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#212529',
      muted: '#6C757D',
      error: '#FF3B30',
      success: '#34C759',
      warning: '#FFCC00',
    },
    fontSizes: {
      base: '1rem',
      small: '0.875rem',
      large: '1.25rem',
      heading: '1.75rem',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
  },
  dark: {
    colors: {
      primary: '#0A84FF',
      secondary: '#6C757D',
      accent: '#FF9F0A',
      background: '#1C1C1E',
      surface: '#2C2C2E',
      text: '#FFFFFF',
      muted: '#8E8E93',
      error: '#FF453A',
      success: '#32D74B',
      warning: '#FFD60A',
    },
    fontSizes: {
      base: '1rem',
      small: '0.875rem',
      large: '1.25rem',
      heading: '1.75rem',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
  },
  inventory: {
    colors: {
      primary: '#0056b3',
      secondary: '#6C757D',
      accent: '#FF9500',
      background: '#F0F2F5',
      surface: '#FFFFFF',
      text: '#212529',
      muted: '#6C757D',
      error: '#DC3545',
      success: '#28A745',
      warning: '#FFC107',
    },
    fontSizes: {
      base: '1rem',
      small: '0.875rem',
      large: '1.25rem',
      heading: '1.75rem',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
  }
};
