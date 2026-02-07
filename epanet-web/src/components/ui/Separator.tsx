import React from 'react';

export type SeparatorOrientation = 'horizontal' | 'vertical';

interface SeparatorProps {
  orientation?: SeparatorOrientation;
  className?: string;
}

export const Separator = ({ orientation = 'horizontal', className = '' }: SeparatorProps) => {
  const orientationStyles: Record<SeparatorOrientation, string> = {
    horizontal: 'w-full border-t',
    vertical: 'h-full border-r',
  };

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={`border-gray-200 ${orientationStyles[orientation]} ${className}`}
    />
  );
};
