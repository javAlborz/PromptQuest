// src/hooks/useGameState.ts
import { useState, useCallback } from 'react';
import { Level } from '@/src/types/game';
import { validationService } from '@/src/services/validation';

interface GameState {
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

export const useGameState = (levels: Level[]) => {
  const [state, setState] = useState<GameState>(() => ({
    currentLevel: 0,
    lives: 3,
    gameStatus: 'playing',
    userPrompts: levels.flatMap(level => 
      level.challenges.map(challenge => challenge.initialPrompt)
    ),
    systemPrompts: levels.flatMap(level => 
      level.challenges.map(challenge => challenge.initialSystemPrompt || '')
    ),
    apiResponses: levels.flatMap(level => 
      level.challenges.map(() => '')
    ),
    isLoading: levels.flatMap(level => 
      level.challenges.map(() => false)
    ),
    showHints: levels.flatMap(level => 
      level.challenges.map(() => false)
    ),
    isCorrect: levels.flatMap(level => 
      level.challenges.map(() => false)
    ),
    isPending: levels.flatMap(level => 
      level.challenges.map(() => false)
    ),
    wordCounts: levels.flatMap(level => 
      level.challenges.map(() => 0)
    ),
    isAdminMode: false
  }));

  const countWords = useCallback((text: string): number => {
    return text.trim().split(/\s+/).length;
  }, []);

  const getChallengeIndex = useCallback((levelIndex: number, challengeIndex: number): number => {
    return levels.slice(0, levelIndex).reduce((sum, level) => sum + level.challenges.length, 0) + challengeIndex;
  }, [levels]);

  const handleSubmit = useCallback(async (levelIndex: number, challengeIndex: number) => {
    const globalIndex = getChallengeIndex(levelIndex, challengeIndex);
    
    setState(prev => ({
      ...prev,
      isLoading: prev.isLoading.map((val, i) => i === globalIndex ? true : val),
      isPending: prev.isPending.map((val, i) => i === globalIndex ? true : val),
      apiResponses: prev.apiResponses.map((val, i) => i === globalIndex ? '' : val)
    }));

    try {
      // Get Claude's response first
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: state.userPrompts[globalIndex],
          systemPrompt: state.systemPrompts[globalIndex]
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = JSON.parse(line.slice(5));
                if (jsonData.type === 'content_block_delta' && jsonData.delta?.text) {
                  fullResponse += jsonData.delta.text;
                  
                  setState(prev => ({
                    ...prev,
                    apiResponses: prev.apiResponses.map((val, i) => 
                      i === globalIndex ? fullResponse : val
                    ),
                    wordCounts: prev.wordCounts.map((val, i) => 
                      i === globalIndex ? countWords(fullResponse) : val
                    )
                  }));
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }

        // Now validate the response using the validation service
        const challenge = levels[levelIndex].challenges[challengeIndex];
        const validationResult = await validationService.validateChallenge(
          fullResponse,
          challenge.validation
        );

        setState(prev => {
          const newState = {
            ...prev,
            isCorrect: prev.isCorrect.map((val, i) => 
              i === globalIndex ? validationResult.isCorrect : val
            ),
            isPending: prev.isPending.map((val, i) => 
              i === globalIndex ? false : val
            )
          };

          if (!validationResult.isCorrect && !prev.isAdminMode) {
            newState.lives = prev.lives - 1;
            if (newState.lives === 0) {
              newState.gameStatus = 'lost';
            }
          }

          return newState;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setState(prev => ({
        ...prev,
        isCorrect: prev.isCorrect.map((val, i) => 
          i === globalIndex ? false : val
        ),
        isPending: prev.isPending.map((val, i) => 
          i === globalIndex ? false : val
        )
      }));
    } finally {
      setState(prev => ({
        ...prev,
        isLoading: prev.isLoading.map((val, i) => 
          i === globalIndex ? false : val
        )
      }));
    }
  }, [state.userPrompts, state.systemPrompts, levels, getChallengeIndex, countWords]);


  const resetGame = useCallback(() => {
    setState({
      currentLevel: 0,
      lives: 3,
      gameStatus: 'playing',
      userPrompts: levels.flatMap(level => 
        level.challenges.map(challenge => challenge.initialPrompt)
      ),
      systemPrompts: levels.flatMap(level => 
        level.challenges.map(challenge => challenge.initialSystemPrompt || '')
      ),
      apiResponses: levels.flatMap(level => 
        level.challenges.map(() => '')
      ),
      isLoading: levels.flatMap(level => 
        level.challenges.map(() => false)
      ),
      showHints: levels.flatMap(level => 
        level.challenges.map(() => false)
      ),
      isCorrect: levels.flatMap(level => 
        level.challenges.map(() => false)
      ),
      isPending: levels.flatMap(level => 
        level.challenges.map(() => false)
      ),
      wordCounts: levels.flatMap(level => 
        level.challenges.map(() => 0)
      ),
      isAdminMode: false
    });
  }, [levels]);

  const updatePrompt = useCallback((levelIndex: number, challengeIndex: number, value: string, isSystem: boolean) => {
    const globalIndex = getChallengeIndex(levelIndex, challengeIndex);
    setState(prev => ({
      ...prev,
      [isSystem ? 'systemPrompts' : 'userPrompts']: prev[isSystem ? 'systemPrompts' : 'userPrompts'].map(
        (val, i) => i === globalIndex ? value : val
      )
    }));
  }, [getChallengeIndex]);

  const toggleHint = useCallback((levelIndex: number, challengeIndex: number) => {
    const globalIndex = getChallengeIndex(levelIndex, challengeIndex);
    setState(prev => ({
      ...prev,
      showHints: prev.showHints.map((val, i) => 
        i === globalIndex ? !val : val
      )
    }));
  }, [getChallengeIndex]);

  const toggleAdminMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAdminMode: !prev.isAdminMode
    }));
  }, []);

  const changeLevel = useCallback((newLevel: number) => {
    setState(prev => ({
      ...prev,
      currentLevel: newLevel
    }));
  }, []);

  const advanceToNextLevel = useCallback(() => {
    setState(prev => {
      if (prev.currentLevel < levels.length - 1) {
        return {
          ...prev,
          currentLevel: prev.currentLevel + 1
        };
      }
      return {
        ...prev,
        gameStatus: 'won'
      };
    });
  }, [levels.length]);

  return {
    state,
    handleSubmit,
    resetGame,
    updatePrompt,
    toggleHint,
    toggleAdminMode,
    changeLevel,
    advanceToNextLevel
  };
};
