export interface Challenge {
  id: string;
  question: string;
  task: string;
  initialPrompt: string;
  initialSystemPrompt?: string;
  evaluation: (response: string) => boolean;
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