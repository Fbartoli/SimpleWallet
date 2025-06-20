import type { NextConfig } from "next"
import bundleAnalyzer from "@next/bundle-analyzer"

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const nextConfig: NextConfig = {
  eslint: {
    // Run ESLint on build
    ignoreDuringBuilds: false,
    // Lint all directories
    dirs: ["src", "components", "pages", "utils", "lib", "hooks", "stores", "contexts"],
  },
  typescript: {
    // Type check during build
    ignoreBuildErrors: false,
  },
  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    domains: [],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Conditional webpack optimizations (only when not using Turbopack)
  webpack: (config, { isServer }) => {
    // Skip webpack optimizations when using Turbopack
    if (process.env.TURBOPACK) {
      return config
    }

    // Don't bundle Node.js polyfills on the client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }

      // Optimize bundle splitting for better caching
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Separate vendor chunks for better caching
            privy: {
              name: "privy",
              test: /[\\/]node_modules[\\/]@privy-io[\\/]/,
              chunks: "all",
              priority: 30,
            },
            coinbase: {
              name: "coinbase",
              test: /[\\/]node_modules[\\/]@coinbase[\\/]/,
              chunks: "all",
              priority: 30,
            },
            wagmi: {
              name: "wagmi",
              test: /[\\/]node_modules[\\/](wagmi|viem)[\\/]/,
              chunks: "all",
              priority: 30,
            },
            radix: {
              name: "radix",
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              chunks: "all",
              priority: 25,
            },
            lucide: {
              name: "lucide",
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              chunks: "all",
              priority: 25,
            },
          },
        },
      }
    }

    return config
  },

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-toast",
      "@radix-ui/react-label",
      "@radix-ui/react-slot",
    ],
  },

  // Turbopack-specific optimizations (moved from deprecated experimental.turbo)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
    resolveAlias: {
      // Turbopack-specific module resolution optimizations
      "@": "./src",
    },
  },
}

export default withBundleAnalyzer(nextConfig)
