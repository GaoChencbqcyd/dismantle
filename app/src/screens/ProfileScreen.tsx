/**
 * 拆解 — 我的页（Sprint 5 完整实现）
 *
 * 个人中心：用户档案 + 设置 + 数据管理
 */

import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../theme';
import { AppText, Card, ToggleSwitch } from '../components';
import { useSessionStore } from '../stores/sessionStore';
import { KvStorage, STORAGE_KEYS } from '../services/storage';

export function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const history = useSessionStore((s) => s.history);
  const loadHistory = useSessionStore((s) => s.loadHistory);

  const totalSessions = history.length;
  const completedSessions = history.filter((s) => s.isCompleted).length;

  // 计算使用天数
  const daysUsed = history.length > 0
    ? (() => {
        const dates = new Set(history.map((s) => new Date(s.createdAt).toDateString()));
        return dates.size;
      })()
    : 0;

  const handleClearData = useCallback(() => {
    Alert.alert(
      '确认清除',
      '这将删除所有拆解记录和罗盘数据，此操作不可恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            try {
              await KvStorage.remove(STORAGE_KEYS.SESSION_HISTORY);
              await KvStorage.remove(STORAGE_KEYS.SESSION_DRAFT);
              await KvStorage.remove(STORAGE_KEYS.COMPASS);
              await loadHistory();
            } catch (e) {
              console.error('[Profile] clear data failed:', e);
            }
          },
        },
      ],
    );
  }, [loadHistory]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="heading" style={{ marginBottom: 4 }}>我的</AppText>
        <AppText variant="small" muted style={{ marginBottom: 20 }}>
          个人中心与设置
        </AppText>

        {/* 用户卡片 */}
        <Card padding={28} style={{ alignItems: 'center', marginBottom: 20 }}>
          <AppText variant="hero" style={{ marginBottom: 8 }}>🧠</AppText>
          <AppText variant="subtitle" bold>拆解用户</AppText>
          <AppText variant="small" muted style={{ marginTop: 4 }}>
            已使用 {daysUsed} 天 · 完成 {completedSessions} 次拆解
          </AppText>

          {/* 使用统计条 */}
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 16 }}>
            <View style={{ alignItems: 'center' }}>
              <AppText variant="body" bold style={{ color: colors.accent }}>{totalSessions}</AppText>
              <AppText variant="caption" muted>总记录</AppText>
            </View>
            <View style={{ width: 1, backgroundColor: colors.divider }} />
            <View style={{ alignItems: 'center' }}>
              <AppText variant="body" bold style={{ color: colors.success }}>{completedSessions}</AppText>
              <AppText variant="caption" muted>已完成</AppText>
            </View>
            <View style={{ width: 1, backgroundColor: colors.divider }} />
            <View style={{ alignItems: 'center' }}>
              <AppText variant="body" bold style={{ color: colors.info }}>{daysUsed}</AppText>
              <AppText variant="caption" muted>使用天数</AppText>
            </View>
          </View>
        </Card>

        {/* 设置区 */}
        <AppText variant="small" muted style={{ marginBottom: 8 }}>设置</AppText>

        {/* 深色模式 */}
        <Card padding={16} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <AppText variant="body">🌙 深色模式</AppText>
            </View>
            <ToggleSwitch value={isDark} onToggle={toggleTheme} />
          </View>
        </Card>

        {/* 清除数据 */}
        <Card interactive onPress={handleClearData} padding={16} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="body" style={{ color: colors.danger }}>🗑️ 清除所有数据</AppText>
            <AppText variant="caption" muted>不可恢复</AppText>
          </View>
        </Card>

        {/* 关于区 */}
        <AppText variant="small" muted style={{ marginTop: 16, marginBottom: 8 }}>关于</AppText>

        <Card padding={16} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="body">📱 版本</AppText>
            <AppText variant="caption" muted>0.4.0</AppText>
          </View>
        </Card>

        <Card interactive onPress={() => {}} padding={16} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="body">📜 用户协议</AppText>
            <AppText variant="caption" muted>查看</AppText>
          </View>
        </Card>

        <Card interactive onPress={() => {}} padding={16} style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="body">🔒 隐私政策</AppText>
            <AppText variant="caption" muted>查看</AppText>
          </View>
        </Card>

        {/* 底部署名 */}
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <AppText variant="caption" muted>
            拆解 — 看清它 · 拆开它 · 解决它
          </AppText>
          <AppText variant="caption" muted style={{ marginTop: 4 }}>
            Made with ❤️ for anxious minds
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}
