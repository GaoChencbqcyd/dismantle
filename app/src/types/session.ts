export type CoreEmotion = 'anxiety' | 'irritable' | 'lost' | 'stress' | 'insomnia' | 'other';
export type InputMethod = 'text' | 'voice';
export type CategoryType = '工作' | '财务' | '关系' | '健康' | '意义感' | '默认';
export type DismantleStep = 'idle' | 'record' | 'classify' | 'reframe' | 'action' | 'complete';
export type ControlZone = 'controllable' | 'uncontrollable';

export interface AnxietyFactor {
  id: string;
  text: string;
  zone: ControlZone | null;
}

export interface DistortionSelection {
  distortionId: number;
  rebuttalText: string;
}

export interface AnxietySession {
  id: string;
  emotion: CoreEmotion | null;
  inputMethod: InputMethod;
  recordText: string;
  factors: AnxietyFactor[];
  currentStep: DismantleStep;
  scoreBefore: number;
  scoreAfter: number;
  selectedDistortions: number[];
  rebuttals: DistortionSelection[];
  selectedActionIndex: number | null;
  category: CategoryType;
  status: 'in_progress' | 'completed' | 'abandoned';
  createdAt: string;
  completedAt: string | null;
}

export interface SessionSummary {
  totalSessions: number;
  avgScoreBefore: number;
  avgScoreAfter: number;
  avgImprovement: number;
}
