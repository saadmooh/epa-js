// أنواع عناصر الشبكة
export type ElementType = 
  | 'junction' 
  | 'reservoir' 
  | 'tank' 
  | 'pipe' 
  | 'pump' 
  | 'valve';

// الإحداثيات
export interface Coordinates {
  x: number;
  y: number;
}

// العقدة الأساسية
export interface NetworkNode {
  id: string;
  type: ElementType;
  coordinates: Coordinates;
}

// Junction
export interface Junction extends NetworkNode {
  type: 'junction';
  elevation: number;
  baseDemand: number;
  demandPattern?: string;
  emitterCoeff?: number;
  emitterExponent?: number;
  initialQuality?: number;
  sourceQuality?: SourceQuality;
}

// Reservoir
export interface Reservoir extends NetworkNode {
  type: 'reservoir';
  head: number;
  headPattern?: string;
  initialQuality?: number;
  sourceQuality?: SourceQuality;
}

// Tank
export interface Tank extends NetworkNode {
  type: 'tank';
  elevation: number;
  initialLevel: number;
  minimumLevel: number;
  maximumLevel: number;
  diameter: number;
  minimumVolume?: number;
  volumeCurve?: string;
  mixingModel?: 'MIX1' | 'MIX2' | 'FIFO' | 'LIFO';
  reactionCoeff?: number;
  initialQuality?: number;
}

// الرابط الأساسي
export interface NetworkLink {
  id: string;
  type: ElementType;
  node1: string;
  node2: string;
}

// Pipe
export interface Pipe extends NetworkLink {
  type: 'pipe';
  length: number;
  diameter: number;
  roughness: number;
  roughnessType?: 'HW' | 'DW' | 'CM';
  minorLoss?: number;
  status: 'Open' | 'Closed' | 'CV';
  checkValve: boolean;
  vertices?: Coordinates[];
  // معاملات التفاعل لمحاكاة جودة المياه
  bulkReactionCoeff?: number;
  wallReactionCoeff?: number;
}

// Pump
export interface Pump extends NetworkLink {
  type: 'pump';
  properties: {
    type: 'POWER' | 'HEAD';
    power?: number;
    headCurve?: string;
    speed: number;
    pattern?: string;
  };
  energy?: {
    price: number;
    pattern?: string;
    efficiencyCurve?: string;
  };
}

// Valve
export interface Valve extends NetworkLink {
  type: 'valve';
  diameter: number;
  valveType: 'PRV' | 'PSV' | 'PBV' | 'FCV' | 'TCV' | 'GPV';
  setting: number;
  minorLoss?: number;
  status: 'Open' | 'Closed';
  lossCurve?: string; // خاص بصمامات GPV
}

// نوع العنصر الكلي
export type NetworkElement = Junction | Reservoir | Tank | Pipe | Pump | Valve;

// نقطة على المنحنى
export interface CurvePoint {
  x: number;
  y: number;
}

// منحنى الكفاءة للمضخة
export interface PumpEfficiencyCurve {
  id: string;
  name: string;
  points: CurvePoint[];
}

// خيارات التصور البصري
export interface VisualizationOptions {
  // أسهم التدفق
  showFlowDirection: boolean;
  flowArrowSize: number;
  flowArrowSpacing: number;
  
  // التلوين
  showPressureColors: boolean;
  showVelocityColors: boolean;
  showQualityColors: boolean;
  
  // نطاقات الألوان
  pressureMin: number;
  pressureMax: number;
  velocityMin: number;
  velocityMax: number;
  qualityMin: number;
  qualityMax: number;
  
  // الملصقات
  showNodeLabels: boolean;
  showPipeLabels: boolean;
  showPressureLabels: boolean;
  showFlowLabels: boolean;
  showVelocityLabels: boolean;
  labelFontSize: number;
  
  // الخريطة
  showLegend: boolean;
  showScaleBar: boolean;
  showGrid: boolean;
  showBackgroundMap: boolean;
  backgroundMapType: 'osm' | 'satellite' | 'none';
  
  // خطوط تساوي الضغط
  showContours: boolean;
  contourInterval: number;
}

// نتائج المحاكاة الموسعة
export interface ExtendedSimulationResults extends SimulationResults {
  maxPressure: number;
  minPressure: number;
  maxVelocity: number;
  minVelocity: number;
  maxFlow: number;
  minFlow: number;
  maxQuality: number;
  minQuality: number;
}

// جودة المصدر
export interface SourceQuality {
  type: 'CONCEN' | 'MASS' | 'SETPOINT' | 'FLOWPACED';
  quality: number;
  pattern?: string;
}

// ViewBox
export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// خيارات المحاكاة
export interface SimulationOptions {
  duration: number;
  hydraulicTimestep: number;
  qualityTimestep: number;
  patternTimestep: number;
  patternStart: number;
  reportTimestep: number;
  reportStart: number;
  startClockTime: number;
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
  demandModel: 'DDA' | 'PDA';
  minimumPressure: number;
  requiredPressure: number;
  pressureExponent: number;
  // خيارات الوحدات ومعادلة فقد الرأس
  flowUnits: 'LPS' | 'LPM' | 'CMH' | 'CMD' | 'GPM' | 'CFS' | 'AFD' | 'MGD' | 'IMGD' | 'MLD';
  headlossFormula: 'HW' | 'DW' | 'CM';
}

// نتائج المحاكاة
export interface SimulationResults {
  timePeriods: number[];
  nodeResults: Map<string, NodeResults>;
  linkResults: Map<string, LinkResults>;
}

export interface NodeResults {
  pressure: number[];
  head: number[];
  demand: number[];
  quality?: number[];
}

export interface LinkResults {
  flow: number[];
  velocity: number[];
  headloss: number[];
  status: string[];
  setting?: number[];
  reactionRate?: number[];
  frictionFactor?: number[];
}

// المشروع
export interface Project {
  id: string;
  name: string;
  createdAt: Date;
  modifiedAt: Date;
  network: {
    junctions: Map<string, Junction>;
    reservoirs: Map<string, Reservoir>;
    tanks: Map<string, Tank>;
    pipes: Map<string, Pipe>;
    pumps: Map<string, Pump>;
    valves: Map<string, Valve>;
  };
  simulationOptions: SimulationOptions;
}
