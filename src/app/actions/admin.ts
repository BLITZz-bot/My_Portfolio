"use server";

import { revalidatePath } from "next/cache";
import { Project } from "@/types/project";
import { Experience } from "@/types/experience";
import { SettingsFormData } from "@/types/settings";
import { supabase } from "@/lib/supabase";
import { getAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/security/auth-guard";
import { isValidSafeUrl } from "@/lib/security/validation";

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
      console.error("Error fetching settings:", error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.error("getSettings failed:", err);
    return null;
  }
}

export async function updateSettings(formData: SettingsFormData, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  // URL security check
  if (formData.resume_url && !isValidSafeUrl(formData.resume_url)) {
    return { success: false, error: "Invalid resume URL protocol." };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("portfolio_settings")
      .upsert({ 
        id: 1, 
        ...formData 
      });

    if (error) {
      console.error("Error updating settings:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// --- Project Actions ---

export async function getProjects(): Promise<Project[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error.message);
      return [];
    }

    return (data as Project[]) || [];
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

  // Safe URL checks
  if (formData.link && !isValidSafeUrl(formData.link)) {
    return { success: false, error: "Invalid project link URL." };
  }
  if (formData.github && !isValidSafeUrl(formData.github)) {
    return { success: false, error: "Invalid GitHub repository URL." };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("projects").insert([formData]);

    if (error) {
      console.error("Error adding project:", error.message);
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
      console.error("Error deleting project:", error.message);
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

  if (formData.link && !isValidSafeUrl(formData.link)) {
    return { success: false, error: "Invalid project link URL." };
  }
  if (formData.github && !isValidSafeUrl(formData.github)) {
    return { success: false, error: "Invalid GitHub repository URL." };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("projects")
      .update(formData)
      .eq("id", projectId);

    if (error) {
      console.error("Error updating project:", error.message);
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

export async function getOngoingProjects(): Promise<Project[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("ongoing_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching ongoing projects:", error.message);
      return [];
    }

    return (data as Project[]) || [];
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

  if (formData.link && !isValidSafeUrl(formData.link)) {
    return { success: false, error: "Invalid initiative link URL." };
  }
  if (formData.github && !isValidSafeUrl(formData.github)) {
    return { success: false, error: "Invalid GitHub repository URL." };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("ongoing_projects").insert([formData]);

    if (error) {
      console.error("Error adding ongoing project:", error.message);
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
      console.error("Error deleting ongoing project:", error.message);
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

  if (formData.link && !isValidSafeUrl(formData.link)) {
    return { success: false, error: "Invalid initiative link URL." };
  }
  if (formData.github && !isValidSafeUrl(formData.github)) {
    return { success: false, error: "Invalid GitHub repository URL." };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("ongoing_projects")
      .update(formData)
      .eq("id", projectId);

    if (error) {
      console.error("Error updating ongoing project:", error.message);
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

export async function getExperiences(): Promise<Experience[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching experiences:", error.message);
      return [];
    }

    return (data as Experience[]) || [];
  } catch (err) {
    console.error("getExperiences failed:", err);
    return [];
  }
}

export async function addExperience(formData: Omit<Experience, "id" | "created_at">, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) return { success: false, error: authCheck.error || "Unauthorized" };

  if (formData.company_url && !isValidSafeUrl(formData.company_url)) {
    return { success: false, error: "Invalid company URL." };
  }

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

  if (formData.company_url && !isValidSafeUrl(formData.company_url)) {
    return { success: false, error: "Invalid company URL." };
  }

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
