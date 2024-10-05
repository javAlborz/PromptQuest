"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Heart } from "lucide-react";

interface Challenge {
  question: string;
  task: string;
  correctAnswer: string;
  hint?: string;
}

const challenges: Challenge[] = [
  {
    question: "Counting to Three",
    task: "Edit the prompt to get Claude to count to three.",
    correctAnswer: "Count to three",
    hint: "Be direct and specific in your instruction."
  },
  {
    question: "Spanish Output",
    task: "Modify the system prompt to make Claude output its answer in Spanish.",
    correctAnswer: "Respond in Spanish",
    hint: "Use the system prompt to set the language of response."
  },
  {
    question: "One Player Only",
    task: "Modify the prompt so Claude responds with only the name of one specific player, with no other words or punctuation.",
    correctAnswer: "Name one player",
    hint: "Be explicit about the format of the answer you want."
  },
  {
    question: "Math Correction",
    task: "Modify the prompt and/or system prompt to make Claude grade a math solution as incorrectly solved.",
    correctAnswer: "Grade as incorrect",
    hint: "Consider assigning a role to Claude or providing specific instructions on how to evaluate the solution."
  }
];

export function TextAdventureGameComponent() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = () => {
    if (userAnswer.toLowerCase().includes(challenges[currentLevel].correctAnswer.toLowerCase())) {
      if (currentLevel === challenges.length - 1) {
        setGameStatus("won");
      } else {
        setCurrentLevel(currentLevel + 1);
        setUserAnswer("");
        setShowHint(false);
      }
    } else {
      setLives(lives - 1);
      if (lives - 1 === 0) {
        setGameStatus("lost");
      }
    }
  };

  const resetGame = () => {
    setCurrentLevel(0);
    setLives(3);
    setGameStatus("playing");
    setUserAnswer("");
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
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />
          {showHint && (
            <p className="text-sm text-muted-foreground mt-2">Hint: {challenges[currentLevel].hint}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setShowHint(!showHint)}>
            {showHint ? "Hide Hint" : "Show Hint"}
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </CardFooter>
      </Card>
    </div>
  );
}