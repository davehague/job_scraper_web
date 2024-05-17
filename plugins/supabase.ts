// plugins/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
    
  const config = useRuntimeConfig();
  const supabaseUrl = config.public.SUPABASE_URL as string;
  const supabaseKey = config.public.SUPABASE_KEY as string;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: "jobscraper" },
  });

  nuxtApp.provide("supabase", supabase);
});
