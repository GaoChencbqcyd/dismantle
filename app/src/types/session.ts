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
  currentStep: DismantleStep;
  isCompleted: boolean;
  duration: number;
}

export interface SessionSummary {
  id: string;
  createdAt: string;
  emotion: CoreEmotion | null;
  anxietyLevel: number;
  factorCount: number;
  controllableCount: number;
  isCompleted: boolean;
}

export const EMOTION_OPTIONS = [
  { id: 'anxiety' as CoreEmotion, emoji: '\u{1F630}', label: '\u7126\u8651' },
  { id: 'anger' as CoreEmotion, emoji: '\u{1F624}', label: '\u6124\u6012' },
  { id: 'sadness' as CoreEmotion, emoji: '\u{1F622}', label: '\u60B2\u4F24' },
  { id: 'fear' as CoreEmotion, emoji: '\u{1F628}', label: '\u6050\u60E7' },
  { id: 'confusion' as CoreEmotion, emoji: '\u{1F635}', label: '\u56F0\u60D1' },
  { id: 'stress' as CoreEmotion, emoji: '\u{1F62E}\u200D\u{1F4A8}', label: '\u538B\u529B' },
];
