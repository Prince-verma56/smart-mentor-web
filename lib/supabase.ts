import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";

if (supabaseUrl === "https://dummy.supabase.co") {
  console.warn("⚠️ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local. Supabase will not work until this is set.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
