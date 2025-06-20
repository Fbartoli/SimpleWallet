"use client"

import { useLanguage } from "../contexts/LanguageContext"
import { useTranslation } from "react-i18next"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"

export function LanguageSwitcher() {
    const { currentLanguage, changeLanguage, availableLanguages } = useLanguage()
    const { t } = useTranslation()

    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("settings.language")}:
            </span>
            <Select value={currentLanguage} onValueChange={changeLanguage}>
                <SelectTrigger className="w-32">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {availableLanguages.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm">{language.nativeName}</span>
                                <span className="text-xs text-gray-500">({language.name})</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

export function LanguageSwitcherCompact() {
    const { currentLanguage, changeLanguage, availableLanguages } = useLanguage()

    return (
        <Select value={currentLanguage} onValueChange={changeLanguage}>
            <SelectTrigger className="w-20 border-none shadow-none">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {availableLanguages.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                        <span className="text-sm font-medium">{language.code.toUpperCase()}</span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
} 