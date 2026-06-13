"use server";

import { supabase, verifyAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

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

  if (!supabase) return { success: false, error: "Supabase error" };

  const { error } = await supabase
    .from("comments")
    .update({ approved: true })
    .eq("id", commentId);

  if (error) return { success: false, error: error.message };
  
  revalidatePath("/");
  return { success: true };
}

// Admin Action: Delete/Reject Comment
export async function deleteComment(commentId: string, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  if (!supabase) return { success: false, error: "Supabase error" };

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) return { success: false, error: error.message };
  
  revalidatePath("/");
  return { success: true };
}
