import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Junction,
  Reservoir,
  Tank,
  Pipe,
  Pump,
  Valve,
  NetworkElement,
  ElementType,
  ViewBox,
} from '../types';

// حالة الشبكة القابلة للتخزين للـ Undo/Redo
interface NetworkSnapshot {
  junctions: Junction[];
  reservoirs: Reservoir[];
  tanks: Tank[];
  pipes: Pipe[];
  pumps: Pump[];
  valves: Valve[];
}

interface NetworkState {
  // العناصر
  junctions: Map<string, Junction>;
  reservoirs: Map<string, Reservoir>;
  tanks: Map<string, Tank>;
  pipes: Map<string, Pipe>;
  pumps: Map<string, Pump>;
  valves: Map<string, Valve>;
  
  // التحديد
  selectedIds: Set<string>;
  hoveredId: string | null;
  
  // العرض
  viewBox: ViewBox;
  zoom: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  
  // الإجراءات
  addElement: (type: ElementType, data: Partial<NetworkElement>) => string;
  updateElement: (id: string, updates: Partial<NetworkElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setHoveredId: (id: string | null) => void;
  
  // التحكم في العرض
  setZoom: (zoom: number) => void;
  panView: (dx: number, dy: number) => void;
  fitView: () => void;
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  
  // الوظائف المساعدة
  getElementById: (id: string) => NetworkElement | undefined;
  getAllElements: () => NetworkElement[];
  getAllNodes: () => (Junction | Reservoir | Tank)[];
  getAllLinks: () => (Pipe | Pump | Valve)[];
  exportToInp: () => string;
  importFromInp: (content: string) => void;
  clearNetwork: () => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

// توليد ID فريد
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// القيم الافتراضية
const defaultJunction = (x: number, y: number): Junction => ({
  id: generateId('J'),
  type: 'junction',
  coordinates: { x, y },
  elevation: 0,
  baseDemand: 0,
  emitterCoeff: 0,
  emitterExponent: 0.5,
  initialQuality: 0,
});

const defaultReservoir = (x: number, y: number): Reservoir => ({
  id: generateId('R'),
  type: 'reservoir',
  coordinates: { x, y },
  head: 100,
});

const defaultTank = (x: number, y: number): Tank => ({
  id: generateId('T'),
  type: 'tank',
  coordinates: { x, y },
  elevation: 0,
  initialLevel: 50,
  minimumLevel: 0,
  maximumLevel: 100,
  diameter: 20,
  minimumVolume: 0,
  volumeCurve: '',
  mixingModel: 'MIX1',
  reactionCoeff: 0,
  initialQuality: 0,
});

const defaultPipe = (node1: string, node2: string): Pipe => ({
  id: generateId('P'),
  type: 'pipe',
  node1,
  node2,
  length: 100,
  diameter: 100,
  roughness: 100,
  roughnessType: 'HW',
  status: 'Open',
  checkValve: false,
  minorLoss: 0,
  bulkReactionCoeff: 0,
  wallReactionCoeff: 0,
});

const defaultPump = (node1: string, node2: string): Pump => ({
  id: generateId('Pump'),
  type: 'pump',
  node1,
  node2,
  properties: {
    type: 'POWER',
    power: 1,
    speed: 1,
  },
  energy: {
    price: 0,
    efficiencyCurve: '',
  },
});

const defaultValve = (node1: string, node2: string): Valve => ({
  id: generateId('V'),
  type: 'valve',
  node1,
  node2,
  diameter: 100,
  valveType: 'PRV',
  setting: 0,
  status: 'Open',
});

// دوال مساعدة للـ Undo/Redo
const createSnapshot = (
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

const restoreFromSnapshot = (snapshot: NetworkSnapshot) => ({
  junctions: new Map(snapshot.junctions.map(j => [j.id, j])),
  reservoirs: new Map(snapshot.reservoirs.map(r => [r.id, r])),
  tanks: new Map(snapshot.tanks.map(t => [t.id, t])),
  pipes: new Map(snapshot.pipes.map(p => [p.id, p])),
  pumps: new Map(snapshot.pumps.map(p => [p.id, p])),
  valves: new Map(snapshot.valves.map(v => [v.id, v])),
});

export const useNetworkStore = create<NetworkState>()(
  devtools(
    persist(
      (set, get) => {
        // حالة الـ Undo/Redo (خارج حالة Zustand الرئيسية)
        let past: NetworkSnapshot[] = [];
        let future: NetworkSnapshot[] = [];
        const maxHistory = 50;

        // دالة لحفظ اللقطة الحالية
        const saveSnapshot = () => {
          const state = get();
          const snapshot = createSnapshot(
            state.junctions,
            state.reservoirs,
            state.tanks,
            state.pipes,
            state.pumps,
            state.valves
          );
          past.push(snapshot);
          if (past.length > maxHistory) {
            past.shift();
          }
          future = []; // مسح المستقبل عند إضافة حالة جديدة
        };

        return {
        // الحالة الأولية
        junctions: new Map(),
        reservoirs: new Map(),
        tanks: new Map(),
        pipes: new Map(),
        pumps: new Map(),
        valves: new Map(),
        selectedIds: new Set(),
        hoveredId: null,
        viewBox: { x: 0, y: 0, width: 1000, height: 800 },
        zoom: 1,
        gridSize: 10,
        showGrid: true,
        snapToGrid: true,

        // إضافة عنصر
        addElement: (type, data) => {
          const state = get();
          saveSnapshot(); // حفظ قبل التغيير
          let element: NetworkElement;

          switch (type) {
            case 'junction': {
              const junctionData = data as Partial<Junction>;
              element = {
                ...defaultJunction(junctionData.coordinates?.x || 0, junctionData.coordinates?.y || 0),
                ...data,
              } as Junction;
              set({ junctions: new Map(state.junctions).set(element.id, element as Junction) });
              break;
            }
            case 'reservoir': {
              const reservoirData = data as Partial<Reservoir>;
              element = {
                ...defaultReservoir(reservoirData.coordinates?.x || 0, reservoirData.coordinates?.y || 0),
                ...data,
              } as Reservoir;
              set({ reservoirs: new Map(state.reservoirs).set(element.id, element as Reservoir) });
              break;
            }
            case 'tank': {
              const tankData = data as Partial<Tank>;
              element = {
                ...defaultTank(tankData.coordinates?.x || 0, tankData.coordinates?.y || 0),
                ...data,
              } as Tank;
              set({ tanks: new Map(state.tanks).set(element.id, element as Tank) });
              break;
            }
            case 'pipe':
              element = {
                ...defaultPipe((data as Pipe).node1, (data as Pipe).node2),
                ...data,
              } as Pipe;
              set({ pipes: new Map(state.pipes).set(element.id, element as Pipe) });
              break;
            case 'pump':
              element = {
                ...defaultPump((data as Pump).node1, (data as Pump).node2),
                ...data,
              } as Pump;
              set({ pumps: new Map(state.pumps).set(element.id, element as Pump) });
              break;
            case 'valve':
              element = {
                ...defaultValve((data as Valve).node1, (data as Valve).node2),
                ...data,
              } as Valve;
              set({ valves: new Map(state.valves).set(element.id, element as Valve) });
              break;
          }

          return element!.id;
        },

        // تحديث عنصر
        updateElement: (id, updates) => {
          const state = get();
          saveSnapshot(); // حفظ قبل التغيير
          
          if (state.junctions.has(id)) {
            const element = state.junctions.get(id)!;
            set({
              junctions: new Map(state.junctions).set(id, { ...element, ...updates } as Junction),
            });
          } else if (state.reservoirs.has(id)) {
            const element = state.reservoirs.get(id)!;
            set({
              reservoirs: new Map(state.reservoirs).set(id, { ...element, ...updates } as Reservoir),
            });
          } else if (state.tanks.has(id)) {
            const element = state.tanks.get(id)!;
            set({
              tanks: new Map(state.tanks).set(id, { ...element, ...updates } as Tank),
            });
          } else if (state.pipes.has(id)) {
            const element = state.pipes.get(id)!;
            set({
              pipes: new Map(state.pipes).set(id, { ...element, ...updates } as Pipe),
            });
          } else if (state.pumps.has(id)) {
            const element = state.pumps.get(id)!;
            set({
              pumps: new Map(state.pumps).set(id, { ...element, ...updates } as Pump),
            });
          } else if (state.valves.has(id)) {
            const element = state.valves.get(id)!;
            set({
              valves: new Map(state.valves).set(id, { ...element, ...updates } as Valve),
            });
          }
        },

        // حذف عنصر
        deleteElement: (id) => {
          const state = get();
          saveSnapshot(); // حفظ قبل التغيير
          
          // حذف الأنابيب المتصلة بالعقدة
          const pipesToDelete: string[] = [];
          state.pipes.forEach((pipe) => {
            if (pipe.node1 === id || pipe.node2 === id) {
              pipesToDelete.push(pipe.id);
            }
          });
          
          const newPipes = new Map(state.pipes);
          pipesToDelete.forEach((pipeId) => newPipes.delete(pipeId));
          
          const newJunctions = new Map(state.junctions);
          const newReservoirs = new Map(state.reservoirs);
          const newTanks = new Map(state.tanks);
          const newPumps = new Map(state.pumps);
          const newValves = new Map(state.valves);
          
          newJunctions.delete(id);
          newReservoirs.delete(id);
          newTanks.delete(id);
          newPipes.delete(id);
          newPumps.delete(id);
          newValves.delete(id);
          
          const newSelectedIds = new Set(state.selectedIds);
          newSelectedIds.delete(id);
          pipesToDelete.forEach((pipeId) => newSelectedIds.delete(pipeId));
          
          set({
            junctions: newJunctions,
            reservoirs: newReservoirs,
            tanks: newTanks,
            pipes: newPipes,
            pumps: newPumps,
            valves: newValves,
            selectedIds: newSelectedIds,
          });
        },

        // تحديد عنصر
        selectElement: (id, multi = false) => {
          const state = get();
          const newSelectedIds = new Set(multi ? state.selectedIds : []);
          
          if (newSelectedIds.has(id)) {
            newSelectedIds.delete(id);
          } else {
            newSelectedIds.add(id);
          }
          
          set({ selectedIds: newSelectedIds });
        },

        // مسح التحديد
        clearSelection: () => set({ selectedIds: new Set() }),

        // تعيين العنصر المعلَّق
        setHoveredId: (id) => set({ hoveredId: id }),

        // تكبير/تصغير
        setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

        // تحريك العرض
        panView: (dx, dy) => {
          const state = get();
          set({
            viewBox: {
              ...state.viewBox,
              x: state.viewBox.x - dx / state.zoom,
              y: state.viewBox.y - dy / state.zoom,
            },
          });
        },

        // تكيف العرض
        fitView: () => {
          const elements = get().getAllElements();
          
          if (elements.length === 0) return;
          
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          
          elements.forEach((el) => {
            if ('coordinates' in el) {
              minX = Math.min(minX, el.coordinates.x);
              minY = Math.min(minY, el.coordinates.y);
              maxX = Math.max(maxX, el.coordinates.x);
              maxY = Math.max(maxY, el.coordinates.y);
            }
          });
          
          const padding = 50;
          set({
            viewBox: {
              x: minX - padding,
              y: minY - padding,
              width: maxX - minX + padding * 2,
              height: maxY - minY + padding * 2,
            },
          });
        },

        // إظهار/إخفاء الشبكة
        setShowGrid: (show) => set({ showGrid: show }),

        // تفعيل/تعطيل الالتصاق بالشبكة
        setSnapToGrid: (snap) => set({ snapToGrid: snap }),

        // الحصول على عنصر بواسطة ID
        getElementById: (id) => {
          const state = get();
          return (
            state.junctions.get(id) ||
            state.reservoirs.get(id) ||
            state.tanks.get(id) ||
            state.pipes.get(id) ||
            state.pumps.get(id) ||
            state.valves.get(id)
          );
        },

        // الحصول على جميع العناصر
        getAllElements: () => {
          const state = get();
          return [
            ...Array.from(state.junctions.values()),
            ...Array.from(state.reservoirs.values()),
            ...Array.from(state.tanks.values()),
            ...Array.from(state.pipes.values()),
            ...Array.from(state.pumps.values()),
            ...Array.from(state.valves.values()),
          ];
        },

        // الحصول على جميع العقد
        getAllNodes: () => {
          const state = get();
          return [
            ...Array.from(state.junctions.values()),
            ...Array.from(state.reservoirs.values()),
            ...Array.from(state.tanks.values()),
          ];
        },

        // الحصول على جميع الروابط
        getAllLinks: () => {
          const state = get();
          return [
            ...Array.from(state.pipes.values()),
            ...Array.from(state.pumps.values()),
            ...Array.from(state.valves.values()),
          ];
        },

        // تصدير إلى INP
        exportToInp: () => {
          const state = get();
          let inp = '[TITLE]\nEPANET Web Network\n\n';
          
          // Junctions
          if (state.junctions.size > 0) {
            inp += '[JUNCTIONS]\n;ID\tElevation\tDemand\tPattern\n';
            state.junctions.forEach((j) => {
              inp += `${j.id}\t${j.elevation}\t${j.baseDemand}\t${j.demandPattern || ''}\n`;
            });
            inp += '\n';
          }
          
          // Reservoirs
          if (state.reservoirs.size > 0) {
            inp += '[RESERVOIRS]\n;ID\tHead\tPattern\n';
            state.reservoirs.forEach((r) => {
              inp += `${r.id}\t${r.head}\t${r.headPattern || ''}\n`;
            });
            inp += '\n';
          }
          
          // Tanks
          if (state.tanks.size > 0) {
            inp += '[TANKS]\n;ID\tElevation\tInitLevel\tMinLevel\tMaxLevel\tDiameter\n';
            state.tanks.forEach((t) => {
              inp += `${t.id}\t${t.elevation}\t${t.initialLevel}\t${t.minimumLevel}\t${t.maximumLevel}\t${t.diameter}\n`;
            });
            inp += '\n';
          }
          
          // Pipes
          if (state.pipes.size > 0) {
            inp += '[PIPES]\n;ID\tNode1\tNode2\tLength\tDiameter\tRoughness\n';
            state.pipes.forEach((p) => {
              inp += `${p.id}\t${p.node1}\t${p.node2}\t${p.length}\t${p.diameter}\t${p.roughness}\n`;
            });
            inp += '\n';
          }
          
          // Pumps
          if (state.pumps.size > 0) {
            inp += '[PUMPS]\n;ID\tNode1\tNode2\tParameters\n';
            state.pumps.forEach((p) => {
              if (p.properties.type === 'POWER') {
                inp += `${p.id}\t${p.node1}\t${p.node2}\tPOWER ${p.properties.power}\n`;
              } else {
                inp += `${p.id}\t${p.node1}\t${p.node2}\tHEAD ${p.properties.headCurve}\n`;
              }
            });
            inp += '\n';
          }
          
          // Valves
          if (state.valves.size > 0) {
            inp += '[VALVES]\n;ID\tNode1\tNode2\tDiameter\tType\tSetting\n';
            state.valves.forEach((v) => {
              inp += `${v.id}\t${v.node1}\t${v.node2}\t${v.diameter}\t${v.valveType}\t${v.setting}\n`;
            });
            inp += '\n';
          }
          
          inp += '[END]';
          return inp;
        },

        // استيراد من INP
        importFromInp: (content) => {
          saveSnapshot(); // حفظ قبل التغيير
          
          const lines = content.split('\n');
          let currentSection = '';
          
          const newJunctions = new Map<string, Junction>();
          const newReservoirs = new Map<string, Reservoir>();
          const newTanks = new Map<string, Tank>();
          const newPipes = new Map<string, Pipe>();
          const newPumps = new Map<string, Pump>();
          const newValves = new Map<string, Valve>();
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
              currentSection = trimmedLine.slice(1, -1).toUpperCase();
              continue;
            }
            
            if (trimmedLine.startsWith(';') || trimmedLine === '') continue;
            
            const parts = trimmedLine.split(/\s+/);
            if (parts.length < 2) continue;
            
            switch (currentSection) {
              case 'JUNCTIONS': {
                const [id, elevation, demand, pattern] = parts;
                const junction: Junction = {
                  id,
                  type: 'junction',
                  coordinates: { x: Math.random() * 500, y: Math.random() * 500 },
                  elevation: parseFloat(elevation) || 0,
                  baseDemand: parseFloat(demand) || 0,
                  demandPattern: pattern,
                };
                newJunctions.set(id, junction);
                break;
              }
              case 'RESERVOIRS': {
                const [id, head, pattern] = parts;
                const reservoir: Reservoir = {
                  id,
                  type: 'reservoir',
                  coordinates: { x: Math.random() * 500, y: Math.random() * 500 },
                  head: parseFloat(head) || 0,
                  headPattern: pattern,
                };
                newReservoirs.set(id, reservoir);
                break;
              }
              case 'TANKS': {
                const [id, elevation, initLevel, minLevel, maxLevel, diameter] = parts;
                const tank: Tank = {
                  id,
                  type: 'tank',
                  coordinates: { x: Math.random() * 500, y: Math.random() * 500 },
                  elevation: parseFloat(elevation) || 0,
                  initialLevel: parseFloat(initLevel) || 50,
                  minimumLevel: parseFloat(minLevel) || 0,
                  maximumLevel: parseFloat(maxLevel) || 100,
                  diameter: parseFloat(diameter) || 20,
                };
                newTanks.set(id, tank);
                break;
              }
              case 'PIPES': {
                const [id, node1, node2, length, diameter, roughness] = parts;
                const pipe: Pipe = {
                  id,
                  type: 'pipe',
                  node1,
                  node2,
                  length: parseFloat(length) || 100,
                  diameter: parseFloat(diameter) || 100,
                  roughness: parseFloat(roughness) || 100,
                  status: 'Open',
                  checkValve: false,
                };
                newPipes.set(id, pipe);
                break;
              }
              case 'PUMPS': {
                const [id, node1, node2, ...params] = parts;
                const paramStr = params.join(' ');
                const isPower = paramStr.toUpperCase().startsWith('POWER');
                const pump: Pump = {
                  id,
                  type: 'pump',
                  node1,
                  node2,
                  properties: {
                    type: isPower ? 'POWER' : 'HEAD',
                    power: isPower ? parseFloat(paramStr.split(' ')[1]) || 1 : undefined,
                    headCurve: !isPower ? paramStr.split(' ')[1] : undefined,
                    speed: 1,
                  },
                };
                newPumps.set(id, pump);
                break;
              }
              case 'VALVES': {
                const [id, node1, node2, diameter, valveType, setting] = parts;
                const valve: Valve = {
                  id,
                  type: 'valve',
                  node1,
                  node2,
                  diameter: parseFloat(diameter) || 100,
                  valveType: valveType as Valve['valveType'],
                  setting: parseFloat(setting) || 0,
                  status: 'Open',
                };
                newValves.set(id, valve);
                break;
              }
              case 'COORDINATES': {
                const [id, x, y] = parts;
                if (newJunctions.has(id)) {
                  const j = newJunctions.get(id)!;
                  j.coordinates = { x: parseFloat(x) || 0, y: parseFloat(y) || 0 };
                } else if (newReservoirs.has(id)) {
                  const r = newReservoirs.get(id)!;
                  r.coordinates = { x: parseFloat(x) || 0, y: parseFloat(y) || 0 };
                } else if (newTanks.has(id)) {
                  const t = newTanks.get(id)!;
                  t.coordinates = { x: parseFloat(x) || 0, y: parseFloat(y) || 0 };
                }
                break;
              }
            }
          }
          
          set({
            junctions: newJunctions,
            reservoirs: newReservoirs,
            tanks: newTanks,
            pipes: newPipes,
            pumps: newPumps,
            valves: newValves,
            selectedIds: new Set(),
          });
        },

        // مسح الشبكة
        clearNetwork: () => {
          saveSnapshot(); // حفظ قبل التغيير
          set({
            junctions: new Map(),
            reservoirs: new Map(),
            tanks: new Map(),
            pipes: new Map(),
            pumps: new Map(),
            valves: new Map(),
            selectedIds: new Set(),
          });
        },

        // Undo
        undo: () => {
          if (past.length === 0) return;
          
          const currentState = get();
          const currentSnapshot = createSnapshot(
            currentState.junctions,
            currentState.reservoirs,
            currentState.tanks,
            currentState.pipes,
            currentState.pumps,
            currentState.valves
          );
          future.unshift(currentSnapshot);
          
          const previousSnapshot = past.pop()!;
          const restored = restoreFromSnapshot(previousSnapshot);
          
          set({
            ...restored,
            selectedIds: new Set(),
          });
        },

        // Redo
        redo: () => {
          if (future.length === 0) return;
          
          const currentState = get();
          const currentSnapshot = createSnapshot(
            currentState.junctions,
            currentState.reservoirs,
            currentState.tanks,
            currentState.pipes,
            currentState.pumps,
            currentState.valves
          );
          past.push(currentSnapshot);
          
          const nextSnapshot = future.shift()!;
          const restored = restoreFromSnapshot(nextSnapshot);
          
          set({
            ...restored,
            selectedIds: new Set(),
          });
        },

        // التحقق من إمكانية Undo
        canUndo: () => past.length > 0,

        // التحقق من إمكانية Redo
        canRedo: () => future.length > 0,

        // مسح السجل
        clearHistory: () => {
          past = [];
          future = [];
        },
      };
      },
      {
        name: 'epanet-network-storage',
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const { state } = JSON.parse(str);
            return {
              state: {
                ...state,
                junctions: new Map(state.junctions),
                reservoirs: new Map(state.reservoirs),
                tanks: new Map(state.tanks),
                pipes: new Map(state.pipes),
                pumps: new Map(state.pumps),
                valves: new Map(state.valves),
                selectedIds: new Set(state.selectedIds),
              },
            };
          },
          setItem: (name, newValue) => {
            const str = JSON.stringify({
              state: {
                ...newValue.state,
                junctions: Array.from(newValue.state.junctions.entries()),
                reservoirs: Array.from(newValue.state.reservoirs.entries()),
                tanks: Array.from(newValue.state.tanks.entries()),
                pipes: Array.from(newValue.state.pipes.entries()),
                pumps: Array.from(newValue.state.pumps.entries()),
                valves: Array.from(newValue.state.valves.entries()),
                selectedIds: Array.from(newValue.state.selectedIds),
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
