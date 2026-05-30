import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';

interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  notification: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  accent: string;
  shadow: string;
  overlay: string;
  inputBackground: string;
  placeholder: string;
  tabBar: string;
  headerBackground: string;
  headerText: string;
  buttonPrimary: string;
  buttonSecondary: string;
  buttonText: string;
  linkText: string;
  iconActive: string;
  iconInactive: string;
}

interface Theme {
  colors: ThemeColors;
  dark: boolean;
}

const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#D35400',
    background: '#FFF9F5',
    surface: '#FFFFFF',
    card: '#FFFBF7',
    text: '#4A2C2A',
    textSecondary: '#8D6E63',
    border: '#EDD9CF',
    notification: '#E74C3C',
    error: '#E74C3C',
    success: '#27AE60',
    warning: '#F39C12',
    info: '#E67E22',
    accent: '#F1C40F',
    shadow: '#4A2C2A',
    overlay: 'rgba(74, 44, 42, 0.4)',
    inputBackground: '#FDF2E9',
    placeholder: '#A1887F',
    tabBar: '#FFFBF7',
    headerBackground: '#FFFBF7',
    headerText: '#4A2C2A',
    buttonPrimary: '#D35400',
    buttonSecondary: '#FDF2E9',
    buttonText: '#FFFFFF',
    linkText: '#E67E22',
    iconActive: '#D35400',
    iconInactive: '#A1887F',
  },
};

const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#E67E22',
    background: '#2C1810',
    surface: '#3D2B1F',
    card: '#4A3728',
    text: '#FDF2E9',
    textSecondary: '#D7CCC8',
    border: '#5D4037',
    notification: '#FF5252',
    error: '#FF5252',
    success: '#66BB6A',
    warning: '#FFB74D',
    info: '#FF9800',
    accent: '#FFD54F',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
    inputBackground: '#4A3728',
    placeholder: '#A1887F',
    tabBar: '#3D2B1F',
    headerBackground: '#3D2B1F',
    headerText: '#FDF2E9',
    buttonPrimary: '#E67E22',
    buttonSecondary: '#5D4037',
    buttonText: '#FDF2E9',
    linkText: '#FFB74D',
    iconActive: '#E67E22',
    iconInactive: '#A1887F',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(false);

  // Load theme preference from storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    saveThemePreference(isDark);
  }, [isDark]);

  const loadThemePreference = () => {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('app_theme');
        if (saved !== null) {
          setIsDark(JSON.parse(saved));
        } else {
          // Default to system preference if available
          if (Platform.OS === 'web' && window.matchMedia) {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(systemPrefersDark);
          }
        }
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = (dark: boolean) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('app_theme', JSON.stringify(dark));
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const setDarkMode = (dark: boolean) => {
    setIsDark(dark);
  };

  const theme = isDark ? darkTheme : lightTheme;

  const contextValue: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setDarkMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper function to create themed styles
export function createThemedStyles<T>(styleFunction: (theme: Theme) => T) {
  return (theme: Theme): T => styleFunction(theme);
}

// Helper hook for themed StyleSheet
export function useThemedStyles<T>(styleFunction: (theme: Theme) => T): T {
  const { theme } = useTheme();
  return styleFunction(theme);
}