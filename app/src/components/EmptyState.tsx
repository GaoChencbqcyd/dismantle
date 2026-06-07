import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = '📋',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 24,
      }}
    >
      <AppText variant="display" style={{ marginBottom: 16, opacity: 0.6 }}>
        {icon}
      </AppText>
      <AppText variant="subtitle" center style={{ marginBottom: 8 }}>
        {title}
      </AppText>
      {description && (
        <AppText variant="small" muted center style={{ maxWidth: 240, lineHeight: 21 }}>
          {description}
        </AppText>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: 20 }}>
          <Button title={actionLabel} onPress={onAction} size="md" />
        </View>
      )}
    </View>
  );
}
