import { useSimulationStore, useVisualizationStore } from '../store';

interface AnimationControlsProps {
  className?: string;
}

export function AnimationControls({ className = '' }: AnimationControlsProps) {
  const { 
    results, 
    currentTime, 
    isPlaying, 
    playbackSpeed,
    setCurrentTime, 
    playAnimation, 
    pauseAnimation, 
    setPlaybackSpeed 
  } = useSimulationStore();
  
  const { flowAnimationSpeed } = useVisualizationStore();

  if (!results) return null;

  const maxTime = results.timePeriods.length - 1;
  const currentTimeValue = results.timePeriods[currentTime] || 0;

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseAnimation();
    } else {
      playAnimation();
    }
  };

  const handleStepForward = () => {
    if (currentTime < maxTime) {
      setCurrentTime(currentTime + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentTime > 0) {
      setCurrentTime(currentTime - 1);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          التحكم في الرسوم المتحركة
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          الوقت: {currentTimeValue.toFixed(2)} ساعة
        </span>
      </div>

      {/* شريط التقدم */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={maxTime}
          value={currentTime}
          onChange={(e) => setCurrentTime(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>0 ساعة</span>
          <span>{(results.timePeriods[maxTime] || 0).toFixed(2)} ساعة</span>
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          onClick={handleStepBackward}
          disabled={currentTime === 0}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          title="الخطوة السابقة"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={handlePlayPause}
          className="p-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleStepForward}
          disabled={currentTime === maxTime}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          title="الخطوة التالية"
        >
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* التحكم في السرعة */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
          السرعة:
        </span>
        <div className="flex gap-2">
          {[0.5, 1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                playbackSpeed === speed
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* معلومات إضافية */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            الإطار الحالي: {currentTime + 1} / {maxTime + 1}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            سرعة التدفق: {flowAnimationSpeed}x
          </div>
        </div>
      </div>
    </div>
  );
}
