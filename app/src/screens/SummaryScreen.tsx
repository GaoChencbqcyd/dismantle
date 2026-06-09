import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Button } from '../components';
import { MICRO_ACTIONS, categorizeAnxiety } from '../data/content';
import { useSessionStore } from '../stores/sessionStore';
import { useNavigation } from '@react-navigation/native';

export function SummaryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSession } = useSessionStore();
  if (!currentSession || currentSession.status !== 'completed') return null;

  const category = categorizeAnxiety(currentSession.recordText);
  const actions = MICRO_ACTIONS[category] || MICRO_ACTIONS['默认'];
  const selectedAction = currentSession.selectedActionIndex !== null ? actions[currentSession.selectedActionIndex] : null;
  const improvement = currentSession.scoreBefore - currentSession.scoreAfter;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 20 }}>
        <View style={{ backgroundColor: colors.bgCard, borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight }}>
          <AppText variant="heading" style={{ marginBottom: 12 }}>{improvement >= 3 ? '🎉' : improvement >= 1 ? '😌' : '💪'}</AppText>
          <AppText variant="subtitle" center style={{ marginBottom: 20 }}>拆解完成！</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <View style={{ alignItems: 'center' }}><AppText variant="caption" muted>拆解前</AppText><AppText variant="heading" color={colors.danger}>{currentSession.scoreBefore}</AppText></View>
            <AppText variant="title" muted>→</AppText>
            <View style={{ alignItems: 'center' }}><AppText variant="caption" muted>拆解后</AppText><AppText variant="heading" color={colors.success}>{currentSession.scoreAfter}</AppText></View>
          </View>
          <View style={{ backgroundColor: colors.bgInput, borderRadius: 12, padding: 12, marginBottom: 20, width: '100%', alignItems: 'center' }}>
            <AppText variant="caption" muted>焦虑下降了</AppText>
            <AppText variant="title" color={colors.accent}>-{improvement} 分</AppText>
          </View>
          {selectedAction && (
            <View style={{ backgroundColor: colors.accentGlow, borderRadius: 12, padding: 16, marginBottom: 20, width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AppText variant="title">{selectedAction.icon}</AppText>
              <View style={{ flex: 1 }}><AppText variant="body" bold>{selectedAction.title}</AppText><AppText variant="caption" muted>{selectedAction.hint}</AppText></View>
            </View>
          )}
          <Button title="返回首页" variant="primary" size="lg" block onPress={() => navigation.navigate('Main')} />
        </View>
      </ScrollView>
    </View>
  );
}
