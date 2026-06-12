"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { Project } from "@/lib/projects";

// --- Settings Actions ---

export async function getSettings() {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("portfolio_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error fetching settings:", error);
    return null;
  }

  return data;
}

export async function updateSettings(formData: {
  about_text?: string;
  projects_built?: number;
  hackathons_won?: number;
  awards_won?: number;
  location?: string;
  location_status?: string;
}, adminEmail: string) {
  if (adminEmail !== process.env.ADMIN_EMAIL) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) return { success: false, error: "Supabase error" };

  const { error } = await supabase
    .from("portfolio_settings")
    .update(formData)
    .eq("id", 1);

  if (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

// --- Project Actions ---

export async function getProjects() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return data;
}

export async function addProject(formData: Omit<Project, "id">, adminEmail: string) {
  if (adminEmail !== process.env.ADMIN_EMAIL) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) return { success: false, error: "Supabase error" };

  const { error } = await supabase.from("projects").insert([formData]);

  if (error) {
    console.error("Error adding project:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/projects");
  return { success: true };
}

export async function deleteProject(projectId: string, adminEmail: string) {
  if (adminEmail !== process.env.ADMIN_EMAIL) {
    return { success: false, error: "Unauthorized" };
  }

  if (!supabase) return { success: false, error: "Supabase error" };

  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/projects");
  return { success: true };
}
