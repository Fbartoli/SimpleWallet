import "react-i18next"

declare module "react-i18next" {
    interface Resources {
        translation: {
            common: {
                loading: string
                error: string
                success: string
                cancel: string
                confirm: string
                close: string
                save: string
                edit: string
                delete: string
                copy: string
                copied: string
                back: string
                next: string
                previous: string
                search: string
                filter: string
                sort: string
                refresh: string
                retry: string
            }
            navigation: {
                dashboard: string
                wallet: string
                send: string
                receive: string
                swap: string
                activity: string
                settings: string
            }
            wallet: {
                balance: string
                totalBalance: string
                availableBalance: string
                tokens: string
                nfts: string
                connectWallet: string
                disconnectWallet: string
                walletAddress: string
                copyAddress: string
                addressCopied: string
            }
            send: {
                sendTokens: string
                recipient: string
                amount: string
                recipientAddress: string
                enterAmount: string
                enterRecipient: string
                invalidAddress: string
                insufficientBalance: string
                transactionFee: string
                estimatedFee: string
                sendTransaction: string
                transactionSent: string
            }
            receive: {
                receiveTokens: string
                yourAddress: string
                qrCode: string
                shareAddress: string
            }
            swap: {
                swapTokens: string
                from: string
                to: string
                youPay: string
                youReceive: string
                exchangeRate: string
                slippageTolerance: string
                swapNow: string
                swapSuccess: string
                selectToken: string
                enterAmount: string
            }
            activity: {
                recentActivity: string
                transactionHistory: string
                sent: string
                received: string
                swapped: string
                pending: string
                completed: string
                failed: string
                viewOnExplorer: string
                transactionDetails: string
                transactionHash: string
                blockNumber: string
                gasUsed: string
                gasPrice: string
            }
            settings: {
                language: string
                currency: string
                theme: string
                notifications: string
                security: string
                about: string
                version: string
                termsOfService: string
                privacyPolicy: string
                support: string
            }
            errors: {
                somethingWentWrong: string
                networkError: string
                transactionFailed: string
                invalidInput: string
                connectionFailed: string
            }
            auth: {
                signIn: string
                signOut: string
                connecting: string
                connected: string
                disconnected: string
            }
        }
    }
} 