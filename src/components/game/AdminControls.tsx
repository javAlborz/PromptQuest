// src/components/game/AdminControls.tsx
'use client';

import React from 'react';
import { Select } from "@/components/ui/select";

interface AdminControlsProps {
  isAdminMode: boolean;
  currentLevel: number;
  totalLevels: number;
  onLevelChange: (level: number) => void;
}

export const AdminControls: React.FC<AdminControlsProps> = ({
  isAdminMode,
  currentLevel,
  totalLevels,
  onLevelChange,
}) => {
  if (!isAdminMode) return null;

  return (
    <div className="mt-4 text-center">
      <label htmlFor="level-select" className="mr-2">
        Skip to level:
      </label>
      <select
        id="level-select"
        value={currentLevel + 1}
        onChange={(e) => onLevelChange(parseInt(e.target.value) - 1)}
        className="rounded border border-gray-300 dark:border-gray-700 px-2 py-1"
      >
        {Array.from({length: totalLevels}, (_, i) => (
          <option key={i} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
    </div>
  );
};