export type IndianRegion =
  | 'All'
  | 'Kerala'
  | 'Tamil Nadu'
  | 'Maharashtra'
  | 'Karnataka'
  | 'North Indian'

export type RegionalTimeTier = '5m' | '15m' | '30m' | 'weekend'

export interface RegionalIngredient {
  name: string
  quantity: string
  optional?: boolean
}

export interface RegionalRecipeStep {
  id: string
  step_order: number
  instruction: string
  duration_minutes: number
  parallel?: boolean
}

export interface RegionalRecipe {
  id: string
  name: string
  regionalName: string
  region: 'Kerala' | 'Tamil Nadu' | 'Maharashtra' | 'Karnataka' | 'North Indian' | 'Pan-Indian'
  timeTier: RegionalTimeTier
  time: number // minutes
  image: string
  subtitle: string
  diet: 'veg' | 'non-veg' | 'vegan' | 'jain'
  difficulty: 'Quick' | 'Easy' | 'Medium' | 'Feast'
  ingredients: RegionalIngredient[]
  steps: RegionalRecipeStep[]
  moods: string[]
  essentialStaples?: string[]
}

// ── Culturally Rich Regional Recipes ─────────────────────────────────────────
export const REGIONAL_RECIPES: RegionalRecipe[] = [
  // ═════════════════════════════════════════════════════════════════════════════
  // 1. KERALA SIGNATURES (God's Own Country)
  // ═════════════════════════════════════════════════════════════════════════════
  // ── 5 MIN KERALA DISHES ──
  {
    id: 'kerala-tomato-thoran',
    name: 'Tomato Thoran',
    regionalName: 'Thakkali Thoran',
    region: 'Kerala',
    timeTier: '5m',
    time: 5,
    image: '/food/tomato_thoran.jpg',
    subtitle: 'Flash-sautéed juicy country tomatoes with grated coconut & crackling mustard',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Tomatoes', quantity: '3 ripe, chopped' },
      { name: 'Grated Coconut', quantity: '1/3 cup fresh' },
      { name: 'Mustard Seeds', quantity: '1/2 tsp' },
      { name: 'Curry Leaves', quantity: '1 sprig' },
      { name: 'Green Chilies', quantity: '2 slit' },
      { name: 'Turmeric Powder', quantity: '1/4 tsp' },
      { name: 'Coconut Oil', quantity: '1 tbsp' },
      { name: 'Salt', quantity: 'to taste' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat coconut oil in a pan. Splutter mustard seeds and toss in curry leaves & green chilies.', duration_minutes: 1, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add chopped tomatoes, turmeric, and salt. Sauté on high heat for 2 minutes until tender but holding shape.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Fold in freshly grated coconut, turn off the heat, and mix gently. Serve hot.', duration_minutes: 2, parallel: false },
    ],
    moods: ['exhausted', 'healthy', 'budget', 'quick', 'comfort'],
  },
  {
    id: 'kerala-lemon-rice',
    name: 'Lemon Rice',
    regionalName: 'Naranga Choru',
    region: 'Kerala',
    timeTier: '5m',
    time: 5,
    image: '/food/lemon_rice.jpg',
    subtitle: 'Zesty tempered coconut oil rice with crunchy roasted peanuts & curry leaves',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Cooked Rice', quantity: '2 cups' },
      { name: 'Lemon Juice', quantity: '2 tbsp fresh' },
      { name: 'Mustard Seeds', quantity: '1/2 tsp' },
      { name: 'Roasted Peanuts', quantity: '2 tbsp' },
      { name: 'Curry Leaves', quantity: '1 sprig' },
      { name: 'Turmeric Powder', quantity: '1/4 tsp' },
      { name: 'Green Chilies', quantity: '2 slit' },
      { name: 'Coconut Oil', quantity: '1 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat coconut oil in a kadai; splutter mustard seeds, peanuts, curry leaves, and green chilies.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Stir in turmeric powder, then add fluffy cooked rice and salt. Toss evenly.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Take off heat, drizzle fresh lemon juice over the warm rice, and toss gently.', duration_minutes: 1, parallel: false },
    ],
    moods: ['exhausted', 'budget', 'normal', 'quick', 'comfort'],
  },
  {
    id: 'kerala-moru-curry',
    name: 'Moru Curry',
    regionalName: 'Pacha Moru Kachiathu',
    region: 'Kerala',
    timeTier: '5m',
    time: 5,
    image: '/food/yogurt.jpg',
    subtitle: 'Warm spiced seasoned buttermilk with crushed ginger, shallots & fenugreek tadka',
    diet: 'veg',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Thick Buttermilk / Curd', quantity: '1.5 cups whisked' },
      { name: 'Shallots', quantity: '4 finely sliced' },
      { name: 'Ginger & Green Chilies', quantity: '1 tsp minced' },
      { name: 'Mustard & Fenugreek Seeds', quantity: '1/4 tsp each' },
      { name: 'Curry Leaves', quantity: '1 sprig' },
      { name: 'Turmeric Powder', quantity: '1/4 tsp' },
      { name: 'Coconut Oil', quantity: '1 tsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat coconut oil; crackle mustard seeds, fenugreek, dried chili, and curry leaves.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add sliced shallots and ginger, sauté till aromatic, then stir in turmeric.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Pour in whisked buttermilk with salt on the lowest flame; warm gently for 1 min without boiling.', duration_minutes: 1, parallel: false },
    ],
    moods: ['comfort', 'healthy', 'quick', 'exhausted', 'budget'],
  },
  {
    id: 'kerala-mutta-podimas',
    name: 'Nadan Egg Scramble',
    regionalName: 'Mutta Podimas',
    region: 'Kerala',
    timeTier: '5m',
    time: 5,
    image: '/food/egg_roast.jpg',
    subtitle: 'Fluffy country eggs scrambled with caramelized shallots, crushed black pepper & coconut oil',
    diet: 'non-veg',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Eggs', quantity: '3 farm fresh' },
      { name: 'Shallots / Onions', quantity: '1/2 cup finely chopped' },
      { name: 'Green Chilies', quantity: '2 chopped' },
      { name: 'Curry Leaves', quantity: '1 sprig' },
      { name: 'Black Pepper Powder', quantity: '1/2 tsp fresh' },
      { name: 'Coconut Oil', quantity: '1 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat coconut oil in a pan; sauté shallots, green chilies, and curry leaves until golden.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Crack eggs directly into the pan with salt and pepper; scramble continuously on medium heat until soft and fluffy.', duration_minutes: 3, parallel: false },
    ],
    moods: ['quick', 'spicy', 'comfort', 'healthy'],
  },
  {
    id: 'kerala-pacha-manga-chammanthi',
    name: 'Raw Mango Coconut Chutney',
    regionalName: 'Pacha Manga Chammanthi',
    region: 'Kerala',
    timeTier: '5m',
    time: 5,
    image: '/food/salad.jpg',
    subtitle: 'Tangy raw mango coarsely pounded with grated coconut, shallots & fiery birds-eye chilies',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Raw Green Mango', quantity: '1/2 cup chopped' },
      { name: 'Fresh Grated Coconut', quantity: '1 cup' },
      { name: 'Shallots & Ginger', quantity: '4 shallots + 1 inch ginger' },
      { name: 'Curry Leaves', quantity: '1 sprig' },
      { name: 'Green Chilies', quantity: '3 spicy' },
      { name: 'Coconut Oil & Salt', quantity: '1 tsp + salt' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Pulse raw mango, coconut, shallots, ginger, chilies, curry leaves, and salt in a blender without water.', duration_minutes: 3, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Shape into a rustic ball, drizzle pure raw coconut oil over top, and serve with steaming rice or kanji.', duration_minutes: 2, parallel: false },
    ],
    moods: ['quick', 'spicy', 'comfort', 'healthy', 'budget'],
  },

  // ── 15 MIN KERALA DISHES (10-15m) ──
  {
    id: 'kerala-egg-roast',
    name: 'Egg Roast',
    regionalName: 'Nadan Mutta Roast',
    region: 'Kerala',
    timeTier: '15m',
    time: 15,
    image: '/food/egg_roast.jpg',
    subtitle: 'Golden-scored boiled eggs coated in a thick caramelized onion & black pepper masala',
    diet: 'non-veg',
    difficulty: 'Easy',
    ingredients: [
      { name: 'Eggs', quantity: '4 hard-boiled' },
      { name: 'Onions / Shallots', quantity: '2 cups thinly sliced' },
      { name: 'Tomatoes', quantity: '1 finely chopped' },
      { name: 'Ginger Garlic Paste', quantity: '1 tbsp' },
      { name: 'Curry Leaves', quantity: '2 sprigs' },
      { name: 'Black Pepper Powder', quantity: '1 tsp freshly ground' },
      { name: 'Kashmiri Chili Powder', quantity: '1 tsp' },
      { name: 'Coconut Oil', quantity: '2 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Score hard-boiled eggs lengthwise and dust with turmeric and salt.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Heat coconut oil; sauté onions, ginger-garlic, and curry leaves till deep golden brown.', duration_minutes: 7, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Add tomatoes, chili powder, coriander, and black pepper. Cook until thick masala forms.', duration_minutes: 4, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Drop in eggs, coat completely with the glossy roast masala, and simmer for 2 minutes.', duration_minutes: 2, parallel: false },
    ],
    moods: ['spicy', 'treat', 'normal', 'comfort'],
  },
  {
    id: 'kerala-cabbage-thoran',
    name: 'Cabbage Thoran',
    regionalName: 'Muttaikose Thoran',
    region: 'Kerala',
    timeTier: '15m',
    time: 10,
    image: '/food/salad.jpg',
    subtitle: 'Crisp finely shredded cabbage stir-fried with crushed coconut, cumin, green chilies & coconut oil',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Shredded Cabbage', quantity: '2 cups finely chopped' },
      { name: 'Fresh Grated Coconut', quantity: '1/2 cup' },
      { name: 'Shallots, Green Chili & Cumin', quantity: 'coarsely crushed' },
      { name: 'Mustard Seeds & Curry Leaves', quantity: '1/2 tsp + 1 sprig' },
      { name: 'Turmeric Powder', quantity: '1/4 tsp' },
      { name: 'Coconut Oil', quantity: '1 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Crackle mustard seeds and curry leaves in hot coconut oil.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add shredded cabbage, turmeric, and salt. Sauté on medium-high heat for 4 minutes.', duration_minutes: 4, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Toss in the crushed coconut mixture, cover for 2 minutes, and stir. Keep cabbage vibrant and crisp.', duration_minutes: 4, parallel: false },
    ],
    moods: ['healthy', 'comfort', 'quick', 'budget'],
  },
  {
    id: 'kerala-kadala-fry',
    name: 'Spicy Kadala Fry',
    regionalName: 'Nadan Kadala Fry',
    region: 'Kerala',
    timeTier: '15m',
    time: 10,
    image: '/food/bowl.jpg',
    subtitle: 'Tender black chickpeas sautéed with toasted coconut bits, crushed shallots & fresh curry leaves',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Cooked Black Chickpeas', quantity: '1.5 cups' },
      { name: 'Coconut Slices (Thenga Kothu)', quantity: '2 tbsp golden toasted' },
      { name: 'Shallots & Green Chilies', quantity: '1/2 cup' },
      { name: 'Mustard Seeds & Curry Leaves', quantity: '1 tsp + 1 sprig' },
      { name: 'Garam Masala & Red Chili Flakes', quantity: '1/2 tsp each' },
      { name: 'Coconut Oil', quantity: '1.5 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Brown coconut slices in hot coconut oil until crisp and fragrant.', duration_minutes: 3, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Splutter mustard seeds, shallots, curry leaves, and chili flakes.', duration_minutes: 3, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Toss in boiled kadala with salt and garam masala; roast on high heat for 4 minutes.', duration_minutes: 4, parallel: false },
    ],
    moods: ['quick', 'healthy', 'spicy', 'comfort'],
  },
  {
    id: 'kerala-ulli-theeyal',
    name: 'Shallot Theeyal',
    regionalName: 'Ulli Theeyal',
    region: 'Kerala',
    timeTier: '15m',
    time: 15,
    image: '/food/kara_kuzhambu.jpg',
    subtitle: 'Whole pearl onions simmered in deeply roasted spiced coconut & tamarind reduction',
    diet: 'vegan',
    difficulty: 'Easy',
    ingredients: [
      { name: 'Shallots (Chinna Ulli)', quantity: '15 peeled whole' },
      { name: 'Roasted Coconut Paste', quantity: '1/2 cup dark toasted' },
      { name: 'Tamarind Extract', quantity: '1/2 cup' },
      { name: 'Curry Leaves', quantity: '2 sprigs' },
      { name: 'Fenugreek & Mustard Seeds', quantity: '1/2 tsp' },
      { name: 'Coconut Oil', quantity: '1.5 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat coconut oil; splutter mustard seeds, fenugreek, and fry shallots till golden.', duration_minutes: 5, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Pour in tamarind pulp, roasted dark coconut paste, turmeric, and sea salt.', duration_minutes: 6, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Simmer uncovered till theeyal gravy turns mahogany and oil glistens on top.', duration_minutes: 4, parallel: false },
    ],
    moods: ['comfort', 'spicy', 'healthy'],
  },
  {
    id: 'kerala-fish-curry',
    name: 'Kerala Fish Curry',
    regionalName: 'Nadan Meen Curry',
    region: 'Kerala',
    timeTier: '15m',
    time: 15,
    image: '/food/bowl.jpg',
    subtitle: 'Tender fish fillets simmered in fiery red Kashmiri chili, Kudampuli & coconut oil broth',
    diet: 'non-veg',
    difficulty: 'Easy',
    ingredients: [
      { name: 'Fish Fillets (Kingfish/Seer)', quantity: '300g sliced' },
      { name: 'Kudampuli (Malabar Tamarind)', quantity: '2 pieces soaked' },
      { name: 'Kashmiri Chili Powder', quantity: '1.5 tbsp' },
      { name: 'Shallots & Ginger Garlic', quantity: '1/2 cup sliced' },
      { name: 'Fenugreek Seeds', quantity: '1/2 tsp' },
      { name: 'Curry Leaves & Coconut Oil', quantity: '2 sprigs + 2 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'In a clay pot (manchatti), heat coconut oil; toast fenugreek, shallots, ginger, and curry leaves.', duration_minutes: 4, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add chili paste and turmeric with water and soaked Kudampuli. Bring to a rolling boil.', duration_minutes: 5, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Slide in fish pieces; swirl the pot gently and simmer for 6 minutes until fish is cooked through.', duration_minutes: 6, parallel: false },
    ],
    moods: ['spicy', 'treat', 'comfort'],
  },

  // ── 30 MIN KERALA DISHES ──
  {
    id: 'kerala-veg-stew',
    name: 'Veg Stew',
    regionalName: 'Kerala Ishtu',
    region: 'Kerala',
    timeTier: '30m',
    time: 25,
    image: '/food/veg_stew.jpg',
    subtitle: 'Tender garden vegetables simmered in velvety spiced coconut milk with cardamom',
    diet: 'vegan',
    difficulty: 'Medium',
    ingredients: [
      { name: 'Potatoes & Carrots', quantity: '1.5 cups diced' },
      { name: 'Green Peas', quantity: '1/2 cup' },
      { name: 'Coconut Milk (Thin & Thick)', quantity: '1.5 cups' },
      { name: 'Ginger Slivers', quantity: '1 tbsp' },
      { name: 'Green Chilies', quantity: '3 slit lengthwise' },
      { name: 'Whole Spices (Cardamom, Cinnamon, Cloves)', quantity: '1 stick + 3 pods' },
      { name: 'Curry Leaves', quantity: '2 sprigs' },
      { name: 'Coconut Oil', quantity: '1.5 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Warm coconut oil with whole cinnamon, cardamom, and cloves until aromatic.', duration_minutes: 3, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add shallots, ginger slivers, and green chilies. Sauté lightly without browning.', duration_minutes: 4, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Add diced potatoes, carrots, peas, thin coconut milk, and salt. Simmer covered until fork tender.', duration_minutes: 12, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Pour in thick coconut milk, fresh curry leaves, and a drizzle of raw coconut oil. Turn off heat immediately.', duration_minutes: 4, parallel: false },
    ],
    moods: ['comfort', 'healthy', 'treat', 'normal'],
  },
  {
    id: 'kerala-kadala-curry',
    name: 'Kadala Curry',
    regionalName: 'Nadan Kadala Curry',
    region: 'Kerala',
    timeTier: '30m',
    time: 28,
    image: '/food/bowl.jpg',
    subtitle: 'Black chickpeas slow-cooked in a dark roasted coconut, coriander & fennel gravy',
    diet: 'vegan',
    difficulty: 'Medium',
    ingredients: [
      { name: 'Black Chickpeas (Kadala)', quantity: '1.5 cups boiled' },
      { name: 'Grated Coconut', quantity: '1 cup roasted dark brown' },
      { name: 'Shallots & Ginger Garlic', quantity: '1/2 cup' },
      { name: 'Fennel & Coriander Powder', quantity: '1 tbsp each' },
      { name: 'Curry Leaves', quantity: '2 sprigs' },
      { name: 'Coconut Oil', quantity: '2 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Roast grated coconut with shallots and curry leaves till dark aromatic brown; grind smooth.', duration_minutes: 8, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Heat coconut oil; sauté onions and ginger-garlic paste. Add spice powders and boiled kadala.', duration_minutes: 6, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Mix in roasted coconut paste with water; simmer for 12 minutes to thicken.', duration_minutes: 12, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Finish with a fresh coconut oil and mustard tadka.', duration_minutes: 2, parallel: false },
    ],
    moods: ['comfort', 'spicy', 'treat'],
  },

  // ── WEEKEND KERALA DISHES ──
  {
    id: 'kerala-malabar-biryani',
    name: 'Malabar Chicken Dum Biryani',
    regionalName: 'Thalassery Biryani',
    region: 'Kerala',
    timeTier: 'weekend',
    time: 55,
    image: '/food/bowl.jpg',
    subtitle: 'Fragrant short-grain Kaima rice layered with slow-cooked spiced chicken & golden cashews',
    diet: 'non-veg',
    difficulty: 'Feast',
    ingredients: [
      { name: 'Kaima / Jeerakasala Rice', quantity: '2 cups' },
      { name: 'Chicken', quantity: '500g bone-in cut' },
      { name: 'Fried Onions (Birista)', quantity: '1 cup crisp' },
      { name: 'Ghee', quantity: '3 tbsp' },
      { name: 'Garam Masala & Green Chillies', quantity: '2 tsp' },
      { name: 'Cashews & Raisins', quantity: '2 tbsp fried' },
      { name: 'Curd / Yogurt', quantity: '1/2 cup' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Marinate chicken in crushed green chilies, ginger-garlic, curd, turmeric, and lemon juice.', duration_minutes: 15, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Cook chicken masala with sliced onions until succulent and thick gravy coats the meat.', duration_minutes: 20, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Sauté Kaima rice in aromatic ghee, cook in hot water until 80% done.', duration_minutes: 10, parallel: true },
      { id: 'step-4', step_order: 4, instruction: 'Layer rice over chicken gravy, top with crisp birista, fried cashews, raisins, and seal for 10 mins dum.', duration_minutes: 10, parallel: false },
    ],
    moods: ['treat', 'comfort', 'spicy'],
  },
  {
    id: 'kerala-meen-pollichathu',
    name: 'Fish Pollichathu',
    regionalName: 'Nadan Meen Pollichathu',
    region: 'Kerala',
    timeTier: 'weekend',
    time: 45,
    image: '/food/bowl.jpg',
    subtitle: 'Pearl spot fish smothered in spicy shallot tomato masala and pan-roasted inside a charred banana leaf',
    diet: 'non-veg',
    difficulty: 'Feast',
    ingredients: [
      { name: 'Whole Fish (Karimeen / Pomfret)', quantity: '2 medium' },
      { name: 'Shallots & Tomatoes', quantity: '1.5 cups chopped' },
      { name: 'Banana Leaves', quantity: '2 wilted sheets' },
      { name: 'Ginger Garlic Paste', quantity: '1.5 tbsp' },
      { name: 'Curry Leaves & Coconut Oil', quantity: '2 sprigs + 3 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Marinate fish with chili powder, turmeric, and lemon juice; shallow fry lightly for 3 mins.', duration_minutes: 8, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Cook shallots, ginger, garlic, tomatoes, and curry leaves into a thick glossy masala.', duration_minutes: 12, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Smother fish with masala on banana leaf, fold tightly into a parcel, and roast on tawa for 15 mins.', duration_minutes: 15, parallel: false },
    ],
    moods: ['treat', 'spicy'],
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // 2. TAMIL NADU SIGNATURES (Tamil Heritage)
  // ═════════════════════════════════════════════════════════════════════════════
  // ── 5 MIN TAMIL NADU DISHES ──
  {
    id: 'tamil-lemon-sevai',
    name: 'Lemon Sevai',
    regionalName: 'Elumichai Sevai',
    region: 'Tamil Nadu',
    timeTier: '5m',
    time: 5,
    image: '/food/lemon_sevai.jpg',
    subtitle: 'Tender steamed rice noodles tempered with roasted peanuts, curry leaves & tangy lemon',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Rice Sevai / Vermicelli', quantity: '2 cups prepared' },
      { name: 'Lemon Juice', quantity: '2 tbsp fresh' },
      { name: 'Mustard & Urad Dal', quantity: '1 tsp each' },
      { name: 'Roasted Peanuts', quantity: '2 tbsp crunchy' },
      { name: 'Green Chilies & Ginger', quantity: '1 tsp minced' },
      { name: 'Curry Leaves', quantity: '1 sprig' },
      { name: 'Sesame / Gingelly Oil', quantity: '1 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat gingelly oil in a pan; add mustard seeds, urad dal, peanuts, curry leaves, and ginger until golden.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Turn heat low, add turmeric powder and prepared warm rice sevai with salt. Toss gently without breaking strands.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Remove pan from stove and drizzle lemon juice. Fold thoroughly and enjoy immediately.', duration_minutes: 1, parallel: false },
    ],
    moods: ['exhausted', 'healthy', 'budget', 'quick', 'comfort'],
  },
  {
    id: 'tamil-milagu-rasam',
    name: 'Pepper Rasam',
    regionalName: 'Milagu Jeera Rasam',
    region: 'Tamil Nadu',
    timeTier: '5m',
    time: 5,
    image: '/food/bowl.jpg',
    subtitle: 'Invigorating crushed black pepper, garlic & cumin tamarind broth for instant rejuvenation',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Black Peppercorns & Cumin', quantity: '1 tsp each coarsely pounded' },
      { name: 'Garlic', quantity: '4 cloves crushed with skin' },
      { name: 'Tomato', quantity: '1 mashed' },
      { name: 'Tamarind Water', quantity: '1 cup light' },
      { name: 'Curry Leaves & Hing', quantity: '1 sprig + pinch' },
      { name: 'Ghee', quantity: '1 tsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Boil tamarind water with mashed tomato, turmeric, salt, and crushed garlic for 3 minutes.', duration_minutes: 3, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add pounded black pepper and cumin; bring to a single frothy boil and turn off immediately.', duration_minutes: 1, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Temper with hot ghee, mustard seeds, and curry leaves.', duration_minutes: 1, parallel: false },
    ],
    moods: ['comfort', 'spicy', 'healthy', 'quick', 'exhausted'],
  },
  {
    id: 'tamil-podi-idli',
    name: 'Ghee Podi Idli',
    regionalName: 'Nattu Podi Idli',
    region: 'Tamil Nadu',
    timeTier: '5m',
    time: 5,
    image: '/food/salad.jpg',
    subtitle: 'Steamed bite-sized idlis tossed in roasted gunpowder (idli podi) and sizzling hot pure ghee',
    diet: 'veg',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Idlis (Bite-sized or cubed)', quantity: '6 pieces' },
      { name: 'Idli Milagai Podi (Gunpowder)', quantity: '2 tbsp' },
      { name: 'Pure Desi Ghee', quantity: '2 tbsp' },
      { name: 'Curry Leaves', quantity: '1 sprig' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Melt fragrant ghee in a pan and crisp up curry leaves.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add idli cubes and sprinkle generous idli podi over them.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Toss on high heat until idlis are golden, crispy on the edges, and coated in spice.', duration_minutes: 1, parallel: false },
    ],
    moods: ['quick', 'comfort', 'treat', 'spicy'],
  },
  {
    id: 'tamil-curd-rice',
    name: 'Thayir Sadam',
    regionalName: 'South Indian Curd Rice',
    region: 'Tamil Nadu',
    timeTier: '5m',
    time: 5,
    image: '/food/yogurt.jpg',
    subtitle: 'Creamy mashed rice folded with fresh homemade curd, green chilies, ginger & crackling mustard tadka',
    diet: 'veg',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Cooked Rice', quantity: '2 cups soft mashed' },
      { name: 'Fresh Curd', quantity: '1.5 cups' },
      { name: 'Mustard Seeds & Urad Dal', quantity: '1/2 tsp each' },
      { name: 'Green Chilies & Ginger', quantity: '1 tsp minced' },
      { name: 'Curry Leaves & Hing', quantity: '1 sprig + pinch' },
      { name: 'Gingelly Oil / Ghee', quantity: '1 tsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Mix mashed warm rice with fresh curd, salt, and a splash of milk.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Heat oil; splutter mustard, urad dal, ginger, green chilies, and curry leaves.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Pour over curd rice and mix gently. Best comfort meal.', duration_minutes: 1, parallel: false },
    ],
    moods: ['comfort', 'healthy', 'quick', 'exhausted'],
  },

  // ── 15 MIN TAMIL NADU DISHES (10-15m) ──
  {
    id: 'tamil-potato-podimas',
    name: 'Potato Podimas',
    regionalName: 'Urulaikizhangu Podimas',
    region: 'Tamil Nadu',
    timeTier: '15m',
    time: 10,
    image: '/food/bowl.jpg',
    subtitle: 'Crumbled tender potatoes tempered with urad dal, ginger, fresh green chilies & lemon',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Boiled Potatoes', quantity: '3 medium crumbled' },
      { name: 'Ginger & Green Chilies', quantity: '1 tbsp minced' },
      { name: 'Mustard & Urad Dal', quantity: '1 tsp each' },
      { name: 'Curry Leaves & Hing', quantity: '1 sprig + pinch' },
      { name: 'Lemon Juice', quantity: '1 tbsp' },
      { name: 'Gingelly Oil', quantity: '1 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat gingelly oil; toast mustard, urad dal, ginger, green chilies, and curry leaves till golden.', duration_minutes: 3, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Toss in crumbled potatoes, turmeric, and salt. Sauté on medium flame for 5 minutes.', duration_minutes: 5, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Turn off heat, drizzle fresh lemon juice, and mix well.', duration_minutes: 2, parallel: false },
    ],
    moods: ['comfort', 'quick', 'budget', 'healthy'],
  },
  {
    id: 'tamil-tomato-rice',
    name: 'Tomato Rice',
    regionalName: 'Thakkali Sadam',
    region: 'Tamil Nadu',
    timeTier: '15m',
    time: 15,
    image: '/food/tomato_rice.jpg',
    subtitle: 'Homestyle spiced rice with tangy tomatoes, roasted cashews & fragrant fennel tadka',
    diet: 'veg',
    difficulty: 'Easy',
    ingredients: [
      { name: 'Cooked Rice', quantity: '2 cups' },
      { name: 'Tomatoes', quantity: '4 large country tomatoes' },
      { name: 'Onions', quantity: '1 thinly sliced' },
      { name: 'Fennel Seeds & Cinnamon', quantity: '1/2 tsp fennel, 1 stick' },
      { name: 'Chili Powder & Coriander', quantity: '1 tsp each' },
      { name: 'Cashews', quantity: '10 golden toasted' },
      { name: 'Ghee & Gingelly Oil', quantity: '1.5 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat oil & ghee; splutter fennel seeds, cinnamon, curry leaves, and golden cashews.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Sauté onions until translucent, then add chopped tomatoes, chili powder, and salt. Cook down till mushy and oil floats.', duration_minutes: 8, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Add cooled cooked rice to the thick tomato paste. Mix with a light hand until every grain is red and aromatic.', duration_minutes: 5, parallel: false },
    ],
    moods: ['comfort', 'budget', 'normal', 'spicy', 'quick'],
  },
  {
    id: 'tamil-kothu-parotta',
    name: 'Veg Kothu Parotta',
    regionalName: 'Madurai Kothu Parotta',
    region: 'Tamil Nadu',
    timeTier: '15m',
    time: 15,
    image: '/food/pasta.jpg',
    subtitle: 'Street-style shredded flaky parotta vigorously beaten on a hot tawa with spicy kurma gravy',
    diet: 'veg',
    difficulty: 'Easy',
    ingredients: [
      { name: 'Malabar Parottas', quantity: '3 shredded into pieces' },
      { name: 'Onions & Green Chilies', quantity: '1 cup chopped' },
      { name: 'Salna / Veg Kurma Gravy', quantity: '1/2 cup' },
      { name: 'Curry Leaves', quantity: '2 sprigs' },
      { name: 'Gingelly Oil', quantity: '2 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat oil on a flat tawa; sauté onions, green chilies, and curry leaves till charred.', duration_minutes: 4, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Tumble in shredded parotta pieces and pour hot salna gravy over the top.', duration_minutes: 4, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Beat and chop vigorously with two metal spatulas on high flame till sizzling and mixed.', duration_minutes: 7, parallel: false },
    ],
    moods: ['treat', 'spicy', 'comfort'],
  },

  // ── 30 MIN TAMIL NADU DISHES ──
  {
    id: 'tamil-kara-kuzhambu',
    name: 'Kara Kuzhambu',
    regionalName: 'Poondu Chinna Vengayam Kara Kuzhambu',
    region: 'Tamil Nadu',
    timeTier: '30m',
    time: 25,
    image: '/food/kara_kuzhambu.jpg',
    subtitle: 'Deep, tangy tamarind & shallot gravy infused with whole garlic cloves and roasted fenugreek',
    diet: 'vegan',
    difficulty: 'Medium',
    ingredients: [
      { name: 'Small Shallots (Chinna Vengayam)', quantity: '15 whole peeled' },
      { name: 'Garlic Cloves', quantity: '12 whole peeled' },
      { name: 'Tamarind Extract', quantity: '1 cup rich extract' },
      { name: 'Sambar Powder / Kuzhambu Podi', quantity: '2 tbsp' },
      { name: 'Fenugreek & Mustard Seeds', quantity: '1/2 tsp each' },
      { name: 'Curry Leaves', quantity: '2 sprigs' },
      { name: 'Gingelly Oil (Nallennai)', quantity: '2.5 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'In a hot clay or thick-bottom pan, heat gingelly oil; toast mustard seeds, fenugreek, and curry leaves.', duration_minutes: 3, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add shallots and whole garlic cloves. Sauté until caramelized and golden on the edges.', duration_minutes: 7, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Pour in tamarind water, kuzhambu powder, turmeric, and sea salt. Bring to a rolling boil.', duration_minutes: 10, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Simmer on low heat until gravy turns dark, glossy, and oil bubbles at the surface.', duration_minutes: 5, parallel: false },
    ],
    moods: ['spicy', 'comfort', 'healthy', 'treat'],
  },
  {
    id: 'tamil-arachuvitta-sambar',
    name: 'Arachuvitta Sambar',
    regionalName: 'Thanjavur Sambar',
    region: 'Tamil Nadu',
    timeTier: '30m',
    time: 28,
    image: '/food/bowl.jpg',
    subtitle: 'Rich toor dal sambar made with fresh roasted coriander, chana dal & coconut paste',
    diet: 'veg',
    difficulty: 'Medium',
    ingredients: [
      { name: 'Toor Dal', quantity: '1 cup boiled soft' },
      { name: 'Drumstick & Shallots', quantity: '1.5 cups' },
      { name: 'Freshly Roasted Sambar Masala Paste', quantity: '3 tbsp' },
      { name: 'Tamarind Pulp', quantity: '1/2 cup' },
      { name: 'Ghee Tadka', quantity: '1.5 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Boil drumsticks and shallots in tamarind water with turmeric and salt until tender.', duration_minutes: 10, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add cooked toor dal and stir in the freshly ground coconut-spice paste.', duration_minutes: 12, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Simmer till frothy; temper with mustard, hing, and curry leaves in hot ghee.', duration_minutes: 6, parallel: false },
    ],
    moods: ['comfort', 'healthy', 'normal'],
  },

  // ── WEEKEND TAMIL NADU DISHES ──
  {
    id: 'tamil-chettinad-feast',
    name: 'Chettinad Pepper Mushroom Chukka',
    regionalName: 'Kalaan Chukka',
    region: 'Tamil Nadu',
    timeTier: 'weekend',
    time: 45,
    image: '/food/pasta.jpg',
    subtitle: 'Freshly pounded black pepper, star anise, kalpasi & roasted coconut pan roast',
    diet: 'vegan',
    difficulty: 'Feast',
    ingredients: [
      { name: 'Button Mushrooms', quantity: '300g quartered' },
      { name: 'Shallots', quantity: '1 cup diced' },
      { name: 'Chettinad Masala (Fennel, Pepper, Cumin, Kalpasi)', quantity: '2.5 tbsp roasted & ground' },
      { name: 'Ginger Garlic', quantity: '1 tbsp crushed' },
      { name: 'Curry Leaves', quantity: '2 sprigs' },
      { name: 'Gingelly Oil', quantity: '2 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Dry roast black pepper, fennel, cumin, coriander seeds, and star anise; grind into a coarse fragrant masala.', duration_minutes: 8, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Heat oil, sauté shallots and curry leaves till deep brown, then stir in ginger-garlic paste.', duration_minutes: 7, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Toss mushrooms in the aromatic base with ground Chettinad masala and salt on high flame.', duration_minutes: 15, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Slow-roast uncovered until dry, deep mahogany brown and heavily coated.', duration_minutes: 15, parallel: false },
    ],
    moods: ['spicy', 'treat', 'comfort'],
  },
  {
    id: 'tamil-dindigul-biryani',
    name: 'Dindigul Thalapakatti Biryani',
    regionalName: 'Seeraga Samba Biryani',
    region: 'Tamil Nadu',
    timeTier: 'weekend',
    time: 55,
    image: '/food/bowl.jpg',
    subtitle: 'Aromatic tiny-grained Seeraga Samba rice cooked with curd, shallot paste & slow-simmered tender meat',
    diet: 'non-veg',
    difficulty: 'Feast',
    ingredients: [
      { name: 'Seeraga Samba Rice', quantity: '2 cups soaked' },
      { name: 'Chicken / Mutton', quantity: '500g' },
      { name: 'Shallot & Green Chili Paste', quantity: '1/2 cup' },
      { name: 'Curd & Lemon Juice', quantity: '1/3 cup' },
      { name: 'Ghee & Gingelly Oil', quantity: '3 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Sauté shallot-garlic-chili paste in hot ghee until oil surfaces.', duration_minutes: 10, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add meat, curd, and spices; slow simmer until tender and gravy is intensely flavorful.', duration_minutes: 25, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Add water, bring to boil, add Seeraga Samba rice, and seal under heavy dum for 20 mins.', duration_minutes: 20, parallel: false },
    ],
    moods: ['treat', 'spicy'],
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // 3. MAHARASHTRA SIGNATURES (Flavors of Maharashtra)
  // ═════════════════════════════════════════════════════════════════════════════
  // ── 5 MIN MAHARASHTRA DISHES ──
  {
    id: 'maha-poha',
    name: 'Kanda Poha',
    regionalName: 'Maharashtrian Poha',
    region: 'Maharashtra',
    timeTier: '5m',
    time: 5,
    image: '/food/poha.jpg',
    subtitle: 'Fluffy turmeric flattened rice tossed with crunchy peanuts, onions, chilies & fresh coconut',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Thick Poha (Flattened Rice)', quantity: '2 cups rinsed & drained' },
      { name: 'Onions', quantity: '1 finely chopped' },
      { name: 'Peanuts', quantity: '2 tbsp raw/roasted' },
      { name: 'Mustard Seeds & Cumin', quantity: '1/2 tsp each' },
      { name: 'Green Chilies', quantity: '2 finely chopped' },
      { name: 'Turmeric Powder', quantity: '1/2 tsp' },
      { name: 'Curry Leaves & Coriander', quantity: '1 sprig + 2 tbsp' },
      { name: 'Lemon Wedge', quantity: '1 juicy slice' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Rinse poha in a colander under running water for 30 seconds; drain completely and rest with salt & turmeric.', duration_minutes: 1, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Heat peanut oil; fry peanuts till golden crisp. Splutter mustard, cumin, green chilies, and curry leaves.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Add chopped onions, sauté translucent, fold in drained poha, cover pan and steam on lowest heat for 2 mins.', duration_minutes: 2, parallel: false },
    ],
    moods: ['exhausted', 'budget', 'healthy', 'quick', 'comfort'],
  },
  {
    id: 'maha-dadpe-pohe',
    name: 'Dadpe Pohe',
    regionalName: 'Konkani Dadpe Pohe',
    region: 'Maharashtra',
    timeTier: '5m',
    time: 5,
    image: '/food/poha.jpg',
    subtitle: 'Zero-cook raw thin poha tossed with freshly grated coconut, onion, roasted peanuts & lemon',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Thin Poha', quantity: '2 cups' },
      { name: 'Fresh Grated Coconut & Coconut Water', quantity: '1/2 cup' },
      { name: 'Finely Chopped Onion & Coriander', quantity: '1/2 cup' },
      { name: 'Roasted Peanuts', quantity: '2 tbsp' },
      { name: 'Hot Oil Tadka (Mustard, Chili, Curry Leaves)', quantity: '1 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'In a bowl, mix thin poha with grated coconut, onion, coriander, lemon, and a splash of coconut water.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Pour sizzling mustard, chili, and curry leaf tadka over the poha; cover with a plate for 3 mins to steam naturally.', duration_minutes: 3, parallel: false },
    ],
    moods: ['quick', 'healthy', 'budget', 'exhausted', 'comfort'],
  },
  {
    id: 'maha-mattha',
    name: 'Spiced Mattha',
    regionalName: 'Maharashtrian Taak',
    region: 'Maharashtra',
    timeTier: '5m',
    time: 5,
    image: '/food/yogurt.jpg',
    subtitle: 'Chilled digestive buttermilk churned with crushed green chili, ginger, roasted cumin & coriander',
    diet: 'veg',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Fresh Curd / Yogurt', quantity: '1 cup churned with water' },
      { name: 'Ginger & Green Chili Paste', quantity: '1/2 tsp' },
      { name: 'Roasted Cumin Powder & Black Salt', quantity: '1/2 tsp each' },
      { name: 'Coriander Leaves', quantity: '2 tbsp finely chopped' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Whisk yogurt with cold water, salt, black salt, and ginger-chili paste until frothy.', duration_minutes: 3, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Dust roasted cumin and fresh coriander over top; serve icy cold.', duration_minutes: 2, parallel: false },
    ],
    moods: ['healthy', 'quick', 'comfort', 'exhausted'],
  },

  // ── 15 MIN MAHARASHTRA DISHES (10-15m) ──
  {
    id: 'maha-batata-poha',
    name: 'Batata Poha',
    regionalName: 'Aloo Poha',
    region: 'Maharashtra',
    timeTier: '15m',
    time: 10,
    image: '/food/poha.jpg',
    subtitle: 'Golden-fried spiced potato cubes tossed with fluffy tempered poha & fresh coriander',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Flattened Rice (Poha)', quantity: '2 cups' },
      { name: 'Potato', quantity: '1 diced small' },
      { name: 'Peanuts & Mustard Seeds', quantity: '2 tbsp + 1/2 tsp' },
      { name: 'Green Chilies & Turmeric', quantity: '2 slit + 1/2 tsp' },
      { name: 'Peanut Oil & Lemon', quantity: '1.5 tbsp + wedges' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Fry diced potatoes in peanut oil with mustard and peanuts until tender and golden.', duration_minutes: 5, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add turmeric, green chilies, and drained poha with salt.', duration_minutes: 3, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Cover and steam for 2 minutes; finish with lemon juice and coconut.', duration_minutes: 2, parallel: false },
    ],
    moods: ['quick', 'comfort', 'budget'],
  },
  {
    id: 'maha-pitla-bhakri',
    name: 'Zunka / Pitla',
    regionalName: 'Khandeshi Besan Pitla',
    region: 'Maharashtra',
    timeTier: '15m',
    time: 12,
    image: '/food/bowl.jpg',
    subtitle: 'Rustic spiced gram flour porridge tempered with crushed garlic & fiery green chilies',
    diet: 'vegan',
    difficulty: 'Easy',
    ingredients: [
      { name: 'Besan (Gram Flour)', quantity: '1 cup' },
      { name: 'Garlic', quantity: '6 cloves crushed coarsely' },
      { name: 'Green Chilies', quantity: '3 crushed' },
      { name: 'Mustard & Cumin Seeds', quantity: '1/2 tsp each' },
      { name: 'Turmeric & Asafoetida (Hing)', quantity: '1/4 tsp each' },
      { name: 'Coriander Leaves', quantity: '2 tbsp' },
      { name: 'Oil', quantity: '1.5 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Whisk besan with 2 cups of water, salt, and turmeric without any lumps.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Heat oil in a kadai; fry mustard seeds, cumin, hing, lots of crushed garlic, and green chilies until aromatic.', duration_minutes: 3, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Pour the besan slurry continuously while stirring briskly to prevent lumps.', duration_minutes: 4, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Cover and let it simmer for 3 minutes until thick, glossy, and fragrant. Garnish with cilantro.', duration_minutes: 3, parallel: false },
    ],
    moods: ['comfort', 'budget', 'normal', 'spicy', 'quick'],
  },
  {
    id: 'maha-sabudana-khichdi',
    name: 'Sabudana Khichdi',
    regionalName: 'Farali Khichdi',
    region: 'Maharashtra',
    timeTier: '15m',
    time: 12,
    image: '/food/poha.jpg',
    subtitle: 'Pearlescent tapioca pearls tossed with coarse roasted peanuts, cumin & green chilies in pure ghee',
    diet: 'veg',
    difficulty: 'Easy',
    ingredients: [
      { name: 'Soaked Sabudana (Tapioca)', quantity: '2 cups fluffy' },
      { name: 'Roasted Crushed Peanuts (Danyacha Koot)', quantity: '1/2 cup' },
      { name: 'Boiled Potato', quantity: '1 diced' },
      { name: 'Cumin Seeds & Green Chilies', quantity: '1 tsp cumin + 3 chilies' },
      { name: 'Desi Ghee / Peanut Oil', quantity: '1.5 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Mix soaked sabudana with crushed roasted peanuts and salt in a bowl.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Heat ghee; splutter cumin, green chilies, and sauté potato cubes.', duration_minutes: 3, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Add sabudana mix, cover and steam on low flame for 5 minutes until pearls turn translucent.', duration_minutes: 5, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Finish with fresh lemon juice and chopped coriander.', duration_minutes: 2, parallel: false },
    ],
    moods: ['comfort', 'healthy', 'treat', 'quick'],
  },

  // ── 30 MIN MAHARASHTRA DISHES ──
  {
    id: 'maha-misal-pav',
    name: 'Kolhapuri Misal Pav',
    regionalName: 'Zanzanit Misal Pav',
    region: 'Maharashtra',
    timeTier: '30m',
    time: 25,
    image: '/food/misal_pav.jpg',
    subtitle: 'Sprouted moth bean usal drenched in fiery red tarri broth, topped with crisp farsan & warm pav',
    diet: 'veg',
    difficulty: 'Medium',
    ingredients: [
      { name: 'Sprouted Matki (Moth Beans)', quantity: '1.5 cups boiled' },
      { name: 'Misal Farsan / Sev', quantity: '1 cup crunchy mix' },
      { name: 'Pav (Indian Breads)', quantity: '4 soft buns' },
      { name: 'Kanda Lasun Masala / Kolhapuri Masala', quantity: '2 tbsp' },
      { name: 'Dry Coconut & Onion Paste', quantity: '1/2 cup roasted' },
      { name: 'Red Onion & Lemon', quantity: '1 diced + wedges' },
      { name: 'Oil (for Kat / Tarri)', quantity: '3 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Roast sliced onions and dry coconut until dark brown; grind with ginger and garlic into a smooth paste.', duration_minutes: 7, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Heat oil generously; fry the roasted paste and Kolhapuri masala until deep red oil separates (tarri).', duration_minutes: 6, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Add boiled sprouted matki and 2 cups warm water. Simmer vigorously for 8 minutes to build the fiery broth.', duration_minutes: 8, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Assemble in a bowl: boiled matki, ladles of fiery red tarri, heaps of farsan, chopped raw onions, and buttered pav.', duration_minutes: 4, parallel: false },
    ],
    moods: ['spicy', 'treat', 'comfort'],
  },
  {
    id: 'maha-bharli-vangi',
    name: 'Bharli Vangi',
    regionalName: 'Maharashtrian Stuffed Eggplant',
    region: 'Maharashtra',
    timeTier: '30m',
    time: 28,
    image: '/food/kara_kuzhambu.jpg',
    subtitle: 'Tender baby eggplants stuffed with toasted peanut, sesame, jaggery & goda masala gravy',
    diet: 'vegan',
    difficulty: 'Medium',
    ingredients: [
      { name: 'Small Purple Brinjals (Baingan)', quantity: '8 slit criss-cross' },
      { name: 'Peanut, Sesame & Coconut Stuffing', quantity: '1 cup roasted & spiced' },
      { name: 'Goda Masala & Jaggery', quantity: '1.5 tbsp + 1 tsp' },
      { name: 'Curry Leaves & Mustard', quantity: '1 sprig + 1/2 tsp' },
      { name: 'Oil', quantity: '2 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Stuff baby eggplants with spiced roasted peanut-coconut mixture.', duration_minutes: 6, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Heat oil; crackle mustard seeds and curry leaves. Place stuffed brinjals in a single layer.', duration_minutes: 4, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Add leftover stuffing paste, water, and jaggery; cover and simmer for 18 minutes until eggplants are melt-in-mouth soft.', duration_minutes: 18, parallel: false },
    ],
    moods: ['comfort', 'treat', 'normal'],
  },

  // ── WEEKEND MAHARASHTRA DISHES ──
  {
    id: 'maha-pav-bhaji',
    name: 'Mumbai Chowpatty Pav Bhaji',
    regionalName: 'Butter Pav Bhaji',
    region: 'Maharashtra',
    timeTier: 'weekend',
    time: 45,
    image: '/food/burger.jpg',
    subtitle: 'Slow-mashed spiced potatoes, cauliflower, and sweet peas soaked in amul butter & toasted pav',
    diet: 'veg',
    difficulty: 'Feast',
    ingredients: [
      { name: 'Boiled Potatoes & Cauliflower', quantity: '3 cups mashed' },
      { name: 'Green Peas & Bell Pepper', quantity: '1 cup' },
      { name: 'Tomatoes', quantity: '4 finely pureed' },
      { name: 'Pav Bhaji Masala', quantity: '2.5 tbsp' },
      { name: 'Butter', quantity: '75g generous slab' },
      { name: 'Pav Buns', quantity: '6 fluffy rolls' },
      { name: 'Kasuri Methi & Lemon', quantity: '1 tbsp + wedges' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'On a wide tawa, melt butter and sauté finely chopped bell peppers and onions till tender.', duration_minutes: 8, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add tomato puree, pav bhaji masala, Kashmiri chili, and salt. Cook until butter bubbles on edges.', duration_minutes: 10, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Tumble in boiled mashed vegetables and water; mash continuously with a potato masher until silky smooth.', duration_minutes: 15, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Toast pav on the buttery spiced tawa until golden. Serve bhaji crowned with an extra dollop of butter and chopped onions.', duration_minutes: 12, parallel: false },
    ],
    moods: ['treat', 'comfort', 'spicy'],
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // 4. KARNATAKA SIGNATURES (Karunadu Flavors)
  // ═════════════════════════════════════════════════════════════════════════════
  // ── 5 MIN KARNATAKA DISHES ──
  {
    id: 'karn-curd-rice',
    name: 'Bagala Bath',
    regionalName: 'Karnataka Mosaru Anna',
    region: 'Karnataka',
    timeTier: '5m',
    time: 5,
    image: '/food/yogurt.jpg',
    subtitle: 'Cooling probiotic curd rice tempered with mustard, ginger, curry leaves & pomegranate pearls',
    diet: 'veg',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Soft Cooked Rice', quantity: '2 cups slightly mashed' },
      { name: 'Fresh Thick Curd / Yogurt', quantity: '1.5 cups' },
      { name: 'Mustard Seeds & Hing', quantity: '1/2 tsp each' },
      { name: 'Green Chilies & Ginger', quantity: '1 tsp minced' },
      { name: 'Curry Leaves', quantity: '1 sprig' },
      { name: 'Pomegranate Seeds', quantity: '2 tbsp optional' },
      { name: 'Ghee', quantity: '1 tsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Mix mashed soft rice with thick curd, a splash of milk, and salt until creamy.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Heat ghee; crackle mustard seeds, hing, minced ginger, and curry leaves.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Pour the sizzling tadka over the curd rice and top with fresh pomegranate pearls.', duration_minutes: 1, parallel: false },
    ],
    moods: ['exhausted', 'healthy', 'comfort', 'quick'],
  },
  {
    id: 'karn-chitranna',
    name: 'Lemon Chitranna',
    regionalName: 'Mysore Chitranna',
    region: 'Karnataka',
    timeTier: '5m',
    time: 5,
    image: '/food/lemon_rice.jpg',
    subtitle: 'Tempered turmeric rice with roasted peanuts, chana dal & fresh grated coconut',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Cooked Rice', quantity: '2 cups' },
      { name: 'Lemon Juice', quantity: '2 tbsp' },
      { name: 'Mustard Seeds, Chana Dal & Peanuts', quantity: '1 tbsp each' },
      { name: 'Curry Leaves & Green Chilies', quantity: '1 sprig + 2 chilies' },
      { name: 'Oil & Turmeric', quantity: '1 tbsp + 1/2 tsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat oil; roast peanuts, chana dal, mustard, curry leaves, and green chilies until crispy.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add turmeric and salt; toss in cooked rice and coat evenly.', duration_minutes: 2, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Drizzle lemon juice, garnish with grated coconut, and serve.', duration_minutes: 1, parallel: false },
    ],
    moods: ['quick', 'budget', 'comfort', 'healthy'],
  },
  {
    id: 'karn-kosambari',
    name: 'Hesaru Bele Kosambari',
    regionalName: 'Moong Dal Kosambari',
    region: 'Karnataka',
    timeTier: '5m',
    time: 5,
    image: '/food/salad.jpg',
    subtitle: 'Crisp split moong soaked and tossed with fresh grated coconut, cucumber, lemon & mustard tadka',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Yellow Moong Dal', quantity: '1/2 cup soaked 15 mins' },
      { name: 'Finely Chopped Cucumber', quantity: '1/2 cup' },
      { name: 'Grated Coconut', quantity: '1/3 cup fresh' },
      { name: 'Lemon Juice & Green Chili', quantity: '1 tbsp + 1 minced' },
      { name: 'Mustard Seeds & Hing Tadka', quantity: '1 tsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Drain soaked moong dal completely; combine with diced cucumber, grated coconut, and lemon.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Heat oil; splutter mustard seeds and hing; pour over the salad and toss with salt.', duration_minutes: 3, parallel: false },
    ],
    moods: ['healthy', 'quick', 'comfort', 'exhausted', 'budget'],
  },

  // ── 15 MIN KARNATAKA DISHES (10-15m) ──
  {
    id: 'karn-tomato-gojju',
    name: 'Tomato Gojju',
    regionalName: 'Huli Khara Tomato Gojju',
    region: 'Karnataka',
    timeTier: '15m',
    time: 10,
    image: '/food/tomato_rice.jpg',
    subtitle: 'Sweet, spicy & tangy stewed country tomatoes with jaggery, rasam powder & mustard tadka',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Country Tomatoes', quantity: '4 chopped' },
      { name: 'Jaggery (Bella)', quantity: '1.5 tbsp' },
      { name: 'Rasam Powder / Sambar Powder', quantity: '1.5 tsp' },
      { name: 'Mustard Seeds, Hing & Curry Leaves', quantity: '1/2 tsp + 1 sprig' },
      { name: 'Coconut Oil', quantity: '1 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat oil; crackle mustard seeds, hing, and curry leaves.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add chopped tomatoes, salt, turmeric, and cook until mushy.', duration_minutes: 5, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Stir in jaggery and rasam powder with a splash of water; simmer 3 mins till glossy.', duration_minutes: 3, parallel: false },
    ],
    moods: ['quick', 'comfort', 'spicy', 'budget'],
  },
  {
    id: 'karn-neer-dosa',
    name: 'Neer Dosa',
    regionalName: 'Mangalore Neer Dose',
    region: 'Karnataka',
    timeTier: '15m',
    time: 15,
    image: '/food/pasta.jpg',
    subtitle: 'Lacy, feather-light water crepes made with soaked rice & grated coconut',
    diet: 'vegan',
    difficulty: 'Easy',
    ingredients: [
      { name: 'Soaked Raw Rice & Coconut Batter (water consistency)', quantity: '2 cups' },
      { name: 'Salt', quantity: 'to taste' },
      { name: 'Oil for drizzling', quantity: '1 tsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Whisk thin rice-coconut batter with salt until watery.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Pour a ladleful on a piping hot tawa, cover with lid for 1 minute without flipping.', duration_minutes: 6, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Fold into soft triangles and serve with coconut chutney.', duration_minutes: 7, parallel: false },
    ],
    moods: ['healthy', 'comfort', 'quick', 'treat'],
  },

  // ── 30 MIN KARNATAKA DISHES ──
  {
    id: 'karn-bisi-bele-bath',
    name: 'Bisi Bele Bath',
    regionalName: 'Mysore Bisi Bele Bath',
    region: 'Karnataka',
    timeTier: '30m',
    time: 30,
    image: '/food/salad.jpg',
    subtitle: 'Wholesome one-pot rice & toor dal cooked with mixed vegetables, tamarind & special Mysore spice blend',
    diet: 'veg',
    difficulty: 'Medium',
    ingredients: [
      { name: 'Rice & Toor Dal', quantity: '1 cup mixed' },
      { name: 'Mixed Vegetables (Beans, Carrots, Peas)', quantity: '1.5 cups' },
      { name: 'Bisi Bele Bath Powder', quantity: '2 tbsp' },
      { name: 'Tamarind Pulp', quantity: '2 tbsp' },
      { name: 'Ghee', quantity: '2 tbsp' },
      { name: 'Cashews & Boondi', quantity: 'for garnish' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Pressure cook rice, toor dal, and vegetables with turmeric until soft and mashable.', duration_minutes: 12, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'In a pot, bring tamarind extract and bisi bele bath powder with water to a boil.', duration_minutes: 6, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Combine cooked rice-dal mixture into the tamarind gravy; simmer together on low heat for 8 minutes.', duration_minutes: 8, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Temper with hot ghee, mustard seeds, curry leaves, and roasted cashews. Serve steaming with boondi.', duration_minutes: 4, parallel: false },
    ],
    moods: ['comfort', 'treat', 'spicy'],
  },

  // ── WEEKEND KARNATAKA DISHES ──
  {
    id: 'karn-ghee-roast',
    name: 'Mangalore Ghee Roast',
    regionalName: 'Kundapura Paneer / Chicken Ghee Roast',
    region: 'Karnataka',
    timeTier: 'weekend',
    time: 45,
    image: '/food/bowl.jpg',
    subtitle: 'Fiery Byadgi chili and whole roasted spice paste cooked in copious desi ghee',
    diet: 'veg',
    difficulty: 'Feast',
    ingredients: [
      { name: 'Paneer / Mushrooms / Chicken', quantity: '350g' },
      { name: 'Byadgi Chilies & Whole Spices', quantity: '8 chilies roasted' },
      { name: 'Garlic & Tamarind', quantity: '1 tbsp each' },
      { name: 'Pure Desi Ghee', quantity: '4 tbsp' },
      { name: 'Curry Leaves', quantity: '2 sprigs' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Grind roasted Byadgi chilies, peppercorns, coriander seeds, cumin, garlic, and tamarind into a smooth paste.', duration_minutes: 10, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'In a heavy pan, melt generous ghee and fry the red roast masala on low heat until ghee separates.', duration_minutes: 15, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Toss paneer or chicken in the fiery ghee masala with curry leaves; roast until deeply caramelized.', duration_minutes: 20, parallel: false },
    ],
    moods: ['treat', 'spicy', 'comfort'],
  },

  // ═════════════════════════════════════════════════════════════════════════════
  // 5. NORTH INDIAN SIGNATURES (Punjab & Delhi)
  // ═════════════════════════════════════════════════════════════════════════════
  // ── 5 MIN NORTH INDIAN DISHES ──
  {
    id: 'north-besan-toast',
    name: 'Besan Bread Toast',
    regionalName: 'Masala Besan Toast',
    region: 'North Indian',
    timeTier: '5m',
    time: 5,
    image: '/food/pasta.jpg',
    subtitle: 'Spiced chickpea batter pan-toasted on bread with onions, green chilies & ajwain',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Bread Slices', quantity: '4 slices' },
      { name: 'Besan (Gram Flour)', quantity: '1/2 cup' },
      { name: 'Onions, Chilies & Coriander', quantity: '1/2 cup minced' },
      { name: 'Ajwain (Carom seeds) & Turmeric', quantity: '1/4 tsp each' },
      { name: 'Ghee or Oil', quantity: '1 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Whisk besan with water, onions, green chilies, ajwain, and salt into a smooth dipping batter.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Dip bread into batter and toast on hot buttered skillet for 1.5 mins on each side until golden crisp.', duration_minutes: 3, parallel: false },
    ],
    moods: ['quick', 'budget', 'comfort', 'exhausted'],
  },
  {
    id: 'north-dahi-boondi',
    name: 'Chatpati Boondi Chaat',
    regionalName: 'Dahi Boondi Chaat',
    region: 'North Indian',
    timeTier: '5m',
    time: 5,
    image: '/food/yogurt.jpg',
    subtitle: 'Crispy salted boondi soaked in seasoned chilled yogurt, roasted cumin & tangy chaat masala',
    diet: 'veg',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Crisp Boondi', quantity: '1 cup' },
      { name: 'Chilled Whisked Curd', quantity: '1.5 cups' },
      { name: 'Roasted Cumin & Chaat Masala', quantity: '1/2 tsp each' },
      { name: 'Black Salt & Chili Powder', quantity: '1/4 tsp each' },
      { name: 'Coriander Leaves', quantity: '1 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Whisk chilled curd with black salt, cumin powder, and chaat masala.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Fold in crunchy boondi right before serving so it stays crisp; dust with red chili.', duration_minutes: 3, parallel: false },
    ],
    moods: ['quick', 'comfort', 'treat', 'exhausted'],
  },

  // ── 15 MIN NORTH INDIAN DISHES (10-15m) ──
  {
    id: 'north-aloo-jeera',
    name: 'Aloo Jeera',
    regionalName: 'Chatpata Aloo Jeera',
    region: 'North Indian',
    timeTier: '15m',
    time: 10,
    image: '/food/bowl.jpg',
    subtitle: 'Golden-crisped boiled potatoes tossed in generous cumin seeds, amchur & green chilies',
    diet: 'vegan',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Boiled Potatoes', quantity: '3 cubed' },
      { name: 'Cumin Seeds (Jeera)', quantity: '1.5 tsp generous' },
      { name: 'Green Chilies & Ginger', quantity: '1 tbsp minced' },
      { name: 'Amchur (Dry Mango Powder)', quantity: '1/2 tsp' },
      { name: 'Ghee or Mustard Oil', quantity: '1.5 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat ghee/mustard oil; crackle lots of cumin seeds and green chilies until aromatic.', duration_minutes: 2, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add potato cubes, turmeric, salt, and amchur. Sauté on medium-high heat until edges are golden and crisp.', duration_minutes: 6, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Garnish with fresh coriander leaves.', duration_minutes: 2, parallel: false },
    ],
    moods: ['quick', 'comfort', 'budget', 'spicy'],
  },
  {
    id: 'north-egg-bhurji',
    name: 'Dhaba Egg Bhurji',
    regionalName: 'Masala Anda Bhurji',
    region: 'North Indian',
    timeTier: '15m',
    time: 10,
    image: '/food/egg_roast.jpg',
    subtitle: 'Street-style spiced eggs scrambled with butter, caramelized onions, tomatoes & kasuri methi',
    diet: 'non-veg',
    difficulty: 'Quick',
    ingredients: [
      { name: 'Eggs', quantity: '3 beaten' },
      { name: 'Onions & Tomatoes', quantity: '1/2 cup chopped' },
      { name: 'Green Chilies & Ginger', quantity: '1 tbsp minced' },
      { name: 'Butter / Ghee', quantity: '1.5 tbsp' },
      { name: 'Pav Bhaji Masala / Garam Masala', quantity: '1/2 tsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Melt butter; sauté onions, ginger, and green chilies till soft. Add tomatoes and spices.', duration_minutes: 4, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Pour in beaten eggs; scramble gently over medium heat until creamy and cooked through.', duration_minutes: 4, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Top with chopped cilantro and serve with toast or paratha.', duration_minutes: 2, parallel: false },
    ],
    moods: ['quick', 'spicy', 'comfort'],
  },
  {
    id: 'north-paneer-bhurji',
    name: 'Paneer Bhurji',
    regionalName: 'Amritsari Paneer Bhurji',
    region: 'North Indian',
    timeTier: '15m',
    time: 15,
    image: '/food/bowl.jpg',
    subtitle: 'Spiced scrambled fresh cottage cheese with onions, tomatoes & kasuri methi in butter',
    diet: 'veg',
    difficulty: 'Easy',
    ingredients: [
      { name: 'Fresh Paneer', quantity: '200g crumbled' },
      { name: 'Onion', quantity: '1 finely chopped' },
      { name: 'Tomatoes', quantity: '2 diced' },
      { name: 'Ginger Garlic & Green Chilies', quantity: '1 tbsp minced' },
      { name: 'Coriander, Cumin & Turmeric', quantity: '1/2 tsp each' },
      { name: 'Kasuri Methi', quantity: '1 tsp crushed' },
      { name: 'Butter / Ghee', quantity: '1.5 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat butter in a pan; sauté cumin, onions, ginger, and green chilies till soft.', duration_minutes: 4, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add tomatoes, turmeric, coriander powder, and salt. Sauté till butter separates.', duration_minutes: 5, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Fold in crumbled paneer and crushed kasuri methi. Toss on high heat for 3 minutes without drying out.', duration_minutes: 3, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Garnish with fresh coriander and serve hot with parathas or bread.', duration_minutes: 3, parallel: false },
    ],
    moods: ['comfort', 'healthy', 'treat', 'normal', 'spicy'],
  },
  {
    id: 'north-dal-tadka',
    name: 'Homestyle Dal Tadka',
    regionalName: 'Dhaba Dal Tadka',
    region: 'North Indian',
    timeTier: '15m',
    time: 15,
    image: '/food/bowl.jpg',
    subtitle: 'Yellow lentils tempered with sizzling garlic, cumin, Kashmiri red chili & pure desi ghee',
    diet: 'veg',
    difficulty: 'Easy',
    ingredients: [
      { name: 'Toor Dal / Moong Dal', quantity: '1 cup boiled soft' },
      { name: 'Garlic & Cumin', quantity: '6 cloves sliced + 1 tsp cumin' },
      { name: 'Tomatoes & Onions', quantity: '1/2 cup chopped' },
      { name: 'Kashmiri Chili & Hing', quantity: '1 tsp + pinch' },
      { name: 'Desi Ghee', quantity: '2 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Simmer boiled lentils with water, turmeric, and salt for 5 minutes.', duration_minutes: 5, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'In a tadka pan, heat ghee; fry garlic slices till golden brown with cumin, hing, and dried red chili.', duration_minutes: 5, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Pour the sizzling fragrant tadka over the dal, cover immediately to lock aroma.', duration_minutes: 5, parallel: false },
    ],
    moods: ['comfort', 'healthy', 'budget', 'normal'],
  },

  // ── 30 MIN NORTH INDIAN DISHES ──
  {
    id: 'north-rajma-masala',
    name: 'Punjabi Rajma Masala',
    regionalName: 'Dilli Ke Rajma',
    region: 'North Indian',
    timeTier: '30m',
    time: 28,
    image: '/food/bowl.jpg',
    subtitle: 'Red kidney beans slow-simmered in thick ginger, onion & tomato masala with warm spices',
    diet: 'vegan',
    difficulty: 'Medium',
    ingredients: [
      { name: 'Boiled Red Kidney Beans (Rajma)', quantity: '2 cups' },
      { name: 'Onion-Tomato Puree', quantity: '1.5 cups' },
      { name: 'Ginger Garlic Paste', quantity: '1.5 tbsp' },
      { name: 'Garam Masala & Kasuri Methi', quantity: '1 tsp each' },
      { name: 'Mustard Oil / Ghee', quantity: '2 tbsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Heat oil; sauté ginger-garlic paste and onion-tomato gravy until dark red and oil separates.', duration_minutes: 8, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Add boiled rajma with cooking liquid; mash a few beans with the back of ladle to create rich thick gravy.', duration_minutes: 15, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Simmer with garam masala and crushed kasuri methi for 5 minutes. Serve with hot basmati rice.', duration_minutes: 5, parallel: false },
    ],
    moods: ['comfort', 'treat', 'normal'],
  },

  // ── WEEKEND NORTH INDIAN DISHES ──
  {
    id: 'north-dal-makhani',
    name: 'Slow-Simmered Dal Makhani',
    regionalName: 'Punjabi Dal Makhani',
    region: 'North Indian',
    timeTier: 'weekend',
    time: 60,
    image: '/food/bowl.jpg',
    subtitle: 'Black lentils and red kidney beans slow-simmered with fresh cream, tomatoes & white butter',
    diet: 'veg',
    difficulty: 'Feast',
    ingredients: [
      { name: 'Whole Black Urad & Rajma', quantity: '1 cup soaked' },
      { name: 'Tomato Puree', quantity: '1 cup ripe' },
      { name: 'White Butter / Makhan', quantity: '50g' },
      { name: 'Fresh Cream', quantity: '1/3 cup' },
      { name: 'Kashmiri Chili Powder', quantity: '1.5 tsp' },
      { name: 'Kasuri Methi', quantity: '1 tsp' },
    ],
    steps: [
      { id: 'step-1', step_order: 1, instruction: 'Cook soaked urad and rajma until melt-in-the-mouth tender, mashing lightly with the back of a ladle.', duration_minutes: 25, parallel: false },
      { id: 'step-2', step_order: 2, instruction: 'Sauté ginger-garlic paste and tomato puree in butter until dark red and fragrant.', duration_minutes: 10, parallel: false },
      { id: 'step-3', step_order: 3, instruction: 'Combine with lentils and simmer gently on low flame for 20 minutes, stirring occasionally for velvet texture.', duration_minutes: 20, parallel: false },
      { id: 'step-4', step_order: 4, instruction: 'Swirl in heavy cream, kasuri methi, and an extra pat of white butter before serving.', duration_minutes: 5, parallel: false },
    ],
    moods: ['treat', 'comfort'],
  },
]

// ── Smart Pantry Matching Engine ──────────────────────────────────────────────
export interface MatchResult {
  matchPercentage: number
  matchCount: number
  totalCount: number
  matchLabel: string
  missingItem: string | null
}

export function computeRecipePantryMatch(
  recipe: RegionalRecipe,
  userPantry: string[] = []
): MatchResult {
  const normPantry = userPantry.map((p) => p.toLowerCase().trim())

  const universalStaples = [
    'salt',
    'oil',
    'water',
    'cooking oil',
    'turmeric',
    'turmeric powder',
    'ghee',
    'mustard seeds',
  ]

  let matches = 0
  const missing: string[] = []
  const ingredients = recipe.ingredients

  ingredients.forEach((ing) => {
    const ingNameLower = ing.name.toLowerCase()
    const isUniversal = universalStaples.some((s) => ingNameLower.includes(s))
    const isPantryMatch = normPantry.some(
      (p) =>
        ingNameLower.includes(p) ||
        p.includes(ingNameLower.split(' ')[0]) ||
        ingNameLower.split(' ').some((word) => word.length > 3 && p.includes(word))
    )

    if (isUniversal || isPantryMatch) {
      matches++
    } else if (!ing.optional) {
      missing.push(ing.name.split('(')[0].trim())
    }
  })

  const total = ingredients.length
  const matchPercentage = Math.min(100, Math.max(50, Math.round((matches / total) * 100)))

  let matchLabel = `${matchPercentage}% Match`
  if (matchPercentage >= 95) {
    matchLabel = '100% Match • All in pantry'
  } else if (missing.length > 0) {
    matchLabel = `${matchPercentage}% Match • Needs ${missing[0]}`
  }

  return {
    matchPercentage,
    matchCount: matches,
    totalCount: total,
    matchLabel,
    missingItem: missing[0] || null,
  }
}

// ── Strict Regional & Preference Filter ───────────────────────────────────────
export function getRegionalRecipesByTier(
  activeRegion: IndianRegion,
  activeDiet: string = 'all',
  activeMood: string | null = null,
  dynamicRecipes: RegionalRecipe[] = []
): Record<RegionalTimeTier, RegionalRecipe[]> {
  // Combine static catalogue with dynamic AI-generated recipes
  const allPool = [...REGIONAL_RECIPES, ...dynamicRecipes]

  // 1. Strict Region Filter:
  // When a specific region (Kerala, Tamil Nadu, etc.) is active, ONLY show dishes from that region!
  // No cross-region dishes are ever allowed into this pool.
  let pool = allPool.filter((r) => {
    if (activeRegion === 'All') return true
    return r.region.toLowerCase() === activeRegion.toLowerCase()
  })

  // 2. Filter by Diet
  if (activeDiet !== 'all') {
    const dietFiltered = pool.filter((r) => {
      if (activeDiet === 'veg') return r.diet === 'veg' || r.diet === 'vegan' || r.diet === 'jain'
      if (activeDiet === 'vegan') return r.diet === 'vegan'
      if (activeDiet === 'jain') return r.diet === 'jain'
      if (activeDiet === 'non-veg') return true
      return true
    })
    // If diet filter has dishes in this region, use them
    if (dietFiltered.length > 0) {
      pool = dietFiltered
    }
  }

  // 3. Filter / prioritize by Mood strictly within this regional pool
  const filterByTierAndMood = (tier: RegionalTimeTier): RegionalRecipe[] => {
    const tierRecipes = pool.filter((r) => r.timeTier === tier)
    if (!activeMood) return tierRecipes

    // Prioritize mood matches from THIS region
    const moodMatches = tierRecipes.filter((r) => r.moods.includes(activeMood))
    const nonMoodMatches = tierRecipes.filter((r) => !r.moods.includes(activeMood))

    if (moodMatches.length > 0) {
      return [...moodMatches, ...nonMoodMatches]
    }
    // If no dish in this region matches that mood, keep all dishes of this region in this tier
    return tierRecipes
  }

  return {
    '5m': filterByTierAndMood('5m'),
    '15m': filterByTierAndMood('15m'),
    '30m': filterByTierAndMood('30m'),
    weekend: filterByTierAndMood('weekend'),
  }
}

// ── AI Sous Chef Dynamic Regional Greeting ───────────────────────────────────
export function getSousChefRegionalGreeting(
  region: IndianRegion,
  pantryCount: number,
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
): { title: string; highlightRecipe: string; prompt: string } {
  if (region === 'Kerala') {
    if (timeOfDay === 'morning') {
      return {
        title: 'Morning in God’s Own Country 🌴',
        highlightRecipe: 'Tomato Thoran',
        prompt: `Coconut & fresh curry leaves ready. Chef Mise suggests a crisp 5m Tomato Thoran for breakfast!`,
      }
    }
    return {
      title: 'Kerala Coastal Flavors 🌴',
      highlightRecipe: 'Egg Roast',
      prompt: `Eggs & shallots detected in pantry. Whip up a spicy Nadan Egg Roast in under 15 minutes!`,
    }
  }

  if (region === 'Tamil Nadu') {
    if (timeOfDay === 'morning') {
      return {
        title: 'Vanakkam, Chef! 🛕',
        highlightRecipe: 'Lemon Sevai',
        prompt: `Quick 5m Lemon Sevai with roasted peanuts & ginger — crisp, comforting, and zero mess.`,
      }
    }
    return {
      title: 'Tamil Culinary Heritage 🛕',
      highlightRecipe: 'Kara Kuzhambu',
      prompt: `Whole garlic & shallots ready. Simmer a tangy, rich Kara Kuzhambu with piping hot rice.`,
    }
  }

  if (region === 'Maharashtra') {
    if (timeOfDay === 'morning') {
      return {
        title: 'Namaskar! 🌊 Mumbai Morning',
        highlightRecipe: 'Kanda Poha',
        prompt: `Flattened rice, peanuts & green chilies ready — let’s steam golden Kanda Poha in 5 mins!`,
      }
    }
    return {
      title: 'Maharashtrian Flavors 🌊',
      highlightRecipe: 'Kolhapuri Misal Pav',
      prompt: `Sprouted beans ready for fiery Kolhapuri Misal Pav with crunchy farsan & buttered pav.`,
    }
  }

  if (region === 'Karnataka') {
    return {
      title: 'Flavors of Karnataka 🌾',
      highlightRecipe: 'Bagala Bath',
      prompt: `Curd & tempered spices ready — enjoy authentic Bagala Bath or Mysore Chitranna in 5 mins!`,
    }
  }

  if (region === 'North Indian') {
    return {
      title: 'Dilli & Punjabi Flavors 🍲',
      highlightRecipe: 'Paneer Bhurji',
      prompt: `Fresh paneer & butter ready. Sizzle up Amritsari Paneer Bhurji in 10-15 mins!`,
    }
  }

  // Pan-Regional / All
  return {
    title: 'Your Regional AI Sous Chef 🇮🇳',
    highlightRecipe: 'Egg Roast',
    prompt: `Based on your ${pantryCount} pantry items, authentic regional dishes are matched & ready to cook.`,
  }
}
