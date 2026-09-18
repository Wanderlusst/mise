"use client";

import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { Leaf, Droplets, Flame, Clock, Users, Star } from "lucide-react";
import Link from "next/link";

interface RecipeData {
  id: string;
  category: string;
  title: string;
  src: string;
  time: number;
  servings: number;
  match: number;
  carbs: string;
  fats: string;
  sugar: string;
  description: string;
  ingredients: string[];
}

const RECIPE_CARDS: RecipeData[] = [
  {
    id: "pasta-001",
    category: "Quick Dinner",
    title: "Spicy Tomato Fusilli",
    src: "/food/pasta.jpg",
    time: 20,
    servings: 2,
    match: 94,
    carbs: "18.2%",
    fats: "0.5%",
    sugar: "12.4%",
    description: "Al dente fusilli tossed in a rich, slow-simmered garlic cherry tomato sauce with fresh torn basil leaves.",
    ingredients: ["Fusilli Pasta", "Cherry Tomatoes", "Garlic", "Fresh Basil", "Chili Flakes", "Extra Virgin Olive Oil"],
  },
  {
    id: "salad-001",
    category: "Fresh & Crisp",
    title: "Mediterranean Salad",
    src: "/food/salad.jpg",
    time: 10,
    servings: 2,
    match: 88,
    carbs: "11.4%",
    fats: "22.1%",
    sugar: "6.8%",
    description: "Crisp European greens, Persian cucumbers, Kalamata olives, and crumbled feta cheese with lemon-oregano vinaigrette.",
    ingredients: ["Mixed Greens", "Persian Cucumber", "Kalamata Olives", "Feta Cheese", "Red Onion", "Lemon Dressing"],
  },
  {
    id: "smoothie-001",
    category: "Breakfast Bowl",
    title: "Berry Smoothie Bowl",
    src: "/food/smoothie.jpg",
    time: 5,
    servings: 1,
    match: 96,
    carbs: "24.3%",
    fats: "4.2%",
    sugar: "31.0%",
    description: "Velvety acai & mixed berry smoothie base topped with chia seeds, golden flax, coconut flakes, and raw honey.",
    ingredients: ["Frozen Berries", "Greek Yogurt", "Banana", "Chia Seeds", "Honey", "Toasted Almonds"],
  },
  {
    id: "bowl-001",
    category: "High Protein",
    title: "Salmon Rice Bowl",
    src: "/food/bowl.jpg",
    time: 25,
    servings: 2,
    match: 91,
    carbs: "32.1%",
    fats: "18.7%",
    sugar: "3.2%",
    description: "Pan-seared Atlantic salmon fillet resting on warm jasmine rice with shaved nori, edamame, and sesame drizzle.",
    ingredients: ["Salmon Fillet", "Jasmine Rice", "Edamame", "Avocado", "Nori Strips", "Tamari Glaze"],
  },
];

function RecipeModalContent({ recipe }: { recipe: RecipeData }) {
  return (
    <div className="space-y-6 font-manrope">
      <p className="text-stone-600 dark:text-stone-300 text-base md:text-lg leading-relaxed">
        {recipe.description}
      </p>

      {/* Nutrition Macro Chips */}
      <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-white/10">
        <div className="flex flex-col items-center">
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            <Leaf size={14} /> Carbs
          </span>
          <span className="text-lg font-bold font-manrope text-stone-900 dark:text-white">
            {recipe.carbs}
          </span>
        </div>
        <div className="flex flex-col items-center border-x border-stone-200 dark:border-white/10">
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
            <Droplets size={14} /> Fats
          </span>
          <span className="text-lg font-bold font-manrope text-stone-900 dark:text-white">
            {recipe.fats}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
            <Flame size={14} /> Sugar
          </span>
          <span className="text-lg font-bold font-manrope text-stone-900 dark:text-white">
            {recipe.sugar}
          </span>
        </div>
      </div>

      {/* Quick Info */}
      <div className="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400">
        <span className="flex items-center gap-1.5 font-medium">
          <Clock size={15} /> {recipe.time} minutes
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <Users size={15} /> {recipe.servings} servings
        </span>
        <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-[#ffa371]">
          <Star size={15} fill="currentColor" /> {recipe.match}% pantry match
        </span>
      </div>

      {/* Ingredients list */}
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white mb-2.5">
          Key Ingredients
        </h4>
        <div className="flex flex-wrap gap-2">
          {recipe.ingredients.map((ing) => (
            <span
              key={ing}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-black/5 dark:border-white/10"
            >
              {ing}
            </span>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-4">
        <Link
          href={`/mobile/detail/${recipe.id}`}
          className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-stone-900 text-white dark:bg-[#ffa371] dark:text-[#2c2c2c] hover:opacity-90 transition-opacity"
        >
          Cook This Recipe Now
        </Link>
      </div>
    </div>
  );
}

export default function AppleCardsCarouselDemo() {
  const cards = RECIPE_CARDS.map((recipe, index) => ({
    category: recipe.category,
    title: recipe.title,
    src: recipe.src,
    content: <RecipeModalContent recipe={recipe} />,
  })).map((card, index) => (
    <Card key={card.title} card={card} index={index} />
  ));

  return (
    <div className="w-full py-6 font-manrope">
      <div className="px-4 mb-2 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-[#ffa371]">
            Curated For You
          </p>
          <h2 className="text-xl md:text-3xl font-bold font-apple text-stone-900 dark:text-white tracking-tight">
            Featured Recipes
          </h2>
        </div>
      </div>
      <Carousel items={cards} />
    </div>
  );
}
