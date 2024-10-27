// src/components/game/ChallengeResponse.tsx
'use client';

import React from 'react';
import { Card } from "@/components/ui/card";

interface ChallengeResponseProps {
  response: string;
  isCorrect: boolean;
  isPending: boolean;
  showWordCount?: boolean;
  wordCount?: number;
}

export const ChallengeResponse: React.FC<ChallengeResponseProps> = ({
  response,
  isCorrect,
  isPending,
  showWordCount = false,
  wordCount = 0,
}) => {
  const getResponseClasses = () => {
    if (!response || isPending) return '';
    return isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400';
  };

  if (!response) return null;

  return (
    <div className="mt-4">
      <div className={`text-sm ${getResponseClasses()}`}>
        <p className="whitespace-pre-wrap">{response}</p>
        {showWordCount && wordCount > 0 && (
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-400">
            Word count: {wordCount}
          </p>
        )}
      </div>
    </div>
  );
};