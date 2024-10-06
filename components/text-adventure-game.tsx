"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Heart } from "lucide-react";

interface Challenge {
  question: string;
  task: string;
  initialPrompt: string;
  initialSystemPrompt?: string;
  evaluation: (response: string) => boolean;
  hint?: string;
}

const challenges: Challenge[] = [
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

      if (!correct) {
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
  }, [isStreamComplete, apiResponses]);

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
          systemPrompt: systemPrompts[index] || undefined
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
    if (isCorrect.slice(currentLevel * 2, (currentLevel + 1) * 2).every(Boolean)) {
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

  if (gameStatus === "won") {
    return (
      <Card className="w-[350px] mx-auto mt-10">
        <CardHeader>
          <CardTitle>Congratulations!</CardTitle>
          <CardDescription>You've completed all levels!</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={resetGame}>Play Again</Button>
        </CardFooter>
      </Card>
    );
  }

  if (gameStatus === "lost") {
    return (
      <Card className="w-[350px] mx-auto mt-10">
        <CardHeader>
          <CardTitle>Game Over</CardTitle>
          <CardDescription>You've run out of lives. Better luck next time!</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={resetGame}>Try Again</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold mb-2">Prompt Engineering Challenge</h1>
        <div className="flex justify-center space-x-1">
          {[...Array(3)].map((_, i) => (
            <Heart key={i} className={`w-6 h-6 ${i < lives ? "text-red-500 fill-red-500" : "text-gray-300"}`} />
          ))}
        </div>
        <p className="mt-2">Level: {currentLevel + 1} / {challenges.length / 2}</p>
      </div>
      <div className="flex flex-col space-y-4">
        {[0, 1].map((index) => {
          const challengeIndex = currentLevel * 2 + index;
          const isImmutableUserPrompt = (challengeIndex === 1 && currentLevel === 0) || (challengeIndex === 2 && currentLevel === 1);
          console.log(`Challenge ${challengeIndex}: isImmutableUserPrompt = ${isImmutableUserPrompt}`);
          return (
            <Card key={index} className={`w-full ${isCorrect[challengeIndex] ? 'bg-green-100' : ''}`}>
              <CardHeader>
                <CardTitle>{challenges[challengeIndex].question}</CardTitle>
                <CardDescription>{challenges[challengeIndex].task}</CardDescription>
              </CardHeader>
              <CardContent>
                {challenges[challengeIndex].initialSystemPrompt !== undefined && (
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt:</label>
                    <Input
                      placeholder="Enter your system prompt here"
                      value={systemPrompts[challengeIndex]}
                      onChange={(e) => {
                        const newSystemPrompts = [...systemPrompts];
                        newSystemPrompts[challengeIndex] = e.target.value;
                        setSystemPrompts(newSystemPrompts);
                      }}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Prompt:</label>
                  <Input
                    placeholder="Enter your user prompt here"
                    value={userPrompts[challengeIndex]}
                    onChange={(e) => {
                      const newUserPrompts = [...userPrompts];
                      newUserPrompts[challengeIndex] = e.target.value;
                      setUserPrompts(newUserPrompts);
                    }}
                    readOnly={isImmutableUserPrompt}
                    className={isImmutableUserPrompt ? "bg-gray-100" : ""}
                  />
                </div>
                {apiResponses[challengeIndex] && (
                  <div className="mt-4">
                    <h4 className="font-semibold">API Response:</h4>
                    <p className="text-sm">{apiResponses[challengeIndex]}</p>
                  </div>
                )}
                {showHints[challengeIndex] && (
                  <p className="text-sm text-muted-foreground mt-2">Hint: {challenges[challengeIndex].hint}</p>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="flex justify-between w-full">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newShowHints = [...showHints];
                      newShowHints[challengeIndex] = !newShowHints[challengeIndex];
                      setShowHints(newShowHints);
                    }}
                  >
                    {showHints[challengeIndex] ? "Hide Hint" : "Show Hint"}
                  </Button>
                  <Button onClick={() => handleSubmit(challengeIndex)} disabled={isLoading[challengeIndex]}>
                    {isLoading[challengeIndex] ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      {isCorrect.slice(currentLevel * 2, (currentLevel + 1) * 2).every(Boolean) && (
        <div className="mt-4 text-center">
          <Button onClick={advanceToNextLevel} className="w-full max-w-md">
            Next Level
          </Button>
        </div>
      )}
    </div>
  );
}