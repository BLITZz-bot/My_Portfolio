"use server";

import { supabase, verifyAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error("Supabase Admin credentials (SUPABASE_SERVICE_ROLE_KEY) are missing in environment variables.");
  }

  return createClient(url, key);
}

export async function getApprovedComments() {
  if (!supabase) {
    console.error("Supabase client is not initialized.");
    return [];
  }

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }

  return data;
}

export async function getAllComments() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all comments:", error);
    return [];
  }

  return data;
}

export async function submitComment(formData: {
  name: string;
  email: string;
  role: string;
  designation?: string;
  content: string;
  user_id?: string;
}) {
  if (!supabase) {
    return { success: false, error: "Supabase client is not initialized." };
  }

  const { error } = await supabase.from("comments").insert([
    {
      ...formData,
      approved: false, // Default to false for moderation
    },
  ]);

  if (error) {
    console.error("Error submitting comment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

// Admin Action: Approve Comment
export async function approveComment(commentId: string, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("comments")
      .update({ approved: true })
      .eq("id", commentId);

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Admin Action: Delete/Reject Comment
export async function deleteComment(commentId: string, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
