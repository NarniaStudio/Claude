import { ThemeColors, ReaderTheme } from '../types';

export const lightTheme: ThemeColors = {
  background: '#f8f9fa',
  text: '#212529',
  accent: '#4361ee',
  secondary: '#6c757d',
  border: '#dee2e6',
  card: '#ffffff',
  statusBar: '#4361ee',
  tabBar: '#ffffff',
  reader: {
    background: '#ffffff',
    text: '#212529',
  },
};

export const darkTheme: ThemeColors = {
  background: '#121212',
  text: '#e0e0e0',
  accent: '#7b8cff',
  secondary: '#9e9e9e',
  border: '#2c2c2c',
  card: '#1e1e1e',
  statusBar: '#1e1e1e',
  tabBar: '#1e1e1e',
  reader: {
    background: '#121212',
    text: '#cccccc',
  },
};

export const sepiaTheme: ThemeColors = {
  background: '#f4ecd8',
  text: '#5b4636',
  accent: '#8b6914',
  secondary: '#7a6652',
  border: '#d4c5a9',
  card: '#faf0d7',
  statusBar: '#8b6914',
  tabBar: '#faf0d7',
  reader: {
    background: '#f4ecd8',
    text: '#5b4636',
  },
};

export const nightTheme: ThemeColors = {
  background: '#0a0a0a',
  text: '#666666',
  accent: '#444444',
  secondary: '#333333',
  border: '#1a1a1a',
  card: '#0f0f0f',
  statusBar: '#0a0a0a',
  tabBar: '#0f0f0f',
  reader: {
    background: '#000000',
    text: '#555555',
  },
};

export const greenTheme: ThemeColors = {
  background: '#e8f5e9',
  text: '#1b5e20',
  accent: '#2e7d32',
  secondary: '#4caf50',
  border: '#c8e6c9',
  card: '#f1f8e9',
  statusBar: '#2e7d32',
  tabBar: '#f1f8e9',
  reader: {
    background: '#e8f5e9',
    text: '#1b5e20',
  },
};

export const themes: Record<ReaderTheme, ThemeColors> = {
  light: lightTheme,
  dark: darkTheme,
  sepia: sepiaTheme,
  night: nightTheme,
  green: greenTheme,
  custom: lightTheme,
};

export const getTheme = (theme: ReaderTheme): ThemeColors => {
  return themes[theme] || lightTheme;
};

export const fonts = {
  regular: 'System',
  serif: 'serif',
  sansSerif: 'sans-serif',
  monospace: 'monospace',
  options: [
    { label: 'Default', value: 'System' },
    { label: 'Serif', value: 'serif' },
    { label: 'Sans Serif', value: 'sans-serif' },
    { label: 'Monospace', value: 'monospace' },
    { label: 'Noto Serif', value: 'notoserif' },
    { label: 'David', value: 'david' },
    { label: 'Frank Ruhl', value: 'frank-ruhl' },
  ],
};

export const highlightColors = {
  yellow: '#fff176',
  green: '#a5d6a7',
  blue: '#90caf9',
  red: '#ef9a9a',
  purple: '#ce93d8',
  orange: '#ffcc80',
};
