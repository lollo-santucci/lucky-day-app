# Requirements Document

## Introduction

Lucky Day is an iOS and Android app that provides a daily ritual of inspiration and calm through virtual fortune cookies. Each day, users break a single fortune cookie to reveal a unique AI-generated message personalized to their Chinese zodiac sign and Four Pillars of Destiny (Ba Zi). The app emphasizes simplicity, aesthetic beauty inspired by Chinese calligraphy, and meaningful personalization while maintaining a light, ritualistic experience.

## Requirements

### Requirement 1

**User Story:** As a user, I want to break one fortune cookie per day, so that I can experience a meaningful daily ritual of inspiration.

#### Acceptance Criteria

1. WHEN the user opens the app THEN the system SHALL display a closed fortune cookie on a neutral background
2. WHEN the user taps the closed cookie THEN the system SHALL play a breaking animation with paper-tearing sound effect
3. WHEN the cookie breaks THEN the system SHALL reveal a fortune message on a ticket that emerges from the cookie
4. WHEN a fortune has been revealed THEN the system SHALL prevent opening another cookie for 24 hours
5. WHEN 24 hours pass THEN the system SHALL automatically regenerate a new closed cookie
6. WHEN a new cookie is available THEN the system SHALL send a discrete notification "Il tuo biscotto è pronto 🍪"

### Requirement 2

**User Story:** As a user, I want personalized fortune messages based on my astrological profile, so that the daily inspiration feels meaningful and relevant to me.

#### Acceptance Criteria

1. WHEN generating a fortune THEN the system SHALL use the user's Chinese zodiac sign and Four Pillars data as input
2. WHEN calling the LLM THEN the system SHALL generate messages maximum 200 characters in length
3. WHEN the LLM is unavailable THEN the system SHALL use pre-written fallback fortunes and display "fortuna artigianale" banner
4. WHEN generating fortunes THEN the system SHALL ensure tone is reflective, witty, calm, and slightly mystical
5. IF fortune generation takes longer than 5 seconds THEN the system SHALL timeout and use fallback content

### Requirement 3

**User Story:** As a user, I want to input my birth details during onboarding, so that my astrological profile can be calculated for personalized fortunes.

#### Acceptance Criteria

1. WHEN first launching the app THEN the system SHALL prompt for date, time, and location of birth
2. WHEN birth details are provided THEN the system SHALL calculate Chinese zodiac sign based on lunar calendar
3. WHEN birth details are provided THEN the system SHALL calculate Four Pillars of Destiny (Year, Month, Day, Hour)
4. WHEN calculations are complete THEN the system SHALL generate a mystical nickname combining adjective + personal zodiac sign
5. WHEN profile is created THEN the system SHALL generate poetic descriptions for each of the four pillars
6. IF birth time is unknown THEN the system SHALL use noon as default and inform user of limitation

### Requirement 4

**User Story:** As a user, I want to view my astrological profile, so that I can understand the basis for my personalized fortunes.

#### Acceptance Criteria

1. WHEN accessing profile THEN the system SHALL display the user's zodiac sign and mystical nickname
2. WHEN viewing profile THEN the system SHALL show poetic descriptions for all Four Pillars of Destiny
3. WHEN in profile THEN the system SHALL display a 3-line zodiac essence summary combining sign and pillars
4. WHEN viewing pillars THEN the system SHALL present them as: Year (Destiny), Month (Environment), Day (Essence), Hour (Inner Heart)

### Requirement 5

**User Story:** As a user, I want an iOS widget showing my fortune cookie status, so that I can quickly see if a new fortune is available without opening the app.

#### Acceptance Criteria

1. WHEN widget is added THEN the system SHALL display current cookie state (closed/opened)
2. WHEN cookie is closed THEN the widget SHALL show closed cookie image
3. WHEN cookie is opened THEN the widget SHALL display the current fortune text
4. WHEN widget is tapped THEN the system SHALL open the main app
5. WHEN app state changes THEN the widget SHALL update to reflect current status

### Requirement 6

**User Story:** As a user, I want the app to have beautiful Chinese-inspired aesthetics, so that the experience feels authentic and calming.

#### Acceptance Criteria

1. WHEN displaying UI THEN the system SHALL use color palette: Jade Red (#B83330), Soft Gold (#F2C879), Paper Ivory (#FAF6F0), Ink Black (#222222)
2. WHEN showing text THEN the system SHALL use Noto Sans or Satoshi as primary font
3. WHEN displaying decorative elements THEN the system SHALL use HanWangKaiMediumChuIn or ZCOOL XiaoWei fonts
4. WHEN animating THEN the system SHALL use soft dissolves and smooth transitions
5. WHEN showing fortune tickets THEN the system SHALL include decorative Chinese ideograms and calligraphic signatures

### Requirement 7

**User Story:** As a user, I want the app to work offline for viewing my current fortune, so that I can access my daily message without internet connection.

#### Acceptance Criteria

1. WHEN fortune is generated THEN the system SHALL cache it locally for 24 hours
2. WHEN offline THEN the system SHALL display cached fortune if available
3. WHEN offline and no fortune exists THEN the system SHALL use pre-stored fallback fortunes
4. WHEN connection returns THEN the system SHALL sync any pending data
5. IF user has iCloud enabled THEN the system SHALL optionally backup profile data

### Requirement 8

**User Story:** As a user, I want the app to support only English, so that I can have a consistent experience in my preferred language.

#### Acceptance Criteria

1. WHEN displaying any text THEN the system SHALL show all content in English
2. WHEN generating fortunes THEN the system SHALL create messages in English only
3. WHEN showing UI elements THEN the system SHALL use English labels and descriptions
4. WHEN displaying notifications THEN the system SHALL send them in English


### Requirement 9

**User Story:** As a user, I want my personal data to remain private, so that my birth details and usage patterns are not shared externally.

#### Acceptance Criteria

1. WHEN storing data THEN the system SHALL keep all personal information locally on device
2. WHEN calling LLM APIs THEN the system SHALL send only synthesized astrological descriptions, not raw birth data
3. WHEN generating fortunes THEN the system SHALL not transmit personally identifiable information
4. WHEN collecting analytics THEN the system SHALL only track anonymous usage counters
5. IF using cloud storage THEN the system SHALL encrypt all personal data

### Requirement 10

**User Story:** As a user, I want the app to perform smoothly, so that my daily ritual feels seamless and pleasant.

#### Acceptance Criteria

1. WHEN launching the app THEN the system SHALL achieve Time To Interactive under 2 seconds
2. WHEN generating fortunes THEN the system SHALL complete the process in under 5 seconds for 95% of requests
3. WHEN animating cookie breaking THEN the system SHALL maintain smooth 60fps animation
4. WHEN the app is installed THEN the system SHALL require less than 40MB of storage space
5. WHEN running THEN the system SHALL maintain crash rate below 0.5%

### Requirement 11

**User Story:** As a developer, I want to be able to understand all the code written and be able to modify the code on my own, so that I can maintain and extend the app independently.

#### Acceptance Criteria

1. WHEN reviewing code THEN the system SHALL include clear comments explaining complex logic
2. WHEN structuring the project THEN the system SHALL follow standard iOS/Android architectural patterns
3. WHEN naming variables and functions THEN the system SHALL use descriptive, self-documenting names
4. WHEN implementing features THEN the system SHALL separate concerns into logical modules
5. WHEN writing code THEN the system SHALL avoid overly complex abstractions that obscure functionality

### Requirement 12

**User Story:** As a developer, I want each task to be fully testable independently, so that I can understand the code deeply and review changes effectively.

#### Acceptance Criteria

1. WHEN implementing any feature THEN the system SHALL include unit tests for core functionality
2. WHEN creating components THEN the system SHALL design them to be testable in isolation
3. WHEN writing tests THEN the system SHALL provide clear test descriptions and expected outcomes
4. WHEN running tests THEN the system SHALL execute quickly and provide meaningful feedback
5. WHEN code changes are made THEN the system SHALL maintain existing test coverage

### Requirement 13

**User Story:** As a designer, I want each component, layout and asset to be modular and easily updatable, so that I can iterate on the visual design without affecting core functionality.

#### Acceptance Criteria

1. WHEN creating UI components THEN the system SHALL separate visual styling from business logic
2. WHEN designing layouts THEN the system SHALL use reusable component patterns
3. WHEN implementing assets THEN the system SHALL organize them in logical folders by type and usage
4. WHEN updating visual elements THEN the system SHALL allow changes without modifying core app functionality
5. WHEN styling components THEN the system SHALL use consistent design tokens for colors, fonts, and spacing