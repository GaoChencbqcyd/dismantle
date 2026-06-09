import React from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Card } from '../components';
import { useSessionStore } from '../stores/sessionStore';
import { KvStorage, STORAGE_KEYS } from '../services/storage';

export function ProfileScreen() {
  const { colors } = useTheme();
  const history = useSessionStore(function (s) { return s.history; });

  const totalSessions = history.length;
  const completedSessions = history.filter(function (s) { return s.isCompleted; }).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        <AppText variant="heading">{'\u6211\u7684'}</AppText>
        <AppText variant="small" muted style={{ marginTop: 4, marginBottom: 20 }}>
          {'\u4E2A\u4EBA\u4E2D\u5FC3\uFF08Sprint 5 \u5B8C\u6574\u5B9E\u73B0\uFF09'}
        </AppText>

        <Card padding={28} style={{ alignItems: 'center' }}>
          <AppText variant="heading" style={{ marginBottom: 8 }}>{'\uD83E\uDDE0'}</AppText>
          <AppText variant="subtitle">{'\u62C6\u89E3\u7528\u6237'}</AppText>
          <AppText variant="small" muted style={{ marginTop: 4 }}>
            {'\u5DF2\u4F7F\u7528 ' + (totalSessions > 0 ? '\u591A' : '0') + ' \u5929 \u00B7 \u5B8C\u6210 ' + completedSessions + ' \u6B21\u62C6\u89E3'}
          </AppText>
        </Card>

        <AppText variant="small" muted style={{ marginTop: 20, marginBottom: 8 }}>
          {'\u529F\u80FD'}
        </AppText>
        <Card interactive onPress={function () {}} padding={16}>
          <AppText variant="body">{'\u23F0 \u667A\u80FD\u63D0\u9192'}</AppText>
          <AppText variant="caption" muted>{'\u672A\u5F00\u542F'}</AppText>
        </Card>
        <Card interactive onPress={function () {}} padding={16}>
          <AppText variant="body">{'\uD83D\uDCE4 \u6570\u636E\u5BFC\u51FA'}</AppText>
          <AppText variant="caption" muted>{'\u5BFC\u51FAPDF\u6216\u6587\u672C'}</AppText>
        </Card>
        <Card interactive onPress={function () {}} padding={16}>
          <AppText variant="body">{'\u2699\uFE0F \u8BBE\u7F6E'}</AppText>
          <AppText variant="caption" muted>{'\u4E3B\u9898\u3001\u9690\u79C1\u3001\u5173\u4E8E'}</AppText>
        </Card>
      </ScrollView>
    </View>
  );
}
