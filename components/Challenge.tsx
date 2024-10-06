import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"

interface ChallengeProps {
  question: string;
  task: string;
  systemPrompt?: string;
  userPrompt: string;
  apiResponse: string;
  isCorrect: boolean;
  isLoading: boolean;
  showHint: boolean;
  hint?: string;
  isImmutableUserPrompt: boolean;
  hasSystemPrompt: boolean;
  onSystemPromptChange: (value: string) => void;
  onUserPromptChange: (value: string) => void;
  onSubmit: () => void;
  onToggleHint: () => void;
}

export function Challenge({
  question,
  task,
  systemPrompt,
  userPrompt,
  apiResponse,
  isCorrect,
  isLoading,
  showHint,
  hint,
  isImmutableUserPrompt,
  hasSystemPrompt,
  onSystemPromptChange,
  onUserPromptChange,
  onSubmit,
  onToggleHint
}: ChallengeProps) {
  return (
    <Card className={`w-full ${isCorrect ? 'bg-green-100' : ''}`}>
      <CardHeader>
        <CardTitle>{question}</CardTitle>
        <CardDescription>{task}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasSystemPrompt && (
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt:</label>
            <Input
              placeholder="Enter your system prompt here"
              value={systemPrompt ?? ''}
              onChange={(e) => onSystemPromptChange(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User Prompt:</label>
          <Input
            placeholder="Enter your user prompt here"
            value={userPrompt}
            onChange={(e) => onUserPromptChange(e.target.value)}
            readOnly={isImmutableUserPrompt}
            className={isImmutableUserPrompt ? "bg-gray-100" : ""}
          />
        </div>
        {apiResponse && (
          <div className="mt-4">
            <h4 className="font-semibold">API Response:</h4>
            <p className="text-sm">{apiResponse}</p>
          </div>
        )}
        {showHint && (
          <p className="text-sm text-muted-foreground mt-2">Hint: {hint}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="flex justify-between w-full">
          <Button
            variant="outline"
            onClick={onToggleHint}
          >
            {showHint ? "Hide Hint" : "Show Hint"}
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}