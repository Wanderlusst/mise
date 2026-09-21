'use client'

import React from 'react'
import { AuthProvider } from '@/lib/useAuth'
import { SignInSheet } from '@/components/auth/SignInSheet'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SmoothScrollProvider>
        {children}
      </SmoothScrollProvider>
      <SignInSheet />
    </AuthProvider>
  )
}
