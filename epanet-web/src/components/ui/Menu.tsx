import React, { useEffect, useRef, useState } from 'react';
import { MenuItem, MenuItemProps } from './MenuItem';

export interface MenuProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const Menu = ({ children, isOpen = false, onClose, className = '', position = 'bottom-left' }: MenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const menuItems = React.Children.toArray(children).filter(
    (child): child is React.ReactElement => React.isValidElement(child) && child.type === MenuItem
  );

  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    const handleArrowKeys = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
      } else if (event.key === 'Enter' && focusedIndex >= 0) {
        event.preventDefault();
        const menuItem = menuItems[focusedIndex] as React.ReactElement<any>;
        if (menuItem.props.onClick && !menuItem.props.disabled) {
          menuItem.props.onClick();
          onClose?.();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleArrowKeys);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleArrowKeys);
    };
  }, [isOpen, onClose, menuItems, focusedIndex]);

  const positionStyles: Record<typeof position, string> = {
    'bottom-left': 'top-full left-0 mt-1',
    'bottom-right': 'top-full right-0 mt-1',
    'top-left': 'bottom-full left-0 mb-1',
    'top-right': 'bottom-full right-0 mb-1',
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={`
        absolute z-50 min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200
        py-1 ${positionStyles[position]} ${className}
      `}
      role="menu"
      aria-orientation="vertical"
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === MenuItem) {
          return React.cloneElement(child as React.ReactElement<any>, {
            selected: index === focusedIndex,
          });
        }
        return child;
      })}
    </div>
  );
};
