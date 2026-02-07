import { useSimulationStore } from '../store/simulationStore';

export function SimulationPanel() {
  const {
    isRunning,
    progress,
    error,
    options,
    results,
    currentTime,
    isPlaying,
    setOptions,
    runSimulation,
    stopSimulation,
    setCurrentTime,
    playAnimation,
    pauseAnimation,
    setPlaybackSpeed,
  } = useSimulationStore();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 w-80">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">إعدادات المحاكاة</h3>

      {/* خيارات الوحدات والمعادلات */}
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الوحدات والمعادلات</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">وحدات التدفق</label>
            <select
              value={options.flowUnits}
              onChange={(e) => setOptions({ flowUnits: e.target.value as typeof options.flowUnits })}
              disabled={isRunning}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="LPS">LPS - لتر/ثانية</option>
              <option value="LPM">LPM - لتر/دقيقة</option>
              <option value="CMH">CMH - م³/ساعة</option>
              <option value="CMD">CMD - م³/يوم</option>
              <option value="GPM">GPM - غالون/دقيقة (أمريكي)</option>
              <option value="CFS">CFS - قدم³/ثانية</option>
              <option value="MGD">MGD - مليون غالون/يوم</option>
              <option value="IMGD">IMGD - مليون غالون/يوم (إمبراطوري)</option>
              <option value="AFD">AFD - فدان-قدم/يوم</option>
              <option value="MLD">MLD - مليون لتر/يوم</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">معادلة فقد الرأس</label>
            <select
              value={options.headlossFormula}
              onChange={(e) => setOptions({ headlossFormula: e.target.value as typeof options.headlossFormula })}
              disabled={isRunning}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="HW">Hazen-Williams</option>
              <option value="DW">Darcy-Weisbach</option>
              <option value="CM">Chezy-Manning</option>
            </select>
          </div>
        </div>
      </div>

      {/* خيارات المحاكاة */}
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">خيارات المحاكاة</h4>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            المدة (ساعات)
          </label>
          <input
            type="number"
            value={options.duration}
            onChange={(e) => setOptions({ duration: parseFloat(e.target.value) })}
            disabled={isRunning}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الخطوة الزمنية الهيدروليكية (ساعات)
          </label>
          <input
            type="number"
            step="0.25"
            value={options.hydraulicTimestep}
            onChange={(e) => setOptions({ hydraulicTimestep: parseFloat(e.target.value) })}
            disabled={isRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epanet-primary disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            عدد المحاولات
          </label>
          <input
            type="number"
            value={options.trials}
            onChange={(e) => setOptions({ trials: parseInt(e.target.value) })}
            disabled={isRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epanet-primary disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الدقة
          </label>
          <input
            type="number"
            step="0.0001"
            value={options.accuracy}
            onChange={(e) => setOptions({ accuracy: parseFloat(e.target.value) })}
            disabled={isRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-epanet-primary disabled:bg-gray-100"
          />
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="flex gap-2 mb-4">
        {!isRunning ? (
          <button
            onClick={runSimulation}
            className="flex-1 bg-epanet-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>▶</span> تشغيل
          </button>
        ) : (
          <button
            onClick={stopSimulation}
            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>⏹</span> إيقاف
          </button>
        )}
      </div>

      {/* شريط التقدم */}
      {isRunning && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-epanet-primary h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center">{progress}%</p>
        </div>
      )}

      {/* رسالة الخطأ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {/* نتائج المحاكاة */}
      {results && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-3">النتائج</h4>
          
          {/* شريط الوقت */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوقت: {currentTime} ساعة
            </label>
            <input
              type="range"
              min="0"
              max={results.timePeriods.length - 1}
              value={currentTime}
              onChange={(e) => setCurrentTime(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* أزرار التحكم في الرسوم المتحركة */}
          <div className="flex gap-2 mb-3">
            {!isPlaying ? (
              <button
                onClick={playAnimation}
                className="flex-1 bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                ▶ تشغيل
              </button>
            ) : (
              <button
                onClick={pauseAnimation}
                className="flex-1 bg-yellow-500 text-white px-3 py-1.5 rounded-md hover:bg-yellow-600 transition-colors text-sm"
              >
                ⏸ إيقاف مؤقت
              </button>
            )}
          </div>

          {/* سرعة التشغيل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              السرعة: {useSimulationStore.getState().playbackSpeed}x
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={useSimulationStore.getState().playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
