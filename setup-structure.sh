#!/bin/bash

# Create main directories
mkdir -p src/{components/{game,ui},data,hooks,services,types,utils}

# Create component files
touch src/components/game/{ChallengePrompt,ChallengeResponse,LevelProgress,index}.tsx

# Create data files
touch src/data/{challenges,index}.ts

# Create hook files
touch src/hooks/{useGameState,index}.ts

# Create service files
touch src/services/{api,index}.ts

# Create type files
touch src/types/game.ts

# Create index files for easier imports
echo "export * from './challenges';" > src/data/index.ts
echo "export * from './useGameState';" > src/hooks/index.ts
echo "export * from './api';" > src/services/index.ts

# Create base component exports
cat > src/components/game/index.ts << EOL
export * from './ChallengePrompt';
export * from './ChallengeResponse';
export * from './LevelProgress';
EOL

# Make script executable
chmod +x setup-structure.sh

# Add basic content to game.ts types file
cat > src/types/game.ts << EOL
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
EOL

# Add placeholder for api service
cat > src/services/api.ts << EOL
export const submitChallenge = async (prompt: string, systemPrompt?: string) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, systemPrompt }),
  });

  return response;
};
EOL

# Output success message
echo "Project structure has been created successfully!"
echo "
Created directory structure:
src/
├── components/
│   ├── game/
│   │   ├── ChallengePrompt.tsx
│   │   ├── ChallengeResponse.tsx
│   │   ├── LevelProgress.tsx
│   │   └── index.ts
│   └── ui/
├── data/
│   ├── challenges.ts
│   └── index.ts
├── hooks/
│   ├── useGameState.ts
│   └── index.ts
├── services/
│   ├── api.ts
│   └── index.ts
├── types/
│   └── game.ts
└── utils/
"
