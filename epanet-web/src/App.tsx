import { useState } from 'react';
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
import { useNetworkStore } from './store/networkStore';
import type { ElementType } from './types';

function App() {
  const [selectedTool, setSelectedTool] = useState<ElementType | 'select'>('select');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'properties' | 'simulation' | 'visualization' | 'results' | 'browser' | 'scenarios'>('properties');

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
      {/* شريط العنوان */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold">
            💧
          </div>
          <h1 className="text-xl font-bold text-gray-800">EPANET Web</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="تراجع (Ctrl+Z)"
          >
            ↩️ تراجع
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="إعادة (Ctrl+Y)"
          >
            ↪️ إعادة
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={fitView}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            تكيف العرض
          </button>
          <button
            onClick={handleImport}
            className="px-3 py-1.5 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
          >
            استيراد INP
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-sm bg-epanet-primary text-white hover:bg-blue-700 rounded-md transition-colors"
          >
            تصدير INP
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors"
          >
            مسح
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
    </div>
  );
}

export default App;
