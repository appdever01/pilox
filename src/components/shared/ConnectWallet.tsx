'use client';

import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ConnectWallet() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: address,
  });

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="relative ml-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 border-none"
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span>{address.slice(0, 4)}...{address.slice(-4)}</span>
              {isBalanceLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : balance ? (
                <span className="text-sm font-medium">
                  {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                </span>
              ) : null}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(address);
              }
            }}
            className="cursor-pointer"
          >
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => disconnect()}
            className="cursor-pointer text-red-500 focus:text-red-500"
          >
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={() => open()}
      variant="outline"
      className="ml-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 border-none flex items-center gap-2"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
}