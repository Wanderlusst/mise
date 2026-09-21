'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Sparkles, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/useAuth'
import { useHaptic } from '@/lib/useHaptic'

export function SignInSheet() {
  const {
    signInSheetOpen,
    signInReason,
    closeSignInSheet,
    markSaveSignInDismissed,
    signInWithOtp,
    signInWithGoogle,
  } = useAuth()
  const haptic = useHaptic()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleDismiss = () => {
    haptic(8)
    if (signInReason === 'save') {
      markSaveSignInDismissed()
    }
    closeSignInSheet()
    // Reset internal state after sheet closes
    setTimeout(() => {
      setSent(false)
      setErrorMsg(null)
      setEmail('')
    }, 300)
  }

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address')
      haptic(20)
      return
    }

    haptic(10)
    setLoading(true)
    setErrorMsg(null)

    const result = await signInWithOtp(email.trim())
    setLoading(false)

    if (result.success) {
      setSent(true)
      haptic(15)
    } else {
      setErrorMsg(result.error || 'Could not send magic link. Please check email.')
      haptic(25)
    }
  }

  const handleGoogleSignIn = async () => {
    haptic(10)
    setErrorMsg(null)
    setLoading(true)
    const result = await signInWithGoogle()
    setLoading(false)
    if (!result.success && result.error) {
      setErrorMsg(result.error)
    }
  }

  const getCopy = () => {
    switch (signInReason) {
      case 'save':
        return {
          title: 'Save to Your Profile',
          desc: 'Keep this recipe in your cloud cookbook so you never lose it across devices.',
        }
      case 'continue_cooking':
        return {
          title: 'Sync Cooking Session',
          desc: 'This session started on another device. Sign in to resume your active timer and steps.',
        }
      case 'account':
      default:
        return {
          title: 'Your Kitchen Profile',
          desc: 'Save your recipes, cooking history, and streaks permanently to the cloud.',
        }
    }
  }

  const copy = getCopy()

  return (
    <AnimatePresence>
      {signInSheetOpen && (
        <motion.div
          key="signin-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={handleDismiss}
          />

          {/* Bottom Sheet */}
          <motion.div
            key="signin-sheet-content"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="relative w-full max-w-mobile mx-auto bg-[var(--bg-card)] rounded-t-[36px] p-6 pb-8 pb-safe shadow-2xl z-10 border-t border-[var(--bg-card-border)] max-h-[90dvh] overflow-y-auto flex flex-col"
          >
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-600 rounded-full mx-auto mb-4 shrink-0" />

            {/* Header with Close */}
            <div className="flex items-start justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-apple font-bold text-[var(--text-primary)] tracking-tight">
                    {copy.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                    {copy.desc}
                  </p>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-white shrink-0 ml-2"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>

            {/* Main Sheet Body */}
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={26} />
                </div>
                <h4 className="text-base font-apple font-bold text-[var(--text-primary)]">
                  Check your inbox!
                </h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto leading-relaxed">
                  We sent a magic login link to <strong className="text-[var(--text-primary)]">{email}</strong>. Tap the link in your email to sign in instantly.
                </p>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="mt-4 px-6 py-2.5 rounded-full bg-[var(--accent)] text-white text-xs font-bold shadow-md hover:opacity-95 active:scale-95 transition-all"
                >
                  Got it
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4 pt-1">
                <form onSubmit={handleSendMagicLink} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail size={16} className="absolute left-3.5 text-stone-400 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="chef@example.com"
                        required
                        disabled={loading}
                        className="w-full h-12 pl-10 pr-4 rounded-2xl bg-[var(--bg-page)] border border-[var(--bg-card-border)] text-sm text-[var(--text-primary)] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition-all"
                      />
                    </div>
                    {errorMsg && (
                      <p className="text-xs text-rose-500 font-medium mt-1.5 pl-1">
                        {errorMsg}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-full bg-[var(--accent)] text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending magic link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send magic link</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3">
                  <div className="w-full border-t border-[var(--bg-card-border)]" />
                  <span className="absolute bg-[var(--bg-card)] px-3 text-[11px] font-semibold text-[var(--text-secondary)] uppercase">
                    or
                  </span>
                </div>

                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-12 rounded-full bg-[var(--bg-page)] border border-[var(--bg-card-border)] text-[var(--text-primary)] font-semibold text-xs shadow-xs hover:bg-stone-200/50 dark:hover:bg-stone-800/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Dismiss / Not now */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1 px-4"
                  >
                    Not now, continue as guest
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
