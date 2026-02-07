import { useState, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { NetworkCanvas } from './components/NetworkCanvas';
import { PropertyPanel } from './components/PropertyPanel';
import { SimulationPanel } from './components/SimulationPanel';
import { VisualizationPanel } from './components/VisualizationPanel';
import { ResultsTable } from './components/ResultsTable';
import { ResultsChart } from './components/ResultsChart';
import { AnimationControls } from './components/AnimationControls';
import { MiniMap } from './components/MiniMap';
import { ElementBrowser } from './components/ElementBrowser';
import { ScenarioManager } from './components/ScenarioManager';
import { MenuBar } from './components/ui/MenuBar';
import { SettingsModal } from './components/ui/SettingsModal';
import type { Settings } from './components/ui/SettingsModal';
import { AboutModal } from './components/ui/AboutModal';
import { Dialog } from './components/ui/Dialog';
import { useNetworkStore } from './store/networkStore';
import type { ElementType } from './types';

function App() {
  const [selectedTool, setSelectedTool] = useState<ElementType | 'select'>('select');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'properties' | 'simulation' | 'visualization' | 'results' | 'browser' | 'scenarios'>('properties');
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    language: 'en',
    autoSave: true,
    showGrid: true,
    showLegend: true,
    animationSpeed: 1,
    defaultUnits: 'metric',
  });

  const getElementById = useNetworkStore((state) => state.getElementById);
  const clearNetwork = useNetworkStore((state) => state.clearNetwork);
  const exportToInp = useNetworkStore((state) => state.exportToInp);
  const fitView = useNetworkStore((state) => state.fitView);
  const undo = useNetworkStore((state) => state.undo);
  const redo = useNetworkStore((state) => state.redo);
  const canUndo = useNetworkStore((state) => state.canUndo);
  const canRedo = useNetworkStore((state) => state.canRedo);
  const importFromInp = useNetworkStore((state) => state.importFromInp);
  const panView = useNetworkStore((state) => state.panView);

  const selectedElement = selectedElementId ? (getElementById(selectedElementId) ?? null) : null;

  const handleElementSelect = (id: string, type: ElementType) => {
    setSelectedElementId(id);
    setActivePanel('properties');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+N: New
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleClear();
      }
      // Ctrl+O: Open
      else if (e.ctrlKey && e.key === 'o') {
        e.preventDefault();
        handleImport();
      }
      // Ctrl+S: Save
      else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleExport();
      }
      // Ctrl+Z: Undo
      else if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      // Ctrl+Y: Redo
      else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      // F1: Documentation
      else if (e.key === 'F1') {
        e.preventDefault();
        window.open('https://www.epa.gov/water-research/epanet', '_blank');
      }
      // F5: Run simulation
      else if (e.key === 'F5' && !e.shiftKey) {
        e.preventDefault();
        handleRunSimulation();
      }
      // Shift+F5: Stop simulation
      else if (e.key === 'F5' && e.shiftKey) {
        e.preventDefault();
        handleStopSimulation();
      }
      // Escape: Close modals
      else if (e.key === 'Escape') {
        setShowSettings(false);
        setShowAbout(false);
        setShowExitDialog(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleRunSimulation = () => {
    setIsSimulationRunning(true);
    // TODO: Implement actual simulation logic
  };

  const handleStopSimulation = () => {
    setIsSimulationRunning(false);
    // TODO: Implement actual stop logic
  };

  const handleResetSimulation = () => {
    setIsSimulationRunning(false);
    // TODO: Implement actual reset logic
  };

  const handleSaveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    setShowGrid(newSettings.showGrid);
    setShowLegend(newSettings.showLegend);
  };

  const handleViewportClick = (x: number, y: number) => {
    panView(x, y);
  };

  const handleExport = () => {
    const inpContent = exportToInp();
    const blob = new Blob([inpContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'network.inp';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('هل أنت متأكد من مسح الشبكة؟')) {
      clearNetwork();
      setSelectedElementId(null);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.inp';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          importFromInp(content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100" dir="rtl">
      {/* Menu Bar */}
      <MenuBar
        onNew={handleClear}
        onOpen={handleImport}
        onSave={handleExport}
        onExport={handleExport}
        onImport={handleImport}
        onExit={() => setShowExitDialog(true)}
        onUndo={undo}
        onRedo={redo}
        onDelete={handleClear}
        onSelectAll={() => {}}
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        onFitToScreen={fitView}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onToggleLegend={() => setShowLegend(!showLegend)}
        onToolSelect={(tool) => setSelectedTool(tool as ElementType | 'select')}
        onRunSimulation={handleRunSimulation}
        onStopSimulation={handleStopSimulation}
        onResetSimulation={handleResetSimulation}
        onSimulationOptions={() => setShowSettings(true)}
        onDocumentation={() => window.open('https://www.epa.gov/water-research/epanet', '_blank')}
        onAbout={() => setShowAbout(true)}
        onKeyboardShortcuts={() => setShowAbout(true)}
        canUndo={canUndo()}
        canRedo={canRedo()}
        showGrid={showGrid}
        showLegend={showLegend}
        isSimulationRunning={isSimulationRunning}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold">
            💧
          </div>
          <h1 className="text-xl font-bold text-gray-800">EPANET Web</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            title="Settings"
          >
            ⚙️ Settings
          </button>
        </div>
      </header>

      {/* المنطقة الرئيسية */}
      <div className="flex-1 flex overflow-hidden">
        {/* الشريط الجانبي الأيسر - الأدوات */}
        <div className="w-16 bg-white border-l border-gray-200 p-2 flex flex-col items-center gap-2">
          <Toolbar selectedTool={selectedTool} onToolSelect={setSelectedTool} />
        </div>

        {/* منطقة الرسم */}
        <div className="flex-1 relative">
          <NetworkCanvas
            selectedTool={selectedTool}
            onElementSelect={setSelectedElementId}
            selectedElementId={selectedElementId}
          />
        </div>

         {/* الشريط الجانبي الأيمن - الخصائص والمحاكاة */}
         <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
           {/* تبويبات التنقل */}
           <div className="flex border-b border-gray-200">
             <button
               onClick={() => setActivePanel('properties')}
               className={`flex-1 py-3 text-sm font-medium transition-colors ${
                 activePanel === 'properties'
                   ? 'text-epanet-primary border-b-2 border-epanet-primary'
                   : 'text-gray-600 hover:text-gray-800'
               }`}
             >
               الخصائص
             </button>
             <button
               onClick={() => setActivePanel('simulation')}
               className={`flex-1 py-3 text-sm font-medium transition-colors ${
                 activePanel === 'simulation'
                   ? 'text-epanet-primary border-b-2 border-epanet-primary'
                   : 'text-gray-600 hover:text-gray-800'
               }`}
             >
               المحاكاة
             </button>
             <button
               onClick={() => setActivePanel('visualization')}
               className={`flex-1 py-3 text-sm font-medium transition-colors ${
                 activePanel === 'visualization'
                   ? 'text-epanet-primary border-b-2 border-epanet-primary'
                   : 'text-gray-600 hover:text-gray-800'
               }`}
             >
               العرض
             </button>
             <button
               onClick={() => setActivePanel('results')}
               className={`flex-1 py-3 text-sm font-medium transition-colors ${
                 activePanel === 'results'
                   ? 'text-epanet-primary border-b-2 border-epanet-primary'
                   : 'text-gray-600 hover:text-gray-800'
               }`}
             >
               النتائج
             </button>
             <button
               onClick={() => setActivePanel('browser')}
               className={`flex-1 py-3 text-sm font-medium transition-colors ${
                 activePanel === 'browser'
                   ? 'text-epanet-primary border-b-2 border-epanet-primary'
                   : 'text-gray-600 hover:text-gray-800'
               }`}
             >
               المستعرض
             </button>
             <button
               onClick={() => setActivePanel('scenarios')}
               className={`flex-1 py-3 text-sm font-medium transition-colors ${
                 activePanel === 'scenarios'
                   ? 'text-epanet-primary border-b-2 border-epanet-primary'
                   : 'text-gray-600 hover:text-gray-800'
               }`}
             >
               السيناريوهات
             </button>
           </div>

           {/* المحتوى */}
           <div className="flex-1 overflow-y-auto p-4">
             {activePanel === 'properties' && <PropertyPanel selectedElement={selectedElement} />}
             {activePanel === 'simulation' && (
               <div className="space-y-4">
                 <SimulationPanel />
                 <AnimationControls />
               </div>
             )}
             {activePanel === 'visualization' && (
               <div className="space-y-4">
                 <VisualizationPanel />
                 <MiniMap onViewportClick={handleViewportClick} />
               </div>
             )}
             {activePanel === 'results' && (
               <div className="space-y-4">
                 <ResultsChart />
                 <ResultsTable />
               </div>
             )}
             {activePanel === 'browser' && (
               <ElementBrowser onElementSelect={handleElementSelect} />
             )}
             {activePanel === 'scenarios' && (
               <ScenarioManager />
             )}
           </div>
         </div>
      </div>

      {/* شريط الحالة */}
      <footer className="bg-white border-t border-gray-200 px-4 py-2 text-sm text-gray-600 flex justify-between items-center">
        <div>
          العناصر: {useNetworkStore.getState().getAllElements().length} |
          العقد: {useNetworkStore.getState().getAllNodes().length} |
          الروابط: {useNetworkStore.getState().getAllLinks().length}
        </div>
        <div>
          {selectedElement ? `المحدد: ${selectedElement.id}` : 'لا يوجد عنصر محدد'}
        </div>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        initialSettings={settings}
      />

      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      <Dialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={() => {
          setShowExitDialog(false);
          handleClear();
        }}
        title="Exit Application"
        message="Are you sure you want to exit? Any unsaved changes will be lost."
        confirmText="Exit"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default App;
