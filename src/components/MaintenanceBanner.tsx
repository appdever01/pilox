import { AlertTriangle, Clock, Cog } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { motion } from "framer-motion";

interface MaintenanceBannerProps {
  message: string;
}

export function MaintenanceBanner({ message }: MaintenanceBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Alert className="bg-destructive/5 border-none text-destructive relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10" />
        
        <div className="flex items-center gap-4 relative">
          <div className="shrink-0 w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <Cog className="h-5 w-5 text-destructive animate-spin-slow" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-0.5">Maintenance in Progress</h3>
            <p className="text-destructive/80 text-sm">{message}</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0 text-destructive/60 text-sm border border-destructive/20 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            <span>Coming back soon</span>
          </div>
        </div>
      </Alert>
    </motion.div>
  );
} 