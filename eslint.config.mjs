import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import reactHooks from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Ignore patterns (replaces .eslintignore)
  {
    ignores: [
      // Dependencies
      "node_modules/**",
      ".pnpm-store/**",

      // Production builds
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",

      // Environment and config files
      ".env",
      ".env.*",
      "!.env.example",

      // Logs
      "*.log",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      "pnpm-debug.log*",

      // Runtime data
      "pids/**",
      "*.pid",
      "*.seed",
      "*.pid.lock",

      // Coverage and testing
      "coverage/**",
      ".nyc_output/**",

      // Temporary folders
      "tmp/**",
      "temp/**",

      // OS generated files
      ".DS_Store",
      ".DS_Store?",
      "._*",
      ".Spotlight-V100",
      ".Trashes",
      "ehthumbs.db",
      "Thumbs.db",

      // IDE files
      ".vscode/**",
      ".idea/**",
      "*.swp",
      "*.swo",

      // Certificates and keys
      "certificates/**",
      "*.pem",
      "*.key",
      "*.crt",

      // Database
      "*.db",
      "*.sqlite",

      // Generated files
      "next-env.d.ts",
      ".contentlayer/**",

      // Storybook
      "storybook-static/**"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks
    },
    rules: {
      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-var-requires": "error",

      // General code quality rules
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "no-duplicate-imports": "error",

      // React specific rules
      "react/jsx-uses-react": "off", // Not needed in Next.js 13+
      "react/react-in-jsx-scope": "off", // Not needed in Next.js 13+
      "react/prop-types": "off", // Using TypeScript
      "react/display-name": "error",
      "react/jsx-key": "error",
      "react/no-array-index-key": "warn",
      "react/no-unescaped-entities": "error",

      // Next.js specific rules (enhanced)
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "error",
      "@next/next/no-unwanted-polyfillio": "error",
      "@next/next/no-page-custom-font": "error",
      "@next/next/google-font-display": "error",
      "@next/next/google-font-preconnect": "error",
      "@next/next/next-script-for-ga": "error",
      "@next/next/no-before-interactive-script-outside-document": "error",
      "@next/next/no-css-tags": "error",
      "@next/next/no-head-element": "error",
      "@next/next/no-head-import-in-document": "error",
      "@next/next/no-script-component-in-head": "error",
      "@next/next/no-styled-jsx-in-document": "error",
      "@next/next/no-sync-scripts": "error",
      "@next/next/no-title-in-document-head": "error",

      // Import organization
      "sort-imports": ["error", {
        "ignoreCase": false,
        "ignoreDeclarationSort": true,
        "ignoreMemberSort": false,
        "memberSyntaxSortOrder": ["none", "all", "multiple", "single"],
        "allowSeparatedGroups": true
      }],

      // Code formatting consistency
      "object-shorthand": ["error", "always"],
      "prefer-template": "error",
      "template-curly-spacing": ["error", "never"],
      "arrow-spacing": ["error", { "before": true, "after": true }],
      "comma-dangle": ["error", {
        "arrays": "always-multiline",
        "objects": "always-multiline",
        "imports": "always-multiline",
        "exports": "always-multiline",
        "functions": "never"
      }],
      "quotes": ["error", "double", { "avoidEscape": true }],
      "semi": ["error", "never"],

      // Accessibility rules
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/heading-has-content": "error",
      "jsx-a11y/img-redundant-alt": "error",
      "jsx-a11y/no-access-key": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error"
    }
  },
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}"],
    rules: {
      // Relax some rules for test files
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    files: ["**/*.config.{js,mjs,ts}", "**/next.config.{js,mjs,ts}"],
    rules: {
      // Relax some rules for config files
      "@typescript-eslint/no-var-requires": "off"
    }
  }
];

export default eslintConfig;
