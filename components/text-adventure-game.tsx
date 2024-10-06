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
  evaluation: (response: string) => boolean;
  hint?: string;
}

const challenges: Challenge[] = [
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
    question: "Spanish Output",
    task: "Modify the prompt to make Claude output its answer in Spanish.",
    initialPrompt: "Hello, how are you?",
    evaluation: (response: string) => {
      return response.toLowerCase().includes("hola");
    },
    hint: "Use the prompt to set the language of response."
  },
  {
    question: "One Player Only",
    task: "Modify the prompt so Claude responds with only the name of one specific basketball player, with no other words or punctuation.",
    initialPrompt: "Who is the best basketball player of all time?",
    evaluation: (response: string) => {
      return response.trim() === "Michael Jordan";
    },
    hint: "Be explicit about the format of the answer you want."
  },
];

export function TextAdventureGameComponent() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [userPrompt, setUserPrompt] = useState(challenges[currentLevel].initialPrompt);
  const [apiResponse, setApiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isStreamComplete, setIsStreamComplete] = useState(false);

  useEffect(() => {
    if (isStreamComplete) {
      const correct = challenges[currentLevel].evaluation(apiResponse);
      setIsCorrect(correct);

      if (!correct) {
        setLives(prevLives => {
          const newLives = prevLives - 1;
          if (newLives === 0) {
            setGameStatus("lost");
          }
          return newLives;
        });
      }
      setIsStreamComplete(false);
    }
  }, [isStreamComplete, apiResponse, currentLevel]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setApiResponse("");
    setIsCorrect(false);
    setIsStreamComplete(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setIsStreamComplete(true);
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.slice(5));
                if (jsonData.type === 'content_block_delta' && jsonData.delta?.text) {
                  setApiResponse(prev => prev + jsonData.delta.text);
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
      setIsLoading(false);
    }
  };

  const advanceToNextLevel = () => {
    if (currentLevel === challenges.length - 1) {
      setGameStatus("won");
    } else {
      setCurrentLevel(currentLevel + 1);
      setUserPrompt(challenges[currentLevel + 1].initialPrompt);
      setApiResponse("");
      setIsCorrect(false);
      setShowHint(false);
    }
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setLives(3);
    setGameStatus("playing");
    setUserPrompt(challenges[0].initialPrompt);
    setApiResponse("");
    setIsCorrect(false);
    setShowHint(false);
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
        <p className="mt-2">Level: {currentLevel + 1} / {challenges.length}</p>
      </div>
      <Card className="w-[450px] mx-auto">
        <CardHeader>
          <CardTitle>{challenges[currentLevel].question}</CardTitle>
          <CardDescription>{challenges[currentLevel].task}</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Enter your prompt here"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          />
          {apiResponse && (
            <div className="mt-4">
              <h4 className="font-semibold">API Response:</h4>
              <p className="text-sm">{apiResponse}</p>
            </div>
          )}
          {showHint && (
            <p className="text-sm text-muted-foreground mt-2">Hint: {challenges[currentLevel].hint}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => setShowHint(!showHint)}>
              {showHint ? "Hide Hint" : "Show Hint"}
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
          {isCorrect && (
            <Button onClick={advanceToNextLevel} className="w-full">
              Next Level
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}