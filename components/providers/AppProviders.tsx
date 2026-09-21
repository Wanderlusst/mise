'use client'

import React from 'react'
import { AuthProvider } from '@/lib/useAuth'
import { SignInSheet } from '@/components/auth/SignInSheet'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <SignInSheet />
    </AuthProvider>
  )
}
