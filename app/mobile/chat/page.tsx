'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Send,
  HelpCircle,
  Clock,
  Compass,
  Zap,
  ArrowRight,
  RotateCcw,
  Bot,
  User as UserIcon,
  ChefHat,
  Lightbulb,
} from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'
import { MarkdownContent } from '@/components/chat/MarkdownContent'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
}

// ─── 4 Curated Menu Action Cards from User Requirements ────────────────────────
const PROMPT_MENU_CARDS = [
  {
    id: 'compound',
    category: 'Mood + Time + Items',
    badgeIcon: Zap,
    badgeColor: 'text-amber-600 bg-amber-50 border-amber-200/60',
    title: `"I have eggs and rice, nothing else, and I'm exhausted"`,
    description: 'Combines time constraints, random ingredients & low energy in one sentence.',
    query: "I have eggs and rice, nothing else, and I'm exhausted. What's the easiest meal I can make?",
    accentGradient: 'from-amber-500/15 to-orange-500/5',
  },
  {
    id: 'followup',
    category: 'Recipe Context & Swaps',
    badgeIcon: HelpCircle,
    badgeColor: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
    title: `"Can I skip the yogurt?" / "What can I use instead of curry leaves?"`,
    description: 'Ask contextual follow-up questions on recipes without starting from scratch.',
    query: 'What can I use instead of curry leaves, and can I skip the yogurt in this recipe?',
    subQueries: ['Can I skip the yogurt?', 'What can I use instead of curry leaves?'],
    accentGradient: 'from-emerald-500/15 to-teal-500/5',
  },
  {
    id: 'explore',
    category: 'Open-Ended Exploration',
    badgeIcon: Compass,
    badgeColor: 'text-indigo-600 bg-indigo-50 border-indigo-200/60',
    title: `"Give me something different from what I usually make"`,
    description: 'Breaks your routine by cross-referencing your recent and saved cooking history.',
    query: 'Give me something completely different from what I usually make based on my history.',
    accentGradient: 'from-indigo-500/15 to-purple-500/5',
  },
  {
    id: 'quickfact',
    category: 'Quick Kitchen Facts',
    badgeIcon: Clock,
    badgeColor: 'text-sky-600 bg-sky-50 border-sky-200/60',
    title: `"How long does paneer keep in the fridge?"`,
    description: 'Direct kitchen facts and shelf life without needing a full recipe screen.',
    query: 'How long does paneer keep in the fridge, and how can I tell if it has gone bad?',
    accentGradient: 'from-sky-500/15 to-blue-500/5',
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const haptic = useHaptic()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim()
    if (!query || isTyping) return

    haptic(12)

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          contextRecipe: 'Dal Tadka, Rice, Salad',
        }),
      })

      const data = await res.json()
      const replyText = data.reply || "I couldn't process that right now. Please try again!"

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      console.error('Chat error:', err)
      const errorMessage: Message = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I ran into an issue connecting. Feel free to try again!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleCardClick = (query: string) => {
    handleSend(query)
  }

  return (
    <main className="min-h-screen px-4 pt-10 pb-44 max-w-mobile mx-auto flex flex-col justify-between">
      {/* ── Header ── */}
      <div>
        <header className="mb-5 px-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 dark:bg-[#2c2c2c] border border-white/60 dark:border-white/10 text-xs font-semibold text-stone-800 dark:text-stone-200 shadow-xs mb-2 transition-colors">
            <Sparkles size={14} className="text-saffron-500 dark:text-[#ffa371]" />
            <span>AI Kitchen Sous Chef</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white font-apple transition-colors">
            Ask Mise
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed transition-colors">
            Real kitchen dialogue for natural requests that don&apos;t fit into rigid filters.
          </p>
        </header>

        {/* ── 4 Curated Menu Action Cards (Shown prominently when no active conversation or at top) ── */}
        {messages.length === 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-stone-600/80 dark:text-stone-400 uppercase tracking-wider">
                Tap to Ask
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">Natural Language Flows</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {PROMPT_MENU_CARDS.map((card) => {
                const BadgeIcon = card.badgeIcon
                return (
                  <motion.div
                    key={card.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCardClick(card.query)}
                    className={`bg-white/95 dark:bg-[#2c2c2c] backdrop-blur-xl border border-black/[0.07] dark:border-white/10 rounded-2xl p-3.5 shadow-xs cursor-pointer hover:shadow-sm transition-all relative overflow-hidden bg-gradient-to-r ${card.accentGradient}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold border ${card.badgeColor}`}
                      >
                        <BadgeIcon size={12} />
                        {card.category}
                      </span>
                      <ArrowRight size={14} className="text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
                    </div>

                    <h2 className="text-[13.5px] font-bold text-stone-900 dark:text-white leading-snug">
                      {card.title}
                    </h2>
                    <p className="text-[11.5px] text-stone-600 dark:text-stone-400 mt-1 leading-normal">
                      {card.description}
                    </p>

                    {/* Sub-queries if present (e.g. for recipe swaps) */}
                    {card.subQueries && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-black/[0.05] dark:border-white/10">
                        {card.subQueries.map((sub, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCardClick(sub)
                            }}
                            className="px-2.5 py-1 rounded-full bg-stone-100/70 dark:bg-stone-800 hover:bg-stone-200/70 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-[11px] font-medium transition-colors border border-black/[0.04] dark:border-white/10"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Conversation Thread ── */}
        {messages.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/10 px-1">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Conversation</span>
              <button
                onClick={() => {
                  haptic(8)
                  setMessages([])
                }}
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-stone-900 dark:bg-[#ffa371] text-white dark:text-[#2c2c2c] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <ChefHat size={14} />
                  </div>
                )}

                {msg.sender === 'assistant' ? (
                  <div className="max-w-[85%] rounded-[20px] rounded-tl-[4px] p-4 bg-white/95 dark:bg-[#2c2c2c] backdrop-blur-xl border border-black/[0.07] dark:border-white/10 text-stone-900 dark:text-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors">
                    {/* Header with Sous Chef label and time */}
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-black/[0.05] dark:border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={12} className="text-saffron-500 dark:text-[#ffa371]" />
                        <span className="text-[11px] font-bold tracking-tight text-stone-800 dark:text-stone-200">Chef Mise</span>
                      </div>
                      <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 tabular-nums">
                        {msg.timestamp}
                      </span>
                    </div>

                    <MarkdownContent content={msg.text} />
                  </div>
                ) : (
                  <div className="max-w-[80%] rounded-[20px] rounded-tr-[4px] px-4 py-3 bg-stone-900 dark:bg-[#ffa371] text-white dark:text-[#2c2c2c] shadow-xs">
                    <p className="text-[13px] leading-relaxed font-medium">
                      {msg.text}
                    </p>
                    <span className="text-[10px] block mt-1.5 text-right text-stone-300 dark:text-[#2c2c2c]/70 tabular-nums">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 flex items-center justify-center shrink-0 mt-0.5 border border-black/[0.08] dark:border-white/10 shadow-xs">
                    <UserIcon size={14} />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-stone-600 dark:text-stone-300 bg-white/80 dark:bg-[#2c2c2c] backdrop-blur-md px-3 py-2 rounded-2xl w-max border border-black/[0.05] dark:border-white/10"
              >
                <div className="w-2 h-2 rounded-full bg-[#ffa371] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#ffa371] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[#ffa371] animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] font-medium ml-1">Chef Mise is thinking...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Fixed Chat Input Dock (Floating right above the bottom nav pill) ── */}
      <div className="fixed bottom-24 inset-x-0 z-40 max-w-mobile mx-auto px-4 pointer-events-none">
        <div className="pointer-events-auto bg-white/90 dark:bg-[#2c2c2c]/95 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-2xl shadow-[0_12px_36px_-6px_rgba(20,30,10,0.12),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] p-1.5 transition-colors">
          {/* Quick preset suggestion chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 px-1 scrollbar-none scroll-smooth">
            {[
              "I'm exhausted, 2 ingredients",
              'Can I skip yogurt?',
              'Curry leaf substitute',
              'Paneer shelf life',
              'Surprise me',
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-[#1f1f1f] hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-[10.5px] font-medium whitespace-nowrap border border-black/[0.04] dark:border-white/10 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Text Input Row */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything (mood, swaps, shelf life)..."
              className="flex-1 px-3.5 py-2.5 text-xs bg-stone-100/70 dark:bg-[#1f1f1f] rounded-xl border border-black/[0.06] dark:border-white/10 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#ffa371]/50"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-[#ffa371] text-white dark:text-[#2c2c2c] flex items-center justify-center hover:bg-stone-950 dark:hover:bg-[#ffb38a] disabled:opacity-30 active:scale-95 transition-all shadow-xs shrink-0"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
