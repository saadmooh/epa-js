import { useVisualizationStore, useSimulationStore, useNetworkStore } from '../store';

export function VisualizationPanel() {
  const {
    showFlowDirection,
    flowArrowSize,
    showPressureColors,
    showVelocityColors,
    pressureMin,
    pressureMax,
    velocityMin,
    velocityMax,
    showNodeLabels,
    showPipeLabels,
    showPressureLabels,
    showFlowLabels,
    showVelocityLabels,
    labelFontSize,
    showLegend,
    showScaleBar,
    setShowFlowDirection,
    setFlowArrowSize,
    setShowPressureColors,
    setShowVelocityColors,
    setPressureRange,
    setVelocityRange,
    setShowNodeLabels,
    setShowPipeLabels,
    setShowPressureLabels,
    setShowFlowLabels,
    setShowVelocityLabels,
    setLabelFontSize,
    setShowLegend,
    setShowScaleBar,
    resetToDefaults,
  } = useVisualizationStore();

  const { results } = useSimulationStore();
  const { exportToInp } = useNetworkStore();

  // تصدير النتائج إلى CSV
  const exportToCSV = () => {
    if (!results) return;

    let csv = 'Node Results\n';
    csv += 'Node ID,Time (h),Pressure (m),Head (m),Demand (L/s)\n';
    
    results.nodeResults.forEach((nodeResult, nodeId) => {
      nodeResult.pressure.forEach((pressure, timeIndex) => {
        const time = results.timePeriods[timeIndex];
        const head = nodeResult.head[timeIndex] || 0;
        const demand = nodeResult.demand[timeIndex] || 0;
        csv += `${nodeId},${time},${pressure.toFixed(2)},${head.toFixed(2)},${demand.toFixed(2)}\n`;
      });
    });

    csv += '\nLink Results\n';
    csv += 'Link ID,Time (h),Flow (L/s),Velocity (m/s),Headloss (m)\n';
    
    results.linkResults.forEach((linkResult, linkId) => {
      linkResult.flow.forEach((flow, timeIndex) => {
        const time = results.timePeriods[timeIndex];
        const velocity = linkResult.velocity[timeIndex] || 0;
        const headloss = linkResult.headloss[timeIndex] || 0;
        csv += `${linkId},${time},${flow.toFixed(2)},${velocity.toFixed(2)},${headloss.toFixed(2)}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'epanet-results.csv';
    link.click();
  };

  // تصدير الشبكة إلى INP
  const handleExportInp = () => {
    const inp = exportToInp();
    const blob = new Blob([inp], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'network.inp';
    link.click();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 w-80 max-h-[calc(100vh-100px)] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">إعدادات العرض</h3>

      {/* أسهم التدفق */}
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">أسهم التدفق</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showFlowDirection"
              checked={showFlowDirection}
              onChange={(e) => setShowFlowDirection(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="showFlowDirection" className="text-sm text-gray-700">إظهار اتجاه التدفق</label>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">حجم السهم</label>
            <input
              type="range"
              min="4"
              max="16"
              value={flowArrowSize}
              onChange={(e) => setFlowArrowSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* التلوين حسب القيم */}
      <div className="bg-green-50 p-3 rounded-lg mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">التلوين حسب القيم</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPressureColors"
              checked={showPressureColors}
              onChange={(e) => setShowPressureColors(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="showPressureColors" className="text-sm text-gray-700">تلوين حسب الضغط</label>
          </div>
          {showPressureColors && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">الحد الأدنى (m)</label>
                <input
                  type="number"
                  value={pressureMin}
                  onChange={(e) => setPressureRange(parseFloat(e.target.value), pressureMax)}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">الحد الأقصى (m)</label>
                <input
                  type="number"
                  value={pressureMax}
                  onChange={(e) => setPressureRange(pressureMin, parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="showVelocityColors"
              checked={showVelocityColors}
              onChange={(e) => setShowVelocityColors(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="showVelocityColors" className="text-sm text-gray-700">تلوين حسب السرعة</label>
          </div>
          {showVelocityColors && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">الحد الأدنى (m/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={velocityMin}
                  onChange={(e) => setVelocityRange(parseFloat(e.target.value), velocityMax)}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">الحد الأقصى (m/s)</label>
                <input
                  type="number"
                  step="0.1"
                  value={velocityMax}
                  onChange={(e) => setVelocityRange(velocityMin, parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* الملصقات */}
      <div className="bg-yellow-50 p-3 rounded-lg mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">الملصقات</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showNodeLabels"
              checked={showNodeLabels}
              onChange={(e) => setShowNodeLabels(e.target.checked)}
              className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="showNodeLabels" className="text-sm text-gray-700">أسماء العقد</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPipeLabels"
              checked={showPipeLabels}
              onChange={(e) => setShowPipeLabels(e.target.checked)}
              className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="showPipeLabels" className="text-sm text-gray-700">أسماء الأنابيب</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showPressureLabels"
              checked={showPressureLabels}
              onChange={(e) => setShowPressureLabels(e.target.checked)}
              className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="showPressureLabels" className="text-sm text-gray-700">قيم الضغط</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showFlowLabels"
              checked={showFlowLabels}
              onChange={(e) => setShowFlowLabels(e.target.checked)}
              className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="showFlowLabels" className="text-sm text-gray-700">قيم التدفق</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showVelocityLabels"
              checked={showVelocityLabels}
              onChange={(e) => setShowVelocityLabels(e.target.checked)}
              className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="showVelocityLabels" className="text-sm text-gray-700">قيم السرعة</label>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">حجم الخط</label>
            <input
              type="range"
              min="8"
              max="16"
              value={labelFontSize}
              onChange={(e) => setLabelFontSize(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* عناصر الخريطة */}
      <div className="bg-purple-50 p-3 rounded-lg mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">عناصر الخريطة</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showLegend"
              checked={showLegend}
              onChange={(e) => setShowLegend(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="showLegend" className="text-sm text-gray-700">وسيلة الإيضاح</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showScaleBar"
              checked={showScaleBar}
              onChange={(e) => setShowScaleBar(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="showScaleBar" className="text-sm text-gray-700">مقياس الرسم</label>
          </div>
        </div>
      </div>

      {/* التصدير */}
      {results && (
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">تصدير النتائج</h4>
          <button
            onClick={exportToCSV}
            className="w-full bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors text-sm mb-2"
          >
            📊 تصدير CSV
          </button>
          <button
            onClick={handleExportInp}
            className="w-full bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm"
          >
            📄 تصدير INP
          </button>
        </div>
      )}

      {/* إعادة التعيين */}
      <button
        onClick={resetToDefaults}
        className="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm"
      >
        🔄 إعادة التعيين
      </button>
    </div>
  );
}
