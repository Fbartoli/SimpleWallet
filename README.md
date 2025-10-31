# SimpleWallet - Neobank Demo

**A demonstration project showcasing how to build a modern neobank using Privy, 0x Protocol, Match, Morpho, and Safe smart contracts.**

SimpleWallet is a comprehensive demo application that demonstrates how to integrate multiple DeFi protocols and infrastructure services to create a fully-featured neobank experience. Built on Base, this project serves as a reference implementation for developers looking to understand how to combine wallet infrastructure, DEX aggregation, yield generation, and smart contract security in a production-ready web3 banking application.

## 🎯 Purpose

This is a **demo/example project** designed to showcase:

- How to integrate **Privy** for smart wallet infrastructure and account abstraction
- How to use **0x Protocol** for optimal token swapping across multiple DEXs
- How to leverage **Match** for advanced order matching and aggregation
- How to integrate **Morpho** for yield generation through curated lending vaults
- How to implement **Safe smart contracts** for secure, multi-sig wallet functionality

## ✨ Features

### Core Banking Features
- 💰 **Multi-Asset Portfolio Management** - Track balances across USDC, EURC, WETH, WBTC, and more
- 🔄 **Token Swapping** - Seamless token exchanges via 0x Protocol aggregation
- 📈 **Yield Generation** - Deposit assets into Morpho vaults to earn competitive yields
- 💸 **Send & Receive** - Traditional banking-style transfer functionality
- 📊 **Activity Tracking** - Comprehensive transaction history and analytics
- 🌍 **Multi-Language Support** - Internationalization (English, Russian)

### Technical Features
- 🔒 **Smart Wallet Integration** - Privy-powered account abstraction with gasless transactions
- 🛡️ **Safe Smart Contracts** - Multi-sig security with Safe protocol integration
- ⚡ **Optimistic Updates** - Instant UI feedback for better UX
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🎨 **Modern UI** - Built with Shadcn UI and Radix UI components
- 🛡️ **Type Safety** - Strict TypeScript configuration for maximum reliability

## 🏗️ Architecture & Integrations

### Key Protocol Integrations

1. **Privy** - Smart wallet infrastructure providing:
   - Account abstraction and gasless transactions
   - Social login and embedded wallet support
   - Multi-chain wallet management

2. **0x Protocol** - DEX aggregation for:
   - Optimal token swap routing across multiple DEXs
   - Best price discovery
   - Gas-efficient transaction execution

3. **Match** - Advanced order matching and aggregation:
   - Enhanced liquidity access
   - Improved price discovery
   - Advanced trading capabilities

4. **Morpho Protocol** - Yield generation via:
   - Curated lending vaults (USDC, EURC)
   - Automated yield accrual
   - ERC4626-compliant vault integration

5. **Safe Smart Contracts** - Security infrastructure:
   - Multi-signature wallet support
   - Social recovery mechanisms
   - Enhanced security for high-value operations

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router) with React 19
- **Blockchain:** Base Network (L2)
- **Smart Contract Interaction:** Viem v2, Wagmi v2
- **Wallet Infrastructure:** Privy (@privy-io/react-auth)
- **DEX Integration:** 0x Protocol (@0x/0x-parser)
- **Yield Protocol:** Morpho (@morpho-org/blue-sdk)
- **Smart Contracts:** Safe (@safe-global/protocol-kit)
- **UI Components:** Shadcn UI, Radix UI
- **Styling:** Tailwind CSS
- **State Management:** Zustand, React Query
- **Type Safety:** TypeScript (strict mode)
- **Package Manager:** pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm 10+
- A Privy App ID and Client ID
- 0x API key (optional, for enhanced features)
- Dune API key (for analytics)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/yourusername/simplewallet.git
cd simplewallet
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Set up environment variables:**

Create a `.env.local` file in the root directory:

```env
# Privy Configuration (Required)
NEXT_PUBLIC_APP_ID=your_privy_app_id
NEXT_PUBLIC_CLIENT_ID=your_privy_client_id

# Fee Configuration
NEXT_PUBLIC_FEE_RECIPIENT=your_fee_recipient_address

# API Keys
DUNE_API_KEY=your_dune_api_key
ZEROX_API_KEY=your_0x_api_key

# Feature Flags (optional)
NEXT_PUBLIC_FEATURE_MONERIUM_AUTH=false
NEXT_PUBLIC_FEATURE_ZEROX_SWAP=true
```

4. **Run the development server:**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Development Scripts

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm dev:https        # Start dev server with HTTPS

# Building
pnpm build            # Production build with linting
pnpm build:analyze    # Build with bundle analysis
pnpm build:ci         # CI build with strict checks

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm type-check       # TypeScript type checking
```

## 📁 Project Structure

```
src/
  ├── app/                    # Next.js App Router
  │   ├── api/               # API routes
  │   ├── dashboard/         # Main dashboard page
  │   ├── activity/          # Transaction history
  │   ├── asset/             # Asset detail pages
  │   ├── settings/          # User settings
  │   ├── providers/         # React context providers
  │   └── layout.tsx         # Root layout
  ├── components/            # React components
  │   ├── token-balances/    # Token balance components
  │   ├── error-boundaries/  # Error handling
  │   └── ui/                # Shadcn UI components
  ├── hooks/                 # Custom React hooks
  ├── lib/                   # Utility libraries
  ├── config/                # Configuration files
  ├── contexts/              # React contexts
  ├── stores/                # Zustand stores
  ├── types/                 # TypeScript types
  └── locales/               # i18n translations
```

## 🔐 Security Considerations

This is a **demo project**. For production use:

- Implement comprehensive security audits
- Add additional input validation
- Implement rate limiting
- Add monitoring and alerting
- Conduct thorough testing
- Review and update all dependencies regularly

## 📚 Documentation

- [Feature Flags](./docs/feature-flags.md) - Feature flag configuration
- [Vault Integration](./docs/VAULT_INTEGRATION_SUMMARY.md) - Morpho vault integration details
- [Multi-Asset Vault](./docs/README_MultiAssetVault.md) - ERC4626 vault implementation
- [Token Information](./docs/token_info.md) - Supported tokens documentation

## 🤝 Contributing

This is a demonstration project. Contributions, suggestions, and improvements are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is a **demo/example project** for educational and demonstration purposes. It is not intended for production use without proper security audits, testing, and compliance reviews. Use at your own risk.

## 🙏 Acknowledgments

Built with:
- [Privy](https://privy.io/) - Smart wallet infrastructure
- [0x Protocol](https://0x.org/) - DEX aggregation
- [Morpho](https://morpho.org/) - Lending and yield generation
- [Safe](https://safe.global/) - Smart contract security
- [Next.js](https://nextjs.org/) - React framework
- [Base](https://base.org/) - Ethereum L2 network
