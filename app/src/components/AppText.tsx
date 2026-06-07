import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { Typography, TypographyVariant } from '../theme/typography';

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  muted?: boolean;
  bold?: boolean;
  center?: boolean;
  children: React.ReactNode;
}

export function AppText({
  variant = 'body',
  color,
  muted = false,
  bold = false,
  center = false,
  style,
  children,
  ...props
}: AppTextProps) {
  const { colors } = useTheme();
  const textColor = color || (muted ? colors.textTertiary : colors.textPrimary);
  const preset = Typography[variant];

  return (
    <Text
      style={[
        {
          color: textColor,
          fontSize: preset.fontSize,
          lineHeight: preset.lineHeight,
          letterSpacing: preset.letterSpacing,
          fontWeight: bold ? ('700' as const) : (preset as any).fontWeight || '400',
          textAlign: center ? 'center' : undefined,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
