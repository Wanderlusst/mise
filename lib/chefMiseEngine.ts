// ─── Rich Types for Chef Mise Conversational Responses ────────────────────────

export interface RecipeCardData {
  id: string
  name: string
  image: string
  time: number
  difficulty: 'Easy' | 'Medium' | 'Quick'
  calories: number
  diet: 'veg' | 'non-veg' | 'vegan' | 'jain'
  servings: number
  ingredientsTotal: number
  ingredientsHave: number
  missingIngredient?: string
  haveIngredients: string[]
  missingIngredients: string[]
  summary: string
  quickSteps: string[]
  chefTip: string
  tags: string[]
}

export interface SubstitutionItem {
  name: string
  ratio: string
  flavorNote: string
  bestFor: string
}

export interface SubstitutionCardData {
  originalIngredient: string
  canOmit: boolean
  omitVerdict: string
  swaps: SubstitutionItem[]
  chefProTip: string
}

export interface FoodWasteRescueOption {
  recipeId: string
  name: string
  time: number
  image: string
  whyItSaves: string
}

export interface FoodWasteCardData {
  expiringItem: string
  daysLeft: number
  urgency: 'critical' | 'moderate'
  rescueOptions: FoodWasteRescueOption[]
  storageExtensionTip: string
}

export interface ShelfLifeCardData {
  item: string
  freshDuration: string
  storageMethod: string
  waterImmersionTrick?: string
  spoilageCheck: {
    smell: string
    texture: string
    appearance: string
  }
}

export interface MultiModalAnalysisData {
  imagePreviewUrl: string
  detectedIngredients: string[]
  freshnessAssessment: string
  recommendedAction: string
  matchedRecipeId: string
}

export type ChefMood = 'happy' | 'thinking' | 'celebrating' | 'cooking' | 'helpful'

export interface ChefMessage {
  id: string
  sender: 'user' | 'assistant'
  timestamp: string
  text: string
  chefMood?: ChefMood
  cardType?: 'recipe' | 'substitution' | 'food_waste' | 'shelf_life' | 'multimodal'
  recipeCard?: RecipeCardData
  substitutionCard?: SubstitutionCardData
  foodWasteCard?: FoodWasteCardData
  shelfLifeCard?: ShelfLifeCardData
  multiModalCard?: MultiModalAnalysisData
  followUps?: string[]
}

// ─── Curated Rich Culinary Library ──────────────────────────────────────────

export const CULINARY_RESPONSES: {
  exhausted: {
    chefText: string
    recipe: RecipeCardData
    followUps: string[]
  }
  eggs_only: {
    chefText: string
    recipe: RecipeCardData
    followUps: string[]
  }
  yogurt_sub: {
    chefText: string
    substitution: SubstitutionCardData
    followUps: string[]
  }
  curry_leaves_sub: {
    chefText: string
    substitution: SubstitutionCardData
    followUps: string[]
  }
  food_waste_tomatoes: {
    chefText: string
    foodWaste: FoodWasteCardData
    followUps: string[]
  }
  paneer_shelf: {
    chefText: string
    shelfLife: ShelfLifeCardData
    followUps: string[]
  }
  surprise_routine: {
    chefText: string
    recipe: RecipeCardData
    followUps: string[]
  }
  spicy_dinner: {
    chefText: string
    recipe: RecipeCardData
    followUps: string[]
  }
  sweet_snack: {
    chefText: string
    recipe: RecipeCardData
    followUps: string[]
  }
  healthy_bowl: {
    chefText: string
    recipe: RecipeCardData
    followUps: string[]
  }
} = {
  exhausted: {
    chefText:
      "I hear you! When you're completely drained, the kitchen should be kind. Let's make this ultra-comforting 1-pan egg fried rice. Exactly 10 minutes, zero stress, and you already have 4 out of 5 ingredients.",
    recipe: {
      id: 'rice-comfort-001',
      name: '10-Minute Comfort Egg Fried Rice',
      image: '/food/bowl.jpg',
      time: 10,
      difficulty: 'Easy',
      calories: 460,
      diet: 'veg',
      servings: 1,
      ingredientsTotal: 5,
      ingredientsHave: 4,
      missingIngredient: 'Soy Sauce',
      haveIngredients: ['Cooked Rice', 'Eggs (2)', 'Butter / Cooking Oil', 'Salt & Black Pepper'],
      missingIngredients: ['Soy Sauce (Optional dash)'],
      summary: 'Buttery, golden scrambled eggs folded into hot crisp rice with pepper and a hint of toasted garlic.',
      quickSteps: [
        'Melt 1 tbsp butter in a hot pan over medium heat.',
        'Crack in 2 eggs, swirl for 30s until soft and glossy.',
        'Dump in leftover cold rice, season with salt & pepper, and toss for 2 mins.',
      ],
      chefTip: 'Eat it directly out of the pan or deep bowl with a spoon. Only 1 utensil to wash tonight!',
      tags: ['1-Pan', 'Low Effort', 'Comfort Food', '10 Mins'],
    },
    followUps: [
      'Can I make it spicy?',
      'Can I add vegetables?',
      'What if I have no soy sauce?',
      'Show another 5-minute meal',
    ],
  },

  eggs_only: {
    chefText:
      "With just eggs, you can make magic! Let's whip up a velvety French-style Herb Folded Omelette. Soft, custardy, and melts in your mouth.",
    recipe: {
      id: 'egg-omelette-002',
      name: 'Silky French Herb Folded Omelette',
      image: '/food/yogurt.jpg',
      time: 8,
      difficulty: 'Quick',
      calories: 280,
      diet: 'veg',
      servings: 1,
      ingredientsTotal: 3,
      ingredientsHave: 3,
      haveIngredients: ['Eggs (3)', 'Butter or Olive Oil (1 tbsp)', 'Salt & Pepper'],
      missingIngredients: [],
      summary: 'Gently beaten eggs cooked over low heat with butter until silky smooth, then rolled into a tender crescent.',
      quickSteps: [
        'Beat 3 eggs vigorously with a pinch of salt until completely uniform.',
        'Melt butter in a non-stick pan over low heat without letting it brown.',
        'Pour eggs in, shake pan continuously in circles for 90 seconds, then roll gently onto plate.',
      ],
      chefTip: 'The secret is low heat and taking it off the flame while the top is still glossy.',
      tags: ['High Protein', 'Gluten-Free', '8 Mins'],
    },
    followUps: [
      'Can I add cheese?',
      'Can I make it spicy with chili oil?',
      'Can I poach eggs instead?',
      'What else can I make with eggs?',
    ],
  },

  yogurt_sub: {
    chefText:
      "Great question! Whether you're making a curry or a marinade, you definitely don't need to run to the store. Here are the culinary replacements with the exact ratios:",
    substitution: {
      originalIngredient: 'Plain Yogurt (Dahi / Curd)',
      canOmit: true,
      omitVerdict: 'Yes! In curries you can omit it if you add 1 tsp lemon juice for tang at the end.',
      swaps: [
        {
          name: 'Cashew Paste + Lemon Juice',
          ratio: '2 tbsp soaked cashews blended with water = 1/2 cup yogurt',
          flavorNote: 'Silky, luxurious texture with no sour aftertaste.',
          bestFor: 'Rich curries, Paneer butter masala, Korma gravies',
        },
        {
          name: 'Tomato Puree + Splash of Milk',
          ratio: '3 tbsp tomato puree = 1/4 cup yogurt',
          flavorNote: 'Natural body and acidity, vibrant orange hue.',
          bestFor: 'Tadka dals, spiced stir-fries, sabzis',
        },
        {
          name: 'Coconut Milk / Cream',
          ratio: '1:1 ratio',
          flavorNote: 'Delicate tropical sweetness, entirely dairy-free.',
          bestFor: 'South Indian curries, Stews, Thai curries',
        },
        {
          name: 'Lemon Juice + Oil (Marinades)',
          ratio: '1 tbsp lemon juice + 1 tbsp oil per 1/2 cup yogurt',
          flavorNote: 'The citric acid breaks down proteins just like lactic acid.',
          bestFor: 'Tandoori skewers, roasted vegetables, marinades',
        },
      ],
      chefProTip: 'Always temper heat before stirring in creamy substitutes so they never curdle!',
    },
    followUps: [
      'What about Greek yogurt?',
      'Can I use sour cream?',
      'Is mayonnaise a good substitute?',
      'Show me a yogurt-free curry',
    ],
  },

  curry_leaves_sub: {
    chefText:
      "Curry leaves (Kadi Patta) have that unmistakable citrusy, nutty aroma. While they have a distinct flavor profile, here is how top chefs recreate that aroma profile at home:",
    substitution: {
      originalIngredient: 'Curry Leaves (Kadi Patta)',
      canOmit: true,
      omitVerdict: 'Yes! In standard dal or sabzi, simply increase cumin seeds (jeera) and add a pinch of asafetida (hing).',
      swaps: [
        {
          name: 'Lime Zest + Fresh Basil (Chef Favorite)',
          ratio: 'Zest of 1/2 lime + 4 torn basil leaves',
          flavorNote: 'Matches the bright citrus-herbal note remarkably well.',
          bestFor: 'Sambar, Dal Tadka, Coconut chutneys',
        },
        {
          name: 'Kaffir Lime Leaves',
          ratio: 'Use half the amount (stronger aromatic intensity)',
          flavorNote: 'Deep kaffir citrus aroma with mild herbal bite.',
          bestFor: 'South Indian gravies, rasam, broths',
        },
        {
          name: 'Bay Leaf (Tej Patta) + Fresh Lemon',
          ratio: '1 bay leaf in oil + squeeze of lemon juice at finish',
          flavorNote: 'Woodsy warm background with fresh citrus lift.',
          bestFor: 'Pulao, Biryani, hearty lentil stews',
        },
      ],
      chefProTip: 'Sizzle the lime zest in warm oil for just 5 seconds so the essential oils bloom without burning.',
    },
    followUps: [
      'Can I use dried curry leaves?',
      'Can I freeze fresh curry leaves?',
      'Substitute for mustard seeds?',
      'Show South Indian recipes',
    ],
  },

  food_waste_tomatoes: {
    chefText:
      "I spotted that you have ripe tomatoes that are best used in the next 48 hours! Let's rescue them before they get too soft. Here are 3 delicious high-impact ways to use them up right now:",
    foodWaste: {
      expiringItem: 'Fresh Tomatoes (3-4 ripe)',
      daysLeft: 2,
      urgency: 'critical',
      storageExtensionTip: 'Keep them on the counter stem-side down to prevent moisture loss, or freeze whole in a zip bag for future gravies.',
      rescueOptions: [
        {
          recipeId: 'pasta-001',
          name: 'Burst Tomato Garlic Fusilli',
          time: 15,
          image: '/food/pasta.jpg',
          whyItSaves: 'Blisters 4 whole tomatoes into a silky, sweet homemade pasta sauce with garlic slivers.',
        },
        {
          recipeId: 'shakshuka-003',
          name: '15-Min Skillet Shakshuka',
          time: 15,
          image: '/food/bowl.jpg',
          whyItSaves: 'Simmers chopped ripe tomatoes with cumin, chili flakes, and poached eggs.',
        },
        {
          recipeId: 'salad-001',
          name: 'Crisp Mediterranean Tomato Bowl',
          time: 8,
          image: '/food/salad.jpg',
          whyItSaves: 'Tosses juicy wedges with cucumbers, olive oil, cracked pepper, and oregano.',
        },
      ],
    },
    followUps: [
      'Start the Burst Tomato Fusilli',
      'Can I freeze the tomatoes instead?',
      'How to make tomato puree from scratch?',
      'What other ingredients are expiring?',
    ],
  },

  paneer_shelf: {
    chefText:
      "Paneer freshness is all about moisture control and water immersion! Here's the exact culinary breakdown and the chef trick to double its shelf life:",
    shelfLife: {
      item: 'Fresh & Store-Bought Paneer',
      freshDuration: '3 to 4 days (Opened) • 6 to 7 days (with water trick)',
      storageMethod: 'Submerged in cold clean water inside an airtight glass container in the coldest fridge section.',
      waterImmersionTrick:
        'Submerge the paneer block completely in cold filtered water and change the water every 24 hours. This keeps it soft, prevents sour surface bacteria, and doubles freshness!',
      spoilageCheck: {
        smell: 'Sour, tangy, or pungent fermented odor (fresh paneer smells mild and sweet like milk).',
        texture: 'Sticky, slimy, or gelatinous coating when touched under running water.',
        appearance: 'Yellowing edges, gray spots, or water turning murky and frothy.',
      },
    },
    followUps: [
      'Can I freeze paneer?',
      'How to soften rubbery paneer?',
      'Quick paneer bhurji recipe',
      'How long does tofu keep?',
    ],
  },

  surprise_routine: {
    chefText:
      "Let's break out of your weeknight comfort zone! You've had pasta and rice recently, so let's do something vibrant, crunchy, and refreshing: a Mediterranean Quinoa Harvest Bowl with toasted pumpkin seeds.",
    recipe: {
      id: 'bowl-001',
      name: 'Mediterranean Quinoa Harvest Bowl',
      image: '/food/salad.jpg',
      time: 15,
      difficulty: 'Easy',
      calories: 420,
      diet: 'vegan',
      servings: 2,
      ingredientsTotal: 6,
      ingredientsHave: 5,
      missingIngredient: 'Tahini',
      haveIngredients: ['Quinoa / Grain', 'Cucumbers', 'Cherry Tomatoes', 'Spinach or Greens', 'Lemon & Olive Oil'],
      missingIngredients: ['Tahini Dressing (swap with Greek yogurt or olive oil)'],
      summary: 'Fluffy warm quinoa tossed with crisp diced cucumbers, sweet burst tomatoes, fresh mint, and lemon vinaigrette.',
      quickSteps: [
        'Warm 1 cup cooked quinoa in a bowl with a drizzle of olive oil.',
        'Dice cucumbers and tomatoes, season with sea salt and cracked pepper.',
        'Layer greens, warm quinoa, crisp veggies, and finish with fresh lemon juice.',
      ],
      chefTip: 'Toast cumin seeds in warm olive oil and pour over the greens for a warm, fragrant crunch.',
      tags: ['Refreshing', 'Vegan', 'High Fiber', 'Routine Breaker'],
    },
    followUps: [
      'Can I add grilled chicken or tofu?',
      'Give me an Indian alternative',
      'Show a 10-minute soup instead',
      'Another surprise idea',
    ],
  },

  spicy_dinner: {
    chefText:
      "Craving that comforting warmth and punchy heat? Let's make an aromatic Spicy Garlic & Chili Fusilli. It brings bold warmth without burning your palate.",
    recipe: {
      id: 'pasta-001',
      name: 'Spicy Garlic & Crushed Chili Fusilli',
      image: '/food/pasta.jpg',
      time: 15,
      difficulty: 'Easy',
      calories: 510,
      diet: 'veg',
      servings: 2,
      ingredientsTotal: 5,
      ingredientsHave: 5,
      haveIngredients: ['Fusilli Pasta', 'Garlic (5 cloves)', 'Chili Flakes & Oil', 'Cherry Tomatoes', 'Parsley or Coriander'],
      missingIngredients: [],
      summary: 'Al dente pasta spirals tossed in slowly sizzled garlic chips, fiery Calabrian-style chili flakes, and burst tomatoes.',
      quickSteps: [
        'Boil fusilli in salted water for 9 mins until al dente.',
        'Sizzle sliced garlic and crushed chili flakes in 2 tbsp olive oil on low heat until golden.',
        'Dump pasta with 3 tbsp pasta water into the hot chili oil and toss vigorously to emulsify.',
      ],
      chefTip: 'Never rush the garlic in chili oil—keep heat low so it toasts to a hazelnut golden brown.',
      tags: ['Spicy', 'Italian Comfort', '15 Mins'],
    },
    followUps: [
      'How to make it extra fiery?',
      'Can I add paneer or chicken?',
      'Can I make this with noodles?',
      'Cheaper version',
    ],
  },

  sweet_snack: {
    chefText:
      "Need a delightful pick-me-up without turning into a sugar coma? Let's make a 5-minute Honey Berry Crunch Parfait.",
    recipe: {
      id: 'yogurt-001',
      name: 'Honey Berry Crunch Parfait',
      image: '/food/yogurt.jpg',
      time: 5,
      difficulty: 'Quick',
      calories: 260,
      diet: 'veg',
      servings: 1,
      ingredientsTotal: 4,
      ingredientsHave: 4,
      haveIngredients: ['Greek Yogurt or Curd', 'Honey / Maple', 'Fresh or Frozen Berries', 'Granola or Toasted Nuts'],
      missingIngredients: [],
      summary: 'Thick velvety yogurt layered with juicy berries, a drizzle of wild blossom honey, and toasted granola crunch.',
      quickSteps: [
        'Spoon 3/4 cup thick chilled yogurt into a small glass.',
        'Layer with sweet berries and a pinch of cinnamon.',
        'Crown with golden toasted granola and drizzle 1 tsp honey.',
      ],
      chefTip: 'A tiny pinch of flaky sea salt on top makes the honey taste twice as rich.',
      tags: ['5 Mins', 'Healthy Sweet', 'No Cook'],
    },
    followUps: [
      'Can I make it vegan?',
      'Can I use mango instead?',
      'Show a warm dessert',
      'Dessert with chocolate',
    ],
  },

  healthy_bowl: {
    chefText:
      "Clean, colorful, and energizing! Here is our Green Garden Power Salad with lemon vinaigrette. High fiber, light on the stomach, and ready in 8 minutes.",
    recipe: {
      id: 'bowl-healthy-001',
      name: 'Crisp Green Garden Power Bowl',
      image: '/food/salad.jpg',
      time: 8,
      difficulty: 'Quick',
      calories: 310,
      diet: 'vegan',
      servings: 1,
      ingredientsTotal: 5,
      ingredientsHave: 5,
      haveIngredients: ['Baby Spinach', 'Cucumber', 'Avocado', 'Sunflower / Pumpkin Seeds', 'Olive Oil & Lemon'],
      missingIngredients: [],
      summary: 'Tender baby greens and cool crisp cucumbers tossed in zesty lemon vinaigrette with creamy avocado and toasted seeds.',
      quickSteps: [
        'Whisk 1 tbsp extra virgin olive oil, 1 tbsp lemon juice, salt, and black pepper.',
        'Slice cucumber and avocado into bite-sized wedges.',
        'Toss greens with dressing and top with seeds for crunch.',
      ],
      chefTip: 'Dress the greens right before eating so they stay shatteringly crisp.',
      tags: ['Keto Friendly', 'Vegan', 'Super Clean', '8 Mins'],
    },
    followUps: [
      'Add a protein source',
      'What dressing can I make without lemon?',
      'Can I pack this for lunch?',
      'Show another healthy meal',
    ],
  },
}

// ─── Query Matcher Function ──────────────────────────────────────────────────

export function resolveChefResponse(userQuery: string): {
  chefText: string
  chefMood: ChefMood
  cardType?: 'recipe' | 'substitution' | 'food_waste' | 'shelf_life' | 'multimodal'
  recipeCard?: RecipeCardData
  substitutionCard?: SubstitutionCardData
  foodWasteCard?: FoodWasteCardData
  shelfLifeCard?: ShelfLifeCardData
  multiModalCard?: MultiModalAnalysisData
  followUps: string[]
} {
  const q = userQuery.toLowerCase().trim()

  // 1. Food waste / Expiring
  if (
    q.includes('waste') ||
    q.includes('expir') ||
    q.includes('going bad') ||
    q.includes('spoil') ||
    (q.includes('leftover') && q.includes('fridge')) ||
    q.includes('reduce food waste') ||
    q.includes('what\'s going bad')
  ) {
    return {
      chefMood: 'helpful',
      cardType: 'food_waste',
      chefText: CULINARY_RESPONSES.food_waste_tomatoes.chefText,
      foodWasteCard: CULINARY_RESPONSES.food_waste_tomatoes.foodWaste,
      followUps: CULINARY_RESPONSES.food_waste_tomatoes.followUps,
    }
  }

  // 2. Exhausted / Tired / Quick
  if (
    q.includes('exhaust') ||
    q.includes('tired') ||
    (q.includes('eggs') && q.includes('rice')) ||
    q.includes('10 minute') ||
    q.includes('dinner in 10')
  ) {
    return {
      chefMood: 'happy',
      cardType: 'recipe',
      chefText: CULINARY_RESPONSES.exhausted.chefText,
      recipeCard: CULINARY_RESPONSES.exhausted.recipe,
      followUps: CULINARY_RESPONSES.exhausted.followUps,
    }
  }

  // 3. Eggs only
  if (q.includes('only have eggs') || (q.includes('eggs') && !q.includes('rice') && !q.includes('yogurt'))) {
    return {
      chefMood: 'cooking',
      cardType: 'recipe',
      chefText: CULINARY_RESPONSES.eggs_only.chefText,
      recipeCard: CULINARY_RESPONSES.eggs_only.recipe,
      followUps: CULINARY_RESPONSES.eggs_only.followUps,
    }
  }

  // 4. Yogurt / Curd / Dahi substitution
  if (q.includes('yogurt') || q.includes('curd') || q.includes('dahi') || q.includes('skip yogurt')) {
    return {
      chefMood: 'thinking',
      cardType: 'substitution',
      chefText: CULINARY_RESPONSES.yogurt_sub.chefText,
      substitutionCard: CULINARY_RESPONSES.yogurt_sub.substitution,
      followUps: CULINARY_RESPONSES.yogurt_sub.followUps,
    }
  }

  // 5. Curry leaves / Kadi patta
  if (q.includes('curry leaf') || q.includes('curry leaves') || q.includes('kadi patta')) {
    return {
      chefMood: 'thinking',
      cardType: 'substitution',
      chefText: CULINARY_RESPONSES.curry_leaves_sub.chefText,
      substitutionCard: CULINARY_RESPONSES.curry_leaves_sub.substitution,
      followUps: CULINARY_RESPONSES.curry_leaves_sub.followUps,
    }
  }

  // 6. Paneer shelf life / fridge storage
  if (q.includes('paneer') || (q.includes('shelf life') && !q.includes('waste'))) {
    return {
      chefMood: 'helpful',
      cardType: 'shelf_life',
      chefText: CULINARY_RESPONSES.paneer_shelf.chefText,
      shelfLifeCard: CULINARY_RESPONSES.paneer_shelf.shelfLife,
      followUps: CULINARY_RESPONSES.paneer_shelf.followUps,
    }
  }

  // 7. Surprise / Routine break
  if (q.includes('surprise') || q.includes('different') || q.includes('routine') || q.includes('explore')) {
    return {
      chefMood: 'celebrating',
      cardType: 'recipe',
      chefText: CULINARY_RESPONSES.surprise_routine.chefText,
      recipeCard: CULINARY_RESPONSES.surprise_routine.recipe,
      followUps: CULINARY_RESPONSES.surprise_routine.followUps,
    }
  }

  // 8. Spicy dinner
  if (q.includes('spicy') || q.includes('chili') || q.includes('hot')) {
    return {
      chefMood: 'cooking',
      cardType: 'recipe',
      chefText: CULINARY_RESPONSES.spicy_dinner.chefText,
      recipeCard: CULINARY_RESPONSES.spicy_dinner.recipe,
      followUps: CULINARY_RESPONSES.spicy_dinner.followUps,
    }
  }

  // 9. Sweet snack / dessert
  if (q.includes('sweet') || q.includes('dessert') || q.includes('snack') || q.includes('sugar')) {
    return {
      chefMood: 'happy',
      cardType: 'recipe',
      chefText: CULINARY_RESPONSES.sweet_snack.chefText,
      recipeCard: CULINARY_RESPONSES.sweet_snack.recipe,
      followUps: CULINARY_RESPONSES.sweet_snack.followUps,
    }
  }

  // 10. Healthy / Salad / Greens
  if (q.includes('healthy') || q.includes('salad') || q.includes('greens') || q.includes('diet')) {
    return {
      chefMood: 'happy',
      cardType: 'recipe',
      chefText: CULINARY_RESPONSES.healthy_bowl.chefText,
      recipeCard: CULINARY_RESPONSES.healthy_bowl.recipe,
      followUps: CULINARY_RESPONSES.healthy_bowl.followUps,
    }
  }

  // 11. Multi-modal / Photo analysis query
  if (
    q.includes('fridge photo') ||
    q.includes('scan') ||
    q.includes('what recipe is this') ||
    q.includes('can i make anything with this') ||
    q.includes('upload') ||
    q.includes('camera')
  ) {
    return {
      chefMood: 'celebrating',
      cardType: 'recipe',
      chefText:
        "I analyzed your ingredients! I spotted eggs, fresh baby spinach, cherry tomatoes, and garlic. Let's make an incredible 12-minute Mediterranean Egg Shakshuka Skillet!",
      recipeCard: {
        id: 'shakshuka-vision-001',
        name: 'Garden Fresh 12-Min Shakshuka Skillet',
        image: '/food/bowl.jpg',
        time: 12,
        difficulty: 'Easy',
        calories: 340,
        diet: 'veg',
        servings: 2,
        ingredientsTotal: 5,
        ingredientsHave: 5,
        haveIngredients: ['Farm Eggs (3)', 'Ripe Tomatoes', 'Baby Spinach', 'Garlic', 'Olive Oil'],
        missingIngredients: [],
        summary: 'Warm skillet of slowly simmered tomatoes and wilted spinach cradling sunny poached eggs with cracked black pepper.',
        quickSteps: [
          'Sizzle sliced garlic in olive oil, toss in chopped tomatoes and pinch of salt.',
          'Let tomatoes bubble into a thick sauce (4 mins), then stir in spinach until wilted.',
          'Make 3 wells, crack eggs inside, cover with lid on low heat for 4 minutes until whites set.',
        ],
        chefTip: 'Serve straight from the pan with toasted bread or pita to mop up the golden yolks.',
        tags: ['Vision Match', 'Zero Waste', 'High Protein', '12 Mins'],
      },
      followUps: [
        'Can I add feta cheese?',
        'Show a non-egg version',
        'Can I make this spicy?',
        'Scan another ingredient',
      ],
    }
  }

  // Default fallback with helpful chef recommendations
  return {
    chefMood: 'helpful',
    cardType: 'recipe',
    chefText: `👨‍🍳 Great to cook together! Based on what's fresh and delicious right now, here is my top recommendation for you: 10-Minute Comfort Egg Fried Rice. It's fast, forgiving, and uses staples you likely already have.`,
    recipeCard: CULINARY_RESPONSES.exhausted.recipe,
    followUps: [
      'Can I make it spicy?',
      'Can I air fry this?',
      'Can I skip garlic?',
      'Show vegetarian version',
      'Faster version',
      'Cheaper version',
    ],
  }
}
