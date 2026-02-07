import { useState } from 'react';
import { useNetworkStore, useCurveStore } from '../store';
import type { NetworkElement, Pipe, Junction, Tank, Reservoir, Pump, Valve, SourceQuality } from '../types';
import { 
  JunctionIcon, 
  PipeIcon, 
  ReservoirIcon, 
  TankIcon, 
  PumpIcon, 
  ValveIcon 
} from './NetworkIcons';
import { CurveEditor } from './CurveEditor';

interface PropertyPanelProps {
  selectedElement: NetworkElement | null;
}

export function PropertyPanel({ selectedElement }: PropertyPanelProps) {
  const updateElement = useNetworkStore((state) => state.updateElement);
  const deleteElement = useNetworkStore((state) => state.deleteElement);
  const { getAllCurves, createDefaultEfficiencyCurve, createDefaultHeadCurve } = useCurveStore();
  const [showCurveEditor, setShowCurveEditor] = useState(false);
  const [editingCurveId, setEditingCurveId] = useState<string | undefined>(undefined);
  
  const curves = getAllCurves();

  if (!selectedElement) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm">اختر عنصراً لعرض خصائصه</p>
          <p className="text-xs mt-2 text-gray-300">انقر على أي عنصر في لوحة الرسم</p>
        </div>
      </div>
    );
  }

  const handleChange = (field: string, value: unknown) => {
    updateElement(selectedElement.id, { [field]: value });
  };

  const handleDelete = () => {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      deleteElement(selectedElement.id);
    }
  };

  const getElementIcon = () => {
    const iconProps = { size: 32, className: 'mb-2' };
    switch (selectedElement.type) {
      case 'junction': return <JunctionIcon {...iconProps} />;
      case 'pipe': return <PipeIcon {...iconProps} />;
      case 'reservoir': return <ReservoirIcon {...iconProps} />;
      case 'tank': return <TankIcon {...iconProps} />;
      case 'pump': return <PumpIcon {...iconProps} />;
      case 'valve': return <ValveIcon {...iconProps} />;
      default: return null;
    }
  };

  const getElementName = () => {
    switch (selectedElement.type) {
      case 'junction': return 'عقدة';
      case 'pipe': return 'أنبوب';
      case 'reservoir': return 'خزان رئيسي';
      case 'tank': return 'خزان';
      case 'pump': return 'مضخة';
      case 'valve': return 'صمام';
      default: return '';
    }
  };

  const renderSourceQualityFields = (sourceQuality: SourceQuality | undefined, elementType: string) => (
    <div className="mt-3 space-y-3 border-t border-gray-200 pt-3">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`hasSourceQuality-${elementType}`}
          checked={!!sourceQuality}
          onChange={(e) => {
            if (e.target.checked) {
              handleChange('sourceQuality', { type: 'CONCEN', quality: 0 });
            } else {
              handleChange('sourceQuality', undefined);
            }
          }}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor={`hasSourceQuality-${elementType}`} className="text-sm text-gray-700">جودة مصدر المياه</label>
      </div>
      
      {sourceQuality && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">نوع المصدر</label>
            <select
              value={sourceQuality.type}
              onChange={(e) => handleChange('sourceQuality', { ...sourceQuality, type: e.target.value as SourceQuality['type'] })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CONCEN">CONCEN - تركيز ثابت</option>
              <option value="MASS">MASS - كتلة ثابتة</option>
              <option value="SETPOINT">SETPOINT - نقطة ضبط</option>
              <option value="FLOWPACED">FLOWPACED - متناسب مع التدفق</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الجودة</label>
            <input
              type="number"
              step="0.1"
              value={sourceQuality.quality}
              onChange={(e) => handleChange('sourceQuality', { ...sourceQuality, quality: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">النمط الزمني</label>
            <input
              type="text"
              value={sourceQuality.pattern || ''}
              onChange={(e) => handleChange('sourceQuality', { ...sourceQuality, pattern: e.target.value })}
              placeholder="مثال: 1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderJunctionFields = (junction: Junction) => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الموقع</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الإحداثي X</label>
            <input
              type="number"
              value={Math.round(junction.coordinates.x)}
              onChange={(e) => handleChange('coordinates', { ...junction.coordinates, x: parseFloat(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الإحداثي Y</label>
            <input
              type="number"
              value={Math.round(junction.coordinates.y)}
              onChange={(e) => handleChange('coordinates', { ...junction.coordinates, y: parseFloat(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الخصائص الهيدروليكية</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الارتفاع (م)</label>
            <input
              type="number"
              step="0.1"
              value={junction.elevation}
              onChange={(e) => handleChange('elevation', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الطلب الأساسي (لتر/ثانية)</label>
            <input
              type="number"
              step="0.1"
              value={junction.baseDemand}
              onChange={(e) => handleChange('baseDemand', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">نمط الطلب</label>
            <input
              type="text"
              value={junction.demandPattern || ''}
              onChange={(e) => handleChange('demandPattern', e.target.value)}
              placeholder="مثال: 1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الانبعاث (Emitter)</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">معامل الانبعاث</label>
            <input
              type="number"
              step="0.001"
              value={junction.emitterCoeff || 0}
              onChange={(e) => handleChange('emitterCoeff', parseFloat(e.target.value))}
              placeholder="للرشاشات أو التسربات"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">أس الانبعاث</label>
            <input
              type="number"
              step="0.1"
              value={junction.emitterExponent || 0.5}
              onChange={(e) => handleChange('emitterExponent', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الجودة</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الجودة الأولية</label>
            <input
              type="number"
              step="0.1"
              value={junction.initialQuality || 0}
              onChange={(e) => handleChange('initialQuality', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {renderSourceQualityFields(junction.sourceQuality, 'junction')}
        </div>
      </div>
    </div>
  );

  const renderPipeFields = (pipe: Pipe) => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الخصائص الهندسية</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الطول (م)</label>
            <input
              type="number"
              step="0.1"
              value={pipe.length}
              onChange={(e) => handleChange('length', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">القطر (مم)</label>
            <input
              type="number"
              step="1"
              value={pipe.diameter}
              onChange={(e) => handleChange('diameter', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">معامل الخشونة</label>
            <input
              type="number"
              step="0.1"
              value={pipe.roughness}
              onChange={(e) => handleChange('roughness', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">نوع معامل الخشونة</label>
            <select
              value={pipe.roughnessType || 'HW'}
              onChange={(e) => handleChange('roughnessType', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="HW">HW - Hazen-Williams</option>
              <option value="DW">DW - Darcy-Weisbach</option>
              <option value="CM">CM - Chezy-Manning</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الحالة والخيارات</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الحالة</label>
            <select
              value={pipe.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Open">مفتوح</option>
              <option value="Closed">مغلق</option>
              <option value="CV">صمام عدم رجوع</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="checkValve"
              checked={pipe.checkValve}
              onChange={(e) => handleChange('checkValve', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="checkValve" className="text-sm text-gray-700">صمام عدم رجوع</label>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الخسارة الصغرى</label>
            <input
              type="number"
              step="0.01"
              value={pipe.minorLoss || 0}
              onChange={(e) => handleChange('minorLoss', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">معاملات التفاعل (جودة المياه)</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">معامل التفاعل في القلب (Bulk)</label>
            <input
              type="number"
              step="0.01"
              value={pipe.bulkReactionCoeff || 0}
              onChange={(e) => handleChange('bulkReactionCoeff', parseFloat(e.target.value))}
              placeholder="للتحلل داخل الماء"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">معامل التفاعل على الجدار (Wall)</label>
            <input
              type="number"
              step="0.01"
              value={pipe.wallReactionCoeff || 0}
              onChange={(e) => handleChange('wallReactionCoeff', parseFloat(e.target.value))}
              placeholder="للتفاعل مع جدار الأنبوب"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">العقد المتصلة</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white p-2 rounded border">
            <span className="text-gray-500">من:</span>
            <span className="font-medium mr-1">{pipe.node1}</span>
          </div>
          <div className="bg-white p-2 rounded border">
            <span className="text-gray-500">إلى:</span>
            <span className="font-medium mr-1">{pipe.node2}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTankFields = (tank: Tank) => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الموقع</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الإحداثي X</label>
            <input
              type="number"
              value={Math.round(tank.coordinates.x)}
              onChange={(e) => handleChange('coordinates', { ...tank.coordinates, x: parseFloat(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الإحداثي Y</label>
            <input
              type="number"
              value={Math.round(tank.coordinates.y)}
              onChange={(e) => handleChange('coordinates', { ...tank.coordinates, y: parseFloat(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الخصائص الهندسية</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الارتفاع (م)</label>
            <input
              type="number"
              step="0.1"
              value={tank.elevation}
              onChange={(e) => handleChange('elevation', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">القطر (م)</label>
            <input
              type="number"
              step="0.1"
              value={tank.diameter}
              onChange={(e) => handleChange('diameter', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">مستويات المياه</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">المستوى الأولي (م)</label>
            <input
              type="number"
              step="0.1"
              value={tank.initialLevel}
              onChange={(e) => handleChange('initialLevel', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الحد الأدنى (م)</label>
            <input
              type="number"
              step="0.1"
              value={tank.minimumLevel}
              onChange={(e) => handleChange('minimumLevel', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الحد الأقصى (م)</label>
            <input
              type="number"
              step="0.1"
              value={tank.maximumLevel}
              onChange={(e) => handleChange('maximumLevel', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الحجم والمنحنى</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الحد الأدنى للحجم (م³)</label>
            <input
              type="number"
              step="0.1"
              value={tank.minimumVolume || 0}
              onChange={(e) => handleChange('minimumVolume', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">منحنى الحجم</label>
            <input
              type="text"
              value={tank.volumeCurve || ''}
              onChange={(e) => handleChange('volumeCurve', e.target.value)}
              placeholder="اسم المنحنى"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الاختلاط</h4>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">نموذج الاختلاط</label>
          <select
            value={tank.mixingModel || 'MIX1'}
            onChange={(e) => handleChange('mixingModel', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MIX1">MIX1 - اختلاط كامل</option>
            <option value="MIX2">MIX2 - نموذج ذو حجوم</option>
            <option value="FIFO">FIFO - دخول أولاً خروج أولاً</option>
            <option value="LIFO">LIFO - دخول أخيراً خروج أولاً</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderReservoirFields = (reservoir: Reservoir) => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الموقع</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الإحداثي X</label>
            <input
              type="number"
              value={Math.round(reservoir.coordinates.x)}
              onChange={(e) => handleChange('coordinates', { ...reservoir.coordinates, x: parseFloat(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الإحداثي Y</label>
            <input
              type="number"
              value={Math.round(reservoir.coordinates.y)}
              onChange={(e) => handleChange('coordinates', { ...reservoir.coordinates, y: parseFloat(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الخصائص الهيدروليكية</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الرأس (م)</label>
            <input
              type="number"
              step="0.1"
              value={reservoir.head}
              onChange={(e) => handleChange('head', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">نمط الرأس</label>
            <input
              type="text"
              value={reservoir.headPattern || ''}
              onChange={(e) => handleChange('headPattern', e.target.value)}
              placeholder="مثال: 1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الجودة</h4>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">الجودة الأولية</label>
          <input
            type="number"
            step="0.1"
            value={reservoir.initialQuality || 0}
            onChange={(e) => handleChange('initialQuality', parseFloat(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderPumpFields = (pump: Pump) => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الخصائص</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">نوع المضخة</label>
            <select
              value={pump.properties.type}
              onChange={(e) => handleChange('properties', { ...pump.properties, type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="POWER">POWER - القدرة</option>
              <option value="HEAD">HEAD - منحنى الرأس</option>
            </select>
          </div>
          {pump.properties.type === 'POWER' ? (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">القدرة (كيلوواط)</label>
              <input
                type="number"
                step="0.1"
                value={pump.properties.power || 1}
                onChange={(e) => handleChange('properties', { ...pump.properties, power: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">منحنى الرأس</label>
              <select
                value={pump.properties.headCurve || ''}
                onChange={(e) => handleChange('properties', { ...pump.properties, headCurve: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              >
                <option value="">-- اختر المنحنى --</option>
                {curves.map(curve => (
                  <option key={curve.id} value={curve.id}>{curve.name}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newId = createDefaultHeadCurve();
                    handleChange('properties', { ...pump.properties, headCurve: newId });
                  }}
                  className="flex-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  + منحنى افتراضي
                </button>
                {pump.properties.headCurve && (
                  <button
                    onClick={() => {
                      setEditingCurveId(pump.properties.headCurve);
                      setShowCurveEditor(true);
                    }}
                    className="flex-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                  >
                    ✏️ تعديل
                  </button>
                )}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">السرعة</label>
            <input
              type="number"
              step="0.1"
              value={pump.properties.speed}
              onChange={(e) => handleChange('properties', { ...pump.properties, speed: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الطاقة</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">سعر الطاقة</label>
            <input
              type="number"
              step="0.01"
              value={pump.energy?.price || 0}
              onChange={(e) => handleChange('energy', { ...pump.energy, price: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">منحنى الكفاءة</label>
            <select
              value={pump.energy?.efficiencyCurve || ''}
              onChange={(e) => handleChange('energy', { ...pump.energy, efficiencyCurve: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              <option value="">-- اختر المنحنى --</option>
              {curves.map(curve => (
                <option key={curve.id} value={curve.id}>{curve.name}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newId = createDefaultEfficiencyCurve();
                  handleChange('energy', { ...pump.energy, efficiencyCurve: newId });
                }}
                className="flex-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
              >
                + كفاءة افتراضية
              </button>
              {pump.energy?.efficiencyCurve && (
                <button
                  onClick={() => {
                    setEditingCurveId(pump.energy?.efficiencyCurve);
                    setShowCurveEditor(true);
                  }}
                  className="flex-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                >
                  ✏️ تعديل
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">العقد المتصلة</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white p-2 rounded border">
            <span className="text-gray-500">من:</span>
            <span className="font-medium mr-1">{pump.node1}</span>
          </div>
          <div className="bg-white p-2 rounded border">
            <span className="text-gray-500">إلى:</span>
            <span className="font-medium mr-1">{pump.node2}</span>
          </div>
        </div>
      </div>

      {/* Curve Editor Modal */}
      {showCurveEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CurveEditor
            curveId={editingCurveId}
            onSave={() => {
              setShowCurveEditor(false);
              setEditingCurveId(undefined);
            }}
            onCancel={() => {
              setShowCurveEditor(false);
              setEditingCurveId(undefined);
            }}
          />
        </div>
      )}
    </div>
  );

  const renderValveFields = (valve: Valve) => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الخصائص</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">نوع الصمام</label>
            <select
              value={valve.valveType}
              onChange={(e) => handleChange('valveType', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PRV">PRV - مخفض الضغط</option>
              <option value="PSV">PSV - صمام الضغط الحساس</option>
              <option value="PBV">PBV - صمام الضغط المكسر</option>
              <option value="FCV">FCV - صمام التدفق الثابت</option>
              <option value="TCV">TCV - صمام التحكم بالتقلص</option>
              <option value="GPV">GPV - صمام عام</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">القطر (مم)</label>
            <input
              type="number"
              step="1"
              value={valve.diameter}
              onChange={(e) => handleChange('diameter', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الإعداد</label>
            <input
              type="number"
              step="0.1"
              value={valve.setting}
              onChange={(e) => handleChange('setting', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الحالة</label>
            <select
              value={valve.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Open">مفتوح</option>
              <option value="Closed">مغلق</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">الخسارة الصغرى</label>
            <input
              type="number"
              step="0.01"
              value={valve.minorLoss || 0}
              onChange={(e) => handleChange('minorLoss', parseFloat(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {valve.valveType === 'GPV' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">منحنى الفقد</label>
              <input
                type="text"
                value={valve.lossCurve || ''}
                onChange={(e) => handleChange('lossCurve', e.target.value)}
                placeholder="اسم منحنى الفقد"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">العقد المتصلة</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-white p-2 rounded border">
            <span className="text-gray-500">من:</span>
            <span className="font-medium mr-1">{valve.node1}</span>
          </div>
          <div className="bg-white p-2 rounded border">
            <span className="text-gray-500">إلى:</span>
            <span className="font-medium mr-1">{valve.node2}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFields = () => {
    switch (selectedElement.type) {
      case 'junction':
        return renderJunctionFields(selectedElement as Junction);
      case 'pipe':
        return renderPipeFields(selectedElement as Pipe);
      case 'tank':
        return renderTankFields(selectedElement as Tank);
      case 'reservoir':
        return renderReservoirFields(selectedElement as Reservoir);
      case 'pump':
        return renderPumpFields(selectedElement as Pump);
      case 'valve':
        return renderValveFields(selectedElement as Valve);
      default:
        return <p className="text-gray-500">خصائص غير متوفرة</p>;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
      {/* الرأس */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getElementIcon()}
            <div>
              <h3 className="text-lg font-bold text-gray-800">{getElementName()}</h3>
              <p className="text-xs text-gray-500 font-mono">{selectedElement.id}</p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="حذف العنصر"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* المحتوى */}
      <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {renderFields()}
      </div>

      {/* التذييل */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-xs text-gray-500 text-center">
        اضغط Delete لحذف العنصر
      </div>
    </div>
  );
}
