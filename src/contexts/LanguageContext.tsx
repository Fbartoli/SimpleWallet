"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

export type Language = "en" | "es" | "fr" | "de" | "ru"

interface LanguageContextType {
    currentLanguage: Language
    changeLanguage: (language: Language) => void
    availableLanguages: Array<{
        code: Language
        name: string
        nativeName: string
    }>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const AVAILABLE_LANGUAGES = [
    { code: "en" as Language, name: "English", nativeName: "English" },
    { code: "ru" as Language, name: "Russian", nativeName: "Русский" },
]

const STORAGE_KEY = "simple-wallet-language"

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const { i18n } = useTranslation()
    const [currentLanguage, setCurrentLanguage] = useState<Language>("en")
    const [isInitialized, setIsInitialized] = useState(false)

    // Initialize language from localStorage or browser preference
    useEffect(() => {
        if (typeof window === "undefined") return

        const initializeLanguage = () => {
            // First try to get from localStorage
            const storedLanguage = localStorage.getItem(STORAGE_KEY) as Language

            // Validate stored language
            const isValidLanguage = storedLanguage &&
                AVAILABLE_LANGUAGES.some(lang => lang.code === storedLanguage)

            if (isValidLanguage) {
                setCurrentLanguage(storedLanguage)
                i18n.changeLanguage(storedLanguage)
            } else {
                // Fall back to browser language or default
                const browserLang = navigator.language.substring(0, 2) as Language
                const supportedBrowserLang = AVAILABLE_LANGUAGES.find(
                    lang => lang.code === browserLang
                )

                const initialLang = supportedBrowserLang?.code || "en"
                setCurrentLanguage(initialLang)
                i18n.changeLanguage(initialLang)
                localStorage.setItem(STORAGE_KEY, initialLang)
            }

            setIsInitialized(true)
        }

        initializeLanguage()
    }, [i18n])

    const changeLanguage = (language: Language) => {
        if (!AVAILABLE_LANGUAGES.some(lang => lang.code === language)) {
            console.warn(`Language ${language} is not supported`)
            return
        }

        setCurrentLanguage(language)
        i18n.changeLanguage(language)

        // Persist to localStorage
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, language)
        }
    }

    const value: LanguageContextType = {
        currentLanguage,
        changeLanguage,
        availableLanguages: AVAILABLE_LANGUAGES,
    }

    // Don't render children until language is initialized to prevent flash
    if (!isInitialized) {
        return null
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
} 