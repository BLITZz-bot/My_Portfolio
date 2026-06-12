"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Github } from "@/components/Icons";
import { projects as staticProjects, Project } from "@/lib/projects";
import Link from "next/link";
import { getProjects } from "@/app/actions/admin";

export function Projects() {
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchProjectsData = async () => {
    const data = await getProjects();
    if (data && data.length > 0) {
      setDbProjects(data as unknown as Project[]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchProjectsData();
    };
    loadData();
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProject(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const nextImage = () => {
    if (!selectedProject) return;
    setCurrentImageIndex((prev) => (prev + 1) % selectedProject.gallery.length);
  };

  const prevImage = () => {
    if (!selectedProject) return;
    setCurrentImageIndex((prev) => (prev - 1 + selectedProject.gallery.length) % selectedProject.gallery.length);
  };

  const displayProjects = dbProjects.length > 0 ? dbProjects : staticProjects;

  return (
    <section id="projects" className="py-24 px-6 bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white">THINGS I&apos;VE <span className="text-neutral-500">BUILT.</span></h2>
            <p className="text-neutral-500 max-w-md">
              CREATE TO INSPIRE.<br />A curated collection of projects where I&apos;ve combined technical excellence with creative design.
            </p>
          </div>
          <Link href="/projects">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block px-6 py-3 border border-neutral-800 rounded-full text-sm font-bold text-white hover:bg-white hover:text-black transition-all cursor-pointer"
            >
              View All Projects
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayProjects.slice(0, 4).map((project, index) => (
            <motion.div
              key={project.id || project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative aspect-video overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800">
                <img 
                  src={project.thumbnail} 
                  alt={project.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center gap-4"
                >
                  <motion.button 
                    onClick={() => {
                      setSelectedProject(project);
                      setCurrentImageIndex(0);
                    }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-5 bg-white text-black rounded-full shadow-xl shadow-white/10 transition-colors hover:bg-neutral-200"
                    title="View Details"
                  >
                    <ExternalLink size={24} strokeWidth={2.5} />
                  </motion.button>
                  <motion.a 
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-5 bg-neutral-800 text-white rounded-full border border-white/10 shadow-xl shadow-black/50 transition-colors hover:border-white/30"
                    title="View Source Code"
                  >
                    <Github size={24} />
                  </motion.a>
                </motion.div>
              </div>
              
              <div className="mt-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold group-hover:text-neutral-400 transition-colors">{project.title}</h3>
                  <p className="text-sm text-neutral-500 mt-1 uppercase tracking-widest font-medium">{project.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 py-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-5xl bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl transform-gpu flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 z-20 p-3 bg-black/50 backdrop-blur-md text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Left Side: Gallery Carousel */}
              <div className="w-full md:w-3/5 bg-neutral-950 relative aspect-video md:aspect-auto overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={selectedProject.gallery[currentImageIndex]}
                    alt={`${selectedProject.title} screenshot ${currentImageIndex + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-contain"
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
              <div className="w-full md:w-2/5 p-8 md:p-12 overflow-y-auto custom-scrollbar">
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
                        className="flex-1 py-4 bg-white text-black text-center font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5"
                      >
                        Live Demo
                        <ExternalLink size={18} />
                      </a>
                    )}
                    <a 
                      href={selectedProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 py-4 bg-neutral-800 text-white text-center font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-700 transition-colors ${!(selectedProject.link && selectedProject.link !== "#") ? "w-full" : ""}`}
                    >
                      Github
                      <Github size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
