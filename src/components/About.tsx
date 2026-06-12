"use client";

import { motion, useInView, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Code2, Palette, Globe2, Zap } from "lucide-react";
import { Github, Twitter, Linkedin } from "@/components/Icons";
import { cn } from "@/lib/utils";

const skills = [
  { name: "React / Next.js", icon: Code2, color: "text-blue-400" },
  { name: "TypeScript", icon: Zap, color: "text-yellow-400" },
  { name: "Tailwind CSS", icon: Palette, color: "text-cyan-400" },
  { name: "Three.js", icon: Globe2, color: "text-indigo-400" },
];

function AnimatedStat({ value, suffix, label, delay = 0 }: { value: number, suffix: string, label: string, delay?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (isInView) {
      // Dynamic duration: small numbers count slightly faster so they don't feel stuck
      const duration = value < 5 ? 1 : 1.5; 

      const controls = animate(0, value, {
        duration: duration,
        ease: "easeOut",
        onUpdate: (latestValue) => {
          setCount(Math.round(latestValue));
        },
        onComplete: () => {
          setIsDone(true);
        }
      });

      return () => controls.stop();
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.3)" }}
      viewport={{ once: true }}
      className="p-6 rounded-3xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 flex flex-col justify-center items-center text-center transition-all duration-300 flex-1 w-full"
    >
      <motion.div 
        animate={ isDone ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.4 }}
        className="text-4xl md:text-5xl font-bold mb-2 tracking-tighter italic text-white"
        style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}
      >
        {count}{suffix}
      </motion.div>
      <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">{label}</div>
    </motion.div>
  );
}

export function About() {
  return (
    <section id="about" className="py-24 px-6 bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Bio Card */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="md:col-span-2 p-8 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-3xl font-bold mb-4 tracking-tight">I bridge the gap between design and engineering.</h2>
                <p className="text-neutral-400 text-lg leading-relaxed">
                 Computer Science student passionate about full-stack development, AI, and building modern digital experiences. Experienced in developing and deploying web applications, participating in competitive hackathons, and creating solutions that address real-world challenges. Recognized with four hackathon victories and a Best Implementation Award for innovation, technical execution, and problem-solving excellence.
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <a href="#" className="p-3 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all">
                  <Github size={20} />
                </a>
                <a href="#" className="p-3 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all">
                  <Twitter size={20} />
                </a>
                <a href="#" className="p-3 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all">
                  <Linkedin size={20} />
                </a>
              </div>
            </motion.div>

            {/* Stats Column */}
            <div className="flex flex-col gap-6 h-full">
              <AnimatedStat value={12} suffix="+" label="Projects Built" delay={0.1} />
              <AnimatedStat value={4} suffix="x" label="Hackathon Winner" delay={0.2} />
              <AnimatedStat value={1} suffix="x" label="Best Implementation Award" delay={0.3} />
            </div>

            {/* Skills Card */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6">Expertise</h3>
              <div className="space-y-4">
                {skills.map((skill) => (
                  <div key={skill.name} className="flex items-center gap-4">
                    <div className={cn("p-2 rounded-lg bg-neutral-800", skill.color)}>
                      <skill.icon size={18} />
                    </div>
                    <span className="font-medium">{skill.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Location Card */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="md:col-span-2 p-8 rounded-3xl bg-neutral-900 border border-neutral-800 flex flex-col justify-between overflow-hidden relative group"
            >
              <div className="relative z-10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-2">Location</h3>
                <div className="text-2xl font-bold">Bangkok, Thailand</div>
                <p className="text-neutral-500 mt-2 italic text-sm">Working remotely worldwide.</p>
              </div>
              <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Globe2 size={400} className="absolute -right-20 -bottom-20" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
