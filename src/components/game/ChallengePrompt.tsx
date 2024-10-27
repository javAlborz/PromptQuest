// src/components/game/ChallengePrompt.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock } from 'lucide-react';

interface ChallengePromptProps {
  value: string;
  placeholder?: string;
  isImmutable?: boolean;
  isSystemPrompt?: boolean;
  xmlTags?: string[];
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const ChallengePrompt: React.FC<ChallengePromptProps> = ({
  value,
  placeholder,
  isImmutable,
  isSystemPrompt,
  xmlTags,
  onChange,
  onSubmit
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [promptHeight, setPromptHeight] = React.useState('auto');
  const [promptWithTags, setPromptWithTags] = React.useState(value);

  useEffect(() => {
    adjustTextareaHeight();
    // Update promptWithTags when value changes
    setPromptWithTags(value);
  }, [value]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      setPromptHeight(`${textareaRef.current.scrollHeight}px`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, tag: string) => {
    e.dataTransfer.setData('text/plain', tag);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const tagContent = e.dataTransfer.getData('text/plain');
    const dropPosition = e.clientX - e.currentTarget.getBoundingClientRect().left;
    const charPosition = Math.round(dropPosition / 8);

    const newPrompt = promptWithTags.slice(0, charPosition) + tagContent + promptWithTags.slice(charPosition);
    setPromptWithTags(newPrompt);
    onChange(newPrompt);
  };

  return (
    <div className="relative">
      {xmlTags && xmlTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {xmlTags.map((tag, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, tag)}
              className="bg-blue-500 text-white px-2 py-1 rounded cursor-move"
            >
              {tag}
            </div>
          ))}
        </div>
      )}

      {isImmutable ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="bg-gray-100 dark:bg-gray-800 p-2 rounded min-h-[100px] whitespace-pre-wrap"
        >
          {promptWithTags}
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ height: promptHeight }}
          className={`resize-none ${
            isSystemPrompt && isImmutable 
              ? "bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed" 
              : ""
          }`}
          readOnly={isSystemPrompt && isImmutable}
        />
      )}

      {isImmutable && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-2 right-2 text-gray-500">
                <Lock size={16} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isSystemPrompt 
                  ? "This field is not editable for this challenge." 
                  : "This field is not directly editable. Use the XML tags above to modify the content."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};