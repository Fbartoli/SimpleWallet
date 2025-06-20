/**
 * Green/Teal Theme Color Palette
 * 
 * This file defines the color palette for our app's green/teal theme.
 * Use these color constants throughout the app for a consistent design.
 */

export const greenTheme = {
    // Background gradients
    backgroundGradient: "bg-gradient-to-br from-green-50 to-teal-50",
    backgroundGradientHeader: "bg-gradient-to-r from-green-600 to-teal-600",
    buttonGradient: "bg-gradient-to-r from-green-500 to-teal-600",
    buttonGradientHover: "hover:from-green-600 hover:to-teal-700",

    // Icon containers
    iconContainer: "bg-green-500/10 text-green-600",

    // Text colors
    textPrimary: "text-green-800",
    textSecondary: "text-green-600",
    textHighlight: "text-green-700",

    // Borders
    borderLight: "border-green-100",

    // Focus states
    focusBorder: "focus:border-green-300",
    focusRing: "focus:ring focus:ring-green-200 focus:ring-opacity-50",

    // Hover states
    hoverBg: "hover:bg-green-200",
    hoverBorder: "hover:border-green-100",
    hoverBgLight: "hover:bg-green-50/50",
}

// Custom type-specific colors that integrate with the green theme
export const tokenColors = {
    USDC: "bg-emerald-50 border-emerald-100",
    EURC: "bg-teal-50 border-teal-100",
    ETH: "bg-green-50 border-green-100",
    BTC: "bg-lime-50 border-lime-100",
    DAI: "bg-yellow-50 border-yellow-100",
    USDT: "bg-green-50 border-green-100",
}

// Status colors
export const statusColors = {
    success: {
        bg: "bg-green-100",
        text: "text-green-600",
        border: "border-green-100",
    },
    warning: {
        bg: "bg-amber-100",
        text: "text-amber-600",
        border: "border-amber-100",
    },
    error: {
        bg: "bg-red-100",
        text: "text-red-600",
        border: "border-red-100",
    },
    info: {
        bg: "bg-sky-100",
        text: "text-sky-600",
        border: "border-sky-100",
    },
} 