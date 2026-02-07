import { useState } from 'react';
import { useCurveStore } from '../store/curveStore';
import type { CurvePoint } from '../types';

interface CurveEditorProps {
  curveId?: string;
  onSave?: (curveId: string) => void;
  onCancel?: () => void;
}

export function CurveEditor({ curveId, onSave, onCancel }: CurveEditorProps) {
  const { addCurve, updateCurve, getCurveById } = useCurveStore();
  
  const existingCurve = curveId ? getCurveById(curveId) : null;
  const [name, setName] = useState(existingCurve?.name || '');
  const [points, setPoints] = useState<CurvePoint[]>(
    existingCurve?.points || [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 0 },
    ]
  );
  const [editingPoint, setEditingPoint] = useState<number | null>(null);

  const handleAddPoint = () => {
    const lastPoint = points[points.length - 1];
    const newPoint: CurvePoint = {
      x: lastPoint ? lastPoint.x + 10 : 0,
      y: lastPoint ? lastPoint.y : 0,
    };
    setPoints([...points, newPoint].sort((a, b) => a.x - b.x));
  };

  const handleRemovePoint = (index: number) => {
    if (points.length > 2) {
      setPoints(points.filter((_, i) => i !== index));
    }
  };

  const handleUpdatePoint = (index: number, field: 'x' | 'y', value: number) => {
    const newPoints = [...points];
    newPoints[index] = { ...newPoints[index], [field]: value };
    setPoints(newPoints.sort((a, b) => a.x - b.x));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    
    if (curveId) {
      updateCurve(curveId, { name, points });
      onSave?.(curveId);
    } else {
      const newId = addCurve(name, points);
      onSave?.(newId);
    }
  };

  // حساب منطق الرسم البياني
  const chartWidth = 300;
  const chartHeight = 200;
  const padding = 40;
  
  const xMin = Math.min(...points.map(p => p.x));
  const xMax = Math.max(...points.map(p => p.x));
  const yMin = Math.min(...points.map(p => p.y));
  const yMax = Math.max(...points.map(p => p.y));
  
  const xRange = xMax - xMin || 1;
  const yRange = yMax - yMin || 1;
  
  const scaleX = (x: number) => padding + ((x - xMin) / xRange) * (chartWidth - 2 * padding);
  const scaleY = (y: number) => chartHeight - padding - ((y - yMin) / yRange) * (chartHeight - 2 * padding);
  
  const pathData = points.length > 0
    ? `M ${scaleX(points[0].x)} ${scaleY(points[0].y)} ` +
      points.slice(1).map(p => `L ${scaleX(p.x)} ${scaleY(p.y)}`).join(' ')
    : '';

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-[500px]">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {curveId ? 'تعديل المنحنى' : 'منحنى جديد'}
      </h3>

      {/* اسم المنحنى */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنحنى</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: منحنى كفاءة المضخة 1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* الرسم البياني */}
      <div className="mb-4 bg-gray-50 rounded-lg p-4">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          {/* محاور الإحداثيات */}
          <line
            x1={padding}
            y1={chartHeight - padding}
            x2={chartWidth - padding}
            y2={chartHeight - padding}
            stroke="#374151"
            strokeWidth="2"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={chartHeight - padding}
            stroke="#374151"
            strokeWidth="2"
          />
          
          {/* خط الشبكة */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <g key={i}>
              <line
                x1={padding + t * (chartWidth - 2 * padding)}
                y1={padding}
                x2={padding + t * (chartWidth - 2 * padding)}
                y2={chartHeight - padding}
                stroke="#e5e7eb"
                strokeDasharray="4 2"
              />
              <line
                x1={padding}
                y1={padding + t * (chartHeight - 2 * padding)}
                x2={chartWidth - padding}
                y2={padding + t * (chartHeight - 2 * padding)}
                stroke="#e5e7eb"
                strokeDasharray="4 2"
              />
            </g>
          ))}
          
          {/* خط المنحنى */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
            />
          )}
          
          {/* النقاط */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={scaleX(point.x)}
              cy={scaleY(point.y)}
              r={editingPoint === index ? 6 : 4}
              fill={editingPoint === index ? '#ef4444' : '#3b82f6'}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer"
              onClick={() => setEditingPoint(index)}
            />
          ))}
          
          {/* تسميات المحاور */}
          <text x={chartWidth / 2} y={chartHeight - 10} textAnchor="middle" fontSize="12" fill="#6b7280">
            التدفق (L/s)
          </text>
          <text
            x={20}
            y={chartHeight / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
            transform={`rotate(-90, 20, ${chartHeight / 2})`}
          >
            الكفاءة (%)
          </text>
        </svg>
      </div>

      {/* جدول النقاط */}
      <div className="mb-4 max-h-[200px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-right">#</th>
              <th className="px-3 py-2 text-right">التدفق (X)</th>
              <th className="px-3 py-2 text-right">القيمة (Y)</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {points.map((point, index) => (
              <tr
                key={index}
                className={editingPoint === index ? 'bg-blue-50' : 'hover:bg-gray-50'}
                onClick={() => setEditingPoint(index)}
              >
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={point.x}
                    onChange={(e) => handleUpdatePoint(index, 'x', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border rounded text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={point.y}
                    onChange={(e) => handleUpdatePoint(index, 'y', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border rounded text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePoint(index);
                    }}
                    disabled={points.length <= 2}
                    className="text-red-500 hover:text-red-700 disabled:opacity-30"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* أزرار التحكم */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleAddPoint}
          className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 transition-colors text-sm"
        >
          + إضافة نقطة
        </button>
      </div>

      {/* أزرار الحفظ والإلغاء */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          حفظ
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
