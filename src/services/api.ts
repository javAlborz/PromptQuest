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