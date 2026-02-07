import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PumpEfficiencyCurve, CurvePoint } from '../types';

interface CurveState {
  curves: Map<string, PumpEfficiencyCurve>;
  
  // إجراءات المنحنيات
  addCurve: (name: string, points: CurvePoint[]) => string;
  updateCurve: (id: string, updates: Partial<PumpEfficiencyCurve>) => void;
  deleteCurve: (id: string) => void;
  getCurveById: (id: string) => PumpEfficiencyCurve | undefined;
  getAllCurves: () => PumpEfficiencyCurve[];
  
  // حسابات المنحنى
  getEfficiencyAtFlow: (curveId: string, flow: number) => number | null;
  getInterpolatedPoint: (curveId: string, x: number) => CurvePoint | null;
  
  // منحنيات افتراضية
  createDefaultEfficiencyCurve: () => string;
  createDefaultHeadCurve: () => string;
}

// توليد ID فريد
const generateId = () => `curve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useCurveStore = create<CurveState>()(
  devtools(
    persist(
      (set, get) => ({
        curves: new Map(),

        addCurve: (name, points) => {
          const id = generateId();
          const curve: PumpEfficiencyCurve = {
            id,
            name,
            points: [...points].sort((a, b) => a.x - b.x), // ترتيب حسب X
          };
          set({ curves: new Map(get().curves).set(id, curve) });
          return id;
        },

        updateCurve: (id, updates) => {
          const state = get();
          const curve = state.curves.get(id);
          if (curve) {
            const updatedCurve = { ...curve, ...updates };
            if (updates.points) {
              updatedCurve.points = [...updates.points].sort((a, b) => a.x - b.x);
            }
            set({ curves: new Map(state.curves).set(id, updatedCurve) });
          }
        },

        deleteCurve: (id) => {
          const state = get();
          const newCurves = new Map(state.curves);
          newCurves.delete(id);
          set({ curves: newCurves });
        },

        getCurveById: (id) => {
          return get().curves.get(id);
        },

        getAllCurves: () => {
          return Array.from(get().curves.values());
        },

        getEfficiencyAtFlow: (curveId, flow) => {
          const curve = get().curves.get(curveId);
          if (!curve || curve.points.length === 0) return null;

          const points = curve.points;
          
          // إذا كان التدفق خارج النطاق
          if (flow <= points[0].x) return points[0].y;
          if (flow >= points[points.length - 1].x) return points[points.length - 1].y;

          // البحث الثنائي عن النقاط المحيطة
          let left = 0;
          let right = points.length - 1;
          
          while (left < right - 1) {
            const mid = Math.floor((left + right) / 2);
            if (points[mid].x < flow) {
              left = mid;
            } else {
              right = mid;
            }
          }

          // استيفاء خطي
          const p1 = points[left];
          const p2 = points[right];
          const t = (flow - p1.x) / (p2.x - p1.x);
          return p1.y + t * (p2.y - p1.y);
        },

        getInterpolatedPoint: (curveId, x) => {
          const y = get().getEfficiencyAtFlow(curveId, x);
          if (y === null) return null;
          return { x, y };
        },

        createDefaultEfficiencyCurve: () => {
          const points: CurvePoint[] = [
            { x: 0, y: 0 },
            { x: 20, y: 65 },
            { x: 40, y: 78 },
            { x: 60, y: 82 },
            { x: 80, y: 79 },
            { x: 100, y: 72 },
            { x: 120, y: 60 },
          ];
          return get().addCurve('منحنى الكفاءة الافتراضي', points);
        },

        createDefaultHeadCurve: () => {
          const points: CurvePoint[] = [
            { x: 0, y: 120 },
            { x: 20, y: 115 },
            { x: 40, y: 105 },
            { x: 60, y: 90 },
            { x: 80, y: 70 },
            { x: 100, y: 45 },
            { x: 120, y: 15 },
          ];
          return get().addCurve('منحنى الرأس الافتراضي', points);
        },
      }),
      {
        name: 'epanet-curves-storage',
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const { state } = JSON.parse(str);
            return {
              state: {
                ...state,
                curves: new Map(state.curves),
              },
            };
          },
          setItem: (name, newValue) => {
            const str = JSON.stringify({
              state: {
                ...newValue.state,
                curves: Array.from(newValue.state.curves.entries()),
              },
            });
            localStorage.setItem(name, str);
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
      }
    )
  )
);
