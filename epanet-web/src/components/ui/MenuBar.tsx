import React from 'react';
import { DropdownMenu } from './DropdownMenu';
import { MenuItem } from './MenuItem';
import { Separator } from './Separator';

export interface MenuBarProps {
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onExit?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitToScreen?: () => void;
  onToggleGrid?: () => void;
  onToggleLegend?: () => void;
  onToolSelect?: (tool: string) => void;
  onRunSimulation?: () => void;
  onStopSimulation?: () => void;
  onResetSimulation?: () => void;
  onSimulationOptions?: () => void;
  onDocumentation?: () => void;
  onAbout?: () => void;
  onKeyboardShortcuts?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  isSimulationRunning?: boolean;
}

export const MenuBar = ({
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onExport,
  onImport,
  onExit,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onSelectAll,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onToggleGrid,
  onToggleLegend,
  onToolSelect,
  onRunSimulation,
  onStopSimulation,
  onResetSimulation,
  onSimulationOptions,
  onDocumentation,
  onAbout,
  onKeyboardShortcuts,
  canUndo = false,
  canRedo = false,
  showGrid = true,
  showLegend = true,
  isSimulationRunning = false,
}: MenuBarProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-2">
      <div className="flex items-center gap-1">
        {/* File Menu */}
        <DropdownMenu
          trigger={
            <button className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              File
            </button>
          }
        >
          <MenuItem onClick={onNew} shortcut="Ctrl+N">
            New
          </MenuItem>
          <MenuItem onClick={onOpen} shortcut="Ctrl+O">
            Open
          </MenuItem>
          <Separator />
          <MenuItem onClick={onSave} shortcut="Ctrl+S">
            Save
          </MenuItem>
          <MenuItem onClick={onSaveAs} shortcut="Ctrl+Shift+S">
            Save As
          </MenuItem>
          <Separator />
          <MenuItem onClick={onExport} shortcut="Ctrl+E">
            Export
          </MenuItem>
          <MenuItem onClick={onImport} shortcut="Ctrl+I">
            Import
          </MenuItem>
          <Separator />
          <MenuItem onClick={onExit} shortcut="Alt+F4" danger>
            Exit
          </MenuItem>
        </DropdownMenu>

        {/* Edit Menu */}
        <DropdownMenu
          trigger={
            <button className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              Edit
            </button>
          }
        >
          <MenuItem onClick={onUndo} shortcut="Ctrl+Z" disabled={!canUndo}>
            Undo
          </MenuItem>
          <MenuItem onClick={onRedo} shortcut="Ctrl+Y" disabled={!canRedo}>
            Redo
          </MenuItem>
          <Separator />
          <MenuItem onClick={onCut} shortcut="Ctrl+X">
            Cut
          </MenuItem>
          <MenuItem onClick={onCopy} shortcut="Ctrl+C">
            Copy
          </MenuItem>
          <MenuItem onClick={onPaste} shortcut="Ctrl+V">
            Paste
          </MenuItem>
          <Separator />
          <MenuItem onClick={onDelete} shortcut="Delete" danger>
            Delete
          </MenuItem>
          <MenuItem onClick={onSelectAll} shortcut="Ctrl+A">
            Select All
          </MenuItem>
        </DropdownMenu>

        {/* View Menu */}
        <DropdownMenu
          trigger={
            <button className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              View
            </button>
          }
        >
          <MenuItem onClick={onZoomIn} shortcut="Ctrl++">
            Zoom In
          </MenuItem>
          <MenuItem onClick={onZoomOut} shortcut="Ctrl+-">
            Zoom Out
          </MenuItem>
          <MenuItem onClick={onFitToScreen} shortcut="Ctrl+0">
            Fit to Screen
          </MenuItem>
          <Separator />
          <MenuItem onClick={onToggleGrid} selected={showGrid}>
            Show Grid
          </MenuItem>
          <MenuItem onClick={onToggleLegend} selected={showLegend}>
            Show Legend
          </MenuItem>
        </DropdownMenu>

        {/* Tools Menu */}
        <DropdownMenu
          trigger={
            <button className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              Tools
            </button>
          }
        >
          <MenuItem onClick={() => onToolSelect?.('select')}>
            Select Tool
          </MenuItem>
          <Separator />
          <MenuItem onClick={() => onToolSelect?.('junction')}>
            Junction
          </MenuItem>
          <MenuItem onClick={() => onToolSelect?.('reservoir')}>
            Reservoir
          </MenuItem>
          <MenuItem onClick={() => onToolSelect?.('tank')}>
            Tank
          </MenuItem>
          <Separator />
          <MenuItem onClick={() => onToolSelect?.('pipe')}>
            Pipe
          </MenuItem>
          <MenuItem onClick={() => onToolSelect?.('pump')}>
            Pump
          </MenuItem>
          <MenuItem onClick={() => onToolSelect?.('valve')}>
            Valve
          </MenuItem>
        </DropdownMenu>

        {/* Simulation Menu */}
        <DropdownMenu
          trigger={
            <button className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              Simulation
            </button>
          }
        >
          <MenuItem onClick={onRunSimulation} shortcut="F5" disabled={isSimulationRunning}>
            Run
          </MenuItem>
          <MenuItem onClick={onStopSimulation} shortcut="Shift+F5" disabled={!isSimulationRunning}>
            Stop
          </MenuItem>
          <MenuItem onClick={onResetSimulation} shortcut="Ctrl+R">
            Reset
          </MenuItem>
          <Separator />
          <MenuItem onClick={onSimulationOptions}>
            Options
          </MenuItem>
        </DropdownMenu>

        {/* Help Menu */}
        <DropdownMenu
          trigger={
            <button className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              Help
            </button>
          }
        >
          <MenuItem onClick={onDocumentation} shortcut="F1">
            Documentation
          </MenuItem>
          <MenuItem onClick={onKeyboardShortcuts} shortcut="Ctrl+?">
            Keyboard Shortcuts
          </MenuItem>
          <Separator />
          <MenuItem onClick={onAbout}>
            About
          </MenuItem>
        </DropdownMenu>
      </div>
    </div>
  );
};
