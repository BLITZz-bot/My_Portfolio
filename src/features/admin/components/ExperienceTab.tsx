"use client";

import { Dispatch, SetStateAction, FormEvent } from "react";
import { Plus, ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { Experience } from "@/types/experience";
import { ExperienceFormData } from "@/features/admin/types";

interface ExperienceTabProps {
  experiences: Experience[];
  experienceData: ExperienceFormData;
  setExperienceData: Dispatch<SetStateAction<ExperienceFormData>>;
  emptyExperience: ExperienceFormData;
  isAddingExperience: boolean;
  setIsAddingExperience: (adding: boolean) => void;
  editingExperienceId: string | null;
  setEditingExperienceId: (id: string | null) => void;
  isSubmitting: boolean;
  isReordering: boolean;
  onSubmit: (e: FormEvent) => Promise<void>;
  onEdit: (experience: Experience) => void;
  onDelete: (id: string) => Promise<void>;
  onMove: (index: number, direction: "up" | "down") => Promise<void>;
}

export function ExperienceTab({
  experiences,
  experienceData,
  setExperienceData,
  emptyExperience,
  isAddingExperience,
  setIsAddingExperience,
  editingExperienceId,
  setEditingExperienceId,
  isSubmitting,
  isReordering,
  onSubmit,
  onEdit,
  onDelete,
  onMove,
}: ExperienceTabProps) {
  return (
    <div className="space-y-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter mb-2 uppercase italic">
            Career <span className="text-neutral-500">Timeline.</span>
          </h2>
          <p className="text-neutral-500">Manage the roles displayed on your public experience page.</p>
        </div>
        {!isAddingExperience && (
          <button 
            onClick={() => setIsAddingExperience(true)} 
            className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={18} />
            Add Experience
          </button>
        )}
      </div>

      {isAddingExperience && (
        <form onSubmit={onSubmit} className="space-y-6 p-6 sm:p-10 bg-neutral-900/50 border border-white/5 rounded-[32px] backdrop-blur-md">
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">
            {editingExperienceId ? "Update Experience" : "Add Experience"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Company</label>
              <input 
                required 
                value={experienceData.company} 
                onChange={(e) => setExperienceData({ ...experienceData, company: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" 
                placeholder="Acme Inc." 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Role</label>
              <input 
                required 
                value={experienceData.role} 
                onChange={(e) => setExperienceData({ ...experienceData, role: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" 
                placeholder="Product Engineer" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Employment type</label>
              <input 
                required 
                value={experienceData.employment_type} 
                onChange={(e) => setExperienceData({ ...experienceData, employment_type: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" 
                placeholder="Full-time" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Location</label>
              <input 
                value={experienceData.location} 
                onChange={(e) => setExperienceData({ ...experienceData, location: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" 
                placeholder="Bengaluru, India · Hybrid" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Start date</label>
              <input 
                required 
                type="date" 
                value={experienceData.start_date} 
                onChange={(e) => setExperienceData({ ...experienceData, start_date: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">End date</label>
              <input 
                type="date" 
                disabled={experienceData.is_current} 
                value={experienceData.end_date} 
                onChange={(e) => setExperienceData({ ...experienceData, end_date: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white disabled:opacity-40 focus:outline-none focus:border-white/20" 
              />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer text-sm text-neutral-300">
            <input 
              type="checkbox" 
              checked={experienceData.is_current} 
              onChange={(e) => setExperienceData({ ...experienceData, is_current: e.target.checked })} 
              className="h-4 w-4 accent-white" 
            />
            I currently work in this role
          </label>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Description</label>
            <textarea 
              required 
              rows={5} 
              value={experienceData.description} 
              onChange={(e) => setExperienceData({ ...experienceData, description: e.target.value })} 
              className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm leading-relaxed text-white focus:outline-none focus:border-white/20" 
              placeholder="Describe your impact, responsibilities, and results..." 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Skills (comma-separated)</label>
              <input 
                value={experienceData.skills} 
                onChange={(e) => setExperienceData({ ...experienceData, skills: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" 
                placeholder="React, Design Systems" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Logo URL (optional)</label>
              <input 
                value={experienceData.company_logo} 
                onChange={(e) => setExperienceData({ ...experienceData, company_logo: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" 
                placeholder="https://..." 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Company URL (optional)</label>
              <input 
                value={experienceData.company_url} 
                onChange={(e) => setExperienceData({ ...experienceData, company_url: e.target.value })} 
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/20" 
                placeholder="https://..." 
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => { 
                setIsAddingExperience(false); 
                setEditingExperienceId(null); 
                setExperienceData(emptyExperience); 
              }} 
              className="flex-1 py-4 bg-neutral-800 text-white font-bold rounded-2xl hover:bg-neutral-700 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="flex-[2] py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Saving..." : editingExperienceId ? "Update Experience" : "Save Experience"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold uppercase tracking-tight text-white">
            Experience entries <span className="text-neutral-500 tabular-nums">({experiences.length})</span>
          </h3>
          <span className="text-xs font-mono text-neutral-500">Use arrows to set timeline order</span>
        </div>
        {experiences.map((experience, index) => (
          <div key={experience.id} className="flex items-center justify-between gap-4 p-4 sm:p-6 bg-neutral-900/50 border border-white/5 rounded-[24px] group hover:border-white/10">
            <div className="flex min-w-0 items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-bold text-neutral-400 shrink-0">
                #{index + 1}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-base sm:text-lg text-white truncate">{experience.role}</p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold mt-0.5">
                  {experience.company} · {experience.is_current ? "Current" : "Past role"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => onMove(index, "up")} 
                disabled={index === 0 || isReordering} 
                className="p-2.5 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                title="Move Up"
              >
                <ArrowUp size={16} />
              </button>
              <button 
                onClick={() => onMove(index, "down")} 
                disabled={index === experiences.length - 1 || isReordering} 
                className="p-2.5 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                title="Move Down"
              >
                <ArrowDown size={16} />
              </button>
              <button 
                onClick={() => onEdit(experience)} 
                className="p-2.5 text-neutral-500 hover:text-white cursor-pointer"
                title="Edit Experience"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={() => onDelete(experience.id)} 
                className="p-2.5 text-neutral-500 hover:text-red-500 cursor-pointer"
                title="Delete Experience"
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
