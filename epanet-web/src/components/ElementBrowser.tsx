import { useState, useMemo } from 'react';
import { useNetworkStore } from '../store';
import type { ElementType } from '../types';

interface ElementBrowserProps {
  className?: string;
  onElementSelect?: (id: string, type: ElementType) => void;
}

type SortField = 'id' | 'type' | 'x' | 'y';
type SortOrder = 'asc' | 'desc';

export function ElementBrowser({ className = '', onElementSelect }: ElementBrowserProps) {
  const { junctions, reservoirs, tanks, pipes, pumps, valves, selectedIds } = useNetworkStore();
  
  const [activeTab, setActiveTab] = useState<ElementType | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // تجميع جميع العناصر
  const allElements = useMemo(() => {
    const elements: Array<{
      id: string;
      type: ElementType;
      x: number;
      y: number;
      data: any;
    }> = [];

    junctions.forEach(j => elements.push({
      id: j.id,
      type: 'junction',
      x: j.coordinates.x,
      y: j.coordinates.y,
      data: j,
    }));

    reservoirs.forEach(r => elements.push({
      id: r.id,
      type: 'reservoir',
      x: r.coordinates.x,
      y: r.coordinates.y,
      data: r,
    }));

    tanks.forEach(t => elements.push({
      id: t.id,
      type: 'tank',
      x: t.coordinates.x,
      y: t.coordinates.y,
      data: t,
    }));

    pipes.forEach(p => {
      const node1 = junctions.get(p.node1) || reservoirs.get(p.node1) || tanks.get(p.node1);
      const node2 = junctions.get(p.node2) || reservoirs.get(p.node2) || tanks.get(p.node2);
      if (node1 && node2) {
        elements.push({
          id: p.id,
          type: 'pipe',
          x: (node1.coordinates.x + node2.coordinates.x) / 2,
          y: (node1.coordinates.y + node2.coordinates.y) / 2,
          data: p,
        });
      }
    });

    pumps.forEach(p => {
      const node1 = junctions.get(p.node1) || reservoirs.get(p.node1) || tanks.get(p.node1);
      const node2 = junctions.get(p.node2) || reservoirs.get(p.node2) || tanks.get(p.node2);
      if (node1 && node2) {
        elements.push({
          id: p.id,
          type: 'pump',
          x: (node1.coordinates.x + node2.coordinates.x) / 2,
          y: (node1.coordinates.y + node2.coordinates.y) / 2,
          data: p,
        });
      }
    });

    valves.forEach(v => {
      const node1 = junctions.get(v.node1) || reservoirs.get(v.node1) || tanks.get(v.node1);
      const node2 = junctions.get(v.node2) || reservoirs.get(v.node2) || tanks.get(v.node2);
      if (node1 && node2) {
        elements.push({
          id: v.id,
          type: 'valve',
          x: (node1.coordinates.x + node2.coordinates.x) / 2,
          y: (node1.coordinates.y + node2.coordinates.y) / 2,
          data: v,
        });
      }
    });

    return elements;
  }, [junctions, reservoirs, tanks, pipes, pumps, valves]);

  // تصفية العناصر
  const filteredElements = useMemo(() => {
    let elements = allElements;

    // تصفية حسب النوع
    if (activeTab !== 'all') {
      elements = elements.filter(e => e.type === activeTab);
    }

    // تصفية حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      elements = elements.filter(e => 
        e.id.toLowerCase().includes(query) ||
        e.type.toLowerCase().includes(query)
      );
    }

    // ترتيب العناصر
    elements.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'x':
          comparison = a.x - b.x;
          break;
        case 'y':
          comparison = a.y - b.y;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return elements;
  }, [allElements, activeTab, searchQuery, sortField, sortOrder]);

  // معالجة النقر على العنصر
  const handleElementClick = (id: string, type: ElementType) => {
    if (onElementSelect) {
      onElementSelect(id, type);
    }
  };

  // معالجة تغيير الترتيب
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // الحصول على اسم النوع بالعربية
  const getTypeName = (type: ElementType): string => {
    const names: Record<ElementType, string> = {
      junction: 'تقاطع',
      reservoir: 'خزان',
      tank: 'صهريج',
      pipe: 'أنبوب',
      pump: 'مضخة',
      valve: 'صمام',
    };
    return names[type];
  };

  // الحصول على لون النوع
  const getTypeColor = (type: ElementType): string => {
    const colors: Record<ElementType, string> = {
      junction: '#3b82f6',
      reservoir: '#22c55e',
      tank: '#f59e0b',
      pipe: '#64748b',
      pump: '#ef4444',
      valve: '#8b5cf6',
    };
    return colors[type];
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
      {/* الرأس */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          مستعرض العناصر
        </h3>
        
        {/* البحث */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="بحث عن عنصر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* التبويبات */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            }`}
          >
            الكل ({allElements.length})
          </button>
          <button
            onClick={() => setActiveTab('junction')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeTab === 'junction'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            }`}
          >
            تقاطعات ({junctions.size})
          </button>
          <button
            onClick={() => setActiveTab('reservoir')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeTab === 'reservoir'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            }`}
          >
            خزانات ({reservoirs.size})
          </button>
          <button
            onClick={() => setActiveTab('tank')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeTab === 'tank'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            }`}
          >
            صهاريج ({tanks.size})
          </button>
          <button
            onClick={() => setActiveTab('pipe')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeTab === 'pipe'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            }`}
          >
            أنابيب ({pipes.size})
          </button>
          <button
            onClick={() => setActiveTab('pump')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeTab === 'pump'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            }`}
          >
            مضخات ({pumps.size})
          </button>
          <button
            onClick={() => setActiveTab('valve')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              activeTab === 'valve'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
            }`}
          >
            صمامات ({valves.size})
          </button>
        </div>
      </div>

      {/* الجدول */}
      <div className="overflow-auto max-h-96">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th
                onClick={() => handleSort('id')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                المعرف {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('type')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                النوع {sortField === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('x')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                X {sortField === 'x' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('y')}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Y {sortField === 'y' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredElements.map((element) => (
              <tr
                key={element.id}
                onClick={() => handleElementClick(element.id, element.type)}
                className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedIds.has(element.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                  {element.id}
                </td>
                <td className="px-4 py-2">
                  <span
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: getTypeColor(element.type) }}
                  >
                    {getTypeName(element.type)}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  {element.x.toFixed(2)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  {element.y.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredElements.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            لا توجد عناصر مطابقة
          </div>
        )}
      </div>

      {/* التذييل */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        عرض {filteredElements.length} من {allElements.length} عنصر
      </div>
    </div>
  );
}
