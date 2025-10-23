# Fortune Actions Feature - Visual Example

## Before (Original)
```
┌─────────────────────────────────────┐
│   YOUR DAILY FORTUNE                │
│                                     │
│   Today brings new opportunities    │
│   for growth and wisdom.            │
│                                     │
└─────────────────────────────────────┘
```

## After (With Actions)
```
┌─────────────────────────────────────┐
│   YOUR DAILY FORTUNE                │
│                                     │
│   Today brings new opportunities    │
│   for growth and wisdom.            │
│                                     │
│   阳 - LUCK                          │
│   Writing, Sharing Tea, Slow Walks  │
│                                     │
│   阴 - UNLUCK                        │
│   Rushing Plans, Arguing,           │
│   Late Nights                       │
│                                     │
└─────────────────────────────────────┘
```

## Real Examples

### Example 1: Fire Dragon
```
YOUR DAILY FORTUNE
The dragon's fire illuminates hidden paths. Trust your instincts today.

阳 - LUCK
Creative Work, Bold Decisions, Leadership

阴 - UNLUCK
Hesitation, Following Others, Doubt
```

### Example 2: Water Rabbit
```
YOUR DAILY FORTUNE
Like water flowing around stones, adapt gracefully to today's challenges.

阳 - LUCK
Listening, Flexibility, Gentle Words

阴 - UNLUCK
Forcing Issues, Stubbornness, Harsh Speech
```

### Example 3: Earth Ox
```
YOUR DAILY FORTUNE
Steady progress builds mountains. Your patience will be rewarded.

阳 - LUCK
Planning, Persistence, Building

阴 - UNLUCK
Rushing, Impatience, Shortcuts
```

## How It Works

1. **User breaks the fortune cookie** → Fortune message is generated
2. **LLM analyzes the fortune** → Generates contextual actions based on:
   - The fortune message content
   - User's zodiac animal and element
   - User's mystical nickname
3. **Actions are displayed** → Three luck and three unluck actions appear below the fortune
4. **Fallback available** → If LLM fails, predefined action sets ensure users always get guidance

## Design Principles

- **Concise**: Each action is 1-3 words maximum
- **Practical**: Actions are specific and actionable
- **Contextual**: Actions align with the fortune's energy
- **Balanced**: Equal number of things to do and avoid
- **Cultural**: Uses Chinese yin-yang symbolism (阳/阴)
