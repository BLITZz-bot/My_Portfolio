"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, CheckCircle } from "lucide-react";
import { submitComment, getApprovedComments } from "@/app/actions/comments";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import Link from "next/link";
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

export function Testimonials() {
  const [formData, setFormData] = useState({ name: "", email: "", role: "Client", designation: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [dbComments, setDbComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const comments = await getApprovedComments();
      if (comments) {
        setDbComments(comments);
      }
    } catch (e) {
      console.error("Error fetching comments:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadComments = async () => {
      await fetchComments();
    };
    loadComments();
  }, []);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setIsLoginModalOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setIsLoginModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await submitComment({
      ...formData,
      user_id: session?.user?.id
    });
    
    setIsSubmitting(true); // Keep submitting true briefly for effect
    setTimeout(() => setIsSubmitting(false), 500);
    
    if (result.success) {
      setIsModalOpen(false);
      setShowToast(true);
      setFormData({ name: "", email: "", role: "Client", designation: "", content: "" });
      fetchComments(); // Refresh list
    } else {
      alert(`Failed to submit comment: ${result.error || "Unknown error"}. Make sure your Supabase credentials are set up.`);
    }
  };

  const handleLeaveRecommendation = () => {
    if (session) {
      setFormData(prev => ({
        ...prev,
        name: session.user.user_metadata.full_name || "",
        email: session.user.email || ""
      }));
      setIsModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const displayComments = dbComments;
  const visibleComments = displayComments.slice(0, 2);

  const relationships = [
    "Teacher", "Mentor", "Teammate", "Hackathon Judge", 
    "Event Coordinator", "Client", "Other"
  ];

  return (
    <section id="testimonials" className="py-24 px-6 bg-transparent relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4 italic">WHAT PEOPLE <span className="text-neutral-500">SAY.</span></h2>
            <p className="text-neutral-500 max-w-md">
              FEEDBACK & RECOMMENDATIONS.<br />Read what clients, teammates, and mentors say about our collaboration.
            </p>
          </div>
          <Link href="/comments">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block px-6 py-3 border border-neutral-800 rounded-full text-sm font-bold text-white hover:bg-white hover:text-black transition-all cursor-pointer"
            >
              View All Recommendations
            </motion.div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Side: Display Testimonials */}
          <div>
            {isLoading ? (
              <div className="space-y-6">
                <CommentSkeleton />
                <CommentSkeleton />
              </div>
            ) : displayComments.length === 0 ? (
              <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-sm text-center py-16">
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No recommendations yet.</p>
                <p className="text-neutral-600 text-sm mt-2">Be the first to leave feedback on our collaboration!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {visibleComments.map((t, i) => (
                  <motion.div 
                    layout
                    key={t.id || t.name + i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: false, amount: 0.8 }}
                    className="p-8 rounded-3xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 relative group"
                  >
                    <p className="text-lg text-neutral-300 mb-6 italic">&quot;{t.content}&quot;</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-bold text-white">{t.name}</h4>
                        <p className="text-sm text-neutral-500">{t.designation ? `${t.designation} @ ` : ""}{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Redesigned CTA Card */}
          <div className="flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-10 rounded-[32px] bg-neutral-900/60 backdrop-blur-lg border border-white/5 w-full text-center relative group transform-gpu"
            >
              <div className="absolute inset-0 rounded-[32px] bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-neutral-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <MessageSquare className="text-neutral-400" size={32} />
                </div>
                <h3 className="text-3xl font-bold text-white tracking-tighter uppercase mb-4">Your Feedback Matters</h3>
                <p className="text-neutral-500 mb-8 max-w-sm mx-auto leading-relaxed">
                  Whether we&apos;ve worked together on a project, hackathon, event, or academic initiative, I&apos;d appreciate your thoughts.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLeaveRecommendation}
                  className="px-8 py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 mx-auto hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5"
                >
                  Leave a Recommendation
                  <Send size={18} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl transform-gpu p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-neutral-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                <CheckCircle className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tighter mb-2">Sign in to continue</h3>
              <p className="text-neutral-500 mb-8 text-sm">Please sign in with Google to leave a recommendation.</p>
              
              <button
                onClick={() => supabase?.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
                className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
                Continue with Google
              </button>
              
              <button 
                onClick={() => setIsLoginModalOpen(false)}
                className="mt-6 text-sm text-neutral-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Recommendation Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-xl bg-neutral-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl transform-gpu"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white tracking-tighter">Share Your Recommendation</h3>
                    <p className="text-neutral-500 mt-1 text-sm">Your feedback helps showcase my work, collaboration, and growth.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X size={20} className="text-neutral-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Full Name</label>
                      <input 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700 text-white"
                        placeholder="John Doe"
                      />
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Relationship</label>
                      <div className="relative">
                        <select 
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer text-white"
                        >
                          {relationships.map(rel => (
                            <option key={rel} value={rel}>{rel}</option>
                          ))}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 text-xs">▼</div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Email Address (Google Verified)</label>
                      <input 
                        required
                        type="email"
                        value={formData.email}
                        readOnly
                        className="w-full bg-neutral-950/50 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none text-neutral-500 cursor-not-allowed"
                      />
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Designation</label>
                      <input 
                        value={formData.designation}
                        onChange={(e) => setFormData({...formData, designation: e.target.value})}
                        className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700 text-white"
                        placeholder="e.g. HOD, Principal"
                      />
                    </motion.div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-1.5"
                  >
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Recommendation</label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all resize-none placeholder:text-neutral-700 text-white"
                      placeholder="Tell me about our collaboration..."
                    />
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-4 pt-2"
                  >
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-neutral-800 text-white font-bold rounded-2xl hover:bg-neutral-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5"
                    >
                      {isSubmitting ? "Submitting..." : (
                        <>
                          Submit Recommendation
                          <Send size={18} />
                        </>
                      )}
                    </button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed top-8 right-8 z-[60] flex items-center gap-4 bg-neutral-900 border border-white/10 p-4 pl-5 rounded-2xl shadow-2xl"
          >
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Success</p>
              <p className="text-neutral-500 text-xs">Thank you for your recommendation.</p>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="ml-4 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
