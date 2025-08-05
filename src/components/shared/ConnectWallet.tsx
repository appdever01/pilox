'use client';

import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';

export function ConnectWallet() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <Button
        onClick={() => disconnect()}
        variant="outline"
        className="ml-4 bg-blue-600 text-white hover:bg-blue-700"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  }

  return (
    <Button
      onClick={() => open()}
      variant="outline"
      className="ml-4 bg-blue-600 text-white hover:bg-blue-700"
    >
      Connect Wallet
    </Button>
  );
}