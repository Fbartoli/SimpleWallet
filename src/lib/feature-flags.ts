/**
 * Feature Flag System
 * 
 * This system provides a centralized way to manage feature flags using environment variables.
 * For production use, consider integrating with Vercel Edge Config for dynamic flag updates.
 */

// Define all available feature flags
export type FeatureFlag =
    | "monerium-auth"
    | "zerox-swap"

// Default flag states (fallback when env vars are not set)
const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
    "monerium-auth": false,
    "zerox-swap": true,
}

/**
 * Get the value of a feature flag from environment variables
 * Next.js replaces NEXT_PUBLIC_ variables at build time, so we need to access them directly
 */
function getEnvFlag(flag: FeatureFlag): boolean | undefined {
    let envValue: string | undefined

    // Direct access to avoid process.env iteration issues in Next.js
    switch (flag) {
        case "monerium-auth":
            envValue = process.env.NEXT_PUBLIC_FEATURE_MONERIUM_AUTH
            break
        case "zerox-swap":
            envValue = process.env.NEXT_PUBLIC_FEATURE_ZEROX_SWAP
            break
        default:
            envValue = undefined
    }

    if (envValue === undefined) {
        return undefined
    }

    // Parse boolean values
    const lowerValue = envValue.toLowerCase()
    if (lowerValue === "true" || lowerValue === "1") {
        return true
    }
    if (lowerValue === "false" || lowerValue === "0") {
        return false
    }

    // Invalid value, return undefined to fall back to default
    return undefined
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
    const envValue = getEnvFlag(flag)
    const result = envValue !== undefined ? envValue : DEFAULT_FLAGS[flag]

    // Debug logging in development
    return result
}

/**
 * Get all feature flags and their current states
 * Useful for debugging and admin interfaces
 */
export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
    const flags = {} as Record<FeatureFlag, boolean>

    for (const flag of Object.keys(DEFAULT_FLAGS) as FeatureFlag[]) {
        flags[flag] = isFeatureEnabled(flag)
    }

    return flags
}

/**
 * React hook for using feature flags in components
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
    return isFeatureEnabled(flag)
}