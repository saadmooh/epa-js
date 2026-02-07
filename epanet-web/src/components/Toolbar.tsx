import type { ElementType } from '../types';
import {
  SelectIcon,
  JunctionIcon,
  PipeIcon,
  ReservoirIcon,
  TankIcon,
  PumpIcon,
  ValveIcon,
} from './NetworkIcons';

interface ToolbarProps {
  selectedTool: ElementType | 'select';
  onToolSelect: (tool: ElementType | 'select') => void;
}

export function Toolbar({ selectedTool, onToolSelect }: ToolbarProps) {
  const tools = [
    { id: 'select' as const, label: 'تحديد', Icon: SelectIcon, color: '#374151' },
    { id: 'junction' as const, label: 'عقدة', Icon: JunctionIcon, color: '#0066CC' },
    { id: 'pipe' as const, label: 'أنبوب', Icon: PipeIcon, color: '#666666' },
    { id: 'reservoir' as const, label: 'خزان رئيسي', Icon: ReservoirIcon, color: '#00AA44' },
    { id: 'tank' as const, label: 'خزان', Icon: TankIcon, color: '#0099CC' },
    { id: 'pump' as const, label: 'مضخة', Icon: PumpIcon, color: '#FF6600' },
    { id: 'valve' as const, label: 'صمام', Icon: ValveIcon, color: '#9333EA' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-2 flex flex-col gap-2">
      <div className="text-xs font-semibold text-gray-500 text-center pb-2 border-b border-gray-100">
        الأدوات
      </div>
      {tools.map((tool) => {
        const isSelected = selectedTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id as ElementType | 'select')}
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center
              transition-all duration-200 group relative
              ${isSelected 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg scale-105' 
                : 'bg-gray-50 hover:bg-gray-100 hover:scale-105'
              }
            `}
            title={tool.label}
          >
            <tool.Icon 
              size={24} 
              color={isSelected ? '#FFFFFF' : tool.color}
              className="transition-transform group-hover:scale-110"
            />
            
            {/* تلميح الأداة */}
            <span className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded 
                           opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50
                           pointer-events-none">
              {tool.label}
            </span>
            
            {/* مؤشر التحديد */}
            {isSelected && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-r"/>
            )}
          </button>
        );
      })}
      
      <div className="border-t border-gray-100 pt-2 mt-2">
        <div className="text-[10px] text-gray-400 text-center">
          اختر أداة ثم انقر على لوحة الرسم
        </div>
      </div>
    </div>
  );
}
