import { useState, useMemo } from 'react';
import { useSimulationStore, useNetworkStore } from '../store';

export function ResultsChart() {
  const { results, currentTime } = useSimulationStore();
  const { getAllNodes, getAllLinks } = useNetworkStore();
  const [chartType, setChartType] = useState<'pressure' | 'flow' | 'velocity'>('pressure');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  const nodes = getAllNodes();
  const links = getAllLinks();

  // تحديد العناصر المتاحة بناءً على نوع الرسم البياني
  const availableElements = chartType === 'pressure' 
    ? nodes.map(n => ({ id: n.id, name: n.id, type: n.type }))
    : links.map(l => ({ id: l.id, name: l.id, type: l.type }));

  // بيانات الرسم البياني
  const chartData = useMemo(() => {
    if (!results) return [];

    return selectedElements.map(elementId => {
      if (chartType === 'pressure') {
        const nodeResults = results.nodeResults.get(elementId);
        return {
          id: elementId,
          data: nodeResults?.pressure || [],
          label: `${elementId} - الضغط`,
        };
      } else if (chartType === 'flow') {
        const linkResults = results.linkResults.get(elementId);
        return {
          id: elementId,
          data: linkResults?.flow || [],
          label: `${elementId} - التدفق`,
        };
      } else {
        const linkResults = results.linkResults.get(elementId);
        return {
          id: elementId,
          data: linkResults?.velocity || [],
          label: `${elementId} - السرعة`,
        };
      }
    });
  }, [results, selectedElements, chartType]);

  // حساب أبعاد الرسم البياني
  const chartWidth = 600;
  const chartHeight = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // حساب النطاقات
  const allValues = chartData.flatMap(d => d.data);
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 1;
  const minValue = allValues.length > 0 ? Math.min(...allValues, 0) : 0;
  const valueRange = maxValue - minValue || 1;

  const timeSteps = results?.timePeriods || [];

  // دالة تحويل القيم إلى إحداثيات
  const scaleX = (timeIndex: number) => {
    return padding.left + (timeIndex / (timeSteps.length - 1 || 1)) * graphWidth;
  };

  const scaleY = (value: number) => {
    return padding.top + graphHeight - ((value - minValue) / valueRange) * graphHeight;
  };

  // ألوان للخطوط
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (!results) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <div className="text-4xl mb-3">📈</div>
        <p className="text-gray-600">قم بتشغيل المحاكاة أولاً لعرض الرسوم البيانية</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">الرسوم البيانية</h3>

      {/* Chart Type Selection */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            setChartType('pressure');
            setSelectedElements([]);
          }}
          className={`px-3 py-2 rounded-md text-sm transition-colors ${
            chartType === 'pressure'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          الضغط
        </button>
        <button
          onClick={() => {
            setChartType('flow');
            setSelectedElements([]);
          }}
          className={`px-3 py-2 rounded-md text-sm transition-colors ${
            chartType === 'flow'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          التدفق
        </button>
        <button
          onClick={() => {
            setChartType('velocity');
            setSelectedElements([]);
          }}
          className={`px-3 py-2 rounded-md text-sm transition-colors ${
            chartType === 'velocity'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          السرعة
        </button>
      </div>

      {/* Element Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اختر العناصر ({availableElements.length} متاح):
        </label>
        <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto p-2 bg-gray-50 rounded-md">
          {availableElements.map((element) => (
            <button
              key={element.id}
              onClick={() => {
                if (selectedElements.includes(element.id)) {
                  setSelectedElements(selectedElements.filter(id => id !== element.id));
                } else if (selectedElements.length < 6) {
                  setSelectedElements([...selectedElements, element.id]);
                }
              }}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedElements.includes(element.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {element.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          يمكن اختيار حتى 6 عناصر (النقر مرة أخرى لإلغاء التحديد)
        </p>
      </div>

      {/* Chart */}
      {selectedElements.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
          <svg width={chartWidth} height={chartHeight} className="mx-auto">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
              <g key={`grid-${i}`}>
                <line
                  x1={padding.left}
                  y1={padding.top + t * graphHeight}
                  x2={padding.left + graphWidth}
                  y2={padding.top + t * graphHeight}
                  stroke="#e5e7eb"
                  strokeDasharray="4 2"
                />
                <text
                  x={padding.left - 10}
                  y={padding.top + t * graphHeight + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {(maxValue - t * valueRange).toFixed(1)}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
              const timeIndex = Math.floor(t * (timeSteps.length - 1));
              return (
                <text
                  key={`time-${i}`}
                  x={padding.left + t * graphWidth}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {timeSteps[timeIndex] || 0}h
                </text>
              );
            })}

            {/* Data lines */}
            {chartData.map((series, index) => {
              const color = colors[index % colors.length];
              const pathData = series.data
                .map((value, i) => {
                  const x = scaleX(i);
                  const y = scaleY(value);
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ');

              return (
                <g key={series.id}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                  />
                  {series.data.map((value, i) => (
                    <circle
                      key={i}
                      cx={scaleX(i)}
                      cy={scaleY(value)}
                      r={i === currentTime ? 5 : 3}
                      fill={color}
                      stroke="white"
                      strokeWidth={i === currentTime ? 2 : 1}
                    />
                  ))}
                </g>
              );
            })}

            {/* Current time indicator */}
            <line
              x1={scaleX(currentTime)}
              y1={padding.top}
              x2={scaleX(currentTime)}
              y2={padding.top + graphHeight}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="6 3"
              opacity="0.7"
            />

            {/* Axes */}
            <line
              x1={padding.left}
              y1={padding.top + graphHeight}
              x2={padding.left + graphWidth}
              y2={padding.top + graphHeight}
              stroke="#374151"
              strokeWidth="2"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + graphHeight}
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Axis labels */}
            <text
              x={chartWidth / 2}
              y={chartHeight - 5}
              textAnchor="middle"
              fontSize="12"
              fill="#374151"
            >
              الوقت (ساعة)
            </text>
            <text
              x={15}
              y={chartHeight / 2}
              textAnchor="middle"
              fontSize="12"
              fill="#374151"
              transform={`rotate(-90, 15, ${chartHeight / 2})`}
            >
              {chartType === 'pressure' ? 'الضغط (m)' : chartType === 'flow' ? 'التدفق (L/s)' : 'السرعة (m/s)'}
            </text>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {chartData.map((series, index) => (
              <div key={series.id} className="flex items-center gap-2">
                <div
                  className="w-4 h-1 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-xs text-gray-600">{series.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedElements.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          اختر عنصراً واحداً على الأقل لعرض الرسم البياني
        </div>
      )}
    </div>
  );
}
