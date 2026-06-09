/**
 * \u62C6\u89E3 \u2014 \u6D1E\u5BDF\u9875\uFF08Sprint 5 \u5B8C\u6574\u5B9E\u73B0\uFF09
 * Sprint 2: \u57FA\u7840\u7EDF\u8BA1\u9875\uFF0C\u5C55\u793A\u5DF2\u5B8C\u6210\u7684\u6570\u636E
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Card } from '../components';
import { useSessionStore } from '../stores/sessionStore';

export function InsightScreen() {
  const { colors } = useTheme();
  const history = useSessionStore(function (s) { return s.history; });

  const totalSessions = history.length;
  const completedSessions = history.filter(function (s) { return s.isCompleted; }).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="heading" style={{ marginBottom: 4 }}>
          {'\u6D1E\u5BDF'}
        </AppText>
        <AppText variant="small" muted style={{ marginBottom: 24 }}>
          {'\u4ECE\u6570\u636E\u4E2D\u8BA4\u8BC6\u81EA\u5DF1\u7684\u60C5\u7EEA\u6A21\u5F0F'}
        </AppText>

        {totalSessions > 0 ? (
          <>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <Card padding={20} style={{ flex: 1 }}>
                <AppText variant="heading">{totalSessions}</AppText>
                <AppText variant="caption" muted>
                  {'\u603B\u8BB0\u5F55'}
                </AppText>
              </Card>
              <Card padding={20} style={{ flex: 1 }}>
                <AppText variant="heading">{completedSessions}</AppText>
                <AppText variant="caption" muted>
                  {'\u5DF2\u5B8C\u6210'}
                </AppText>
              </Card>
            </View>
            <Card padding={24} style={{ marginBottom: 20 }}>
              <View style={{ alignItems: 'center' }}>
                <AppText variant="heading" style={{ marginBottom: 12 }}>
                  {'\uD83D\uDCCA'}
                </AppText>
                <AppText variant="subtitle" center bold style={{ marginBottom: 8 }}>
                  {'\u8BE6\u7EC6\u5206\u6790\u5373\u5C06\u4E0A\u7EBF'}
                </AppText>
                <AppText variant="small" muted center style={{ lineHeight: 20 }}>
                  {'Sprint 5 \u5C06\u5E26\u6765\u5B8C\u6574\u7684\u6D1E\u5BDF\u5206\u6790\uFF1A' + '\n'}
                  {'\u60C5\u7EEA\u8D8B\u52BF\u56FE\u3001\u9AD8\u9891\u56E0\u7D20\u3001\u8BA4\u77E5\u626D\u66F2\u6A21\u5F0F\u8BC6\u522B\u3001' + '\n'}
                  {'\u6539\u5584\u5EFA\u8BAE\u548C\u6BCF\u5468\u62A5\u544A\u3002'}
                </AppText>
              </View>
            </Card>
          </>
        ) : (
          <Card padding={24}>
            <View style={{ alignItems: 'center' }}>
              <AppText variant="heading" style={{ marginBottom: 12 }}>
                {'\uD83D\uDCCA'}
              </AppText>
              <AppText variant="subtitle" center bold style={{ marginBottom: 8 }}>
                {'\u8FD8\u6CA1\u6709\u6570\u636E'}
              </AppText>
              <AppText variant="small" muted center style={{ lineHeight: 20 }}>
                {'\u5B8C\u6210\u51E0\u6B21\u62C6\u89E3\u540E\uFF0C\u8FD9\u91CC\u4F1A\u5C55\u793A' + '\n'}
                {'\u4F60\u7684\u60C5\u7EEA\u6A21\u5F0F\u548C\u6539\u5584\u8D8B\u52BF\u3002'}
              </AppText>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
