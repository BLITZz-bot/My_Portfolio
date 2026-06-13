"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  Briefcase, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Loader2, 
  LogOut, 
  Globe,
  LayoutDashboard,
  Upload,
  Pencil,
  MessageSquare,
  Check,
  XCircle,
  Download,
  Menu,
  X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { getSettings, updateSettings, getProjects, addProject, deleteProject, updateProject } from "@/app/actions/admin";
import { getAllComments, approveComment, deleteComment } from "@/app/actions/comments";
import { Project } from "@/lib/projects";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SettingsData {
  about_text: string;
  projects_built: number;
  hackathons_won: number;
  awards_won: number;
  skills: string[];
  vision_text: string;
  resume_url?: string;
}

interface Comment {
  id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  content: string;
  approved: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<"settings" | "projects" | "comments">("settings");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Form States
  const [settingsData, setSettingsData] = useState<SettingsData>({
    about_text: "Computer Science student passionate about full-stack development, AI, and building modern digital experiences. Experienced in developing and deploying web applications, participating in competitive hackathons, and creating solutions that address real-world challenges. Recognized with four hackathon victories and a Best Implementation Award for innovation, technical execution, and problem-solving excellence.",
    projects_built: 12,
    hackathons_won: 4,
    awards_won: 1,
    skills: ["React / Next.js", "TypeScript", "Tailwind CSS", "Three.js"],
    vision_text: "Passionate about photography, exploring new tech stacks, and dreaming of building an AI-driven platform that makes education accessible to everyone worldwide.",
    resume_url: ""
  });

  const [skillsInput, setSkillsInput] = useState(settingsData.skills.join(", "));

  const [projectData, setProjectData] = useState({
    title: "",
    category: "",
    description: "",
    thumbnail: "",
    gallery: "",
    technologies: "",
    link: "",
    github: ""
  });

  const isAdmin = !!session?.user?.email && session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail" | "gallery") => {
    const files = e.target.files;
    if (!files || files.length === 0 || !supabase) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio_images')
        .upload(filePath, file);

      if (uploadError) {
        alert("Upload failed: " + uploadError.message);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('portfolio_images')
        .getPublicUrl(filePath);
      
      uploadedUrls.push(publicUrl);
    }

    if (field === "thumbnail") {
      setProjectData(prev => ({ ...prev, thumbnail: uploadedUrls[0] }));
    } else {
      const currentGallery = projectData.gallery ? projectData.gallery.split(",").map(s => s.trim()) : [];
      const newGallery = [...currentGallery, ...uploadedUrls].filter(s => s !== "").join(", ");
      setProjectData(prev => ({ ...prev, gallery: newGallery }));
    }

    setIsUploading(false);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `resume_${Date.now()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio_images')
      .upload(filePath, file);

    if (uploadError) {
      alert("Resume upload failed: " + uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('portfolio_images')
      .getPublicUrl(filePath);
    
    setSettingsData(prev => ({ ...prev, resume_url: publicUrl }));
    setIsUploading(false);
  };

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    const [settings, projectList, commentList] = await Promise.all([
      getSettings(),
      getProjects(),
      getAllComments()
    ]);

    if (settings) {
      setSettingsData(settings as SettingsData);
      if ((settings as any).skills) {
        setSkillsInput((settings as any).skills.join(", "));
      }
    }
    if (projectList) setProjects(projectList as unknown as Project[]);
    if (commentList) setComments(commentList as Comment[]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadAllData();
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadAllData();
    });

    return () => subscription.unsubscribe();
  }, [loadAllData]);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    setIsSubmitting(true);
    
    const finalData = {
      ...settingsData,
      skills: skillsInput.split(",").map(s => s.trim()).filter(s => s !== "")
    };

    const result = await updateSettings(finalData, session.access_token);
    setIsSubmitting(false);
    if (result.success) {
      setIsEditing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setSettingsData(finalData);
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    setIsSubmitting(true);

    const submissionData = {
      ...projectData,
      gallery: projectData.gallery.split(",").map(s => s.trim()).filter(s => s !== ""),
      technologies: projectData.technologies.split(",").map(s => s.trim()).filter(s => s !== "")
    };

    let result;
    if (editingProjectId) {
      result = await updateProject(editingProjectId, submissionData as Partial<Project>, session.access_token);
    } else {
      result = await addProject(submissionData as Omit<Project, "id">, session.access_token);
    }

    setIsSubmitting(false);

    if (result.success) {
      setProjectData({ title: "", category: "", description: "", thumbnail: "", gallery: "", technologies: "", link: "", github: "" });
      setEditingProjectId(null);
      setIsAddingProject(false);
      loadAllData();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleEditProject = (project: Project) => {
    setProjectData({
      title: project.title,
      category: project.category,
      description: project.description,
      thumbnail: project.thumbnail,
      gallery: project.gallery.join(", "),
      technologies: project.technologies.join(", "),
      link: project.link || "",
      github: project.github || ""
    });
    setEditingProjectId(project.id);
    setIsAddingProject(true);
    // Scroll to form
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!session?.access_token) return;
    if (confirm("Delete this project?")) {
      const result = await deleteProject(id, session.access_token);
      if (result.success) loadAllData();
    }
  };

  const handleApproveComment = async (id: string) => {
    if (!session?.access_token) return;
    const result = await approveComment(id, session.access_token);
    if (result.success) {
      loadAllData();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      alert("Error approving comment: " + result.error);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!session?.access_token) return;
    if (confirm("Permanently delete this comment?")) {
      const result = await deleteComment(id, session.access_token);
      if (result.success) {
        loadAllData();
      } else {
        alert("Error deleting comment: " + result.error);
      }
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 rounded-[32px] bg-neutral-900 border border-white/10 w-full max-w-md text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5">
            <SettingsIcon className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tighter mb-4 uppercase">Admin Access</h1>
          <p className="text-neutral-500 mb-10 leading-relaxed">Sign in with your authorized Google account to manage your portfolio content.</p>
          <button
            onClick={() => supabase?.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/admin' } })}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin && !isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-neutral-500 mb-6">You do not have permission to view this dashboard.</p>
          <button onClick={() => supabase?.auth.signOut()} className="px-6 py-3 bg-neutral-800 text-white rounded-xl font-bold">Sign Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-neutral-950 text-white flex overflow-hidden relative">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md z-30 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-black" size={16} />
          </div>
          <span className="font-bold tracking-tighter text-lg italic">ADMIN<span className="text-neutral-500">.</span></span>
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 text-neutral-400 hover:text-white transition-colors"
        >
          {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-16 left-0 right-0 bg-neutral-950/95 border-b border-white/5 p-6 z-25 flex flex-col gap-2 backdrop-blur-lg"
          >
            <button 
              onClick={() => {
                setActiveTab("settings");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium ${activeTab === "settings" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <SettingsIcon size={20} />
              Settings
            </button>
            <button 
              onClick={() => {
                setActiveTab("projects");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium ${activeTab === "projects" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <Briefcase size={20} />
              Projects
            </button>
            <button 
              onClick={() => {
                setActiveTab("comments");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium ${activeTab === "comments" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <MessageSquare size={20} />
              Comments
            </button>
            <Link 
              href="/"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-500 hover:bg-white/5 hover:text-white transition-all font-medium"
            >
              <Globe size={20} />
              View Site
            </Link>
            <div className="h-[1px] bg-white/5 my-2" />
            <button 
              onClick={() => {
                supabase?.auth.signOut();
                setIsMobileSidebarOpen(false);
              }}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-medium"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop Only */}
      <div className="hidden md:flex w-72 border-r border-white/5 p-8 flex-col justify-between bg-neutral-950/50 backdrop-blur-xl z-20 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <LayoutDashboard className="text-black" size={20} />
            </div>
            <span className="font-bold tracking-tighter text-xl italic">ADMIN<span className="text-neutral-500">.</span></span>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium ${activeTab === "settings" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <SettingsIcon size={20} />
              Settings
            </button>
            <button 
              onClick={() => setActiveTab("projects")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium ${activeTab === "projects" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <Briefcase size={20} />
              Projects
            </button>
            <button 
              onClick={() => setActiveTab("comments")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium ${activeTab === "comments" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <MessageSquare size={20} />
              Comments
            </button>
            <Link 
              href="/"
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-neutral-500 hover:bg-white/5 hover:text-white transition-all font-medium"
            >
              <Globe size={20} />
              View Site
            </Link>
          </nav>
        </div>

        <button 
          onClick={() => supabase?.auth.signOut()}
          className="flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-medium"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 pt-24 md:p-12">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center gap-3 text-neutral-500">
              <Loader2 className="animate-spin" size={20} />
              Syncing with database...
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === "settings" ? (
                <div className="space-y-12">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-4xl font-bold tracking-tighter mb-2 uppercase italic">Global <span className="text-neutral-500">Settings.</span></h2>
                      <p className="text-neutral-500">Update your bio and achievement statistics across the entire site.</p>
                    </div>
                    {!isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all flex items-center gap-2"
                      >
                        <SettingsIcon size={18} />
                        Edit Settings
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSettingsSubmit} className="space-y-8 p-10 bg-neutral-900/50 border border-white/5 rounded-[32px] backdrop-blur-md">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">About Bio Text</label>
                        <textarea 
                          rows={5}
                          value={settingsData.about_text}
                          onChange={(e) => setSettingsData({...settingsData, about_text: e.target.value})}
                          className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-6 py-5 text-neutral-300 focus:outline-none focus:border-white/20 transition-all resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Projects Built</label>
                          <input 
                            type="number"
                            value={settingsData.projects_built}
                            onChange={(e) => setSettingsData({...settingsData, projects_built: parseInt(e.target.value)})}
                            className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Hackathons Won</label>
                          <input 
                            type="number"
                            value={settingsData.hackathons_won}
                            onChange={(e) => setSettingsData({...settingsData, hackathons_won: parseInt(e.target.value)})}
                            className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Awards Won</label>
                          <input 
                            type="number"
                            value={settingsData.awards_won}
                            onChange={(e) => setSettingsData({...settingsData, awards_won: parseInt(e.target.value)})}
                            className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Expertise (Comma-separated)</label>
                        <input 
                          value={skillsInput}
                          onChange={(e) => setSkillsInput(e.target.value)}
                          className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all"
                          placeholder="React / Next.js, TypeScript, Tailwind CSS, Three.js"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Vision & Vibes (Hobbies, Dreams, Ideas)</label>
                        <textarea 
                          rows={6}
                          value={settingsData.vision_text}
                          onChange={(e) => setSettingsData({...settingsData, vision_text: e.target.value})}
                          className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-6 py-5 text-neutral-300 focus:outline-none focus:border-white/20 transition-all resize-none"
                          placeholder="What drives you? What are your hobbies and big ideas?"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Professional Resume (PDF / Image)</label>
                        <div className="flex gap-4">
                          <label className="flex-1 flex items-center justify-center gap-3 py-5 bg-neutral-950 border border-white/5 border-dashed rounded-2xl cursor-pointer hover:border-white/20 transition-all group">
                            {isUploading ? <Loader2 className="animate-spin text-neutral-500" size={20} /> : (
                              <>
                                <Upload size={20} className="text-neutral-500 group-hover:text-white transition-colors" />
                                <span className="text-sm font-bold text-neutral-500 group-hover:text-white transition-colors">
                                  {settingsData.resume_url ? "Update Resume File" : "Upload Resume File"}
                                </span>
                              </>
                            )}
                            <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleResumeUpload} disabled={isUploading} />
                          </label>
                          {settingsData.resume_url && (
                            <a 
                              href={settingsData.resume_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-6 flex items-center justify-center bg-neutral-800 text-white rounded-2xl hover:bg-neutral-700 transition-all font-bold text-sm"
                            >
                              Preview
                            </a>
                          )}
                        </div>
                        {settingsData.resume_url && (
                          <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-2 ml-1">✓ File ready to be saved</p>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <button 
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="flex-1 py-5 bg-neutral-800 text-white font-bold rounded-2xl hover:bg-neutral-700 transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="flex-[2] py-5 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all disabled:opacity-50"
                        >
                          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-8 p-10 bg-neutral-900/50 border border-white/5 rounded-[32px] backdrop-blur-md">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">About Bio Text</label>
                        <p className="text-neutral-300 leading-relaxed bg-neutral-950/50 border border-white/5 rounded-2xl px-6 py-5 min-h-[120px]">
                          {settingsData.about_text}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Projects Built</label>
                          <div className="bg-neutral-950/50 border border-white/5 rounded-2xl px-6 py-5 text-2xl font-bold italic">
                            {settingsData.projects_built}+
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Hackathons Won</label>
                          <div className="bg-neutral-950/50 border border-white/5 rounded-2xl px-6 py-5 text-2xl font-bold italic">
                            {settingsData.hackathons_won}x
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Awards Won</label>
                          <div className="bg-neutral-950/50 border border-white/5 rounded-2xl px-6 py-5 text-2xl font-bold italic">
                            {settingsData.awards_won}x
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Expertise</label>
                        <div className="flex flex-wrap gap-2 bg-neutral-950/50 border border-white/5 rounded-2xl px-6 py-5 min-h-[60px]">
                          {settingsData.skills.length > 0 ? (
                            settingsData.skills.map((skill, i) => (
                              <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-neutral-300 uppercase tracking-wider">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-600 italic text-sm">No expertise added yet.</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Vision & Vibes</label>
                        <p className="text-xl font-medium text-neutral-200 leading-relaxed bg-neutral-950/50 border border-white/5 rounded-2xl px-6 py-5 italic">
                          {settingsData.vision_text}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Professional Resume</label>
                        <div className="bg-neutral-950/50 border border-white/5 rounded-2xl px-6 py-5 flex items-center justify-between">
                          {settingsData.resume_url ? (
                            <>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center text-white border border-white/5">
                                  <Download size={20} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-white uppercase tracking-tight">Resume File Attached</p>
                                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">Live on Home Page</p>
                                </div>
                              </div>
                              <a 
                                href={settingsData.resume_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-all"
                              >
                                View File
                              </a>
                            </>
                          ) : (
                            <p className="text-neutral-600 italic text-sm">No resume uploaded yet.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === "projects" ? (
                <div className="space-y-12">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-4xl font-bold tracking-tighter mb-2 uppercase italic">Project <span className="text-neutral-500">Vault.</span></h2>
                      <p className="text-neutral-500">Add, edit, or remove projects from your showcase.</p>
                    </div>
                    {!isAddingProject && (
                      <button 
                        onClick={() => setIsAddingProject(true)}
                        className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add New Project
                      </button>
                    )}
                  </div>

                  {isAddingProject && (
                    <form onSubmit={handleProjectSubmit} className="space-y-6 p-10 bg-neutral-900/50 border border-white/5 rounded-[32px] backdrop-blur-md">
                      <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-tight">
                        {editingProjectId ? "Update Project" : "Create New Project"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Title</label>
                          <input required value={projectData.title} onChange={(e) => setProjectData({...projectData, title: e.target.value})} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Category</label>
                          <input required value={projectData.category} onChange={(e) => setProjectData({...projectData, category: e.target.value})} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Description</label>
                        <textarea required rows={3} value={projectData.description} onChange={(e) => setProjectData({...projectData, description: e.target.value})} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white resize-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Thumbnail URL</label>
                        <div className="flex gap-2">
                          <input required value={projectData.thumbnail} onChange={(e) => setProjectData({...projectData, thumbnail: e.target.value})} className="flex-1 bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" placeholder="https://..." />
                          <label className="flex items-center justify-center px-6 bg-neutral-800 hover:bg-neutral-700 rounded-2xl cursor-pointer transition-colors border border-white/5">
                            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "thumbnail")} disabled={isUploading} />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Gallery Image URLs (Comma-separated)</label>
                        <div className="flex gap-2">
                          <input value={projectData.gallery} onChange={(e) => setProjectData({...projectData, gallery: e.target.value})} className="flex-1 bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" placeholder="url1, url2" />
                          <label className="flex items-center justify-center px-6 bg-neutral-800 hover:bg-neutral-700 rounded-2xl cursor-pointer transition-colors border border-white/5">
                            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFileUpload(e, "gallery")} disabled={isUploading} />
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Technologies (Comma-separated)</label>
                        <input value={projectData.technologies} onChange={(e) => setProjectData({...projectData, technologies: e.target.value})} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Demo Link</label>
                          <input value={projectData.link} onChange={(e) => setProjectData({...projectData, link: e.target.value})} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">GitHub Link</label>
                          <input value={projectData.github} onChange={(e) => setProjectData({...projectData, github: e.target.value})} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          type="button"
                          onClick={() => {
                            setIsAddingProject(false);
                            setEditingProjectId(null);
                            setProjectData({ title: "", category: "", description: "", thumbnail: "", gallery: "", technologies: "", link: "", github: "" });
                          }}
                          className="flex-1 py-4 bg-neutral-800 text-white font-bold rounded-2xl hover:bg-neutral-700 transition-all"
                        >
                          Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                            <>{editingProjectId ? <CheckCircle size={18} /> : <Plus size={18} />} {editingProjectId ? "Update Project" : "Save Project"}</>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Existing Projects <span className="text-neutral-500 tabular-nums">({projects.length})</span></h3>
                    {projects.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-6 bg-neutral-900/50 border border-white/5 rounded-[24px] backdrop-blur-sm group hover:border-white/10 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-neutral-800 border border-white/5">
                            <img src={p.thumbnail} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-white group-hover:text-neutral-200 transition-colors">{p.title}</p>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mt-0.5">{p.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditProject(p)} className="p-3 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all" title="Edit Project">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => handleDeleteProject(p.id)} className="p-3 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Delete Project">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  <div>
                    <h2 className="text-4xl font-bold tracking-tighter mb-2 uppercase italic">Comment <span className="text-neutral-500">Moderation.</span></h2>
                    <p className="text-neutral-500">Approve or remove visitor testimonials before they go live.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {comments.length === 0 ? (
                      <div className="p-20 text-center bg-neutral-900/50 border border-white/5 rounded-[32px]">
                        <MessageSquare className="mx-auto text-neutral-800 mb-4" size={48} />
                        <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No comments yet</p>
                      </div>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} className="p-8 bg-neutral-900/50 border border-white/5 rounded-[32px] backdrop-blur-md relative overflow-hidden group">
                          {!c.approved && (
                            <div className="absolute top-0 right-0 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest border-b border-l border-yellow-500/20">
                              Pending
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center font-bold text-xl text-white border border-white/5">
                                {c.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-bold text-white">{c.name}</h4>
                                <p className="text-xs text-neutral-500 font-medium">{c.role} {c.designation && `• ${c.designation}`}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {!c.approved && (
                                <button 
                                  onClick={() => handleApproveComment(c.id)}
                                  className="p-3 bg-green-500 text-black rounded-xl hover:bg-green-400 transition-all"
                                  title="Approve Comment"
                                >
                                  <Check size={18} />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteComment(c.id)}
                                className="p-3 bg-neutral-800 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-white/5"
                                title="Delete Comment"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          <p className="text-neutral-300 leading-relaxed italic bg-neutral-950/50 p-6 rounded-2xl border border-white/5">
                            "{c.content}"
                          </p>
                          <div className="mt-4 flex justify-between items-center px-2">
                            <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                              {new Date(c.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
                              {c.email}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
