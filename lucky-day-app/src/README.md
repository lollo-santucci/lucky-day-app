# Lucky Day App - Source Structure

This directory contains the source code for the Lucky Day app, organized as follows:

## Directory Structure

- **components/**: Reusable UI components (FortuneCookie, ProfileView, etc.)
- **screens/**: Screen components for navigation (MainScreen, OnboardingScreen, etc.)
- **services/**: Business logic services (FortuneManager, AstrologyManager, etc.)
- **utils/**: Utility functions and helpers (storage, calculations, etc.)
- **types/**: TypeScript type definitions and interfaces
- **hooks/**: Custom React hooks for state management and logic

## Import Aliases

The project is configured with path aliases for cleaner imports:

```typescript
import { FortuneCookie } from '@/components';
import { FortuneManager } from '@/services';
import { BirthDetails } from '@/types';
```

## Development Guidelines

- Follow TypeScript strict mode
- Use ESLint for code quality
- Organize components by feature when they grow
- Keep business logic in services, not components
- Use custom hooks for complex state management