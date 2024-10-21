const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const API_URL = 'https://api.anthropic.com/v1/messages';

export async function getAnthropicStreamingCompletion(prompt: string, systemPrompt?: string) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  const requestBody: {
    model: string;
    max_tokens: number;
    messages: { role: string; content: string }[];
    stream: boolean;
    system?: string;
  } = {
    model: "claude-3-haiku-20240307",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
    stream: true
  };

  if (systemPrompt) {
    requestBody.system = systemPrompt;
  }

  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const stream = response.body;
    if (!stream) {
      throw new Error('No stream returned from Anthropic API');
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                controller.enqueue(line + '\n');
              }
            }
          }
        } finally {
          reader.releaseLock();
          controller.close();
        }
      },
    });
  } catch (error) {
    console.error('Error in getAnthropicStreamingCompletion:', error);
    throw error;
  }
}