"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { Project } from "@/lib/projects";
import { supabase, verifyAdmin } from "@/lib/supabase"; // Import standard client and verification helper

// Helper to get a privileged client only when needed for writes
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("getAdminClient initialization in admin.ts:", {
    hasUrl: !!url,
    hasKey: !!key,
  });

  if (!url || !key) {
    throw new Error("Supabase Admin credentials (SUPABASE_SERVICE_ROLE_KEY) are missing in environment variables.");
  }

  return createClient(url, key);
}

// --- Settings Actions ---

export async function getSettings() {
  if (!supabase) return null;

  try {
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
  } catch (err) {
    console.error("getSettings failed:", err);
    return null;
  }
}

export async function updateSettings(formData: {
  about_text?: string;
  projects_built?: number;
  hackathons_won?: number;
  awards_won?: number;
  location?: string;
  location_status?: string;
  skills?: string[];
  vision_text?: string;
  resume_url?: string;
}, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    console.error("Unauthorized settings update attempt:", authCheck.error);
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  try {
    const supabaseAdmin = getAdminClient();
    // Use upsert to ensure the row exists (id: 1 is our single settings row)
    const { error } = await supabaseAdmin
      .from("portfolio_settings")
      .upsert({ 
        id: 1, 
        ...formData 
      });

    if (error) {
      console.error("Error updating settings:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// --- Project Actions ---

export async function getProjects() {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("getProjects failed:", err);
    return [];
  }
}

export async function addProject(formData: Omit<Project, "id">, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("projects").insert([formData]);

    if (error) {
      console.error("Error adding project:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteProject(projectId: string, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("projects").delete().eq("id", projectId);

    if (error) {
      console.error("Error deleting project:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateProject(projectId: string, formData: Partial<Project>, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("projects")
      .update(formData)
      .eq("id", projectId);

    if (error) {
      console.error("Error updating project:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
