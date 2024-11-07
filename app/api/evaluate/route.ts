// app/api/evaluate/route.ts

import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

interface ValidationResult {
  isCorrect: boolean;
  reason?: string;
}

export async function POST(req: Request) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  try {
    const { response, evaluationPrompt } = await req.json();
    
    console.log('Evaluating response:', JSON.stringify(response));

    const promptContent = `
You are a validator for responses in a prompt engineering game. You have access to a validation function:

<function_call>
{
  "name": "validate_response",
  "parameters": {
    "is_correct": "boolean - whether the response meets ALL criteria",
    "reason": "string - explanation of why the response is incorrect (if applicable)"
  }
}
</function_call>

Response to evaluate: "${response.trim()}"

Evaluation criteria:
${evaluationPrompt}

Analyze the response strictly against the criteria and call the validation function with your assessment.
Any deviation from the criteria should result in is_correct being false.
Include a clear reason if the response is incorrect.
`.trim();

    const anthropicResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        messages: [{ role: "user", content: promptContent }],
        stream: false
      })
    });

    if (!anthropicResponse.ok) {
      throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
    }

    const data = await anthropicResponse.json();
    const content = data.content[0]?.text || '';
    console.log('Raw evaluation response:', content);

    // Extract function call from response
    const functionCallMatch = content.match(/<function_call>(.*?)<\/function_call>/s);
    if (functionCallMatch) {
      try {
        const functionCall = JSON.parse(functionCallMatch[1]);
        console.log('Parsed validation result:', functionCall);
        
        // Extract the is_correct value from the parameters
        const isCorrect = functionCall.parameters?.is_correct;
        const reason = functionCall.parameters?.reason;
        
        return NextResponse.json({ 
          isCorrect: isCorrect === true, // Ensure boolean conversion
          reason: reason || undefined
        });
      } catch (e) {
        console.error('Error parsing function call:', e);
        return NextResponse.json({ isCorrect: false, reason: 'Invalid validation response' });
      }
    } else {
      console.log('No function call found in response:', content);
      return NextResponse.json({ isCorrect: false, reason: 'No validation result found' });
    }
  } catch (error) {
    console.error('Evaluation endpoint error:', error);
    return NextResponse.json({ isCorrect: false, reason: 'Evaluation failed' });
  }
}