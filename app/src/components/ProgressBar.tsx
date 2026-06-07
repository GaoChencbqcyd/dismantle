import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  steps?: number;   // optional: show step markers
  currentStep?: number;
}

export function ProgressBar({ progress, steps, currentStep }: ProgressBarProps) {
  const { colors } = useTheme();

  return (
    <View style={{ marginVertical: 8 }}>
      <View
        style={{
          height: 4,
          backgroundColor: colors.borderLight,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${Math.min(progress * 100, 100)}%`,
            backgroundColor: colors.accent,
            borderRadius: 2,
          }}
        />
      </View>
      {steps && currentStep !== undefined && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 4,
          }}
        >
          {Array.from({ length: steps }, (_, i) => (
            <View
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  i < currentStep ? colors.accent : colors.border,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
