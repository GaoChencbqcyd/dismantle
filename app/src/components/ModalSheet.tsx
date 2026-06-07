import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function ModalSheet({ visible, onClose, title, children }: ModalSheetProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
      }}
    >
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
        }}
      />
      {/* Sheet */}
      <View
        style={{
          backgroundColor: colors.bgCard,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingHorizontal: 20,
          paddingBottom: 32,
          maxHeight: '70%',
        }}
      >
        {/* Handle */}
        <View
          style={{
            width: 36,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginVertical: 8,
          }}
        />
        {title && (
          <AppText variant="subtitle" style={{ marginBottom: 16 }}>
            {title}
          </AppText>
        )}
        <ScrollView showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}
