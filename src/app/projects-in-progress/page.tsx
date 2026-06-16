"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { Github } from "@/components/Icons";
import { Project } from "@/lib/projects";
import Link from "next/link";
import { getOngoingProjects } from "@/app/actions/admin";
import Image from "next/image";
import { Noise } from "@/components/Noise";
import { useLenis } from "lenis/react";

const ProjectSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-video w-full rounded-3xl bg-neutral-900 border border-neutral-800/40" />
    <div className="mt-6 space-y-2">
      <div className="h-6 w-2/3 bg-neutral-900 rounded-lg" />
      <div className="h-4 w-1/4 bg-neutral-900 rounded-lg" />
    </div>
  </div>
);

export default function OngoingProjectsPage() {
  const lenis = useLenis();
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchProjectsData = async () => {
    setIsLoading(true);
    try {
      const data = await getOngoingProjects();
      if (data && data.length > 0) {
        setDbProjects(data as unknown as Project[]);
      }
    } catch (e) {
      console.error("Error fetching ongoing projects:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
      await fetchProjectsData();
    };
    loadData();
  }, []);

  const closeModal = useCallback(() => {
    setSelectedProject(null);
    setIsLightboxOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    if (!selectedProject) return;
    setCurrentImageIndex((prev) => (prev + 1) % selectedProject.gallery.length);
  }, [selectedProject]);

  const prevImage = useCallback(() => {
    if (!selectedProject) return;
    setCurrentImageIndex((prev) => (prev - 1 + selectedProject.gallery.length) % selectedProject.gallery.length);
  }, [selectedProject]);

  // Handle keyboard events for modal & lightbox
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        } else {
          closeModal();
        }
      } else if (event.key === "ArrowRight" && isLightboxOpen) {
        nextImage();
      } else if (event.key === "ArrowLeft" && isLightboxOpen) {
        prevImage();
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isLightboxOpen, closeModal, nextImage, prevImage]);

  useEffect(() => {
    if (selectedProject) {
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
  }, [selectedProject, lenis]);

  return (
    <div className="min-h-screen bg-neutral-950 pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Grainy Noise Background */}
      <Noise />

      {/* Radial Vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <Link 
              href="/#ongoing-projects" 
              className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase italic">
              CURRENTLY <span className="text-neutral-500">INITIATIVES.</span>
            </h1>
            <p className="text-neutral-500 max-w-md mt-4">
              A comprehensive showcase of projects that I am currently working on, researching, or actively developing.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold tracking-widest text-neutral-800 uppercase tabular-nums">
              {dbProjects.length} INITIATIVES TOTAL
            </p>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProjectSkeleton />
            <ProjectSkeleton />
            <ProjectSkeleton />
          </div>
        ) : dbProjects.length === 0 ? (
          <div className="w-full text-center py-32 bg-neutral-900/40 border border-white/5 rounded-[40px] backdrop-blur-sm">
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">Initiatives vault is empty.</p>
            <p className="text-neutral-600 text-sm mt-2">No active initiatives have been published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dbProjects.map((project, index) => (
              <motion.div
                key={project.id || project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative"
              >
                <div 
                  className="relative aspect-video overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 cursor-pointer"
                  onClick={() => {
                    if (isMobile) {
                      setSelectedProject(project);
                      setCurrentImageIndex(0);
                    }
                  }}
                >
                  <Image 
                    src={project.thumbnail} 
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover md:grayscale md:group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                  
                  {/* Overlay - Hidden on mobile, visible on desktop hover */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hidden md:flex absolute inset-0 bg-black/60 backdrop-blur-[2px] items-center justify-center gap-4"
                  >
                    <motion.button 
                      onClick={() => {
                        setSelectedProject(project);
                        setCurrentImageIndex(0);
                      }}
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-5 bg-white text-black rounded-full shadow-xl shadow-white/10"
                    >
                      <ExternalLink size={24} strokeWidth={2.5} />
                    </motion.button>
                    {project.github && project.github !== "#" && (
                      <motion.a 
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-5 bg-neutral-800 text-white rounded-full border border-white/10 shadow-xl shadow-black/50"
                      >
                        <Github size={24} />
                      </motion.a>
                    )}
                  </motion.div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-neutral-400 transition-colors uppercase tracking-tight">{project.title}</h3>
                  <p className="text-sm text-neutral-500 mt-1 uppercase tracking-widest font-medium">{project.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 py-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-6xl bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl transform-gpu flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={closeModal}
                className="absolute top-6 right-6 z-20 p-3 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Left Side: Gallery Carousel */}
              <div className="w-full md:w-[65%] bg-neutral-950 relative aspect-video md:aspect-auto overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={selectedProject.gallery[currentImageIndex]}
                    alt={`${selectedProject.title} screenshot ${currentImageIndex + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                </AnimatePresence>

                {/* Carousel Navigation */}
                {selectedProject.gallery.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-black/80 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-black/80 transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                    
                    {/* Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                      {selectedProject.gallery.map((_, i) => (
                        <div 
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? "bg-white w-6" : "bg-white/30"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right Side: Details */}
              <div className="w-full md:w-[35%] p-8 md:p-12 overflow-y-auto custom-scrollbar bg-neutral-900/50" data-lenis-prevent>
                <div className="mb-8">
                  <p className="text-sm text-neutral-500 uppercase tracking-widest font-medium mb-2">{selectedProject.category}</p>
                  <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tighter uppercase">{selectedProject.title}</h3>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-3">Overview</h4>
                    <p className="text-neutral-300 leading-relaxed text-sm">
                      {selectedProject.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-3">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map(tech => (
                        <span key={tech} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-neutral-400">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    {selectedProject.link && selectedProject.link !== "#" && (
                      <a 
                        href={selectedProject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 py-4 bg-white text-black text-center font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5 ${!(selectedProject.github && selectedProject.github !== "#") ? "w-full" : ""}`}
                      >
                        Live Demo
                        <ExternalLink size={18} />
                      </a>
                    )}
                    {selectedProject.github && selectedProject.github !== "#" && (
                      <a 
                        href={selectedProject.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 py-4 bg-neutral-800 text-white text-center font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors ${!(selectedProject.link && selectedProject.link !== "#") ? "w-full" : ""}`}
                      >
                        Github
                        <Github size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Lightbox Overlay */}
      <AnimatePresence>
        {selectedProject && isLightboxOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
              className="absolute inset-0 cursor-zoom-out"
            />
            
            {/* Close button */}
            <button 
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 z-20 p-3 bg-neutral-900/50 backdrop-blur-md text-white rounded-full hover:bg-neutral-800 transition-colors border border-white/10"
            >
              <X size={24} />
            </button>

            {/* Lightbox Image Container */}
            <div className="relative max-w-7xl max-h-[85vh] w-full px-6 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={selectedProject.gallery[currentImageIndex]}
                  alt={`${selectedProject.title} screenshot ${currentImageIndex + 1}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-full max-h-[80vh] object-contain rounded-xl select-none pointer-events-none"
                />
              </AnimatePresence>

              {/* Navigation Arrows */}
              {selectedProject.gallery.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-10 p-4 bg-neutral-900/50 backdrop-blur-md text-white rounded-full hover:bg-neutral-800 transition-colors border border-white/5"
                  >
                    <ChevronLeft size={28} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-10 p-4 bg-neutral-900/50 backdrop-blur-md text-white rounded-full hover:bg-neutral-800 transition-colors border border-white/5"
                  >
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>

            {/* Indicators */}
            <div className="absolute bottom-6 flex flex-col items-center gap-2">
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-widest">
                Image {currentImageIndex + 1} / {selectedProject.gallery.length}
              </span>
              {selectedProject.gallery.length > 1 && (
                <div className="flex gap-2">
                  {selectedProject.gallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? "bg-white w-6" : "bg-white/30"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
