"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ExternalLink, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Code2, 
  Layers, 
  CheckCircle2, 
  ArrowUpRight,
  Eye
} from "lucide-react";
import { Github } from "@/components/Icons";
import { Project } from "@/lib/projects";
import { useLenis } from "lenis/react";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

interface ParsedFeature {
  icon?: string;
  title: string;
  description: string;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const lenis = useLenis();
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset image index when project changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsLightboxOpen(false);
  }, [project]);

  // Gallery Navigation
  const nextImage = useCallback(() => {
    if (!project || !project.gallery || project.gallery.length <= 1) return;
    setCurrentImageIndex((prev) => (prev + 1) % project.gallery.length);
  }, [project]);

  const prevImage = useCallback(() => {
    if (!project || !project.gallery || project.gallery.length <= 1) return;
    setCurrentImageIndex((prev) => (prev - 1 + project.gallery.length) % project.gallery.length);
  }, [project]);

  // Keyboard navigation
  useEffect(() => {
    if (!project) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          onClose();
        }
      } else if (event.key === "ArrowRight") {
        nextImage();
      } else if (event.key === "ArrowLeft") {
        prevImage();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [project, isLightboxOpen, onClose, nextImage, prevImage]);

  // Handle body scroll locking with Lenis integration
  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.classList.add("projects-modal-open");
      lenis?.stop();
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("projects-modal-open");
      lenis?.start();
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.classList.remove("projects-modal-open");
      lenis?.start();
    };
  }, [project, lenis]);

  // Smart Description & Feature Parser
  const { introParagraphs, features } = useMemo(() => {
    if (!project?.description) return { introParagraphs: [], features: [] };

    const rawLines = project.description.split("\n").map(l => l.trim()).filter(Boolean);
    const intro: string[] = [];
    const featList: ParsedFeature[] = [];

    const emojiRegex = /^(\p{Extended_Pictographic}|[-*•])\s*(.*)$/u;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const match = line.match(emojiRegex);

      if (match) {
        const symbol = match[1];
        const title = match[2];
        let desc = "";

        // Check if the next line is a description for this item
        if (i + 1 < rawLines.length && !rawLines[i + 1].match(emojiRegex)) {
          desc = rawLines[i + 1];
          i++; // Skip the next line since we consumed it
        }

        featList.push({
          icon: symbol !== "-" && symbol !== "*" && symbol !== "•" ? symbol : undefined,
          title: title || line,
          description: desc
        });
      } else {
        intro.push(line);
      }
    }

    return { introParagraphs: intro, features: featList };
  }, [project?.description]);

  if (!mounted || !project) return null;

  const hasLiveDemo = project.link && project.link !== "#" && project.link.trim() !== "";
  const hasGithub = project.github && project.github !== "#" && project.github.trim() !== "";
  const galleryImages = project.gallery && project.gallery.length > 0 ? project.gallery : [project.thumbnail];

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex flex-col bg-neutral-950 text-white overflow-hidden select-none">
        {/* Ambient Blurred Background Glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-white/[0.03] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-neutral-800/[0.08] rounded-full blur-[120px] pointer-events-none" />

        {/* Top Sticky Header Bar */}
        <header className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 bg-neutral-950/90 backdrop-blur-2xl shrink-0">
          
          {/* Left: Category + Title */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest text-neutral-300 uppercase shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {project.category}
            </div>
            
            <div className="h-4 w-px bg-white/15 hidden sm:block shrink-0" />
            
            {/* Project Title */}
            <h2 className="text-sm sm:text-lg font-bold tracking-tight text-white truncate uppercase">
              {project.title}
            </h2>
          </div>

          {/* Right: Actions (Live Demo, GitHub, Expand, Close) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {hasLiveDemo && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-neutral-200 transition-all shadow-md shadow-white/10 active:scale-95"
                title="Open Live Project"
              >
                <span>Live Demo</span>
                <ExternalLink size={14} strokeWidth={2.5} />
              </a>
            )}

            {hasGithub && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-neutral-900 border border-white/15 text-white font-medium text-xs sm:text-sm hover:bg-neutral-800 hover:border-white/30 transition-all active:scale-95"
                title="View Source Code on GitHub"
              >
                <Github size={14} />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            )}

            {/* Close Button (X icon only) */}
            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-full bg-neutral-900 border border-white/15 text-neutral-300 hover:text-white hover:bg-neutral-800 hover:border-white/30 transition-all group cursor-pointer shadow-md flex items-center justify-center"
              title="Close (Esc)"
              aria-label="Close modal"
            >
              <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </header>

        {/* Main Full-Screen Split Viewport */}
        <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Column: Interactive Gallery Showcase (60-65%) */}
          <section className="w-full lg:w-[62%] xl:w-[65%] flex flex-col bg-black/60 border-b lg:border-b-0 lg:border-r border-white/10 overflow-hidden relative">
            
            {/* Gallery Viewport */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[420px] lg:min-h-0 flex items-center justify-center p-4 sm:p-8 overflow-hidden group">
              
              {/* Subtle Stage Grid Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

              {/* Main Image with Zoom Lightbox Trigger */}
              <div 
                className="relative w-full h-full max-h-[70vh] flex items-center justify-center cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={galleryImages[currentImageIndex]}
                    alt={`${project.title} screenshot ${currentImageIndex + 1}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10 select-none"
                  />
                </AnimatePresence>

                {/* Click to Zoom Pill Indicator */}
                <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-neutral-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye size={13} />
                  <span>Click to expand</span>
                </div>
              </div>

              {/* Carousel Arrows (if > 1 image) */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 rounded-full bg-neutral-900/80 backdrop-blur-md text-white border border-white/15 hover:bg-neutral-800 hover:border-white/30 hover:scale-105 active:scale-95 transition-all shadow-xl z-20 cursor-pointer"
                    aria-label="Previous screenshot"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 sm:p-3.5 rounded-full bg-neutral-900/80 backdrop-blur-md text-white border border-white/15 hover:bg-neutral-800 hover:border-white/30 hover:scale-105 active:scale-95 transition-all shadow-xl z-20 cursor-pointer"
                    aria-label="Next screenshot"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              {/* Counter Badge */}
              <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 text-xs font-mono text-neutral-300">
                {String(currentImageIndex + 1).padStart(2, "0")} / {String(galleryImages.length).padStart(2, "0")}
              </div>
            </div>

            {/* Bottom Filmstrip Thumbnails Bar (if > 1 image) */}
            {galleryImages.length > 1 && (
              <div className="p-3 sm:p-4 bg-neutral-950/90 border-t border-white/10 flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto custom-scrollbar shrink-0">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative shrink-0 w-16 sm:w-20 h-11 sm:h-13 rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                      idx === currentImageIndex
                        ? "border-white scale-105 shadow-md shadow-white/10 ring-2 ring-white/20"
                        : "border-white/10 opacity-50 hover:opacity-90 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Right Column: Case Study Details & Meta (35-38%) */}
          <aside 
            className="w-full lg:w-[38%] xl:w-[35%] flex flex-col justify-between bg-neutral-950 overflow-y-auto custom-scrollbar select-text"
            data-lenis-prevent
          >
            <div className="p-6 sm:p-8 lg:p-10 space-y-8">
              
              {/* Category & Title Header */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">
                    {project.category}
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-medium">
                    Verified Showcase
                  </span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white uppercase leading-none">
                  {project.title}
                </h1>
              </div>

              {/* Quick Meta Cards */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-neutral-900/60 border border-white/5 backdrop-blur-sm">
                <div>
                  <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Layers size={12} className="text-neutral-400" />
                    Category
                  </p>
                  <p className="text-sm font-semibold text-white truncate">{project.category}</p>
                </div>
                <div>
                  <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Code2 size={12} className="text-neutral-400" />
                    Stack
                  </p>
                  <p className="text-sm font-semibold text-white truncate">
                    {project.technologies ? `${project.technologies.length} Technologies` : "Modern Web"}
                  </p>
                </div>
              </div>

              {/* Overview / Introduction */}
              {introParagraphs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                    <Sparkles size={14} className="text-neutral-400" />
                    About Project
                  </h3>
                  <div className="space-y-3 text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
                    {introParagraphs.map((para, i) => (
                      <p key={i} className="leading-relaxed">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features / Highlights (Rendered as Sleek Cards) */}
              {features.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    Key Highlights & Architecture
                  </h3>
                  <div className="space-y-2.5">
                    {features.map((feat, i) => (
                      <div
                        key={i}
                        className="p-3.5 sm:p-4 rounded-xl bg-neutral-900/70 border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {feat.icon ? (
                            <span className="text-xl shrink-0 mt-0.5">{feat.icon}</span>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-2" />
                          )}
                          <div>
                            <h4 className="text-sm font-bold text-white tracking-wide">
                              {feat.title}
                            </h4>
                            {feat.description && (
                              <p className="text-xs sm:text-sm text-neutral-400 mt-1 leading-relaxed">
                                {feat.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies Stack Badges */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                    <Code2 size={14} className="text-neutral-400" />
                    Technologies & Tools
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-xs font-medium text-neutral-300 hover:border-white/30 hover:text-white transition-all shadow-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky/Bottom Primary Action CTA Buttons */}
            <div className="p-6 sm:p-8 bg-neutral-950 border-t border-white/10 space-y-3 shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                {hasLiveDemo && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 px-6 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-lg shadow-white/10 active:scale-98 group"
                  >
                    <span>Visit Live Project</span>
                    <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                )}

                {hasGithub && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`py-3.5 px-6 rounded-xl bg-neutral-900 border border-white/15 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 hover:border-white/30 transition-all active:scale-98 ${
                      !hasLiveDemo ? "w-full" : "flex-1"
                    }`}
                  >
                    <Github size={18} />
                    <span>View Source</span>
                  </a>
                )}
              </div>

              {!hasLiveDemo && !hasGithub && (
                <div className="text-center py-2 text-xs font-mono text-neutral-500">
                  Internal / Proprietary Project
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Fullscreen High-Resolution Lightbox Overlay */}
        <AnimatePresence>
          {isLightboxOpen && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/98 backdrop-blur-2xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLightboxOpen(false)}
                className="absolute inset-0 cursor-zoom-out"
              />

              {/* Lightbox Close Button */}
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-6 right-6 z-30 p-2.5 sm:p-3 rounded-full bg-neutral-900/90 backdrop-blur-md text-white border border-white/20 hover:bg-neutral-800 transition-all cursor-pointer shadow-2xl"
                title="Close Zoom (Esc)"
              >
                <X size={20} />
              </button>

              {/* Lightbox Image Container */}
              <div 
                className="relative max-w-7xl max-h-[88vh] w-full px-6 flex items-center justify-center z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={galleryImages[currentImageIndex]}
                    alt={`${project.title} full view`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                  />
                </AnimatePresence>

                {/* Lightbox Navigation Arrows */}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-10 p-4 rounded-full bg-neutral-900/80 backdrop-blur-md text-white border border-white/15 hover:bg-neutral-800 transition-all cursor-pointer"
                    >
                      <ChevronLeft size={28} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-10 p-4 rounded-full bg-neutral-900/80 backdrop-blur-md text-white border border-white/15 hover:bg-neutral-800 transition-all cursor-pointer"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </>
                )}
              </div>

              {/* Lightbox Bottom Indicator */}
              <div className="absolute bottom-6 z-20 flex flex-col items-center gap-2">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                  {currentImageIndex + 1} / {galleryImages.length}
                </span>
                {galleryImages.length > 1 && (
                  <div className="flex gap-2">
                    {galleryImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          i === currentImageIndex ? "w-8 bg-white" : "w-2 bg-white/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
