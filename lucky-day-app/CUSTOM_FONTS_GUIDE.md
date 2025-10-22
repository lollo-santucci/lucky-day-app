# Custom Fonts Guide

This guide explains how to add and use custom fonts in the Lucky Day app.

## Adding Custom Fonts

### Step 1: Add Font Files

1. Place your font files (`.ttf`, `.otf`) in the `assets/fonts/` directory
2. Use descriptive names like:
   - `YourFont-Regular.ttf`
   - `YourFont-Bold.ttf`
   - `YourFont-Italic.ttf`
   - `YourFont-BoldItalic.ttf`

### Step 2: Update Font Configuration

Edit `src/utils/fonts.ts`:

```typescript
// Add your font families
export const FontFamilies = {
  system: 'System',
  
  // Add your custom fonts here
  primary: 'YourFont-Regular',
  primaryBold: 'YourFont-Bold',
  secondary: 'AnotherFont-Regular',
  
  default: 'YourFont-Regular', // Set your preferred default
} as const;

// Add font assets
export const fontAssets = {
  'YourFont-Regular': require('../../assets/fonts/YourFont-Regular.ttf'),
  'YourFont-Bold': require('../../assets/fonts/YourFont-Bold.ttf'),
  'AnotherFont-Regular': require('../../assets/fonts/AnotherFont-Regular.ttf'),
};
```

### Step 3: Update Theme (Optional)

Edit `src/styles/theme.ts` to update the default font family:

```typescript
fontFamily: {
  system: 'System',
  primary: 'YourFont-Regular',
  primaryBold: 'YourFont-Bold',
  secondary: 'AnotherFont-Regular',
  default: 'YourFont-Regular', // Change this to your preferred default
},
```

## Using Custom Fonts

### Method 1: Using the Custom Text Component

```tsx
import { Text, Heading1, BodyText } from '../components';

// Use with font family
<Text fontFamily="primary" fontSize="lg">
  Custom font text
</Text>

// Use convenience components
<Heading1 fontFamily="primary">Main Title</Heading1>
<BodyText fontFamily="secondary">Body content</BodyText>
```

### Method 2: Direct StyleSheet Usage

```tsx
import { getFontFamily } from '../utils/fonts';

const styles = StyleSheet.create({
  customText: {
    fontFamily: getFontFamily('primary'),
    fontSize: 16,
  },
});
```

## Available Text Components

- `Text` - Base text component with full customization
- `Heading1` - Large heading (32px, bold)
- `Heading2` - Medium heading (28px, bold)
- `Heading3` - Small heading (24px, semibold)
- `Heading4` - Extra small heading (20px, semibold)
- `BodyText` - Regular body text (14px)
- `SmallText` - Small text (12px)
- `Caption` - Caption text (10px, secondary color)

## Text Component Props

```tsx
interface TextProps {
  fontFamily?: FontFamily;           // Font family to use
  fontSize?: keyof FontSizes;        // Font size from theme
  fontWeight?: keyof FontWeights;    // Font weight from theme
  color?: keyof Colors;              // Text color from theme
  lineHeight?: keyof LineHeights;    // Line height from theme
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  uppercase?: boolean;               // Transform to uppercase
  lowercase?: boolean;               // Transform to lowercase
  capitalize?: boolean;              // Capitalize first letter
}
```

## Example Usage

```tsx
import React from 'react';
import { View } from 'react-native';
import { Text, Heading1, BodyText } from '../components';

export const ExampleScreen = () => {
  return (
    <View>
      <Heading1 
        fontFamily="primary" 
        color="primary" 
        textAlign="center"
      >
        Welcome to Lucky Day
      </Heading1>
      
      <BodyText 
        fontFamily="secondary" 
        color="textSecondary"
        lineHeight="relaxed"
      >
        Your daily fortune awaits...
      </BodyText>
      
      <Text 
        fontFamily="primary"
        fontSize="lg"
        fontWeight="bold"
        color="accent"
        uppercase
      >
        Break the Cookie
      </Text>
    </View>
  );
};
```

## Font Loading

Fonts are automatically loaded during app initialization in `App.tsx`. The app will wait for fonts to load before showing the main interface.

If font loading fails, the app will gracefully fall back to system fonts.

## Troubleshooting

### Fonts Not Loading
1. Check that font files are in `assets/fonts/`
2. Verify font names match exactly in `fontAssets`
3. Make sure `app.json` includes the fonts directory
4. Clear cache: `expo r -c`

### Font Not Displaying
1. Check font family name is correct
2. Verify the font file is valid
3. Try using a different font weight/style
4. Check console for font loading errors

### Performance Issues
1. Only load fonts you actually use
2. Prefer system fonts for better performance
3. Consider using font display swap strategies

## Best Practices

1. **Limit Font Families**: Use 1-2 font families maximum
2. **Consistent Naming**: Use descriptive, consistent font names
3. **Fallback Fonts**: Always provide system font fallbacks
4. **Performance**: Load fonts asynchronously during app startup
5. **Accessibility**: Ensure fonts are readable and accessible
6. **File Size**: Optimize font files for mobile use

## Recommended Font Sources

- [Google Fonts](https://fonts.google.com/)
- [Adobe Fonts](https://fonts.adobe.com/)
- [Font Squirrel](https://www.fontsquirrel.com/)
- [DaFont](https://www.dafont.com/) (check licenses)

Remember to check font licenses for commercial use!