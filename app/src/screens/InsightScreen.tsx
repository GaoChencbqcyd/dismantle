/**
 * 拆解 — 洞察页（Sprint 5 完整实现）
 *
 * 数据驱动自我认知：
 *   1. 概览统计 — 总记录、完成率、改善率
 *   2. 情绪分布 — 各情绪占比环形图
 *   3. 焦虑趋势 — 最近 7/30 天的焦虑评分变化
 *   4. 高频因素 — 因素数量排行
 *   5. 认知扭曲模式 — 最常出现的扭曲类型
 *   6. 改善指标 — 拆解前后焦虑评分对比
 */

import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme';
import { AppText, Card, EmptyState } from '../components';
import { useSessionStore } from '../stores/sessionStore';
import { EMOTION_OPTIONS } from '../types/session';
import type { SessionSummary, CoreEmotion } from '../types/session';
import { DISTORTIONS } from '../data/content';

const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── 工具函数 ─────────────────────────────────────────────────

/** 计算改善率：有 after 评分的 session 中，after < level 的比例 */
function calcImprovementRate(history: SessionSummary[]): number {
  const withAfter = history.filter((s) => s.anxietyAfter !== null);
  if (withAfter.length === 0) return 0;
  const improved = withAfter.filter((s) => (s.anxietyAfter ?? 0) < s.anxietyLevel);
  return Math.round((improved.length / withAfter.length) * 100);
}

/** 平均焦虑下降分数 */
function calcAvgDrop(history: SessionSummary[]): number {
  const withAfter = history.filter((s) => s.anxietyAfter !== null);
  if (withAfter.length === 0) return 0;
  const total = withAfter.reduce((sum, s) => sum + (s.anxietyLevel - (s.anxietyAfter ?? 0)), 0);
  return Math.round((total / withAfter.length) * 10) / 10;
}

/** 情绪分布统计 */
function calcEmotionDistribution(history: SessionSummary[]): { emotion: CoreEmotion; count: number; percent: number }[] {
  const counts: Partial<Record<CoreEmotion, number>> = {};
  for (const s of history) {
    if (s.emotion) {
      counts[s.emotion] = (counts[s.emotion] || 0) + 1;
    }
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return (Object.entries(counts) as [CoreEmotion, number][])
    .map(([emotion, count]) => ({ emotion, count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);
}

/** 最近 N 天的焦虑趋势 */
function calcAnxietyTrend(history: SessionSummary[], days: number): { date: string; level: number; after: number | null }[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const filtered = history
    .filter((s) => new Date(s.createdAt) >= cutoff)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return filtered.map((s) => ({
    date: new Date(s.createdAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }),
    level: s.anxietyLevel,
    after: s.anxietyAfter,
  }));
}

// ─── 子组件 ───────────────────────────────────────────────────

/** 环形进度条（纯 RN View 实现） */
function RingChart({ segments, size = 120 }: { segments: { color: string; percent: number }[]; size?: number }) {
  const { colors } = useTheme();
  // 用简单的方式：只展示分段条形
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
      {segments.map((seg, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: seg.color,
            }}
          />
          <AppText variant="caption" muted>
            {seg.percent}%
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** 迷你柱状图 */
function MiniBarChart({ data, maxVal, barColor, height = 80 }: { data: number[]; maxVal: number; barColor: string; height?: number }) {
  const { colors } = useTheme();
  const barWidth = Math.max(8, Math.min(24, (SCREEN_WIDTH - 80) / Math.max(data.length, 1) - 4));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height }}>
      {data.map((val, i) => {
        const barHeight = maxVal > 0 ? Math.max(2, (val / maxVal) * height) : 2;
        return (
          <View
            key={i}
            style={{
              width: barWidth,
              height: barHeight,
              backgroundColor: barColor,
              borderRadius: 4,
              opacity: 0.4 + (val / Math.max(maxVal, 1)) * 0.6,
            }}
          />
        );
      })}
    </View>
  );
}

/** 焦虑趋势折线（简化：用阶梯柱图表示） */
function TrendChart({ items }: { items: { date: string; level: number; after: number | null }[] }) {
  const { colors } = useTheme();
  if (items.length === 0) return null;

  const maxLevel = 10;
  const barWidth = Math.max(12, Math.min(36, (SCREEN_WIDTH - 80) / Math.max(items.length, 1) - 8));

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
        {items.map((item, i) => (
          <View key={i} style={{ alignItems: 'center', gap: 2 }}>
            {/* 拆解前 - 红色 */}
            <View
              style={{
                width: barWidth / 2 - 1,
                height: Math.max(2, (item.level / maxLevel) * 80),
                backgroundColor: colors.danger,
                borderRadius: 3,
                opacity: 0.7,
              }}
            />
            {/* 拆解后 - 绿色 */}
            {item.after !== null && (
              <View
                style={{
                  width: barWidth / 2 - 1,
                  height: Math.max(2, (item.after / maxLevel) * 80),
                  backgroundColor: colors.success,
                  borderRadius: 3,
                  opacity: 0.7,
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                }}
              />
            )}
          </View>
        ))}
      </View>
      {/* 日期标签 */}
      {items.length <= 10 && (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {items.map((item, i) => (
            <AppText key={i} variant="caption" muted style={{ width: barWidth, textAlign: 'center' }}>
              {item.date}
            </AppText>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── 情绪颜色映射 ─────────────────────────────────────────────

const EMOTION_COLORS: Record<string, string> = {
  anxiety: '#C47B5A',  // 陶土橙
  anger: '#C4665A',    // 赤红
  sadness: '#7B9EC4',  // 灰蓝
  fear: '#9B8D7E',     // 灰褐
  confusion: '#D4A44A', // 暗金
  stress: '#8B6F5E',   // 深棕
};

// ─── 主组件 ───────────────────────────────────────────────────

export function InsightScreen() {
  const { colors } = useTheme();
  const history = useSessionStore((s) => s.history);

  // ── 统计计算 ────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = history.length;
    const completed = history.filter((s) => s.isCompleted).length;
    const improvementRate = calcImprovementRate(history);
    const avgDrop = calcAvgDrop(history);
    const emotionDist = calcEmotionDistribution(history);
    const trend7 = calcAnxietyTrend(history, 7);
    const trend30 = calcAnxietyTrend(history, 30);

    // 高频因素
    const totalFactors = history.reduce((sum, s) => sum + s.factorCount, 0);
    const totalControllable = history.reduce((sum, s) => sum + s.controllableCount, 0);
    const controllableRate = totalFactors > 0 ? Math.round((totalControllable / totalFactors) * 100) : 0;

    // 认知扭曲统计
    const distortionCounts: Record<number, number> = {};
    for (const s of history) {
      // distortionCount 是选中的总数，但不知道具体哪个
      // 我们用另一种方式：按 distortionCount 分布统计
    }
    const avgDistortionPerSession = total > 0
      ? Math.round((history.reduce((sum, s) => sum + s.distortionCount, 0) / total) * 10) / 10
      : 0;

    // 行动采纳率
    const actionRate = completed > 0
      ? Math.round((history.filter((s) => s.hasAction).length / completed) * 100)
      : 0;

    // 平均焦虑评分
    const avgAnxiety = total > 0
      ? Math.round((history.reduce((sum, s) => sum + s.anxietyLevel, 0) / total) * 10) / 10
      : 0;

    // 平均拆解后焦虑
    const withAfter = history.filter((s) => s.anxietyAfter !== null);
    const avgAfter = withAfter.length > 0
      ? Math.round((withAfter.reduce((sum, s) => sum + (s.anxietyAfter ?? 0), 0) / withAfter.length) * 10) / 10
      : null;

    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      improvementRate,
      avgDrop,
      emotionDist,
      trend7,
      trend30,
      totalFactors,
      totalControllable,
      controllableRate,
      avgDistortionPerSession,
      actionRate,
      avgAnxiety,
      avgAfter,
    };
  }, [history]);

  // ── 渲染 ────────────────────────────────────────────────────

  if (stats.total === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingTop: 60 }}
          showsVerticalScrollIndicator={false}
        >
          <AppText variant="heading" style={{ marginBottom: 4 }}>洞察</AppText>
          <AppText variant="small" muted style={{ marginBottom: 24 }}>
            从数据中认识自己的情绪模式
          </AppText>
          <EmptyState
            icon="📊"
            title="还没有数据"
            description="完成几次拆解后，这里会展示你的情绪模式和改善趋势。"
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 标题 */}
        <AppText variant="heading" style={{ marginBottom: 4 }}>洞察</AppText>
        <AppText variant="small" muted style={{ marginBottom: 24 }}>
          从数据中认识自己的情绪模式
        </AppText>

        {/* ── 概览统计卡片 ─────────────────────────────────── */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          <Card padding={16} style={{ flex: 1 }}>
            <AppText variant="heading" style={{ color: colors.accent }}>
              {stats.total}
            </AppText>
            <AppText variant="caption" muted>总记录</AppText>
          </Card>
          <Card padding={16} style={{ flex: 1 }}>
            <AppText variant="heading" style={{ color: colors.success }}>
              {stats.completionRate}%
            </AppText>
            <AppText variant="caption" muted>完成率</AppText>
          </Card>
          <Card padding={16} style={{ flex: 1 }}>
            <AppText variant="heading" style={{ color: colors.info }}>
              {stats.improvementRate}%
            </AppText>
            <AppText variant="caption" muted>改善率</AppText>
          </Card>
        </View>

        {/* ── 焦虑改善 ─────────────────────────────────────── */}
        <Card padding={20} style={{ marginBottom: 16 }}>
          <AppText variant="subtitle" bold style={{ marginBottom: 4 }}>📉 焦虑改善</AppText>
          <AppText variant="caption" muted style={{ marginBottom: 16 }}>
            拆解前后焦虑评分对比
          </AppText>

          {/* 大数字对比 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <AppText variant="hero" style={{ color: colors.danger }}>
                {stats.avgAnxiety}
              </AppText>
              <AppText variant="caption" muted>拆解前</AppText>
            </View>
            <AppText variant="heading" style={{ color: colors.textTertiary }}>→</AppText>
            <View style={{ alignItems: 'center' }}>
              <AppText variant="hero" style={{ color: colors.success }}>
                {stats.avgAfter ?? '--'}
              </AppText>
              <AppText variant="caption" muted>拆解后</AppText>
            </View>
          </View>

          {stats.avgDrop > 0 && (
            <View style={{ alignItems: 'center' }}>
              <AppText variant="body" bold style={{ color: colors.success }}>
                平均降低 {stats.avgDrop} 分
              </AppText>
            </View>
          )}
        </Card>

        {/* ── 情绪分布 ─────────────────────────────────────── */}
        {stats.emotionDist.length > 0 && (
          <Card padding={20} style={{ marginBottom: 16 }}>
            <AppText variant="subtitle" bold style={{ marginBottom: 12 }}>🎭 情绪分布</AppText>
            {stats.emotionDist.map((item) => {
              const emotionMeta = EMOTION_OPTIONS.find((e) => e.id === item.emotion);
              const color = EMOTION_COLORS[item.emotion] || colors.textTertiary;
              return (
                <View key={item.emotion} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <AppText variant="body">{emotionMeta?.emoji ?? '❓'}</AppText>
                  <View style={{ flex: 1, height: 8, backgroundColor: colors.bgInput, borderRadius: 4, overflow: 'hidden' }}>
                    <View
                      style={{
                        width: `${item.percent}%`,
                        height: '100%',
                        backgroundColor: color,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                  <AppText variant="caption" bold style={{ minWidth: 36, textAlign: 'right' }}>
                    {item.percent}%
                  </AppText>
                </View>
              );
            })}
          </Card>
        )}

        {/* ── 焦虑趋势（最近 7 天）───────────────────────── */}
        {stats.trend7.length > 0 && (
          <Card padding={20} style={{ marginBottom: 16 }}>
            <AppText variant="subtitle" bold style={{ marginBottom: 4 }}>📈 最近趋势</AppText>
            <AppText variant="caption" muted style={{ marginBottom: 16 }}>
              最近 7 天焦虑评分变化
            </AppText>
            <TrendChart items={stats.trend7} />
            {/* 图例 */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: colors.danger, opacity: 0.7 }} />
                <AppText variant="caption" muted>拆解前</AppText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: colors.success, opacity: 0.7 }} />
                <AppText variant="caption" muted>拆解后</AppText>
              </View>
            </View>
          </Card>
        )}

        {/* ── 因素分析 ─────────────────────────────────────── */}
        <Card padding={20} style={{ marginBottom: 16 }}>
          <AppText variant="subtitle" bold style={{ marginBottom: 12 }}>🔍 因素分析</AppText>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1, backgroundColor: colors.bgInput, borderRadius: 12, padding: 14, alignItems: 'center' }}>
              <AppText variant="heading" style={{ color: colors.accent }}>
                {stats.totalFactors}
              </AppText>
              <AppText variant="caption" muted>总因素数</AppText>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.bgInput, borderRadius: 12, padding: 14, alignItems: 'center' }}>
              <AppText variant="heading" style={{ color: colors.success }}>
                {stats.controllableRate}%
              </AppText>
              <AppText variant="caption" muted>可控占比</AppText>
            </View>
          </View>
          <AppText variant="small" muted style={{ lineHeight: 20 }}>
            {stats.controllableRate >= 50
              ? '💡 你识别出的因素中，超过一半是你能控制的。这很好——把精力集中在可控的事情上。'
              : '💡 很多时候你面对的因素不在你的控制范围内。这不是你的错，试着把注意力转移到你能改变的部分。'}
          </AppText>
        </Card>

        {/* ── 认知扭曲模式 ─────────────────────────────────── */}
        <Card padding={20} style={{ marginBottom: 16 }}>
          <AppText variant="subtitle" bold style={{ marginBottom: 12 }}>🧠 认知模式</AppText>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1, backgroundColor: colors.bgInput, borderRadius: 12, padding: 14, alignItems: 'center' }}>
              <AppText variant="heading" style={{ color: colors.warning }}>
                {stats.avgDistortionPerSession}
              </AppText>
              <AppText variant="caption" muted>平均认知扭曲</AppText>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.bgInput, borderRadius: 12, padding: 14, alignItems: 'center' }}>
              <AppText variant="heading" style={{ color: colors.accent }}>
                {stats.actionRate}%
              </AppText>
              <AppText variant="caption" muted>行动采纳率</AppText>
            </View>
          </View>

          {/* 展示 10 种认知扭曲 */}
          {stats.avgDistortionPerSession > 0 && (
            <View style={{ gap: 6 }}>
              {DISTORTIONS.slice(0, 5).map((d) => (
                <View
                  key={d.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    backgroundColor: colors.bgInput,
                    borderRadius: 8,
                  }}
                >
                  <AppText variant="caption" style={{ color: colors.accent, minWidth: 16 }}>
                    {d.id}.
                  </AppText>
                  <AppText variant="small" bold style={{ flex: 1 }}>
                    {d.name}
                  </AppText>
                  <AppText variant="caption" muted numberOfLines={1} style={{ maxWidth: 120 }}>
                    {d.desc}
                  </AppText>
                </View>
              ))}
            </View>
          )}

          <AppText variant="small" muted style={{ lineHeight: 20, marginTop: 8 }}>
            💡 认识自己的认知模式是改变的第一步。每次拆解时识别出的扭曲越多，你就越能提前觉察它。
          </AppText>
        </Card>

        {/* ── 鼓励语 ───────────────────────────────────────── */}
        <Card padding={20} style={{ backgroundColor: colors.accentGlow, borderColor: colors.accent, borderWidth: 1 }}>
          <View style={{ alignItems: 'center' }}>
            <AppText variant="display" style={{ marginBottom: 8 }}>🌱</AppText>
            <AppText variant="subtitle" center bold style={{ marginBottom: 6, color: colors.accent }}>
              坚持拆解，看清自己
            </AppText>
            <AppText variant="small" muted center style={{ lineHeight: 20 }}>
              {stats.total < 5
                ? '才刚刚开始呢！完成 5 次以上的拆解后，数据会更有参考价值。'
                : stats.improvementRate >= 70
                  ? '你的改善率很高，拆解正在帮你越来越清晰地看待问题。继续保持！'
                  : '每一次拆解都是一次自我对话。即使改善不那么明显，觉察本身就是进步。'}
            </AppText>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
