import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Button, Input, ProgressBar } from '../components';
import { DISTORTIONS } from '../data/content';
import { useSessionStore } from '../stores/sessionStore';
import { useNavigation } from '@react-navigation/native';

export function ReframeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSession, selectDistortion, unselectDistortion, addRebuttal, goToStep } = useSessionStore();
  if (!currentSession) return null;

  const { selectedDistortions, rebuttals } = currentSession;

  const handleToggle = (id: number) => {
    selectedDistortions.includes(id) ? unselectDistortion(id) : selectDistortion(id);
  };

  const handleNext = () => { goToStep('action'); navigation.navigate('SessionAction'); };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 20 }}>
        <ProgressBar progress={0.75} steps={4} currentStep={3} />
        <AppText variant="caption" muted center style={{ marginVertical: 8 }}>步骤 3/4 · 认知重构</AppText>
        <AppText variant="title" style={{ marginBottom: 4 }}>挑战你的思维模式</AppText>
        <AppText variant="small" muted style={{ marginBottom: 16 }}>左右滑动浏览，选择符合你思维的认知扭曲卡片，写下反驳。</AppText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={260} decelerationRate="fast" style={{ marginBottom: 20 }}>
          {DISTORTIONS.map(d => {
            const isSelected = selectedDistortions.includes(d.id);
            const rebuttal = rebuttals.find(r => r.distortionId === d.id);
            return (
              <TouchableOpacity key={d.id} activeOpacity={0.8} onPress={() => handleToggle(d.id)}
                style={{ width: 250, backgroundColor: isSelected ? colors.accentGlow : colors.bgCard, borderWidth: 1.5, borderColor: isSelected ? colors.accent : colors.borderLight, borderRadius: 16, padding: 20, marginRight: 12 }}>
                <AppText variant="caption" color={colors.accent} bold>#{d.id}</AppText>
                <AppText variant="subtitle" style={{ marginTop: 4, marginBottom: 6 }}>{d.name}</AppText>
                <AppText variant="small" muted style={{ marginBottom: 10 }}>{d.desc}</AppText>
                <AppText variant="small" color={colors.accent} style={{ fontStyle: 'italic' }}>{d.question}</AppText>
                {isSelected && (
                  <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: 12 }}>
                    <AppText variant="caption" muted style={{ marginBottom: 4 }}>反驳引导：</AppText>
                    <AppText variant="small" color={colors.accent} style={{ lineHeight: 20, marginBottom: 8 }}>{d.rebuttal}</AppText>
                    <Input placeholder="写下你自己的反驳..." value={rebuttal?.rebuttalText || ''} onChangeText={text => addRebuttal(d.id, text)} multiline />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <AppText variant="caption" muted center style={{ marginBottom: 16 }}>
          {selectedDistortions.length === 0 ? '选择至少一张卡片' : `已选择 ${selectedDistortions.length} 种认知扭曲`}
        </AppText>
        <Button title="下一步：微小行动" variant="primary" size="lg" block onPress={handleNext} />
      </ScrollView>
    </View>
  );
}
