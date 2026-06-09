import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../../theme';
import { AppText, Button, Card } from '../../components';
import { useSessionStore } from '../../stores/sessionStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EMOTION_OPTIONS } from '../../types/session';
import type { CoreEmotion, InputMethod } from '../../types/session';

type DismantleStackParamList = {
  Record: undefined;
  Classify: undefined;
};

export function RecordScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<DismantleStackParamList>>();
  const currentSession = useSessionStore(function (s) { return s.currentSession; });
  const setEmotion = useSessionStore(function (s) { return s.setEmotion; });
  const setAnxietyLevel = useSessionStore(function (s) { return s.setAnxietyLevel; });
  const setInputMethod = useSessionStore(function (s) { return s.setInputMethod; });
  const setRawText = useSessionStore(function (s) { return s.setRawText; });
  const parseFactors = useSessionStore(function (s) { return s.parseFactors; });
  const goToStep = useSessionStore(function (s) { return s.goToStep; });

  const emotion = currentSession?.emotion || null;
  const anxietyLevel = currentSession?.anxietyLevel || 5;
  const inputMethod = currentSession?.inputMethod || 'text';
  const rawText = currentSession?.rawText || '';

  const [localText, setLocalText] = useState(rawText);

  const handleNext = useCallback(function () {
    if (!emotion) {
      Alert.alert('\u63D0\u793A', '\u8BF7\u5148\u9009\u62E9\u4F60\u7684\u60C5\u7EEA');
      return;
    }
    if (inputMethod === 'text' && localText.trim().length === 0) {
      Alert.alert('\u63D0\u793A', '\u8BF7\u8F93\u5165\u4F60\u7684\u7126\u8651\u63CF\u8FF0');
      return;
    }
    setRawText(localText);
    parseFactors(localText);
    goToStep('classify');
    navigation.navigate('Classify');
  }, [emotion, inputMethod, localText, setRawText, parseFactors, goToStep, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="heading" style={{ marginBottom: 4 }}>
          {'\u6B65\u9AA4 1\uFF1A\u8BB0\u5F55'}
        </AppText>
        <AppText variant="small" muted style={{ marginBottom: 20 }}>
          {'\u5148\u544A\u8BC9\u6211\u4F60\u73B0\u5728\u7684\u611F\u53D7'}
        </AppText>

        {/* Emotion Selector */}
        <AppText variant="caption" muted style={{ marginBottom: 8 }}>
          {'\u4F60\u73B0\u5728\u7684\u60C5\u7EEA'}
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {EMOTION_OPTIONS.map(function (em) {
              const selected = emotion === em.id;
              return (
                <TouchableOpacity
                  key={em.id}
                  activeOpacity={0.7}
                  onPress={function () { setEmotion(em.id); }}
                  style={{
                    backgroundColor: selected ? colors.accent : colors.bgCard,
                    borderWidth: 1.5,
                    borderColor: selected ? colors.accent : colors.borderLight,
                    borderRadius: 16,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    alignItems: 'center',
                    minWidth: 90,
                  }}
                >
                  <AppText variant="heading" style={{ marginBottom: 4 }}>
                    {em.emoji}
                  </AppText>
                  <AppText variant="caption" bold color={selected ? '#FFFFFF' : undefined}>
                    {em.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Anxiety Level Slider */}
        <AppText variant="caption" muted style={{ marginBottom: 8 }}>
          {'\u7126\u8651\u7A0B\u5EA6\uFF1A' + anxietyLevel + '/10'}
        </AppText>
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) {
              const filled = n <= anxietyLevel;
              return (
                <TouchableOpacity
                  key={n}
                  onPress={function () { setAnxietyLevel(n); }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: filled ? colors.accent : colors.borderLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppText variant="caption" color={filled ? '#FFFFFF' : colors.textTertiary} style={{ fontSize: 10 }}>
                    {n}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="caption" muted>{'\u8F7B\u5FAE'}</AppText>
            <AppText variant="caption" muted>{'\u4E2D\u7B49'}</AppText>
            <AppText variant="caption" muted>{'\u4E25\u91CD'}</AppText>
          </View>
        </View>

        {/* Input Method Toggle */}
        <View style={{ flexDirection: 'row', marginBottom: 16, gap: 10 }}>
          <TouchableOpacity
            onPress={function () { setInputMethod('text'); }}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: inputMethod === 'text' ? colors.accent : colors.bgCard,
              borderWidth: 1,
              borderColor: inputMethod === 'text' ? colors.accent : colors.borderLight,
              alignItems: 'center',
            }}
          >
            <AppText variant="caption" bold color={inputMethod === 'text' ? '#FFFFFF' : colors.textPrimary}>
              {'\u270D\uFE0F \u6587\u5B57\u8F93\u5165'}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={function () { setInputMethod('voice'); }}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: inputMethod === 'voice' ? colors.accent : colors.bgCard,
              borderWidth: 1,
              borderColor: inputMethod === 'voice' ? colors.accent : colors.borderLight,
              alignItems: 'center',
            }}
          >
            <AppText variant="caption" bold color={inputMethod === 'voice' ? '#FFFFFF' : colors.textPrimary}>
              {'\uD83C\uDF99\uFE0F \u8BED\u97F3\u8F93\u5165'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Text Input or Voice Button */}
        {inputMethod === 'text' ? (
          <Card padding={0} style={{ marginBottom: 24 }}>
            <TextInput
              multiline
              numberOfLines={6}
              placeholder={'\u63CF\u8FF0\u4F60\u7684\u7126\u8651\u2026\u2026\u4F8B\u5982\uFF1A\u201C\u6211\u62C5\u5FC3\u4E0B\u5468\u7684\u6C47\u62A5\u505A\u4E0D\u597D\uFF0C\u540C\u4E8B\u4E0D\u914D\u5408\uFF0C\u8FD8\u6709\u623F\u8D37\u538B\u529B\u201D'}
              placeholderTextColor={colors.textTertiary}
              value={localText}
              onChangeText={setLocalText}
              style={{
                padding: 16,
                fontSize: 16,
                lineHeight: 24,
                color: colors.textPrimary,
                minHeight: 140,
                textAlignVertical: 'top',
              }}
            />
          </Card>
        ) : (
          <Card padding={24} style={{ marginBottom: 24, alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={function () {
                Alert.alert('\u63D0\u793A', '\u8BED\u97F3\u5F55\u5236\u529F\u80FD\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E2D\u5B9E\u73B0');
              }}
              style={{ alignItems: 'center' }}
            >
              <AppText variant="heading" style={{ marginBottom: 8 }}>
                {'\uD83C\uDF99\uFE0F'}
              </AppText>
              <AppText variant="subtitle" bold>
                {'\u70B9\u51FB\u5F55\u5236'}
              </AppText>
              <AppText variant="caption" muted style={{ marginTop: 4 }}>
                {'\u8BED\u97F3\u5F55\u5236\u529F\u80FD\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E2D\u5B9E\u73B0'}
              </AppText>
            </TouchableOpacity>
          </Card>
        )}

        {/* Next Button */}
        <Button
          title={'\u4E0B\u4E00\u6B65'}
          variant="primary"
          size="lg"
          block
          onPress={handleNext}
        />
      </ScrollView>
    </View>
  );
}
