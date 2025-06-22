"use client"

import { usePrivy } from "@privy-io/react-auth"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Globe, HelpCircle, Palette, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { useTranslations } from "@/hooks/useTranslations"
import Header from "@/components/Header"

interface SettingSectionProps {
    icon: React.ReactNode
    title: string
    description: string
    children: React.ReactNode
    comingSoon?: boolean
}

function SettingSection({
    icon,
    title,
    description,
    children,
    comingSoon = false,
}: SettingSectionProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        {comingSoon && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Coming Soon
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{description}</p>
                    <div className={comingSoon ? "opacity-60 pointer-events-none" : ""}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ComingSoonSetting({ icon, title, description }: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <SettingSection
            icon={icon}
            title={title}
            description={description}
            comingSoon={true}
        >
            <div className="text-sm text-gray-500">
                This feature will be available in a future update.
            </div>
        </SettingSection>
    )
}

export default function SettingsPage() {
    const { user, ready } = usePrivy()
    const router = useRouter()
    const { settings, common } = useTranslations()

    // Redirect to home if not authenticated
    if (ready && !user) {
        router.push("/")
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="hidden md:block">
                <Header />
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {common("back")}
                        </Button>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {settings("title")}
                            </h1>
                            <p className="text-gray-600">
                                {settings("description")}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Settings Sections */}
                <div className="space-y-6">
                    {/* Language & Region */}
                    <SettingSection
                        icon={<Globe className="h-5 w-5" />}
                        title={settings("language.title")}
                        description={settings("language.description")}
                    >
                        <div className="max-w-md">
                            <LanguageSwitcher />
                        </div>
                    </SettingSection>

                    {/* Account & Profile */}
                    <ComingSoonSetting
                        icon={<User className="h-5 w-5" />}
                        title={settings("account.title")}
                        description={settings("account.description")}
                    />

                    {/* Appearance */}
                    <ComingSoonSetting
                        icon={<Palette className="h-5 w-5" />}
                        title={settings("appearance.title")}
                        description={settings("appearance.description")}
                    />

                    {/* Notifications */}
                    <ComingSoonSetting
                        icon={<Bell className="h-5 w-5" />}
                        title={settings("notifications.title")}
                        description={settings("notifications.description")}
                    />

                    {/* Security */}
                    <ComingSoonSetting
                        icon={<Shield className="h-5 w-5" />}
                        title={settings("security.title")}
                        description={settings("security.description")}
                    />

                    {/* Help & Support */}
                    <ComingSoonSetting
                        icon={<HelpCircle className="h-5 w-5" />}
                        title={settings("help.title")}
                        description={settings("help.description")}
                    />
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="text-center text-sm text-gray-500">
                        <p>Simple Savings • Version 1.0.0 Beta</p>
                        <p className="mt-1">
                            {settings("footer.feedback")} {" "}
                            <a href="mailto:support@simplesavings.com" className="text-green-600 hover:text-green-700">
                                support@simplesavings.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
} 