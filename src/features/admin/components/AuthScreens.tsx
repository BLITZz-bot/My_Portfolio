"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function LoginScreen() {
  const handleSignIn = () => {
    supabase?.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/admin" },
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-10 rounded-[32px] bg-neutral-900 border border-white/10 w-full max-w-md text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5">
          <SettingsIcon className="text-white" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tighter mb-4 uppercase">Admin Access</h1>
        <p className="text-neutral-500 mb-10 leading-relaxed">Sign in with your authorized Google account to manage your portfolio content.</p>
        <button
          onClick={handleSignIn}
          className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5 cursor-pointer"
        >
          <Image src="https://www.google.com/favicon.ico" width={16} height={16} alt="Google" className="w-4 h-4" unoptimized />
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}

export function AccessDeniedScreen() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-neutral-500 mb-6">You do not have permission to view this dashboard.</p>
        <button 
          onClick={() => supabase?.auth.signOut()} 
          className="px-6 py-3 bg-neutral-800 text-white rounded-xl font-bold hover:bg-neutral-700 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
