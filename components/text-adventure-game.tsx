"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Challenge } from './Challenge';
import { GameStatus } from './GameStatus';
import { GameHeader } from './GameHeader';
import { AdminControls } from './AdminControls';

interface ChallengeType {
  question: string;
  task: string;
  initialPrompt: string;
  initialSystemPrompt?: string;
  evaluation: (response: string) => boolean;
  hint?: string;
}

const challenges: ChallengeType[] = [
  // Level 1 (Notebook 1)
  {
    question: "Counting to Three",
    task: "Edit the prompt to get Claude to count to three.",
    initialPrompt: "Please respond to this message.",
    evaluation: (response: string) => {
      return response.includes("1") && response.includes("2") && response.includes("3");
    },
    hint: "Be direct and specific in your instruction."
  },
  {
    question: "System Prompt - 3-Year-Old Child",
    task: "Modify the system prompt to make Claude respond like a 3-year-old child.",
    initialPrompt: "How big is the sky?",
    initialSystemPrompt: "You are a helpful AI assistant.",
    evaluation: (response: string) => {
      return response.toLowerCase().includes("giggles") || response.toLowerCase().includes("soo");
    },
    hint: "Think about how a 3-year-old would speak and what words they might use."
  },
  // Level 2 (Notebook 2)
  {
    question: "Spanish Output",
    task: "Modify the system prompt to make Claude output its answer in Spanish.",
    initialPrompt: "Hello Claude, how are you?",
    initialSystemPrompt: "You are a helpful AI assistant.",
    evaluation: (response: string) => {
      return response.toLowerCase().includes("hola");
    },
    hint: "Think about how to instruct Claude to use a specific language."
  },
  {
    question: "One Player Only",
    task: "Modify the prompt so that Claude responds with ONLY the name of one specific basketball player, with no other words or punctuation.",
    initialPrompt: "Who is the best basketball player of all time?",
    evaluation: (response: string) => {
      return response.trim() === "Michael Jordan";
    },
    hint: "Be very specific about the format of the answer you want."
  }
];

export function TextAdventureGameComponent() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [userPrompts, setUserPrompts] = useState(challenges.map(c => c.initialPrompt));
  const [systemPrompts, setSystemPrompts] = useState(challenges.map(c => c.initialSystemPrompt || ""));
  const [apiResponses, setApiResponses] = useState(challenges.map(() => ""));
  const [isLoading, setIsLoading] = useState(challenges.map(() => false));
  const [showHints, setShowHints] = useState(challenges.map(() => false));
  const [isCorrect, setIsCorrect] = useState(challenges.map(() => false));
  const [isStreamComplete, setIsStreamComplete] = useState(challenges.map(() => false));
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    console.log("Current level:", currentLevel);
  }, [currentLevel]);

  useEffect(() => {
    if (isStreamComplete.some(Boolean)) {
      const index = isStreamComplete.findIndex(Boolean);
      const correct = challenges[index].evaluation(apiResponses[index]);
      const newIsCorrect = [...isCorrect];
      newIsCorrect[index] = correct;
      setIsCorrect(newIsCorrect);

      if (!correct && !isAdminMode) {
        setLives(prevLives => {
          const newLives = prevLives - 1;
          if (newLives === 0) {
            setGameStatus("lost");
          }
          return newLives;
        });
      }
      const newIsStreamComplete = [...isStreamComplete];
      newIsStreamComplete[index] = false;
      setIsStreamComplete(newIsStreamComplete);
    }
  }, [isStreamComplete, apiResponses, isAdminMode]);

  const handleSubmit = async (index: number) => {
    const newIsLoading = [...isLoading];
    newIsLoading[index] = true;
    setIsLoading(newIsLoading);

    const newApiResponses = [...apiResponses];
    newApiResponses[index] = "";
    setApiResponses(newApiResponses);

    const newIsCorrect = [...isCorrect];
    newIsCorrect[index] = false;
    setIsCorrect(newIsCorrect);

    const newIsStreamComplete = [...isStreamComplete];
    newIsStreamComplete[index] = false;
    setIsStreamComplete(newIsStreamComplete);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: userPrompts[index],
          systemPrompt: systemPrompts[index]
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            newIsStreamComplete[index] = true;
            setIsStreamComplete([...newIsStreamComplete]);
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.slice(5));
                if (jsonData.type === 'content_block_delta' && jsonData.delta?.text) {
                  newApiResponses[index] += jsonData.delta.text;
                  setApiResponses([...newApiResponses]);
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      newIsLoading[index] = false;
      setIsLoading([...newIsLoading]);
    }
  };

  const advanceToNextLevel = () => {
    if (isAdminMode || isCorrect.slice(currentLevel * 2, (currentLevel + 1) * 2).every(Boolean)) {
      if (currentLevel === challenges.length / 2 - 1) {
        setGameStatus("won");
      } else {
        setCurrentLevel(currentLevel + 1);
        setUserPrompts(challenges.slice(currentLevel * 2 + 2, (currentLevel + 1) * 2 + 2).map(c => c.initialPrompt));
        setSystemPrompts(challenges.slice(currentLevel * 2 + 2, (currentLevel + 1) * 2 + 2).map(c => c.initialSystemPrompt || ""));
        setApiResponses(challenges.slice(currentLevel * 2 + 2, (currentLevel + 1) * 2 + 2).map(() => ""));
        setIsCorrect(challenges.slice(currentLevel * 2 + 2, (currentLevel + 1) * 2 + 2).map(() => false));
        setShowHints(challenges.slice(currentLevel * 2 + 2, (currentLevel + 1) * 2 + 2).map(() => false));
      }
    }
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setLives(3);
    setGameStatus("playing");
    setUserPrompts(challenges.slice(0, 2).map(c => c.initialPrompt));
    setSystemPrompts(challenges.slice(0, 2).map(c => c.initialSystemPrompt || ""));
    setApiResponses(challenges.slice(0, 2).map(() => ""));
    setIsCorrect(challenges.slice(0, 2).map(() => false));
    setShowHints(challenges.slice(0, 2).map(() => false));
  };

  if (gameStatus !== "playing") {
    return <GameStatus status={gameStatus} onResetGame={resetGame} />;
  }

  return (
    <div className="container mx-auto p-4">
      <GameHeader
        lives={lives}
        currentLevel={currentLevel}
        totalLevels={challenges.length / 2}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
      />
      <AdminControls
        isAdminMode={isAdminMode}
        currentLevel={currentLevel}
        totalLevels={challenges.length / 2}
        onLevelChange={(newLevel) => {
          setCurrentLevel(newLevel);
          setUserPrompts(challenges.slice(newLevel * 2, (newLevel + 1) * 2).map(c => c.initialPrompt));
          setSystemPrompts(challenges.slice(newLevel * 2, (newLevel + 1) * 2).map(c => c.initialSystemPrompt || ""));
          setApiResponses(challenges.slice(newLevel * 2, (newLevel + 1) * 2).map(() => ""));
          setIsCorrect(challenges.slice(newLevel * 2, (newLevel + 1) * 2).map(() => false));
          setShowHints(challenges.slice(newLevel * 2, (newLevel + 1) * 2).map(() => false));
        }}
      />
      <div className="flex flex-col space-y-4">
        {[0, 1].map((index) => {
          const challengeIndex = currentLevel * 2 + index;
          const isImmutableUserPrompt = (challengeIndex === 1 && currentLevel === 0) || (challengeIndex === 2 && currentLevel === 1);
          const hasSystemPrompt = challengeIndex === 1 || challengeIndex === 2;
          return (
            <Challenge
              key={index}
              question={challenges[challengeIndex].question}
              task={challenges[challengeIndex].task}
              systemPrompt={systemPrompts[challengeIndex]}
              userPrompt={userPrompts[challengeIndex]}
              apiResponse={apiResponses[challengeIndex]}
              isCorrect={isCorrect[challengeIndex]}
              isLoading={isLoading[challengeIndex]}
              showHint={showHints[challengeIndex]}
              hint={challenges[challengeIndex].hint}
              isImmutableUserPrompt={isImmutableUserPrompt}
              hasSystemPrompt={hasSystemPrompt}
              onSystemPromptChange={(value) => {
                const newSystemPrompts = [...systemPrompts];
                newSystemPrompts[challengeIndex] = value;
                setSystemPrompts(newSystemPrompts);
              }}
              onUserPromptChange={(value) => {
                const newUserPrompts = [...userPrompts];
                newUserPrompts[challengeIndex] = value;
                setUserPrompts(newUserPrompts);
              }}
              onSubmit={() => handleSubmit(challengeIndex)}
              onToggleHint={() => {
                const newShowHints = [...showHints];
                newShowHints[challengeIndex] = !newShowHints[challengeIndex];
                setShowHints(newShowHints);
              }}
            />
          );
        })}
      </div>
      {(isAdminMode || isCorrect.slice(currentLevel * 2, (currentLevel + 1) * 2).every(Boolean)) && (
        <div className="mt-4 text-center">
          <Button onClick={advanceToNextLevel} className="w-full max-w-md">
            Next Level
          </Button>
        </div>
      )}
    </div>
  );
}