/**
 * 拆解流程 — Step 3: 认知重构
 * 认知扭曲识别 + 反驳输入 + 思维模式觉察
 */

import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useTheme } from '../../theme';
import { AppText, Button } from '../../components';
import { DISTORTIONS } from '../../data/content';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 60;

// ─── 认知扭曲卡片 ──────────────────────────────────────────

function DistortionCard({
  distortion,
  isSelected,
  rebuttalText,
  onToggle,
  onRebuttalChange,
  accent,
  bgCard,
  borderLight,
  textPrimary,
  textSecondary,
}: {
  distortion: (typeof DISTORTIONS)[number];
  isSelected: boolean;
  rebuttalText: string;
  onToggle: () => void;
  onRebuttalChange: (text: string) => void;
  accent: string;
  bgCard: string;
  borderLight: string;
  textPrimary: string;
  textSecondary: string;
}) {
  return (
    <View
      style={{
        width: CARD_WIDTH,
        backgroundColor: isSelected ? accent + '10' : bgCard,
        borderWidth: 1.5,
        borderColor: isSelected ? accent : borderLight,
        borderRadius: 16,
        padding: 20,
        marginRight: 12,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: accent + '20',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText variant="caption" bold color={accent}>
              {String(distortion.id).padStart(2, '0')}
            </AppText>
          </View>
          <AppText variant="body" bold>
            {distortion.name}
          </AppText>
        </View>
        <TouchableOpacity
          onPress={onToggle}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: isSelected ? accent : borderLight,
            backgroundColor: isSelected ? accent : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSelected && <AppText variant="caption" color="#FFFFFF" bold>✓</AppText>}
        </TouchableOpacity>
      </View>

      {/* Description */}
      <AppText variant="small" muted style={{ lineHeight: 20, marginBottom: 6 }}>
        {distortion.desc}
      </AppText>

      {/* Question */}
      <View
        style={{
          backgroundColor: accent + '08',
          borderRadius: 10,
          padding: 10,
          marginBottom: 12,
        }}
      >
        <AppText variant="caption" color={accent} style={{ fontStyle: 'italic' }}>
          💡 {distortion.question}
        </AppText>
      </View>

      {/* Rebuttal input (only when selected) */}
      {isSelected && (
        <View>
          <AppText variant="caption" muted style={{ marginBottom: 6 }}>
            反驳引导：
          </AppText>
          <AppText variant="small" color={accent} style={{ lineHeight: 20, marginBottom: 10 }}>
            {distortion.rebuttal}
          </AppText>
          <TextInput
            value={rebuttalText}
            onChangeText={onRebuttalChange}
            placeholder="写下你自己的反驳..."
            placeholderTextColor={textSecondary}
            multiline
            style={{
              backgroundColor: bgCard,
              color: textPrimary,
              fontSize: 14,
              lineHeight: 20,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: borderLight,
              padding: 12,
              minHeight: 60,
            }}
          />
        </View>
      )}
    </View>
  );
}

// ─── 主页面 ──────────────────────────────────────────────────

export function ReframeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<DismantleStackParamList>>();
  const {
    currentSession,
    toggleDistortion,
    isDistortionSelected,
    setRebuttal,
    getRebuttal,
    goToStep,
  } = useSessionStore();

  if (!currentSession) return null;

  const selectedCount = currentSession.selectedDistortions.length;

  const handleNext = () => {
    goToStep('complete');
    navigation.navigate('Action');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Step Header */}
        <AppText variant="caption" muted style={{ marginBottom: 4 }}>
          步骤 3/4
        </AppText>
        <AppText variant="heading" style={{ marginBottom: 4 }}>
          认知重构
        </AppText>
        <AppText variant="small" muted style={{ marginBottom: 20 }}>
          识别你的思维模式，用理性的声音反驳自动产生的负面想法
        </AppText>

        {/* Horizontal card scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 12}
          decelerationRate="fast"
          contentContainerStyle={{ paddingRight: 20 }}
          style={{ marginBottom: 20 }}
        >
          {DISTORTIONS.map((d) => (
            <DistortionCard
              key={d.id}
              distortion={d}
              isSelected={isDistortionSelected(d.id)}
              rebuttalText={getRebuttal(d.id)}
              onToggle={() => toggleDistortion(d.id)}
              onRebuttalChange={(text) => setRebuttal(d.id, text)}
              accent={colors.accent}
              bgCard={colors.bgCard}
              borderLight={colors.borderLight}
              textPrimary={colors.textPrimary}
              textSecondary={colors.textSecondary}
            />
          ))}
        </ScrollView>

        {/* Selection indicator dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {DISTORTIONS.map((d) => (
            <View
              key={d.id}
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: isDistortionSelected(d.id) ? colors.accent : colors.borderLight,
              }}
            />
          ))}
        </View>

        {/* CTA */}
        <Button
          title={selectedCount > 0 ? `继续：微小行动（${selectedCount} 种认知扭曲）` : '继续：微小行动'}
          variant="primary"
          size="lg"
          block
          onPress={handleNext}
        />

        <AppText variant="caption" muted center style={{ marginTop: 12 }}>
          {selectedCount === 0
            ? '提示：选择符合你当前思维的认知扭曲卡片，练习反驳它们'
            : '已识别 ' + selectedCount + ' 种认知扭曲，你正在重新掌控你的思维'}
        </AppText>
      </ScrollView>
    </View>
  );
}
