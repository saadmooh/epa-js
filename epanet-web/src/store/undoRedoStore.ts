import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Junction, Reservoir, Tank, Pipe, Pump, Valve } from '../types';

// حالة الشبكة القابلة للتخزين
interface NetworkSnapshot {
  junctions: Junction[];
  reservoirs: Reservoir[];
  tanks: Tank[];
  pipes: Pipe[];
  pumps: Pump[];
  valves: Valve[];
}

interface UndoRedoState {
  // المكدس
  past: NetworkSnapshot[];
  future: NetworkSnapshot[];
  maxHistory: number;
  
  // الإجراءات
  saveSnapshot: (snapshot: NetworkSnapshot) => void;
  undo: () => NetworkSnapshot | null;
  redo: () => NetworkSnapshot | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  setMaxHistory: (max: number) => void;
}

export const useUndoRedoStore = create<UndoRedoState>()(
  devtools(
    (set, get) => ({
      past: [],
      future: [],
      maxHistory: 50,

      saveSnapshot: (snapshot) => {
        const state = get();
        const newPast = [...state.past, snapshot];
        
        // الحفاظ على الحد الأقصى للسجل
        if (newPast.length > state.maxHistory) {
          newPast.shift();
        }
        
        set({
          past: newPast,
          future: [], // مسح المستقبل عند إضافة حالة جديدة
        });
      },

      undo: () => {
        const state = get();
        if (state.past.length === 0) return null;
        
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, -1);
        
        // الحصول على اللقطة الحالية (للـ redo)
        const currentSnapshot = state.past[state.past.length - 1] || null;
        
        set({
          past: newPast,
          future: currentSnapshot ? [currentSnapshot, ...state.future] : state.future,
        });
        
        return previous;
      },

      redo: () => {
        const state = get();
        if (state.future.length === 0) return null;
        
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        
        set({
          past: [...state.past, next],
          future: newFuture,
        });
        
        return next;
      },

      canUndo: () => {
        return get().past.length > 0;
      },

      canRedo: () => {
        return get().future.length > 0;
      },

      clearHistory: () => {
        set({
          past: [],
          future: [],
        });
      },

      setMaxHistory: (max) => {
        set({ maxHistory: max });
      },
    })
  )
);

// دالة مساعدة لتحويل Maps إلى Arrays
export const createSnapshot = (
  junctions: Map<string, Junction>,
  reservoirs: Map<string, Reservoir>,
  tanks: Map<string, Tank>,
  pipes: Map<string, Pipe>,
  pumps: Map<string, Pump>,
  valves: Map<string, Valve>
): NetworkSnapshot => ({
  junctions: Array.from(junctions.values()),
  reservoirs: Array.from(reservoirs.values()),
  tanks: Array.from(tanks.values()),
  pipes: Array.from(pipes.values()),
  pumps: Array.from(pumps.values()),
  valves: Array.from(valves.values()),
});

// دالة مساعدة لاستعادة Maps من Arrays
export const restoreFromSnapshot = (snapshot: NetworkSnapshot) => ({
  junctions: new Map(snapshot.junctions.map(j => [j.id, j])),
  reservoirs: new Map(snapshot.reservoirs.map(r => [r.id, r])),
  tanks: new Map(snapshot.tanks.map(t => [t.id, t])),
  pipes: new Map(snapshot.pipes.map(p => [p.id, p])),
  pumps: new Map(snapshot.pumps.map(p => [p.id, p])),
  valves: new Map(snapshot.valves.map(v => [v.id, v])),
});
