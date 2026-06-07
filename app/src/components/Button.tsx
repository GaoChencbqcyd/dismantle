import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 12, paddingHorizontal: 24 },
  lg: { paddingVertical: 16, paddingHorizontal: 32 },
};

const sizeFont: Record<ButtonSize, 'small' | 'body' | 'subtitle'> = {
  sm: 'small',
  md: 'body',
  lg: 'subtitle',
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  block = false,
  onPress,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const bgColors: Record<ButtonVariant, string> = {
    primary: isDisabled ? colors.border : colors.accent,
    secondary: colors.bgInput,
    ghost: 'transparent',
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: colors.textInverse,
    secondary: colors.textPrimary,
    ghost: colors.accent,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        {
          backgroundColor: bgColors[variant],
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          opacity: isDisabled ? 0.5 : 1,
          ...(block ? { width: '100%' as const } : {}),
        },
        sizeStyles[size],
        style,
      ]}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={textColors[variant]}
        />
      )}
      <AppText
        variant={sizeFont[size]}
        color={textColors[variant]}
        bold
      >
        {title}
      </AppText>
    </TouchableOpacity>
  );
}
