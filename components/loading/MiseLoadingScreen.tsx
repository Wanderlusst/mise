'use client'

import React from 'react'

export function MiseLoadingScreen({ message = 'Preparing your kitchen…' }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 select-none"
      style={{
        backgroundColor: 'var(--bg-page)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Ambient background culinary glow */}
      <div
        className="absolute w-72 h-72 rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col items-center max-w-xs text-center">
        {/* Mise Signature Cloche & Flame Emblem */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="w-20 h-20 rounded-[24px] bg-[var(--bg-card)] border border-[var(--bg-card-border)] shadow-xl flex items-center justify-center relative overflow-hidden">
            {/* Subtle inner pulse */}
            <div
              className="absolute inset-0 opacity-15 animate-pulse"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, transparent 100%)',
              }}
            />

            <svg
              viewBox="0 0 48 48"
              width="44"
              height="44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative z-10"
            >
              {/* Platter Base */}
              <path
                d="M8 36C8 34.5 40 34.5 40 36C40 38 34 39.5 24 39.5C14 39.5 8 38 8 36Z"
                fill="var(--accent)"
                opacity="0.85"
              />
              <path
                d="M6 35.5H42"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Cloche Dome */}
              <path
                d="M10 33C10 20 16 14 24 14C32 14 38 20 38 33Z"
                fill="var(--accent)"
                fillOpacity="0.25"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Cloche Handle */}
              <circle
                cx="24"
                cy="11"
                r="2.5"
                stroke="var(--accent)"
                strokeWidth="2"
                fill="var(--bg-card)"
              />
              {/* Culinary Flame Accent */}
              <path
                d="M24 19C25.5 23 29 25 27 29C25.5 31.5 22.5 32 21.5 29C20.5 26.5 23 23.5 24 19Z"
                fill="var(--accent)"
              />
            </svg>
          </div>
        </div>

        {/* Wordmark */}
        <h1 className="font-serif text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mb-1">
          Mise
        </h1>

        <p className="text-xs font-semibold tracking-wider uppercase text-[var(--accent-text-on-light)] mb-4">
          Mise en Place
        </p>

        {/* Subtitle / Status message */}
        <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-[220px] leading-relaxed">
          {message}
        </p>

        {/* Sleek culinary progress shimmer bar */}
        <div className="w-36 h-1 rounded-full bg-[var(--bg-card-border)] overflow-hidden relative">
          <div
            className="absolute inset-y-0 w-16 rounded-full"
            style={{
              backgroundColor: 'var(--accent)',
              animation: 'miseShimmer 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes miseShimmer {
          0% {
            left: -40%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  )
}
