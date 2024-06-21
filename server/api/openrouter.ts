// server/api/openRouterChat.ts
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const { model, messages, max_tokens} = await readBody(event);
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'mistralai/mistral-7b-instruct:free',
        messages: messages,
        max_tokens: max_tokens || 300,
      }),
    });

    if (response.status != 200) {
      console.log('Failed to fetch from OpenRouter:', response.statusText);
      throw new Error('Failed to fetch from OpenRouter');
    }

    const responseData = await response.json();
    return {
      success: true,
      message: 'Message generated successfully',
      data: responseData,
    };
  } catch (error) {
    console.error('Error connecting to OpenRouter:', error);
    return {
      success: false,
      message: 'Failed to connect to OpenRouter',
      error: (error as Error).message || 'Unknown error',
    };
  }
});
