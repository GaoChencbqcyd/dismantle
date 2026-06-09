import React, { useCallback } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Button, Card, EmptyState } from '../components';
import { useSessionStore } from '../stores/sessionStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EMOTION_OPTIONS } from '../types/session';
import type { CoreEmotion } from '../types/session';

type RootStackParamList = {
  Main: undefined;
  DismantleFlow: { screen: string } | undefined;
};

function RingProgress({ completed, total }: { completed: number; total: number }) {
  const { colors } = useTheme();
  const ratio = total > 0 ? completed / total : 0;
  return (
    <View style={{ alignItems: 'center' }}>
      <AppText variant="heading">{total > 0 ? Math.round(ratio * 100) + '%' : '--'}</AppText>
      <AppText variant="caption" muted>
        {completed}/{total} 今日已完成
      </AppText>
    </View>
  );
}

export function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentSession = useSessionStore(function (s) { return s.currentSession; });
  const history = useSessionStore(function (s) { return s.history; });
  const startSession = useSessionStore(function (s) { return s.startSession; });
  const setEmotion = useSessionStore(function (s) { return s.setEmotion; });

  const isSessionActive = currentSession !== null && !currentSession.isCompleted;
  const completedToday = currentSession !== null && currentSession.isCompleted;
  const hasHistory = history.length > 0;

  const handleStart = useCallback(function (emotion?: CoreEmotion) {
    startSession();
    if (emotion) {
      setEmotion(emotion);
    }
    navigation.navigate('DismantleFlow', { screen: 'Record' });
  }, [startSession, setEmotion, navigation]);

  const handleResume = useCallback(function () {
    navigation.navigate('DismantleFlow', { screen: 'Record' });
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="heading">{'\u62C6\u89E3'}</AppText>
        <AppText variant="small" muted style={{ marginTop: 4, marginBottom: 20 }}>
          {'\u770B\u6E05\u5B83 \u00B7 \u62C6\u5F00\u5B83 \u00B7 \u89E3\u51B3\u5B83'}
        </AppText>

        <Card padding={28}>
          <View style={{ alignItems: 'center' }}>
            <AppText variant="heading" style={{ marginBottom: 8 }}>
              {completedToday ? '\u2705' : isSessionActive ? '\u23F3' : '\uD83E\uDDE0'}
            </AppText>
            <AppText variant="subtitle" center style={{ marginBottom: 4 }}>
              {completedToday
                ? '\u4ECA\u65E5\u62C6\u89E3\u5DF2\u5B8C\u6210'
                : isSessionActive
                ? '\u4E0A\u6B21\u62C6\u89E3\u672A\u5B8C\u6210'
                : '\u4ECA\u5929\u611F\u89C9\u600E\u4E48\u6837\uFF1F'}
            </AppText>
            <AppText variant="small" muted center style={{ marginBottom: 20 }}>
              {completedToday
                ? '\u4F60\u5DF2\u7406\u6E05\u4E86\u601D\u7EEA\uFF0C\u505A\u5F97\u5F88\u597D'
                : isSessionActive
                ? '\u662F\u5426\u7EE7\u7EED\u4E0A\u6B21\u7684\u62C6\u89E3\uFF1F'
                : '\u82B1\u51E0\u5206\u949F\uFF0C\u628A\u7126\u8651\u62C6\u89E3\u5F00'}
            </AppText>

            {isSessionActive ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title={'\u7EE7\u7EED\u62C6\u89E3'} variant="primary" size="lg" onPress={handleResume} />
                <Button title={'\u91CD\u65B0\u5F00\u59CB'} variant="ghost" size="lg" onPress={function () { handleStart(); }} />
              </View>
            ) : (
              <Button
                title={completedToday ? '\u518D\u505A\u4E00\u6B21' : '\u5F00\u59CB\u62C6\u89E3'}
                variant="primary"
                size="lg"
                block
                onPress={function () { handleStart(); }}
              />
            )}
          </View>
        </Card>

        {!isSessionActive && (
          <>
            <AppText variant="small" muted style={{ marginTop: 20, marginBottom: 10 }}>
              {'\u6216\u9009\u62E9\u4F60\u73B0\u5728\u7684\u611F\u53D7'}
            </AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {EMOTION_OPTIONS.map(function (em) {
                  return (
                    <TouchableOpacity
                      key={em.id}
                      activeOpacity={0.7}
                      onPress={function () { handleStart(em.id); }}
                      style={{
                        backgroundColor: colors.bgCard,
                        borderWidth: 1.5,
                        borderColor: colors.borderLight,
                        borderRadius: 16,
                        paddingVertical: 16,
                        paddingHorizontal: 14,
                        alignItems: 'center',
                        minWidth: 105,
                      }}
                    >
                      <AppText variant="heading" style={{ marginBottom: 6 }}>
                        {em.emoji}
                      </AppText>
                      <AppText variant="small" bold>
                        {em.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </>
        )}

        <AppText variant="small" muted style={{ marginTop: 24, marginBottom: 8 }}>
          {'\u6700\u8FD1\u8BB0\u5F55'}
        </AppText>
        {hasHistory ? (
          history.slice(0, 3).map(function (session) {
            return (
              <Card key={session.id} padding={16}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <AppText variant="caption" muted>
                    {new Date(session.createdAt).toLocaleDateString('zh-CN')}
                  </AppText>
                  <View
                    style={{
                      backgroundColor: session.isCompleted ? colors.success : colors.border,
                      borderRadius: 10,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <AppText variant="caption" color="#FFFFFF">
                      {session.isCompleted ? '\u5DF2\u5B8C\u6210' : '\u672A\u5B8C\u6210'}
                    </AppText>
                  </View>
                </View>
                <AppText variant="small" style={{ lineHeight: 20 }} numberOfLines={2}>
                  {session.emotion ? EMOTION_OPTIONS.find(function (e) { return e.id === session.emotion; })?.emoji + ' ' + EMOTION_OPTIONS.find(function (e) { return e.id === session.emotion; })?.label : '\u672A\u8BB0\u5F55\u60C5\u7EEA'}
                  {' \u00B7 '}
                  {'\u7126\u8651\u7B49\u7EA7 ' + session.anxietyLevel}
                  {' \u00B7 '}
                  {session.factorCount + ' \u4E2A\u56E0\u7D20'}
                  {' \u00B7 '}
                  {session.controllableCount + ' \u4E2A\u53EF\u63A7'}
                </AppText>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon={'\uD83D\uDCCB'}
            title={'\u8FD8\u6CA1\u6709\u62C6\u89E3\u8BB0\u5F55'}
            description={'\u611F\u5230\u7126\u8651\u65F6\uFF0C\u6211\u5728\u8FD9\u91CC\u3002\u5F00\u59CB\u4F60\u7684\u7B2C\u4E00\u6B21\u62C6\u89E3\u5427\u3002'}
          />
        )}
      </ScrollView>
    </View>
  );
}
