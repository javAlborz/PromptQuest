import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

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

  const handleDragEnd = (result: DropResult) => {
    console.log("Drag ended:", result);
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === 'tags' && destination.droppableId === 'prompt') {
      const draggedTag = availableTags[source.index].content;
      const newPrompt = promptWithTags.slice(0, destination.index) + draggedTag + promptWithTags.slice(destination.index);
      setPromptWithTags(newPrompt);
      onUserPromptChange(newPrompt);

      const newAvailableTags = [...availableTags];
      newAvailableTags.splice(source.index, 1);
      setAvailableTags(newAvailableTags);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log("DragDropContext:", DragDropContext);
      console.log("Droppable:", Droppable);
      console.log("Draggable:", Draggable);
    }
  }, []);

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
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="relative">
            {xmlTags && xmlTags.length > 0 && (
              <Droppable droppableId="tags" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-wrap gap-2 mb-4"
                  >
                    {availableTags.map((tag, index) => (
                      <Draggable key={tag.id} draggableId={tag.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-blue-500 text-white px-2 py-1 rounded cursor-move ${
                              snapshot.isDragging ? 'opacity-50' : ''
                            }`}
                          >
                            {tag.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
            {isImmutableUserPrompt ? (
              <Droppable droppableId="prompt" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-gray-100 p-2 rounded min-h-[100px] whitespace-pre-wrap"
                  >
                    {promptWithTags}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
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
        </DragDropContext>
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