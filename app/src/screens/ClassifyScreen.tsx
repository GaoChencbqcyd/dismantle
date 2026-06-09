import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Button, ProgressBar } from '../components';
import { useSessionStore } from '../stores/sessionStore';
import { useNavigation } from '@react-navigation/native';

export function ClassifyScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSession, classifyFactor, unclassifyFactor, allClassified, goToStep } = useSessionStore();
  if (!currentSession) return null;

  const { factors } = currentSession;
  const allDone = allClassified();

  const handleToggle = (factorId: string) => {
    const f = factors.find(x => x.id === factorId);
    if (!f) return;
    if (f.zone === null) classifyFactor(factorId, 'controllable');
    else if (f.zone === 'controllable') classifyFactor(factorId, 'uncontrollable');
    else unclassifyFactor(factorId);
  };

  const handleNext = () => { goToStep('reframe'); navigation.navigate('SessionReframe'); };

  const controllableItems = factors.filter(f => f.zone === 'controllable');
  const uncontrollableItems = factors.filter(f => f.zone === 'uncontrollable');
  const unclassifiedItems = factors.filter(f => f.zone === null);

  const FactorItem = ({ factor }: { factor: typeof factors[0] }) => (
    <TouchableOpacity activeOpacity={0.7} onPress={() => handleToggle(factor.id)}
      style={{ backgroundColor: colors.bgCard, borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1,
        borderColor: factor.zone === 'controllable' ? colors.success : factor.zone === 'uncontrollable' ? colors.warning : colors.border }}>
      <AppText variant="small">{factor.text}</AppText>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 20 }}>
        <ProgressBar progress={0.5} steps={4} currentStep={2} />
        <AppText variant="caption" muted center style={{ marginVertical: 8 }}>步骤 2/4 · 分类</AppText>
        <AppText variant="title" style={{ marginBottom: 4 }}>区分可控与不可控</AppText>
        <AppText variant="small" muted style={{ marginBottom: 16 }}>点击因素切换分类。把精力放在你能改变的事情上。</AppText>

        <View style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: colors.success, borderRadius: 16, padding: 16, marginBottom: 12, minHeight: 80, backgroundColor: 'rgba(107,155,111,0.05)' }}>
          <AppText variant="caption" bold style={{ color: colors.success, marginBottom: 8 }}>✅ 我可控</AppText>
          {controllableItems.length > 0 ? controllableItems.map(f => <FactorItem key={f.id} factor={f} />) : <AppText variant="small" muted>点击下方因素添加到此处</AppText>}
        </View>
        <View style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: colors.warning, borderRadius: 16, padding: 16, marginBottom: 12, minHeight: 80, backgroundColor: 'rgba(212,164,74,0.05)' }}>
          <AppText variant="caption" bold style={{ color: colors.warning, marginBottom: 8 }}>🌊 不可控</AppText>
          {uncontrollableItems.length > 0 ? uncontrollableItems.map(f => <FactorItem key={f.id} factor={f} />) : <AppText variant="small" muted>点击下方因素添加到此处</AppText>}
        </View>
        {unclassifiedItems.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <AppText variant="caption" muted style={{ marginBottom: 8 }}>待分类（点击切换）</AppText>
            {unclassifiedItems.map(f => <FactorItem key={f.id} factor={f} />)}
          </View>
        )}
        <Button title="下一步：认知重构" variant="primary" size="lg" block disabled={!allDone} onPress={handleNext} />
        {!allDone && <AppText variant="caption" muted center style={{ marginTop: 8 }}>还有未分类的事项</AppText>}
      </ScrollView>
    </View>
  );
}
