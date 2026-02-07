import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

// أيقونة التحديد - مؤشر فأرة
export const SelectIcon: React.FC<IconProps> = ({ size = 24, className = '', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 3L19 12L12 13L8 21L5 3Z" fill={color} stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

// أيقونة العقدة (Junction) - دائرة سميكة مثل WaterCAD
export const JunctionIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#0066CC' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="8" fill="white" stroke={color} strokeWidth="2.5"/>
    <circle cx="12" cy="12" r="3" fill={color}/>
  </svg>
);

// أيقونة الأنبوب (Pipe) - خط أفقي مع مخطط تدفق
export const PipeIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#666666' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <line x1="2" y1="10" x2="22" y2="10" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <line x1="2" y1="14" x2="22" y2="14" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    {/* سهم اتجاه التدفق */}
    <path d="M16 8L20 12L16 16" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// أيقونة الخزان الرئيسي (Reservoir) - سد مائي مثل WaterCAD
export const ReservoirIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#00AA44' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* المثلث المقلوب (جسم السد) */}
    <path d="M4 8L12 20L20 8H4Z" fill="#E6FAF0" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    {/* خط الماء */}
    <path d="M6 10H18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    {/* خطوط التموج */}
    <path d="M8 12C9 12 9 13 10 13C11 13 11 12 12 12" stroke={color} strokeWidth="1" fill="none" opacity="0.5"/>
    <path d="M13 14C14 14 14 15 15 15C16 15 16 14 17 14" stroke={color} strokeWidth="1" fill="none" opacity="0.5"/>
  </svg>
);

// أيقونة الخزان (Tank) - أسطوانة عمودية
export const TankIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#0099CC' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* جسم الأسطوانة */}
    <rect x="6" y="4" width="12" height="16" rx="1" fill="#E6F7FF" stroke={color} strokeWidth="2"/>
    {/* خط المستوى العلوي */}
    <line x1="6" y1="8" x2="18" y2="8" stroke={color} strokeWidth="1" opacity="0.4"/>
    {/* خط المستوى الأوسط */}
    <line x1="6" y1="12" x2="18" y2="12" stroke={color} strokeWidth="1" opacity="0.4"/>
    {/* خط المستوى السفلي */}
    <line x1="6" y1="16" x2="18" y2="16" stroke={color} strokeWidth="1" opacity="0.4"/>
    {/* خطوط التعزيز العمودية */}
    <line x1="9" y1="4" x2="9" y2="20" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.3"/>
    <line x1="15" y1="4" x2="15" y2="20" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.3"/>
  </svg>
);

// أيقونة المضخة (Pump) - دائرة مع مثلث داخلي
export const PumpIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#FF6600' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* الدائرة الخارجية */}
    <circle cx="12" cy="12" r="9" fill="#FFF0E6" stroke={color} strokeWidth="2.5"/>
    {/* المثلث الداخلي (رمز المضخة) */}
    <path d="M8 12L14 8V16L8 12Z" fill={color}/>
    {/* دائرة مركزية */}
    <circle cx="12" cy="12" r="2" fill="white" stroke={color} strokeWidth="1"/>
  </svg>
);

// أيقونة الصمام (Valve) - معين/ماسة
export const ValveIcon: React.FC<IconProps> = ({ size = 24, className = '', color = '#9333EA' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    {/* المعين (الجسم الرئيسي) */}
    <polygon points="12,4 20,12 12,20 4,12" fill="#F3E8FF" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    {/* الخط العمودي */}
    <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="1.5"/>
    {/* الخط الأفقي */}
    <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1.5"/>
    {/* الدائرة العلوية (عجلة التحكم) */}
    <circle cx="12" cy="4" r="2" fill={color}/>
    <line x1="12" y1="2" x2="12" y2="0" stroke={color} strokeWidth="2"/>
  </svg>
);

// مكونات SVG للعرض على Canvas

// عقدة على Canvas
export const JunctionNode: React.FC<{ isSelected?: boolean; id?: string }> = ({ isSelected = false, id }) => (
  <g>
    <circle r={isSelected ? 8 : 6} fill="#FFFFFF" stroke={isSelected ? '#FF0000' : '#0066CC'} strokeWidth={isSelected ? 3 : 2}/>
    <circle r={2} fill="#0066CC"/>
    {id && (
      <text y={-12} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="500">
        {id}
      </text>
    )}
  </g>
);

// خزان رئيسي على Canvas
export const ReservoirNode: React.FC<{ isSelected?: boolean; id?: string }> = ({ isSelected = false, id }) => (
  <g>
    <path d="M0,-14 L-12,10 L12,10 Z" fill="#E6FAF0" stroke={isSelected ? '#FF0000' : '#00AA44'} strokeWidth={isSelected ? 3 : 2}/>
    <path d="M-8,10 Q0,6 8,10" stroke="#00AA44" strokeWidth="1.5" fill="none"/>
    <line x1="0" y1="-6" x2="0" y2="2" stroke="#00AA44" strokeWidth="2"/>
    <line x1="-4" y1="-2" x2="4" y2="-2" stroke="#00AA44" strokeWidth="2"/>
    {id && (
      <text y={-20} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="500">
        {id}
      </text>
    )}
  </g>
);

// خزان على Canvas
export const TankNode: React.FC<{ isSelected?: boolean; id?: string; level?: number }> = ({ 
  isSelected = false, 
  id,
  level = 50 
}) => {
  const fillHeight = (level / 100) * 28;
  return (
    <g>
      <rect x={-10} y={-16} width={20} height={32} rx={2} fill="#E6F7FF" stroke={isSelected ? '#FF0000' : '#0099CC'} strokeWidth={isSelected ? 3 : 2}/>
      <rect x={-10} y={16 - fillHeight} width={20} height={fillHeight} fill="#0099CC" opacity="0.3"/>
      <line x1={-6} y1={-16} x2={-6} y2={16} stroke="#0099CC" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      <line x1={6} y1={-16} x2={6} y2={16} stroke="#0099CC" strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      <line x1={-10} y1={-4} x2={10} y2={-4} stroke="#0099CC" strokeWidth="1" opacity="0.3"/>
      <line x1={-10} y1={8} x2={10} y2={8} stroke="#0099CC" strokeWidth="1" opacity="0.3"/>
      {id && (
        <text y={-22} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="500">
          {id}
        </text>
      )}
    </g>
  );
};

// مضخة على Canvas
export const PumpNode: React.FC<{ isSelected?: boolean; id?: string; angle?: number }> = ({ 
  isSelected = false, 
  id,
  angle = 0 
}) => (
  <g transform={`rotate(${angle})`}>
    <circle r={14} fill="#FFF0E6" stroke={isSelected ? '#FF0000' : '#FF6600'} strokeWidth={isSelected ? 3 : 2}/>
    <circle r={6} fill="white" stroke="#FF6600" strokeWidth="1.5"/>
    <path d="M0,-6 L0,6" stroke="#FF6600" strokeWidth="2"/>
    <path d="M-6,0 L6,0" stroke="#FF6600" strokeWidth="2"/>
    <path d="M-4,-4 L4,4" stroke="#FF6600" strokeWidth="1.5"/>
    <path d="M4,-4 L-4,4" stroke="#FF6600" strokeWidth="1.5"/>
    <path d="M0,-14 L3,-10 L-3,-10 Z" fill="#FF6600"/>
    {id && (
      <text y={26} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">
        {id}
      </text>
    )}
  </g>
);

// صمام على Canvas
export const ValveNode: React.FC<{ isSelected?: boolean; id?: string; angle?: number }> = ({ 
  isSelected = false, 
  id,
  angle = 0 
}) => (
  <g transform={`rotate(${angle})`}>
    <rect x={-8} y={-8} width={16} height={16} fill="#F3E8FF" stroke={isSelected ? '#FF0000' : '#9333EA'} strokeWidth={isSelected ? 3 : 2}/>
    <line x1={-8} y1={-8} x2={8} y2={8} stroke="#9333EA" strokeWidth="1.5"/>
    <line x1={8} y1={-8} x2={-8} y2={8} stroke="#9333EA" strokeWidth="1.5"/>
    <circle cy={-12} r={3} fill="#9333EA"/>
    <line x1={0} y1={-8} x2={0} y2={-9} stroke="#9333EA" strokeWidth="1.5"/>
    {id && (
      <text y={22} textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">
        {id}
      </text>
    )}
  </g>
);

// أنبوب على Canvas
export const PipeLink: React.FC<{ 
  isSelected?: boolean; 
  hasCheckValve?: boolean;
  status?: 'Open' | 'Closed' | 'CV';
}> = ({ 
  isSelected = false, 
  hasCheckValve = false,
  status = 'Open'
}) => {
  const strokeColor = status === 'Closed' ? '#999999' : (isSelected ? '#FF0000' : '#666666');
  const strokeWidth = isSelected ? 4 : (status === 'Closed' ? 1 : 2);
  
  return (
    <g>
      <line stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round"/>
      {hasCheckValve && (
        <g>
          <polygon points="0,-6 6,0 0,6 -6,0" fill="white" stroke="#666666" strokeWidth="1.5"/>
          <line x1={-4} y1={-4} x2={4} y2={4} stroke="#666666" strokeWidth="1"/>
        </g>
      )}
      {status === 'Closed' && (
        <line x1={-6} y1={-6} x2={6} y2={6} stroke="#FF0000" strokeWidth="2"/>
      )}
    </g>
  );
};

// تصدير جميع الأيقونات
export const icons = {
  select: SelectIcon,
  junction: JunctionIcon,
  pipe: PipeIcon,
  reservoir: ReservoirIcon,
  tank: TankIcon,
  pump: PumpIcon,
  valve: ValveIcon,
};

export default icons;
