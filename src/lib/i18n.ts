import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

// Import translation files
import en from "../locales/en.json"
import es from "../locales/es.json"
import fr from "../locales/fr.json"
import de from "../locales/de.json"
import ru from "../locales/ru.json"

const resources = {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    ru: { translation: ru },
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        debug: process.env.NODE_ENV === "development",

        detection: {
            // Define the detection order and methods
            order: ["localStorage", "navigator", "htmlTag"],
            // Only use localStorage and navigator, no URL detection
            lookupLocalStorage: "i18nextLng",
            caches: ["localStorage"],
        },

        interpolation: {
            escapeValue: false, // React already does escaping
        },

        // Namespace configuration
        defaultNS: "translation",
        ns: ["translation"],

        // Performance optimizations
        saveMissing: false,
        saveMissingTo: "fallback",

        // React-specific options
        react: {
            useSuspense: false, // Set to false to avoid SSR issues
        },
    })

export default i18n 