import React from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../theme';

interface ToggleSwitchProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
}

export function ToggleSwitch({ value, onToggle, disabled = false }: ToggleSwitchProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => onToggle(!value)}
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        backgroundColor: value ? colors.accent : colors.border,
        justifyContent: 'center',
        paddingHorizontal: 3,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Animated.View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: '#FFFFFF',
          transform: [{ translateX: value ? 20 : 0 }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 2,
          elevation: 2,
        }}
      />
    </TouchableOpacity>
  );
}
