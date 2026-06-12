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

