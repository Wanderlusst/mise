'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw,
  User as UserIcon,
  ChefHat,
  Heart,
  Volume2,
  Trash2,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { useHaptic } from '@/lib/useHaptic'
import { useSettings } from '@/lib/useSettings'
import { useSavedRecipes } from '@/lib/useSavedRecipes'
import { ChefMessage, ChefMood, resolveChefResponse } from '@/lib/chefMiseEngine'
import { ChefAvatar } from '@/components/chat/ChefAvatar'
import { ChefHero } from '@/components/chat/ChefHero'
import { SuggestionChips } from '@/components/chat/SuggestionChips'
import { CookingShortcuts } from '@/components/chat/CookingShortcuts'
import { RecipeResponseCard } from '@/components/chat/RecipeResponseCard'
import { SubstitutionCard } from '@/components/chat/SubstitutionCard'
import { FoodWasteCard } from '@/components/chat/FoodWasteCard'
import { ShelfLifeCard } from '@/components/chat/ShelfLifeCard'
import { ContextualFollowUps } from '@/components/chat/ContextualFollowUps'
import { VoiceModeOverlay } from '@/components/chat/VoiceModeOverlay'
import { MultiModalSheet } from '@/components/chat/MultiModalSheet'
import { ChatCommandBar } from '@/components/chat/ChatCommandBar'
import { MarkdownContent } from '@/components/chat/MarkdownContent'

export default function ChefMisePage() {
  const [messages, setMessages] = useState<ChefMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeChefMood, setActiveChefMood] = useState<ChefMood>('happy')
  const [isVoiceOpen, setIsVoiceOpen] = useState(false)
  const [isMultiModalOpen, setIsMultiModalOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const haptic = useHaptic()
  const { settings } = useSettings()
  const { saved } = useSavedRecipes()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Handle message sending (Text, Voice, or Chip trigger)
  const handleSend = async (queryText?: string, attachedImage?: string) => {
    const query = (queryText || inputValue).trim()
    if (!query || isTyping) return

    haptic(12)

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMsg: ChefMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: now,
      ...(attachedImage
        ? {
            multiModalCard: {
              imagePreviewUrl: attachedImage,
              detectedIngredients: ['Eggs', 'Tomatoes', 'Spinach', 'Garlic'],
              freshnessAssessment: 'Good for next 48 hours',
              recommendedAction: '12-Minute Mediterranean Shakshuka',
              matchedRecipeId: 'shakshuka-vision-001',
            },
          }
        : {}),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)
    setActiveChefMood('thinking')

    try {
      // 1. First attempt call to /api/chat with user preferences
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userPreferences: {
            diet: settings.diet,
            allergies: settings.allergies,
            staplesCount: settings.pantryStaples.length,
            savedCount: saved.length,
          },
        }),
      })

      const data = await res.json()

      // Compute mood
      const mood: ChefMood = data.chefMood || (data.cardType === 'recipe' ? 'cooking' : 'happy')
      setActiveChefMood(mood)

      const botMsg: ChefMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: data.chefText || data.reply || "Chef Mise here! Let's get cooking.",
        chefMood: mood,
        cardType: data.cardType,
        recipeCard: data.recipeCard,
        substitutionCard: data.substitutionCard,
        foodWasteCard: data.foodWasteCard,
        shelfLifeCard: data.shelfLifeCard,
        followUps: data.followUps,
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      console.warn('Network error, resolving via offline culinary engine:', err)
      const offline = resolveChefResponse(query)
      setActiveChefMood(offline.chefMood)

      const fallbackMsg: ChefMessage = {
        id: `bot-fallback-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: offline.chefText,
        chefMood: offline.chefMood,
        cardType: offline.cardType,
        recipeCard: offline.recipeCard,
        substitutionCard: offline.substitutionCard,
        foodWasteCard: offline.foodWasteCard,
        shelfLifeCard: offline.shelfLifeCard,
        followUps: offline.followUps,
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const handleResetChat = () => {
    haptic(10)
    setMessages([])
    setActiveChefMood('happy')
  }

  return (
    <>
      <main
        className="min-h-screen w-full min-w-0 px-5 pt-5 flex flex-col select-none overflow-x-hidden"
        style={{
          paddingTop: 'max(1.25rem, env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(11.5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="w-full min-w-0 flex flex-col">
        {/* ── Top Hero Header (Shows Persona & Memory) ── */}
        <ChefHero onQuickPrompt={(p) => handleSend(p)} />

        {/* ── Culinary Shortcuts (Always available for quick access) ── */}
        <CookingShortcuts
          onSelect={(q) => handleSend(q)}
          onOpenFoodWaste={() => handleSend("What's going bad in my fridge?")}
          disabled={isTyping}
        />

        {/* ── Empty State: Dynamic Conversation Starters ── */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <SuggestionChips onSelect={(q) => handleSend(q)} disabled={isTyping} />

            {/* Food Waste Assistant Callout Spotlight */}
            <div
              onClick={() => handleSend("What's going bad in my fridge?")}
              className="mt-2.5 p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--bg-card-border)] cursor-pointer active:scale-[0.98] transition-transform shadow-xs"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent-text-on-light)] flex items-center justify-center font-bold">
                    🍅
                  </div>
                  <div>
                    <span className="text-[11.5px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <span>Zero Food Waste Alert</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
                    </span>
                    <p className="text-[10.5px] text-[var(--text-secondary)]">
                      Your tomatoes expire in 2 days. Tap to see 3 rescue recipes.
                    </p>
                  </div>
                </div>
                <ArrowRight size={15} className="text-[var(--accent)] shrink-0" />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Active Conversation Thread ── */}
        {messages.length > 0 && (
          <div className="space-y-4 mb-8">
            {/* Thread top bar: status + reset */}
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/10 px-1">
              <div className="flex items-center gap-2">
                <ChefAvatar mood={activeChefMood} size="sm" />
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  Chef Mise
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">
                  {messages.length} messages
                </span>
              </div>

              <button
                onClick={handleResetChat}
                className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                <RotateCcw size={12} />
                <span>New Session</span>
              </button>
            </div>

            {/* Messages Loop */}
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Chef Avatar */}
                {msg.sender === 'assistant' && (
                  <div className="shrink-0 mt-0.5">
                    <ChefAvatar mood={msg.chefMood || 'happy'} size="sm" />
                  </div>
                )}

                {/* Assistant Message Bubble */}
                {msg.sender === 'assistant' ? (
                  <div className="max-w-[90%] sm:max-w-[85%] rounded-3xl rounded-tl-sm p-4 bg-[var(--bg-card)] border border-[var(--bg-card-border)] text-[var(--text-primary)] shadow-xs transition-colors">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--bg-card-border)]">
                      <div className="flex items-center gap-1.5">
                        <ChefHat size={11} className="text-[var(--accent)]" />
                        <span className="text-[11px] font-bold text-[var(--text-primary)]">
                          Chef Mise
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-secondary)] tabular-nums">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Conversational Text */}
                    <MarkdownContent content={msg.text} />

                    {/* Rich Response Card: Recipe */}
                    {msg.recipeCard && (
                      <RecipeResponseCard
                        recipe={msg.recipeCard}
                        onAlternative={() =>
                          handleSend(`Show me a different alternative to ${msg.recipeCard?.name}`)
                        }
                      />
                    )}

                    {/* Rich Response Card: Ingredient Substitutions */}
                    {msg.substitutionCard && (
                      <SubstitutionCard
                        data={msg.substitutionCard}
                        onSelectSwap={(swap) =>
                          handleSend(`How do I use ${swap} as a substitute?`)
                        }
                      />
                    )}

                    {/* Rich Response Card: Food Waste Rescue */}
                    {msg.foodWasteCard && (
                      <FoodWasteCard
                        data={msg.foodWasteCard}
                        onSelectRecipe={(recipeName) =>
                          handleSend(`How do I cook ${recipeName}?`)
                        }
                      />
                    )}

                    {/* Rich Response Card: Shelf Life Science */}
                    {msg.shelfLifeCard && <ShelfLifeCard data={msg.shelfLifeCard} />}

                    {/* Contextual Follow-up Chips (Only for last assistant message) */}
                    {idx === messages.length - 1 && msg.followUps && msg.followUps.length > 0 && (
                      <ContextualFollowUps
                        chips={msg.followUps}
                        onSelect={(chip) => handleSend(chip)}
                        disabled={isTyping}
                      />
                    )}
                  </div>
                ) : (
                  /* User Message Bubble */
                  <div className="max-w-[85%] rounded-3xl rounded-tr-sm px-4 py-3 bg-[var(--accent)] text-white shadow-xs">
                    {/* Optional image attachment thumbnail */}
                    {msg.multiModalCard?.imagePreviewUrl && (
                      <div className="relative h-28 w-44 rounded-2xl overflow-hidden mb-2 border border-white/20">
                        <Image
                          src={msg.multiModalCard.imagePreviewUrl}
                          alt="Uploaded ingredient"
                          fill
                          sizes="176px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <p className="text-[12.5px] leading-relaxed font-medium">
                      {msg.text}
                    </p>
                    <span className="text-[9.5px] block mt-1.5 text-right text-white/80 tabular-nums">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--bg-card-border)] shadow-xs">
                    <UserIcon size={13} />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing Indicator with Chef Avatar */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-[var(--text-primary)] bg-[var(--bg-card)] px-3.5 py-2.5 rounded-2xl w-max border border-[var(--bg-card-border)] shadow-xs"
              >
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
                <span className="text-[11px] font-semibold ml-1">
                  Chef Mise is tasting & thinking...
                </span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
        </div>
      </main>

      {/* ── Fixed Floating AI Command Bar ── */}
      <ChatCommandBar
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={() => handleSend()}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenMultiModal={() => setIsMultiModalOpen(true)}
        isTyping={isTyping}
      />

      {/* ── Multi-Modal Kitchen Scanner Sheet ── */}
      <MultiModalSheet
        isOpen={isMultiModalOpen}
        onClose={() => setIsMultiModalOpen(false)}
        onSendImageQuery={(imgUrl, query) => handleSend(query, imgUrl)}
      />

      {/* ── Fullscreen Siri / Apple Voice Experience ── */}
      <VoiceModeOverlay
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onVoiceCommand={(cmd) => handleSend(cmd)}
      />
    </>
  )
}
