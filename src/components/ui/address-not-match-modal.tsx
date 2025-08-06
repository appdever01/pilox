'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Button } from './button';

interface AddressNotMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedAddress: string;
  savedAddress: string;
}

export const AddressNotMatchModal = ({ 
  isOpen, 
  onClose, 
  connectedAddress,
  savedAddress 
}: AddressNotMatchModalProps) => {
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
                <button
                  type="button"
                  className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                      <div className="w-16 h-16 rounded-full bg-red-500/20" />
                    </div>
                    <div className="relative flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <h2 className="text-2xl font-bold">Address Mismatch</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-card/50 rounded-lg border border-red-500/20">
                        <div className="flex items-start gap-3">
                          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                          <div className="text-left space-y-2">
                            <p className="text-sm text-muted-foreground">
                              The connected wallet address does not match the one linked to your account.
                            </p>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">Connected Address:</p>
                              <p className="text-xs font-mono bg-red-500/5 p-2 rounded">{connectedAddress}</p>
                              <p className="text-xs text-muted-foreground mt-2">Account Address:</p>
                              <p className="text-xs font-mono bg-primary/5 p-2 rounded">{savedAddress}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                        }}
                        className="w-full bg-gradient-to-r from-primary via-primary/80 to-primary/50 hover:opacity-90 py-6"
                      >
                        Disconnect and Try Again
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