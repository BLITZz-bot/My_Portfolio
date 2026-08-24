"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Github } from "@/components/Icons";
import { projects as staticProjects, Project } from "@/lib/projects";
import Link from "next/link";
import { getProjects } from "@/app/actions/admin";
import Image from "next/image";
import { ProjectModal } from "@/components/ProjectModal";

const ProjectSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-video w-full rounded-3xl bg-neutral-900 border border-neutral-800/40" />
    <div className="mt-6 space-y-2">
      <div className="h-6 w-2/3 bg-neutral-900 rounded-lg" />
      <div className="h-4 w-1/4 bg-neutral-900 rounded-lg" />
    </div>
  </div>
);

export function Projects() {
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

  const fetchProjectsData = async () => {
    setIsLoading(true);
    try {
      const data = await getProjects();
      if (data && data.length > 0) {
        setDbProjects(data as unknown as Project[]);
      }
    } catch (e) {
      console.error("Error fetching projects:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchProjectsData();
    };
    loadData();
  }, []);

  const displayProjects = dbProjects.length > 0 ? dbProjects : staticProjects;

  return (
    <section id="projects" className="py-24 px-6 bg-transparent relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.22 }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
              className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white"
            >
              THINGS I&apos;VE <span className="text-neutral-500">BUILT.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.22 }}
              transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.1 }}
              className="text-neutral-500 max-w-md"
            >
              CREATE TO INSPIRE.<br />A curated collection of projects where I&apos;ve combined technical excellence with creative design.
            </motion.p>
          </div>
          <Link href="/projects" className="w-full md:w-auto">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full md:w-auto px-6 py-3 border border-neutral-800 rounded-full text-sm font-bold text-white hover:bg-white hover:text-black transition-all cursor-pointer text-center"
            >
              View All Projects
            </motion.div>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProjectSkeleton />
            <ProjectSkeleton />
          </div>
        ) : displayProjects.length === 0 ? (
          <div className="w-full text-center py-20 bg-neutral-900/40 border border-white/5 rounded-[32px] backdrop-blur-sm">
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No projects showcase available yet.</p>
            <p className="text-neutral-600 text-sm mt-2">Check back soon or contact the admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayProjects.slice(0, 4).map((project, index) => (
              <motion.div
                key={project.id || project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: false, amount: 0.22 }}
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
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
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
                      className="p-5 bg-white text-black rounded-full shadow-xl shadow-white/10 transition-colors hover:bg-neutral-200 cursor-pointer"
                      title="View Details"
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
                        className="p-5 bg-neutral-800 text-white rounded-full border border-white/10 shadow-xl shadow-black/50 transition-colors hover:border-white/30 cursor-pointer"
                        title="View Source Code"
                      >
                        <Github size={24} />
                      </motion.a>
                    )}
                  </motion.div>
                </div>
                
                <div className="mt-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-neutral-400 transition-colors">{project.title}</h3>
                    <p className="text-sm text-neutral-500 mt-1 uppercase tracking-widest font-medium">{project.category}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Redesigned Full-Screen Case Study Project Details Modal */}
      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </section>
  );
}
