'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const GUEST_STORAGE_KEY = 'mise_guest_uid_v1'
const SAVE_DISMISSED_KEY = 'mise_save_signin_dismissed'

interface AuthContextType {
  user: User | null
  session: Session | null
  userId: string
  isAnonymous: boolean
  isLoading: boolean
  signInSheetOpen: boolean
  signInReason: 'account' | 'save' | 'continue_cooking' | null
  openSignInSheet: (reason?: 'account' | 'save' | 'continue_cooking') => void
  closeSignInSheet: () => void
  hasDismissedSaveSignIn: () => boolean
  markSaveSignInDismissed: () => void
  signInWithOtp: (email: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function getFallbackGuestId(): string {
  if (typeof window === 'undefined') return 'guest_default'
  try {
    let id = localStorage.getItem(GUEST_STORAGE_KEY)
    if (!id) {
      id = 'guest_' + crypto.randomUUID()
      localStorage.setItem(GUEST_STORAGE_KEY, id)
    }
    return id
  } catch {
    return 'guest_fallback'
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fallbackGuestId, setFallbackGuestId] = useState<string>(getFallbackGuestId)

  // Sheet trigger management
  const [signInSheetOpen, setSignInSheetOpen] = useState(false)
  const [signInReason, setSignInReason] = useState<'account' | 'save' | 'continue_cooking' | null>(null)

  // Initialize session & silent anonymous sign-in
  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (!mounted) return

        if (sessionData?.session?.user) {
          setSession(sessionData.session)
          setUser(sessionData.session.user)
          setIsLoading(false)
          return
        }

        // No active session — silently initiate anonymous sign-in
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
        if (!mounted) return

        if (anonData?.session?.user) {
          setSession(anonData.session)
          setUser(anonData.session.user)
        } else {
          // If anonymous sign-ins are disabled in Supabase dashboard or offline, use deterministic guest id
          if (anonError) {
            console.info('[Mise Auth] Guest anonymous session ready (local fallback):', anonError.message)
          }
          const guestId = getFallbackGuestId()
          setFallbackGuestId(guestId)
        }
      } catch (err) {
        console.warn('[Mise Auth] Init error, using guest fallback:', err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return
      setSession(currentSession)
      setUser(currentSession?.user || null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const isAnonymous = useMemo(() => {
    if (!user) return true
    return Boolean(user.is_anonymous || !user.email)
  }, [user])

  const userId = useMemo(() => {
    return user?.id || fallbackGuestId
  }, [user, fallbackGuestId])

  const openSignInSheet = useCallback((reason: 'account' | 'save' | 'continue_cooking' = 'account') => {
    setSignInReason(reason)
    setSignInSheetOpen(true)
  }, [])

  const closeSignInSheet = useCallback(() => {
    setSignInSheetOpen(false)
    setSignInReason(null)
  }, [])

  const hasDismissedSaveSignIn = useCallback(() => {
    if (typeof window === 'undefined') return false
    try {
      return sessionStorage.getItem(SAVE_DISMISSED_KEY) === 'true'
    } catch {
      return false
    }
  }, [])

  const markSaveSignInDismissed = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.setItem(SAVE_DISMISSED_KEY, 'true')
    } catch {
      // ignore
    }
  }, [])

  // Send Magic Link OTP
  const signInWithOtp = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined

        // If user is already anonymous in Supabase, update user to preserve ID
        if (user && user.is_anonymous) {
          const { error: updateError } = await supabase.auth.updateUser(
            { email },
            { emailRedirectTo: redirectTo }
          )
          if (!updateError) {
            return { success: true }
          }
          // If updateUser fails (e.g. requires password or OTP), fallback to signInWithOtp
        }

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo,
          },
        })

        if (error) {
          return { success: false, error: error.message }
        }

        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to send magic link' }
      }
    },
    [supabase, user]
  )

  // Google OAuth
  const signInWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined

      // If user is anonymous, link identity to keep same user id
      if (user && user.is_anonymous) {
        const { error: linkError } = await supabase.auth.linkIdentity({
          provider: 'google',
          options: { redirectTo },
        })
        if (!linkError) {
          return { success: true }
        }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'OAuth error' }
    }
  }, [supabase, user])

  // Sign out: IMMEDIATELY revert to fresh anonymous session, never unauthenticated
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // ignore
    }

    // Re-roll guest fallback ID or call signInAnonymously
    try {
      const { data: anonData } = await supabase.auth.signInAnonymously()
      if (anonData?.session?.user) {
        setSession(anonData.session)
        setUser(anonData.session.user)
      } else {
        const newGuest = 'guest_' + crypto.randomUUID()
        localStorage.setItem(GUEST_STORAGE_KEY, newGuest)
        setFallbackGuestId(newGuest)
        setUser(null)
        setSession(null)
      }
    } catch {
      const newGuest = 'guest_' + crypto.randomUUID()
      localStorage.setItem(GUEST_STORAGE_KEY, newGuest)
      setFallbackGuestId(newGuest)
      setUser(null)
      setSession(null)
    }
  }, [supabase])

  const value = useMemo(
    () => ({
      user,
      session,
      userId,
      isAnonymous,
      isLoading,
      signInSheetOpen,
      signInReason,
      openSignInSheet,
      closeSignInSheet,
      hasDismissedSaveSignIn,
      markSaveSignInDismissed,
      signInWithOtp,
      signInWithGoogle,
      signOut,
    }),
    [
      user,
      session,
      userId,
      isAnonymous,
      isLoading,
      signInSheetOpen,
      signInReason,
      openSignInSheet,
      closeSignInSheet,
      hasDismissedSaveSignIn,
      markSaveSignInDismissed,
      signInWithOtp,
      signInWithGoogle,
      signOut,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
