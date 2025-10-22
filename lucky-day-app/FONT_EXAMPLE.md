# Custom Font Implementation Example

## ✅ What We've Set Up

Your Lucky Day app now has a complete custom font system! Here's what's been implemented:

### 1. Font Loading Infrastructure
- ✅ `expo-font` package installed
- ✅ Font loading utilities in `src/utils/fonts.ts`
- ✅ App.tsx updated to load fonts during initialization
- ✅ Custom Text component with font support

### 2. Configuration Files
- ✅ `app.json` configured for font assets
- ✅ `jest.config.js` updated for testing
- ✅ Theme system extended with font families

## 🎯 How to Add Your Custom Fonts

### Step 1: Add Font Files
Place your font files in `assets/fonts/`:
```
assets/fonts/
├── YourFont-Regular.ttf
├── YourFont-Bold.ttf
├── YourFont-Italic.ttf
└── YourFont-BoldItalic.ttf
```

### Step 2: Update Font Configuration
Edit `src/utils/fonts.ts`:

```typescript
export const FontFamilies = {
  system: 'System',
  
  // Add your custom fonts here
  primary: 'YourFont-Regular',
  primaryBold: 'YourFont-Bold',
  secondary: 'AnotherFont-Regular',
  
  default: 'YourFont-Regular', // Set as default
} as const;

export const fontAssets = {
  'YourFont-Regular': require('../../assets/fonts/YourFont-Regular.ttf'),
  'YourFont-Bold': require('../../assets/fonts/YourFont-Bold.ttf'),
  'AnotherFont-Regular': require('../../assets/fonts/AnotherFont-Regular.ttf'),
};
```

## 🚀 Using Custom Fonts

### Method 1: Custom Text Component (Recommended)

```tsx
import { Text, Heading1, BodyText } from '../components';

// Basic usage
<Text fontFamily="primary" fontSize="lg">
  Custom font text
</Text>

// Convenience components
<Heading1 fontFamily="primary">Main Title</Heading1>
<BodyText fontFamily="secondary">Body content</BodyText>

// Full customization
<Text 
  fontFamily="primary"
  fontSize="xl"
  fontWeight="bold"
  color="primary"
  textAlign="center"
  uppercase
>
  Styled Text
</Text>
```

### Method 2: Direct StyleSheet Usage

```tsx
import { getFontFamily } from '../utils/fonts';

const styles = StyleSheet.create({
  customText: {
    fontFamily: getFontFamily('primary'),
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

## 📱 Example Implementation

Here's how you could update your FortuneScreen with custom fonts:

```tsx
// In FortuneScreen.tsx
import { Text, Heading3, BodyText } from '../components';

// Replace regular Text components with custom ones:

// Header
<Heading3 
  fontFamily="primary" 
  color="text" 
  textAlign="center"
>
  Lucky Day, 吉日
</Heading3>

// Profile button
<Text 
  fontFamily="primary"
  fontSize="md"
  color="primary"
  fontWeight="medium"
>
  {profile.mysticalNickname}
</Text>

// Loading text
<BodyText 
  fontFamily="secondary"
  color="textSecondary"
  textAlign="center"
>
  Consulting the cosmic forces...
</BodyText>

// Error messages
<Text 
  fontFamily="primary"
  fontSize="md"
  color="error"
  textAlign="center"
  lineHeight="relaxed"
>
  {error}
</Text>
```

## 🎨 Available Text Components

- `Text` - Base component with full customization
- `Heading1` - 32px, bold
- `Heading2` - 28px, bold  
- `Heading3` - 24px, semibold
- `Heading4` - 20px, semibold
- `BodyText` - 14px, normal
- `SmallText` - 12px, normal
- `Caption` - 10px, secondary color

## 🔧 Testing

The font system includes proper testing support:
- Fonts are mocked in tests
- All font utilities are tested
- Graceful fallback to system fonts

## 📋 Next Steps

1. **Choose Your Fonts**: Download fonts from Google Fonts, Adobe Fonts, etc.
2. **Add Font Files**: Place them in `assets/fonts/`
3. **Update Configuration**: Edit `src/utils/fonts.ts`
4. **Start Using**: Replace Text components in your screens
5. **Test**: Run `expo start` to see your fonts in action

## 🎯 Recommended Fonts for Lucky Day App

For a mystical/fortune theme, consider:
- **Cinzel** - Elegant, classical feel
- **Playfair Display** - Sophisticated serif
- **Cormorant Garamond** - Elegant, readable
- **Crimson Text** - Classic book feel
- **EB Garamond** - Traditional, mystical

## 🚨 Important Notes

- Always test fonts on both iOS and Android
- Keep font files under 1MB each for performance
- Provide system font fallbacks
- Check font licenses for commercial use
- Clear cache with `expo r -c` after adding fonts

Your font system is ready to use! 🎉