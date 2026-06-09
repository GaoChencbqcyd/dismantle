import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Button, ProgressBar } from '../components';
import { MICRO_ACTIONS, categorizeAnxiety } from '../data/content';
import { useSessionStore } from '../stores/sessionStore';
import { useNavigation } from '@react-navigation/native';

export function ActionScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSession, selectAction, completeSession, goToStep } = useSessionStore();
  if (!currentSession) return null;

  const category = categorizeAnxiety(currentSession.recordText);
  const actions = MICRO_ACTIONS[category] || MICRO_ACTIONS['默认'];

  const handleSelect = (index: number) => selectAction(index);

  const handleComplete = () => {
    const improvement = Math.floor(Math.random() * 3) + 2;
    const scoreAfter = Math.max(1, currentSession.scoreBefore - improvement);
    completeSession(scoreAfter);
    goToStep('complete');
    navigation.navigate('SessionSummary');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 20 }}>
        <ProgressBar progress={1} steps={4} currentStep={4} />
        <AppText variant="caption" muted center style={{ marginVertical: 8 }}>步骤 4/4 · 行动</AppText>
        <AppText variant="title" style={{ marginBottom: 4 }}>选择一个微小行动</AppText>
        <AppText variant="small" muted style={{ marginBottom: 16 }}>不需要彻底解决所有问题。今天只做一件小事。</AppText>
        {actions.map((action, i) => {
          const isSelected = currentSession.selectedActionIndex === i;
          return (
            <TouchableOpacity key={i} activeOpacity={0.7} onPress={() => handleSelect(i)}
              style={{ backgroundColor: isSelected ? colors.accentGlow : colors.bgCard, borderWidth: 1.5, borderColor: isSelected ? colors.accent : colors.borderLight, borderRadius: 16, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: colors.bgInput, alignItems: 'center', justifyContent: 'center' }}><AppText variant="title">{action.icon}</AppText></View>
              <View style={{ flex: 1 }}><AppText variant="body" bold>{action.title}</AppText><AppText variant="caption" muted style={{ marginTop: 2 }}>{action.hint}</AppText></View>
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: isSelected ? colors.accent : colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? colors.accent : 'transparent' }}>{isSelected && <AppText variant="caption" color={colors.textInverse} bold>✓</AppText>}</View>
            </TouchableOpacity>
          );
        })}
        <Button title="完成拆解" variant="primary" size="lg" block disabled={currentSession.selectedActionIndex === null} onPress={handleComplete} style={{ marginTop: 8 }} />
      </ScrollView>
    </View>
  );
}
