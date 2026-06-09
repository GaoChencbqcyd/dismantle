import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Button, Input, ProgressBar } from '../components';
import { useSessionStore } from '../stores/sessionStore';
import { useNavigation } from '@react-navigation/native';

export function RecordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSession, updateRecord, goToStep } = useSessionStore();
  const [text, setText] = useState(currentSession?.recordText || '');
  const [score, setScore] = useState(currentSession?.scoreBefore || 0);
  const canProceed = text.trim().length > 0 && score > 0;

  const handleNext = () => {
    updateRecord(text, score);
    goToStep('classify');
    navigation.navigate('SessionClassify');
  };

  const handleVoiceSimulate = () => {
    setText('周一上午要向上级汇报Q2规划，我的方案还没有完全打磨好，数据支撑不够充分。上次汇报老板说我的数据维度太单一，这次担心又被质疑。另外同事小李的方案看起来很完整，比较之下压力更大。');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 20 }} keyboardShouldPersistTaps="handled">
        <ProgressBar progress={0.25} steps={4} currentStep={1} />
        <AppText variant="caption" muted center style={{ marginVertical: 8 }}>步骤 1/4 · 记录</AppText>
        <AppText variant="title" style={{ marginBottom: 4 }}>描述让你焦虑的事情</AppText>
        <AppText variant="small" muted style={{ marginBottom: 16 }}>命名情绪本身就能降低焦虑。写下或说出你的感受。</AppText>
        <Input placeholder="比如：周一要汇报，担心方案不完善被领导质疑..." multiline value={text} onChangeText={setText} maxLength={1000} showCount />
        <TouchableOpacity activeOpacity={0.7} onPress={handleVoiceSimulate}
          style={{ backgroundColor: colors.bgInput, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 20, flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.border }}>
          <AppText variant="body">🎤</AppText>
          <AppText variant="small" muted>语音录入（模拟）</AppText>
        </TouchableOpacity>
        <AppText variant="small" muted style={{ marginBottom: 12 }}>焦虑强度（1-10）</AppText>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <TouchableOpacity key={n} activeOpacity={0.7} onPress={() => setScore(n)}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: score === n ? colors.accent : colors.bgInput, borderWidth: 1.5, borderColor: score === n ? colors.accent : colors.border, alignItems: 'center', justifyContent: 'center' }}>
              <AppText variant="small" bold={score === n} color={score === n ? colors.textInverse : colors.textSecondary}>{n}</AppText>
            </TouchableOpacity>
          ))}
        </View>
        <Button title="下一步：分类" variant="primary" size="lg" block disabled={!canProceed} onPress={handleNext} />
        {!canProceed && <AppText variant="caption" muted center style={{ marginTop: 8 }}>请描述焦虑事件并选择焦虑强度</AppText>}
      </ScrollView>
    </View>
  );
}
