'use client';

import { useEffect, useState } from 'react';
import { useAccount, useBalance, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Confetti } from '@/components/ui/confetti';
import { SuccessModal } from '@/components/ui/success-modal';
import { TokenImportModal } from '@/components/ui/token-import-modal';
import { Loader2, GraduationCap, Timer, ArrowRight, Gift, Wallet, Clock, HelpCircle } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { PILOX_ABI, PILOX_ADDRESS } from "@/app/contracts/contract";
import { useWriteContract } from 'wagmi';
import { QueryObserverResult } from "@tanstack/react-query";
import { toast } from 'sonner';
import { BigNumberish, formatUnits, parseUnits } from 'ethers';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { eduChainTestnet } from '@wagmi/core/chains';

export default function ClaimPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: nativeBalance } = useBalance({ address });
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalClaimed, setTotalClaimed] = useState(1000);
  const [userBalance, setUserBalance] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTokenImport, setShowTokenImport] = useState(false);
  const { writeContractAsync: claimTokens } = useWriteContract();
  const [canClaim, setCanClaim] = useState(false);
  const [mintTime, setMintTime] = useState<number>(0);


  const { data: claimStatus, refetch: refetchClaimStatus, isSuccess: isClaimStatusSuccess }: {
    data: undefined | [boolean, number],
    refetch: () => Promise<QueryObserverResult<[boolean, number] | undefined, Error>>,
    isSuccess: boolean,
  } = useReadContract({
    address: PILOX_ADDRESS as `0x${string}`,
    abi: PILOX_ABI,
    functionName: "getClaimStatus",
    args: [address],
    chainId: eduChainTestnet.id,
    query: {
      enabled: !!address && isConnected,
    },
  });

  const { data: tokenBalance, refetch: refetchTokenBalance, isSuccess: isTokenBalanceSuccess } = useReadContract({
    address: PILOX_ADDRESS as `0x${string}`,
    abi: PILOX_ABI,
    functionName: "balanceOf",
    args: [address],
    chainId: eduChainTestnet.id,
  });

  const { data: claimHistory, refetch: refetchClaimHistory, isSuccess: isClaimHistorySuccess } = useReadContract({
    address: PILOX_ADDRESS as `0x${string}`,
    abi: PILOX_ABI,
    functionName: "getClaimHistory",
    args: [address],
    chainId: eduChainTestnet.id,
    query: {
      enabled: !!address && isConnected,
    },
  }) as {
    data: readonly [bigint, bigint] | undefined,
    refetch: () => Promise<QueryObserverResult<readonly [bigint, bigint] | undefined, Error>>,
    isSuccess: boolean,
  };

  useEffect(() => {
    if (isClaimHistorySuccess && claimHistory) {
      const [amount, nextClaimTime] = claimHistory;
      setTotalClaimed(Number(formatUnits(amount, 18)));
      
      if (nextClaimTime > BigInt(0)) {
        const now = BigInt(Math.floor(Date.now() / 1000));
        if (nextClaimTime > now) {
          setTimeLeft(Number(nextClaimTime - now));
        }
      }
    }
  }, [isClaimHistorySuccess, claimHistory]);

  useEffect(() => {
    refetchClaimHistory();
  }, [isConnected, address]);

  useEffect(() => {
    if (isTokenBalanceSuccess && tokenBalance) {
      const formattedBalance = formatBigNumber(tokenBalance as BigNumberish, 18);
      if (formattedBalance) setUserBalance(Number(formattedBalance));
    }
  }, [isTokenBalanceSuccess, tokenBalance]);

  const handleClaimStatus = async () => {
    await refetchClaimStatus();
    if (isClaimStatusSuccess && claimStatus) {
      setCanClaim(claimStatus[0]);
    }
  }

  useEffect(() => {
    if (mintTime > 0) {
      setTimeLeft(mintTime);
    }
  }, [mintTime]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    refetchTokenBalance();
  }, [isConnected, address]);

  useEffect(() => {
    handleClaimStatus();
  }, [isConnected, address, isClaimStatusSuccess, claimStatus]);

  const { open } = useWeb3Modal();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBigNumber = (value: BigNumberish, decimals: number): number => {
    const formatted = formatUnits(value, decimals);
    return parseFloat(formatted)
  };

  const handleClaim = async () => {
    if (!address || !canClaim) return;

    setIsClaiming(true);

    try {
      await claimTokens({
        address: PILOX_ADDRESS as `0x${string}`,
        abi: PILOX_ABI,
        functionName: "claimTokens",
        args: [],
        chainId: eduChainTestnet.id,
      });

      toast.success("Claim Successful!");
      handleClaimStatus();
      refetchTokenBalance();
      setShowSuccess(true);
      setIsClaiming(false);
    } catch (error) {
      setIsClaiming(false);
      toast.error("Claim failed. Please try again.");
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90 flex items-center justify-center p-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-card/30 backdrop-blur-sm border border-primary/20 rounded-2xl p-8 max-w-md mx-auto text-center"
          >
            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="w-12 h-12 text-primary" />
              </div>
            </div>

            <div className="mt-14 space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
                Connect Your Wallet
              </h2>
              <p className="text-muted-foreground">
                Connect your wallet to start claiming $PILOX tokens and join the educational revolution on EDUChain Network.
              </p>
              <Button
                onClick={() => open()}
                className="w-full mt-6 bg-gradient-to-r from-primary via-primary/80 to-primary/50 hover:opacity-90 py-6 text-lg flex items-center justify-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center md:mt-12 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex p-2 bg-primary/10 rounded-full mb-4">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
              Claim $PILOX Tokens
            </h1>
            <div className="space-y-4">
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-lg">
                Power your educational journey on EDUChain Network. Claim 1,000 $PILOX tokens every 3 hours
                to unlock premium learning resources and certification programs.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-card/30 backdrop-blur-sm border-border/50 h-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Your Rewards
                </CardTitle>
                <CardDescription className="flex items-center justify-between">
                  <span>Track your educational assets</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-3 text-xs bg-primary/5 hover:bg-primary/10 text-primary hover:text-primary transition-colors"
                    onClick={() => setShowTokenImport(true)}
                  >
                    <HelpCircle className="w-3 h-3 mr-1.5" />
                    Not seeing tokens?
                  </Button>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">$PILOX Balance</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                        {userBalance.toLocaleString()} $PILOX
                      </span>
                    </div>
                    <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/50"
                        style={{ width: `${Math.min((userBalance / 10000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                    <span className="text-muted-foreground">$EDU Balance</span>
                    <span className="text-lg font-medium">
                      {parseFloat(nativeBalance?.formatted || '0').toFixed(4)} $EDU
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-card/30 backdrop-blur-sm border-border/50 h-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Timer className="w-5 h-5 text-primary" />
                  Claim Status
                </CardTitle>
                <CardDescription>Track token distribution progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Total Claimed</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                        {totalClaimed.toLocaleString()} $PILOX
                      </span>
                    </div>
                    <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/50"
                        style={{ width: `${(totalClaimed / 10000000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next Claim In</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-mono font-medium bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                          {formatTime(timeLeft)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-card/30 backdrop-blur-sm border-border/50 overflow-hidden">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="inline-block p-4 rounded-full bg-primary/10">
                  <Gift className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Claim 1,000 $PILOX Tokens</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Join the educational revolution on EDUChain. PILOX tokens enable access to premium
                    learning resources and certification programs.
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleClaim();
                  }}
                  disabled={timeLeft > 0 || isClaiming}
                  className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-primary via-primary/80 to-primary/50 hover:opacity-90 transition-all"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Claiming PILOX...
                    </>
                  ) : timeLeft > 0 ? (
                    <>
                      <Timer className="w-5 h-5 mr-2" />
                      Next Claim in {formatTime(timeLeft)}
                    </>
                  ) : (
                    <>
                      Claim 1,000 PILOX
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p className="max-w-2xl mx-auto">
            $PILOX is the educational utility token on the EDUChain Network.
            <br />
            Claim tokens every 3 hours to participate in the future of decentralized education.
          </p>
        </motion.div>
      </div>

      {/* Success Modal and Confetti */}
      {showSuccess && <Confetti />}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        amount={1000}
      />
      <TokenImportModal
        isOpen={showTokenImport}
        onClose={() => setShowTokenImport(false)}
      />
    </div>
  );
}