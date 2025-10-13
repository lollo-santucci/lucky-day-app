# Design Document

## Overview

Lucky Day is a cross-platform mobile application (iOS/Android) that delivers personalized daily fortune messages through an interactive fortune cookie experience. The app combines Chinese astrology calculations (zodiac signs and Four Pillars of Destiny) with AI-generated content to create meaningful, personalized daily rituals.

The application follows a minimalist design philosophy with Chinese-inspired aesthetics, emphasizing simplicity, beauty, and meaningful user engagement through a single daily interaction.

## Architecture

### High-Level Architecture

```mermaid
graph TB
    UI[User Interface Layer]
    BL[Business Logic Layer]
    DL[Data Layer]
    EXT[External Services]
    
    UI --> BL
    BL --> DL
    BL --> EXT
    
    subgraph "UI Layer"
        MC[Main Cookie View]
        PV[Profile View]
        OB[Onboarding Flow]
        WG[iOS Widget]
    end
    
    subgraph "Business Logic"
        FM[Fortune Manager]
        AM[Astrology Manager]
        AN[Animation Controller]
        NM[Notification Manager]
    end
    
    subgraph "Data Layer"
        LS[Local Storage]
        CM[Cache Manager]
        CS[Cloud Sync (Optional)]
    end
    
    subgraph "External"
        LLM[LLM API]
        PN[Push Notifications]
    end
```

### Platform Strategy

- **React Native**: Cross-platform development for iOS and Android
- **Native Modules**: For platform-specific features (iOS widgets, notifications)
- **Expo**: For streamlined development and deployment workflow

## Components and Interfaces

### Core Components

#### 1. Fortune Cookie Component
```typescript
interface FortuneCookieProps {
  state: 'closed' | 'breaking' | 'opened'
  onBreak: () => void
  fortune?: Fortune
  disabled: boolean
}
```

**Responsibilities:**
- Render cookie visual states
- Handle break animation with sound effects
- Display fortune ticket with decorative elements

#### 2. Astrology Manager
```typescript
interface AstrologyManager {
  calculateChineseZodiac(birthDate: Date): ChineseZodiac
  calculateFourPillars(birthDate: Date, birthTime: string, location: Location): FourPillars
  generateMysticalNickname(zodiac: ChineseZodiac): string
  generatePillarDescriptions(pillars: FourPillars): PillarDescriptions
}
```

**Responsibilities:**
- Chinese lunar calendar calculations
- Four Pillars of Destiny computation
- Astrological profile generation

#### 3. Fortune Manager
```typescript
interface FortuneManager {
  generateFortune(profile: AstrologicalProfile): Promise<Fortune>
  getCachedFortune(): Fortune | null
  canGenerateNewFortune(): boolean
  getFallbackFortune(): Fortune
}
```

**Responsibilities:**
- LLM API integration for fortune generation
- 24-hour cooldown management
- Fallback fortune handling
- Local caching

#### 4. Profile Manager
```typescript
interface ProfileManager {
  createProfile(birthDetails: BirthDetails): AstrologicalProfile
  updateProfile(updates: Partial<AstrologicalProfile>): void
  getProfile(): AstrologicalProfile | null
  exportProfile(): string
}
```

### Widget Architecture (iOS)

```typescript
interface WidgetProvider {
  getTimeline(): WidgetTimeline
  getSnapshot(): WidgetSnapshot
  updateWidget(fortune: Fortune): void
}
```

## Data Models

### Core Data Structures

```typescript
interface BirthDetails {
  date: Date
  time: string | null // HH:MM format, null if unknown
  location: {
    latitude: number
    longitude: number
    timezone: string
  }
}

interface ChineseZodiac {
  animal: 'rat' | 'ox' | 'tiger' | 'rabbit' | 'dragon' | 'snake' | 
          'horse' | 'goat' | 'monkey' | 'rooster' | 'dog' | 'pig'
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water'
  year: number
}

interface FourPillars {
  year: { stem: string, branch: string, element: string }
  month: { stem: string, branch: string, element: string }
  day: { stem: string, branch: string, element: string }
  hour: { stem: string, branch: string, element: string }
}

interface AstrologicalProfile {
  zodiac: ChineseZodiac
  pillars: FourPillars
  mysticalNickname: string
  pillarDescriptions: {
    year: string    // Destiny
    month: string   // Environment
    day: string     // Essence
    hour: string    // Inner Heart
  }
  essenceSummary: string // 3-line summary
}

interface Fortune {
  id: string
  message: string // max 200 characters
  generatedAt: Date
  expiresAt: Date
  source: 'ai' | 'fallback'
  decorativeElements: {
    ideogram: string
    signature: string
  }
}
```

### Storage Schema

```typescript
interface AppState {
  profile: AstrologicalProfile | null
  currentFortune: Fortune | null
  lastFortuneDate: Date | null
  settings: {
    notificationsEnabled: boolean
    soundEnabled: boolean
    iCloudSyncEnabled: boolean
  }
  analytics: {
    fortunesGenerated: number
    appOpens: number
    lastActiveDate: Date
  }
}
```

## Error Handling

### Error Categories

1. **Network Errors**
   - LLM API timeout (>5 seconds)
   - Connection failures
   - Rate limiting

2. **Data Errors**
   - Invalid birth details
   - Corrupted local storage
   - Calculation failures

3. **System Errors**
   - Permission denials
   - Storage full
   - Widget update failures

### Error Recovery Strategies

```typescript
interface ErrorHandler {
  handleLLMTimeout(): Fortune // Return fallback fortune
  handleNetworkError(): void // Show offline mode
  handleDataCorruption(): void // Reset to onboarding
  handlePermissionDenial(): void // Show permission prompt
}
```

### Fallback Mechanisms

- **Fortune Generation**: Pre-written fallback fortunes with "fortuna artigianale" banner
- **Offline Mode**: Cached fortune display with limited functionality
- **Data Recovery**: iCloud backup restoration or fresh onboarding

## Testing Strategy

### Unit Testing Focus Areas

1. **Astrology Calculations**
   - Chinese zodiac determination
   - Four Pillars computation
   - Edge cases (leap years, time zones)

2. **Fortune Management**
   - 24-hour cooldown logic
   - Cache expiration
   - Fallback selection

3. **Data Validation**
   - Birth detail validation
   - Profile data integrity
   - Storage operations

### Integration Testing

1. **LLM API Integration**
   - Request/response handling
   - Timeout scenarios
   - Error recovery

2. **Widget Synchronization**
   - State updates
   - Timeline management
   - App-widget communication

### UI Testing

1. **Animation Performance**
   - 60fps cookie breaking animation
   - Smooth transitions
   - Memory usage during animations

2. **Accessibility**
   - Screen reader compatibility
   - Voice control support
   - High contrast mode

### Performance Testing

1. **Launch Time**: Target <2 seconds Time To Interactive
2. **Fortune Generation**: <5 seconds for 95% of requests
3. **Memory Usage**: Efficient asset loading and cleanup
4. **Storage**: <40MB total app size

## Technical Implementation Details

### Chinese Astrology Calculations

**Lunar Calendar Conversion:**
- Use established lunar calendar libraries
- Account for time zone differences
- Handle edge cases around New Year transitions

**Four Pillars Calculation:**
- Implement traditional Ba Zi algorithms
- Use accurate solar term calculations
- Handle unknown birth times (default to noon)

### LLM Integration

**API Design:**
```typescript
interface FortuneRequest {
  zodiacSign: string
  element: string
  pillarEssence: string // Synthesized from Four Pillars
  previousFortunes?: string[] // For variety
}
```

**Prompt Engineering:**
- Tone: Reflective, witty, calm, mystical
- Length: Maximum 200 characters
- Style: Fortune cookie wisdom with personal relevance

### Animation System

**Cookie Breaking Animation:**
- Multi-stage animation (crack → break → ticket emerge)
- Particle effects for paper fragments
- Synchronized sound effects
- Smooth 60fps performance

### Notification System

**Daily Notifications:**
- Local notifications at user-preferred time
- Discrete messaging: "Il tuo biscotto è pronto 🍪"
- Respect system notification settings
- Handle timezone changes

## Security and Privacy

### Data Protection

1. **Local Storage**: All personal data stored on-device
2. **API Calls**: Only send synthesized astrological descriptions
3. **Analytics**: Anonymous usage counters only
4. **Cloud Sync**: Optional, encrypted personal data

### Privacy Compliance

- No personal data transmission to LLM
- Minimal analytics collection
- User control over data sharing
- Clear privacy policy

## Deployment and Distribution

### Build Configuration

- **iOS**: Xcode project with React Native integration
- **Android**: Gradle build with React Native
- **Widget**: Native iOS widget extension

### Release Strategy

1. **Beta Testing**: Internal testing with core features
2. **App Store Review**: Ensure compliance with guidelines
3. **Phased Rollout**: Gradual release to monitor performance

This design provides a solid foundation for implementing the Lucky Day app while maintaining the simplicity, beauty, and meaningful personalization outlined in the requirements.