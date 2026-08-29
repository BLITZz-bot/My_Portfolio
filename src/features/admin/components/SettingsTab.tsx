"use client";

import { Dispatch, SetStateAction, FormEvent, ChangeEvent } from "react";
import { Settings as SettingsIcon, Upload, Loader2, Download } from "lucide-react";
import { SettingsData } from "@/types/settings";

interface SettingsTabProps {
  settingsData: SettingsData;
  setSettingsData: Dispatch<SetStateAction<SettingsData>>;
  skillsInput: string;
  setSkillsInput: Dispatch<SetStateAction<string>>;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  isSubmitting: boolean;
  isUploading: boolean;
  onSubmit: (e: FormEvent) => Promise<void>;
  onResumeUpload: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function SettingsTab({
  settingsData,
  setSettingsData,
  skillsInput,
  setSkillsInput,
  isEditing,
  setIsEditing,
  isSubmitting,
  isUploading,
  onSubmit,
  onResumeUpload,
}: SettingsTabProps) {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter mb-2 uppercase italic">
            Global <span className="text-neutral-500">Settings.</span>
          </h2>
          <p className="text-neutral-500">Update your bio and achievement statistics across the entire site.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <SettingsIcon size={18} />
            Edit Settings
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={onSubmit} className="space-y-8 p-10 bg-neutral-900/50 border border-white/5 rounded-[32px] backdrop-blur-md">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">About Bio Text</label>
            <textarea 
              rows={5}
              value={settingsData.about_text}
              onChange={(e) => setSettingsData({ ...settingsData, about_text: e.target.value })}
              className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-6 py-5 text-neutral-300 focus:outline-none focus:border-white/20 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Projects Built</label>
              <input 
                type="number"
                value={settingsData.projects_built}
                onChange={(e) => setSettingsData({ ...settingsData, projects_built: parseInt(e.target.value) || 0 })}
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Hackathons Won</label>
              <input 
                type="number"
                value={settingsData.hackathons_won}
                onChange={(e) => setSettingsData({ ...settingsData, hackathons_won: parseInt(e.target.value) || 0 })}
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 ml-1">Awards Won</label>
              <input 
                type="number"
                value={settingsData.awards_won}
                onChange={(e) => setSettingsData({ ...settingsData, awards_won: parseInt(e.target.value) || 0 })}
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
              onChange={(e) => setSettingsData({ ...settingsData, vision_text: e.target.value })}
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
                <input type="file" className="hidden" accept=".pdf,image/*" onChange={onResumeUpload} disabled={isUploading} />
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
              className="flex-1 py-5 bg-neutral-800 text-white font-bold rounded-2xl hover:bg-neutral-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-[2] py-5 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all disabled:opacity-50 cursor-pointer"
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
  );
}
