import React, { useState } from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  multiline?: boolean;
  leftIcon?: string;
  maxLength?: number;
  showCount?: boolean;
}

export function Input({
  label,
  error,
  multiline = false,
  leftIcon,
  maxLength,
  showCount,
  value,
  onChangeText,
  style,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <AppText variant="small" muted style={{ marginBottom: 6 }}>
          {label}
        </AppText>
      )}
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: multiline ? 'flex-start' : 'center',
            backgroundColor: colors.bgInput,
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: error
              ? colors.danger
              : focused
              ? colors.accent
              : colors.border,
            paddingHorizontal: leftIcon ? 42 : 16,
            paddingVertical: multiline ? 12 : 14,
            position: 'relative',
          },
        ]}
      >
        {leftIcon && (
          <AppText
            variant="body"
            style={{ position: 'absolute', left: 14, top: multiline ? 14 : 'auto' }}
          >
            {leftIcon}
          </AppText>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.textTertiary}
          style={[
            {
              flex: 1,
              color: colors.textPrimary,
              fontSize: 15,
              lineHeight: multiline ? 22 : undefined,
              minHeight: multiline ? 100 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
              padding: 0,
              fontFamily: undefined,
            },
            style,
          ]}
          {...props}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        {error ? (
          <AppText variant="caption" color={colors.danger}>
            {error}
          </AppText>
        ) : (
          <View />
        )}
        {showCount && maxLength && (
          <AppText variant="caption" muted>
            {charCount}/{maxLength}
          </AppText>
        )}
      </View>
    </View>
  );
}
