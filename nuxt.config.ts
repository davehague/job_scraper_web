// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],
  plugins: ["~/plugins/analytics.client.ts"],
  css: ["~/assets/global.css", "@fortawesome/fontawesome-free/css/all.css"],
});
