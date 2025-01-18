// src/services/validation.ts

import type { ValidationStrategy } from '@/src/types/game';

interface ValidationResult {
  isCorrect: boolean;
}

abstract class BaseValidator {
  abstract validate(response: string): Promise<ValidationResult>;
}

class PatternValidator extends BaseValidator {
  constructor(private pattern: RegExp | string) {
    super();
  }

  async validate(response: string): Promise<ValidationResult> {
    const isCorrect = typeof this.pattern === 'string' 
      ? response.includes(this.pattern)
      : this.pattern.test(response);
    
    console.log('Pattern validation result:', { isCorrect, pattern: this.pattern, response });
    return { isCorrect };
  }
}

class LLMValidator extends BaseValidator {
  constructor(private evaluationPrompt: string) {
    super();
  }

  async validate(response: string): Promise<ValidationResult> {
    console.log('Starting LLM validation for response:', response);
    try {
      const evaluationResponse = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          response,
          evaluationPrompt: this.evaluationPrompt,
        }),
      });

      if (!evaluationResponse.ok) {
        console.error('Evaluation API error:', evaluationResponse.status);
        return { isCorrect: false };
      }

      const result = await evaluationResponse.json();
      console.log('LLM validation result:', result);
      
      // Ensure we have a boolean result
      return { isCorrect: result?.isCorrect === true };
    } catch (error) {
      console.error('LLM validation error:', error);
      return { isCorrect: false };
    }
  }
}

export function createValidator(strategy: ValidationStrategy): BaseValidator {
  console.log('Creating validator for strategy:', strategy);
  if (!strategy?.type) {
    console.error('Invalid strategy:', strategy);
    throw new Error('Invalid validation strategy');
  }
  
  switch (strategy.type) {
    case 'pattern':
      if (!strategy.pattern) {
        throw new Error('Pattern strategy requires a pattern');
      }
      return new PatternValidator(strategy.pattern);
    case 'llm':
      if (!strategy.evaluationPrompt) {
        throw new Error('LLM strategy requires an evaluation prompt');
      }
      return new LLMValidator(strategy.evaluationPrompt);
    default:
      throw new Error(`Unknown validation strategy: ${strategy.type}`);
  }
}

export class ValidationService {
  private static instance: ValidationService;
  
  private constructor() {}

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  async validateChallenge(
    response: string,
    strategy: ValidationStrategy
  ): Promise<ValidationResult> {
    console.log('Starting challenge validation:', { response, strategy });
    
    if (!response || !strategy) {
      console.error('Invalid validation parameters:', { response, strategy });
      return { isCorrect: false };
    }

    try {
      const validator = createValidator(strategy);
      const result = await validator.validate(response);
      console.log('Challenge validation result:', result);
      return result;
    } catch (error) {
      console.error('Validation error:', error);
      return { isCorrect: false };
    }
  }
}

export const validationService = ValidationService.getInstance();