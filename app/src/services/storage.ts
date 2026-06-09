/**
 * 拆解 — 本地数据持久化服务
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── SecureStore ──────────────────────────────────────────────

export const SecureStorage = {
  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      console.error(`[SecureStorage] set "${key}" failed:`, e);
      throw e;
    }
  },

  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error(`[SecureStorage] get "${key}" failed:`, e);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {
      console.error(`[SecureStorage] remove "${key}" failed:`, e);
    }
  },
};

// ─── AsyncStorage ─────────────────────────────────────────────

export const KvStorage = {
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const json = JSON.stringify(value);
      await AsyncStorage.setItem(key, json);
    } catch (e) {
      console.error(`[KvStorage] set "${key}" failed:`, e);
      throw e;
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const json = await AsyncStorage.getItem(key);
      if (json === null) return null;
      return JSON.parse(json) as T;
    } catch (e) {
      console.error(`[KvStorage] get "${key}" failed:`, e);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`[KvStorage] remove "${key}" failed:`, e);
    }
  },
};

// ─── 存储键 ───────────────────────────────────────────────────

export const STORAGE_KEYS = {
  // Legacy compatibility
  SESSIONS: 'dismantle:sessions',
  CURRENT_SESSION: 'dismantle:current_session',

  // New Sprint 2 keys
  SESSION_HISTORY: 'dismantle:session_history',
  SESSION_DRAFT: 'dismantle:session_draft',
  COMPASS: 'dismantle:compass',
  SETTINGS: 'dismantle:settings',
  ONBOARDING_COMPLETE: 'dismantle:onboarding_complete',
  THEME_MODE: 'dismantle:theme_mode',
} as const;
