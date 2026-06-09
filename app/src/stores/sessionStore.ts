import { create } from 'zustand';
import {
  type CoreEmotion,
  type InputMethod,
  type CategoryType,
  type DismantleStep,
  type AnxietyFactor,
  type AnxietySession,
  type SessionSummary,
} from '../types/session';
import { KvStorage, STORAGE_KEYS } from '../services/storage';

function generateId(): string {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function generateFactorId(): string {
  return 'factor_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function createEmptySession(): AnxietySession {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    emotion: null,
    anxietyLevel: 5,
    inputMethod: 'text',
    rawText: '',
    voiceUri: null,
    factors: [],
    currentStep: 'record',
    isCompleted: false,
    duration: 0,
  };
}

export interface SessionState {
  currentSession: AnxietySession | null;
  history: SessionSummary[];
  hasDraft: boolean;

  startSession: () => void;
  resumeDraft: () => Promise<void>;
  setEmotion: (emotion: CoreEmotion) => void;
  setAnxietyLevel: (level: number) => void;
  setInputMethod: (method: InputMethod) => void;
  setRawText: (text: string) => void;
  setVoiceUri: (uri: string | null) => void;
  parseFactors: (rawText?: string) => void;
  addFactor: (text: string) => void;
  removeFactor: (id: string) => void;
  setFactorCategory: (id: string, category: CategoryType) => void;
  reorderFactors: (fromIndex: number, toIndex: number) => void;
  goToStep: (step: DismantleStep) => void;
  saveDraft: () => Promise<void>;
  clearDraft: () => Promise<void>;
  completeSession: () => Promise<void>;
  loadHistory: () => Promise<void>;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  history: [],
  hasDraft: false,

  startSession: () => {
    set({
      currentSession: createEmptySession(),
      hasDraft: false,
    });
  },

  resumeDraft: async () => {
    const draft = await KvStorage.get<AnxietySession>(STORAGE_KEYS.SESSION_DRAFT);
    if (draft) {
      set({ currentSession: draft, hasDraft: true });
    }
  },

  setEmotion: (emotion) => {
    const s = get().currentSession;
    if (!s) return;
    set({
      currentSession: {
        ...s,
        emotion,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  setAnxietyLevel: (level) => {
    const s = get().currentSession;
    if (!s) return;
    const clamped = Math.max(1, Math.min(10, Math.round(level)));
    set({
      currentSession: {
        ...s,
        anxietyLevel: clamped,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  setInputMethod: (method) => {
    const s = get().currentSession;
    if (!s) return;
    set({
      currentSession: {
        ...s,
        inputMethod: method,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  setRawText: (text) => {
    const s = get().currentSession;
    if (!s) return;
    set({
      currentSession: {
        ...s,
        rawText: text,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  setVoiceUri: (uri) => {
    const s = get().currentSession;
    if (!s) return;
    set({
      currentSession: {
        ...s,
        voiceUri: uri,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  parseFactors: (rawText) => {
    const s = get().currentSession;
    if (!s) return;
    const text = rawText !== undefined ? rawText : s.rawText;
    const parts = text
      .split(/[\u3002\uFF1B\uFF1B\uFF0C\uFF0C\n\u3001]/)
      .filter(function (x) {
        return x.trim().length > 0;
      })
      .map(function (x) {
        return x.trim();
      });
    const factors: AnxietyFactor[] = parts.map(function (t, i) {
      return {
        id: generateFactorId(),
        text: t,
        category: 'unclassified' as CategoryType,
        order: i,
      };
    });
    set({
      currentSession: {
        ...s,
        factors,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  addFactor: (text) => {
    const s = get().currentSession;
    if (!s) return;
    const newFactor: AnxietyFactor = {
      id: generateFactorId(),
      text,
      category: 'unclassified',
      order: s.factors.length,
    };
    set({
      currentSession: {
        ...s,
        factors: [...s.factors, newFactor],
        updatedAt: new Date().toISOString(),
      },
    });
  },

  removeFactor: (id) => {
    const s = get().currentSession;
    if (!s) return;
    const filtered = s.factors
      .filter(function (f) {
        return f.id !== id;
      })
      .map(function (f, i) {
        return { ...f, order: i };
      });
    set({
      currentSession: {
        ...s,
        factors: filtered,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  setFactorCategory: (id, category) => {
    const s = get().currentSession;
    if (!s) return;
    set({
      currentSession: {
        ...s,
        factors: s.factors.map(function (f) {
          if (f.id === id) {
            return { ...f, category };
          }
          return f;
        }),
        updatedAt: new Date().toISOString(),
      },
    });
  },

  reorderFactors: (fromIndex, toIndex) => {
    const s = get().currentSession;
    if (!s) return;
    const factors = [...s.factors];
    const item = factors.splice(fromIndex, 1)[0];
    factors.splice(toIndex, 0, item);
    const reordered = factors.map(function (f, i) {
      return { ...f, order: i };
    });
    set({
      currentSession: {
        ...s,
        factors: reordered,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  goToStep: (step) => {
    const s = get().currentSession;
    if (!s) return;
    set({
      currentSession: {
        ...s,
        currentStep: step,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  saveDraft: async () => {
    const s = get().currentSession;
    if (!s) return;
    try {
      await KvStorage.set(STORAGE_KEYS.SESSION_DRAFT, s);
      set({ hasDraft: true });
    } catch (e) {
      console.error('[sessionStore] saveDraft failed:', e);
    }
  },

  clearDraft: async () => {
    try {
      await KvStorage.remove(STORAGE_KEYS.SESSION_DRAFT);
      set({ hasDraft: false });
    } catch (e) {
      console.error('[sessionStore] clearDraft failed:', e);
    }
  },

  completeSession: async () => {
    const s = get().currentSession;
    if (!s) return;
    const completed: AnxietySession = {
      ...s,
      isCompleted: true,
      currentStep: 'complete',
      updatedAt: new Date().toISOString(),
      duration: Date.now() - new Date(s.createdAt).getTime(),
    };

    const summary: SessionSummary = {
      id: s.id,
      createdAt: s.createdAt,
      emotion: s.emotion,
      anxietyLevel: s.anxietyLevel,
      factorCount: s.factors.length,
      controllableCount: s.factors.filter(function (f) {
        return f.category === 'controllable';
      }).length,
      isCompleted: true,
    };

    try {
      const existing = await KvStorage.get<SessionSummary[]>(STORAGE_KEYS.SESSION_HISTORY);
      const updated = [summary, ...(existing || [])];
      await KvStorage.set(STORAGE_KEYS.SESSION_HISTORY, updated);
      await KvStorage.remove(STORAGE_KEYS.SESSION_DRAFT);
      set({
        currentSession: completed,
        history: updated,
        hasDraft: false,
      });
    } catch (e) {
      console.error('[sessionStore] completeSession failed:', e);
    }
  },

  loadHistory: async () => {
    try {
      const existing = await KvStorage.get<SessionSummary[]>(STORAGE_KEYS.SESSION_HISTORY);
      if (existing) {
        set({ history: existing });
      }
    } catch (e) {
      console.error('[sessionStore] loadHistory failed:', e);
    }
  },

  resetSession: () => {
    set({ currentSession: null, hasDraft: false });
  },
}));
