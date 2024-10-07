import React from 'react';

interface AdminControlsProps {
  isAdminMode: boolean;
  currentLevel: number;
  totalLevels: number;
  onLevelChange: (level: number) => void;
}

export function AdminControls({ isAdminMode, currentLevel, totalLevels, onLevelChange }: AdminControlsProps) {
  if (!isAdminMode) return null;

  // Ensure totalLevels is at least 1
  const safeTotal = Math.max(1, totalLevels);

  return (
    <div className="mt-4 text-center">
      <label htmlFor="level-select" className="mr-2">Skip to level:</label>
      <select
        id="level-select"
        value={currentLevel + 1}
        onChange={(e) => onLevelChange(parseInt(e.target.value) - 1)}
      >
        {Array.from({length: safeTotal}, (_, i) => (
          <option key={i} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
    </div>
  );
}