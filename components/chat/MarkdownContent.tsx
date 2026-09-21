'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="chat-markdown font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="text-[15px] font-bold text-stone-900 dark:text-white mt-1 mb-2 leading-snug">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h3 className="text-[14.5px] font-bold text-stone-900 dark:text-white mt-1.5 mb-2 leading-snug">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h3 className="text-[14px] font-bold text-stone-900 dark:text-white mt-1 mb-2 pb-1 border-b border-black/[0.05] dark:border-white/10 leading-snug">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[12.5px] font-bold text-[var(--accent-text-on-light)] uppercase tracking-wider mt-3 mb-1.5">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-[12.5px] leading-relaxed text-stone-700 dark:text-stone-300 mb-2.5 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[12.5px] leading-relaxed text-stone-700 dark:text-stone-300">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-stone-900 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-stone-600 dark:text-stone-400">
              {children}
            </em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 p-2.5 rounded-xl bg-[var(--accent)]/10 border-l-2 border-[var(--accent)] text-[12px] text-[var(--text-primary)] leading-relaxed">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2.5 rounded-xl border border-black/[0.08] dark:border-white/10 bg-stone-50/50 dark:bg-stone-900/40 scroll-smooth">
              <table className="w-full text-[11.5px] text-left border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-stone-100/80 dark:bg-white/5 border-b border-black/[0.06] dark:border-white/10 text-stone-900 dark:text-white font-semibold">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-2.5 py-1.5 font-bold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2.5 py-1.5 border-t border-black/[0.04] dark:border-white/5 text-stone-700 dark:text-stone-300">
              {children}
            </td>
          ),
          hr: () => <hr className="my-2.5 border-black/[0.06] dark:border-white/10" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
