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
  Upload
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { getSettings, updateSettings, getProjects, addProject, deleteProject } from "@/app/actions/admin";
import { Project } from "@/lib/projects";
import Link from "next/link";

interface SettingsData {
  about_text: string;
  projects_built: number;
  hackathons_won: number;
  awards_won: number;
  location: string;
  location_status: string;
}

export default function AdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<"settings" | "projects">("settings");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Form States
  const [settingsData, setSettingsData] = useState<SettingsData>({
    about_text: "",
    projects_built: 0,
    hackathons_won: 0,
    awards_won: 0,
    location: "",
    location_status: ""
  });

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

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    const [settings, projectList] = await Promise.all([
      getSettings(),
      getProjects()
    ]);

    if (settings) setSettingsData(settings as SettingsData);
    if (projectList) setProjects(projectList as unknown as Project[]);
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
    if (!session?.user?.email) return;
    setIsSubmitting(true);
    const result = await updateSettings(settingsData, session.user.email);
    setIsSubmitting(false);
    if (result.success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email) return;
    setIsSubmitting(true);

    const submissionData = {
      ...projectData,
      gallery: projectData.gallery.split(",").map(s => s.trim()).filter(s => s !== ""),
      technologies: projectData.technologies.split(",").map(s => s.trim()).filter(s => s !== "")
    };

    const result = await addProject(submissionData as Omit<Project, "id">, session.user.email);
    setIsSubmitting(false);

    if (result.success) {
      setProjectData({ title: "", category: "", description: "", thumbnail: "", gallery: "", technologies: "", link: "", github: "" });
      loadAllData();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!session?.user?.email) return;
    if (confirm("Delete this project?")) {
      const result = await deleteProject(id, session.user.email);
      if (result.success) loadAllData();
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
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Sidebar */}
      <div className="w-72 border-r border-white/5 p-8 flex flex-col justify-between fixed h-full bg-neutral-950/50 backdrop-blur-xl z-20">
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
      <div className="flex-1 ml-72 p-12">
        <div className="max-w-4xl">
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
                  <div>
                    <h2 className="text-4xl font-bold tracking-tighter mb-2 uppercase italic">Global <span className="text-neutral-500">Settings.</span></h2>
                    <p className="text-neutral-500">Update your bio and achievement statistics across the entire site.</p>
                  </div>

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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Location</label>
                        <input 
                          value={settingsData.location}
                          onChange={(e) => setSettingsData({...settingsData, location: e.target.value})}
                          className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Work Status</label>
                        <input 
                          value={settingsData.location_status}
                          onChange={(e) => setSettingsData({...settingsData, location_status: e.target.value})}
                          className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-5 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Update Portfolio"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-4xl font-bold tracking-tighter mb-2 uppercase italic">Project <span className="text-neutral-500">Vault.</span></h2>
                      <p className="text-neutral-500">Add, edit, or remove projects from your showcase.</p>
                    </div>
                  </div>

                  <form onSubmit={handleProjectSubmit} className="space-y-6 p-10 bg-neutral-900/50 border border-white/5 rounded-[32px] backdrop-blur-md">
                    <h3 className="text-xl font-bold mb-4">Add New Project</h3>
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
                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> Save Project</>}
                    </button>
                  </form>

                  <div className="grid grid-cols-1 gap-4">
                    <h3 className="text-xl font-bold">Existing Projects ({projects.length})</h3>
                    {projects.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-6 bg-neutral-900 border border-white/5 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <img src={p.thumbnail} alt="" className="w-16 h-10 object-cover rounded-lg bg-neutral-800" />
                          <div>
                            <p className="font-bold">{p.title}</p>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest">{p.category}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteProject(p.id)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-12 right-12 z-[100] flex items-center gap-4 bg-white p-4 pl-5 rounded-2xl shadow-2xl"
          >
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="font-bold text-sm text-black">Success</p>
              <p className="text-neutral-500 text-xs uppercase tracking-widest font-bold">Data Synced Successfully</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
