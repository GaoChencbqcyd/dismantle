import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme';

// Tab Screens
import { HomeScreen } from '../screens/HomeScreen';
import { CompassScreen } from '../screens/CompassScreen';
import { InsightScreen } from '../screens/InsightScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Dismantle Flow Screens (Sprint 2-3)
import {
  RecordScreen,
  ClassifyScreen,
  ReframeScreen,
  ActionScreen,
  SummaryScreen,
} from '../screens/dismantle';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const DismantleStack = createNativeStackNavigator();

// ─── 拆解流程 Stack ──────────────────────────────────────────

function DismantleFlow() {
  const { colors } = useTheme();

  return (
    <DismantleStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.bgPrimary },
        headerTintColor: colors.accent,
        headerTitleStyle: { color: colors.textPrimary, fontWeight: '600', fontSize: 17 },
        headerShadowVisible: false,
        headerBackTitle: '返回',
        contentStyle: { backgroundColor: colors.bgPrimary },
      }}
    >
      <DismantleStack.Screen name="Record" component={RecordScreen} options={{ title: '记录' }} />
      <DismantleStack.Screen name="Classify" component={ClassifyScreen} options={{ title: '分类' }} />
      <DismantleStack.Screen name="Reframe" component={ReframeScreen} options={{ title: '重构' }} />
      <DismantleStack.Screen name="Action" component={ActionScreen} options={{ title: '行动' }} />
      <DismantleStack.Screen
        name="Summary"
        component={SummaryScreen}
        options={{ title: '完成', headerBackVisible: false, headerLeft: function () { return null; } }}
      />
    </DismantleStack.Navigator>
  );
}

// ─── 底部 Tab ────────────────────────────────────────────────

function HomeTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: 56,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: '首页', tabBarIcon: function ({ color, size }) { return <TabIcon name="home" color={color} size={size} />; } }} />
      <Tab.Screen name="Compass" component={CompassScreen} options={{ tabBarLabel: '罗盘', tabBarIcon: function ({ color, size }) { return <TabIcon name="compass" color={color} size={size} />; } }} />
      <Tab.Screen name="Insight" component={InsightScreen} options={{ tabBarLabel: '洞察', tabBarIcon: function ({ color, size }) { return <TabIcon name="insight" color={color} size={size} />; } }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: '我的', tabBarIcon: function ({ color, size }) { return <TabIcon name="profile" color={color} size={size} />; } }} />
    </Tab.Navigator>
  );
}

// ─── Tab 图标 ────────────────────────────────────────────────

function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const icons: Record<string, string> = { home: '🏠', compass: '🧭', insight: '📊', profile: '👤' };
  return React.createElement(require('react-native').Text, { style: { fontSize: size - 2 } }, icons[name] || '●');
}

// ─── 根导航 ──────────────────────────────────────────────────

export function AppNavigator() {
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bgPrimary,
      card: colors.bgCard,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.accent,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={HomeTabs} />
        <RootStack.Screen
          name="DismantleFlow"
          component={DismantleFlow}
          options={{ presentation: 'card', animation: 'slide_from_right' }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
