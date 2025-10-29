import posthog from 'posthog-js'

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    posthog.init(
      import.meta.env.VITE_POSTHOG_KEY || '',
      {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      }
    )
  }
}

export { posthog }