# Feature Flag System

This project uses a custom feature flag system to enable/disable features dynamically using environment variables.

## Quick Start

### 1. Basic Usage

Wrap any component with the `FeatureFlag` component:

```tsx
import { FeatureFlag } from '@/components/FeatureFlag'

function MyComponent() {
  return (
    <FeatureFlag flag="monerium-auth">
      <MoneriumAuth />
    </FeatureFlag>
  )
}
```

### 2. Environment Variables

Set feature flags using environment variables in your `.env.local` file:

```bash
# Enable/disable Monerium authentication
NEXT_PUBLIC_FEATURE_MONERIUM_AUTH=true

# Other feature flags
NEXT_PUBLIC_FEATURE_MORPHO_EARN=true
NEXT_PUBLIC_FEATURE_ZERO_X_SWAP=true
```

### 3. Development Debugging

In development mode, a feature flag debugger will appear in the bottom-right corner showing all flag states.

## Available Flags

| Flag Name | Environment Variable | Default | Description |
|-----------|---------------------|---------|-------------|
| `monerium-auth` | `NEXT_PUBLIC_FEATURE_MONERIUM_AUTH` | `false` | Enable Monerium authentication component |
| `morpho-earn` | `NEXT_PUBLIC_FEATURE_MORPHO_EARN` | `true` | Enable Morpho yield earning features |
| `zero-x-swap` | `NEXT_PUBLIC_FEATURE_ZERO_X_SWAP` | `true` | Enable 0x protocol swapping |
| `activity-tracking` | `NEXT_PUBLIC_FEATURE_ACTIVITY_TRACKING` | `true` | Enable activity tracking |
| `multi-language` | `NEXT_PUBLIC_FEATURE_MULTI_LANGUAGE` | `true` | Enable multi-language support |

## Usage Patterns

### Component Wrapper

```tsx
import { FeatureFlag } from '@/components/FeatureFlag'

<FeatureFlag flag="monerium-auth" fallback={<div>Feature disabled</div>}>
  <MoneriumAuth />
</FeatureFlag>
```

### Hook Usage

```tsx
import { useFeatureFlag } from '@/lib/feature-flags'

function MyComponent() {
  const isMoneriumEnabled = useFeatureFlag('monerium-auth')
  
  if (!isMoneriumEnabled) {
    return <div>Feature not available</div>
  }
  
  return <MoneriumAuth />
}
```

### Higher-Order Component

```tsx
import { withFeatureFlag } from '@/components/FeatureFlag'

const FeatureFlaggedMonerium = withFeatureFlag(
  MoneriumAuth, 
  'monerium-auth',
  () => <div>Monerium is disabled</div>
)
```

### Programmatic Check

```tsx
import { isFeatureEnabled } from '@/lib/feature-flags'

function handleClick() {
  if (isFeatureEnabled('monerium-auth')) {
    // Feature is enabled
    connectToMonerium()
  }
}
```

## Deployment

### Vercel Environment Variables

Set feature flags in your Vercel project settings:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add variables like `NEXT_PUBLIC_FEATURE_MONERIUM_AUTH=true`

### Dynamic Feature Flags with Vercel Edge Config

For more advanced use cases, consider upgrading to Vercel Edge Config for runtime feature flag updates:

```bash
npm install @vercel/edge-config
```

Then modify `src/lib/feature-flags.ts` to fetch from Edge Config:

```tsx
import { get } from '@vercel/edge-config'

export async function isFeatureEnabled(flag: FeatureFlag): Promise<boolean> {
  try {
    const value = await get(flag)
    return value !== undefined ? Boolean(value) : DEFAULT_FLAGS[flag]
  } catch {
    return DEFAULT_FLAGS[flag]
  }
}
```

## Adding New Feature Flags

1. Add the flag name to the `FeatureFlag` type in `src/lib/feature-flags.ts`:

```tsx
export type FeatureFlag = 
  | 'monerium-auth'
  | 'my-new-feature'  // Add here
```

2. Set the default value in `DEFAULT_FLAGS`:

```tsx
const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  'monerium-auth': false,
  'my-new-feature': true,  // Add here
}
```

3. Add the environment variable to `env.example`:

```bash
NEXT_PUBLIC_FEATURE_MY_NEW_FEATURE=true
```

4. Update the debugger component to include the new flag.

## Best Practices

### Naming Convention

- Use kebab-case for flag names: `my-new-feature`
- Use descriptive names that clearly indicate what the flag controls
- Environment variables automatically convert to SCREAMING_SNAKE_CASE

### Default Values

- Set safe defaults that won't break the application
- New experimental features should default to `false`
- Stable features should default to `true`

### Cleanup

- Remove feature flags once features are stable and permanently enabled
- Don't let feature flags accumulate indefinitely
- Document when flags were introduced and when they should be removed

### Testing

Test both enabled and disabled states:

```tsx
// Jest test example
describe('FeatureFlag', () => {
  it('renders children when flag is enabled', () => {
    process.env.NEXT_PUBLIC_FEATURE_MONERIUM_AUTH = 'true'
    render(
      <FeatureFlag flag="monerium-auth">
        <div>Feature content</div>
      </FeatureFlag>
    )
    expect(screen.getByText('Feature content')).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Environment Variables Not Working

1. Ensure the variable starts with `NEXT_PUBLIC_`
2. Restart your development server after adding new environment variables
3. Check that the variable name matches the expected format (SCREAMING_SNAKE_CASE)

### Feature Flag Not Updating

1. Clear Next.js cache: `rm -rf .next`
2. Restart development server
3. Check browser developer tools for the actual environment variable values

### Production Issues

1. Verify environment variables are set in your deployment platform
2. Check that the build process includes the environment variables
3. Use the feature flag debugger in development to verify expected behavior 