"use client";

import { motion } from "framer-motion";
import { ArrowRight, Download, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { getSettings } from "@/app/actions/admin";

export function Hero() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSettings();
      if (settings && (settings as any).resume_url) {
        setResumeUrl((settings as any).resume_url);
      }
    };
    fetchSettings();
  }, []);

  const handleDownload = () => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    } else {
      alert("Resume not yet uploaded by Admin.");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        {/* Animated Grid */}
        <motion.div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.5) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            maskImage: "linear-gradient(135deg, black 0%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(135deg, black 0%, transparent 80%)"
          }}
          animate={{
            backgroundPosition: ["0px 0px", "60px 60px"]
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
            ease: "linear"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest bg-neutral-900 border border-neutral-800 rounded-full text-neutral-400">
            Hello, Welcome to my portfolio
          </span>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
            FULL - STACK <span className="text-neutral-500">DEVELOPER</span><br />
            & COMPUTER SCIENCE STUDENT<span className="text-neutral-500">.</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-lg md:text-xl text-neutral-400 mb-10 leading-relaxed">
            Building modern web applications, AI-powered tools,
            and real-world software solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-black font-bold rounded-full flex items-center gap-2 group"
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
            >
              View My Work
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownload}
              className="px-8 py-4 bg-neutral-900 text-white font-bold rounded-full border border-white/10 flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-xl shadow-black/20"
            >
              Download CV
              <Download size={18} />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">Scroll Down</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} className="text-neutral-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
