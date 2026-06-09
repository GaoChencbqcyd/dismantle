/**
 * 拆解 — 罗盘页（Sprint 4 完整实现）
 *
 * 价值观卡牌探索三阶段：
 *   1. 选择阶段 — 从 24 张卡牌中选择对自己重要的价值观
 *   2. 排序阶段 — 两两对比选出 Top 5
 *   3. 确认阶段 — 展示结果并保存
 *
 * 参考：ACT 价值观澄清练习 + 卡片排序法（Card Sorting）
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useTheme, Radius, FontSize, Spacing } from '../theme';
import { AppText, Card, Button, EmptyState } from '../components';
import { VALUES } from '../data/content';
import type { CompassResult, ValueCard } from '../types/session';
import { KvStorage, STORAGE_KEYS } from '../services/storage';

// Android 需要启用 LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── 阶段类型 ─────────────────────────────────────────────────

type CompassPhase = 'select' | 'sort' | 'confirm';

// ─── 工具函数 ─────────────────────────────────────────────────

function buildCards(previous?: CompassResult): ValueCard[] {
  const prevTop5 = previous?.top5 ?? [];
  const prevSelected = previous?.selected ?? [];
  return VALUES.map((text) => ({
    id: text,
    text,
    selected: prevSelected.includes(text),
    rank: prevTop5.includes(text) ? prevTop5.indexOf(text) + 1 : null,
  }));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── 组件 ─────────────────────────────────────────────────────

export function CompassScreen() {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<CompassPhase>('select');
  const [cards, setCards] = useState<ValueCard[]>([]);
  const [hasResult, setHasResult] = useState(false);
  const [loading, setLoading] = useState(true);

  // 排序阶段状态
  const [sortCandidates, setSortCandidates] = useState<ValueCard[]>([]);
  const [pairIndex, setPairIndex] = useState(0); // 当前对比到第几对
  const [top5, setTop5] = useState<ValueCard[]>([]);
  const [pulseAnim] = useState(() => new Animated.Value(1));

  // ── 初始化 ──────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const saved = await KvStorage.get<CompassResult>(STORAGE_KEYS.COMPASS);
        if (saved && saved.top5.length > 0) {
          setHasResult(true);
          setCards(buildCards(saved));
        } else {
          setCards(buildCards());
        }
      } catch {
        setCards(buildCards());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── 选择阶段 ────────────────────────────────────────────────

  const toggleCard = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)),
    );
  }, []);

  const selectedCards = cards.filter((c) => c.selected);
  const selectedCount = selectedCards.length;

  const goSort = useCallback(() => {
    if (selectedCount < 5) return;
    const shuffled = shuffle(selectedCards.map((c) => ({ ...c, rank: null })));
    // 初始 Top 5 = 前 5 张，候选 = 剩余
    const initialTop5 = shuffled.slice(0, 5).map((c, i) => ({ ...c, rank: i + 1 }));
    const candidates = shuffled.slice(5);
    setTop5(initialTop5);
    setSortCandidates(candidates);
    setPairIndex(0);
    setPhase('sort');
  }, [selectedCount]);

  const resetSelection = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCards((prev) => prev.map((c) => ({ ...c, selected: false, rank: null })));
  }, []);

  // ── 排序阶段：两两对比 ──────────────────────────────────────

  const pulseCard = useCallback(() => {
    pulseAnim.setValue(1);
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.05, duration: 150, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [pulseAnim]);

  const pickInPair = useCallback(
    (winner: ValueCard) => {
      pulseCard();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      const currentPairIdx = pairIndex;
      const challenger = sortCandidates[currentPairIdx];
      if (!challenger) return;

      // 挑战者 vs Top5[currentPairIdx % 5]
      const slotIdx = currentPairIdx % 5;
      const defender = top5[slotIdx];

      if (winner.id === challenger.id) {
        // 挑战者胜，替换
        const newTop5 = [...top5];
        newTop5[slotIdx] = { ...challenger, rank: slotIdx + 1 };
        const newCandidates = [...sortCandidates];
        newCandidates[currentPairIdx] = { ...defender, rank: null };
        setTop5(newTop5);
        setSortCandidates(newCandidates);
      }
      // defender 胜，不变

      const nextIdx = currentPairIdx + 1;
      if (nextIdx >= sortCandidates.length) {
        // 所有挑战者都比完了，最终排序
        setTop5((prev) =>
          prev.map((c, i) => ({ ...c, rank: i + 1 })),
        );
        setPhase('confirm');
      } else {
        setPairIndex(nextIdx);
      }
    },
    [pairIndex, sortCandidates, top5, pulseCard],
  );

  const skipChallenger = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const nextIdx = pairIndex + 1;
    if (nextIdx >= sortCandidates.length) {
      setTop5((prev) =>
        prev.map((c, i) => ({ ...c, rank: i + 1 })),
      );
      setPhase('confirm');
    } else {
      setPairIndex(nextIdx);
    }
  }, [pairIndex, sortCandidates.length]);

  // ── 确认保存 ────────────────────────────────────────────────

  const saveResult = useCallback(async () => {
    const result: CompassResult = {
      top5: top5.map((c) => c.text),
      selected: selectedCards.map((c) => c.text),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await KvStorage.set(STORAGE_KEYS.COMPASS, result);
      setHasResult(true);
      setCards((prev) =>
        prev.map((c) => {
          const rank = result.top5.indexOf(c.text);
          return {
            ...c,
            selected: result.selected.includes(c.text),
            rank: rank >= 0 ? rank + 1 : null,
          };
        }),
      );
      setPhase('select');
    } catch (e) {
      console.error('[Compass] save failed:', e);
    }
  }, [top5, selectedCards]);

  const redoCompass = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPhase('select');
    setTop5([]);
    setSortCandidates([]);
    setPairIndex(0);
    setHasResult(false);
    setCards(buildCards());
  }, []);

  // ── 渲染：加载中 ────────────────────────────────────────────

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          <AppText variant="heading" style={{ marginBottom: 4 }}>人生罗盘</AppText>
          <AppText variant="small" muted style={{ marginBottom: 24 }}>
            正在加载你的价值观地图…
          </AppText>
        </ScrollView>
      </View>
    );
  }

  // ── 渲染：选择阶段 ──────────────────────────────────────────

  if (phase === 'select') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 标题区 */}
          <AppText variant="heading" style={{ marginBottom: 4 }}>人生罗盘</AppText>
          <AppText variant="small" muted style={{ marginBottom: 8 }}>
            找到对你真正重要的东西
          </AppText>

          {hasResult && (
            <Card padding={16} style={{ marginBottom: 20, backgroundColor: colors.accentGlow, borderColor: colors.accent, borderWidth: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <AppText variant="display">🧭</AppText>
                <View style={{ flex: 1 }}>
                  <AppText variant="body" bold style={{ color: colors.accent, marginBottom: 2 }}>
                    你已完成了价值观探索
                  </AppText>
                  <AppText variant="small" muted>
                    你的 Top 5 价值观已保存在下方。重新探索将覆盖之前的结果。
                  </AppText>
                </View>
              </View>
            </Card>
          )}

          {/* 引导提示 */}
          <Card padding={16} style={{ marginBottom: 20 }}>
            <AppText variant="subtitle" bold style={{ marginBottom: 8 }}>
              💡 选择对你重要的价值观
            </AppText>
            <AppText variant="small" muted style={{ lineHeight: 20 }}>
              下面有 24 张价值观卡牌。请选出所有你认为重要的价值观（建议至少选 5 张），
              然后我们将帮你找到最核心的 5 个。
            </AppText>
          </Card>

          {/* 选中计数 */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <AppText variant="body" bold>
              已选择{' '}
              <AppText variant="body" bold style={{ color: colors.accent }}>
                {selectedCount}
              </AppText>
              {' '}/ 24
            </AppText>
            {selectedCount > 0 && (
              <TouchableOpacity onPress={resetSelection}>
                <AppText variant="small" style={{ color: colors.danger }}>
                  重置
                </AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* 卡牌网格 */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 24,
            }}
          >
            {cards.map((card) => {
              const isSel = card.selected;
              return (
                <TouchableOpacity
                  key={card.id}
                  activeOpacity={0.7}
                  onPress={() => toggleCard(card.id)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: isSel ? colors.accent : colors.bgCard,
                    borderWidth: 1.5,
                    borderColor: isSel ? colors.accent : colors.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {isSel && (
                      <AppText variant="small" style={{ color: colors.textInverse }}>
                        ✓{' '}
                      </AppText>
                    )}
                    <AppText
                      variant="small"
                      bold={isSel}
                      style={{ color: isSel ? colors.textInverse : colors.textPrimary }}
                    >
                      {card.text}
                    </AppText>
                    {card.rank !== null && (
                      <View
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 9,
                          backgroundColor: colors.textInverse,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 2,
                        }}
                      >
                        <AppText variant="caption" bold style={{ color: colors.accent, fontSize: 10 }}>
                          {card.rank}
                        </AppText>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 底部操作栏 */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {selectedCount >= 5 ? (
              <Button title={`开始排序（${selectedCount} 张）`} onPress={goSort} block />
            ) : (
              <View style={{ flex: 1 }}>
                <AppText variant="small" muted center>
                  请至少选择 5 张价值观卡牌以继续
                </AppText>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── 渲染：排序阶段（两两对比） ──────────────────────────────

  if (phase === 'sort') {
    const currentChallenger = sortCandidates[pairIndex] ?? null;
    const slotIdx = pairIndex % 5;
    const defender = top5[slotIdx];
    const progress = sortCandidates.length > 0
      ? Math.round((pairIndex / sortCandidates.length) * 100)
      : 100;

    return (
      <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 进度 */}
          <View style={{ marginBottom: 24 }}>
            <AppText variant="heading" style={{ marginBottom: 4 }}>找到你的核心</AppText>
            <AppText variant="small" muted style={{ marginBottom: 12 }}>
              哪个对你更重要？
            </AppText>
            <View
              style={{
                height: 4,
                backgroundColor: colors.borderLight,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  backgroundColor: colors.accent,
                  borderRadius: 2,
                }}
              />
            </View>
            <AppText variant="caption" muted style={{ marginTop: 6, textAlign: 'right' }}>
              进度 {progress}%（第 {pairIndex + 1}/{sortCandidates.length} 轮对比）
            </AppText>
          </View>

          {/* 当前 Top 5 预览 */}
          <AppText variant="small" muted style={{ marginBottom: 8 }}>
            当前 Top 5
          </AppText>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 32, flexWrap: 'wrap' }}>
            {top5.map((c) => (
              <View
                key={c.id}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: c.id === defender.id ? colors.accent : colors.bgCard,
                  borderWidth: 1,
                  borderColor: c.id === defender.id ? colors.accent : colors.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <AppText
                  variant="caption"
                  bold
                  style={{ color: c.id === defender.id ? colors.textInverse : colors.textSecondary }}
                >
                  #{c.rank}
                </AppText>
                <AppText
                  variant="caption"
                  style={{ color: c.id === defender.id ? colors.textInverse : colors.textPrimary }}
                >
                  {c.text}
                </AppText>
              </View>
            ))}
          </View>

          {/* 两两对比卡片 */}
          {currentChallenger ? (
            <View style={{ gap: 16, marginBottom: 24 }}>
              {/* 挑战者 */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => pickInPair(currentChallenger)}
                >
                  <Card
                    padding={24}
                    style={{
                      borderWidth: 2,
                      borderColor: colors.info,
                      backgroundColor: colors.bgCard,
                    }}
                  >
                    <AppText variant="caption" muted style={{ marginBottom: 4 }}>
                      新挑战者
                    </AppText>
                    <AppText variant="title" bold center style={{ color: colors.info }}>
                      {currentChallenger.text}
                    </AppText>
                  </Card>
                </TouchableOpacity>
              </Animated.View>

              {/* VS */}
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.bgSecondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AppText variant="subtitle" bold style={{ color: colors.textTertiary }}>
                    VS
                  </AppText>
                </View>
              </View>

              {/* 防守者 */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => pickInPair(defender)}
                >
                  <Card
                    padding={24}
                    style={{
                      borderWidth: 2,
                      borderColor: colors.accent,
                      backgroundColor: colors.accentGlow,
                    }}
                  >
                    <AppText variant="caption" muted style={{ marginBottom: 4 }}>
                      当前 Top 5 · 第 {defender.rank} 位
                    </AppText>
                    <AppText variant="title" bold center style={{ color: colors.accent }}>
                      {defender.text}
                    </AppText>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            </View>
          ) : (
            <EmptyState icon="✅" title="对比完成" description="正在生成你的 Top 5..." />
          )}

          {/* 跳过 */}
          {currentChallenger && (
            <TouchableOpacity
              onPress={skipChallenger}
              style={{ alignItems: 'center', paddingVertical: 12 }}
            >
              <AppText variant="small" muted>
                两个都很重要，跳过这一组 →
              </AppText>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── 渲染：确认阶段 ──────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 庆祝 */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <AppText variant="hero" style={{ marginBottom: 8 }}>
            🧭
          </AppText>
          <AppText variant="heading" center style={{ marginBottom: 4 }}>
            你的核心价值观
          </AppText>
          <AppText variant="small" muted center>
            当生活遇到岔路时，这些价值观就是你的罗盘
          </AppText>
        </View>

        {/* Top 5 排名展示 */}
        {top5.map((card, i) => (
          <Card
            key={card.id}
            padding={16}
            style={{
              marginBottom: 10,
              borderLeftWidth: 4,
              borderLeftColor:
                i === 0
                  ? colors.accent
                  : i === 1
                    ? colors.info
                    : i === 2
                      ? colors.success
                      : i === 3
                        ? colors.warning
                        : colors.textTertiary,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor:
                    i === 0
                      ? colors.accent
                      : i === 1
                        ? colors.info
                        : i === 2
                          ? colors.success
                          : i === 3
                            ? colors.warning
                            : colors.textTertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppText variant="subtitle" bold style={{ color: '#FFFFFF' }}>
                  {i + 1}
                </AppText>
              </View>
              <AppText variant="subtitle" bold style={{ flex: 1 }}>
                {card.text}
              </AppText>
            </View>
          </Card>
        ))}

        {/* 反思提示 */}
        <Card padding={16} style={{ marginTop: 20, marginBottom: 24 }}>
          <AppText variant="body" bold style={{ marginBottom: 8 }}>
            💭 反思一下
          </AppText>
          <AppText variant="small" muted style={{ lineHeight: 20 }}>
            看看你的 Top 5 价值观，它们是否在你的日常生活中得到了充分的体现？
            {'\n\n'}
            如果现在的生活方式与你的核心价值观有冲突，这可能就是焦虑的来源之一。
          </AppText>
        </Card>

        {/* 操作按钮 */}
        <View style={{ gap: 12 }}>
          <Button title="保存结果" onPress={saveResult} block />
          <Button
            title="重新探索"
            onPress={() => {
              setPhase('sort');
              const shuffled = shuffle(
                selectedCards.map((c) => ({ ...c, rank: null })),
              );
              setTop5(shuffled.slice(0, 5).map((c, i) => ({ ...c, rank: i + 1 })));
              setSortCandidates(shuffled.slice(5));
              setPairIndex(0);
            }}
            variant="secondary"
            block
          />
          <TouchableOpacity
            onPress={redoCompass}
            style={{ alignItems: 'center', paddingVertical: 8 }}
          >
            <AppText variant="small" muted>
              放弃本次探索，重新开始
            </AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
