import { useTranslation } from "react-i18next"

export function useTranslations() {
    const { t, i18n } = useTranslation()

    return {
        t,
        currentLanguage: i18n.language,
        isLoading: !i18n.isInitialized,

        // Convenience methods for common translation groups
        common: (key: string) => t(`common.${key}`),
        navigation: (key: string) => t(`navigation.${key}`),
        wallet: (key: string) => t(`wallet.${key}`),
        send: (key: string) => t(`send.${key}`),
        receive: (key: string) => t(`receive.${key}`),
        swap: (key: string) => t(`swap.${key}`),
        activity: (key: string) => t(`activity.${key}`),
        settings: (key: string) => t(`settings.${key}`),
        morpho: (key: string) => t(`morpho.${key}`),
        errors: (key: string) => t(`errors.${key}`),
        auth: (key: string) => t(`auth.${key}`),
    }
} 