// api/exchange-code.ts
import { supabase } from "@/utils/supabaseClient";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { code } = body;

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      throw sessionError;
    }

    return sessionData;
  } catch (error) {
    console.error('Error exchanging code for session:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return { error: message };
  }
});