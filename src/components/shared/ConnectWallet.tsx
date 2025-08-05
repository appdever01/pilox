'use client';

import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect, useBalance } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, Copy, LogOut, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ConnectWallet() {
  const { open } = useWeb3Modal();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address: address,
  });

  const handleClaimClick = () => {
    router.push('/claim');
  };

  const copyAddress = () => {
    if (address && navigator.clipboard) {
      navigator.clipboard.writeText(address);
    }
  };

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="relative ml-4 bg-white/5 backdrop-blur-sm border-primary/20 hover:bg-white/10 hover:border-primary/30 transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="hidden sm:inline">{address.slice(0, 4)}...{address.slice(-4)}</span>
              <span className="sm:hidden">Connected</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-sm border-primary/20">
          <div className="px-2 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Wallet</span>
              <span className="text-xs font-medium">{address.slice(0, 6)}...{address.slice(-4)}</span>
            </div>
            {!isBalanceLoading && balance && (
              <>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">$EDU</span>
                  <span className="text-xs font-medium">
                    {parseFloat(balance.formatted).toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">$PILOX</span>
                  <span className="text-xs font-medium">1,000.00</span>
                </div>
              </>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleClaimClick}
            className="cursor-pointer text-sm font-medium"
          >
            Claim $PILOX
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push('/claim-history')}
            className="cursor-pointer text-sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Claim History
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={copyAddress}
            className="cursor-pointer text-sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => disconnect()}
            className="cursor-pointer text-sm text-red-500 focus:text-red-500"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={() => open()}
      className="ml-4 bg-primary hover:bg-primary/90 text-white font-medium flex items-center gap-2 transition-all duration-200"
    >
      <Wallet className="w-4 h-4" />
      <span className="hidden sm:inline">Connect Wallet</span>
      <span className="sm:hidden">Connect</span>
    </Button>
  );
}