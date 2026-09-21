import {
  READY_TO_COOK_RECIPES,
  getAssistantHeadline,
  getAssistantMessage,
  CookingTimeFilter,
  CookingMood,
  TIME_OPTIONS,
  MOOD_OPTIONS,
} from '../lib/homeData'

describe('Home Page Time & Mood Decision Engine', () => {
  test('TIME_OPTIONS contains all required time presets including custom', () => {
    const ids = TIME_OPTIONS.map((t) => t.id)
    expect(ids).toContain('5m')
    expect(ids).toContain('10m')
    expect(ids).toContain('30m')
    expect(ids).toContain('1h')
    expect(ids).toContain('custom')
  })

  test('MOOD_OPTIONS contains all 6 required user energy moods', () => {
    const ids = MOOD_OPTIONS.map((m) => m.id)
    expect(ids).toEqual(['exhausted', 'normal', 'treat', 'healthy', 'spicy', 'budget'])
  })

  test('5 min time filter returns recipes under or equal to 5 minutes', () => {
    const filtered = READY_TO_COOK_RECIPES.filter((r) => r.time <= 5)
    expect(filtered.length).toBeGreaterThan(0)
    filtered.forEach((r) => {
      expect(r.time).toBeLessThanOrEqual(5)
    })
  })

  test('10 min time filter returns recipes under or equal to 10 minutes', () => {
    const filtered = READY_TO_COOK_RECIPES.filter((r) => r.time <= 10)
    expect(filtered.length).toBeGreaterThan(0)
    filtered.forEach((r) => {
      expect(r.time).toBeLessThanOrEqual(10)
    })
  })

  test('30 min time filter returns recipes under or equal to 30 minutes', () => {
    const filtered = READY_TO_COOK_RECIPES.filter((r) => r.time <= 30)
    expect(filtered.length).toBeGreaterThan(0)
    filtered.forEach((r) => {
      expect(r.time).toBeLessThanOrEqual(30)
    })
  })

  test('1 hour+ time filter returns recipes of 40 minutes or more', () => {
    const filtered = READY_TO_COOK_RECIPES.filter((r) => r.time >= 40)
    expect(filtered.length).toBeGreaterThan(0)
    filtered.forEach((r) => {
      expect(r.time).toBeGreaterThanOrEqual(40)
    })
  })

  test('Exhausted mood filters for low time or low ingredient count', () => {
    const exhaustedRecipes = READY_TO_COOK_RECIPES.filter(
      (r) => r.moods?.includes('exhausted') || (r.time <= 15 && r.ingredientCount <= 5)
    )
    expect(exhaustedRecipes.length).toBeGreaterThan(0)
  })

  test('Assistant headlines dynamically reflect selected time', () => {
    expect(getAssistantHeadline('5m')).toBe('What can I whip up in 5 minutes?')
    expect(getAssistantHeadline('10m')).toBe('Got 10 minutes to eat well?')
    expect(getAssistantHeadline('30m')).toBe('Great weeknight meals in 30 minutes.')
    expect(getAssistantHeadline('1h')).toBe('Slow, satisfying food worth the time.')
    expect(getAssistantHeadline('custom', 25)).toBe('Cook ready in 25 minutes or less.')
  })

  test('Assistant message adapts to combinations of time and mood', () => {
    const exhaustedMsg = getAssistantMessage('5m', 'exhausted')
    expect(exhaustedMsg.toLowerCase()).toContain('zero prep')

    const spicyMsg = getAssistantMessage('10m', 'spicy')
    expect(spicyMsg.toLowerCase()).toContain('chili')

    const treatMsg = getAssistantMessage('30m', 'treat')
    expect(treatMsg.toLowerCase()).toContain('reward')
  })
})
