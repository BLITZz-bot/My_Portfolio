"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  Briefcase, 
  MessageSquare, 
  Globe, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AdminTab } from "@/features/admin/types";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
}: AdminSidebarProps) {
  const handleTabClick = (tab: AdminTab) => {
    onSelectTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const handleSignOut = () => {
    supabase?.auth.signOut();
    setIsMobileSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md z-30 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-black" size={16} />
          </div>
          <span className="font-bold tracking-tighter text-lg italic">
            ADMIN<span className="text-neutral-500">.</span>
          </span>
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
              onClick={() => handleTabClick("settings")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium cursor-pointer ${activeTab === "settings" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <SettingsIcon size={20} />
              Settings
            </button>
            <button 
              onClick={() => handleTabClick("projects")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium cursor-pointer ${activeTab === "projects" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <Briefcase size={20} />
              Projects
            </button>
            <button
              onClick={() => handleTabClick("ongoing")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium cursor-pointer ${activeTab === "ongoing" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <Briefcase size={20} />
              Projects in Progress
            </button>
            <button 
              onClick={() => handleTabClick("experience")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium cursor-pointer ${activeTab === "experience" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <Briefcase size={20} />
              Experience
            </button>
            <button 
              onClick={() => handleTabClick("comments")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium cursor-pointer ${activeTab === "comments" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
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
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-medium cursor-pointer"
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
            <span className="font-bold tracking-tighter text-xl italic">
              ADMIN<span className="text-neutral-500">.</span>
            </span>
          </div>

          <nav className="space-y-2">
            <button 
              onClick={() => onSelectTab("settings")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium cursor-pointer ${activeTab === "settings" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <SettingsIcon size={20} />
              Settings
            </button>
            <button 
              onClick={() => onSelectTab("projects")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium cursor-pointer ${activeTab === "projects" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <Briefcase size={20} />
              Projects
            </button>
            <button
              onClick={() => onSelectTab("ongoing")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium cursor-pointer ${activeTab === "ongoing" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <Briefcase size={20} />
              Projects in Progress
            </button>
            <button 
              onClick={() => onSelectTab("experience")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium cursor-pointer ${activeTab === "experience" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
            >
              <Briefcase size={20} />
              Experience
            </button>
            <button 
              onClick={() => onSelectTab("comments")}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-medium cursor-pointer ${activeTab === "comments" ? "bg-white text-black" : "text-neutral-500 hover:bg-white/5 hover:text-white"}`}
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
          className="flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-medium cursor-pointer"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </>
  );
}
