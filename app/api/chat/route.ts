import { NextResponse } from 'next/server';
import { getAnthropicStreamingCompletion } from '../anthropic';

export async function POST(req: Request) {
  try {
    const { prompt, systemPrompt } = await req.json();
    const stream = await getAnthropicStreamingCompletion(prompt, systemPrompt);

    if (!stream) {
      throw new Error('No stream returned from Anthropic API');
    }

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}