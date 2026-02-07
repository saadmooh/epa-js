import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { VisualizationOptions } from '../types';

interface VisualizationState extends VisualizationOptions {
  // إجراءات
  setShowFlowDirection: (show: boolean) => void;
  setFlowArrowSize: (size: number) => void;
  setFlowArrowSpacing: (spacing: number) => void;
  
  setShowPressureColors: (show: boolean) => void;
  setShowVelocityColors: (show: boolean) => void;
  setShowQualityColors: (show: boolean) => void;
  
  setPressureRange: (min: number, max: number) => void;
  setVelocityRange: (min: number, max: number) => void;
  setQualityRange: (min: number, max: number) => void;
  
  setShowNodeLabels: (show: boolean) => void;
  setShowPipeLabels: (show: boolean) => void;
  setShowPressureLabels: (show: boolean) => void;
  setShowFlowLabels: (show: boolean) => void;
  setShowVelocityLabels: (show: boolean) => void;
  setLabelFontSize: (size: number) => void;
  
  setShowLegend: (show: boolean) => void;
  setShowScaleBar: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setShowBackgroundMap: (show: boolean) => void;
  setBackgroundMapType: (type: 'osm' | 'satellite' | 'none') => void;
  
  setShowContours: (show: boolean) => void;
  setContourInterval: (interval: number) => void;
  
  // دوال مساعدة
  getPressureColor: (pressure: number) => string;
  getVelocityColor: (velocity: number) => string;
  getQualityColor: (quality: number) => string;
  resetToDefaults: () => void;
}

const defaultOptions: VisualizationOptions = {
  showFlowDirection: true,
  flowArrowSize: 8,
  flowArrowSpacing: 50,
  
  showPressureColors: false,
  showVelocityColors: false,
  showQualityColors: false,
  
  pressureMin: 0,
  pressureMax: 100,
  velocityMin: 0,
  velocityMax: 3,
  qualityMin: 0,
  qualityMax: 5,
  
  showNodeLabels: true,
  showPipeLabels: false,
  showPressureLabels: false,
  showFlowLabels: false,
  showVelocityLabels: false,
  labelFontSize: 10,
  
  showLegend: true,
  showScaleBar: true,
  showGrid: true,
  showBackgroundMap: false,
  backgroundMapType: 'none',
  
  showContours: false,
  contourInterval: 10,
};

// تحويل القيمة إلى لون (تدرج من أحمر إلى أخضر إلى أزرق)
const getColorFromValue = (value: number, min: number, max: number): string => {
  if (value <= min) return '#ef4444'; // أحمر (ضغط منخفض)
  if (value >= max) return '#3b82f6'; // أزرق (ضغط مرتفع)
  
  const ratio = (value - min) / (max - min);
  
  if (ratio < 0.5) {
    // من أحمر إلى أصفر
    const r = Math.round(239 + (250 - 239) * (ratio * 2));
    const g = Math.round(68 + (204 - 68) * (ratio * 2));
    const b = Math.round(68 + (21 - 68) * (ratio * 2));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // من أصفر إلى أخضر إلى أزرق
    const adjustedRatio = (ratio - 0.5) * 2;
    if (adjustedRatio < 0.5) {
      // من أصفر إلى أخضر
      const r = Math.round(250 - (250 - 34) * (adjustedRatio * 2));
      const g = Math.round(204 + (197 - 204) * (adjustedRatio * 2));
      const b = Math.round(21 + (94 - 21) * (adjustedRatio * 2));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // من أخضر إلى أزرق
      const finalRatio = (adjustedRatio - 0.5) * 2;
      const r = Math.round(34 - (34 - 59) * finalRatio);
      const g = Math.round(197 - (197 - 130) * finalRatio);
      const b = Math.round(94 + (246 - 94) * finalRatio);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
};

export const useVisualizationStore = create<VisualizationState>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultOptions,

        setShowFlowDirection: (show) => set({ showFlowDirection: show }),
        setFlowArrowSize: (size) => set({ flowArrowSize: size }),
        setFlowArrowSpacing: (spacing) => set({ flowArrowSpacing: spacing }),

        setShowPressureColors: (show) => set({ showPressureColors: show }),
        setShowVelocityColors: (show) => set({ showVelocityColors: show }),
        setShowQualityColors: (show) => set({ showQualityColors: show }),

        setPressureRange: (min, max) => set({ pressureMin: min, pressureMax: max }),
        setVelocityRange: (min, max) => set({ velocityMin: min, velocityMax: max }),
        setQualityRange: (min, max) => set({ qualityMin: min, qualityMax: max }),

        setShowNodeLabels: (show) => set({ showNodeLabels: show }),
        setShowPipeLabels: (show) => set({ showPipeLabels: show }),
        setShowPressureLabels: (show) => set({ showPressureLabels: show }),
        setShowFlowLabels: (show) => set({ showFlowLabels: show }),
        setShowVelocityLabels: (show) => set({ showVelocityLabels: show }),
        setLabelFontSize: (size) => set({ labelFontSize: size }),

        setShowLegend: (show) => set({ showLegend: show }),
        setShowScaleBar: (show) => set({ showScaleBar: show }),
        setShowGrid: (show) => set({ showGrid: show }),
        setShowBackgroundMap: (show) => set({ showBackgroundMap: show }),
        setBackgroundMapType: (type) => set({ backgroundMapType: type }),

        setShowContours: (show) => set({ showContours: show }),
        setContourInterval: (interval) => set({ contourInterval: interval }),

        getPressureColor: (pressure) => {
          const state = get();
          return getColorFromValue(pressure, state.pressureMin, state.pressureMax);
        },

        getVelocityColor: (velocity) => {
          const state = get();
          return getColorFromValue(velocity, state.velocityMin, state.velocityMax);
        },

        getQualityColor: (quality) => {
          const state = get();
          return getColorFromValue(quality, state.qualityMin, state.qualityMax);
        },

        resetToDefaults: () => set(defaultOptions),
      }),
      {
        name: 'epanet-visualization-storage',
      }
    )
  )
);
