"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { Github } from "@/components/Icons";
import { Project } from "@/types/project";
import Link from "next/link";
import Image from "next/image";
import { Noise } from "@/components/Noise";
import { ProjectModal } from "@/components/ProjectModal";

interface ProjectCatalogProps {
  backHref: string;
  scrollRestoreTarget: string;
  titleLeading: string;
  titleTrailing: string;
  description: string;
  countLabel: string;
  emptyTitle: string;
  emptySub: string;
  fetchProjects: () => Promise<Project[]>;
  fallbackProjects?: Project[];
}

const ProjectSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-video w-full rounded-3xl bg-neutral-900 border border-neutral-800/40" />
    <div className="mt-6 space-y-2">
      <div className="h-6 w-2/3 bg-neutral-900 rounded-lg" />
      <div className="h-4 w-1/4 bg-neutral-900 rounded-lg" />
    </div>
  </div>
);

export function ProjectCatalog({
  backHref,
  scrollRestoreTarget,
  titleLeading,
  titleTrailing,
  description,
  countLabel,
  emptyTitle,
  emptySub,
  fetchProjects,
  fallbackProjects = [],
}: ProjectCatalogProps) {
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    let isSubscribed = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProjects();
        if (isSubscribed && data && data.length > 0) {
          setDbProjects(data);
        }
      } catch (e) {
        console.error("Error fetching projects:", e);
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isSubscribed = false;
    };
  }, [fetchProjects]);

  const displayProjects = dbProjects.length > 0 ? dbProjects : fallbackProjects;

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
              href={backHref}
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("scroll_restore_target", scrollRestoreTarget);
                }
              }}
              className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase italic">
              {titleLeading} <span className="text-neutral-500">{titleTrailing}</span>
            </h1>
            <p className="text-neutral-500 max-w-md mt-4">
              {description}
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold tracking-widest text-neutral-800 uppercase tabular-nums">
              {displayProjects.length} {countLabel}
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
        ) : displayProjects.length === 0 ? (
          <div className="w-full text-center py-32 bg-neutral-900/40 border border-white/5 rounded-[40px] backdrop-blur-sm">
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">{emptyTitle}</p>
            <p className="text-neutral-600 text-sm mt-2">{emptySub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProjects.map((project, index) => (
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
                      }}
                      whileHover={{ scale: 1.1, y: -5 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-5 bg-white text-black rounded-full shadow-xl shadow-white/10 cursor-pointer"
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
                        className="p-5 bg-neutral-800 text-white rounded-full border border-white/10 shadow-xl shadow-black/50 cursor-pointer"
                      >
                        <Github size={24} />
                      </motion.a>
                    )}
                  </motion.div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-white group-hover:text-neutral-400 transition-colors uppercase tracking-tight">
                    {project.title}
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1 uppercase tracking-widest font-medium">
                    {project.category}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Case Study Project Details Modal */}
      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </div>
  );
}
