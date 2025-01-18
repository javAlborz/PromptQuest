// src/types/game.ts

export interface ValidationStrategy {
  type: 'pattern' | 'llm';
  pattern?: RegExp | string;
  evaluationPrompt?: string;
}

export interface Challenge {
  id: string;
  question: string;
  task: string;
  initialPrompt: string;
  initialSystemPrompt?: string;
  validation: ValidationStrategy; 
  hint?: string;
  systemPromptPlaceholder?: string;
  userPromptPlaceholder?: string;
  isImmutableUserPrompt?: boolean;
  xmlTags?: string[];
}

export interface Level {
  id: string;
  name: string;
  description: string;
  challenges: Challenge[];
}

export interface GameState {
  currentLevel: number;
  lives: number;
  gameStatus: 'playing' | 'won' | 'lost';
  userPrompts: string[];
  systemPrompts: string[];
  apiResponses: string[];
  isLoading: boolean[];
  showHints: boolean[];
  isCorrect: boolean[];
  isPending: boolean[];
  wordCounts: number[];
  isAdminMode: boolean;
}