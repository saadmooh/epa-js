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

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationRule {
  field: string;
  validate: (value: any) => boolean;
  message: string;
}

export function PropertyPanel({ selectedElement }: PropertyPanelProps) {
  const updateElement = useNetworkStore((state) => state.updateElement);
  const deleteElement = useNetworkStore((state) => state.deleteElement);
  const { getAllCurves, createDefaultEfficiencyCurve, createDefaultHeadCurve } = useCurveStore();
  const [showCurveEditor, setShowCurveEditor] = useState(false);
  const [editingCurveId, setEditingCurveId] = useState<string | undefined>(undefined);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  
  const curves = getAllCurves();

  // قواعد التحقق
  const validationRules: Record<string, ValidationRule[]> = {
    junction: [
      {
        field: 'elevation',
        validate: (value) => value >= -100 && value <= 10000,
        message: 'الارتفاع يجب أن يكون بين -100 و 10000 متر'
      },
      {
        field: 'baseDemand',
        validate: (value) => value >= 0 && value <= 10000,
        message: 'الطلب الأساسي يجب أن يكون بين 0 و 10000 لتر/ثانية'
      },
      {
        field: 'emitterCoeff',
        validate: (value) => value >= 0 && value <= 1000,
        message: 'معامل الانبعاث يجب أن يكون بين 0 و 1000'
      },
      {
        field: 'emitterExponent',
        validate: (value) => value >= 0.1 && value <= 2,
        message: 'أس الانبعاث يجب أن يكون بين 0.1 و 2'
      },
    ],
    pipe: [
      {
        field: 'length',
        validate: (value) => value > 0 && value <= 100000,
        message: 'الطول يجب أن يكون بين 0.1 و 100000 متر'
      },
      {
        field: 'diameter',
        validate: (value) => value >= 10 && value <= 5000,
        message: 'القطر يجب أن يكون بين 10 و 5000 مم'
      },
      {
        field: 'roughness',
        validate: (value) => value > 0 && value <= 200,
        message: 'معامل الخشونة يجب أن يكون بين 0.01 و 200'
      },
      {
        field: 'minorLoss',
        validate: (value) => value >= 0 && value <= 100,
        message: 'الخسارة الصغرى يجب أن تكون بين 0 و 100'
      },
    ],
    tank: [
      {
        field: 'elevation',
        validate: (value) => value >= -100 && value <= 10000,
        message: 'الارتفاع يجب أن يكون بين -100 و 10000 متر'
      },
      {
        field: 'diameter',
        validate: (value) => value > 0 && value <= 100,
        message: 'القطر يجب أن يكون بين 0.1 و 100 متر'
      },
      {
        field: 'initialLevel',
        validate: (value) => value >= 0 && value <= 100,
        message: 'المستوى الأولي يجب أن يكون بين 0 و 100 متر'
      },
      {
        field: 'minimumLevel',
        validate: (value) => value >= 0 && value <= 100,
        message: 'الحد الأدنى يجب أن يكون بين 0 و 100 متر'
      },
      {
        field: 'maximumLevel',
        validate: (value) => value >= 0 && value <= 100,
        message: 'الحد الأقصى يجب أن يكون بين 0 و 100 متر'
      },
    ],
    reservoir: [
      {
        field: 'head',
        validate: (value) => value >= -100 && value <= 10000,
        message: 'الرأس يجب أن يكون بين -100 و 10000 متر'
      },
    ],
    pump: [
      {
        field: 'power',
        validate: (value) => value > 0 && value <= 10000,
        message: 'القدرة يجب أن تكون بين 0.1 و 10000 كيلوواط'
      },
      {
        field: 'speed',
        validate: (value) => value > 0 && value <= 2,
        message: 'السرعة يجب أن تكون بين 0.1 و 2'
      },
    ],
    valve: [
      {
        field: 'diameter',
        validate: (value) => value >= 10 && value <= 5000,
        message: 'القطر يجب أن يكون بين 10 و 5000 مم'
      },
      {
        field: 'setting',
        validate: (value) => value >= 0 && value <= 1000,
        message: 'الإعداد يجب أن يكون بين 0 و 1000'
      },
      {
        field: 'minorLoss',
        validate: (value) => value >= 0 && value <= 100,
        message: 'الخسارة الصغرى يجب أن تكون بين 0 و 100'
      },
    ],
  };

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
    // التحقق من القيمة
    const rules = validationRules[selectedElement.type] || [];
    const rule = rules.find(r => r.field === field);
    
    if (rule && !rule.validate(value)) {
      setValidationErrors(prev => [
        ...prev.filter(e => e.field !== field),
        { field, message: rule.message }
      ]);
      return;
    }
    
    // إزالة الخطأ إذا كانت القيمة صحيحة
    setValidationErrors(prev => prev.filter(e => e.field !== field));
    
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

  const getValidationError = (field: string) => {
    return validationErrors.find(e => e.field === field);
  };

  const renderInput = (
    field: string,
    label: string,
    value: any,
    type: 'text' | 'number' | 'select' = 'text',
    step?: string,
    placeholder?: string,
    options?: string[]
  ) => {
    const error = getValidationError(field);
    
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {label}
        </label>
        {type === 'select' && options ? (
          <select
            value={value}
            onChange={(e) => handleChange(field, e.target.value)}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors ${
              error 
                ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          >
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={type === 'select' ? 'text' : type}
            step={step}
            value={value}
            onChange={(e) => handleChange(field, type === 'number' ? parseFloat(e.target.value) : e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors ${
              error 
                ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
        )}
        {error && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <span>⚠️</span>
            <span>{error.message}</span>
          </p>
        )}
      </div>
    );
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
          {renderInput('sourceQuality.type', 'نوع المصدر', sourceQuality.type, 'select', undefined, undefined, [
            'CONCEN - تركيز ثابت',
            'MASS - كتلة ثابتة',
            'SETPOINT - نقطة ضبط',
            'FLOWPACED - متناسب مع التدفق',
          ])}
          {renderInput('sourceQuality.quality', 'الجودة', sourceQuality.quality, 'number', '0.1')}
          {renderInput('sourceQuality.pattern', 'النمط الزمني', sourceQuality.pattern || '', 'text', undefined, 'مثال: 1')}
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
            {renderInput('coordinates.x', 'الإحداثي X', Math.round(junction.coordinates.x), 'number')}
          </div>
          <div>
            {renderInput('coordinates.y', 'الإحداثي Y', Math.round(junction.coordinates.y), 'number')}
          </div>
        </div>
      </div> 

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الخصائص الهيدروليكية</h4>
        <div className="space-y-3">
          {renderInput('elevation', 'الارتفاع (م)', junction.elevation, 'number', '0.1')}
          {renderInput('baseDemand', 'الطلب الأساسي (لتر/ثانية)', junction.baseDemand, 'number', '0.1')}
          {renderInput('demandPattern', 'نمط الطلب', junction.demandPattern || '', 'text', undefined, 'مثال: 1')}
        </div>
      </div> 

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الانبعاث (Emitter)</h4>
        <div className="space-y-3">
          {renderInput('emitterCoeff', 'معامل الانبعاث', junction.emitterCoeff || 0, 'number', '0.001', 'للرشاشات أو التسربات')}
          {renderInput('emitterExponent', 'أس الانبعاث', junction.emitterExponent || 0.5, 'number', '0.1')}
        </div>
      </div> 

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الجودة</h4>
        <div className="space-y-3">
          {renderInput('initialQuality', 'الجودة الأولية', junction.initialQuality || 0, 'number', '0.1')}
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
          {renderInput('length', 'الطول (م)', pipe.length, 'number', '0.1')}
          {renderInput('diameter', 'القطر (مم)', pipe.diameter, 'number', '1')}
          {renderInput('roughness', 'معامل الخشونة', pipe.roughness, 'number', '0.1')}
          {renderInput('roughnessType', 'نوع معامل الخشونة', pipe.roughnessType || 'HW', 'select', undefined, undefined, [
            'HW - Hazen-Williams',
            'DW - Darcy-Weisbach',
            'CM - Chezy-Manning',
          ])}
        </div>
      </div> 

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الحالة والخيارات</h4>
        <div className="space-y-3">
          {renderInput('status', 'الحالة', pipe.status, 'select', undefined, undefined, [
            'مفتوح',
            'مغلق',
            'صمام عدم رجوع',
          ])}
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
          {renderInput('minorLoss', 'الخسارة الصغرى', pipe.minorLoss || 0, 'number', '0.01')}
        </div>
      </div> 

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">معاملات التفاعل (جودة المياه)</h4>
        <div className="space-y-3">
          {renderInput('bulkReactionCoeff', 'معامل التفاعل في القلب (Bulk)', pipe.bulkReactionCoeff || 0, 'number', '0.01', 'للتحلل داخل الماء')}
          {renderInput('wallReactionCoeff', 'معامل التفاعل على الجدار (Wall)', pipe.wallReactionCoeff || 0, 'number', '0.01', 'للتفاعل مع جدار الأنبوب')}
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
            {renderInput('coordinates.x', 'الإحداثي X', Math.round(tank.coordinates.x), 'number')}
          </div>
          <div>
            {renderInput('coordinates.y', 'الإحداثي Y', Math.round(tank.coordinates.y), 'number')}
          </div>
        </div>
      </div> 

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الخصائص الهندسية</h4>
        <div className="space-y-3">
          {renderInput('elevation', 'الارتفاع (م)', tank.elevation, 'number', '0.1')}
          {renderInput('diameter', 'القطر (م)', tank.diameter, 'number', '0.1')}
        </div>
      </div> 

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">مستويات المياه</h4>
        <div className="space-y-3">
          {renderInput('initialLevel', 'المستوى الأولي (م)', tank.initialLevel, 'number', '0.1')}
          {renderInput('minimumLevel', 'الحد الأدنى (م)', tank.minimumLevel, 'number', '0.1')}
          {renderInput('maximumLevel', 'الحد الأقصى (م)', tank.maximumLevel, 'number', '0.1')}
        </div>
      </div> 

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الحجم والمنحنى</h4>
        <div className="space-y-3">
          {renderInput('minimumVolume', 'الحد الأدنى للحجم (م³)', tank.minimumVolume || 0, 'number', '0.1')}
          {renderInput('volumeCurve', 'منحنى الحجم', tank.volumeCurve || '', 'text', undefined, 'اسم المنحنى')}
        </div>
      </div> 

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الاختلاط</h4>
        <div>
          {renderInput('mixingModel', 'نموذج الاختلاط', tank.mixingModel || 'MIX1', 'select', undefined, undefined, [
            'MIX1 - اختلاط كامل',
            'MIX2 - نموذج ذو حجوم',
            'FIFO - دخول أولاً خروج أولاً',
            'LIFO - دخول أخيراً خروج أولاً',
          ])}
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
            {renderInput('coordinates.x', 'الإحداثي X', Math.round(reservoir.coordinates.x), 'number')}
          </div>
          <div>
            {renderInput('coordinates.y', 'الإحداثي Y', Math.round(reservoir.coordinates.y), 'number')}
          </div>
        </div>
      </div> 

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الخصائص الهيدروليكية</h4>
        <div className="space-y-3">
          {renderInput('head', 'الرأس (م)', reservoir.head, 'number', '0.1')}
          {renderInput('headPattern', 'نمط الرأس', reservoir.headPattern || '', 'text', undefined, 'مثال: 1')}
        </div>
      </div> 

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الجودة</h4>
        <div>
          {renderInput('initialQuality', 'الجودة الأولية', reservoir.initialQuality || 0, 'number', '0.1')}
        </div>
      </div>
    </div>
  );

  const renderPumpFields = (pump: Pump) => (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الخصائص</h4>
        <div className="space-y-3">
          {renderInput('properties.type', 'نوع المضخة', pump.properties.type, 'select', undefined, undefined, [
            'POWER - القدرة',
            'HEAD - منحنى الرأس',
          ])}
          {pump.properties.type === 'POWER' ? (
            <div>
              {renderInput('properties.power', 'القدرة (كيلوواط)', pump.properties.power || 1, 'number', '0.1')}
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
          {renderInput('properties.speed', 'السرعة', pump.properties.speed, 'number', '0.1')}
        </div>
      </div> 

      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">الطاقة</h4>
        <div className="space-y-3">
          {renderInput('energy.price', 'سعر الطاقة', pump.energy?.price || 0, 'number', '0.01')}
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
          {renderInput('valveType', 'نوع الصمام', valve.valveType, 'select', undefined, undefined, [
            'PRV - مخفض الضغط',
            'PSV - صمام الضغط الحساس',
            'PBV - صمام الضغط المكسر',
            'FCV - صمام التدفق الثابت',
            'TCV - صمام التحكم بالتقلص',
            'GPV - صمام عام',
          ])}
          {renderInput('diameter', 'القطر (مم)', valve.diameter, 'number', '1')}
          {renderInput('setting', 'الإعداد', valve.setting, 'number', '0.1')}
          {renderInput('status', 'الحالة', valve.status, 'select', undefined, undefined, [
            'مفتوح',
            'مغلق',
          ])}
          {renderInput('minorLoss', 'الخسارة الصغرى', valve.minorLoss || 0, 'number', '0.01')}
          {valve.valveType === 'GPV' && (
            <div>
              {renderInput('lossCurve', 'منحنى الفقد', valve.lossCurve || '', 'text', undefined, 'اسم منحنى الفقد')}
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
