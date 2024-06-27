import mixpanel from 'mixpanel-browser'

export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  mixpanel.init(runtimeConfig.public.mixpanelToken as string, {
    debug: process.env.NODE_ENV !== 'production',
    track_pageview: true,
    persistence: 'localStorage',
    ignore_dnt: true
  })

  return {
    provide: {
      mixpanel
    }
  }
})