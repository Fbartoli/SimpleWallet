# Don8 - Web3 Token Swapping Platform

Don8 is a modern web3 application built on Base that enables seamless token swapping using the 0x Protocol. The platform features a clean, user-friendly interface built with Next.js 14 and integrates with various tokens including USDC, EURC, WETH, and WBTC.

## Features

- 🔄 Token Swapping via 0x Protocol
- 💰 Support for multiple tokens (USDC, EURC, WETH, WBTC)
- 🔒 Secure wallet integration with Wagmi v2
- 🎨 Modern UI with Shadcn UI components
- 📱 Responsive design with Tailwind CSS
- ⚡ Built on Base for fast and low-cost transactions
- 🛡️ Type-safe development with strict TypeScript configuration

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Smart Contract Integration:** Viem v2, Wagmi v2
- **DEX Integration:** 0x Protocol
- **UI Components:** Shadcn UI, Radix UI
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Type Safety:** TypeScript with strict configuration
- **Network:** Base

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/don8.git
cd don8
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:

```
# Privy Configuration
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

4. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Development

The project uses a strict TypeScript configuration for maximum type safety. Key features include:

- No implicit any types
- Strict null checks
- Explicit return types
- Comprehensive error catching

## Project Structure

```
src/
  ├── app/                # Next.js app directory
  │   ├── components/     # React components
  │   ├── hooks/         # Custom React hooks
  │   ├── providers/     # React context providers
  │   ├── stores/        # Zustand stores
  │   └── types/         # TypeScript types
  ├── config/            # Configuration files
  └── styles/            # Global styles
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
