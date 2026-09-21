/**
 * Ingredient Details & Nutritional Intelligence
 * Provides real culinary metadata, caloric estimates, key nutrients,
 * hydration levels, and chef prep tips for ingredients.
 */

export interface IngredientMeta {
  calories: string
  nutrient: string
  hydration: string
  prepTip: string
  category: string
}

// ── Known Ingredient Knowledge Base ──────────────────────────────────────────
const INGREDIENT_KNOWLEDGE: Record<string, Partial<IngredientMeta>> = {
  radish: {
    calories: '16 kcal',
    nutrient: 'Vit C & Fiber',
    hydration: '95% water',
    prepTip: 'Wash & thinly slice',
    category: 'Root Veg',
  },
  carrot: {
    calories: '25 kcal',
    nutrient: 'Beta-Carotene',
    hydration: '88% water',
    prepTip: 'Peel & julienne or coin',
    category: 'Root Veg',
  },
  beetroot: {
    calories: '35 kcal',
    nutrient: 'Folate & Iron',
    hydration: '87% water',
    prepTip: 'Grate or roast thin',
    category: 'Root Veg',
  },
  tomato: {
    calories: '18 kcal',
    nutrient: 'Lycopene & Vit C',
    hydration: '94% water',
    prepTip: 'Dice or crush fresh',
    category: 'Fresh Produce',
  },
  onion: {
    calories: '40 kcal',
    nutrient: 'Quercetin & Fiber',
    hydration: '89% water',
    prepTip: 'Finely dice or slice',
    category: 'Aromatics',
  },
  garlic: {
    calories: '8 kcal',
    nutrient: 'Allicin (Immune)',
    hydration: 'Aromatic punch',
    prepTip: 'Crush or mince fine',
    category: 'Aromatics',
  },
  ginger: {
    calories: '10 kcal',
    nutrient: 'Gingerol (Digestive)',
    hydration: 'Zesty heat',
    prepTip: 'Grate or peel thin',
    category: 'Aromatics',
  },
  spinach: {
    calories: '23 kcal',
    nutrient: 'Iron & Vit K',
    hydration: '91% water',
    prepTip: 'Rinse & rough chop',
    category: 'Leafy Green',
  },
  cucumber: {
    calories: '15 kcal',
    nutrient: 'Electrolytes',
    hydration: '96% water',
    prepTip: 'Slice thin ribbons',
    category: 'Fresh Produce',
  },
  potato: {
    calories: '77 kcal',
    nutrient: 'Potassium & Carbs',
    hydration: '79% water',
    prepTip: 'Cube & parboil',
    category: 'Tuber',
  },
  broccoli: {
    calories: '34 kcal',
    nutrient: 'Sulforaphane & Vit C',
    hydration: '89% water',
    prepTip: 'Cut into bite florets',
    category: 'Cruciferous',
  },
  cauliflower: {
    calories: '25 kcal',
    nutrient: 'Choline & Fiber',
    hydration: '92% water',
    prepTip: 'Chop to medium florets',
    category: 'Cruciferous',
  },
  paneer: {
    calories: '140 kcal',
    nutrient: '14g Protein',
    hydration: 'Calcium rich',
    prepTip: 'Cube & pan-sear',
    category: 'Protein',
  },
  tofu: {
    calories: '76 kcal',
    nutrient: '8g Plant Protein',
    hydration: 'Low carb',
    prepTip: 'Press & cube golden',
    category: 'Protein',
  },
  chicken: {
    calories: '165 kcal',
    nutrient: '31g Lean Protein',
    hydration: 'Zero carb',
    prepTip: 'Dice into bite pieces',
    category: 'Protein',
  },
  egg: {
    calories: '72 kcal',
    nutrient: '6g Protein & Choline',
    hydration: 'Essential fats',
    prepTip: 'Whisk or soft-boil',
    category: 'Protein',
  },
  rice: {
    calories: '130 kcal',
    nutrient: 'Complex Carbs',
    hydration: 'Energy base',
    prepTip: 'Rinse until water runs clear',
    category: 'Grain / Staple',
  },
  pasta: {
    calories: '155 kcal',
    nutrient: 'Sustained Energy',
    hydration: 'Al dente texture',
    prepTip: 'Boil in well-salted water',
    category: 'Grain / Staple',
  },
  mushroom: {
    calories: '22 kcal',
    nutrient: 'Vit D & Selenium',
    hydration: '92% water',
    prepTip: 'Wipe clean & slice thick',
    category: 'Fungi / Umami',
  },
  bellpepper: {
    calories: '24 kcal',
    nutrient: 'Vit C Powerhouse',
    hydration: '92% water',
    prepTip: 'De-seed & slice strips',
    category: 'Fresh Produce',
  },
  capsicum: {
    calories: '24 kcal',
    nutrient: 'Vit C Powerhouse',
    hydration: '92% water',
    prepTip: 'De-seed & slice strips',
    category: 'Fresh Produce',
  },
  lemon: {
    calories: '12 kcal',
    nutrient: 'Citric Vit C',
    hydration: 'Tart acidity',
    prepTip: 'Roll & juice fresh',
    category: 'Citrus',
  },
  lime: {
    calories: '10 kcal',
    nutrient: 'Citric Vit C',
    hydration: 'Crisp zest',
    prepTip: 'Roll & juice fresh',
    category: 'Citrus',
  },
  coriander: {
    calories: '4 kcal',
    nutrient: 'Antioxidants',
    hydration: 'Fresh aroma',
    prepTip: 'Finely chop leaves & stems',
    category: 'Herb',
  },
  cilantro: {
    calories: '4 kcal',
    nutrient: 'Antioxidants',
    hydration: 'Fresh aroma',
    prepTip: 'Finely chop leaves & stems',
    category: 'Herb',
  },
  mint: {
    calories: '5 kcal',
    nutrient: 'Menthol soothing',
    hydration: 'Cool aroma',
    prepTip: 'Chiffonade or bruise',
    category: 'Herb',
  },
  oliveoil: {
    calories: '119 kcal',
    nutrient: 'Monounsaturated Fats',
    hydration: 'Polyphenols',
    prepTip: 'Drizzle over medium heat',
    category: 'Healthy Fat',
  },
  oil: {
    calories: '120 kcal',
    nutrient: 'Cooking Fat',
    hydration: 'Heat conductor',
    prepTip: 'Heat pan before adding',
    category: 'Healthy Fat',
  },
  butter: {
    calories: '102 kcal',
    nutrient: 'Rich Dairy Fat',
    hydration: 'Mouthfeel & glaze',
    prepTip: 'Melt on low heat',
    category: 'Dairy',
  },
  cheese: {
    calories: '110 kcal',
    nutrient: '7g Protein',
    hydration: 'Calcium rich',
    prepTip: 'Grate fresh over heat',
    category: 'Dairy',
  },
  yogurt: {
    calories: '59 kcal',
    nutrient: 'Probiotics & Protein',
    hydration: '88% water',
    prepTip: 'Whisk smooth before adding',
    category: 'Dairy',
  },
  curd: {
    calories: '59 kcal',
    nutrient: 'Probiotics & Protein',
    hydration: '88% water',
    prepTip: 'Whisk smooth before adding',
    category: 'Dairy',
  },
}

/**
 * Normalizes an ingredient name and returns rich culinary metadata.
 * Uses known ingredient mapping when matched, or computes a realistic
 * smart nutritional & prep profile based on ingredient typology.
 */
export function getIngredientMeta(rawName: string): IngredientMeta {
  if (!rawName) {
    return {
      calories: '20 kcal',
      nutrient: 'Clean Nutrition',
      hydration: 'Fresh',
      prepTip: 'Prep as needed',
      category: 'Pantry Item',
    }
  }

  const clean = rawName.toLowerCase().replace(/[^a-z]/g, '')

  // 1. Direct or partial match in knowledge base
  for (const [key, data] of Object.entries(INGREDIENT_KNOWLEDGE)) {
    if (clean.includes(key) || key.includes(clean)) {
      return {
        calories: data.calories || '25 kcal',
        nutrient: data.nutrient || 'Vital Nutrients',
        hydration: data.hydration || 'Fresh moisture',
        prepTip: data.prepTip || 'Prep fresh',
        category: data.category || 'Kitchen Staple',
      }
    }
  }

  // 2. Intelligent Typology Heuristics
  const lower = rawName.toLowerCase()

  if (/oil|ghee|butter|fat|lard/i.test(lower)) {
    return {
      calories: '110 kcal',
      nutrient: 'Healthy Fats',
      hydration: 'Aromatic finish',
      prepTip: 'Heat on medium pan',
      category: 'Cooking Fat',
    }
  }

  if (/chicken|beef|meat|fish|shrimp|prawn|egg|pork|mutton|salmon|tuna/i.test(lower)) {
    return {
      calories: '145 kcal',
      nutrient: 'High Protein',
      hydration: 'Lean & savory',
      prepTip: 'Trim & cut into uniform pieces',
      category: 'Protein',
    }
  }

  if (/leaf|spinach|kale|lettuce|arugula|methi|palak|cabbage/i.test(lower)) {
    return {
      calories: '18 kcal',
      nutrient: 'Fiber & Vit K',
      hydration: '92% water',
      prepTip: 'Wash thoroughly & chop',
      category: 'Leafy Green',
    }
  }

  if (/pepper|chili|jalapeno|paprika|habanero/i.test(lower)) {
    return {
      calories: '22 kcal',
      nutrient: 'Capsaicin & Vit C',
      hydration: 'Crisp heat',
      prepTip: 'De-seed for milder heat',
      category: 'Spice / Pepper',
    }
  }

  if (/seed|nut|almond|cashew|walnut|peanut|sesame|chia/i.test(lower)) {
    return {
      calories: '160 kcal',
      nutrient: 'Omega Fats & Zinc',
      hydration: 'Crunch texture',
      prepTip: 'Toast lightly in dry skillet',
      category: 'Nuts & Seeds',
    }
  }

  if (/flour|bread|pasta|rice|noodle|oat|quinoa|grain/i.test(lower)) {
    return {
      calories: '130 kcal',
      nutrient: 'Energy Carbs',
      hydration: 'Tender base',
      prepTip: 'Measure accurately',
      category: 'Grain / Staple',
    }
  }

  if (/herb|mint|cilantro|coriander|parsley|thyme|rosemary|basil|dill/i.test(lower)) {
    return {
      calories: '5 kcal',
      nutrient: 'Aromatics & Oils',
      hydration: 'Fresh finish',
      prepTip: 'Garnish at the very end',
      category: 'Fresh Herb',
    }
  }

  if (/berry|apple|banana|mango|orange|grape|fruit/i.test(lower)) {
    return {
      calories: '55 kcal',
      nutrient: 'Natural Sugars & Vit C',
      hydration: '86% water',
      prepTip: 'Wash & slice fresh',
      category: 'Fresh Fruit',
    }
  }

  if (/milk|cream|cheese|curd|yogurt|dairy/i.test(lower)) {
    return {
      calories: '70 kcal',
      nutrient: 'Calcium & Protein',
      hydration: 'Rich emulsion',
      prepTip: 'Keep chilled until use',
      category: 'Dairy',
    }
  }

  // Sensible default for any garden vegetable or pantry item
  return {
    calories: '28 kcal',
    nutrient: 'Fiber & Minerals',
    hydration: '90% water',
    prepTip: 'Rinse & prep to uniform size',
    category: 'Fresh Produce',
  }
}
