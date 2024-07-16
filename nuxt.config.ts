// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'vercel',
    vercel: {
      functions: {
        'api/upload-resume.ts': {
          maxDuration: 60,
        }
      }
    },
    serverHandlers: [
      {
        route: '/api/upload-resume',
        handler: '~/server/api/upload-resume'
      }
    ]
  },
  devtools: { enabled: true },
  devServer: {
    https: {
      key: './localhost-key.pem',
      cert: './localhost.pem',
    }
  },
  app: {
    head: {
      title: "Jobs!",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "msapplication-TileColor", content: "#2b5797" },
        { name: "theme-color", content: "#ffffff" },
      ],
      link: [
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
      ],
    },
  },
  modules: ["@pinia/nuxt", 'nuxt-vue3-google-signin'],
  googleSignIn: {
    clientId: process.env.GOOGLE_SIGNIN_CLIENT_ID || 'NOT SET, CHECK .ENV FILE'
  },
  runtimeConfig: {
    public: {
      baseURL: process.env.BASE_URL || 'https://localhost:3000',
      mixpanelToken: process.env.MIXPANEL_TOKEN || 'NOT SET, CHECK .ENV FILE'
    },
  },
  plugins: ["~/plugins/analytics.client.ts", 
    { src: '~/plugins/mixpanel.ts', mode: 'client' }
  ],
  css: ["~/assets/global.css", "@fortawesome/fontawesome-free/css/all.css"],
} as any);
