import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isUrlValid = (url: string | undefined) => {
  return !!url && url.startsWith("http");
};

export const supabase = (isUrlValid(supabaseUrl) && supabaseAnonKey) 
  ? createClient(supabaseUrl as string, supabaseAnonKey)
  : null;

export { verifyAdmin } from "@/lib/security/auth-guard";
