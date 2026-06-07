import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Button, Card, Chip, ProgressBar, EmptyState } from '../components';

export function HomeScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <AppText variant="heading">拆解</AppText>
        <AppText variant="small" muted style={{ marginTop: 4, marginBottom: 24 }}>
          看清它 · 拆开它 · 解决它
        </AppText>

        {/* Today Status */}
        <Card>
          <AppText variant="subtitle" center>
            🧠 今天感觉怎么样？
          </AppText>
          <AppText variant="small" muted center style={{ marginTop: 4, marginBottom: 16 }}>
            花几分钟，把焦虑拆解开
          </AppText>
          <Button title="开始拆解" variant="primary" size="lg" block onPress={() => {}} />
        </Card>

        {/* Progress demo */}
        <AppText variant="small" muted style={{ marginTop: 8, marginBottom: 4 }}>
          组件库验证
        </AppText>
        <ProgressBar progress={0.5} steps={4} currentStep={2} />

        {/* Chip demo */}
        <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8, flexWrap: 'wrap' }}>
          <Chip label="焦虑" selected />
          <Chip label="烦躁" />
          <Chip label="迷茫" />
          <Chip label="压力" />
        </View>

        {/* Empty State */}
        <EmptyState
          icon="📋"
          title="还没有拆解记录"
          description="感到焦虑时，我在这里。开始你的第一次拆解吧。"
          actionLabel="开始拆解"
          onAction={() => {}}
        />
      </ScrollView>
    </View>
  );
}
