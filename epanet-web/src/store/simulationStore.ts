import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { SimulationOptions, SimulationResults } from '../types';

interface SimulationState {
  // الحالة
  isRunning: boolean;
  progress: number;
  error: string | null;
  
  // الخيارات
  options: SimulationOptions;
  
  // النتائج
  results: SimulationResults | null;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  
  // الإجراءات
  setOptions: (options: Partial<SimulationOptions>) => void;
  runSimulation: () => Promise<void>;
  stopSimulation: () => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  
  // التنقل في النتائج
  setCurrentTime: (time: number) => void;
  playAnimation: () => void;
  pauseAnimation: () => void;
  setPlaybackSpeed: (speed: number) => void;
  
  // الوظائف المساعدة
  getNodeResults: (nodeId: string) => any;
  getLinkResults: (linkId: string) => any;
  getMaxValues: () => any;
  getMinValues: () => any;
}

// الخيارات الافتراضية
const defaultOptions: SimulationOptions = {
  duration: 24,
  hydraulicTimestep: 1,
  qualityTimestep: 0.25,
  patternTimestep: 1,
  patternStart: 0,
  reportTimestep: 1,
  reportStart: 0,
  startClockTime: 0,
  statistic: 'NONE',
  checkFreq: 2,
  maxCheck: 10,
  dampingLimit: 0,
  specificGravity: 1,
  relativeViscosity: 1,
  trials: 40,
  accuracy: 0.001,
  tolerance: 0.01,
  emitterExponent: 0.5,
  demandModel: 'DDA',
  minimumPressure: 0,
  requiredPressure: 0.1,
  pressureExponent: 0.5,
  flowUnits: 'LPS',
  headlossFormula: 'HW',
};

export const useSimulationStore = create<SimulationState>()(
  devtools(
    (set, get) => ({
      // الحالة الأولية
      isRunning: false,
      progress: 0,
      error: null,
      options: defaultOptions,
      results: null,
      currentTime: 0,
      isPlaying: false,
      playbackSpeed: 1,

      // تحديث الخيارات
      setOptions: (newOptions) => {
        const state = get();
        set({
          options: { ...state.options, ...newOptions },
        });
      },

      // تشغيل المحاكاة
      runSimulation: async () => {
        const state = get();
        
        if (state.isRunning) return;
        
        set({
          isRunning: true,
          progress: 0,
          error: null,
          results: null,
        });
        
        try {
          // TODO: تنفيذ المحاكاة الفعلية باستخدام epanet-js
          // محاكاة العملية للاختبار
          for (let i = 0; i <= 100; i += 10) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            set({ progress: i });
          }
          
          // نتائج وهمية للاختبار
          const mockResults: SimulationResults = {
            timePeriods: Array.from({ length: state.options.duration + 1 }, (_, i) => i),
            nodeResults: new Map(),
            linkResults: new Map(),
          };
          
          set({
            results: mockResults,
            isRunning: false,
            progress: 100,
            currentTime: 0,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isRunning: false,
          });
        }
      },

      // إيقاف المحاكاة
      stopSimulation: () => {
        set({
          isRunning: false,
          progress: 0,
        });
      },

      // تعيين التقدم
      setProgress: (progress) => set({ progress }),

      // تعيين الخطأ
      setError: (error) => set({ error }),

      // تعيين الوقت الحالي
      setCurrentTime: (time) => {
        const state = get();
        if (state.results) {
          const maxTime = state.results.timePeriods.length - 1;
          set({ currentTime: Math.max(0, Math.min(time, maxTime)) });
        }
      },

      // تشغيل الرسوم المتحركة
      playAnimation: () => {
        const state = get();
        if (state.results) {
          set({ isPlaying: true });
          
          const animate = () => {
            const currentState = get();
            if (!currentState.isPlaying || !currentState.results) return;
            
            const nextTime = currentState.currentTime + 1;
            if (nextTime >= currentState.results.timePeriods.length) {
              set({ isPlaying: false, currentTime: 0 });
              return;
            }
            
            set({ currentTime: nextTime });
            
            const interval = 1000 / currentState.playbackSpeed;
            setTimeout(animate, interval);
          };
          
          animate();
        }
      },

      // إيقاف الرسوم المتحركة
      pauseAnimation: () => set({ isPlaying: false }),

      // تعيين سرعة التشغيل
      setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

      // الحصول على نتائج العقدة
      getNodeResults: (nodeId) => {
        const state = get();
        return state.results?.nodeResults.get(nodeId);
      },

      // الحصول على نتائج الرابط
      getLinkResults: (linkId) => {
        const state = get();
        return state.results?.linkResults.get(linkId);
      },

      // الحصول على القيم القصوى
      getMaxValues: () => {
        const state = get();
        if (!state.results) return {};
        
        const maxValues: Record<string, number> = {};
        
        state.results.nodeResults.forEach((results) => {
          if (results.pressure) {
            const max = Math.max(...results.pressure);
            maxValues.pressure = Math.max(maxValues.pressure || 0, max);
          }
        });
        
        return maxValues;
      },

      // الحصول على القيم الدنيا
      getMinValues: () => {
        const state = get();
        if (!state.results) return {};
        
        const minValues: Record<string, number> = {};
        
        state.results.nodeResults.forEach((results) => {
          if (results.pressure) {
            const min = Math.min(...results.pressure);
            minValues.pressure = Math.min(minValues.pressure || Infinity, min);
          }
        });
        
        return minValues;
      },
    })
  )
);
