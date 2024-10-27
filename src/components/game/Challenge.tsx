'use client';

import React from 'react';
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ChallengePrompt } from './ChallengePrompt';
import { ChallengeResponse } from './ChallengeResponse';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip";
import { Lock } from 'lucide-react';

interface ChallengeProps {
  question: string;
  task: string;
  systemPrompt?: string;
  systemPromptPlaceholder?: string;
  userPrompt: string;
  userPromptPlaceholder?: string;
  apiResponse: string;
  isCorrect: boolean;
  isPending: boolean;
  isLoading: boolean;
  showHint: boolean;
  hint?: string;
  isImmutableUserPrompt: boolean;
  isImmutableSystemPrompt: boolean;
  hasSystemPrompt: boolean;
  onSystemPromptChange: (value: string) => void;
  onUserPromptChange: (value: string) => void;
  onSubmit: () => void;
  onToggleHint: () => void;
  showWordCount: boolean;
  wordCount: number;
  xmlTags?: string[];
}

export const Challenge: React.FC<ChallengeProps> = ({
  question,
  task,
  systemPrompt,
  systemPromptPlaceholder,
  userPrompt,
  userPromptPlaceholder,
  apiResponse,
  isCorrect,
  isPending,
  isLoading,
  showHint,
  hint,
  isImmutableUserPrompt,
  isImmutableSystemPrompt,
  hasSystemPrompt,
  onSystemPromptChange,
  onUserPromptChange,
  onSubmit,
  onToggleHint,
  showWordCount,
  wordCount,
  xmlTags,
}) => {
  return (
    <Card className={`w-full transition-colors ${
      isCorrect && apiResponse 
        ? 'bg-green-100 dark:bg-green-900/20 border-green-500' 
        : apiResponse && !isPending
          ? 'animate-wrong-answer bg-red-100 dark:bg-red-900/20' 
          : 'border-gray-200 dark:border-gray-800'
    }`}>
      <CardHeader>
        <CardTitle>{question}</CardTitle>
        <CardDescription>{task}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {hasSystemPrompt && (
          <div className="mb-4">
            <ChallengePrompt
              value={systemPrompt ?? ''}
              placeholder={systemPromptPlaceholder}
              isImmutable={isImmutableSystemPrompt}
              isSystemPrompt={true}
              onChange={onSystemPromptChange}
              onSubmit={onSubmit}
            />
          </div>
        )}

        <ChallengePrompt
          value={userPrompt}
          placeholder={userPromptPlaceholder}
          isImmutable={isImmutableUserPrompt}
          xmlTags={xmlTags}
          onChange={onUserPromptChange}
          onSubmit={onSubmit}
        />

        <ChallengeResponse
          response={apiResponse}
          isCorrect={isCorrect}
          isPending={isPending}
          showWordCount={showWordCount}
          wordCount={wordCount}
        />

        {showHint && hint && (
          <p className="text-sm text-muted-foreground mt-2">
            Hint: {hint}
          </p>
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
          <Button 
            onClick={onSubmit} 
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};