import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

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
  hasSystemPrompt: boolean;
  onSystemPromptChange: (value: string) => void;
  onUserPromptChange: (value: string) => void;
  onSubmit: () => void;
  onToggleHint: () => void;
  showWordCount: boolean;
  wordCount: number;
}

export function Challenge({
  question,
  task,
  systemPrompt,
  systemPromptPlaceholder,
  userPrompt,
  userPromptPlaceholder,
  isCorrect,
  apiResponse,
  isPending,
  isLoading,
  showHint,
  hint,
  isImmutableUserPrompt,
  hasSystemPrompt,
  onSystemPromptChange,
  onUserPromptChange,
  onSubmit,
  onToggleHint,
  showWordCount,
  wordCount,
}: ChallengeProps) {
  const [userPromptHeight, setUserPromptHeight] = useState('auto');
  const [systemPromptHeight, setSystemPromptHeight] = useState('auto');
  const userPromptRef = useRef<HTMLTextAreaElement>(null);
  const systemPromptRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement | null, setHeight: React.Dispatch<React.SetStateAction<string>>) => {
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      setHeight(`${textarea.scrollHeight}px`);
    }
  };

  useEffect(() => {
    adjustTextareaHeight(userPromptRef.current, setUserPromptHeight);
    adjustTextareaHeight(systemPromptRef.current, setSystemPromptHeight);
  }, [userPrompt, systemPrompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, isSystemPrompt: boolean) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isSystemPrompt) {
        onSystemPromptChange((e.target as HTMLTextAreaElement).value);
      } else {
        onUserPromptChange((e.target as HTMLTextAreaElement).value);
      }
      onSubmit();
    }
  };

  return (
    <Card className={`w-full transition-colors ${
      isCorrect && apiResponse 
        ? 'bg-green-100' 
        : apiResponse && !isPending
          ? 'animate-wrong-answer' 
          : ''
    }`}>     <CardHeader>
        <CardTitle>{question}</CardTitle>
        <CardDescription>{task}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasSystemPrompt && (
          <div className="mb-2">
            <Textarea
              ref={systemPromptRef}
              placeholder={systemPromptPlaceholder || "Enter your system prompt here"}
              value={systemPrompt ?? ''}
              onChange={(e) => onSystemPromptChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, true)}
              style={{ height: systemPromptHeight }}
              className="resize-none"
            />
          </div>
        )}
        <div>
          <Textarea
            ref={userPromptRef}
            placeholder={userPromptPlaceholder || "Enter your user prompt here"}
            value={userPrompt}
            onChange={(e) => onUserPromptChange(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, false)}
            readOnly={isImmutableUserPrompt}
            style={{ height: userPromptHeight }}
            className={`resize-none ${isImmutableUserPrompt ? "bg-gray-100" : ""}`}
          />
        </div>
        {apiResponse && (
          <div className="mt-4">
            <p className="text-sm">{apiResponse}</p>
            {showWordCount && wordCount > 0 && <p className="text-sm mt-2">Word count: {wordCount}</p>}
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