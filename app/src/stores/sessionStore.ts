import { create } from 'zustand';
import {
  type CoreEmotion,
  type DismantleStep,
  type AnxietyFactor,
  type AnxietySession,
  type SessionSummary,
  type ControlZone,
} from '../types/session';

let factorCounter = 0;
function createFactor(text: string): AnxietyFactor {
  return { id: `f${++factorCounter}`, text, zone: null };
}
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

interface SessionState {
  currentSession: AnxietySession | null;
  sessionHistory: AnxietySession[];
  startSession: (emotion?: CoreEmotion) => void;
  updateRecord: (text: string, scoreBefore: number) => void;
  classifyFactor: (factorId: string, zone: ControlZone) => void;
  unclassifyFactor: (factorId: string) => void;
  allClassified: () => boolean;
  selectDistortion: (id: number) => void;
  unselectDistortion: (id: number) => void;
  addRebuttal: (distortionId: number, text: string) => void;
  selectAction: (index: number) => void;
  completeSession: (scoreAfter: number) => void;
  goToStep: (step: DismantleStep) => void;
  resumeSession: () => AnxietySession | null;
  resetSession: () => void;
  getSummary: () => SessionSummary;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  sessionHistory: [],

  startSession: (emotion) => {
    factorCounter = 0;
    set({
      currentSession: {
        id: generateId(),
        emotion: emotion || null,
        inputMethod: 'text',
        recordText: '',
        factors: [],
        currentStep: 'record',
        scoreBefore: 0,
        scoreAfter: 0,
        selectedDistortions: [],
        rebuttals: [],
        selectedActionIndex: null,
        category: '默认',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        completedAt: null,
      },
    });
  },

  updateRecord: (text, scoreBefore) => {
    const s = get().currentSession;
    if (!s) return;
    const factors = text.split(/[。！？；\n]/).filter(x => x.trim()).map(x => createFactor(x.trim()));
    if (factors.length === 0) factors.push(createFactor(text.trim()));
    set({ currentSession: { ...s, recordText: text, scoreBefore, factors } });
  },

  classifyFactor: (factorId, zone) => {
    const s = get().currentSession;
    if (!s) return;
    set({ currentSession: { ...s, factors: s.factors.map(f => f.id === factorId ? { ...f, zone } : f) } });
  },

  unclassifyFactor: (factorId) => {
    const s = get().currentSession;
    if (!s) return;
    set({ currentSession: { ...s, factors: s.factors.map(f => f.id === factorId ? { ...f, zone: null } : f) } });
  },

  allClassified: () => {
    const s = get().currentSession;
    return !!s && s.factors.length > 0 && s.factors.every(f => f.zone !== null);
  },

  selectDistortion: (id) => {
    const s = get().currentSession;
    if (!s || s.selectedDistortions.includes(id)) return;
    set({ currentSession: { ...s, selectedDistortions: [...s.selectedDistortions, id] } });
  },

  unselectDistortion: (id) => {
    const s = get().currentSession;
    if (!s) return;
    set({ currentSession: { ...s, selectedDistortions: s.selectedDistortions.filter(d => d !== id), rebuttals: s.rebuttals.filter(r => r.distortionId !== id) } });
  },

  addRebuttal: (distortionId, text) => {
    const s = get().currentSession;
    if (!s) return;
    const idx = s.rebuttals.findIndex(r => r.distortionId === distortionId);
    const newR = [...s.rebuttals];
    if (idx >= 0) newR[idx] = { distortionId, rebuttalText: text };
    else newR.push({ distortionId, rebuttalText: text });
    set({ currentSession: { ...s, rebuttals: newR } });
  },

  selectAction: (index) => {
    const s = get().currentSession;
    if (!s) return;
    set({ currentSession: { ...s, selectedActionIndex: index } });
  },

  completeSession: (scoreAfter) => {
    const s = get().currentSession;
    if (!s) return;
    const done: AnxietySession = { ...s, status: 'completed', currentStep: 'complete', scoreAfter, completedAt: new Date().toISOString() };
    set({ currentSession: done, sessionHistory: [done, ...get().sessionHistory] });
  },

  goToStep: (step) => {
    const s = get().currentSession;
    if (s) set({ currentSession: { ...s, currentStep: step } });
  },

  resumeSession: () => {
    const s = get().currentSession;
    return s && s.status === 'in_progress' ? s : null;
  },

  resetSession: () => set({ currentSession: null }),

  getSummary: () => {
    const h = get().sessionHistory;
    if (h.length === 0) return { totalSessions: 0, avgScoreBefore: 0, avgScoreAfter: 0, avgImprovement: 0 };
    const n = h.length;
    const sb = h.reduce((a, x) => a + x.scoreBefore, 0);
    const sa = h.reduce((a, x) => a + x.scoreAfter, 0);
    return { totalSessions: n, avgScoreBefore: Math.round(sb / n), avgScoreAfter: Math.round(sa / n), avgImprovement: Math.round((sb - sa) / n) };
  },
}));
