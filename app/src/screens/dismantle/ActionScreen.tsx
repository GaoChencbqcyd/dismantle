/**
 * 拆解流程 — Step 4: 微小行动
 * 智能推荐行动卡片 + 焦虑后评 + 完成拆解
 */

import React, { useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme';
import { AppText, Button } from '../../components';
import { MICRO_ACTIONS, categorizeAnxiety } from '../../data/content';
import { useSessionStore } from '../../stores/sessionStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type DismantleStackParamList = {
  Record: undefined;
  Classify: undefined;
  Reframe: undefined;
  Action: undefined;
  Summary: undefined;
};

// ─── 焦虑后评滑块 ──────────────────────────────────────────

function AnxietyAfterSlider({
  value,
  onValueChange,
  accent,
  bgCard,
  borderLight,
  textPrimary,
  textSecondary,
}: {
  value: number;
  onValueChange: (v: number) => void;
  accent: string;
  bgCard: string;
  borderLight: string;
  textPrimary: string;
  textSecondary: string;
}) {
  const labels = ['平静', '略烦', '焦虑', '很痛', '崩溃'];
  const emojis = ['😊', '🤔', '😟', '😫', '😭'];
  const idx = Math.min(Math.floor((value - 1) / 2.25), 4);

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <AppText variant="body" bold>现在感觉如何？</AppText>
        <AppText variant="heading" color={accent}>{value}/10 {emojis[idx]}</AppText>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) {
          const isSelected = value >= n;
          return (
            <TouchableOpacity
              key={n}
              onPress={function () { onValueChange(n); }}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: isSelected ? accent : bgCard,
                borderWidth: 1.5,
                borderColor: isSelected ? accent : borderLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {n === value && (
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' }} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────

export function ActionScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<DismantleStackParamList>>();
  const {
    currentSession,
    selectAction,
    setAnxietyAfter,
    goToStep,
  } = useSessionStore();

  if (!currentSession) return null;

  // Smart category detection
  const category = categorizeAnxiety(currentSession.rawText);
  const actions = MICRO_ACTIONS[category] || MICRO_ACTIONS['默认'];

  const handleSelect = function (index: number) {
    selectAction(category, index);
  };

  const handleComplete = function () {
    goToStep('complete');
    navigation.navigate('Summary');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Step Header */}
        <AppText variant="caption" muted style={{ marginBottom: 4 }}>
          步骤 4/4
        </AppText>
        <AppText variant="heading" style={{ marginBottom: 4 }}>
          微小行动
        </AppText>
        <AppText variant="small" muted style={{ marginBottom: 6 }}>
          不需要彻底解决问题。今天只做一件小事。行动是最好的解药。
        </AppText>
        <View
          style={{
            backgroundColor: colors.accent + '10',
            borderRadius: 10,
            padding: 10,
            marginBottom: 20,
          }}
        >
          <AppText variant="caption" color={colors.accent}>
            📍 智能匹配：「{category}」类焦虑 — 推荐以下行动
          </AppText>
        </View>

        {/* Action cards */}
        {actions.map(function (action, i) {
          const isSelected = currentSession.selectedActionIndex === i;
          return (
            <TouchableOpacity
              key={i}
              activeOpacity={0.7}
              onPress={function () { handleSelect(i); }}
              style={{
                backgroundColor: isSelected ? colors.accent + '15' : colors.bgCard,
                borderWidth: 1.5,
                borderColor: isSelected ? colors.accent : colors.borderLight,
                borderRadius: 16,
                padding: 16,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              {/* Icon */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: colors.bgInput,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText variant="title">{action.icon}</AppText>
              </View>

              {/* Content */}
              <View style={{ flex: 1 }}>
                <AppText variant="body" bold>{action.title}</AppText>
                <AppText variant="caption" muted style={{ marginTop: 2 }}>{action.hint}</AppText>
              </View>

              {/* Radio */}
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.accent : colors.borderLight,
                  backgroundColor: isSelected ? colors.accent : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSelected && <AppText variant="caption" color="#FFFFFF" bold>✓</AppText>}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Anxiety After */}
        <View style={{ marginTop: 24, marginBottom: 24 }}>
          <AnxietyAfterSlider
            value={currentSession.anxietyAfter || currentSession.anxietyLevel}
            onValueChange={setAnxietyAfter}
            accent={colors.accent}
            bgCard={colors.bgCard}
            borderLight={colors.borderLight}
            textPrimary={colors.textPrimary}
            textSecondary={colors.textSecondary}
          />
        </View>

        {/* CTA */}
        <Button
          title="完成拆解"
          variant="primary"
          size="lg"
          block
          onPress={handleComplete}
        />

        <AppText variant="caption" muted center style={{ marginTop: 12 }}>
          你的行动选择会帮助系统为你推荐更精准的方案
        </AppText>
      </ScrollView>
    </View>
  );
}
