import { create } from 'zustand';
import {
  type CoreEmotion,
  type InputMethod,
  type CategoryType,
  type DismantleStep,
  type AnxietyFactor,
  type AnxietySession,
  type SessionSummary,
  type DistortionSelection,
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
    selectedDistortions: [],
    rebuttals: [],
    selectedActionIndex: null,
    selectedActionCategory: null,
    currentStep: 'record',
    isCompleted: false,
    duration: 0,
    anxietyAfter: null,
  };
}

export interface SessionState {
  currentSession: AnxietySession | null;
  history: SessionSummary[];
  hasDraft: boolean;

  // Session lifecycle
  startSession: () => void;
  resumeDraft: () => Promise<void>;
  resetSession: () => void;

  // Step 1: Record
  setEmotion: (emotion: CoreEmotion) => void;
  setAnxietyLevel: (level: number) => void;
  setInputMethod: (method: InputMethod) => void;
  setRawText: (text: string) => void;
  setVoiceUri: (uri: string | null) => void;

  // Step 2: Classify
  parseFactors: (rawText?: string) => void;
  addFactor: (text: string) => void;
  removeFactor: (id: string) => void;
  setFactorCategory: (id: string, category: CategoryType) => void;
  reorderFactors: (fromIndex: number, toIndex: number) => void;

  // Step 3: Reframe (Sprint 3)
  toggleDistortion: (distortionId: number) => void;
  isDistortionSelected: (distortionId: number) => boolean;
  setRebuttal: (distortionId: number, text: string) => void;
  getRebuttal: (distortionId: number) => string;

  // Step 4: Action (Sprint 3)
  selectAction: (category: string, index: number) => void;
  setAnxietyAfter: (level: number) => void;

  // Navigation
  goToStep: (step: DismantleStep) => void;

  // Persistence
  saveDraft: () => Promise<void>;
  clearDraft: () => Promise<void>;
  completeSession: () => Promise<void>;
  loadHistory: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  history: [],
  hasDraft: false,

  // ── Lifecycle ──────────────────────────────────────────────

  startSession: () => {
    set({ currentSession: createEmptySession(), hasDraft: false });
  },

  resumeDraft: async () => {
    const draft = await KvStorage.get<AnxietySession>(STORAGE_KEYS.SESSION_DRAFT);
    if (draft) set({ currentSession: draft, hasDraft: true });
  },

  resetSession: () => {
    set({ currentSession: null, hasDraft: false });
  },

  // ── Step 1: Record ─────────────────────────────────────────

  setEmotion: (emotion) => {
    const s = get().currentSession;
    if (!s) return;
    set({ currentSession: { ...s, emotion, updatedAt: new Date().toISOString() } });
  },

  setAnxietyLevel: (level) => {
    const s = get().currentSession;
    if (!s) return;
    const clamped = Math.max(1, Math.min(10, Math.round(level)));
    set({ currentSession: { ...s, anxietyLevel: clamped, updatedAt: new Date().toISOString() } });
  },

  setInputMethod: (method) => {
    const s = get().currentSession;
    if (!s) return;
    set({ currentSession: { ...s, inputMethod: method, updatedAt: new Date().toISOString() } });
  },

  setRawText: (text) => {
    const s = get().currentSession;
    if (!s) return;
    set({ currentSession: { ...s, rawText: text, updatedAt: new Date().toISOString() } });
  },

  setVoiceUri: (uri) => {
    const s = get().currentSession;
    if (!s) return;
    set({ currentSession: { ...s, voiceUri: uri, updatedAt: new Date().toISOString() } });
  },

  // ── Step 2: Classify ───────────────────────────────────────

  parseFactors: (rawText) => {
    const s = get().currentSession;
    if (!s) return;
    const text = rawText !== undefined ? rawText : s.rawText;
    const parts = text
      .split(/[。；;，,\n、]/)
      .filter(function (x) { return x.trim().length > 0; })
      .map(function (x) { return x.trim(); });
    const factors: AnxietyFactor[] = parts.map(function (t, i) {
      return { id: generateFactorId(), text: t, category: 'unclassified' as CategoryType, order: i };
    });
    set({ currentSession: { ...s, factors, updatedAt: new Date().toISOString() } });
  },

  addFactor: (text) => {
    const s = get().currentSession;
    if (!s) return;
    const newFactor: AnxietyFactor = {
      id: generateFactorId(), text, category: 'unclassified', order: s.factors.length,
    };
    set({ currentSession: { ...s, factors: [...s.factors, newFactor], updatedAt: new Date().toISOString() } });
  },

  removeFactor: (id) => {
    const s = get().currentSession;
    if (!s) return;
    const filtered = s.factors.filter(function (f) { return f.id !== id; }).map(function (f, i) { return { ...f, order: i }; });
    set({ currentSession: { ...s, factors: filtered, updatedAt: new Date().toISOString() } });
  },

  setFactorCategory: (id, category) => {
    const s = get().currentSession;
    if (!s) return;
    set({
      currentSession: {
        ...s,
        factors: s.factors.map(function (f) { return f.id === id ? { ...f, category } : f; }),
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
    const reordered = factors.map(function (f, i) { return { ...f, order: i }; });
    set({ currentSession: { ...s, factors: reordered, updatedAt: new Date().toISOString() } });
  },

  // ── Step 3: Reframe (Sprint 3) ─────────────────────────────

  toggleDistortion: (distortionId) => {
    const s = get().currentSession;
    if (!s) return;
    const selected = s.selectedDistortions;
    const exists = selected.indexOf(distortionId) >= 0;
    const next = exists ? selected.filter(function (d) { return d !== distortionId; }) : [...selected, distortionId];
    // Remove rebuttal if unselecting
    const rebuttals = exists
      ? s.rebuttals.filter(function (r) { return r.distortionId !== distortionId; })
      : s.rebuttals;
    set({
      currentSession: { ...s, selectedDistortions: next, rebuttals, updatedAt: new Date().toISOString() },
    });
  },

  isDistortionSelected: (distortionId) => {
    const s = get().currentSession;
    if (!s) return false;
    return s.selectedDistortions.indexOf(distortionId) >= 0;
  },

  setRebuttal: (distortionId, text) => {
    const s = get().currentSession;
    if (!s) return;
    const rebuttals = [...s.rebuttals];
    const idx = rebuttals.findIndex(function (r) { return r.distortionId === distortionId; });
    if (idx >= 0) {
      rebuttals[idx] = { distortionId, rebuttalText: text };
    } else {
      rebuttals.push({ distortionId, rebuttalText: text });
    }
    set({ currentSession: { ...s, rebuttals, updatedAt: new Date().toISOString() } });
  },

  getRebuttal: (distortionId) => {
    const s = get().currentSession;
    if (!s) return '';
    const r = s.rebuttals.find(function (r) { return r.distortionId === distortionId; });
    return r ? r.rebuttalText : '';
  },

  // ── Step 4: Action (Sprint 3) ──────────────────────────────

  selectAction: (category, index) => {
    const s = get().currentSession;
    if (!s) return;
    set({
      currentSession: {
        ...s,
        selectedActionIndex: index,
        selectedActionCategory: category,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  setAnxietyAfter: (level) => {
    const s = get().currentSession;
    if (!s) return;
    const clamped = Math.max(1, Math.min(10, Math.round(level)));
    set({ currentSession: { ...s, anxietyAfter: clamped, updatedAt: new Date().toISOString() } });
  },

  // ── Navigation ─────────────────────────────────────────────

  goToStep: (step) => {
    const s = get().currentSession;
    if (!s) return;
    set({ currentSession: { ...s, currentStep: step, updatedAt: new Date().toISOString() } });
  },

  // ── Persistence ────────────────────────────────────────────

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
      anxietyAfter: s.anxietyAfter,
      factorCount: s.factors.length,
      controllableCount: s.factors.filter(function (f) { return f.category === 'controllable'; }).length,
      distortionCount: s.selectedDistortions.length,
      hasAction: s.selectedActionIndex !== null,
      isCompleted: true,
    };

    try {
      const existing = await KvStorage.get<SessionSummary[]>(STORAGE_KEYS.SESSION_HISTORY);
      const updated = [summary, ...(existing || [])];
      await KvStorage.set(STORAGE_KEYS.SESSION_HISTORY, updated);
      await KvStorage.remove(STORAGE_KEYS.SESSION_DRAFT);
      set({ currentSession: completed, history: updated, hasDraft: false });
    } catch (e) {
      console.error('[sessionStore] completeSession failed:', e);
    }
  },

  loadHistory: async () => {
    try {
      const existing = await KvStorage.get<SessionSummary[]>(STORAGE_KEYS.SESSION_HISTORY);
      if (existing) set({ history: existing });
    } catch (e) {
      console.error('[sessionStore] loadHistory failed:', e);
    }
  },
}));
