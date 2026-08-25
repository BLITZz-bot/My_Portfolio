"use client";

import { motion } from "framer-motion";
import { ExperienceTimeline } from "@/components/ExperienceTimeline";

export function Experience() {
  return (
    <section id="experience" className="relative scroll-mt-16 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 border-b border-white/10 pb-9">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold tracking-tighter text-white md:text-6xl"
            >
              WHERE I&apos;VE <span className="text-neutral-500">WORKED.</span>
            </motion.h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-500">
              Selected roles, teams, and the work that has shaped my approach to building products.
            </p>
          </div>
        </div>
        <ExperienceTimeline />
      </div>
    </section>
  );
}
