"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { Project } from "@/lib/projects";
import { Experience } from "@/lib/experience";
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

// --- Auth Actions ---

export async function checkIsAdmin(sessionToken: string): Promise<boolean> {
  if (!sessionToken) return false;
  try {
    const authCheck = await verifyAdmin(sessionToken);
    return authCheck.authorized;
  } catch (err) {
    console.error("checkIsAdmin failed:", err);
    return false;
  }
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
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
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
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
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
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
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
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// --- Ongoing Project Actions ---

export async function getOngoingProjects() {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("ongoing_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching ongoing projects:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("getOngoingProjects failed:", err);
    return [];
  }
}

export async function addOngoingProject(formData: Omit<Project, "id">, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("ongoing_projects").insert([formData]);

    if (error) {
      console.error("Error adding ongoing project:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/projects-in-progress");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteOngoingProject(projectId: string, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("ongoing_projects").delete().eq("id", projectId);

    if (error) {
      console.error("Error deleting ongoing project:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/projects-in-progress");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateOngoingProject(projectId: string, formData: Partial<Project>, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("ongoing_projects")
      .update(formData)
      .eq("id", projectId);

    if (error) {
      console.error("Error updating ongoing project:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/projects-in-progress");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// --- Reorder Actions ---

export async function reorderProjects(orderedIds: string[], sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const now = Date.now();

    // Assign decreasing timestamps so index 0 is newest (displayed first)
    const updates = orderedIds.map((id, index) => {
      const timestamp = new Date(now - index * 60000).toISOString();
      return supabaseAdmin
        .from("projects")
        .update({ created_at: timestamp })
        .eq("id", id);
    });

    await Promise.all(updates);

    revalidatePath("/");
    revalidatePath("/projects");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function reorderOngoingProjects(orderedIds: string[], sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const now = Date.now();

    // Assign decreasing timestamps so index 0 is newest (displayed first)
    const updates = orderedIds.map((id, index) => {
      const timestamp = new Date(now - index * 60000).toISOString();
      return supabaseAdmin
        .from("ongoing_projects")
        .update({ created_at: timestamp })
        .eq("id", id);
    });

    await Promise.all(updates);

    revalidatePath("/");
    revalidatePath("/projects-in-progress");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// --- Experience Actions ---

export async function getExperiences() {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching experiences:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("getExperiences failed:", err);
    return [];
  }
}

export async function addExperience(formData: Omit<Experience, "id" | "created_at">, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) return { success: false, error: authCheck.error || "Unauthorized" };

  try {
    const { error } = await getAdminClient().from("experiences").insert([formData]);
    if (error) return { success: false, error: error.message };
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function updateExperience(experienceId: string, formData: Partial<Experience>, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) return { success: false, error: authCheck.error || "Unauthorized" };

  try {
    const { error } = await getAdminClient().from("experiences").update(formData).eq("id", experienceId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function deleteExperience(experienceId: string, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) return { success: false, error: authCheck.error || "Unauthorized" };

  try {
    const { error } = await getAdminClient().from("experiences").delete().eq("id", experienceId);
    if (error) return { success: false, error: error.message };
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function reorderExperiences(orderedIds: string[], sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) return { success: false, error: authCheck.error || "Unauthorized" };

  try {
    const client = getAdminClient();
    const results = await Promise.all(orderedIds.map((id, index) => client.from("experiences").update({ sort_order: index }).eq("id", id)));
    const failure = results.find(({ error }) => error);
    if (failure?.error) return { success: false, error: failure.error.message };
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

