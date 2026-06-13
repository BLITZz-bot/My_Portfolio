import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isUrlValid = (url: string | undefined) => {
  return url && url.startsWith("http");
};

if (!isUrlValid(supabaseUrl) || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are missing or invalid. Please check your .env file."
  );
}

export const supabase = (isUrlValid(supabaseUrl) && supabaseAnonKey) 
  ? createClient(supabaseUrl as string, supabaseAnonKey)
  : null;

export async function verifyAdmin(sessionToken: string): Promise<{ authorized: boolean; error?: string }> {
  const allowedEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!supabase) {
    return { authorized: false, error: "Supabase client not initialized" };
  }
  if (!sessionToken) {
    return { authorized: false, error: "Missing session token" };
  }
  try {
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
    if (error || !user) {
      return { authorized: false, error: error?.message || "Invalid session token" };
    }
    if (user.email !== allowedEmail) {
      return { authorized: false, error: "Unauthorized email address" };
    }
    return { authorized: true };
  } catch (err: any) {
    return { authorized: false, error: err.message };
  }
}


