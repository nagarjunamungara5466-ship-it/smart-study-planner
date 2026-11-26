import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppState } from './types';
import { demoState } from './defaults';

const STORAGE_KEY = 'smart-study-planner-v1';

interface StoreContextValue {
  state: AppState;
  setState: (updater: (prev: AppState) => AppState) => void;
  reset: () => void;
  importData: (data: AppState) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function migrate(parsed: any): AppState {
  const merged = { ...demoState, ...parsed, profile: { ...demoState.profile, ...parsed.profile } };
  // Ensure subjects have a materials array (added after initial release)
  merged.academicYears = (merged.academicYears || []).map((y: any) => ({
    ...y,
    semesters: (y.semesters || []).map((sem: any) => ({
      ...sem,
      subjects: (sem.subjects || []).map((sub: any) => ({
        ...sub,
        materials: Array.isArray(sub.materials) ? sub.materials : [],
      })),
    })),
  }));
  return merged;
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return migrate(JSON.parse(raw));
    }
  } catch {
    // ignore
  }
  return demoState;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setStateRaw] = useState<AppState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  // Apply dark mode to document
  useEffect(() => {
    const root = document.documentElement;
    if (state.profile.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.profile.darkMode]);

  const setState = (updater: (prev: AppState) => AppState) => setStateRaw(updater);
  const reset = () => setStateRaw(demoState);
  const importData = (data: AppState) => setStateRaw(data);

  return (
    <StoreContext.Provider value={{ state, setState, reset, importData }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export const uid = () => Math.random().toString(36).slice(2, 10);
