# 0x Swap Feature Flag

The 0x swapping functionality can be controlled via a feature flag.

## Configuration

### Environment Variable

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_FEATURE_ZEROX_SWAP=true  # Enable 0x swap
# or
NEXT_PUBLIC_FEATURE_ZEROX_SWAP=false # Disable 0x swap
```

### Default Behavior

If not set, the feature defaults to **enabled** (`true`).

## Usage in Components

### Option 1: Wrapper Component

Wrap the ZeroXSwap component with the FeatureFlag wrapper:

```typescript
import { FeatureFlag } from "@/components/FeatureFlag";
import { ZeroXSwap } from "@/components/ZeroXSwap";

function MyPage() {
  return (
    <FeatureFlag flag="zerox-swap">
      <ZeroXSwap userAddress={userAddress} />
    </FeatureFlag>
  );
}
```

### Option 2: With Fallback

Show an alternative component when the feature is disabled:

```typescript
import { FeatureFlag } from "@/components/FeatureFlag";
import { ZeroXSwap } from "@/components/ZeroXSwap";

function MyPage() {
  return (
    <FeatureFlag
      flag="zerox-swap"
      fallback={
        <div className="p-6 border rounded-lg">
          <p>Swap feature is currently unavailable</p>
        </div>
      }
    >
      <ZeroXSwap userAddress={userAddress} />
    </FeatureFlag>
  );
}
```

### Option 3: Conditional Rendering Hook

Use the hook for more complex logic:

```typescript
import { useFeatureFlag } from "@/lib/feature-flags";
import { ZeroXSwap } from "@/components/ZeroXSwap";

function MyPage() {
  const isSwapEnabled = useFeatureFlag("zerox-swap");

  return (
    <div>
      {isSwapEnabled ? (
        <ZeroXSwap userAddress={userAddress} />
      ) : (
        <p>Swap feature coming soon!</p>
      )}
    </div>
  );
}
```

### Option 4: Programmatic Check

Check the flag programmatically:

```typescript
import { isFeatureEnabled } from "@/lib/feature-flags";

function handleSwapClick() {
  if (!isFeatureEnabled("zerox-swap")) {
    toast({
      title: "Feature Unavailable",
      description: "Swap functionality is currently disabled",
    });
    return;
  }

  // Proceed with swap logic
  openSwapModal();
}
```

## Integration Example

Here's a complete example integrating the swap component in a dashboard:

```typescript
"use client";

import { Suspense } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { FeatureFlag } from "@/components/FeatureFlag";
import { ZeroXSwap } from "@/components/ZeroXSwap";
import { Send } from "@/components/Send";
import { ActivityProvider } from "@/contexts/ActivityContext";

export default function Dashboard() {
  const { user } = usePrivy();
  const smartWalletAddress = user?.smartWallet?.address;

  return (
    <div className="container mx-auto p-6">
      <ActivityProvider>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Swap Component with Feature Flag */}
          <FeatureFlag flag="zerox-swap">
            <Suspense fallback={<SwapSkeleton />}>
              <ZeroXSwap userAddress={smartWalletAddress as `0x${string}`} />
            </Suspense>
          </FeatureFlag>

          {/* Send Component */}
          <Suspense fallback={<SendSkeleton />}>
            <Send />
          </Suspense>
        </div>
      </ActivityProvider>
    </div>
  );
}
```

## Development Debugging

In development mode, a feature flag debugger appears in the bottom-right corner showing the state of all feature flags, including `zerox-swap`.

## API Configuration

The swap functionality requires the 0x API key to be configured:

```bash
# .env.local
ZEROX_API_KEY=your_0x_api_key_here
```

**Note:** The swap component will fail gracefully if the API key is missing, even if the feature flag is enabled.

## Related Files

- Feature flag definition: `src/lib/feature-flags.ts`
- Feature flag component: `src/components/FeatureFlag.tsx`
- Swap component: `src/components/ZeroXSwap.tsx`
- API routes: `src/app/api/swap/quote/route.ts`, `src/app/api/prices/route.ts`
- Environment example: `.env.example`

## Testing

### Enable the Feature

```bash
NEXT_PUBLIC_FEATURE_ZEROX_SWAP=true pnpm dev
```

### Disable the Feature

```bash
NEXT_PUBLIC_FEATURE_ZEROX_SWAP=false pnpm dev
```

### Runtime Toggle

Feature flags are set at build time in Next.js. To change them:

1. Update `.env.local`
2. Restart the development server
3. Verify in the feature flag debugger (dev mode only)

## Production Deployment

### Vercel

Set the environment variable in your Vercel project:

1. Go to Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_FEATURE_ZEROX_SWAP` with value `true` or `false`
3. Redeploy the application

### Other Platforms

Set the environment variable according to your platform's documentation. Remember that `NEXT_PUBLIC_` variables are embedded at build time.

## Feature Flag Best Practices

1. **Default to safe state** - The default is `true` since swap is a core feature
2. **Test both states** - Always test with the flag on and off
3. **Gradual rollout** - Use environment-specific flags for gradual feature releases
4. **Monitor metrics** - Track usage when feature is enabled/disabled
5. **Clean up old flags** - Remove feature flags once features are stable

## Troubleshooting

### Feature Flag Not Working

1. **Check environment variable name** - Must be `NEXT_PUBLIC_FEATURE_ZEROX_SWAP`
2. **Restart dev server** - Feature flags are set at build time
3. **Clear browser cache** - Old builds may be cached
4. **Check debugger** - In dev mode, verify flag state in bottom-right debugger

### Swap Component Not Showing

1. **Verify feature flag is enabled**
2. **Check user authentication** - Component requires wallet address
3. **Verify API key is set** - Check `ZEROX_API_KEY` in environment
4. **Check console for errors** - Look for missing dependencies or API errors
