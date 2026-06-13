"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getApprovedComments } from "@/app/actions/comments";
import { Noise } from "@/components/Noise";

interface Comment {
  id: string;
  name: string;
  role: string;
  designation?: string;
  content: string;
  approved: boolean;
}

const CommentSkeleton = () => (
  <div className="p-8 rounded-3xl bg-neutral-900/30 border border-neutral-800/40 animate-pulse space-y-4">
    <div className="h-4 w-5/6 bg-neutral-900 rounded-md" />
    <div className="h-4 w-4/6 bg-neutral-900 rounded-md" />
    <div className="flex justify-between items-end pt-4">
      <div className="space-y-2 w-1/3">
        <div className="h-5 bg-neutral-900 rounded-md" />
        <div className="h-3 w-2/3 bg-neutral-900 rounded-md" />
      </div>
    </div>
  </div>
);

export default function CommentsPage() {
  const [dbComments, setDbComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true);
      try {
        const data = await getApprovedComments();
        if (data) {
          setDbComments(data as Comment[]);
        }
      } catch (e) {
        console.error("Error loading comments:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadComments();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Grainy Noise Background */}
      <Noise patternAlpha={15} />

      {/* Radial Vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <Link 
              href="/#testimonials" 
              className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase italic">
              All <span className="text-neutral-500">Feedback.</span>
            </h1>
            <p className="text-neutral-500 max-w-md mt-4">
              Recommendations and feedback from clients, mentors, and teammates.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold tracking-widest text-neutral-800 uppercase tabular-nums">
              {dbComments.length} RECOMMENDATIONS TOTAL
            </p>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        ) : dbComments.length === 0 ? (
          <div className="w-full text-center py-32 bg-neutral-900/40 border border-white/5 rounded-[40px] backdrop-blur-sm">
            <p className="text-neutral-500 font-bold uppercase tracking-widest text-sm">No recommendations yet.</p>
            <p className="text-neutral-600 text-sm mt-2">No feedback has been published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dbComments.map((t, i) => (
              <motion.div 
                key={t.id || t.name + i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="p-8 rounded-3xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 relative group flex flex-col justify-between"
              >
                <p className="text-lg text-neutral-300 mb-6 italic leading-relaxed">&quot;{t.content}&quot;</p>
                <div>
                  <h4 className="font-bold text-white text-lg">{t.name}</h4>
                  <p className="text-sm text-neutral-500">{t.designation ? `${t.designation} @ ` : ""}{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
