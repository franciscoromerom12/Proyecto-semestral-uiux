import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { AppState, Volunteer, Zone, WaitlistEntry } from "./types";

const STORAGE_KEY = "volunteer-manager-state";

const defaultState: AppState = {
  volunteers: [],
  zones: [],
  waitlist: [],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultState;
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

interface StoreContextType {
  state: AppState;
  setVolunteers: (v: Volunteer[]) => void;
  setZones: (z: Zone[]) => void;
  setWaitlist: (w: WaitlistEntry[]) => void;
  updateState: (partial: Partial<AppState>) => void;
  resetAll: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setVolunteers = useCallback((volunteers: Volunteer[]) => {
    setState(prev => ({ ...prev, volunteers }));
  }, []);

  const setZones = useCallback((zones: Zone[]) => {
    setState(prev => ({ ...prev, zones }));
  }, []);

  const setWaitlist = useCallback((waitlist: WaitlistEntry[]) => {
    setState(prev => ({ ...prev, waitlist }));
  }, []);

  const updateState = useCallback((partial: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...partial }));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState);
  }, []);

  return (
    <StoreContext.Provider value={{ state, setVolunteers, setZones, setWaitlist, updateState, resetAll }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
