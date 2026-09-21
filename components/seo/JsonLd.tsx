import React from 'react'

export function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mise-cookbook.app'

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Organization
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Mise',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/icon.svg`,
          width: 512,
          height: 512,
        },
        sameAs: ['https://twitter.com/misecookbook'],
      },

      // 2. WebSite with SearchAction
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Mise Cookbook',
        description: 'Cook smarter with what you have. AI pantry scanner, zero-waste ingredient matching, and real-time guided cooking.',
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/mobile?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },

      // 3. WebApplication / SoftwareApplication
      {
        '@type': 'WebApplication',
        '@id': `${siteUrl}/#application`,
        name: 'Mise — Smart AI Cookbook',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'All (Web, iOS PWA, Android PWA)',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '1240',
        },
        featureList: [
          'Multi-modal camera pantry scanner',
          'Zero-waste ingredient matching algorithm',
          'Conversational AI Sous-Chef guidance',
          'Step-by-step hands-free cooking assistant with countdown timers',
          'Allergy and dietary preference personalization',
        ],
      },

      // 4. Featured Recipes with Schema.org Recipe specification
      {
        '@type': 'Recipe',
        '@id': `${siteUrl}/mobile/detail/pasta-001#recipe`,
        name: 'Garlic Pasta Aglio e Olio',
        image: [`${siteUrl}/food/pasta.jpg`],
        description: 'Traditional Neapolitan pasta sauteed with fragrant golden garlic cloves, crushed red chili flakes, and extra virgin olive oil.',
        prepTime: 'PT5M',
        cookTime: 'PT10M',
        totalTime: 'PT15M',
        recipeYield: '2 servings',
        recipeCategory: 'Main Course',
        recipeCuisine: 'Italian',
        keywords: 'pasta, aglio e olio, garlic pasta, quick dinner, vegetarian',
        suitableForDiet: 'https://schema.org/VegetarianDiet',
        recipeIngredient: [
          '200g spaghetti or fusilli',
          '4 cloves fresh garlic, thinly sliced',
          '3 tbsp extra virgin olive oil',
          '1 tsp red pepper chili flakes',
          'Handful chopped fresh parsley',
          'Salt to taste',
        ],
        recipeInstructions: [
          {
            '@type': 'HowToStep',
            text: 'Boil pasta in salted water until al dente, reserving 1/2 cup of pasta water.',
          },
          {
            '@type': 'HowToStep',
            text: 'Gently sauté sliced garlic and chili flakes in olive oil over medium-low heat until lightly golden and aromatic.',
          },
          {
            '@type': 'HowToStep',
            text: 'Toss pasta and starchy water into the garlic oil until an emulsion forms. Garnish with parsley and serve immediately.',
          },
        ],
        nutrition: {
          '@type': 'NutritionInformation',
          calories: '380 calories',
          carbohydrateContent: '52 grams',
          fatContent: '14 grams',
          proteinContent: '9 grams',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
