export type CoreEmotion = 'anxiety' | 'anger' | 'sadness' | 'fear' | 'confusion' | 'stress';
export type InputMethod = 'text' | 'voice';
export type CategoryType = 'controllable' | 'uncontrollable' | 'unclassified';
export type DismantleStep = 'record' | 'classify' | 'reframe' | 'complete';

export interface AnxietyFactor {
  id: string;
  text: string;
  category: CategoryType;
  order: number;
}

// ─── 认知重构相关类型 ────────────────────────────────────────

/** 认知扭曲选择 */
export interface DistortionSelection {
  distortionId: number;   // 对应 content.ts 中 DISTORTIONS 的 id
  rebuttalText: string;   // 用户写的反驳文本
}

/** 微小行动选择 */
export interface ActionSelection {
  category: string;        // 行动分类（如 '工作'、'财务'）
  actionIndex: number;     // 选中的行动序号
  customText?: string;     // 用户自定义行动（可选）
}

// ─── 会话数据 ─────────────────────────────────────────────────

export interface AnxietySession {
  id: string;
  createdAt: string;
  updatedAt: string;
  emotion: CoreEmotion | null;
  anxietyLevel: number;
  inputMethod: InputMethod;
  rawText: string;
  voiceUri: string | null;
  factors: AnxietyFactor[];

  // Sprint 3: 认知重构
  selectedDistortions: number[];        // 选中的认知扭曲 ID 列表
  rebuttals: DistortionSelection[];     // 各扭曲的反驳文本

  // Sprint 3: 微小行动
  selectedActionIndex: number | null;   // 选中的行动序号
  selectedActionCategory: string | null; // 行动所属分类

  // 流程
  currentStep: DismantleStep;
  isCompleted: boolean;
  duration: number;

  // 评分
  anxietyAfter: number | null;          // 拆解后焦虑评分（Sprint 3）
}

export interface SessionSummary {
  id: string;
  createdAt: string;
  emotion: CoreEmotion | null;
  anxietyLevel: number;
  anxietyAfter: number | null;
  factorCount: number;
  controllableCount: number;
  distortionCount: number;
  hasAction: boolean;
  isCompleted: boolean;
}

// ─── 罗盘价值观相关类型 ──────────────────────────────────────

/** 价值观卡牌（含用户选择状态） */
export interface ValueCard {
  id: string;           // 价值观文本作为唯一标识
  text: string;         // 价值观名称
  selected: boolean;    // 是否被用户选中
  rank: number | null;  // Top 5 排名（1-5），null 表示未进入 Top 5
}

/** 罗盘结果（持久化） */
export interface CompassResult {
  top5: string[];       // 排名 1-5 的价值观
  selected: string[];   // 用户选中的所有价值观
  createdAt: string;    // 创建时间
  updatedAt: string;    // 更新时间
}

export const EMOTION_OPTIONS = [
  { id: 'anxiety' as CoreEmotion, emoji: '😰', label: '焦虑' },
  { id: 'anger' as CoreEmotion, emoji: '😤', label: '愤怒' },
  { id: 'sadness' as CoreEmotion, emoji: '😢', label: '悲伤' },
  { id: 'fear' as CoreEmotion, emoji: '😨', label: '恐惧' },
  { id: 'confusion' as CoreEmotion, emoji: '😶', label: '困惑' },
  { id: 'stress' as CoreEmotion, emoji: '😮‍💨', label: '压力' },
];
