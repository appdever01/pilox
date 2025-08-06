'use client';

import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiConfig, createConfig } from 'wagmi';
import { eduChainTestnet } from 'wagmi/chains';
import { http } from 'viem';
import { 
  injected,
  walletConnect,
} from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '4a076acc13640a16dbc52c89d2e74f95';

const metadata = {
  name: 'PILOX',
  description: 'PILOX - Ultimate AI PDF Tools & Document Assistant',
  url: 'https://pilox.com.ng',
  icons: ['https://pilox.com.ng/favicon.png']
};

const queryClient = new QueryClient();

const config = createConfig({
  chains: [eduChainTestnet],
  transports: {
    [eduChainTestnet.id]: http(),
  },
  connectors: [
    injected(),
    walletConnect({ 
      projectId,
      showQrModal: true,
      metadata,
    }),
  ],
});

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  defaultChain: eduChainTestnet,
  themeMode: 'light',
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
  ],
  tokens: {
    [eduChainTestnet.id]: {
      address: '0x0000000000000000000000000000000000000000'
    }
  },
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase
    '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f', // Rainbow
    '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927', // Ledger
  ],
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  );
}