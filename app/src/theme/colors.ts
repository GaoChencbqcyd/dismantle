/**
 * 拆解 — 设计系统：颜色 & 主题
 * 方向A（理性暖调）+ 方向B（暗夜微光）融合
 */

export const LightColors = {
  // Backgrounds
  bgPrimary: '#F5F0EB',
  bgSecondary: '#EDE7E0',
  bgCard: '#FFFFFF',
  bgElevated: '#FFFFFF',
  bgInput: '#F0EBE5',

  // Text
  textPrimary: '#2C2416',
  textSecondary: '#6B5E4F',
  textTertiary: '#9B8D7E',
  textInverse: '#FFFFFF',

  // Accent (陶土橙)
  accent: '#C47B5A',
  accentLight: '#E8C8B4',
  accentDark: '#A05E3E',
  accentGlow: 'rgba(196, 123, 90, 0.15)',

  // Semantic
  success: '#6B9B6F',
  warning: '#D4A44A',
  danger: '#C4665A',
  info: '#7B9EC4',

  // Borders
  border: '#E0D8CF',
  borderLight: '#EDE7E0',
  divider: '#E8E0D6',

  // Shadows (as strings for React Native)
  shadowSm: '0 1px 2px rgba(44, 36, 22, 0.04)',
  shadowMd: '0 2px 8px rgba(44, 36, 22, 0.06)',
  shadowLg: '0 4px 16px rgba(44, 36, 22, 0.08)',
  shadowXl: '0 8px 32px rgba(44, 36, 22, 0.12)',
} as const;

export const DarkColors = {
  // Backgrounds
  bgPrimary: '#1A1D24',
  bgSecondary: '#22262E',
  bgCard: '#282C35',
  bgElevated: '#2E323C',
  bgInput: '#22262E',

  // Text
  textPrimary: '#E8E3DC',
  textSecondary: '#9B9489',
  textTertiary: '#6B6459',
  textInverse: '#1A1D24',

  // Accent (琥珀光)
  accent: '#E8A940',
  accentLight: '#4A3A20',
  accentDark: '#F0C060',
  accentGlow: 'rgba(232, 169, 64, 0.2)',

  // Semantic
  success: '#7BAB7F',
  warning: '#D4B44A',
  danger: '#D4766A',
  info: '#8BAED4',

  // Borders
  border: '#363A44',
  borderLight: '#2E323C',
  divider: '#323640',

  // Shadows
  shadowSm: '0 1px 2px rgba(0, 0, 0, 0.2)',
  shadowMd: '0 2px 8px rgba(0, 0, 0, 0.3)',
  shadowLg: '0 4px 16px rgba(0, 0, 0, 0.4)',
  shadowXl: '0 8px 32px rgba(0, 0, 0, 0.5)',
} as const;

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  bgElevated: string;
  bgInput: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  accentGlow: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  border: string;
  borderLight: string;
  divider: string;
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
  shadowXl: string;
}

export const Radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FontSize = {
  caption: 11,
  small: 13,
  body: 15,
  subtitle: 17,
  title: 20,
  heading: 24,
  display: 28,
  hero: 36,
} as const;
