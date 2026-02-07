import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { VisualizationOptions } from '../types';

interface VisualizationState extends VisualizationOptions {
  // إجراءات
  setShowFlowDirection: (show: boolean) => void;
  setFlowArrowSize: (size: number) => void;
  setFlowArrowSpacing: (spacing: number) => void;
  setFlowAnimationSpeed: (speed: number) => void;
  setFlowArrowColor: (color: string) => void;
  
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
  
  // إعدادات التدرج اللوني
  setColorScheme: (scheme: 'pressure' | 'velocity' | 'quality', schemeType: 'rainbow' | 'heat' | 'cool' | 'custom') => void;
  setCustomColorStops: (scheme: 'pressure' | 'velocity' | 'quality', stops: Array<{ value: number; color: string }>) => void;
  
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
  flowAnimationSpeed: 1,
  flowArrowColor: '#3b82f6',
  
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
  
  // إعدادات التدرج اللوني
  pressureColorScheme: 'rainbow',
  velocityColorScheme: 'rainbow',
  qualityColorScheme: 'rainbow',
  customPressureStops: [],
  customVelocityStops: [],
  customQualityStops: [],
};

// تحويل القيمة إلى لون (تدرج من أحمر إلى أخضر إلى أزرق)
const getColorFromValue = (
  value: number,
  min: number,
  max: number,
  scheme: 'rainbow' | 'heat' | 'cool' | 'custom' = 'rainbow',
  customStops: Array<{ value: number; color: string }> = []
): string => {
  if (value <= min) return '#ef4444'; // أحمر (قيمة منخفضة)
  if (value >= max) return '#3b82f6'; // أزرق (قيمة مرتفعة)
  
  const ratio = (value - min) / (max - min);
  
  // استخدام التدرج المخصص إذا كان متاحاً
  if (scheme === 'custom' && customStops.length > 0) {
    return getCustomColor(value, min, max, customStops);
  }
  
  // التدرج القوس قزحي (أحمر → أصفر → أخضر → أزرق)
  if (scheme === 'rainbow') {
    if (ratio < 0.33) {
      // من أحمر إلى أصفر
      const r = 239;
      const g = Math.round(68 + (204 - 68) * (ratio / 0.33));
      const b = 68;
      return `rgb(${r}, ${g}, ${b})`;
    } else if (ratio < 0.66) {
      // من أصفر إلى أخضر
      const adjustedRatio = (ratio - 0.33) / 0.33;
      const r = Math.round(239 - (239 - 34) * adjustedRatio);
      const g = Math.round(204 + (197 - 204) * adjustedRatio);
      const b = Math.round(68 + (94 - 68) * adjustedRatio);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // من أخضر إلى أزرق
      const finalRatio = (ratio - 0.66) / 0.34;
      const r = Math.round(34 - (34 - 59) * finalRatio);
      const g = Math.round(197 - (197 - 130) * finalRatio);
      const b = Math.round(94 + (246 - 94) * finalRatio);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  
  // التدرج الحراري (أحمر → برتقالي → أصفر)
  if (scheme === 'heat') {
    const r = 239;
    const g = Math.round(68 + (204 - 68) * ratio);
    const b = 68;
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  // التدرج البارد (أزرق فاتح → أزرق داكن)
  if (scheme === 'cool') {
    const r = Math.round(59 + (59 - 59) * ratio);
    const g = Math.round(130 + (130 - 130) * ratio);
    const b = Math.round(246 - (246 - 59) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  return '#3b82f6';
};

// الحصول على لون من التدرج المخصص
const getCustomColor = (
  value: number,
  min: number,
  max: number,
  stops: Array<{ value: number; color: string }>
): string => {
  if (stops.length === 0) return '#3b82f6';
  
  // ترتيب النقاط حسب القيمة
  const sortedStops = [...stops].sort((a, b) => a.value - b.value);
  
  // البحث عن النقاط المحيطة
  let lowerStop = sortedStops[0];
  let upperStop = sortedStops[sortedStops.length - 1];
  
  for (let i = 0; i < sortedStops.length - 1; i++) {
    if (value >= sortedStops[i].value && value <= sortedStops[i + 1].value) {
      lowerStop = sortedStops[i];
      upperStop = sortedStops[i + 1];
      break;
    }
  }
  
  // إذا كانت القيمة خارج النطاق
  if (value <= lowerStop.value) return lowerStop.color;
  if (value >= upperStop.value) return upperStop.color;
  
  // الاستيفاء الخطي بين اللونين
  const ratio = (value - lowerStop.value) / (upperStop.value - lowerStop.value);
  return interpolateColor(lowerStop.color, upperStop.color, ratio);
};

// الاستيفاء الخطي بين لونين
const interpolateColor = (color1: string, color2: string, ratio: number): string => {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  
  const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio);
  
  return `rgb(${r}, ${g}, ${b})`;
};

// تحليل اللون إلى مكوناته
const parseColor = (color: string): { r: number; g: number; b: number } => {
  // دعم الألوان بصيغة hex و rgb
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  } else if (color.startsWith('rgb')) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
      };
    }
  }
  return { r: 0, g: 0, b: 0 };
};

export const useVisualizationStore = create<VisualizationState>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaultOptions,

        setShowFlowDirection: (show) => set({ showFlowDirection: show }),
        setFlowArrowSize: (size) => set({ flowArrowSize: size }),
        setFlowArrowSpacing: (spacing) => set({ flowArrowSpacing: spacing }),
        setFlowAnimationSpeed: (speed) => set({ flowAnimationSpeed: speed }),
        setFlowArrowColor: (color) => set({ flowArrowColor: color }),

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

        setColorScheme: (scheme, schemeType) => {
          const state = get();
          if (scheme === 'pressure') {
            set({ pressureColorScheme: schemeType });
          } else if (scheme === 'velocity') {
            set({ velocityColorScheme: schemeType });
          } else if (scheme === 'quality') {
            set({ qualityColorScheme: schemeType });
          }
        },

        setCustomColorStops: (scheme, stops) => {
          const state = get();
          if (scheme === 'pressure') {
            set({ customPressureStops: stops });
          } else if (scheme === 'velocity') {
            set({ customVelocityStops: stops });
          } else if (scheme === 'quality') {
            set({ customQualityStops: stops });
          }
        },

        getPressureColor: (pressure) => {
          const state = get();
          return getColorFromValue(
            pressure,
            state.pressureMin,
            state.pressureMax,
            state.pressureColorScheme,
            state.customPressureStops
          );
        },

        getVelocityColor: (velocity) => {
          const state = get();
          return getColorFromValue(
            velocity,
            state.velocityMin,
            state.velocityMax,
            state.velocityColorScheme,
            state.customVelocityStops
          );
        },

        getQualityColor: (quality) => {
          const state = get();
          return getColorFromValue(
            quality,
            state.qualityMin,
            state.qualityMax,
            state.qualityColorScheme,
            state.customQualityStops
          );
        },

        resetToDefaults: () => set(defaultOptions),
      }),
      {
        name: 'epanet-visualization-storage',
      }
    )
  )
);
