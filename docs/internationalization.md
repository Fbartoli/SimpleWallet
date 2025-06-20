# Internationalization (i18n) Setup

## Overview

This application uses `react-i18next` for internationalization with localStorage persistence. The current language is stored in the browser's localStorage and managed through React Context, not through URL routing.

## Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Russian (ru)

## File Structure

```
src/
├── lib/
│   └── i18n.ts                 # i18n configuration
├── locales/
│   ├── en.json                 # English translations
│   ├── es.json                 # Spanish translations
│   ├── fr.json                 # French translations
│   ├── de.json                 # German translations
│   └── ru.json                 # Russian translations
├── contexts/
│   └── LanguageContext.tsx     # Language context provider
├── components/
│   └── LanguageSwitcher.tsx    # Language switcher components
├── hooks/
│   └── useTranslations.ts      # Custom hook for translations
└── types/
    └── i18next.d.ts           # TypeScript declarations
```

## Usage

### 1. Using the Translation Hook

```tsx
import { useTranslations } from '@/hooks/useTranslations'

function MyComponent() {
  const { t, wallet, navigation } = useTranslations()

  return (
    <div>
      <h1>{navigation('dashboard')}</h1>
      <button>{wallet('connectWallet')}</button>
      <p>{t('custom.key')}</p>
    </div>
  )
}
```

### 2. Using the Language Switcher

```tsx
import { LanguageSwitcher, LanguageSwitcherCompact } from '@/components/LanguageSwitcher'

function Settings() {
  return (
    <div>
      {/* Full language switcher with labels */}
      <LanguageSwitcher />
      
      {/* Compact version (shows only language codes) */}
      <LanguageSwitcherCompact />
    </div>
  )
}
```

### 3. Using the Language Context

```tsx
import { useLanguage } from '@/contexts/LanguageContext'

function MyComponent() {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage()

  return (
    <div>
      <p>Current: {currentLanguage}</p>
      {availableLanguages.map(lang => (
        <button 
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
        >
          {lang.nativeName}
        </button>
      ))}
    </div>
  )
}
```

## Translation Keys Structure

The translations are organized into logical groups:

- `common` - Common UI elements (loading, error, success, etc.)
- `navigation` - Navigation items
- `wallet` - Wallet-related terms
- `send` - Send transaction terms
- `receive` - Receive transaction terms
- `swap` - Token swap terms
- `activity` - Transaction activity terms
- `settings` - Settings page terms
- `errors` - Error messages
- `auth` - Authentication terms

## Adding New Translations

### 1. Add to JSON files

Add the new key to all language files:

```json
// src/locales/en.json
{
  "newSection": {
    "newKey": "New English text"
  }
}
```

```json
// src/locales/es.json
{
  "newSection": {
    "newKey": "Nuevo texto en español"
  }
}
```

### 2. Update TypeScript declarations

Add the new structure to `src/types/i18next.d.ts`:

```typescript
declare module 'react-i18next' {
  interface Resources {
    translation: {
      // ... existing sections
      newSection: {
        newKey: string
      }
    }
  }
}
```

### 3. Add convenience method (optional)

Update `src/hooks/useTranslations.ts`:

```typescript
export function useTranslations() {
  const { t, i18n } = useTranslation()

  return {
    // ... existing methods
    newSection: (key: string) => t(`newSection.${key}`),
  }
}
```

## Language Persistence

The application automatically:
- Saves the selected language to localStorage
- Detects browser language on first visit
- Falls back to English if browser language is not supported
- Restores the saved language on subsequent visits

## SSR Considerations

The language context is configured to:
- Not render children until language is initialized (prevents hydration mismatch)
- Use `useSuspense: false` to avoid SSR issues
- Handle client-side only localStorage access

## Best Practices

1. **Always use translation keys** instead of hardcoded strings
2. **Group related translations** logically
3. **Use descriptive key names** that indicate context
4. **Provide fallback text** for missing translations
5. **Test all languages** to ensure proper layout
6. **Keep translations consistent** across languages
7. **Use pluralization** when needed with i18next plural rules

## Available Hooks and Functions

- `useTranslations()` - Main hook with convenience methods
- `useLanguage()` - Language context hook
- `useTranslation()` - Direct react-i18next hook

## Configuration

The i18n configuration in `src/lib/i18n.ts` includes:
- Language detection from localStorage and browser
- Fallback to English
- Debug mode in development
- Performance optimizations
- React-specific configurations 