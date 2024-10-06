import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface GameStatusProps {
  status: "won" | "lost";
  onResetGame: () => void;
}

export function GameStatus({ status, onResetGame }: GameStatusProps) {
  return (
    <Card className="w-[350px] mx-auto mt-10">
      <CardHeader>
        <CardTitle>{status === "won" ? "Congratulations!" : "Game Over"}</CardTitle>
        <CardDescription>
          {status === "won"
            ? "You've completed all levels!"
            : "You've run out of lives. Better luck next time!"}
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={onResetGame}>
          {status === "won" ? "Play Again" : "Try Again"}
        </Button>
      </CardFooter>
    </Card>
  );
}