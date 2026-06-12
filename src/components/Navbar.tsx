"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Testimonials", href: "#testimonials" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger change when user reaches the second section (approx 100vh)
      setIsScrolled(window.scrollY > window.innerHeight - 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
        isScrolled
          ? "bg-white/90 backdrop-blur-md border-neutral-200 py-3 shadow-sm"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-xl font-bold tracking-tighter transition-colors duration-500 text-black"
        >
          M M <span className="text-neutral-500">BHARATH</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors duration-500",
                isScrolled 
                  ? "text-neutral-600 hover:text-black" 
                  : "text-neutral-400 hover:text-white"
              )}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="#contact"
            className={cn(
              "px-4 py-2 text-sm font-bold rounded-full transition-all duration-500",
              isScrolled
                ? "bg-black text-white hover:bg-neutral-800"
                : "bg-white text-black hover:bg-neutral-200"
            )}
          >
            Hire Me
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className={cn(
            "md:hidden p-2 transition-colors duration-500",
            isScrolled ? "text-black" : "text-neutral-400 hover:text-white"
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-neutral-900 border-b border-neutral-800 p-6 flex flex-col gap-4 md:hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-lg font-medium text-neutral-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="#contact"
              className="w-full py-3 bg-white text-black text-center font-bold rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Hire Me
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
