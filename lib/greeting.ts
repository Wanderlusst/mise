export function getGreeting(): { headline: string; sub: string } {
  const hour = new Date().getHours()
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
