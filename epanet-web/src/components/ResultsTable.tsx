import { useState } from 'react';
import { useSimulationStore, useNetworkStore } from '../store';

export function ResultsTable() {
  const { results, currentTime } = useSimulationStore();
  const { getAllNodes, getAllLinks } = useNetworkStore();
  const [activeTab, setActiveTab] = useState<'nodes' | 'links'>('nodes');
  const [sortBy, setSortBy] = useState<'id' | 'pressure' | 'flow'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  if (!results) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-gray-600">قم بتشغيل المحاكاة أولاً لعرض النتائج</p>
      </div>
    );
  }

  const nodes = getAllNodes();
  const links = getAllLinks();

  // ترتيب العقد
  const sortedNodes = [...nodes].sort((a, b) => {
    let aValue: string | number = a.id;
    let bValue: string | number = b.id;

    if (sortBy === 'pressure') {
      const aResults = results.nodeResults.get(a.id);
      const bResults = results.nodeResults.get(b.id);
      aValue = aResults?.pressure[currentTime] || 0;
      bValue = bResults?.pressure[currentTime] || 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // ترتيب الروابط
  const sortedLinks = [...links].sort((a, b) => {
    let aValue: string | number = a.id;
    let bValue: string | number = b.id;

    if (sortBy === 'flow') {
      const aResults = results.linkResults.get(a.id);
      const bResults = results.linkResults.get(b.id);
      aValue = Math.abs(aResults?.flow[currentTime] || 0);
      bValue = Math.abs(bResults?.flow[currentTime] || 0);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('nodes')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'nodes'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          العقد ({nodes.length})
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === 'links'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          الروابط ({links.length})
        </button>
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2 mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md"
        >
          <option value="id">الترتيب حسب ID</option>
          {activeTab === 'nodes' && <option value="pressure">الترتيب حسب الضغط</option>}
          {activeTab === 'links' && <option value="flow">الترتيب حسب التدفق</option>}
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          {sortOrder === 'asc' ? '↑ تصاعدي' : '↓ تنازلي'}
        </button>
      </div>

      {/* Time Info */}
      <div className="mb-4 p-2 bg-blue-50 rounded-md text-sm text-blue-800">
        الوقت: {currentTime} ساعة | الخطوة: {currentTime + 1} من {results.timePeriods.length}
      </div>

      {/* Nodes Table */}
      {activeTab === 'nodes' && (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-right font-medium">العقدة</th>
                <th className="px-3 py-2 text-right font-medium">النوع</th>
                <th className="px-3 py-2 text-right font-medium">الضغط (m)</th>
                <th className="px-3 py-2 text-right font-medium">الرأس (m)</th>
                <th className="px-3 py-2 text-right font-medium">الطلب (L/s)</th>
                <th className="px-3 py-2 text-right font-medium">الجودة</th>
              </tr>
            </thead>
            <tbody>
              {sortedNodes.map((node) => {
                const nodeResults = results.nodeResults.get(node.id);
                return (
                  <tr key={node.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{node.id}</td>
                    <td className="px-3 py-2">
                      {node.type === 'junction' && 'عقدة'}
                      {node.type === 'reservoir' && 'خزان رئيسي'}
                      {node.type === 'tank' && 'خزان'}
                    </td>
                    <td className="px-3 py-2">
                      {nodeResults?.pressure[currentTime]?.toFixed(2) || '-'}
                    </td>
                    <td className="px-3 py-2">
                      {nodeResults?.head[currentTime]?.toFixed(2) || '-'}
                    </td>
                    <td className="px-3 py-2">
                      {nodeResults?.demand[currentTime]?.toFixed(2) || '-'}
                    </td>
                    <td className="px-3 py-2">
                      {nodeResults?.quality?.[currentTime]?.toFixed(2) || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Links Table */}
      {activeTab === 'links' && (
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-right font-medium">الرابط</th>
                <th className="px-3 py-2 text-right font-medium">النوع</th>
                <th className="px-3 py-2 text-right font-medium">من</th>
                <th className="px-3 py-2 text-right font-medium">إلى</th>
                <th className="px-3 py-2 text-right font-medium">التدفق (L/s)</th>
                <th className="px-3 py-2 text-right font-medium">السرعة (m/s)</th>
                <th className="px-3 py-2 text-right font-medium">فقد الرأس (m)</th>
                <th className="px-3 py-2 text-right font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {sortedLinks.map((link) => {
                const linkResults = results.linkResults.get(link.id);
                return (
                  <tr key={link.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{link.id}</td>
                    <td className="px-3 py-2">
                      {link.type === 'pipe' && 'أنبوب'}
                      {link.type === 'pump' && 'مضخة'}
                      {link.type === 'valve' && 'صمام'}
                    </td>
                    <td className="px-3 py-2">{link.node1}</td>
                    <td className="px-3 py-2">{link.node2}</td>
                    <td className="px-3 py-2">
                      {linkResults?.flow[currentTime]?.toFixed(2) || '-'}
                    </td>
                    <td className="px-3 py-2">
                      {linkResults?.velocity[currentTime]?.toFixed(2) || '-'}
                    </td>
                    <td className="px-3 py-2">
                      {linkResults?.headloss[currentTime]?.toFixed(2) || '-'}
                    </td>
                    <td className="px-3 py-2">
                      {linkResults?.status[currentTime] || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold mb-2">ملخص النتائج</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {activeTab === 'nodes' && (
            <>
              <div className="bg-blue-50 p-2 rounded">
                <span className="text-gray-600">أقصى ضغط:</span>
                <span className="font-medium mr-1">
                  {Math.max(...nodes.map(n => results.nodeResults.get(n.id)?.pressure[currentTime] || 0)).toFixed(2)} m
                </span>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <span className="text-gray-600">أدنى ضغط:</span>
                <span className="font-medium mr-1">
                  {Math.min(...nodes.map(n => results.nodeResults.get(n.id)?.pressure[currentTime] || Infinity)).toFixed(2)} m
                </span>
              </div>
            </>
          )}
          {activeTab === 'links' && (
            <>
              <div className="bg-green-50 p-2 rounded">
                <span className="text-gray-600">أقصى تدفق:</span>
                <span className="font-medium mr-1">
                  {Math.max(...links.map(l => Math.abs(results.linkResults.get(l.id)?.flow[currentTime] || 0))).toFixed(2)} L/s
                </span>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <span className="text-gray-600">أقصى سرعة:</span>
                <span className="font-medium mr-1">
                  {Math.max(...links.map(l => Math.abs(results.linkResults.get(l.id)?.velocity[currentTime] || 0))).toFixed(2)} m/s
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
