import React, { createContext, useContext, useState, useCallback } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { AppText } from './AppText';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [opacity] = useState(new Animated.Value(0));

  const show = useCallback((msg: string, t: ToastType = 'info') => {
    setMessage(msg);
    setType(t);
    setVisible(true);
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1800),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [opacity]);

  const bgColor =
    type === 'success'
      ? colors.success
      : type === 'error'
      ? colors.danger
      : colors.textPrimary;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 100,
              left: 20,
              right: 20,
              backgroundColor: bgColor,
              borderRadius: 20,
              paddingVertical: 10,
              paddingHorizontal: 20,
              alignItems: 'center',
              zIndex: 9999,
              opacity,
            },
          ]}
          pointerEvents="none"
        >
          <AppText variant="small" color="#FFFFFF">
            {message}
          </AppText>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}
