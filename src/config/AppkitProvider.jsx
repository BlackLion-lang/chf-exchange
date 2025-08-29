import { createAppKit } from '@reown/appkit/react'

import { WagmiProvider } from 'wagmi'
import { bsc, bscTestnet } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = '987217903d9f70edff1a34ee30224965'

// 2. Create a metadata object - optional
const metadata = {
  name: 'AppKit',
  description: 'AppKit Example',
  url: 'https://example.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
const networks = [bsc, bscTestnet]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  enableNetworkSwitch: true,
  features: {
    connectMethodsOrder: ["social", "email", "wallet"],
  },
  themeVariables: {
    "--w3m-font-family": "Bree Serif, sans-serif",
    "--w3m-color-mix": "#000000",
    '--w3m-accent': '#00C5CE',
    '--w3m-border-radius-master': '2px',
  },
})

export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
    </WagmiProvider>
  )
}