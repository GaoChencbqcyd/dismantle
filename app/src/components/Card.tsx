import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface CardProps {
  children: React.ReactNode;
  interactive?: boolean;
  onPress?: () => void;
  padding?: number;
  style?: ViewStyle;
}

export function Card({
  children,
  interactive = false,
  onPress,
  padding = 20,
  style,
}: CardProps) {
  const { colors } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    // Shadow simulation for RN
    shadowColor: colors.shadowSm,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  };

  if (interactive && onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.97}
        onPress={onPress}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
