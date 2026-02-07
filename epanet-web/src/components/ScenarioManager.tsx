import { useState, useMemo } from 'react';
import { useNetworkStore } from '../store';
import type { NetworkElement } from '../types';

interface Scenario {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  network: {
    junctions: Map<string, any>;
    reservoirs: Map<string, any>;
    tanks: Map<string, any>;
    pipes: Map<string, any>;
    pumps: Map<string, any>;
    valves: Map<string, any>;
  };
}

interface ScenarioManagerProps {
  className?: string;
}

export function ScenarioManager({ className = '' }: ScenarioManagerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');
  
  const {
    junctions,
    reservoirs,
    tanks,
    pipes,
    pumps,
    valves,
  } = useNetworkStore();

  // حفظ السيناريو الحالي
  const saveCurrentScenario = () => {
    const scenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: newScenarioName || `سيناريو ${scenarios.length + 1}`,
      description: newScenarioDescription,
      createdAt: new Date(),
      network: {
        junctions: new Map(junctions),
        reservoirs: new Map(reservoirs),
        tanks: new Map(tanks),
        pipes: new Map(pipes),
        pumps: new Map(pumps),
        valves: new Map(valves),
      },
    };
    
    setScenarios(prev => [...prev, scenario]);
    setShowCreateDialog(false);
    setNewScenarioName('');
    setNewScenarioDescription('');
  };

  // تحميل السيناريو
  const loadScenario = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    // TODO: تنفيذ تحميل الشبكة من السيناريو
    setSelectedScenarioId(scenarioId);
  };

  // حذف السيناريو
  const deleteScenario = (scenarioId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا السيناريو؟')) {
      setScenarios(prev => prev.filter(s => s.id !== scenarioId));
      if (selectedScenarioId === scenarioId) {
        setSelectedScenarioId(null);
      }
    }
  };

  // نسخ السيناريو
  const duplicateScenario = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    const newScenario: Scenario = {
      ...scenario,
      id: `scenario-${Date.now()}`,
      name: `${scenario.name} (نسخة)`,
      createdAt: new Date(),
    };

    setScenarios(prev => [...prev, newScenario]);
  };

  // مقارنة السيناريوهات
  const compareScenarios = (scenarioId1: string, scenarioId2: string) => {
    const scenario1 = scenarios.find(s => s.id === scenarioId1);
    const scenario2 = scenarios.find(s => s.id === scenarioId2);
    
    if (!scenario1 || !scenario2) return;

    // TODO: تنفيذ مقارنة السيناريوهات
    alert(`مقارنة بين "${scenario1.name}" و "${scenario2.name}"`);
  };

  const selectedScenario = useMemo(() => 
    scenarios.find(s => s.id === selectedScenarioId), 
    [scenarios, selectedScenarioId]
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
      {/* الرأس */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            مدير السيناريوهات
          </h3>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            + سيناريو جديد
          </button>
        </div>
        
        {/* إحصائيات */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">إجمالي السيناريوهات</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{scenarios.length}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">السيناريو النشط</div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {selectedScenario ? selectedScenario.name : 'لا يوجد'}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">آخر تحديث</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {scenarios.length > 0 
                ? new Date(Math.max(...scenarios.map(s => s.createdAt.getTime()))).toLocaleDateString('ar-EG')
                : '-'
              }
            </div>
          </div>
        </div>
      </div>

      {/* قائمة السيناريوهات */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {scenarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-3">📁</div>
            <p className="text-sm">لا توجد سيناريوهات محفوظة</p>
            <p className="text-xs mt-2">أنشئ سيناريو جديد للبدء</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scenarios.map(scenario => (
              <div
                key={scenario.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedScenarioId === scenario.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {scenario.name}
                    </h4>
                    {scenario.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {scenario.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => loadScenario(scenario.id)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="تحميل السيناريو"
                    >
                      📥
                    </button>
                    <button
                      onClick={() => duplicateScenario(scenario.id)}
                      className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                      title="نسخ السيناريو"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => deleteScenario(scenario.id)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="حذف السيناريو"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    تم الإنشاء: {scenario.createdAt.toLocaleDateString('ar-EG')}
                  </span>
                  <span>
                    {scenario.network.junctions.size + 
                     scenario.network.reservoirs.size + 
                     scenario.network.tanks.size} عقد | 
                    {scenario.network.pipes.size + 
                     scenario.network.pumps.size + 
                     scenario.network.valves.size} روابط
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* أزرار الإجراءات */}
      {scenarios.length >= 2 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            مقارنة السيناريوهات
          </h4>
          <div className="flex gap-2">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  const [id1, id2] = e.target.value.split(',');
                  compareScenarios(id1, id2);
                }
              }}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">اختر سيناريوهات للمقارنة</option>
              {scenarios.map((s1, i) => 
                scenarios.slice(i + 1).map(s2 => (
                  <option key={`${s1.id},${s2.id}`} value={`${s1.id},${s2.id}`}>
                    {s1.name} vs {s2.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      )}

      {/* نافذة إنشاء سيناريو جديد */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              إنشاء سيناريو جديد
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اسم السيناريو
                </label>
                <input
                  type="text"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="مثال: سيناريو التشغيل العادي"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الوصف (اختياري)
                </label>
                <textarea
                  value={newScenarioDescription}
                  onChange={(e) => setNewScenarioDescription(e.target.value)}
                  placeholder="وصف موجز للسيناريو..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
              >
                إلغاء
              </button>
              <button
                onClick={saveCurrentScenario}
                disabled={!newScenarioName.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
              >
                حفظ السيناريو
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
