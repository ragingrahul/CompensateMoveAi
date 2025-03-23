import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are not set");
}

// This function creates a supabase client for use in the browser
export const createClient = () => {
  // Use browser-specific client that handles cookies properly for client-side
  if (typeof window !== "undefined") {
    const browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

    // Log client init (in development only)
    if (process.env.NODE_ENV !== "production") {
      console.log("Browser Supabase client initialized");
    }

    return browserClient;
  }

  // For server-side (middleware, etc.)
  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });

  // Log client init (in development only)
  if (process.env.NODE_ENV !== "production") {
    console.log("Server Supabase client initialized");
  }

  return client;
};
