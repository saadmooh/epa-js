import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';

export interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About EPANET Web" size="md">
      <div className="space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white text-4xl mx-auto mb-4 shadow-lg">
            💧
          </div>
          <h2 className="text-2xl font-bold text-gray-900">EPANET Web</h2>
          <p className="text-gray-600 mt-1">Water Distribution System Modeling</p>
          <Badge variant="primary" className="mt-3">Version 1.0.0</Badge>
        </div>

        {/* Description */}
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            EPANET Web is a modern web-based application for modeling water distribution systems.
            It provides a professional interface for designing, simulating, and analyzing water networks.
          </p>
          <p>
            Built with React, TypeScript, and modern web technologies, EPANET Web brings the power of
            hydraulic modeling to your browser.
          </p>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Features</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Interactive network canvas with drag-and-drop</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Real-time hydraulic simulation</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Comprehensive property editor</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Results visualization with charts and tables</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Import/Export INP files</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Scenario management</span>
            </li>
          </ul>
        </div>

        {/* Credits */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Based on EPANET by the U.S. Environmental Protection Agency
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            © 2024 EPANET Web. All rights reserved.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
