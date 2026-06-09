import React, { useCallback } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Button, Card, EmptyState } from '../components';
import { EMOTIONS } from '../data/content';
import { useSessionStore } from '../stores/sessionStore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CoreEmotion } from '../types/session';

type RootStackParamList = {
  Main: undefined;
  SessionRecord: undefined;
};

export function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { currentSession, sessionHistory, startSession } = useSessionStore();

  const isSessionActive = currentSession?.status === 'in_progress';
  const completedToday = currentSession?.status === 'completed';
  const hasHistory = sessionHistory.length > 0;

  const handleStart = useCallback((emotion?: string) => {
    startSession(emotion as CoreEmotion);
    navigation.navigate('SessionRecord');
  }, [startSession, navigation]);

  const handleResume = useCallback(() => {
    navigation.navigate('SessionRecord');
  }, [navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="heading">拆解</AppText>
        <AppText variant="small" muted style={{ marginTop: 4, marginBottom: 20 }}>
          看清它 · 拆开它 · 解决它
        </AppText>

        {/* Today Status */}
        <Card padding={28}>
          <View style={{ alignItems: 'center' }}>
            <AppText variant="heading" style={{ marginBottom: 8 }}>
              {completedToday ? '✅' : isSessionActive ? '⏳' : '🧠'}
            </AppText>
            <AppText variant="subtitle" center style={{ marginBottom: 4 }}>
              {completedToday
                ? '今日拆解已完成'
                : isSessionActive
                ? '上次拆解未完成'
                : '今天感觉怎么样？'}
            </AppText>
            <AppText variant="small" muted center style={{ marginBottom: 20 }}>
              {completedToday
                ? '你已理清了思绪，做得很好'
                : isSessionActive
                ? '是否继续上次的拆解？'
                : '花几分钟，把焦虑拆解开'}
            </AppText>

            {isSessionActive ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title="继续拆解" variant="primary" size="lg" onPress={handleResume} />
                <Button title="重新开始" variant="ghost" size="lg" onPress={() => handleStart()} />
              </View>
            ) : (
              <Button
                title={completedToday ? '再做一次' : '开始拆解'}
                variant="primary"
                size="lg"
                block
                onPress={() => handleStart()}
              />
            )}
          </View>
        </Card>

        {/* Emotion Quick Select */}
        {!isSessionActive && (
          <>
            <AppText variant="small" muted style={{ marginTop: 20, marginBottom: 10 }}>
              或选择你现在的感受
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {EMOTIONS.map(em => (
                <TouchableOpacity
                  key={em.id}
                  activeOpacity={0.7}
                  onPress={() => handleStart(em.id)}
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
              ))}
            </View>
          </>
        )}

        {/* Recent History */}
        <AppText variant="small" muted style={{ marginTop: 24, marginBottom: 8 }}>
          最近记录
        </AppText>
        {hasHistory ? (
          sessionHistory.slice(0, 3).map(session => (
            <Card key={session.id} padding={16}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <AppText variant="caption" muted>
                  {new Date(session.createdAt).toLocaleDateString('zh-CN')}
                </AppText>
                <View
                  style={{
                    backgroundColor: session.scoreAfter > 0 ? colors.success : colors.border,
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <AppText variant="caption" color="#FFFFFF">
                    {session.scoreBefore}→{session.scoreAfter}
                  </AppText>
                </View>
              </View>
              <AppText variant="small" style={{ lineHeight: 20 }} numberOfLines={2}>
                {session.recordText}
              </AppText>
            </Card>
          ))
        ) : (
          <EmptyState
            icon="📋"
            title="还没有拆解记录"
            description="感到焦虑时，我在这里。开始你的第一次拆解吧。"
          />
        )}
      </ScrollView>
    </View>
  );
}
