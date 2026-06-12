"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Star, Send, X, CheckCircle, Trash2, Check } from "lucide-react";
import { submitComment, getApprovedComments, approveComment, deleteComment } from "@/app/actions/comments";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

interface Comment {
  id: string;
  name: string;
  role: string;
  designation?: string;
  content: string;
  approved: boolean;
  stars?: number;
}

export function Testimonials() {
  const [formData, setFormData] = useState({ name: "", email: "", role: "Client", designation: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [dbComments, setDbComments] = useState<Comment[]>([]);
  
  // Use env var for admin check. User should set NEXT_PUBLIC_ADMIN_EMAIL in .env
  const isAdmin = !!session?.user?.email && session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const fetchComments = async () => {
    const comments = await getApprovedComments();
    if (comments) {
      setDbComments(comments);
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
      alert("Failed to submit comment. Make sure your Supabase credentials are set up.");
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

  const handleApprove = async (id: string) => {
    if (!session?.user?.email) return;
    const result = await approveComment(id, session.user.email);
    if (result.success) {
      fetchComments();
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.user?.email) return;
    if (confirm("Are you sure you want to delete this recommendation?")) {
      const result = await deleteComment(id, session.user.email);
      if (result.success) {
        fetchComments();
      }
    }
  };

  const displayComments = dbComments.length > 0 
    ? dbComments 
    : [
        {
          id: "1",
          name: "Sarah Johnson",
          role: "CEO, TechFlow",
          designation: "Founder",
          content: "The attention to detail and animation quality is outstanding. One of the best developers I've worked with.",
          stars: 5,
          approved: true,
        },
        {
          id: "2",
          name: "Michael Chen",
          role: "Art Director, Creative Labs",
          designation: "Principal",
          content: "Transformed our vision into a fluid, interactive reality. The performance on mobile is particularly impressive.",
          stars: 5,
          approved: true,
        },
      ];

  const relationships = [
    "Teacher", "Mentor", "Teammate", "Hackathon Judge", 
    "Event Coordinator", "Client", "Other"
  ];

  return (
    <section id="testimonials" className="py-24 px-6 bg-neutral-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Side: Display Testimonials */}
          <div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-8 italic">WHAT PEOPLE <span className="text-neutral-500">SAYS.</span></h2>
            <div className="space-y-6">
              {displayComments.map((t, i) => (
                <motion.div 
                  key={t.name + i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-3xl bg-neutral-900/50 backdrop-blur-md border border-neutral-800 relative group"
                >
                  <div className="flex gap-1 mb-4 text-yellow-500">
                    {[...Array(t.stars || 5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  </div>
                  <p className="text-lg text-neutral-300 mb-6 italic">&quot;{t.content}&quot;</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-bold text-white">{t.name}</h4>
                      <p className="text-sm text-neutral-500">{t.designation ? `${t.designation} @ ` : ""}{t.role}</p>
                    </div>
                    
                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="flex gap-2">
                        {!t.approved && (
                          <button 
                            onClick={() => handleApprove(t.id)}
                            className="p-2 bg-green-500/10 text-green-500 rounded-full hover:bg-green-500/20 transition-colors"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
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
                      <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Email Address</label>
                      <input 
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-neutral-700 text-white"
                        placeholder="john@example.com"
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
