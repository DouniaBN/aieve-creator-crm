import React, { createContext, useContext, ReactNode } from 'react'
import { posthog } from '../lib/posthog'

interface PostHogContextType {
  track: (eventName: string, properties?: Record<string, any>) => void
  capture: (eventName: string, properties?: Record<string, any>) => void
}

const PostHogContext = createContext<PostHogContextType | null>(null)

export const usePostHog = () => {
  const context = useContext(PostHogContext)
  if (!context) {
    throw new Error('usePostHog must be used within a PostHogProvider')
  }
  return context
}

export const PostHogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const track = (eventName: string, properties?: Record<string, any>) => {
    posthog.capture(eventName, properties)
  }

  const capture = (eventName: string, properties?: Record<string, any>) => {
    posthog.capture(eventName, properties)
  }

  return (
    <PostHogContext.Provider value={{ track, capture }}>
      {children}
    </PostHogContext.Provider>
  )
}