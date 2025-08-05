'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import { Button } from './button';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

export const SuccessModal = ({ isOpen, onClose, amount }: SuccessModalProps) => {
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
              className="w-full max-w-sm"
            >
              <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-2xl">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center animate-ping">
                      <div className="w-24 h-24 rounded-full bg-primary/20" />
                    </div>
                    <div className="relative flex justify-center">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <Gift className="w-12 h-12 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute top-3 right-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-center pt-14 space-y-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
                    Congratulations! 🎉
                  </h2>
                  <div>
                    <p className="text-muted-foreground">
                      You've successfully claimed
                    </p>
                    <p className="text-4xl font-bold mt-2 bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                      {amount.toLocaleString()} $PILOX
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your tokens have been added to your balance.<br />
                    Come back in 3 hours to claim more!
                  </p>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="w-full mt-6 bg-gradient-to-r from-primary via-primary/80 to-primary/50 hover:opacity-90 py-6 text-lg"
                  >
                    Continue Learning
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