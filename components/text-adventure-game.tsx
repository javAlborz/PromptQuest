"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Challenge } from './Challenge';
import { GameStatus } from './GameStatus';
import { GameHeader } from './GameHeader';
import { AdminControls } from './AdminControls';

// Define the level names
const levelNames = [
  "Basic Prompt Structure",
  "Being Clear and Direct",
  // Add more level names as you implement them
];

interface ChallengeType {
  question: string;
  task: string;
  initialPrompt: string;
  initialSystemPrompt?: string;
  evaluation: (response: string) => boolean;
  hint?: string;
  systemPromptPlaceholder?: string;
  userPromptPlaceholder?: string;
}

const challenges: ChallengeType[] = [
  // Level 1 (Notebook 1)
  {
    question: "Counting to Three",
    task: "Edit the prompt to get Claude to count to three.",
    initialPrompt: "",
    userPromptPlaceholder: "Please respond to this message.",
    evaluation: (response: string) => {
      return response.includes("1") && response.includes("2") && response.includes("3");
    },
    hint: "Be direct and specific in your instruction."
  },
  {
    question: "System Prompt - 3-Year-Old Child",
    task: "Modify the system prompt to make Claude respond like a 3-year-old child.",
    initialPrompt: "How big is the sky?",
    initialSystemPrompt: "",
    systemPromptPlaceholder: "You are a helpful AI assistant.",
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
    initialSystemPrompt: "",
    systemPromptPlaceholder: "You are a helpful AI assistant.",
    evaluation: (response: string) => {
      return response.toLowerCase().includes("hola");
    },
    hint: "Think about how to instruct Claude to use a specific language."
  },
  {
    question: "One Player Only",
    task: "Modify the prompt so that Claude responds with ONLY the name of one specific basketball player, with no other words or punctuation.",
    initialPrompt: "",
    userPromptPlaceholder: "Who is the best basketball player of all time?",
    evaluation: (response: string) => {
      return response.trim() === "Michael Jordan";
    },
    hint: "Be very specific about the format of the answer you want."
  },
  {
    question: "Write a Long Story",
    task: "Modify the prompt to make Claude generate a response of at least 800 words.",
    initialPrompt: "",
    userPromptPlaceholder: "Tell me a story.",
    evaluation: (response: string) => {
      const words = response.trim().split(/\s+/).length;
      return words >= 800;
    },
    hint: "Think about asking for a detailed story with multiple characters, plot twists, and vivid descriptions. You can also specify a minimum word count in your prompt."
  }
];

export function TextAdventureGameComponent() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [userPrompts, setUserPrompts] = useState<string[]>([]);
  const [systemPrompts, setSystemPrompts] = useState<string[]>([]);
  const [apiResponses, setApiResponses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean[]>([]);
  const [showHints, setShowHints] = useState<boolean[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean[]>([]);
  const [isStreamComplete, setIsStreamComplete] = useState<boolean[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState<boolean[]>([]); // New state for incorrect answers

  const challengesPerLevel = [2, 3]; // 2 challenges in level 1, 3 challenges in level 2
  const totalLevels = challengesPerLevel.length;
  const currentLevelName = levelNames[currentLevel];

  useEffect(() => {
    console.log("Game initialized");
    initializeGameState();
  }, []);

  useEffect(() => {
    const startIndex = challengesPerLevel.slice(0, currentLevel).reduce((a, b) => a + b, 0);
    const endIndex = startIndex + challengesPerLevel[currentLevel];
    console.log("Current level:", currentLevel);
    console.log("Current challenges:", challenges.slice(startIndex, endIndex));
    console.log("Current user prompts:", userPrompts.slice(startIndex, endIndex));
    console.log("Current system prompts:", systemPrompts.slice(startIndex, endIndex));
  }, [currentLevel, userPrompts, systemPrompts]);

  const initializeGameState = () => {
    setUserPrompts(challenges.map(c => c.initialPrompt));
    setSystemPrompts(challenges.map(c => c.initialSystemPrompt || ""));
    setApiResponses(challenges.map(() => ""));
    setIsLoading(challenges.map(() => false));
    setShowHints(challenges.map(() => false));
    setIsCorrect(challenges.map(() => false));
    setIsStreamComplete(challenges.map(() => false));
    setIsIncorrect(challenges.map(() => false)); // Initialize isIncorrect state
  };

  useEffect(() => {
    if (isStreamComplete.some(Boolean)) {
      const index = isStreamComplete.findIndex(Boolean);
      const correct = challenges[index].evaluation(apiResponses[index]);
      const newIsCorrect = [...isCorrect];
      newIsCorrect[index] = correct;
      setIsCorrect(newIsCorrect);
  
      if (!correct && !isAdminMode) {
        // Set the incorrect state for this challenge
        const newIsIncorrect = [...isIncorrect];
        newIsIncorrect[index] = true;
        setIsIncorrect(newIsIncorrect);
  
        // Move this outside of the setLives callback
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives === 0) {
          setGameStatus("lost");
        }
  
        // Reset the incorrect state after a brief delay
        setTimeout(() => {
          const resetIsIncorrect = [...isIncorrect];
          resetIsIncorrect[index] = false;
          setIsIncorrect(resetIsIncorrect);
        }, 500);
      }
  
      const newIsStreamComplete = [...isStreamComplete];
      newIsStreamComplete[index] = false;
      setIsStreamComplete(newIsStreamComplete);
    }
  }, [isStreamComplete, apiResponses, isAdminMode, challenges, isCorrect, isIncorrect, lives]);

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

    // Reset the incorrect state for this challenge
    const newIsIncorrect = [...isIncorrect];
    newIsIncorrect[index] = false;
    setIsIncorrect(newIsIncorrect);

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
    const startIndex = challengesPerLevel.slice(0, currentLevel).reduce((a, b) => a + b, 0);
    const endIndex = startIndex + challengesPerLevel[currentLevel];
    if (isAdminMode || isCorrect.slice(startIndex, endIndex).every(Boolean)) {
      if (currentLevel === totalLevels - 1) {
        setGameStatus("won");
      } else {
        const newLevel = currentLevel + 1;
        setCurrentLevel(newLevel);
        console.log("Advancing to level:", newLevel);
        const newStartIndex = challengesPerLevel.slice(0, newLevel).reduce((a, b) => a + b, 0);
        const newEndIndex = newStartIndex + challengesPerLevel[newLevel];
        console.log("New user prompts:", challenges.slice(newStartIndex, newEndIndex).map(c => c.initialPrompt));
        console.log("New system prompts:", challenges.slice(newStartIndex, newEndIndex).map(c => c.initialSystemPrompt || ""));
      }
    }
  };

  const resetGame = () => {
    console.log("Resetting game");
    setCurrentLevel(0);
    setLives(3);
    setGameStatus("playing");
    initializeGameState();
  };

  if (gameStatus !== "playing") {
    return <GameStatus status={gameStatus} onResetGame={resetGame} />;
  }

  const startIndex = challengesPerLevel.slice(0, currentLevel).reduce((a, b) => a + b, 0);
  const endIndex = startIndex + challengesPerLevel[currentLevel];
  const currentChallenges = challenges.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto p-4">
      <GameHeader
        lives={lives}
        currentLevel={currentLevel + 1}
        totalLevels={totalLevels}
        levelName={levelNames[currentLevel]}
        isAdminMode={isAdminMode}
        onToggleAdminMode={() => setIsAdminMode(!isAdminMode)}
      />
      <AdminControls
        isAdminMode={isAdminMode}
        currentLevel={currentLevel}
        totalLevels={totalLevels}
        onLevelChange={(newLevel) => {
          setCurrentLevel(newLevel);
          console.log("Admin changed level to:", newLevel);
          const newStartIndex = challengesPerLevel.slice(0, newLevel).reduce((a, b) => a + b, 0);
          const newEndIndex = newStartIndex + challengesPerLevel[newLevel];
          console.log("New user prompts:", challenges.slice(newStartIndex, newEndIndex).map(c => c.initialPrompt));
          console.log("New system prompts:", challenges.slice(newStartIndex, newEndIndex).map(c => c.initialSystemPrompt || ""));
        }}
      />
      <div className="flex flex-col space-y-4">
        {currentChallenges.map((challenge, index) => {
          const challengeIndex = startIndex + index;
          const isImmutableUserPrompt = (challengeIndex === 1 && currentLevel === 0) || (challengeIndex === 2 && currentLevel === 1);
          const hasSystemPrompt = challengeIndex === 1 || challengeIndex === 2;
          return (
            <Challenge
              key={index}
              question={challenge.question}
              task={challenge.task}
              systemPrompt={systemPrompts[challengeIndex]}
              userPrompt={userPrompts[challengeIndex]}
              userPromptPlaceholder={challenge.userPromptPlaceholder} 
              apiResponse={apiResponses[challengeIndex]}
              isCorrect={isCorrect[challengeIndex]}
              isLoading={isLoading[challengeIndex]}
              showHint={showHints[challengeIndex]}
              hint={challenge.hint}
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
                console.log("User prompt changed for challenge", challengeIndex, "to:", value);
              }}
              onSubmit={() => handleSubmit(challengeIndex)}
              onToggleHint={() => {
                const newShowHints = [...showHints];
                newShowHints[challengeIndex] = !newShowHints[challengeIndex];
                setShowHints(newShowHints);
              }}
              wordCount={apiResponses[challengeIndex] ? apiResponses[challengeIndex].trim().split(/\s+/).length : 0}
              isIncorrect={isIncorrect[challengeIndex]} // New prop for incorrect state
            />
          );
        })}
      </div>
      {(isAdminMode || isCorrect.slice(startIndex, endIndex).every(Boolean)) && (
        <div className="mt-4 text-center">
          <Button onClick={advanceToNextLevel} className="w-full max-w-md">
            Next Level
          </Button>
        </div>
      )}
    </div>
  );
}