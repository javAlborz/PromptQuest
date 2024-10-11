// components/GameHeader.tsx

import React from 'react';
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface GameHeaderProps {
  lives: number;
  currentLevel: number;
  totalLevels: number;
  levelName: string;
  isAdminMode: boolean;
  onToggleAdminMode: () => void;
}

export function GameHeader({ lives, currentLevel, totalLevels, levelName, isAdminMode, onToggleAdminMode }: GameHeaderProps) {
  return (
    <div className="text-center mb-4">
      <h2 className="text-xl mb-2">{levelName}</h2>
      <div className="flex justify-center space-x-1">
        {[...Array(3)].map((_, i) => (
          <Heart key={i} className={`w-6 h-6 ${i < lives ? "text-red-500 fill-red-500" : "text-gray-300"}`} />
        ))}
      </div>
      <p className="mt-2">Level: {currentLevel} / {totalLevels}</p>
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
}