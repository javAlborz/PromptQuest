'use client';

import React from 'react';
import { Button } from "@/src/components/ui/button";
import { Heart } from "lucide-react";

interface LevelProgressProps {
  currentLevel: number;
  totalLevels: number;
  lives: number;
  levelName: string;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  currentLevel,
  totalLevels,
  lives,
  levelName,
  isAdminMode,
  onToggleAdminMode,
}) => {
  return (
    <div className="text-center mb-4">
      <h2 className="text-xl mb-2">{levelName}</h2>
      <div className="flex justify-center space-x-1">
        {[...Array(3)].map((_, i) => (
          <Heart
            key={i}
            className={`w-6 h-6 ${
              i < lives 
                ? "text-red-500 fill-red-500" 
                : "text-gray-300 dark:text-gray-700"
            }`}
          />
        ))}
      </div>
      <p className="mt-2">
        Level: {currentLevel} / {totalLevels}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleAdminMode}
        className="mt-2"
      >
        {isAdminMode ? "Disable Admin Mode" : "Enable Admin Mode"}
      </Button>
    </div>
  );
};