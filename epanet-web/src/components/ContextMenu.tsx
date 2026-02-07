import { useState, useCallback, useEffect } from 'react';

interface ContextMenuItem {
  label?: string;
  action?: () => void;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ items, x, y, onClose }: ContextMenuProps) {
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    // ضمان أن القائمة لا تخرج عن حدود الشاشة
    const menuWidth = 200;
    const menuHeight = items.length * 35 + 20;
    
    const newX = Math.min(x, window.innerWidth - menuWidth - 10);
    const newY = Math.min(y, window.innerHeight - menuHeight - 10);
    
    setPosition({ x: newX, y: newY });
  }, [x, y, items.length]);

  useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };

    // إغلاق القائمة عند النقر في أي مكان
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  const handleItemClick = (action?: () => void) => {
    action?.();
    onClose();
  };

  return (
    <div
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-[100] min-w-[180px]"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => (
        <div key={index}>
          {item.separator ? (
            <hr className="my-1 border-gray-200" />
          ) : (
            <button
              onClick={() => handleItemClick(item.action)}
              disabled={item.disabled}
              className={`w-full px-4 py-2 text-right text-sm flex items-center gap-2 transition-colors
                ${item.disabled 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// Hook لإدارة القائمة السياقية
export function useContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [items, setItems] = useState<ContextMenuItem[]>([]);

  const openContextMenu = useCallback((e: React.MouseEvent, menuItems: ContextMenuItem[]) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition({ x: e.clientX, y: e.clientY });
    setItems(menuItems);
    setIsOpen(true);
  }, []);

  const closeContextMenu = useCallback(() => {
    setIsOpen(false);
    setItems([]);
  }, []);

  return {
    isOpen,
    position,
    items,
    openContextMenu,
    closeContextMenu,
  };
}
