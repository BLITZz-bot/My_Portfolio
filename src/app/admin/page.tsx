"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Download,
  Menu,
  X,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { checkIsAdmin, getSettings, updateSettings, getProjects, addProject, deleteProject, updateProject, getOngoingProjects, addOngoingProject, deleteOngoingProject, updateOngoingProject, reorderProjects, reorderOngoingProjects, getExperiences, addExperience, updateExperience, deleteExperience, reorderExperiences } from "@/app/actions/admin";
import { getAllComments, approveComment, deleteComment } from "@/app/actions/comments";
import { Project } from "@/lib/projects";
import { Experience } from "@/lib/experience";
import Link from "next/link";


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
  const [activeTab, setActiveTab] = useState<"settings" | "projects" | "ongoing" | "experience" | "comments">("settings");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isAddingOngoingProject, setIsAddingOngoingProject] = useState(false);
  const [editingOngoingProjectId, setEditingOngoingProjectId] = useState<string | null>(null);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ongoingProjects, setOngoingProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // Form States
  const [settingsData, setSettingsData] = useState<SettingsData>({
    about_text: "Computer Science student passionate about full-stack development, AI, and building modern digital experiences. Experienced in developing and deploying web applications, participating in competitive hackathons, and creating solutions that address real-world challenges. Recognized with four hackathon victories and a Best Implementation Award for innovation, technical execution, and problem-solving excellence.",
    projects_built: 12,
    hackathons_won: 4,
    awards_won: 1,
    skills: [],
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

  const [ongoingProjectData, setOngoingProjectData] = useState({
    title: "",
    category: "",
    description: "",
    thumbnail: "",
    gallery: "",
    technologies: "",
    link: "",
    github: ""
  });

  const emptyExperience = { company: "", role: "", employment_type: "Full-time", location: "", start_date: "", end_date: "", is_current: false, description: "", skills: "", company_logo: "", company_url: "" };
  const [experienceData, setExperienceData] = useState(emptyExperience);

  const [isAdmin, setIsAdmin] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "thumbnail" | "gallery" | "ongoing-thumbnail" | "ongoing-gallery") => {
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
    } else if (field === "gallery") {
      const currentGallery = projectData.gallery ? projectData.gallery.split(",").map(s => s.trim()) : [];
      const newGallery = [...currentGallery, ...uploadedUrls].filter(s => s !== "").join(", ");
      setProjectData(prev => ({ ...prev, gallery: newGallery }));
    } else if (field === "ongoing-thumbnail") {
      setOngoingProjectData(prev => ({ ...prev, thumbnail: uploadedUrls[0] }));
    } else if (field === "ongoing-gallery") {
      const currentGallery = ongoingProjectData.gallery ? ongoingProjectData.gallery.split(",").map(s => s.trim()) : [];
      const newGallery = [...currentGallery, ...uploadedUrls].filter(s => s !== "").join(", ");
      setOngoingProjectData(prev => ({ ...prev, gallery: newGallery }));
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

  const dataLoadedRef = useRef(false);

  const loadAllData = useCallback(async (token?: string, isInitial = false) => {
    if (isInitial) setIsLoading(true);
    const actualToken = token || session?.access_token;
    const [settings, projectList, ongoingProjectList, experienceList, commentList] = await Promise.all([
      getSettings(),
      getProjects(),
      getOngoingProjects(),
      getExperiences(),
      actualToken ? getAllComments(actualToken) : Promise.resolve([])
    ]);

    if (settings) {
      const settingsTyped = settings as unknown as SettingsData;
      setSettingsData(settingsTyped);
      if (settingsTyped.skills) {
        setSkillsInput(settingsTyped.skills.join(", "));
      }
    }
    if (projectList) setProjects(projectList as unknown as Project[]);
    if (ongoingProjectList) setOngoingProjects(ongoingProjectList as unknown as Project[]);
    if (experienceList) setExperiences(experienceList as unknown as Experience[]);
    if (commentList) setComments(commentList as Comment[]);
    setIsLoading(false);
  }, [session?.access_token]);

  useEffect(() => {
    if (!supabase) return;

    // Check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        const authorized = await checkIsAdmin(session.access_token);
        setIsAdmin(authorized);
        if (authorized && !dataLoadedRef.current) {
          dataLoadedRef.current = true;
          await loadAllData(session.access_token, true);
        } else {
          setIsLoading(false);
        }
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        const authorized = await checkIsAdmin(session.access_token);
        setIsAdmin(authorized);
        if (authorized && !dataLoadedRef.current) {
          dataLoadedRef.current = true;
          await loadAllData(session.access_token, true);
        }
      } else {
        setIsAdmin(false);
        setIsLoading(false);
        dataLoadedRef.current = false;
      }
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

  const handleOngoingProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    setIsSubmitting(true);

    const submissionData = {
      ...ongoingProjectData,
      gallery: ongoingProjectData.gallery.split(",").map(s => s.trim()).filter(s => s !== ""),
      technologies: ongoingProjectData.technologies.split(",").map(s => s.trim()).filter(s => s !== "")
    };

    let result;
    if (editingOngoingProjectId) {
      result = await updateOngoingProject(editingOngoingProjectId, submissionData as Partial<Project>, session.access_token);
    } else {
      result = await addOngoingProject(submissionData as Omit<Project, "id">, session.access_token);
    }

    setIsSubmitting(false);

    if (result.success) {
      setOngoingProjectData({ title: "", category: "", description: "", thumbnail: "", gallery: "", technologies: "", link: "", github: "" });
      setEditingOngoingProjectId(null);
      setIsAddingOngoingProject(false);
      loadAllData();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleEditOngoingProject = (project: Project) => {
    setOngoingProjectData({
      title: project.title,
      category: project.category,
      description: project.description,
      thumbnail: project.thumbnail,
      gallery: project.gallery.join(", "),
      technologies: project.technologies.join(", "),
      link: project.link || "",
      github: project.github || ""
    });
    setEditingOngoingProjectId(project.id);
    setIsAddingOngoingProject(true);
    // Scroll to form
    const formElement = document.querySelector('form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteOngoingProject = async (id: string) => {
    if (!session?.access_token) return;
    if (confirm("Delete this ongoing project?")) {
      const result = await deleteOngoingProject(id, session.access_token);
      if (result.success) loadAllData();
    }
  };

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    setIsSubmitting(true);
    const submissionData = {
      ...experienceData,
      end_date: experienceData.is_current || !experienceData.end_date ? null : experienceData.end_date,
      skills: experienceData.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      company_logo: experienceData.company_logo || null,
      company_url: experienceData.company_url || null,
    };
    const result = editingExperienceId
      ? await updateExperience(editingExperienceId, submissionData, session.access_token)
      : await addExperience(submissionData, session.access_token);
    setIsSubmitting(false);
    if (result.success) {
      setExperienceData(emptyExperience);
      setEditingExperienceId(null);
      setIsAddingExperience(false);
      loadAllData();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleEditExperience = (experience: Experience) => {
    setExperienceData({
      company: experience.company,
      role: experience.role,
      employment_type: experience.employment_type,
      location: experience.location,
      start_date: experience.start_date,
      end_date: experience.end_date || "",
      is_current: experience.is_current,
      description: experience.description,
      skills: experience.skills.join(", "),
      company_logo: experience.company_logo || "",
      company_url: experience.company_url || "",
    });
    setEditingExperienceId(experience.id);
    setIsAddingExperience(true);
  };

  const handleDeleteExperience = async (id: string) => {
    if (!session?.access_token || !confirm("Delete this experience entry?")) return;
    const result = await deleteExperience(id, session.access_token);
    if (result.success) loadAllData();
    else alert("Error: " + result.error);
  };

  const handleMoveExperience = async (index: number, direction: "up" | "down") => {
    if (!session?.access_token || isReordering) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experiences.length) return;
    const reordered = [...experiences];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setExperiences(reordered);
    setIsReordering(true);
    const result = await reorderExperiences(reordered.map((experience) => experience.id), session.access_token);
    setIsReordering(false);
    if (!result.success) {
      alert("Error: " + result.error);
      loadAllData();
    }
  };

  const handleMoveProject = async (index: number, direction: "up" | "down") => {
    if (!session?.access_token || isReordering) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const reordered = [...projects];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);

    setProjects(reordered);
    setIsReordering(true);
    const result = await reorderProjects(reordered.map(p => p.id), session.access_token);
    setIsReordering(false);
    if (result.success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleMoveOngoingProject = async (index: number, direction: "up" | "down") => {
    if (!session?.access_token || isReordering) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= ongoingProjects.length) return;

    const reordered = [...ongoingProjects];
    const [movedItem] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, movedItem);

    setOngoingProjects(reordered);
    setIsReordering(true);
    const result = await reorderOngoingProjects(reordered.map(p => p.id), session.access_token);
    setIsReordering(false);
    if (result.success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
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
                setActiveTab("ongoing");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium ${activeTab === "ongoing" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <Briefcase size={20} />
              Projects in Progress
            </button>
            <button
              onClick={() => {
                setActiveTab("experience");
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium ${activeTab === "experience" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <Briefcase size={20} />
              Experience
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
              onClick={() => setActiveTab("ongoing")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium ${activeTab === "ongoing" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <Briefcase size={20} />
              Projects in Progress
            </button>
            <button 
              onClick={() => setActiveTab("experience")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium ${activeTab === "experience" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <Briefcase size={20} />
              Experience
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
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Tech Stack (Comma-separated)</label>
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
                        <p className="text-neutral-300 leading-relaxed bg-neutral-950/50 border border-white/5 rounded-2xl px-6 py-5 min-h-[120px] whitespace-pre-line">
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
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Tech Stack</label>
                        <div className="flex flex-wrap gap-2 bg-neutral-950/50 border border-white/5 rounded-2xl px-6 py-5 min-h-[60px]">
                          {settingsData.skills.length > 0 ? (
                            settingsData.skills.map((skill, i) => (
                              <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-neutral-300 uppercase tracking-wider">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-600 italic text-sm">No tech stack added yet.</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Vision & Vibes</label>
                        <p className="text-xl font-medium text-neutral-200 leading-relaxed bg-neutral-950/50 border border-white/5 rounded-2xl px-6 py-5 italic whitespace-pre-line">
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
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Description & Highlights</label>
                          <span className="text-[10px] text-emerald-400 font-mono">💡 Tip: Use (1. Point), emojis (🧠, 🚀), or (- bullet) for Highlight Cards</span>
                        </div>
                        <textarea 
                          required 
                          rows={6} 
                          value={projectData.description} 
                          onChange={(e) => setProjectData({...projectData, description: e.target.value})} 
                          className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white font-mono leading-relaxed" 
                          placeholder="Overview of the project...&#10;&#10;1. AI Skill Intelligence&#10;Analyzes resumes and compares them with job descriptions.&#10;&#10;2. Dynamic Skill Tree&#10;Skills unlock only after mastery verification."
                        />
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
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white">Existing Projects <span className="text-neutral-500 tabular-nums">({projects.length})</span></h3>
                      <span className="text-xs font-mono text-neutral-500">💡 Use arrows to rearrange showcase order</span>
                    </div>
                    {projects.map((p, index) => (
                      <div key={p.id} className="flex items-center justify-between p-4 sm:p-6 bg-neutral-900/50 border border-white/5 rounded-[24px] backdrop-blur-sm group hover:border-white/10 transition-all">
                        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                          {/* Order Position Badge */}
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-neutral-400 shrink-0">
                            #{index + 1}
                          </div>

                          {/* Thumbnail */}
                          <div className="relative w-16 sm:w-20 h-10 sm:h-12 rounded-xl overflow-hidden bg-neutral-800 border border-white/5 shrink-0">
                            <img src={p.thumbnail} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <p className="font-bold text-base sm:text-lg text-white group-hover:text-neutral-200 transition-colors truncate">{p.title}</p>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mt-0.5">{p.category}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          {/* Move Up */}
                          <button 
                            onClick={() => handleMoveProject(index, "up")} 
                            disabled={index === 0 || isReordering}
                            className="p-2.5 sm:p-3 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-400 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up (Show First)"
                          >
                            <ArrowUp size={16} />
                          </button>

                          {/* Move Down */}
                          <button 
                            onClick={() => handleMoveProject(index, "down")} 
                            disabled={index === projects.length - 1 || isReordering}
                            className="p-2.5 sm:p-3 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-400 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down (Show Later)"
                          >
                            <ArrowDown size={16} />
                          </button>

                          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

                          {/* Edit */}
                          <button onClick={() => handleEditProject(p)} className="p-2.5 sm:p-3 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer" title="Edit Project">
                            <Pencil size={16} />
                          </button>

                          {/* Delete */}
                          <button onClick={() => handleDeleteProject(p.id)} className="p-2.5 sm:p-3 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer" title="Delete Project">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === "ongoing" ? (
                <div className="space-y-12">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-4xl font-bold tracking-tighter mb-2 uppercase italic">Initiatives <span className="text-neutral-500">Vault.</span></h2>
                      <p className="text-neutral-500">Add, edit, or remove projects in progress from your showcase.</p>
                    </div>
                    {!isAddingOngoingProject && (
                      <button 
                        onClick={() => setIsAddingOngoingProject(true)}
                        className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add New Initiative
                      </button>
                    )}
                  </div>

                  {isAddingOngoingProject && (
                    <form onSubmit={handleOngoingProjectSubmit} className="space-y-6 p-10 bg-neutral-900/50 border border-white/5 rounded-[32px] backdrop-blur-md">
                      <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-tight">
                        {editingOngoingProjectId ? "Update Initiative" : "Create New Initiative"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Title</label>
                          <input required value={ongoingProjectData.title} onChange={(e) => setOngoingProjectData({...ongoingProjectData, title: e.target.value})} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Category</label>
                          <input required value={ongoingProjectData.category} onChange={(e) => setOngoingProjectData({...ongoingProjectData, category: e.target.value})} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Description & Highlights</label>
                          <span className="text-[10px] text-emerald-400 font-mono">💡 Tip: Use (1. Point), emojis (🚀, 🛡️), or (- bullet) for Highlight Cards</span>
                        </div>
                        <textarea 
                          required 
                          rows={6} 
                          value={ongoingProjectData.description} 
                          onChange={(e) => setOngoingProjectData({...ongoingProjectData, description: e.target.value})} 
                          className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white font-mono leading-relaxed" 
                          placeholder="Overview of the initiative...&#10;&#10;1. Alpha Architecture&#10;Currently developing core features and smart sync engine.&#10;&#10;2. Security Guardrails&#10;Integrating verified authentication and zero-trust policies."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Thumbnail URL</label>
                        <div className="flex gap-2">
                          <input required value={ongoingProjectData.thumbnail} onChange={(e) => setOngoingProjectData({...ongoingProjectData, thumbnail: e.target.value})} className="flex-1 bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" placeholder="https://..." />
                          <label className="flex items-center justify-center px-6 bg-neutral-800 hover:bg-neutral-700 rounded-2xl cursor-pointer transition-colors border border-white/5">
                            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "ongoing-thumbnail")} disabled={isUploading} />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Gallery Image URLs (Comma-separated)</label>
                        <div className="flex gap-2">
                          <input value={ongoingProjectData.gallery} onChange={(e) => setOngoingProjectData({...ongoingProjectData, gallery: e.target.value})} className="flex-1 bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" placeholder="url1, url2" />
                          <label className="flex items-center justify-center px-6 bg-neutral-800 hover:bg-neutral-700 rounded-2xl cursor-pointer transition-colors border border-white/5">
                            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                            <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => handleFileUpload(e, "ongoing-gallery")} disabled={isUploading} />
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Technologies (Comma-separated)</label>
                        <input value={ongoingProjectData.technologies} onChange={(e) => setOngoingProjectData({...ongoingProjectData, technologies: e.target.value})} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Demo Link</label>
                          <input value={ongoingProjectData.link} onChange={(e) => setOngoingProjectData({...ongoingProjectData, link: e.target.value})} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">GitHub Link</label>
                          <input value={ongoingProjectData.github} onChange={(e) => setOngoingProjectData({...ongoingProjectData, github: e.target.value})} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          type="button"
                          onClick={() => {
                            setIsAddingOngoingProject(false);
                            setEditingOngoingProjectId(null);
                            setOngoingProjectData({ title: "", category: "", description: "", thumbnail: "", gallery: "", technologies: "", link: "", github: "" });
                          }}
                          className="flex-1 py-4 bg-neutral-800 text-white font-bold rounded-2xl hover:bg-neutral-700 transition-all"
                        >
                          Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                            <>{editingOngoingProjectId ? <CheckCircle size={18} /> : <Plus size={18} />} {editingOngoingProjectId ? "Update Initiative" : "Save Initiative"}</>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold uppercase tracking-tight text-white">Existing Initiatives <span className="text-neutral-500 tabular-nums">({ongoingProjects.length})</span></h3>
                      <span className="text-xs font-mono text-neutral-500">💡 Use arrows to rearrange showcase order</span>
                    </div>
                    {ongoingProjects.map((p, index) => (
                      <div key={p.id} className="flex items-center justify-between p-4 sm:p-6 bg-neutral-900/50 border border-white/5 rounded-[24px] backdrop-blur-sm group hover:border-white/10 transition-all">
                        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                          {/* Order Position Badge */}
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-neutral-400 shrink-0">
                            #{index + 1}
                          </div>

                          {/* Thumbnail */}
                          <div className="relative w-16 sm:w-20 h-10 sm:h-12 rounded-xl overflow-hidden bg-neutral-800 border border-white/5 shrink-0">
                            <img src={p.thumbnail} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <p className="font-bold text-base sm:text-lg text-white group-hover:text-neutral-200 transition-colors truncate">{p.title}</p>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mt-0.5">{p.category}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                          {/* Move Up */}
                          <button 
                            onClick={() => handleMoveOngoingProject(index, "up")} 
                            disabled={index === 0 || isReordering}
                            className="p-2.5 sm:p-3 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-400 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up (Show First)"
                          >
                            <ArrowUp size={16} />
                          </button>

                          {/* Move Down */}
                          <button 
                            onClick={() => handleMoveOngoingProject(index, "down")} 
                            disabled={index === ongoingProjects.length - 1 || isReordering}
                            className="p-2.5 sm:p-3 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-400 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down (Show Later)"
                          >
                            <ArrowDown size={16} />
                          </button>

                          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

                          {/* Edit */}
                          <button onClick={() => handleEditOngoingProject(p)} className="p-2.5 sm:p-3 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer" title="Edit Initiative">
                            <Pencil size={16} />
                          </button>

                          {/* Delete */}
                          <button onClick={() => handleDeleteOngoingProject(p.id)} className="p-2.5 sm:p-3 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer" title="Delete Initiative">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === "experience" ? (
                <div className="space-y-12">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                      <h2 className="text-4xl font-bold tracking-tighter mb-2 uppercase italic">Career <span className="text-neutral-500">Timeline.</span></h2>
                      <p className="text-neutral-500">Manage the roles displayed on your public experience page.</p>
                    </div>
                    {!isAddingExperience && <button onClick={() => setIsAddingExperience(true)} className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all flex items-center gap-2"><Plus size={18} />Add Experience</button>}
                  </div>

                  {isAddingExperience && (
                    <form onSubmit={handleExperienceSubmit} className="space-y-6 p-6 sm:p-10 bg-neutral-900/50 border border-white/5 rounded-[32px] backdrop-blur-md">
                      <h3 className="text-xl font-bold text-white uppercase tracking-tight">{editingExperienceId ? "Update Experience" : "Add Experience"}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Company</label><input required value={experienceData.company} onChange={(e) => setExperienceData({ ...experienceData, company: e.target.value })} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" placeholder="Acme Inc." /></div>
                        <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Role</label><input required value={experienceData.role} onChange={(e) => setExperienceData({ ...experienceData, role: e.target.value })} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" placeholder="Product Engineer" /></div>
                        <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Employment type</label><input required value={experienceData.employment_type} onChange={(e) => setExperienceData({ ...experienceData, employment_type: e.target.value })} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" placeholder="Full-time" /></div>
                        <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Location</label><input value={experienceData.location} onChange={(e) => setExperienceData({ ...experienceData, location: e.target.value })} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" placeholder="Bengaluru, India · Hybrid" /></div>
                        <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Start date</label><input required type="date" value={experienceData.start_date} onChange={(e) => setExperienceData({ ...experienceData, start_date: e.target.value })} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" /></div>
                        <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">End date</label><input type="date" disabled={experienceData.is_current} value={experienceData.end_date} onChange={(e) => setExperienceData({ ...experienceData, end_date: e.target.value })} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white disabled:opacity-40 focus:outline-none focus:border-white/20" /></div>
                      </div>
                      <label className="flex items-center gap-3 cursor-pointer text-sm text-neutral-300"><input type="checkbox" checked={experienceData.is_current} onChange={(e) => setExperienceData({ ...experienceData, is_current: e.target.checked })} className="h-4 w-4 accent-white" />I currently work in this role</label>
                      <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Description</label><textarea required rows={5} value={experienceData.description} onChange={(e) => setExperienceData({ ...experienceData, description: e.target.value })} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm leading-relaxed text-white focus:outline-none focus:border-white/20" placeholder="Describe your impact, responsibilities, and results..." /></div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Skills (comma-separated)</label><input value={experienceData.skills} onChange={(e) => setExperienceData({ ...experienceData, skills: e.target.value })} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" placeholder="React, Design Systems" /></div>
                        <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Logo URL (optional)</label><input value={experienceData.company_logo} onChange={(e) => setExperienceData({ ...experienceData, company_logo: e.target.value })} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" placeholder="https://..." /></div>
                        <div className="space-y-1.5"><label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Company URL (optional)</label><input value={experienceData.company_url} onChange={(e) => setExperienceData({ ...experienceData, company_url: e.target.value })} className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" placeholder="https://..." /></div>
                      </div>
                      <div className="flex gap-4"><button type="button" onClick={() => { setIsAddingExperience(false); setEditingExperienceId(null); setExperienceData(emptyExperience); }} className="flex-1 py-4 bg-neutral-800 text-white font-bold rounded-2xl hover:bg-neutral-700">Cancel</button><button type="submit" disabled={isSubmitting} className="flex-[2] py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 disabled:opacity-50">{isSubmitting ? "Saving..." : editingExperienceId ? "Update Experience" : "Save Experience"}</button></div>
                    </form>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><h3 className="text-xl font-bold uppercase tracking-tight text-white">Experience entries <span className="text-neutral-500 tabular-nums">({experiences.length})</span></h3><span className="text-xs font-mono text-neutral-500">Use arrows to set timeline order</span></div>
                    {experiences.map((experience, index) => <div key={experience.id} className="flex items-center justify-between gap-4 p-4 sm:p-6 bg-neutral-900/50 border border-white/5 rounded-[24px] group hover:border-white/10"><div className="flex min-w-0 items-center gap-4"><span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-neutral-400 shrink-0">#{index + 1}</span><div className="min-w-0"><p className="font-bold text-base sm:text-lg text-white truncate">{experience.role}</p><p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mt-0.5">{experience.company} · {experience.is_current ? "Current" : "Past role"}</p></div></div><div className="flex items-center gap-1 shrink-0"><button onClick={() => handleMoveExperience(index, "up")} disabled={index === 0 || isReordering} className="p-2.5 text-neutral-400 hover:text-white disabled:opacity-20"><ArrowUp size={16} /></button><button onClick={() => handleMoveExperience(index, "down")} disabled={index === experiences.length - 1 || isReordering} className="p-2.5 text-neutral-400 hover:text-white disabled:opacity-20"><ArrowDown size={16} /></button><button onClick={() => handleEditExperience(experience)} className="p-2.5 text-neutral-500 hover:text-white"><Pencil size={16} /></button><button onClick={() => handleDeleteExperience(experience.id)} className="p-2.5 text-neutral-500 hover:text-red-500"><Trash2 size={16} /></button></div></div>)}
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
                            &ldquo;{c.content}&rdquo;
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

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 border border-white/10 px-5 py-4 rounded-2xl shadow-xl shadow-black/40"
          >
            <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <Check className="text-green-500" size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Action successful</p>
              <p className="text-xs text-neutral-400">Your changes have been saved.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
