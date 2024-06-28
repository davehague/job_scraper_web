import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { user_id, resume } = body;

  try {
    const apiKey = process.env.GOOGLE_CLOUD_FUNCTION_API_KEY
  
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Server configuration error: API key is missing'
      })
    }

    const response = await fetch('https://us-east4-jobsapp-426213.cloudfunctions.net/jobs_app_function', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({ user_id, resume }),
    });

    if (!response.ok) {
      throw new Error('Failed to post data to Google Cloud Function');
    }

    const result = await response.text();
    return result;
  } catch (error) {
    console.error('API call error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return { error: message };
  }
});
