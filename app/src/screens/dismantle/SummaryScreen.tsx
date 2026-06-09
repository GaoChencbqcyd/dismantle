/**
 * 拆解流程 — 完成总结
 * 焦虑评分对比 + 行动承诺 + 返回首页
 */

import React, { useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../../theme';
import { AppText, Button } from '../../components';
import { MICRO_ACTIONS } from '../../data/content';
import { useSessionStore } from '../../stores/sessionStore';
import { useNavigation } from '@react-navigation/native';

export function SummaryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSession, completeSession } = useSessionStore();

  // Auto-complete on mount
  React.useEffect(function () {
    if (currentSession && !currentSession.isCompleted) {
      completeSession();
    }
  }, []);

  if (!currentSession) return null;

  const before = currentSession.anxietyLevel;
  const after = currentSession.anxietyAfter ?? before;
  const improvement = before - after;
  const factorsTotal = currentSession.factors.length;
  const controllableCount = currentSession.factors.filter(function (f) {
    return f.category === 'controllable';
  }).length;
  const distortionCount = currentSession.selectedDistortions.length;

  // Selected action
  const selectedAction = currentSession.selectedActionCategory && currentSession.selectedActionIndex !== null
    ? (MICRO_ACTIONS[currentSession.selectedActionCategory] || MICRO_ACTIONS['默认'])[currentSession.selectedActionIndex]
    : null;

  const handleBack = useCallback(function () {
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }, [navigation]);

  const improvementEmoji = improvement >= 4 ? '🎉' : improvement >= 2 ? '😌' : improvement >= 0 ? '💪' : '🧘';

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 40, paddingBottom: 40 }}>
        {/* Celebration */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <AppText variant="hero" style={{ marginBottom: 12 }}>{improvementEmoji}</AppText>
          <AppText variant="heading" center style={{ marginBottom: 4 }}>
            {improvement >= 3 ? '拆解完成，焦虑减轻了！' : improvement >= 1 ? '拆解完成，感觉好些了吗？' : '拆解完成'}
          </AppText>
          <AppText variant="small" muted center>
            你花了几分钟整理思绪，这是很有勇气的一件事
          </AppText>
        </View>

        {/* Score Comparison Card */}
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.borderLight,
            padding: 24,
            marginBottom: 16,
          }}
        >
          <AppText variant="subtitle" center style={{ marginBottom: 16 }}>焦虑评分变化</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
            {/* Before */}
            <View style={{ alignItems: 'center' }}>
              <AppText variant="caption" muted style={{ marginBottom: 4 }}>拆解前</AppText>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.danger + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText variant="heading" color={colors.danger}>{before}</AppText>
              </View>
            </View>

            {/* Arrow */}
            <AppText variant="title" muted>→</AppText>

            {/* After */}
            <View style={{ alignItems: 'center' }}>
              <AppText variant="caption" muted style={{ marginBottom: 4 }}>拆解后</AppText>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.success + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText variant="heading" color={colors.success}>{after}</AppText>
              </View>
            </View>
          </View>

          {/* Improvement badge */}
          {improvement > 0 && (
            <View
              style={{
                backgroundColor: colors.accent + '15',
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 16,
                alignSelf: 'center',
                marginTop: 16,
              }}
            >
              <AppText variant="body" bold color={colors.accent} center>
                焦虑下降了 {improvement} 分！
              </AppText>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight }}>
            <AppText variant="title" color={colors.accent}>{factorsTotal}</AppText>
            <AppText variant="caption" muted center>拆解因素</AppText>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight }}>
            <AppText variant="title" color={colors.success}>{controllableCount}</AppText>
            <AppText variant="caption" muted center>可控因素</AppText>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight }}>
            <AppText variant="title" color={colors.warning}>{distortionCount}</AppText>
            <AppText variant="caption" muted center>认知扭曲</AppText>
          </View>
        </View>

        {/* Selected Action */}
        {selectedAction && (
          <View
            style={{
              backgroundColor: colors.accent + '10',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.accent + '30',
              padding: 16,
              marginBottom: 24,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: colors.accent + '20',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText variant="title">{selectedAction.icon}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="body" bold>{selectedAction.title}</AppText>
              <AppText variant="caption" muted>{selectedAction.hint}</AppText>
            </View>
            <AppText variant="caption" color={colors.accent} bold>今日行动</AppText>
          </View>
        )}

        {/* Back to home */}
        <Button
          title="返回首页"
          variant="primary"
          size="lg"
          block
          onPress={handleBack}
        />
      </ScrollView>
    </View>
  );
}
