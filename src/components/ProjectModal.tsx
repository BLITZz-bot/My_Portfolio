"use client";

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from "react";
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
import { Project, ParsedFeature } from "@/types/project";
import { useLenis } from "lenis/react";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

// React 19 hydration-safe check without setState-in-effect
const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function ProjectModalContent({ project, onClose }: { project: Project; onClose: () => void }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

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
  }, [isLightboxOpen, onClose, nextImage, prevImage]);

  // Smart Description & Feature Parser (supports numbers, emojis, bullets, headlines)
  const description = project.description;
  const { introParagraphs, features } = useMemo(() => {
    if (!description) return { introParagraphs: [], features: [] };

    const rawLines = description.split("\n").map(l => l.trim()).filter(Boolean);
    const intro: string[] = [];
    const featList: ParsedFeature[] = [];

    // Matchers for headline items
    const numberRegex = /^(\d{1,2})[\.\)]\s*(.*)$/;
    const emojiRegex = /^(\p{Extended_Pictographic})\s*(.*)$/u;
    const bulletRegex = /^([-*•✦▪▫→✔✅►])\s*(.*)$/;
    const headingRegex = /^(?:#{1,4}\s*|\*\*)([^*]+)\*\*?:?$/;

    const isHeadline = (line: string) => {
      return (
        numberRegex.test(line) ||
        emojiRegex.test(line) ||
        bulletRegex.test(line) ||
        headingRegex.test(line)
      );
    };

    let hasEncounteredFirstFeature = false;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];

      const numberMatch = line.match(numberRegex);
      const emojiMatch = line.match(emojiRegex);
      const bulletMatch = line.match(bulletRegex);
      const headingMatch = line.match(headingRegex);

      if (numberMatch || emojiMatch || bulletMatch || headingMatch) {
        hasEncounteredFirstFeature = true;
        let badge: string | undefined = undefined;
        let icon: string | undefined = undefined;
        let title = "";

        if (numberMatch) {
          badge = numberMatch[1].padStart(2, "0");
          title = numberMatch[2] || `Feature ${badge}`;
        } else if (emojiMatch) {
          icon = emojiMatch[1];
          title = emojiMatch[2] || line;
        } else if (bulletMatch) {
          const sym = bulletMatch[1];
          icon = sym !== "-" && sym !== "*" && sym !== "•" ? sym : undefined;
          title = bulletMatch[2] || line;
        } else if (headingMatch) {
          title = headingMatch[1];
        }

        // Collect description lines directly below this point until the next headline
        const descLines: string[] = [];
        while (i + 1 < rawLines.length && !isHeadline(rawLines[i + 1])) {
          descLines.push(rawLines[i + 1]);
          i++;
        }

        featList.push({
          badge,
          icon,
          title,
          description: descLines.join(" ")
        });
      } else {
        if (!hasEncounteredFirstFeature) {
          intro.push(line);
        } else {
          // If already past features, add as a feature card
          featList.push({
            title: line,
            description: ""
          });
        }
      }
    }

    return { introParagraphs: intro, features: featList };
  }, [description]);

  const hasLiveDemo = project.link && project.link !== "#" && project.link.trim() !== "";
  const hasGithub = project.github && project.github !== "#" && project.github.trim() !== "";
  const galleryImages = project.gallery && project.gallery.length > 0 ? project.gallery : [project.thumbnail];

  return (
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
            >
              <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </header>

        {/* Main Body - Split Layout (Image Gallery Left, Details Right) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
          
          {/* Left Column: Visual Showcase (62-65%) */}
          <section className="w-full lg:w-[62%] xl:w-[65%] flex flex-col justify-between bg-neutral-900/40 border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden shrink-0 lg:shrink">
            
            {/* Viewport Area for Featured Image */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[420px] lg:min-h-0 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-hidden group/stage">
              
              {/* Radial backdrop highlight */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />

              {/* Main Image with AnimatePresence */}
              <div className="relative max-w-full max-h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="relative max-h-[50vh] sm:max-h-[60vh] lg:max-h-[68vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-950 flex items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={galleryImages[currentImageIndex]}
                      alt={`${project.title} slide ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain max-h-[50vh] sm:max-h-[60vh] lg:max-h-[68vh]"
                    />

                    {/* Quick-Zoom trigger button on hover */}
                    <button
                      onClick={() => setIsLightboxOpen(true)}
                      className="absolute inset-0 bg-neutral-950/0 hover:bg-neutral-950/40 flex items-center justify-center transition-all opacity-0 hover:opacity-100 cursor-zoom-in group/zoom"
                    >
                      <div className="px-4 py-2 rounded-full bg-neutral-900/90 backdrop-blur-md border border-white/20 text-white text-xs font-semibold flex items-center gap-2 shadow-2xl transform scale-90 group-hover/zoom:scale-100 transition-transform">
                        <Eye size={14} />
                        <span>Expand View</span>
                      </div>
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Left/Right Navigation Arrows */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 sm:left-6 p-2.5 sm:p-3 rounded-full bg-neutral-900/80 backdrop-blur-md text-white border border-white/15 hover:bg-neutral-800 hover:border-white/30 transition-all cursor-pointer shadow-lg active:scale-90"
                    title="Previous Image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 sm:right-6 p-2.5 sm:p-3 rounded-full bg-neutral-900/80 backdrop-blur-md text-white border border-white/15 hover:bg-neutral-800 hover:border-white/30 transition-all cursor-pointer shadow-lg active:scale-90"
                    title="Next Image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Bottom Image Counter Pill */}
              <div className="absolute bottom-4 left-6 px-3 py-1 rounded-full bg-neutral-950/80 backdrop-blur-md border border-white/10 text-[11px] font-mono tracking-widest text-neutral-400 uppercase">
                {currentImageIndex + 1} / {galleryImages.length}
              </div>
            </div>

            {/* Thumbnail Strip (Bottom of left pane) */}
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
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
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">Case Study</span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">{project.category}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase">
                  {project.title}
                </h1>
              </div>

              {/* Introduction / Overview Paragraphs */}
              {introParagraphs.length > 0 && (
                <div className="space-y-3 text-neutral-300 text-sm sm:text-base leading-relaxed">
                  {introParagraphs.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              )}

              {/* Structured Key Features Section */}
              {features.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <Sparkles size={16} className="text-neutral-400" />
                    <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">
                      Key Highlights & Features
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {features.map((feat, idx) => (
                      <div 
                        key={idx}
                        className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 hover:border-white/15 transition-all duration-200 flex items-start gap-3.5 group/card"
                      >
                        {/* Feature Badge or Icon */}
                        {feat.badge ? (
                          <div className="shrink-0 w-7 h-7 rounded-lg bg-white/5 border border-white/10 font-mono text-xs font-bold text-neutral-300 flex items-center justify-center group-hover/card:border-white/30 group-hover/card:text-white transition-colors">
                            {feat.badge}
                          </div>
                        ) : feat.icon ? (
                          <div className="shrink-0 text-base leading-none pt-0.5">
                            {feat.icon}
                          </div>
                        ) : (
                          <div className="shrink-0 w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 size={14} />
                          </div>
                        )}

                        {/* Title & Description */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-white tracking-tight leading-snug">
                            {feat.title}
                          </h4>
                          {feat.description && (
                            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                              {feat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies Stack Tags */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <Code2 size={16} className="text-neutral-400" />
                    <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">
                      Technologies & Tools
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/10 text-xs font-medium text-neutral-300 hover:text-white hover:border-white/20 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links Section */}
              <div className="pt-4 space-y-3">
                {hasLiveDemo && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-5 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-lg shadow-white/10 active:scale-[0.99]"
                  >
                    <span>Launch Live Application</span>
                    <ArrowUpRight size={16} strokeWidth={2.5} />
                  </a>
                )}

                {hasGithub && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-5 rounded-2xl bg-neutral-900 border border-white/15 text-white font-medium text-sm flex items-center justify-center gap-2 hover:bg-neutral-800 hover:border-white/30 transition-all active:scale-[0.99]"
                  >
                    <Github size={16} />
                    <span>View Repository on GitHub</span>
                  </a>
                )}
              </div>

            </div>

            {/* Sticky Bottom Footer Meta */}
            <div className="p-6 border-t border-white/10 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between text-xs font-mono text-neutral-500">
              <div className="flex items-center gap-2">
                <Layers size={14} />
                <span>ID: {project.id ? project.id.slice(0, 8) : "local"}</span>
              </div>
              <button
                onClick={onClose}
                className="hover:text-white transition-colors cursor-pointer"
              >
                ESC TO CLOSE
              </button>
            </div>
          </aside>
        </div>

        {/* FULLSCREEN LIGHTBOX MODAL */}
        <AnimatePresence>
          {isLightboxOpen && (
            <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/95 backdrop-blur-xl select-none">
              {/* Click outside to close */}
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
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="max-w-full max-h-[82vh] flex items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={galleryImages[currentImageIndex]}
                      alt={`${project.title} full view`}
                      className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                    />
                  </motion.div>
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
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const lenis = useLenis();
  const isMounted = useIsMounted();

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

  if (!isMounted || !project) return null;

  return createPortal(
    <ProjectModalContent key={project.id} project={project} onClose={onClose} />,
    document.body
  );
}
