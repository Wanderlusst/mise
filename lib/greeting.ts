export function getGreeting(date: Date = new Date()): { headline: string; sub: string } {
  const hour = date.getHours()
  if (hour >= 5 && hour < 11) {
    return {
      headline: "Good morning,",
      sub: "What's for breakfast?",
    }
  } else if (hour >= 11 && hour < 15) {
    return {
      headline: "Let's find something",
      sub: "to cook for lunch",
    }
  } else if (hour >= 15 && hour < 18) {
    return {
      headline: "Afternoon snack",
      sub: "time to cook",
    }
  } else {
    return {
      headline: "Let's find something",
      sub: "to cook tonight",
    }
  }
}

export function getDynamicGreeting(currentDate: Date = new Date()): { timeGreeting: string; mealContext: string } {
  const hour = currentDate.getHours()
  if (hour >= 5 && hour < 12) {
    return { timeGreeting: 'Good Morning,', mealContext: 'breakfast' }
  } else if (hour >= 12 && hour < 17) {
    return { timeGreeting: 'Good Afternoon,', mealContext: 'lunch' }
  } else if (hour >= 17 && hour < 21) {
    return { timeGreeting: 'Good Evening,', mealContext: 'dinner' }
  } else {
    return { timeGreeting: 'Late Night Cooking,', mealContext: 'supper' }
  }
}
