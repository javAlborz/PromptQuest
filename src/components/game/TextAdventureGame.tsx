// src/components/game/TextAdventureGame.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Challenge } from './Challenge';
import { LevelProgress } from './LevelProgress';
import { AdminControls } from './AdminControls';
import { GameStatus } from './GameStatus';
import { useGameState } from '@/src/hooks/useGameState';
import { levels, getChallengesPerLevel } from '@/src/data/challenges';
import ClientOnly from '@/components/ClientOnly';
import type { Challenge as ChallengeType } from '@/src/types/game';

export const TextAdventureGame = () => {
  const {
    state,
    handleSubmit,
    resetGame,
    updatePrompt,
    toggleHint,
    toggleAdminMode,
    changeLevel,
    advanceToNextLevel
  } = useGameState(levels);

  const {
    currentLevel,
    lives,
    gameStatus,
    userPrompts,
    systemPrompts,
    apiResponses,
    isLoading,
    showHints,
    isCorrect,
    isPending,
    wordCounts,
    isAdminMode
  } = state;

  if (gameStatus !== "playing") {
    return <GameStatus status={gameStatus} onResetGame={resetGame} />;
  }

  const startIndex = getChallengesPerLevel()
    .slice(0, currentLevel)
    .reduce((a, b) => a + b, 0);
  
  const currentLevelChallenges = levels[currentLevel].challenges;

  const handleLevelChange = (newLevel: number) => {
    changeLevel(newLevel);
    console.log("Level changed to:", newLevel);
  };

  const handleNextLevel = () => {
    if (currentLevel === levels.length - 1) {
      state.gameStatus = "won";
    } else {
      advanceToNextLevel();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <LevelProgress
        currentLevel={currentLevel + 1}
        totalLevels={levels.length}
        lives={lives}
        levelName={levels[currentLevel].name}
        isAdminMode={isAdminMode}
        onToggleAdminMode={toggleAdminMode}
      />

      <AdminControls
        isAdminMode={isAdminMode}
        currentLevel={currentLevel}
        totalLevels={levels.length}
        onLevelChange={handleLevelChange}
      />

      <div className="flex flex-col space-y-4">
        {currentLevelChallenges.map((challenge: ChallengeType, index: number) => {
          const challengeIndex = startIndex + index;
          const globalIndex = challengeIndex; // This helps track the overall challenge number

          // Define which challenges should be immutable based on their position
          const isImmutableUserPrompt = 
            (globalIndex === 1) || // Second challenge of first level
            (globalIndex === 2) || // First challenge of second level
            (globalIndex === 5) || // Math Correction challenge
            (globalIndex === 6) || // Animal Sound Generator challenge
            (globalIndex === 8);   // Sentence List Analysis challenge

          const isImmutableSystemPrompt = globalIndex === 8; // Sentence List Analysis challenge
          
          const hasSystemPrompt = 
            (globalIndex === 1) ||
            (globalIndex === 2) ||
            (globalIndex === 5) ||
            (globalIndex === 6) ||
            (globalIndex === 8);

          return (
            <ClientOnly key={challengeIndex}>
              <Challenge
                question={challenge.question}
                task={challenge.task}
                systemPrompt={systemPrompts[challengeIndex]}
                systemPromptPlaceholder={challenge.systemPromptPlaceholder}
                userPrompt={userPrompts[challengeIndex]}
                userPromptPlaceholder={challenge.userPromptPlaceholder}
                apiResponse={apiResponses[challengeIndex]}
                isCorrect={isCorrect[challengeIndex]}
                isPending={isPending[challengeIndex]}
                isLoading={isLoading[challengeIndex]}
                showHint={showHints[challengeIndex]}
                hint={challenge.hint}
                isImmutableUserPrompt={isImmutableUserPrompt}
                isImmutableSystemPrompt={isImmutableSystemPrompt}
                hasSystemPrompt={hasSystemPrompt}
                onSystemPromptChange={(value) => updatePrompt(currentLevel, index, value, true)}
                onUserPromptChange={(value) => updatePrompt(currentLevel, index, value, false)}
                onSubmit={() => handleSubmit(currentLevel, index)}
                onToggleHint={() => toggleHint(currentLevel, index)}
                showWordCount={currentLevel === 1 && index === 2}
                wordCount={wordCounts[challengeIndex]}
                xmlTags={challenge.xmlTags}
              />
            </ClientOnly>
          );
        })}
      </div>

      {(isAdminMode || currentLevelChallenges.every((_: ChallengeType, index: number) => 
        isCorrect[startIndex + index])) && (
        <div className="mt-4 text-center">
          <Button 
            onClick={handleNextLevel} 
            className="w-full max-w-md"
          >
            Next Level
          </Button>
        </div>
      )}
    </div>
  );
};