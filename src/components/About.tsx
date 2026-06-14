"use client";

import { motion, useInView, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Code2, Palette, Globe2, Zap, Sparkles, User, Trophy, Medal, Rocket, Terminal, Fingerprint } from "lucide-react";
import { Github, Linkedin } from "@/components/Icons";
import { cn } from "@/lib/utils";
import { getSettings } from "@/app/actions/admin";
import { Noise } from "@/components/Noise";

const skillIconMap: Record<string, { icon: any, color: string }> = {
  "react": { icon: Code2, color: "text-blue-400" },
  "next": { icon: Code2, color: "text-blue-400" },
  "typescript": { icon: Zap, color: "text-yellow-400" },
  "tailwind": { icon: Palette, color: "text-cyan-400" },
  "three": { icon: Globe2, color: "text-indigo-400" },
  "node": { icon: Code2, color: "text-green-400" },
  "default": { icon: Code2, color: "text-neutral-400" }
};

const getSkillConfig = (name: string) => {
  const lowerName = name.toLowerCase();
  for (const key in skillIconMap) {
    if (lowerName.includes(key)) return skillIconMap[key];
  }
  return skillIconMap.default;
};

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
} as const;

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 45,
    scale: 0.98
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 70, 
      damping: 14
    }
  }
} as const;

const statVariants = {
  hidden: { 
    opacity: 0, 
    y: 30, 
    scale: 0.96 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 90, 
      damping: 15 
    }
  }
} as const;

function AnimatedStat({ value, suffix, label, delay = 0, icon: Icon }: { value: number, suffix: string, label: string, delay?: number, icon: any }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isInView) {
      const duration = value < 5 ? 1 : 1.5; 
      const controls = animate(0, value, {
        duration: duration,
        ease: "easeOut",
        onUpdate: (latestValue) => setCount(Math.round(latestValue)),
        onComplete: () => setIsDone(true)
      });
      return () => controls.stop();
    }
  }, [isInView, value]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <motion.div
      ref={ref}
      variants={statVariants}
      whileHover={{ 
        y: -5, 
        boxShadow: "0 10px 30px -10px rgba(255,255,255,0.1)", 
        borderColor: "rgba(255,255,255,0.2)",
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      onMouseMove={handleMouseMove}
      className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-center items-center text-center transition-all duration-300 flex-1 w-full relative overflow-hidden group/stat"
    >
      {/* Hover Spotlight Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.03)_0%,transparent_50%)] group-hover/stat:opacity-100 opacity-0 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <motion.div 
          animate={ isDone ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.4 }}
          className="text-4xl md:text-5xl font-bold mb-2 tracking-tighter italic text-white"
          style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
        >
          {count}{suffix}
        </motion.div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{label}</div>
      </div>
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover/stat:opacity-[0.08] group-hover/stat:scale-110 transition-all duration-700 pointer-events-none">
        <Icon size={120} className="text-white" />
      </div>
    </motion.div>
  );
}

export function About() {
  const [data, setData] = useState({
    about_text: "Computer Science student passionate about full-stack development, AI, and building modern digital experiences. Experienced in developing and deploying web applications, participating in competitive hackathons, and creating solutions that address real-world challenges. Recognized with four hackathon victories and a Best Implementation Award for innovation, technical execution, and problem-solving excellence.",
    projects_built: 12,
    hackathons_won: 4,
    awards_won: 1,
    skills: [],
    vision_text: "Passionate about photography, exploring new tech stacks, and dreaming of building an AI-driven platform that makes education accessible to everyone worldwide."
  });

  useEffect(() => {
    const loadData = async () => {
      const settings = await getSettings();
      if (settings) {
        setData(settings as any);
      }
    };
    loadData();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section id="about" className="py-24 px-6 bg-transparent relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.22 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
          >
            {/* Identity Card - NEW DESIGN */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ 
                y: -6, 
                borderColor: "rgba(255,255,255,0.15)",
                transition: { duration: 0.2, ease: "easeOut" } 
              }}
              onMouseMove={handleMouseMove}
              className="md:col-span-2 p-10 rounded-[40px] bg-neutral-900 border border-neutral-800 flex flex-col justify-between relative overflow-hidden group/id"
            >
              {/* Subtle Tech Grid Background */}
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ 
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                  backgroundSize: '24px 24px'
                }}
              />
              
              {/* Hover Spotlight Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.03)_0%,transparent_50%)] group-hover/id:opacity-100 opacity-0 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row gap-8">
                {/* Vertical Side Tab */}
                <div className="hidden md:flex flex-col items-center justify-between py-2">
                  <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-neutral-800 to-transparent" />
                  <span className="[writing-mode:vertical-lr] text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-600 rotate-180 py-4">Profile</span>
                  <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-neutral-800 to-transparent" />
                </div>

                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">ABOUT <span className="text-neutral-500">ME</span></h2>
                  <p className="text-neutral-400 text-lg leading-relaxed whitespace-pre-line">
                    {data.about_text}
                  </p>
                  
                  <div className="mt-12 flex items-center gap-6">
                    <div className="flex gap-3">
                      <a 
                        href="https://www.linkedin.com/in/bharath-m-m-a9960b309/" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all border border-white/5 hover:border-white/10"
                      >
                        <Linkedin size={18} />
                      </a>
                      <a 
                        href="https://github.com/BLITZz-bot" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-11 h-11 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all border border-white/5 hover:border-white/10"
                      >
                        <Github size={18} />
                      </a>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2 text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Available for Projects
                    </div>
                  </div>
                </div>
              </div>

              {/* Watermark Fingerprint */}
              <div className="absolute -right-12 -bottom-12 opacity-[0.04] group-hover/id:opacity-[0.08] group-hover/id:scale-105 group-hover/id:-rotate-12 transition-all duration-1000 pointer-events-none">
                <Fingerprint size={380} className="text-white" />
              </div>
            </motion.div>

            {/* Stats Column */}
            <motion.div 
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08
                  }
                }
              }}
              className="flex flex-col gap-6 h-full"
            >
              <AnimatedStat value={data.projects_built} suffix="+" label="Projects Built" icon={Rocket} />
              <AnimatedStat value={data.hackathons_won} suffix="x" label="Hackathon Winner" icon={Trophy} />
              <AnimatedStat value={data.awards_won} suffix="x" label="Innovation Awards" icon={Medal} />
            </motion.div>

            {/* Skills Card */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ 
                y: -6, 
                borderColor: "rgba(255,255,255,0.15)",
                transition: { duration: 0.2, ease: "easeOut" } 
              }}
              onMouseMove={handleMouseMove}
              className="p-10 rounded-[32px] bg-neutral-900 border border-neutral-800 relative overflow-hidden group"
            >
              {/* Hover Spotlight Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.03)_0%,transparent_50%)] group-hover:opacity-100 opacity-0 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500 mb-8">TECH STACK</h3>
                <div className="space-y-5">
                  {(data.skills || []).length === 0 ? (
                    <p className="text-neutral-500 text-sm italic">No tech stack added yet.</p>
                  ) : (
                    (data.skills || []).map((skillName: string) => {
                      const config = getSkillConfig(skillName);
                      return (
                        <div key={skillName} className="flex items-center gap-4 group/skill">
                          <div className={cn("p-3 rounded-xl bg-neutral-800 border border-white/5 transition-transform group-hover/skill:scale-110 duration-300", config.color)}>
                            <config.icon size={18} />
                          </div>
                          <span className="font-bold text-white tracking-tight">{skillName}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              <div className="absolute -right-16 -bottom-16 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-1000 pointer-events-none">
                <Terminal size={350} className="text-white" />
              </div>
            </motion.div>

            {/* Vision & Vibes Card */}
            <motion.div 
              variants={cardVariants}
              whileHover={{ 
                y: -6, 
                borderColor: "rgba(255,255,255,0.15)",
                transition: { duration: 0.2, ease: "easeOut" } 
              }}
              onMouseMove={handleMouseMove}
              className="md:col-span-2 p-10 rounded-[32px] bg-neutral-900 border border-neutral-800 flex flex-col justify-between overflow-hidden relative group"
            >
              {/* Hover Spotlight Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x,50%)_var(--mouse-y,50%),rgba(255,255,255,0.03)_0%,transparent_50%)] group-hover:opacity-100 opacity-0 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">ACHIEVEMENT & <span className="text-neutral-500">HOBBIES</span></h2>
                <p className="text-neutral-400 text-lg leading-relaxed whitespace-pre-line">
                  {data.vision_text}
                </p>
              </div>
              <div className="absolute -right-20 -bottom-20 opacity-[0.05] group-hover:opacity-[0.1] group-hover:scale-110 transition-all duration-1000 pointer-events-none">
                <Sparkles size={450} className="text-white" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
