"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface ToastProps {
  show: boolean;
  message?: string;
  subMessage?: string;
}

export function Toast({
  show,
  message = "Action successful",
  subMessage = "Your changes have been saved."
}: ToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 border border-white/10 px-5 py-4 rounded-2xl shadow-xl shadow-black/40"
        >
          <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
            <Check className="text-green-500" size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{message}</p>
            <p className="text-xs text-neutral-400">{subMessage}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
