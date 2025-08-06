'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, Check, Wallet, Plus, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { useState } from 'react';

interface TokenImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONTRACT_ADDRESS = '0xdC31e36B8aC53A77bb70EeFca28A5782Ed778144';

export const TokenImportModal = ({ isOpen, onClose }: TokenImportModalProps) => {
  const [copied, setCopied] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      title: "Open Your Wallet",
      description: "Open your wallet extension (e.g., MetaMask) and click on 'Assets'",
      icon: Wallet
    },
    {
      title: "Import Token",
      description: "Click the 'Import tokens' or '+' button at the bottom of your assets list",
      icon: Plus
    },
    {
      title: "Add Contract Address",
      description: "Paste the $PILOX token contract address below",
      icon: Copy,
      action: (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
            <code className="text-sm font-mono flex-1 text-primary/80 break-all">
              {CONTRACT_ADDRESS}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-primary hover:text-primary/80"
              onClick={copyAddress}
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The token symbol and decimals will be automatically filled
          </p>
        </div>
      )
    }
  ];

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
              className="w-full max-w-lg"
            >
              <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 p-6 shadow-2xl">
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">Import $PILOX Token</h2>
                    <p className="text-muted-foreground mt-1">
                      Follow these steps to see your $PILOX tokens in your wallet
                    </p>
                  </div>

                  <div className="space-y-6">
                    {steps.map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg transition-all duration-200 ${
                          currentStep === index + 1
                            ? "bg-primary/5 border border-primary/20"
                            : "bg-card/50"
                        }`}
                        onClick={() => setCurrentStep(index + 1)}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${
                            currentStep === index + 1
                              ? "bg-primary/10"
                              : "bg-muted"
                          }`}>
                            <step.icon className={`w-5 h-5 ${
                              currentStep === index + 1
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">Step {index + 1}: {step.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {step.description}
                            </p>
                            {step.action}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                      disabled={currentStep === 1}
                    >
                      Previous Step
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}
                      disabled={currentStep === steps.length}
                    >
                      Next Step
                    </Button>
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