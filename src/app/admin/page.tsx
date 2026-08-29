"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAdminDashboard } from "@/features/admin/hooks/useAdminDashboard";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";
import { SettingsTab } from "@/features/admin/components/SettingsTab";
import { ProjectsTab } from "@/features/admin/components/ProjectsTab";
import { OngoingProjectsTab } from "@/features/admin/components/OngoingProjectsTab";
import { ExperienceTab } from "@/features/admin/components/ExperienceTab";
import { CommentsTab } from "@/features/admin/components/CommentsTab";
import { LoginScreen, AccessDeniedScreen } from "@/features/admin/components/AuthScreens";
import { Toast } from "@/features/admin/components/Toast";

export default function AdminDashboard() {
  const {
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
  } = useAdminDashboard();

  if (!session) {
    return <LoginScreen />;
  }

  if (!isAdmin && !isLoading) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="h-screen bg-neutral-950 text-white flex overflow-hidden relative">
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

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
              {activeTab === "settings" && (
                <SettingsTab
                  settingsData={settingsData}
                  setSettingsData={setSettingsData}
                  skillsInput={skillsInput}
                  setSkillsInput={setSkillsInput}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  isSubmitting={isSubmitting}
                  isUploading={isUploading}
                  onSubmit={handleSettingsSubmit}
                  onResumeUpload={handleResumeUpload}
                />
              )}

              {activeTab === "projects" && (
                <ProjectsTab
                  projects={projects}
                  projectData={projectData}
                  setProjectData={setProjectData}
                  isAddingProject={isAddingProject}
                  setIsAddingProject={setIsAddingProject}
                  editingProjectId={editingProjectId}
                  setEditingProjectId={setEditingProjectId}
                  isSubmitting={isSubmitting}
                  isUploading={isUploading}
                  isReordering={isReordering}
                  onSubmit={handleProjectSubmit}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onMove={handleMoveProject}
                  onFileUpload={(e, field) => handleFileUpload(e, field)}
                />
              )}

              {activeTab === "ongoing" && (
                <OngoingProjectsTab
                  ongoingProjects={ongoingProjects}
                  ongoingProjectData={ongoingProjectData}
                  setOngoingProjectData={setOngoingProjectData}
                  isAddingOngoingProject={isAddingOngoingProject}
                  setIsAddingOngoingProject={setIsAddingOngoingProject}
                  editingOngoingProjectId={editingOngoingProjectId}
                  setEditingOngoingProjectId={setEditingOngoingProjectId}
                  isSubmitting={isSubmitting}
                  isUploading={isUploading}
                  isReordering={isReordering}
                  onSubmit={handleOngoingProjectSubmit}
                  onEdit={handleEditOngoingProject}
                  onDelete={handleDeleteOngoingProject}
                  onMove={handleMoveOngoingProject}
                  onFileUpload={(e, field) => handleFileUpload(e, field)}
                />
              )}

              {activeTab === "experience" && (
                <ExperienceTab
                  experiences={experiences}
                  experienceData={experienceData}
                  setExperienceData={setExperienceData}
                  emptyExperience={emptyExperience}
                  isAddingExperience={isAddingExperience}
                  setIsAddingExperience={setIsAddingExperience}
                  editingExperienceId={editingExperienceId}
                  setEditingExperienceId={setEditingExperienceId}
                  isSubmitting={isSubmitting}
                  isReordering={isReordering}
                  onSubmit={handleExperienceSubmit}
                  onEdit={handleEditExperience}
                  onDelete={handleDeleteExperience}
                  onMove={handleMoveExperience}
                />
              )}

              {activeTab === "comments" && (
                <CommentsTab
                  comments={comments}
                  onApprove={handleApproveComment}
                  onDelete={handleDeleteComment}
                />
              )}
            </motion.div>
          )}
        </div>
      </div>

      <Toast show={showToast} />
    </div>
  );
}
