# اختبارات شاملة - EPANET Web Application

## 🧪 استراتيجية الاختبار الشاملة

### هيكل الاختبارات

```
tests/
├── unit/                    # اختبارات الوحدة
│   ├── components/          # اختبارات المكونات
│   ├── hooks/               # اختبارات الـ Hooks
│   ├── store/               # اختبارات الـ Store
│   ├── utils/               # اختبارات الأدوات
│   └── services/            # اختبارات الخدمات
├── integration/             # اختبارات التكامل
│   ├── features/            # اختبارات الميزات
│   └── workflows/           # اختبارات سير العمل
├── e2e/                     # اختبارات end-to-end
│   ├── network/             # اختبارات إنشاء الشبكة
│   ├── simulation/          # اختبارات المحاكاة
│   └── ui/                  # اختبارات واجهة المستخدم
├── fixtures/                # بيانات الاختبار
│   ├── inp-files/           # ملفات INP نموذجية
│   └── networks/            # شبكات نموذجية
└── mocks/                   # Mock data & handlers
    ├── api.ts
    └── epanet-js.ts
```

---

## 📦 تكوين الاختبارات

### 1. Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mock*.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
```

### 2. Test Setup

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

---

## 🔬 اختبارات الوحدة (Unit Tests)

### اختبارات Network Store

```typescript
// tests/unit/store/network.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useNetworkStore } from '@/store/network.store';

describe('NetworkStore', () => {
  beforeEach(() => {
    useNetworkStore.setState({
      junctions: new Map(),
      reservoirs: new Map(),
      tanks: new Map(),
      pipes: new Map(),
      pumps: new Map(),
      valves: new Map(),
      labels: new Map(),
      selectedIds: new Set(),
      viewBox: { x: 0, y: 0, width: 1000, height: 800 },
      zoom: 1,
    });
  });

  describe('Element Creation', () => {
    it('should create a junction with default properties', () => {
      const store = useNetworkStore.getState();
      const id = store.addElement('junction', { x: 100, y: 200 });
      
      expect(store.junctions.has(id)).toBe(true);
      const junction = store.junctions.get(id)!;
      expect(junction.coordinates).toEqual({ x: 100, y: 200 });
      expect(junction.elevation).toBe(0);
      expect(junction.baseDemand).toBe(0);
    });

    it('should create a pipe connecting two junctions', () => {
      const store = useNetworkStore.getState();
      const j1 = store.addElement('junction', { x: 0, y: 0 });
      const j2 = store.addElement('junction', { x: 100, y: 0 });
      
      const pipeId = store.addElement('pipe', {
        node1: j1,
        node2: j2,
        length: 100,
        diameter: 200,
      });
      
      expect(store.pipes.has(pipeId)).toBe(true);
      const pipe = store.pipes.get(pipeId)!;
      expect(pipe.node1).toBe(j1);
      expect(pipe.node2).toBe(j2);
    });

    it('should create a tank with proper structure', () => {
      const store = useNetworkStore.getState();
      const id = store.addElement('tank', {
        x: 500,
        y: 500,
        elevation: 100,
        initialLevel: 50,
        minimumLevel: 10,
        maximumLevel: 100,
        diameter: 20,
      });
      
      const tank = store.tanks.get(id)!;
      expect(tank.elevation).toBe(100);
      expect(tank.initialLevel).toBe(50);
      expect(tank.minimumLevel).toBe(10);
      expect(tank.maximumLevel).toBe(100);
    });
  });

  describe('Element Updates', () => {
    it('should update junction properties', () => {
      const store = useNetworkStore.getState();
      const id = store.addElement('junction', { elevation: 0 });
      
      store.updateElement(id, { elevation: 100, baseDemand: 50 });
      
      const junction = store.junctions.get(id)!;
      expect(junction.elevation).toBe(100);
      expect(junction.baseDemand).toBe(50);
    });

    it('should update pipe diameter and length', () => {
      const store = useNetworkStore.getState();
      const j1 = store.addElement('junction', {});
      const j2 = store.addElement('junction', {});
      const pipeId = store.addElement('pipe', { node1: j1, node2: j2 });
      
      store.updateElement(pipeId, { diameter: 300, length: 500 });
      
      const pipe = store.pipes.get(pipeId)!;
      expect(pipe.diameter).toBe(300);
      expect(pipe.length).toBe(500);
    });
  });

  describe('Element Deletion', () => {
    it('should delete a junction', () => {
      const store = useNetworkStore.getState();
      const id = store.addElement('junction', {});
      
      store.deleteElement(id);
      
      expect(store.junctions.has(id)).toBe(false);
    });

    it('should delete connected pipes when deleting a junction', () => {
      const store = useNetworkStore.getState();
      const j1 = store.addElement('junction', {});
      const j2 = store.addElement('junction', {});
      const pipeId = store.addElement('pipe', { node1: j1, node2: j2 });
      
      store.deleteElement(j1);
      
      expect(store.junctions.has(j1)).toBe(false);
      expect(store.pipes.has(pipeId)).toBe(false);
    });
  });

  describe('Selection', () => {
    it('should select a single element', () => {
      const store = useNetworkStore.getState();
      const id = store.addElement('junction', {});
      
      store.selectElement(id);
      
      expect(store.selectedIds.has(id)).toBe(true);
      expect(store.selectedIds.size).toBe(1);
    });

    it('should support multi-select', () => {
      const store = useNetworkStore.getState();
      const id1 = store.addElement('junction', {});
      const id2 = store.addElement('junction', {});
      
      store.selectElement(id1);
      store.selectElement(id2, true);
      
      expect(store.selectedIds.size).toBe(2);
    });

    it('should clear all selections', () => {
      const store = useNetworkStore.getState();
      const id1 = store.addElement('junction', {});
      const id2 = store.addElement('junction', {});
      
      store.selectElement(id1, true);
      store.selectElement(id2, true);
      store.clearSelection();
      
      expect(store.selectedIds.size).toBe(0);
    });
  });
});
```

### اختبارات Simulation Store

```typescript
// tests/unit/store/simulation.store.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSimulationStore } from '@/store/simulation.store';

describe('SimulationStore', () => {
  beforeEach(() => {
    useSimulationStore.setState({
      isRunning: false,
      progress: 0,
      error: null,
      options: {
        duration: 24,
        hydraulicTimestep: 1,
        qualityTimestep: 0.25,
        patternTimestep: 1,
      },
      results: null,
      currentTime: 0,
      isPlaying: false,
      playbackSpeed: 1,
    });
  });

  describe('Options Management', () => {
    it('should update simulation options', () => {
      const store = useSimulationStore.getState();
      
      store.setOptions({ duration: 48, hydraulicTimestep: 0.5 });
      
      expect(store.options.duration).toBe(48);
      expect(store.options.hydraulicTimestep).toBe(0.5);
    });

    it('should validate duration is positive', () => {
      const store = useSimulationStore.getState();
      
      expect(() => {
        store.setOptions({ duration: -1 });
      }).toThrow('Duration must be positive');
    });
  });

  describe('Simulation Execution', () => {
    it('should set running state when starting simulation', async () => {
      const store = useSimulationStore.getState();
      
      const runPromise = store.runSimulation();
      
      expect(store.isRunning).toBe(true);
      expect(store.error).toBeNull();
      
      store.stopSimulation();
    });

    it('should update progress during simulation', async () => {
      const store = useSimulationStore.getState();
      
      store.runSimulation();
      store.setProgress(50);
      
      expect(store.progress).toBe(50);
      
      store.stopSimulation();
    });

    it('should store results after successful simulation', async () => {
      const store = useSimulationStore.getState();
      
      const mockResults = {
        timePeriods: [0, 1, 2, 3, 4],
        nodeResults: new Map(),
        linkResults: new Map(),
      };
      
      vi.spyOn(store, 'runSimulation').mockResolvedValueOnce(mockResults);
      
      await store.runSimulation();
      
      expect(store.results).toEqual(mockResults);
      expect(store.isRunning).toBe(false);
      expect(store.progress).toBe(100);
    });
  });

  describe('Results Navigation', () => {
    it('should set current time', () => {
      const store = useSimulationStore.getState();
      store.results = { timePeriods: [0, 1, 2, 3, 4, 5] } as any;
      
      store.setCurrentTime(3);
      
      expect(store.currentTime).toBe(3);
    });

    it('should play animation', () => {
      const store = useSimulationStore.getState();
      
      store.playAnimation();
      
      expect(store.isPlaying).toBe(true);
    });

    it('should set playback speed', () => {
      const store = useSimulationStore.getState();
      
      store.setPlaybackSpeed(2);
      
      expect(store.playbackSpeed).toBe(2);
    });
  });
});
```

### اختبارات المكونات

```typescript
// tests/unit/components/NetworkCanvas.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NetworkCanvas } from '@/components/network/NetworkCanvas';

describe('NetworkCanvas', () => {
  const mockElements = [
    { id: 'j1', type: 'junction', x: 100, y: 100 },
    { id: 'j2', type: 'junction', x: 200, y: 100 },
    { id: 'p1', type: 'pipe', node1: 'j1', node2: 'j2' },
  ];

  const defaultProps = {
    elements: mockElements,
    selectedIds: new Set<string>(),
    onSelect: vi.fn(),
    onUpdate: vi.fn(),
    zoom: 1,
    viewBox: { x: 0, y: 0, width: 800, height: 600 },
  };

  it('should render canvas with correct dimensions', () => {
    render(<NetworkCanvas {...defaultProps} />);
    
    const canvas = screen.getByTestId('network-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '800');
    expect(canvas).toHaveAttribute('height', '600');
  });

  it('should render all network elements', () => {
    render(<NetworkCanvas {...defaultProps} />);
    
    expect(screen.getByTestId('junction-j1')).toBeInTheDocument();
    expect(screen.getByTestId('junction-j2')).toBeInTheDocument();
    expect(screen.getByTestId('pipe-p1')).toBeInTheDocument();
  });

  it('should highlight selected elements', () => {
    render(
      <NetworkCanvas
        {...defaultProps}
        selectedIds={new Set(['j1'])}
      />
    );
    
    const junction = screen.getByTestId('junction-j1');
    expect(junction).toHaveClass('selected');
  });

  it('should call onSelect when clicking an element', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    
    render(<NetworkCanvas {...defaultProps} onSelect={onSelect} />);
    
    await user.click(screen.getByTestId('junction-j1'));
    
    expect(onSelect).toHaveBeenCalledWith('j1', false);
  });

  it('should show grid when enabled', () => {
    render(<NetworkCanvas {...defaultProps} showGrid={true} />);
    
    expect(screen.getByTestId('canvas-grid')).toBeInTheDocument();
  });

  it('should hide grid when disabled', () => {
    render(<NetworkCanvas {...defaultProps} showGrid={false} />);
    
    expect(screen.queryByTestId('canvas-grid')).not.toBeInTheDocument();
  });
});
```

### اختبارات Hooks

```typescript
// tests/unit/hooks/useNetworkElement.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkElement } from '@/hooks/useNetworkElement';

describe('useNetworkElement', () => {
  it('should return element by ID', () => {
    const { result } = renderHook(() => useNetworkElement('j1'));
    
    expect(result.current.element).toBeDefined();
  });

  it('should update element properties', () => {
    const { result } = renderHook(() => useNetworkElement('j1'));
    
    act(() => {
      result.current.update({ elevation: 150 });
    });
    
    expect(result.current.element?.elevation).toBe(150);
  });

  it('should delete element', () => {
    const { result } = renderHook(() => useNetworkElement('j1'));
    
    act(() => {
      result.current.remove();
    });
    
    expect(result.current.element).toBeUndefined();
  });
});
```

---

## 🔗 اختبارات التكامل (Integration Tests)

### اختبار إنشاء شبكة كاملة

```typescript
// tests/integration/network-creation.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NetworkEditor } from '@/features/network/components/NetworkEditor';

describe('Network Creation Integration', () => {
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

---

## 🎭 اختبارات E2E (End-to-End)

### اختبار Playwright

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

### اختبارات Cypress

```typescript
// cypress/e2e/network-editor.cy.ts
describe('Network Editor', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the network editor', () => {
    cy.get('[data-testid="network-canvas"]').should('be.visible');
    cy.get('[data-testid="toolbar"]').should('be.visible');
  });

  it('should create junctions', () => {
    cy.get('[data-testid="tool-junction"]').click();
    cy.get('[data-testid="network-canvas"]').click(100, 100);
    cy.get('[data-testid="network-canvas"]').click(200, 100);
    
    cy.get('[data-testid^="junction-"]').should('have.length', 2);
  });

  it('should connect junctions with pipes', () => {
    // Create junctions
    cy.get('[data-testid="tool-junction"]').click();
    cy.get('[data-testid="network-canvas"]').click(100, 100);
    cy.get('[data-testid="network-canvas"]').click(200, 100);
    
    // Connect with pipe
    cy.get('[data-testid="tool-pipe"]').click();
    cy.get('[data-testid="junction-0"]').click();
    cy.get('[data-testid="junction-1"]').click();
    
    cy.get('[data-testid^="pipe-"]').should('have.length', 1);
  });

  it('should edit element properties', () => {
    // Create and select junction
    cy.get('[data-testid="tool-junction"]').click();
    cy.get('[data-testid="network-canvas"]').click(100, 100);
    cy.get('[data-testid="junction-0"]').click();
    
    // Edit properties
    cy.get('[data-testid="elevation-input"]').clear().type('150');
    cy.get('[data-testid="apply-changes"]').click();
    
    // Verify change
    cy.get('[data-testid="elevation-input"]').should('have.value', '150');
  });

  it('should run simulation', () => {
    // Create simple network
    cy.createSimpleNetwork();
    
    // Run simulation
    cy.get('[data-testid="run-simulation-btn"]').click();
    
    // Wait for results
    cy.get('[data-testid="simulation-complete"]', { timeout: 30000 })
      .should('be.visible');
    
    // Check results panel
    cy.get('[data-testid="results-panel"]').should('be.visible');
  });

  it('should export to INP file', () => {
    cy.createSimpleNetwork();
    
    cy.get('[data-testid="export-btn"]').click();
    cy.get('[data-testid="export-inp-option"]').click();
    
    // Verify download
    cy.readFile('cypress/downloads/network.inp').should('exist');
  });
});
```

---

## 📋 Fixtures و Mock Data

### ملفات INP نموذجية

```ini
; tests/fixtures/inp-files/simple-network.inp
[TITLE]
Simple Test Network

[JUNCTIONS]
;ID       Elevation   Demand
 J1       100         50
 J2       120         75
 J3       110         60

[RESERVOIRS]
;ID       Head
 R1       150

[TANKS]
;ID       Elevation   InitLevel   MinLevel   MaxLevel   Diameter
 T1       130         50          10         100        20

[PIPES]
;ID       Node1   Node2   Length   Diameter   Roughness
 P1       R1      J1      500      200        100
 P2       J1      J2      400      150        100
 P3       J2      J3      400      150        100
 P4       J3      T1      500      200        100

[PUMPS]
;ID       Node1   Node2   Properties
 Pump1    R1      J1      HEAD 1

[CURVES]
;ID       X-Value   Y-Value
 1        0         150
 1        100       120
 1        200       80

[OPTIONS]
 Units    GPM
 Headloss D-W

[TIMES]
 Duration 24:00
 Hydraulic Timestep 1:00
 Quality Timestep 0:15
 Pattern Timestep 1:00
 Pattern Start 0:00
 Report Timestep 1:00
 Report Start 0:00
 Start ClockTime 12:00 AM
 Statistic NONE

[END]
```

### Mock Handlers

```typescript
// tests/mocks/epanet-js.ts
import { vi } from 'vitest';

export const mockEpanetJs = {
  Workspace: vi.fn().mockImplementation(() => ({
    writeFile: vi.fn(),
    readFile: vi.fn(),
  })),
  
  Project: vi.fn().mockImplementation(() => ({
    open: vi.fn(),
    solveH: vi.fn(),
    close: vi.fn(),
    setOption: vi.fn(),
    getNodeResult: vi.fn().mockReturnValue({ pressure: 50 }),
    getLinkResult: vi.fn().mockReturnValue({ flow: 100 }),
  })),
  
  InitHydOption: {
    SaveAndInit: 0,
    NoSave: 1,
  },
  
  Option: {
    Duration: 'DURATION',
    HydraulicTimestep: 'HYDSTEP',
  },
};

// Mock the module
vi.mock('epanet-js', () => mockEpanetJs);
```

---

## 🎯 تغطية الاختبارات المستهدفة

| النوع | التغطية المستهدفة | الأولوية |
|-------|------------------|----------|
| Unit Tests | 80% | عالية |
| Integration Tests | 70% | عالية |
| E2E Tests | 60% | متوسطة |
| Component Tests | 85% | عالية |
| Store Tests | 90% | عالية |

---

## 🚀 تشغيل الاختبارات

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- NetworkCanvas.test.tsx

# Run with UI
npm run test:ui
```

---

**إعداد:** فريق الجودة  
**الإصدار:** 1.0  
**تاريخ التحديث:** فبراير 2026
