"use client";

import { usePathname } from "next/navigation";
import { Github, Linkedin } from "@/components/Icons";

export function Footer() {
  const pathname = usePathname();

  // Don't show Footer on admin pages
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 w-full">
        <div className="max-w-xs">
          <h2 className="text-xl font-bold text-white tracking-tighter mb-2">
            M M <span className="text-neutral-500">BHARATH</span>
          </h2>
          <p className="text-neutral-500 text-sm">
            Turning ideas into scalable digital products through
            modern web technologies, AI, and creative problem solving.
          </p>
        </div>
        
        <div className="flex flex-row gap-16 md:contents">
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Contact</h3>
            <div className="flex flex-col gap-3">
              <a href="tel:+917975871167" className="text-sm text-neutral-400 hover:text-white transition-colors">+91 7975871167</a>
              <a href="mailto:bharatha9483@gmail.com" className="text-sm text-neutral-400 hover:text-white transition-colors">bharatha9483@gmail.com</a>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Social</h3>
            <div className="flex gap-5">
              <a href="https://www.linkedin.com/in/bharath-m-m-a9960b309/" className="text-neutral-400 hover:text-white transition-colors"><Linkedin size={20} /></a>
              <a href="https://github.com/BLITZz-bot" className="text-neutral-400 hover:text-white transition-colors"><Github size={20} /></a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">Links</h3>
          <div className="flex flex-col gap-3">
            <a href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Home</a>
            <a href="#about" className="text-sm text-neutral-400 hover:text-white transition-colors">About</a>
            <a href="#projects" className="text-sm text-neutral-400 hover:text-white transition-colors">Projects</a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-900 flex justify-between items-center">
        <p className="text-xs text-neutral-600">
          © {new Date().getFullYear()} Portfolio. All rights reserved.
        </p>
        <p className="text-xs text-neutral-600 italic">
          CREATE TO INSPIRE.
        </p>
      </div>
    </footer>
  );
}
