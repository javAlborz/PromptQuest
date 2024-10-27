// src/components/game/GameStatus.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface GameStatusProps {
  status: "won" | "lost";
  onResetGame: () => void;
}

export const GameStatus: React.FC<GameStatusProps> = ({ status, onResetGame }) => {
  return (
    <Card className="w-[350px] mx-auto mt-10">
      <CardHeader>
        <CardTitle className={status === "won" ? "text-green-600" : "text-red-600"}>
          {status === "won" ? "Congratulations! 🎉" : "Game Over 😢"}
        </CardTitle>
        <CardDescription>
          {status === "won"
            ? "You've mastered all the prompt engineering challenges!"
            : "You've run out of lives. Keep practicing and try again!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "won" && (
          <p className="text-sm text-gray-600 mb-4">
            You've demonstrated excellent prompt engineering skills. Feel free to play again to practice different approaches!
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onResetGame}
          className="w-full"
          variant={status === "won" ? "default" : "destructive"}
        >
          {status === "won" ? "Play Again" : "Try Again"}
        </Button>
      </CardFooter>
    </Card>
  );
};