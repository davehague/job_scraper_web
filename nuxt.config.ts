// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  plugins: ["~/plugins/supabase.ts"],
  runtimeConfig: {
    public: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
    }
  },
});
