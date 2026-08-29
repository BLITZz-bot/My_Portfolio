"use client";

import { useState, useEffect, useCallback, useRef, ChangeEvent, FormEvent } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { 
  checkIsAdmin, 
  getSettings, 
  updateSettings, 
  getProjects, 
  addProject, 
  deleteProject, 
  updateProject, 
  getOngoingProjects, 
  addOngoingProject, 
  deleteOngoingProject, 
  updateOngoingProject, 
  reorderProjects, 
  reorderOngoingProjects, 
  getExperiences, 
  addExperience, 
  updateExperience, 
  deleteExperience, 
  reorderExperiences 
} from "@/app/actions/admin";
import { getAllComments, approveComment, deleteComment } from "@/app/actions/comments";
import { Project } from "@/types/project";
import { Experience } from "@/types/experience";
import { Comment } from "@/types/comment";
import { SettingsData } from "@/types/settings";
import { AdminTab, ProjectFormData, ExperienceFormData } from "@/features/admin/types";

const emptyExperience: ExperienceFormData = {
  company: "",
  role: "",
  employment_type: "Full-time",
  location: "",
  start_date: "",
  end_date: "",
  is_current: false,
  description: "",
  skills: "",
  company_logo: "",
  company_url: ""
};

const initialSettings: SettingsData = {
  about_text: "Computer Science student passionate about full-stack development, AI, and building modern digital experiences. Experienced in developing and deploying web applications, participating in competitive hackathons, and creating solutions that address real-world challenges. Recognized with four hackathon victories and a Best Implementation Award for innovation, technical execution, and problem-solving excellence.",
  projects_built: 12,
  hackathons_won: 4,
  awards_won: 1,
  skills: [],
  vision_text: "Passionate about photography, exploring new tech stacks, and dreaming of building an AI-driven platform that makes education accessible to everyone worldwide.",
  resume_url: ""
};

export function useAdminDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("settings");
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

  const [settingsData, setSettingsData] = useState<SettingsData>(initialSettings);
  const [skillsInput, setSkillsInput] = useState(settingsData.skills.join(", "));

  const [projectData, setProjectData] = useState<ProjectFormData>({
    title: "",
    category: "",
    description: "",
    thumbnail: "",
    gallery: "",
    technologies: "",
    link: "",
    github: ""
  });

  const [ongoingProjectData, setOngoingProjectData] = useState<ProjectFormData>({
    title: "",
    category: "",
    description: "",
    thumbnail: "",
    gallery: "",
    technologies: "",
    link: "",
    github: ""
  });

  const [experienceData, setExperienceData] = useState<ExperienceFormData>(emptyExperience);

  const dataLoadedRef = useRef(false);

  const triggerToast = (duration = 3000) => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

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
    if (projectList) setProjects(projectList as Project[]);
    if (ongoingProjectList) setOngoingProjects(ongoingProjectList as Project[]);
    if (experienceList) setExperiences(experienceList as Experience[]);
    if (commentList) setComments(commentList as Comment[]);
    setIsLoading(false);
  }, [session?.access_token]);

  useEffect(() => {
    if (!supabase) return;

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>, 
    field: "thumbnail" | "gallery" | "ongoing-thumbnail" | "ongoing-gallery"
  ) => {
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

  const handleResumeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleSettingsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    setIsSubmitting(true);
    
    const finalData: SettingsData = {
      ...settingsData,
      skills: skillsInput.split(",").map(s => s.trim()).filter(s => s !== "")
    };

    const result = await updateSettings(finalData, session.access_token);
    setIsSubmitting(false);
    if (result.success) {
      setIsEditing(false);
      triggerToast();
      setSettingsData(finalData);
    } else {
      alert("Error: " + result.error);
    }
  };

  const handleProjectSubmit = async (e: FormEvent) => {
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
      triggerToast();
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
      triggerToast(2000);
    }
  };

  const handleOngoingProjectSubmit = async (e: FormEvent) => {
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
      triggerToast();
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
      triggerToast(2000);
    }
  };

  const handleExperienceSubmit = async (e: FormEvent) => {
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
      triggerToast();
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

  const handleApproveComment = async (id: string) => {
    if (!session?.access_token) return;
    const result = await approveComment(id, session.access_token);
    if (result.success) {
      loadAllData();
      triggerToast();
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

  return {
    session,
    isAdmin,
    isLoading,
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    isAddingProject,
    setIsAddingProject,
    editingProjectId,
    setEditingProjectId,
    isAddingOngoingProject,
    setIsAddingOngoingProject,
    editingOngoingProjectId,
    setEditingOngoingProjectId,
    isAddingExperience,
    setIsAddingExperience,
    editingExperienceId,
    setEditingExperienceId,
    isSubmitting,
    isUploading,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    showToast,
    isReordering,
    projects,
    ongoingProjects,
    experiences,
    comments,
    settingsData,
    setSettingsData,
    skillsInput,
    setSkillsInput,
    projectData,
    setProjectData,
    ongoingProjectData,
    setOngoingProjectData,
    experienceData,
    setExperienceData,
    emptyExperience,
    handleFileUpload,
    handleResumeUpload,
    handleSettingsSubmit,
    handleProjectSubmit,
    handleEditProject,
    handleDeleteProject,
    handleMoveProject,
    handleOngoingProjectSubmit,
    handleEditOngoingProject,
    handleDeleteOngoingProject,
    handleMoveOngoingProject,
    handleExperienceSubmit,
    handleEditExperience,
    handleDeleteExperience,
    handleMoveExperience,
    handleApproveComment,
    handleDeleteComment,
  };
}
