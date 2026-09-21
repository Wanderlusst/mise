import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mise-cookbook.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/mobile', '/mobile/*', '/llms.txt', '/llms-full.txt'],
        disallow: ['/api/', '/debug/', '/_next/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-Web',
          'Anthropic-AI',
          'PerplexityBot',
          'Applebot-Extended',
          'Google-Extended',
          'cohere-ai',
          'Diffbot',
        ],
        allow: ['/', '/mobile', '/mobile/*', '/llms.txt', '/llms-full.txt'],
        disallow: ['/api/', '/debug/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
