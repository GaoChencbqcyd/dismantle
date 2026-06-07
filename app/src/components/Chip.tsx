import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

interface ChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, disabled = false, onPress }: ChipProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onPress}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: selected ? colors.accent : colors.bgInput,
        borderWidth: 1,
        borderColor: selected ? colors.accent : colors.borderLight,
        opacity: disabled ? 0.5 : 1,
        alignSelf: 'flex-start',
      }}
    >
      <AppText
        variant="small"
        color={selected ? colors.textInverse : colors.textSecondary}
        bold={selected}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
}
