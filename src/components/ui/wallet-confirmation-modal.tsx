'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Button } from './button';
import { useState } from 'react';

interface WalletConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const WalletConfirmationModal = ({ isOpen, onClose, onConfirm }: WalletConfirmationModalProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

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
            >
              <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-2xl">
                <div className="absolute top-4 right-4">
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                      <div className="w-16 h-16 rounded-full bg-yellow-500/20" />
                    </div>
                    <div className="relative flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-yellow-500" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <h2 className="text-2xl font-bold">Important Notice</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-card/50 rounded-lg border border-yellow-500/20">
                        <div className="flex items-start gap-3">
                          <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-left text-muted-foreground">
                            You can only connect <span className="font-semibold text-foreground">one wallet</span> to your account. 
                            This process is <span className="font-semibold text-foreground">irreversible</span> once the wallet 
                            has been linked.
                          </p>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isConfirmed}
                          onChange={(e) => setIsConfirmed(e.target.checked)}
                          className="rounded border-primary/20 text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm">I understand and confirm this action</span>
                      </label>
                    </div>

                    <div className="pt-4 flex flex-col gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onConfirm();
                        }}
                        disabled={!isConfirmed}
                        className="w-full bg-gradient-to-r from-primary via-primary/80 to-primary/50 hover:opacity-90 py-6"
                      >
                        Connect Wallet
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                        }}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};