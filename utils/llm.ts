export const getResponseFromGeminiFlash = async (prompt: string) => {
  try {
    const response = await fetch('/api/openrouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "google/gemini-flash-1.5",
        max_tokens: 8192,
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    console.log('Response from OpenRouter (Gemini Flash):', responseData);

    if (responseData.success) {
      return responseData.data.choices[0].message.content;

    } else {
      console.error('Error from OpenRouter:', responseData.message);
      return "\n";
    }
  } catch (error) {
    console.error('Something went wrong:', error);
    return "\n";
  }
}