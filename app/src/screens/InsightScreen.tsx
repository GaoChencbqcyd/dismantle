import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Card } from '../components';
import { useSessionStore } from '../stores/sessionStore';

export function InsightScreen() {
  const { colors } = useTheme();
  const summary = useSessionStore(s => s.getSummary());

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary, padding: 20, paddingTop: 60 }}>
      <AppText variant="heading">洞察</AppText>
      <AppText variant="small" muted style={{ marginTop: 4, marginBottom: 20 }}>数据洞察（Sprint 5 完整实现）</AppText>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <Card padding={20} style={{ flex: 1, alignItems: 'center' }}>
          <AppText variant="heading" color={colors.accent}>{summary.totalSessions}</AppText>
          <AppText variant="caption" muted>累计拆解</AppText>
        </Card>
        <Card padding={20} style={{ flex: 1, alignItems: 'center' }}>
          <AppText variant="heading" color={colors.success}>{summary.avgImprovement}</AppText>
          <AppText variant="caption" muted>平均下降(分)</AppText>
        </Card>
      </View>
      <Card><AppText variant="body" muted center>完成更多拆解后，这里将展示焦虑趋势和触发模式分析。</AppText></Card>
    </View>
  );
}
