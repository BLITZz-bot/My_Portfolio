import { supabase } from "@/lib/supabase";

/**
 * Validates whether the given session token belongs to the authorized administrator.
 * Fail-closed: Strictly requires ADMIN_EMAIL to be set, normalized, and matched.
 */
export async function verifyAdmin(sessionToken: string): Promise<{ authorized: boolean; error?: string }> {
  const allowedEmail = process.env.ADMIN_EMAIL;
  
  if (!allowedEmail || !allowedEmail.trim()) {
    return { authorized: false, error: "Admin configuration missing on server." };
  }

  if (!supabase) {
    return { authorized: false, error: "Database client is not available." };
  }

  if (!sessionToken || typeof sessionToken !== "string" || sessionToken.trim() === "") {
    return { authorized: false, error: "Authentication token required." };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
    if (error || !user) {
      return { authorized: false, error: error?.message || "Invalid session token." };
    }

    if (!user.email || user.email.trim().toLowerCase() !== allowedEmail.trim().toLowerCase()) {
      return { authorized: false, error: "Unauthorized." };
    }

    return { authorized: true };
  } catch (err) {
    return { authorized: false, error: err instanceof Error ? err.message : String(err) };
  }
}
