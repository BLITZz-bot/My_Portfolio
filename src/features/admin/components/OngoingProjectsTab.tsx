"use client";

import { Dispatch, SetStateAction, FormEvent, ChangeEvent } from "react";
import { 
  Plus, 
  CheckCircle, 
  Upload, 
  Loader2, 
  ArrowUp, 
  ArrowDown, 
  Pencil, 
  Trash2 
} from "lucide-react";
import { Project } from "@/types/project";
import { ProjectFormData } from "@/features/admin/types";

interface OngoingProjectsTabProps {
  ongoingProjects: Project[];
  ongoingProjectData: ProjectFormData;
  setOngoingProjectData: Dispatch<SetStateAction<ProjectFormData>>;
  isAddingOngoingProject: boolean;
  setIsAddingOngoingProject: (adding: boolean) => void;
  editingOngoingProjectId: string | null;
  setEditingOngoingProjectId: (id: string | null) => void;
  isSubmitting: boolean;
  isUploading: boolean;
  isReordering: boolean;
  onSubmit: (e: FormEvent) => Promise<void>;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => Promise<void>;
  onMove: (index: number, direction: "up" | "down") => Promise<void>;
  onFileUpload: (e: ChangeEvent<HTMLInputElement>, field: "ongoing-thumbnail" | "ongoing-gallery") => Promise<void>;
}

export function OngoingProjectsTab({
  ongoingProjects,
  ongoingProjectData,
  setOngoingProjectData,
  isAddingOngoingProject,
  setIsAddingOngoingProject,
  editingOngoingProjectId,
  setEditingOngoingProjectId,
  isSubmitting,
  isUploading,
  isReordering,
  onSubmit,
  onEdit,
  onDelete,
  onMove,
  onFileUpload,
}: OngoingProjectsTabProps) {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter mb-2 uppercase italic">
            Initiatives <span className="text-neutral-500">Vault.</span>
          </h2>
          <p className="text-neutral-500">Add, edit, or remove projects in progress from your showcase.</p>
        </div>
        {!isAddingOngoingProject && (
          <button 
            onClick={() => setIsAddingOngoingProject(true)}
            className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} />
            Add New Initiative
          </button>
        )}
      </div>

      {isAddingOngoingProject && (
        <form onSubmit={onSubmit} className="space-y-6 p-10 bg-neutral-900/50 border border-white/5 rounded-[32px] backdrop-blur-md">
          <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-tight">
            {editingOngoingProjectId ? "Update Initiative" : "Create New Initiative"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Title</label>
              <input 
                required 
                value={ongoingProjectData.title} 
                onChange={(e) => setOngoingProjectData({ ...ongoingProjectData, title: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Category</label>
              <input 
                required 
                value={ongoingProjectData.category} 
                onChange={(e) => setOngoingProjectData({ ...ongoingProjectData, category: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" 
              />
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
              onChange={(e) => setOngoingProjectData({ ...ongoingProjectData, description: e.target.value })} 
              className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white font-mono leading-relaxed" 
              placeholder="Overview of the initiative...&#10;&#10;1. Alpha Architecture&#10;Currently developing core features and smart sync engine.&#10;&#10;2. Security Guardrails&#10;Integrating verified authentication and zero-trust policies."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Thumbnail URL</label>
            <div className="flex gap-2">
              <input 
                required 
                value={ongoingProjectData.thumbnail} 
                onChange={(e) => setOngoingProjectData({ ...ongoingProjectData, thumbnail: e.target.value })} 
                className="flex-1 bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" 
                placeholder="https://..." 
              />
              <label className="flex items-center justify-center px-6 bg-neutral-800 hover:bg-neutral-700 rounded-2xl cursor-pointer transition-colors border border-white/5">
                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(e, "ongoing-thumbnail")} disabled={isUploading} />
              </label>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Gallery Image URLs (Comma-separated)</label>
            <div className="flex gap-2">
              <input 
                value={ongoingProjectData.gallery} 
                onChange={(e) => setOngoingProjectData({ ...ongoingProjectData, gallery: e.target.value })} 
                className="flex-1 bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" 
                placeholder="url1, url2" 
              />
              <label className="flex items-center justify-center px-6 bg-neutral-800 hover:bg-neutral-700 rounded-2xl cursor-pointer transition-colors border border-white/5">
                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => onFileUpload(e, "ongoing-gallery")} disabled={isUploading} />
              </label>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Technologies (Comma-separated)</label>
            <input 
              value={ongoingProjectData.technologies} 
              onChange={(e) => setOngoingProjectData({ ...ongoingProjectData, technologies: e.target.value })} 
              className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Demo Link</label>
              <input 
                value={ongoingProjectData.link} 
                onChange={(e) => setOngoingProjectData({ ...ongoingProjectData, link: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">GitHub Link</label>
              <input 
                value={ongoingProjectData.github} 
                onChange={(e) => setOngoingProjectData({ ...ongoingProjectData, github: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-white/20 transition-all text-white" 
              />
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
              className="flex-1 py-4 bg-neutral-800 text-white font-bold rounded-2xl hover:bg-neutral-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-[2] py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  {editingOngoingProjectId ? <CheckCircle size={18} /> : <Plus size={18} />} 
                  {editingOngoingProjectId ? "Update Initiative" : "Save Initiative"}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold uppercase tracking-tight text-white">
            Existing Initiatives <span className="text-neutral-500 tabular-nums">({ongoingProjects.length})</span>
          </h3>
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={p.thumbnail} 
                  alt="" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                />
              </div>

              {/* Info */}
              <div className="min-w-0">
                <p className="font-bold text-base sm:text-lg text-white group-hover:text-neutral-200 transition-colors truncate">
                  {p.title}
                </p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mt-0.5">
                  {p.category}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Move Up */}
              <button 
                onClick={() => onMove(index, "up")} 
                disabled={index === 0 || isReordering}
                className="p-2.5 sm:p-3 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-400 cursor-pointer disabled:cursor-not-allowed"
                title="Move Up (Show First)"
              >
                <ArrowUp size={16} />
              </button>

              {/* Move Down */}
              <button 
                onClick={() => onMove(index, "down")} 
                disabled={index === ongoingProjects.length - 1 || isReordering}
                className="p-2.5 sm:p-3 text-neutral-400 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-neutral-400 cursor-pointer disabled:cursor-not-allowed"
                title="Move Down (Show Later)"
              >
                <ArrowDown size={16} />
              </button>

              <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

              {/* Edit */}
              <button 
                onClick={() => onEdit(p)} 
                className="p-2.5 sm:p-3 text-neutral-500 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer" 
                title="Edit Initiative"
              >
                <Pencil size={16} />
              </button>

              {/* Delete */}
              <button 
                onClick={() => onDelete(p.id)} 
                className="p-2.5 sm:p-3 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer" 
                title="Delete Initiative"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
