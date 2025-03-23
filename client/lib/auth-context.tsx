"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "./supabase";
import type { User, Session, AuthError } from "@supabase/supabase-js";

type Provider = "google" | "github" | "discord"; // More specific provider type

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null; needsEmailConfirmation?: boolean }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  resendVerificationEmail: (
    email: string
  ) => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Utility function to log session details safely
  const logSessionDetails = (sessionObj: Session | null, source: string) => {
    if (sessionObj) {
      console.log(`[${source}] Session found:`, {
        user: sessionObj.user.email,
        expires_at: new Date(sessionObj.expires_at! * 1000).toLocaleString(),
        access_token: sessionObj.access_token.substring(0, 10) + "...",
      });
    } else {
      console.log(`[${source}] No session found`);
    }
  };

  useEffect(() => {
    const setData = async () => {
      try {
        console.log("Initializing auth context, checking for session...");
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession) {
          logSessionDetails(initialSession, "Initial");
          setSession(initialSession);
          setUser(initialSession.user);
        } else {
          console.log("No initial session found");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.email);
      logSessionDetails(newSession, `Auth event: ${event}`);

      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);

      // Add a small delay to ensure the pathname is updated after client-side navigation
      setTimeout(() => {
        // Redirect to dashboard if user is authenticated and on login page
        if (newSession?.user && window.location.pathname === "/login") {
          console.log(
            "User authenticated on login page, redirecting to dashboard"
          );
          router.push("/dashboard");
          router.refresh();
        }
      }, 100); // Small timeout to allow pathname update
    });

    setData();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Handle the case where email is not confirmed
      if (
        error?.message?.toLowerCase().includes("email not confirmed") ||
        error?.message?.toLowerCase().includes("email confirmation")
      ) {
        console.log("Email not confirmed, user needs to verify their email");
        return { error, needsEmailConfirmation: true };
      }

      if (error) {
        console.error("Sign in error:", error.message);
        return { error };
      }

      console.log("Sign in successful, session created:", data.user?.email);
      logSessionDetails(data.session, "Sign in");

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
      return { error: null };
    } catch (err) {
      console.error("Error during sign in:", err);
      return { error: err as AuthError };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      console.log("Resending verification email to:", email);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/dashboard`,
        },
      });

      return { error };
    } catch (err) {
      console.error("Error resending verification email:", err);
      return { error: err as AuthError };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Signing up with:", email);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/dashboard`,
        },
      });

      if (!error) {
        // Sign them up but stay on login page with a success message
        // They'll need to verify their email
        router.push("/login?signup=success");
        router.refresh();
      }
      return { error };
    } catch (err) {
      console.error("Error during sign up:", err);
      return { error: err as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out user:", user?.email);
      await supabase.auth.signOut();
      console.log("Sign out successful");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    try {
      console.log("Signing in with provider:", provider);

      // Make sure we're using the right flow type for OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        throw error;
      } else {
        console.log("OAuth initiated successfully:", data);
        // The browser will be redirected by Supabase
      }
    } catch (error) {
      console.error(`Error during ${provider} sign in:`, error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    resendVerificationEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
