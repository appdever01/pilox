'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowDown, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { toast } from 'sonner';
import AuthApiClient from '@/lib/auth-api-client';
import { API_ROUTES } from '@/lib/config';
import { auth } from '@/lib/auth';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  piloxBalance: number;
}

const PILOX_PER_CREDIT = 200;

export const SwapModal = ({ isOpen, onClose, piloxBalance }: SwapModalProps) => {
  const [credits, setCredits] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState(false);
  const piloxCost = Number(credits) * PILOX_PER_CREDIT;
  const user = auth.getUser();

  const handleSwap = async () => {
    if (!credits || Number(credits) <= 0) {
      toast.error('Please enter a valid number of credits');
      return;
    }

    if (piloxCost > piloxBalance) {
      toast.error('Insufficient $PILOX balance');
      return;
    }

    setIsSwapping(true);
    try {
      const response = await AuthApiClient.post<{ status: string; message?: string }>(
        API_ROUTES.SWAP_TOKEN,
        { credits: Number(credits) }
      );

      if (response.status === 'success') {
        toast.success(`Successfully swapped ${piloxCost} $PILOX for ${credits} credits!`);
        auth.updateUser({
          ...user,
          credits: (user?.credits || 0) + Number(credits)
        });
        onClose();
      } else {
        toast.error(response.message || 'Failed to swap tokens');
      }
    } catch (error: any) {
      console.error('Error swapping tokens:', error);
      toast.error(error.message || 'Failed to swap tokens');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-2xl">
                <button
                  type="button"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-bold">Swap to Credits</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 rounded-lg space-y-2">
                      <label className="block text-sm text-muted-foreground text-left">
                        Credits to Receive
                      </label>
                      <Input
                        type="number"
                        value={credits}
                        onChange={(e) => setCredits(e.target.value)}
                        placeholder="0"
                        min="0"
                        className="text-lg font-medium text-center"
                      />
                    </div>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <ArrowDown className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/5 rounded-lg space-y-2">
                      <label className="block text-sm text-muted-foreground text-left">
                        $PILOX Cost
                      </label>
                      <div className="text-lg font-medium text-center">
                        {piloxCost.toLocaleString()} $PILOX
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Rate: 1 Credit = {PILOX_PER_CREDIT} $PILOX
                    </div>
                  </div>

                  <Button
                    onClick={handleSwap}
                    disabled={isSwapping || !credits || Number(credits) <= 0 || piloxCost > piloxBalance}
                    className="w-full bg-gradient-to-r from-primary via-primary/80 to-primary/50 hover:opacity-90 py-6"
                  >
                    {isSwapping ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Swapping...
                      </>
                    ) : piloxCost > piloxBalance ? (
                      'Insufficient $PILOX Balance'
                    ) : (
                      'Swap to Credits'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};