import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Card } from '../components';
import { useSessionStore } from '../stores/sessionStore';

export function ProfileScreen() {
  const { colors } = useTheme();
  const summary = useSessionStore(s => s.getSummary());

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        <AppText variant="heading">我的</AppText>
        <AppText variant="small" muted style={{ marginTop: 4, marginBottom: 20 }}>
          个人中心（Sprint 5 完整实现）
        </AppText>

        <Card padding={28} style={{ alignItems: 'center' }}>
          <AppText variant="heading" style={{ marginBottom: 8 }}>🧠</AppText>
          <AppText variant="subtitle">拆解用户</AppText>
          <AppText variant="small" muted style={{ marginTop: 4 }}>
            已使用 {summary.totalSessions > 0 ? '多' : '0'} 天 · 完成 {summary.totalSessions} 次拆解
          </AppText>
        </Card>

        <AppText variant="small" muted style={{ marginTop: 20, marginBottom: 8 }}>
          功能
        </AppText>
        <Card interactive onPress={() => {}} padding={16}>
          <AppText variant="body">⏰ 智能提醒</AppText>
          <AppText variant="caption" muted>未开启</AppText>
        </Card>
        <Card interactive onPress={() => {}} padding={16}>
          <AppText variant="body">📤 数据导出</AppText>
          <AppText variant="caption" muted>导出PDF或文本</AppText>
        </Card>
        <Card interactive onPress={() => {}} padding={16}>
          <AppText variant="body">⚙️ 设置</AppText>
          <AppText variant="caption" muted>主题、隐私、关于</AppText>
        </Card>
      </ScrollView>
    </View>
  );
}
