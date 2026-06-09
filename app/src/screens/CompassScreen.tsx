/**
 * 拆解 — 罗盘页（Sprint 3 完整实现）
 * Sprint 2: 占位页，展示价值观卡牌预览
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Card, EmptyState } from '../components';

export function CompassScreen() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="heading" style={{ marginBottom: 4 }}>人生罗盘</AppText>
        <AppText variant="small" muted style={{ marginBottom: 24 }}>
          找到对你真正重要的东西
        </AppText>

        <Card padding={24} style={{ marginBottom: 20 }}>
          <View style={{ alignItems: 'center' }}>
            <AppText variant="hero" style={{ marginBottom: 12 }}>🧭</AppText>
            <AppText variant="subtitle" center bold style={{ marginBottom: 8 }}>
              价值观探索即将上线
            </AppText>
            <AppText variant="small" muted center style={{ lineHeight: 20 }}>
              Sprint 3 将带来完整的价值观卡牌排序体验。{'\n'}
              通过 24 张卡牌，找到你真正在意的 5 个核心价值观。
            </AppText>
          </View>
        </Card>

        <AppText variant="body" bold style={{ marginBottom: 12 }}>
          预览：核心价值维度
        </AppText>
        {[
          { label: '健康', emoji: '💪', desc: '身心健康是根基' },
          { label: '成长', emoji: '🌱', desc: '持续学习与进步' },
          { label: '关系', emoji: '👥', desc: '与他人的深度连接' },
          { label: '自由', emoji: '🕊️', desc: '自主选择的权利' },
          { label: '贡献', emoji: '🎁', desc: '为他人创造价值' },
        ].map((item) => (
          <Card key={item.label} padding={16} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AppText variant="display">{item.emoji}</AppText>
              <View style={{ flex: 1 }}>
                <AppText variant="body" bold>{item.label}</AppText>
                <AppText variant="small" muted>{item.desc}</AppText>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
