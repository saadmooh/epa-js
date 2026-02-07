import React from 'react';

export interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
  selected?: boolean;
  role?: string;
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ children, onClick, disabled = false, icon, shortcut, danger = false, selected = false, role = 'menuitem' }, ref) => {
    const handleClick = () => {
      if (!disabled && onClick) {
        onClick();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div
        ref={ref}
        role={role}
        tabIndex={disabled ? -1 : 0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`
          flex items-center px-3 py-2 text-sm cursor-pointer
          transition-colors duration-150 focus:outline-none ${
            disabled
              ? 'text-gray-400 cursor-not-allowed'
              : danger
              ? 'text-red-600 hover:bg-red-50 focus:bg-red-50'
              : selected
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-100 focus:bg-gray-100'
          }
        `}
      >
        {icon && <span className="mr-3 flex-shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
        {shortcut && <span className="ml-3 text-xs text-gray-400 font-mono">{shortcut}</span>}
      </div>
    );
  }
);

MenuItem.displayName = 'MenuItem';
