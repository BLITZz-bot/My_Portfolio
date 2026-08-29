"use server";

import { supabase } from "@/lib/supabase";
import { getAdminClient } from "@/lib/supabase/admin";
import { verifyAdmin } from "@/lib/security/auth-guard";
import { sanitizeString, isValidEmail } from "@/lib/security/validation";
import { Comment, PublicComment, CommentFormData } from "@/types/comment";
import { revalidatePath } from "next/cache";

/**
 * Public Action: Fetch approved testimonials for display
 * Applies data minimization: Omits private email and user UUIDs
 */
export async function getApprovedComments(): Promise<PublicComment[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("comments")
      .select("id, name, role, designation, content, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error.message);
      return [];
    }

    return (data as PublicComment[]) || [];
  } catch (err) {
    console.error("getApprovedComments failed:", err);
    return [];
  }
}

/**
 * Admin Action: Fetch all comments (both pending and approved) with full details
 */
export async function getAllComments(sessionToken: string): Promise<Comment[]> {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return [];
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all comments:", error.message);
      return [];
    }

    return (data as Comment[]) || [];
  } catch (err) {
    console.error("getAllComments failed:", err);
    return [];
  }
}

/**
 * Public Action: Submit a testimonial for moderation
 * Sanitizes input and strictly validates length and email format
 */
export async function submitComment(formData: CommentFormData) {
  if (!supabase) {
    return { success: false, error: "Database service unavailable." };
  }

  const cleanName = sanitizeString(formData.name, 100);
  const cleanEmail = formData.email ? formData.email.trim().toLowerCase() : "";
  const cleanRole = sanitizeString(formData.role || "Client", 50);
  const cleanDesignation = sanitizeString(formData.designation, 100);
  const cleanContent = sanitizeString(formData.content, 2000);

  // Validation
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: "Please enter a valid name (at least 2 characters)." };
  }
  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return { success: false, error: "Please provide a valid email address." };
  }
  if (!cleanContent || cleanContent.length < 5) {
    return { success: false, error: "Feedback must be at least 5 characters long." };
  }

  try {
    const { error } = await supabase.from("comments").insert([
      {
        name: cleanName,
        email: cleanEmail,
        role: cleanRole,
        designation: cleanDesignation || null,
        content: cleanContent,
        user_id: formData.user_id || null,
        approved: false, // Default to false for mandatory moderation
      },
    ]);

    if (error) {
      console.error("Error submitting comment:", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/comments");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Admin Action: Approve Comment
 */
export async function approveComment(commentId: string, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  if (!commentId || typeof commentId !== "string") {
    return { success: false, error: "Invalid comment identifier." };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("comments")
      .update({ approved: true })
      .eq("id", commentId);

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/");
    revalidatePath("/comments");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Admin Action: Delete/Reject Comment
 */
export async function deleteComment(commentId: string, sessionToken: string) {
  const authCheck = await verifyAdmin(sessionToken);
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error || "Unauthorized" };
  }

  if (!commentId || typeof commentId !== "string") {
    return { success: false, error: "Invalid comment identifier." };
  }

  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) return { success: false, error: error.message };
    
    revalidatePath("/");
    revalidatePath("/comments");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
