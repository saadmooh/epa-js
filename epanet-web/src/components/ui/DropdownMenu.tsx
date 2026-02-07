import React, { useRef, useState } from 'react';
import { Menu } from './Menu';

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

export const DropdownMenu = ({ trigger, children, position = 'bottom-left', className = '' }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={triggerRef}>
      <div
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        role="button"
        tabIndex={0}
        className="cursor-pointer"
      >
        {trigger}
      </div>
      <Menu isOpen={isOpen} onClose={handleClose} position={position}>
        {children}
      </Menu>
    </div>
  );
};
