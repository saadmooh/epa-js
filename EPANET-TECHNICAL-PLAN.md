# خطة تقنية شديدة التفصيل - مشروع EPANET React Web Application

## 📋 نظرة عامة

**اسم المشروع:** EPANET Web - محاكاة الشبكات الهيدروليكية على الويب  
**التقنية:** React + TypeScript + Vite + Tailwind CSS  
**المحرك الأساسي:** epanet-js (WebAssembly)  
**المتصفح المستهدف:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+  
**اللغات:** عربي، إنجليزي (RTL & LTR)

---

## 🏗️ البنية التقنية المعمارية

### 1. هيكل المشروع (Project Structure)

```
epanet-web-react/
├── public/
│   ├── locales/
│   │   ├── ar/
│   │   │   └── translation.json
│   │   └── en/
│   │       └── translation.json
│   └── assets/
│       ├── icons/
│       └── images/
├── src/
│   ├── components/
│   │   ├── atoms/              # أصغر مكونات واجهة المستخدم
│   │   ├── molecules/          # مكونات مركبة بسيطة
│   │   ├── organisms/          # مكونات معقدة
│   │   └── templates/          # قوالب الصفحات
│   ├── features/               # ميزات المنطق (Feature-based)
│   │   ├── network/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── types/
│   │   ├── simulation/
│   │   ├── visualization/
│   │   ├── properties/
│   │   └── import-export/
│   ├── hooks/                  # Hooks عامة
│   ├── services/               # Services عامة
│   ├── store/                  # State Management (Zustand)
│   ├── types/                  # TypeScript Types
│   ├── utils/                  # Utilities
│   ├── workers/                # Web Workers
│   ├── styles/                 # Styles عامة
│   └── App.tsx
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── .github/
│   └── workflows/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
└── README.md
```

---

## 📦 التبعيات والمكتبات

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "epanet-js": "^2.0.0",
    "zustand": "^4.4.0",
    "react-i18next": "^13.5.0",
    "i18next": "^23.7.0",
    "i18next-browser-languagedetector": "^7.2.0",
    "@tanstack/react-query": "^5.8.0",
    "axios": "^1.6.0",
    "react-hot-toast": "^2.4.1",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "recharts": "^2.10.0",
    "date-fns": "^2.30.0",
    "uuid": "^9.0.0",
    "file-saver": "^2.0.5"
  }
}
```

### Visualization & Map Libraries

```json
{
  "dependencies": {
    "react-leaflet": "^4.2.1",
    "leaflet": "^1.9.4",
    "leaflet-draw": "^1.0.4",
    "d3": "^7.8.5",
    "react-d3-graph": "^2.6.0",
    "cytoscape": "^3.26.0",
    "react-cytoscapejs": "^2.0.0",
    "konva": "^9.2.0",
    "react-konva": "^18.2.10",
    "canvas-confetti": "^1.9.2"
  }
}
```

### UI Component Libraries

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-radio-group": "^1.1.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.294.0",
    "framer-motion": "^10.16.0"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.9.0",
    "@types/leaflet": "^1.9.8",
    "@types/d3": "^7.4.3",
    "@types/uuid": "^9.0.7",
    "@types/file-saver": "^2.0.7",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "vitest": "^0.34.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^23.0.0",
    "msw": "^2.0.0",
    "@playwright/test": "^1.40.0",
    "cypress": "^13.6.0",
    "eslint": "^8.54.0",
    "@typescript-eslint/eslint-plugin": "^6.12.0",
    "@typescript-eslint/parser": "^6.12.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.1.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.1.0",
    "@commitlint/cli": "^18.4.0",
    "@commitlint/config-conventional": "^18.4.0",
    "storybook": "^7.6.0",
    "@storybook/react": "^7.6.0",
    "@storybook/react-vite": "^7.6.0"
  }
}
```

---

## 🎯 الميزات الأساسية والمكونات

### 1. Feature: إدارة المشاريع (Project Management)

**المكونات:**
- `ProjectList.tsx` - قائمة المشاريع
- `ProjectCard.tsx` - بطاقة المشروع
- `NewProjectDialog.tsx` - حوار إنشاء مشروع جديد
- `ImportInpDialog.tsx` - حوار استيراد ملف INP
- `RecentProjects.tsx` - المشاريع الأخيرة

**الوظائف:**
- إنشاء مشروع جديد
- فتح مشروع موجود
- استيراد ملف INP
- تصدير إلى INP
- حفظ محلي (Local Storage / IndexedDB)
- حفظ في السحابة (اختياري)

### 2. Feature: محرر الشبكة (Network Editor)

**المكونات:**
- `NetworkCanvas.tsx` - لوحة الرسم الرئيسية
- `CanvasToolbar.tsx` - شريط أدوات الرسم
- `NetworkMap.tsx` - خريطة الشبكة (Leaflet)
- `NodePalette.tsx` - لوحة عناصر العقد
- `PropertyPanel.tsx` - لوحة الخصائص
- `LayerManager.tsx` - مدير الطبقات

**العناصر المدعومة:**
```typescript
type NetworkElement = 
  | 'junction'      // نقطة التقاء
  | 'reservoir'     // خزان رئيسي
  | 'tank'          // خزان
  | 'pipe'          // أنبوب
  | 'pump'          // مضخة
  | 'valve'         // صمام
  | 'label'         // تسمية
  | 'vertex';       // نقطة تحكم
```

**الوظائف:**
- إضافة/حذف/تعديل العناصر
- رسم تفاعلي (Click & Drag)
- التحديد المتعدد (Multi-select)
- نسخ/لصق/تراجع/إعادة
- التكبير/التصغير والتحريك
- التحديد التلقائي (Snap to Grid)
- ربط تلقائي (Auto-connect)

### 3. Feature: خصائص العناصر (Properties)

**المكونات:**
- `PropertyEditor.tsx` - محرر الخصائص
- `NodeProperties.tsx` - خصائص العقد
- `LinkProperties.tsx` - خصائص الروابط
- `DemandPatternEditor.tsx` - محرر أنماط الطلب
- `CurveEditor.tsx` - محرر المنحنيات

**الخصائص حسب النوع:**

**Junction:**
```typescript
interface JunctionProperties {
  id: string;
  elevation: number;        // الارتفاع (متر)
  baseDemand: number;       // الطلب الأساسي (لتر/ثانية)
  demandPattern: string;    // نمط الطلب
  emitterCoeff: number;     // معامل المنبع
  initialQuality: number;   // الجودة الأولية
  sourceQuality: SourceQuality;
  coordinates: { x: number; y: number };
}
```

**Pipe:**
```typescript
interface PipeProperties {
  id: string;
  node1: string;            // العقدة الأولى
  node2: string;            // العقدة الثانية
  length: number;           // الطول (متر)
  diameter: number;         // القطر (مم)
  roughness: number;        // الخشونة
  minorLoss: number;        // الخسارة الثانوية
  status: 'Open' | 'Closed' | 'CV';
  checkValve: boolean;      // صمام فحص
  vertices: Array<{x: number; y: number}>;
}
```

**Tank:**
```typescript
interface TankProperties {
  id: string;
  elevation: number;        // ارتفاع القاعدة
  initialLevel: number;     // المستوى الأولي
  minimumLevel: number;     // الحد الأدنى
  maximumLevel: number;     // الحد الأقصى
  diameter: number;         // القطر
  minimumVolume: number;    // الحجم الأدنى
  volumeCurve: string;      // منحنى الحجم
  overflow: boolean;        // يسمح بالفيضان
  mixingModel: 'MIX1' | 'MIX2' | 'FIFO' | 'LIFO';
  reactionCoeff: number;
}
```

**Pump:**
```typescript
interface PumpProperties {
  id: string;
  node1: string;
  node2: string;
  properties: {
    type: 'POWER' | 'HEAD';
    power?: number;         // القوة (كيلوواط)
    headCurve?: string;     // منحنى الرأس
    speed: number;          // السرعة النسبية
    pattern: string;        // نمط السرعة
  };
  energy: {
    price: number;          // سعر الطاقة
    pattern: string;        // نمط السعر
    efficiency: string;     // منحنى الكفاءة
  };
}
```

**Valve:**
```typescript
interface ValveProperties {
  id: string;
  node1: string;
  node2: string;
  diameter: number;         // القطر (مم)
  type: 'PRV' | 'PSV' | 'PBV' | 'FCV' | 'TCV' | 'GPV';
  // PRV: صمام تخفيض الضغط
  // PSV: صمام حماية الضغط
  // PBV: صمام كسر الضغط
  // FCV: صمام التحكم في التدفق
  // TCV: صمام التحكم في الخسارة
  // GPV: صمام عام
  setting: number;          // الإعداد حسب النوع
  minorLoss: number;        // الخسارة الثانوية
  status: 'Open' | 'Closed';
}
```

### 4. Feature: المحاكاة (Simulation)

**المكونات:**
- `SimulationPanel.tsx` - لوحة المحاكاة
- `SimulationSettings.tsx` - إعدادات المحاكاة
- `ProgressIndicator.tsx` - مؤشر التقدم
- `ResultsViewer.tsx` - عارض النتائج

**أنواع المحاكاة:**
```typescript
enum SimulationType {
  HYDRAULIC = 'hydraulic',           // محاكاة هيدروليكية فقط
  WATER_QUALITY = 'quality',         // محاكاة جودة المياه
  EXTENDED_PERIOD = 'extended',      // محاكاة لفترة ممتدة (EPS)
}

interface SimulationOptions {
  duration: number;                   // المدة (ساعات)
  hydraulicTimestep: number;          // الخطوة الزمنية الهيدروليكية
  qualityTimestep: number;            // الخطوة الزمنية للجودة
  patternTimestep: number;            // الخطوة الزمنية للأنماط
  patternStart: number;               // بداية النمط
  reportTimestep: number;             // خطوة التقرير
  reportStart: number;                // بداية التقرير
  startClockTime: number;             // وقت بدء الساعة
  statistic: 'NONE' | 'AVERAGE' | 'MINIMUM' | 'MAXIMUM' | 'RANGE';
  checkFreq: number;
  maxCheck: number;
  dampingLimit: number;
  specificGravity: number;
  relativeViscosity: number;
  trials: number;
  accuracy: number;
  tolerance: number;
  emitterExponent: number;
  demandModel: 'DDA' | 'PDA';         // Demand Driven vs Pressure Driven
  minimumPressure: number;
  requiredPressure: number;
  pressureExponent: number;
}
```

**Web Worker للمحاكاة:**
```typescript
// src/workers/simulation.worker.ts
self.onmessage = async (event) => {
  const { inpFile, options } = event.data;
  
  try {
    const ws = new Workspace();
    const model = new Project(ws);
    
    ws.writeFile('model.inp', inpFile);
    model.open('model.inp', 'report.rpt', 'output.bin');
    
    // Configure simulation options
    model.setOption(Option.HydraulicTimestep, options.hydraulicTimestep);
    model.setOption(Option.Duration, options.duration);
    // ... more options
    
    // Run simulation
    model.solveH();
    model.saveH();
    
    // Get results
    const results = extractResults(model);
    
    self.postMessage({ success: true, results });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
```

### 5. Feature: التصور والعرض البصري (Visualization)

**المكونات:**
- `ResultsMap.tsx` - خريطة النتائج
- `ColorLegend.tsx` - مفتاح الألوان
- `TimeSlider.tsx` - شريط الوقت
- `AnimationControls.tsx` - تحكمات الرسوم المتحركة
- `ChartPanel.tsx` - لوحة الرسوم البيانية
- `ComparisonView.tsx` - عرض المقارنة

**أنماط التلوين:**
```typescript
enum ColorBy {
  NONE = 'none',
  // Junctions
  PRESSURE = 'pressure',
  HEAD = 'head',
  DEMAND = 'demand',
  QUALITY = 'quality',
  // Pipes
  FLOW = 'flow',
  VELOCITY = 'velocity',
  HEADLOSS = 'headloss',
  STATUS = 'status',
  // Tanks
  LEVEL = 'level',
  VOLUME = 'volume',
  // Pumps
  ENERGY = 'energy',
  EFFICIENCY = 'efficiency',
}

interface ColorMap {
  field: ColorBy;
  min: number;
  max: number;
  colors: string[];  // Array of hex colors
  thresholds?: number[];
}
```

**أنواع الرسوم البيانية:**
```typescript
enum ChartType {
  LINE = 'line',
  AREA = 'area',
  BAR = 'bar',
  SCATTER = 'scatter',
  PIE = 'pie',
  HEATMAP = 'heatmap',
  CONTOUR = 'contour',
  PROFILE = 'profile',
  ENERGY = 'energy',
  REACTION = 'reaction',
}

interface ChartData {
  type: ChartType;
  title: string;
  xAxis: {
    label: string;
    data: number[] | string[];
  };
  yAxis: {
    label: string;
    series: Array<{
      name: string;
      data: number[];
      color: string;
    }>;
  };
}
```

### 6. Feature: التقارير (Reports)

**المكونات:**
- `ReportPanel.tsx` - لوحة التقارير
- `ReportGenerator.tsx` - مولد التقارير
- `ReportTable.tsx` - جدول التقرير
- `ReportExporter.tsx` - مصدر التقرير

**أنواع التقارير:**
```typescript
enum ReportType {
  NETWORK_SUMMARY = 'network_summary',
  NODE_RESULTS = 'node_results',
  LINK_RESULTS = 'link_results',
  ENERGY_REPORT = 'energy_report',
  QUALITY_REPORT = 'quality_report',
  REACTION_REPORT = 'reaction_report',
  FULL_REPORT = 'full_report',
}

interface ReportOptions {
  type: ReportType;
  elements: string[];         // معرفات العناصر
  parameters: string[];       // المعاملات المراد تضمينها
  timeRange: {
    start: number;
    end: number;
  };
  format: 'TABLE' | 'CSV' | 'PDF' | 'RPT';
  includeStatistics: boolean;
}
```

### 7. Feature: المنحنيات والأنماط (Curves & Patterns)

**المكونات:**
- `CurveManager.tsx` - مدير المنحنيات
- `PatternManager.tsx` - مدير الأنماط
- `CurveEditor.tsx` - محرر المنحنى
- `PatternEditor.tsx` - محرر النمط
- `CurveChart.tsx` - رسم بياني للمنحنى

**أنواع المنحنيات:**
```typescript
enum CurveType {
  PUMP = 'PUMP',           // منحنى المضخة (Head vs Flow)
  EFFICIENCY = 'EFFICIENCY', // كفاءة المضخة
  HEADLOSS = 'HEADLOSS',   // خسارة الرأس
  VOLUME = 'VOLUME',       // حجم الخزان
  CUSTOM = 'CUSTOM',       // مخصص
}

interface Curve {
  id: string;
  type: CurveType;
  name: string;
  description?: string;
  points: Array<[number, number]>; // [x, y] pairs
}
```

**أنواع الأنماط:**
```typescript
enum PatternType {
  DEMAND = 'DEMAND',
  HEAD = 'HEAD',
  EFFICIENCY = 'EFFICIENCY',
  PRICE = 'PRICE',
  SPEED = 'SPEED',
  ROUGHNESS = 'ROUGHNESS',
  QUALITY = 'QUALITY',
  CUSTOM = 'CUSTOM',
}

interface Pattern {
  id: string;
  type: PatternType;
  name: string;
  description?: string;
  multipliers: number[];    // عوامل الضرب
  timeStep: number;         // الخطوة الزمنية (ساعة)
}
```

### 8. Feature: عناصر التحكم (Controls)

**المكونات:**
- `ControlManager.tsx` - مدير عناصر التحكم
- `SimpleControlEditor.tsx` - محرر التحكم البسيط
- `RuleBasedControlEditor.tsx` - محرر قواعد التحكم
- `ScheduleEditor.tsx` - محرر الجدول الزمني

**أنواع عناصر التحكم:**
```typescript
interface SimpleControl {
  id: string;
  type: 'STATUS' | 'SETTING';
  linkId: string;
  setting: number | 'OPEN' | 'CLOSED';
  condition: {
    type: 'TIME' | 'CLOCKTIME' | 'LEVEL' | 'PRESSURE' | 'FLOW';
    nodeId?: string;
    value: number;
    operator?: 'ABOVE' | 'BELOW';
  };
}

interface RuleBasedControl {
  id: string;
  priority: number;
  conditions: Array<{
    type: 'IF' | 'AND' | 'OR';
    object: 'NODE' | 'LINK' | 'SYSTEM';
    id: string;
    variable: string;
    operator: 'EQ' | 'NE' | 'GT' | 'GE' | 'LT' | 'LE' | 'IS' | 'NOT' | 'BETWEEN';
    value: number | string;
    value2?: number;  // للمقارنة BETWEEN
  }>;
  actions: Array<{
    object: 'LINK' | 'NODE';
    id: string;
    attribute: string;
    value: number | string;
  }>;
}
```

---

## 🔄 State Management Architecture

### Zustand Stores

```typescript
// store/project.store.ts
interface ProjectState {
  // Current project
  project: Project | null;
  isModified: boolean;
  isSaving: boolean;
  
  // Actions
  createProject: (name: string) => void;
  openProject: (project: Project) => void;
  saveProject: () => Promise<void>;
  importInp: (content: string) => void;
  exportInp: () => string;
  
  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// store/network.store.ts
interface NetworkState {
  // Elements
  junctions: Map<string, Junction>;
  reservoirs: Map<string, Reservoir>;
  tanks: Map<string, Tank>;
  pipes: Map<string, Pipe>;
  pumps: Map<string, Pump>;
  valves: Map<string, Valve>;
  labels: Map<string, Label>;
  
  // Selection
  selectedIds: Set<string>;
  hoveredId: string | null;
  
  // View
  viewBox: { x: number; y: number; width: number; height: number };
  zoom: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  
  // Actions
  addElement: (type: ElementType, data: Partial<Element>) => string;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  
  // Getters
  getAllNodes: () => NetworkNode[];
  getAllLinks: () => NetworkLink[];
  getElementById: (id: string) => NetworkElement | undefined;
}

// store/simulation.store.ts
interface SimulationState {
  // Status
  isRunning: boolean;
  progress: number;
  error: string | null;
  
  // Options
  options: SimulationOptions;
  
  // Results
  results: SimulationResults | null;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  
  // Actions
  runSimulation: () => Promise<void>;
  stopSimulation: () => void;
  setOptions: (options: Partial<SimulationOptions>) => void;
  setCurrentTime: (time: number) => void;
  playAnimation: () => void;
  pauseAnimation: () => void;
  setPlaybackSpeed: (speed: number) => void;
  
  // Getters
  getNodeResults: (nodeId: string) => NodeResults;
  getLinkResults: (linkId: string) => LinkResults;
  getMaxValues: () => MaxValues;
  getMinValues: () => MinValues;
}

// store/ui.store.ts
interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  language: 'ar' | 'en';
  direction: 'rtl' | 'ltr';
  
  // Layout
  sidebarOpen: boolean;
  sidebarWidth: number;
  activePanel: 'properties' | 'layers' | 'simulation' | 'results';
  panelHeights: Record<string, number>;
  
  // Modals
  openModals: Set<string>;
  modalData: Record<string, any>;
  
  // Notifications
  toasts: Toast[];
  
  // Actions
  setTheme: (theme: UIState['theme']) => void;
  setLanguage: (lang: 'ar' | 'en') => void;
  toggleSidebar: () => void;
  setActivePanel: (panel: UIState['activePanel']) => void;
  openModal: (id: string, data?: any) => void;
  closeModal: (id: string) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
```

---

## 🎨 نظام التصميم (Design System)

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // EPANET Brand Colors
        epanet: {
          primary: '#0066CC',
          secondary: '#00AA44',
          accent: '#FF6600',
          danger: '#CC0000',
          warning: '#FFAA00',
          info: '#0099CC',
        },
        // Network Element Colors
        network: {
          junction: '#0066CC',
          reservoir: '#00AA44',
          tank: '#0099CC',
          pipe: '#666666',
          pump: '#FF6600',
          valve: '#CC00CC',
          selected: '#FF0000',
          hovered: '#FFFF00',
        },
        // Status Colors
        status: {
          open: '#00AA44',
          closed: '#CC0000',
          active: '#0066CC',
          inactive: '#999999',
          error: '#CC0000',
          warning: '#FFAA00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Arabic', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      spacing: {
        'panel': '300px',
        'toolbar': '48px',
        'statusbar': '24px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### مكونات الواجهة الأساسية

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// components/ui/input.tsx
// components/ui/select.tsx
// components/ui/dialog.tsx
// components/ui/tooltip.tsx
// components/ui/slider.tsx
// components/ui/tabs.tsx
// components/ui/table.tsx
// components/ui/dropdown-menu.tsx
// components/ui/context-menu.tsx
// components/ui/resizable.tsx
// components/ui/scroll-area.tsx
// components/ui/separator.tsx
// components/ui/skeleton.tsx
// components/ui/toast.tsx
```

---

## 📐 معايير الكود والجودة

### TypeScript Standards

```typescript
// eslint-config
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "no-console": ["warn", { "allow": ["error"] }]
  }
}
```

### React Patterns

```typescript
// 1. Component Structure
interface ComponentProps {
  // Props interface
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState(initialValue);
  const store = useStore();
  
  // Computed values
  const computed = useMemo(() => compute(value), [value]);
  
  // Callbacks
  const handleClick = useCallback(() => {
    // handler
  }, [deps]);
  
  // Effects
  useEffect(() => {
    // effect
    return () => {
      // cleanup
    };
  }, [deps]);
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 2. Custom Hooks
export const useNetworkElement = (id: string) => {
  const store = useNetworkStore();
  const element = store.getElementById(id);
  
  const update = useCallback((updates: Partial<Element>) => {
    store.updateElement(id, updates);
  }, [id, store]);
  
  const remove = useCallback(() => {
    store.deleteElement(id);
  }, [id, store]);
  
  return { element, update, remove };
};

// 3. Container/Presentational Pattern
// Container
export const NetworkEditorContainer: React.FC = () => {
  const network = useNetworkStore();
  const simulation = useSimulationStore();
  
  return (
    <NetworkEditor
      elements={network.getAllElements()}
      selectedIds={network.selectedIds}
      onSelect={network.selectElement}
      onUpdate={network.updateElement}
      results={simulation.results}
      currentTime={simulation.currentTime}
    />
  );
};

// Presentational
interface NetworkEditorProps {
  elements: NetworkElement[];
  selectedIds: Set<string>;
  onSelect: (id: string, multi?: boolean) => void;
  onUpdate: (id: string, updates: Partial<Element>) => void;
  results: SimulationResults | null;
  currentTime: number;
}

export const NetworkEditor: React.FC<NetworkEditorProps> = (props) => {
  // Pure rendering logic
};
```

---

## 🧪 استراتيجية الاختبار

### اختبارات الوحدة (Unit Tests)

```typescript
// __tests__/unit/network.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useNetworkStore } from '@/store/network.store';

describe('NetworkStore', () => {
  beforeEach(() => {
    useNetworkStore.setState({
      junctions: new Map(),
      pipes: new Map(),
      selectedIds: new Set(),
    });
  });

  it('should add a junction', () => {
    const store = useNetworkStore.getState();
    const id = store.addElement('junction', { x: 100, y: 100 });
    
    expect(store.junctions.has(id)).toBe(true);
    expect(store.junctions.get(id)?.coordinates).toEqual({ x: 100, y: 100 });
  });

  it('should connect two junctions with a pipe', () => {
    const store = useNetworkStore.getState();
    const j1 = store.addElement('junction', { x: 0, y: 0 });
    const j2 = store.addElement('junction', { x: 100, y: 0 });
    
    const pipe = store.addElement('pipe', { node1: j1, node2: j2 });
    
    expect(store.pipes.has(pipe)).toBe(true);
    expect(store.pipes.get(pipe)?.node1).toBe(j1);
    expect(store.pipes.get(pipe)?.node2).toBe(j2);
  });

  it('should update element properties', () => {
    const store = useNetworkStore.getState();
    const id = store.addElement('junction', { elevation: 0 });
    
    store.updateElement(id, { elevation: 100 });
    
    expect(store.junctions.get(id)?.elevation).toBe(100);
  });

  it('should handle multi-selection', () => {
    const store = useNetworkStore.getState();
    const id1 = store.addElement('junction', {});
    const id2 = store.addElement('junction', {});
    
    store.selectElement(id1);
    store.selectElement(id2, true); // multi-select
    
    expect(store.selectedIds.has(id1)).toBe(true);
    expect(store.selectedIds.has(id2)).toBe(true);
  });
});

// __tests__/unit/simulation.worker.test.ts
describe('SimulationWorker', () => {
  it('should run hydraulic simulation', async () => {
    const inpContent = createTestInpFile();
    const worker = new Worker('./simulation.worker.ts');
    
    const result = await runSimulation(worker, inpContent);
    
    expect(result.success).toBe(true);
    expect(result.results).toBeDefined();
    expect(result.results?.nodeCount).toBeGreaterThan(0);
  });

  it('should handle simulation errors', async () => {
    const invalidInp = 'invalid content';
    const worker = new Worker('./simulation.worker.ts');
    
    const result = await runSimulation(worker, invalidInp);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### اختبارات التكامل (Integration Tests)

```typescript
// __tests__/integration/network-editor.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NetworkEditor } from '@/features/network/components/NetworkEditor';

describe('NetworkEditor Integration', () => {
  it('should create and connect elements', async () => {
    render(<NetworkEditor />);
    
    // Select junction tool
    const junctionTool = screen.getByTestId('tool-junction');
    await userEvent.click(junctionTool);
    
    // Click on canvas to create junction
    const canvas = screen.getByTestId('network-canvas');
    fireEvent.click(canvas, { clientX: 100, clientY: 100 });
    fireEvent.click(canvas, { clientX: 200, clientY: 100 });
    
    await waitFor(() => {
      const junctions = screen.getAllByTestId('junction-node');
      expect(junctions).toHaveLength(2);
    });
    
    // Select pipe tool and connect
    const pipeTool = screen.getByTestId('tool-pipe');
    await userEvent.click(pipeTool);
    
    const junctions = screen.getAllByTestId('junction-node');
    await userEvent.click(junctions[0]);
    await userEvent.click(junctions[1]);
    
    await waitFor(() => {
      expect(screen.getByTestId('pipe-link')).toBeInTheDocument();
    });
  });

  it('should run simulation and display results', async () => {
    render(<NetworkEditor />);
    
    // Create simple network
    createSimpleNetwork();
    
    // Run simulation
    const runButton = screen.getByTestId('run-simulation-btn');
    await userEvent.click(runButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('simulation-complete')).toBeInTheDocument();
    });
    
    // Check results panel
    expect(screen.getByTestId('results-panel')).toBeInTheDocument();
  });
});
```

### اختبارات E2E

```typescript
// e2e/network-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Network Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can create a new project', async ({ page }) => {
    await page.click('[data-testid="new-project-btn"]');
    await page.fill('[data-testid="project-name-input"]', 'Test Project');
    await page.click('[data-testid="create-project-btn"]');
    
    await expect(page.locator('[data-testid="project-title"]')).
      toHaveText('Test Project');
  });

  test('user can build a simple network', async ({ page }) => {
    // Create project
    await createProject(page, 'Simple Network');
    
    // Add reservoir
    await page.click('[data-testid="tool-reservoir"]');
    await page.click('[data-testid="canvas"]', { position: { x: 100, y: 200 } });
    
    // Add junctions
    await page.click('[data-testid="tool-junction"]');
    await page.click('[data-testid="canvas"]', { position: { x: 300, y: 200 } });
    await page.click('[data-testid="canvas"]', { position: { x: 500, y: 200 } });
    
    // Add tank
    await page.click('[data-testid="tool-tank"]');
    await page.click('[data-testid="canvas"]', { position: { x: 700, y: 200 } });
    
    // Connect with pipes
    await page.click('[data-testid="tool-pipe"]');
    const elements = await page.locator('[data-testid^="node-"]').all();
    for (let i = 0; i < elements.length - 1; i++) {
      await elements[i].click();
      await elements[i + 1].click();
    }
    
    // Verify network
    const nodeCount = await page.locator('[data-testid^="node-"]').count();
    const pipeCount = await page.locator('[data-testid^="pipe-"]').count();
    
    expect(nodeCount).toBe(4);
    expect(pipeCount).toBe(3);
  });

  test('user can run simulation and view results', async ({ page }) => {
    await createSimpleNetwork(page);
    
    // Configure simulation
    await page.click('[data-testid="simulation-settings"]');
    await page.fill('[data-testid="duration-input"]', '24');
    await page.click('[data-testid="save-settings"]');
    
    // Run simulation
    await page.click('[data-testid="run-simulation-btn"]');
    
    // Wait for completion
    await page.waitForSelector('[data-testid="simulation-complete"]', 
      { timeout: 30000 });
    
    // View results
    await page.click('[data-testid="view-results-btn"]');
    
    // Check results are displayed
    await expect(page.locator('[data-testid="results-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="pressure-chart"]')).toBeVisible();
  });
});
```

---

## 🚀 سير عمل CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: build
          path: dist/
      - name: Deploy to Vercel
        uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📊 الأداء والتحسين

### استراتيجيات التحسين

1. **Virtualization للقوائم الطويلة**
```typescript
import { FixedSizeList } from 'react-window';

const ElementList: React.FC<{ elements: NetworkElement[] }> = ({ elements }) => {
  return (
    <FixedSizeList
      height={500}
      itemCount={elements.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <ElementRow 
          element={elements[index]} 
          style={style} 
        />
      )}
    </FixedSizeList>
  );
};
```

2. **Memoization للمكونات الثقيلة**
```typescript
const NetworkCanvas = React.memo<NetworkCanvasProps>((props) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return (
    prevProps.elements === nextProps.elements &&
    prevProps.zoom === nextProps.zoom
  );
});
```

3. **Web Workers للمحاكاة**
```typescript
// تشغيل المحاكاة في Web Worker لتجنب حظر Main Thread
const runSimulation = async (inpFile: string) => {
  const worker = new Worker(
    new URL('./workers/simulation.worker.ts', import.meta.url)
  );
  
  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      if (e.data.success) {
        resolve(e.data.results);
      } else {
        reject(new Error(e.data.error));
      }
      worker.terminate();
    };
    
    worker.postMessage({ inpFile });
  });
};
```

4. **Lazy Loading للميزات**
```typescript
const SimulationPanel = lazy(() => 
  import('./features/simulation/SimulationPanel')
);

const ResultsViewer = lazy(() => 
  import('./features/visualization/ResultsViewer')
);
```

### مؤشرات الأداء المستهدفة

- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Runtime Performance:** 60 FPS للتفاعلات
- **Simulation Performance:** 50,000+ node في < 5 ثواني

---

## 🛡️ الأمان

### إجراءات الأمان

1. **XSS Protection:**
   - استخدام DOMPurify لتنظيف HTML
   - تجنب dangerouslySetInnerHTML
   - التحقق من المدخلات

2. **CSRF Protection:**
   - استخدام SameSite cookies
   - التحقق من headers

3. **Content Security Policy:**
```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline';
           style-src 'self' 'unsafe-inline';
           connect-src 'self' https://api.epanet-web.com;">
```

4. **Input Validation:**
```typescript
import { z } from 'zod';

const JunctionSchema = z.object({
  id: z.string().min(1).max(50),
  elevation: z.number().min(-1000).max(10000),
  baseDemand: z.number().min(0).max(1000000),
  demandPattern: z.string().optional(),
});

const validateJunction = (data: unknown) => {
  return JunctionSchema.parse(data);
};
```

---

## 📱 التوافق والدعم

### المتصفحات المدعومة

| المتصفح | النسخة | الدعم |
|---------|--------|-------|
| Chrome | 90+ | ✅ كامل |
| Firefox | 88+ | ✅ كامل |
| Safari | 14+ | ✅ كامل |
| Edge | 90+ | ✅ كامل |
| Opera | 76+ | ✅ كامل |

### الميزات التقنية المطلوبة

- WebAssembly (WASM)
- Web Workers
- File API
- Local Storage / IndexedDB
- Canvas 2D Context
- Resize Observer API
- Intersection Observer API

---

## 📚 المصادر والمراجع

### توثيق EPANET

- [EPANET 2.2 User Manual](https://epanet22.readthedocs.io/)
- [OWA-EPANET GitHub](https://github.com/OpenWaterAnalytics/EPANET)
- [EPANET Toolkit API](https://epanet22.readthedocs.io/en/latest/modules.html)

### مكتبات وموارد

- [epanet-js Documentation](https://epanetjs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Leaflet Documentation](https://leafletjs.com/)
- [D3.js Documentation](https://d3js.org/)

---

## ✅ قائمة المهام والتطوير

### المرحلة 1: الأساسيات (2-3 أسابيع)
- [ ] إعداد المشروع والبنية التحتية
- [ ] تكوين TypeScript و ESLint و Prettier
- [ ] إعداد Tailwind CSS والتصميم الأساسي
- [ ] إعداد Zustand stores
- [ ] إنشاء مكونات UI الأساسية
- [ ] إعداد i18n (العربية والإنجليزية)

### المرحلة 2: محرر الشبكة (3-4 أسابيع)
- [ ] رسم Canvas لعرض الشبكة
- [ ] إضافة وحذف العناصر
- [ ] التحديد والتحريك
- [ ] التكبير والتصغير
- [ ] تراجع وإعادة
- [ ] استيراد/تصدير INP

### المرحلة 3: الخصائص (2-3 أسابيع)
- [ ] محرر خصائص Junction
- [ ] محرر خصائص Pipe
- [ ] محرر خصائص Tank و Reservoir
- [ ] محرر خصائص Pump و Valve
- [ ] إدارة المنحنيات والأنماط

### المرحلة 4: المحاكاة (2-3 أسابيع)
- [ ] تكامل epanet-js
- [ ] Web Worker للمحاكاة
- [ ] إعدادات المحاكاة
- [ ] تشغيل وإيقاف المحاكاة
- [ ] معالجة الأخطاء

### المرحلة 5: التصور (3-4 أسابيع)
- [ ] خريطة النتائج
- [ ] التلوين حسب المعاملات
- [ ] الرسوم البيانية
- [ ] الرسوم المتحركة
- [ ] التقارير

### المرحلة 6: التحسينات (2-3 أسابيع)
- [ ] اختبارات شاملة
- [ ] تحسين الأداء
- [ ] إصلاح الأخطاء
- [ ] تحسين UX
- [ ] التوثيق النهائي

### الوقت الإجمالي المقدر: 14-20 أسبوع

---

**إعداد:** فريق التطوير  
**الإصدار:** 1.0  
**تاريخ التحديث:** فبراير 2026
