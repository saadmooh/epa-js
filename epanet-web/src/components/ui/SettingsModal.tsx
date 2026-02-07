import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Separator } from './Separator';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: Settings) => void;
  initialSettings?: Partial<Settings>;
}

export type Settings = {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ar';
  autoSave: boolean;
  showGrid: boolean;
  showLegend: boolean;
  animationSpeed: number;
  defaultUnits: 'metric' | 'imperial';
};

const defaultSettings: Settings = {
  theme: 'light',
  language: 'en',
  autoSave: true,
  showGrid: true,
  showLegend: true,
  animationSpeed: 1,
  defaultUnits: 'metric',
};

export const SettingsModal = ({ isOpen, onClose, onSave, initialSettings }: SettingsModalProps) => {
  const [settings, setSettings] = useState<Settings>({ ...defaultSettings, ...initialSettings });

  const handleSave = () => {
    onSave?.(settings);
    onClose();
  };

  const handleChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="lg">
      <div className="space-y-6">
        {/* Appearance */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Appearance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value as Settings['theme'])}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value as Settings['language'])}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </section>

        <Separator />

        {/* Canvas */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Canvas</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Show Grid</label>
              <input
                type="checkbox"
                checked={settings.showGrid}
                onChange={(e) => handleChange('showGrid', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Show Legend</label>
              <input
                type="checkbox"
                checked={settings.showLegend}
                onChange={(e) => handleChange('showLegend', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <Separator />

        {/* Simulation */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Simulation</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Auto Save</label>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 block mb-2">Animation Speed</label>
              <input
                type="range"
                min="0.25"
                max="2"
                step="0.25"
                value={settings.animationSpeed}
                onChange={(e) => handleChange('animationSpeed', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.25x</span>
                <span>{settings.animationSpeed}x</span>
                <span>2x</span>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Units */}
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Units</h3>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">Default Units</label>
            <select
              value={settings.defaultUnits}
              onChange={(e) => handleChange('defaultUnits', e.target.value as Settings['defaultUnits'])}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="metric">Metric</option>
              <option value="imperial">Imperial</option>
            </select>
          </div>
        </section>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </Modal>
  );
};
