import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

interface Tag {
  id: string;
  content: string;
}

export function Challenge({
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
}: ChallengeProps) {
  const [userPromptHeight, setUserPromptHeight] = useState('auto');
  const [systemPromptHeight, setSystemPromptHeight] = useState('auto');
  const userPromptRef = useRef<HTMLTextAreaElement>(null);
  const systemPromptRef = useRef<HTMLTextAreaElement>(null);

  const [promptWithTags, setPromptWithTags] = useState(userPrompt || '');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (xmlTags && xmlTags.length > 0) {
      const newTags = xmlTags.map((tag, index) => ({
        id: `tag-${index}`,
        content: tag
      }));
      setAvailableTags(newTags);
      console.log("Available tags set:", newTags);
    } else {
      setAvailableTags([]);
    }
  }, [xmlTags]);

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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, tag: Tag) => {
    e.dataTransfer.setData('text/plain', tag.content);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const tagContent = e.dataTransfer.getData('text/plain');
    const dropPosition = e.clientX - e.currentTarget.getBoundingClientRect().left;
    const charPosition = Math.round(dropPosition / 8); // Assuming 8px per character

    const newPrompt = promptWithTags.slice(0, charPosition) + tagContent + promptWithTags.slice(charPosition);
    setPromptWithTags(newPrompt);
    onUserPromptChange(newPrompt);

    setAvailableTags(availableTags.filter(tag => tag.content !== tagContent));
  };

  console.log("Challenge props:", {
    question,
    task,
    isImmutableUserPrompt,
    xmlTags,
    userPrompt,
    promptWithTags,
    availableTags
  });

  return (
    <Card className={`w-full transition-colors ${
      isCorrect && apiResponse 
        ? 'bg-green-100' 
        : apiResponse && !isPending
          ? 'animate-wrong-answer' 
          : ''
    }`}>
      <CardHeader>
        <CardTitle>{question}</CardTitle>
        <CardDescription>{task}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasSystemPrompt && (
          <div className="mb-2 relative">
            <Textarea
              ref={systemPromptRef}
              placeholder={systemPromptPlaceholder || "Enter your system prompt here"}
              value={systemPrompt ?? ''}
              onChange={(e) => onSystemPromptChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, true)}
              style={{ height: systemPromptHeight }}
              className={`resize-none ${isImmutableSystemPrompt ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              readOnly={isImmutableSystemPrompt}
            />
            {isImmutableSystemPrompt && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="absolute top-2 right-2 text-gray-500">
                      <Lock size={16} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This field is not editable for this challenge.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
        <div className="relative">
          {availableTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {availableTags.map((tag) => (
                <div
                  key={tag.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tag)}
                  className="bg-blue-500 text-white px-2 py-1 rounded cursor-move"
                >
                  {tag.content}
                </div>
              ))}
            </div>
          )}
          {isImmutableUserPrompt ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="bg-gray-100 p-2 rounded min-h-[100px] whitespace-pre-wrap"
            >
              {promptWithTags}
            </div>
          ) : (
            <Textarea
              ref={userPromptRef}
              placeholder={userPromptPlaceholder || "Enter your user prompt here"}
              value={userPrompt}
              onChange={(e) => onUserPromptChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, false)}
              style={{ height: userPromptHeight }}
              className="resize-none"
            />
          )}
          {isImmutableUserPrompt && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute top-2 right-2 text-gray-500">
                    <Lock size={16} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This field is not directly editable. Use the XML tags above to modify the content.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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