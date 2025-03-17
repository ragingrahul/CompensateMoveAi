"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "./password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoginFormData, loginSchema } from "@/types/types";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const { signIn, resendVerificationEmail } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      setNeedsVerification(false);
      setResendSuccess(false);

      const { error, needsEmailConfirmation } = await signIn(
        data.email,
        data.password
      );

      if (needsEmailConfirmation) {
        setNeedsVerification(true);
        setEmailForVerification(data.email);
        // Custom error message for email not confirmed
        setAuthError(
          "Email not confirmed. Please verify your email before logging in."
        );
      } else if (error) {
        setAuthError(error.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendVerification() {
    if (!emailForVerification) return;

    try {
      setResendingEmail(true);
      const { error } = await resendVerificationEmail(emailForVerification);

      if (error) {
        setAuthError(`Failed to resend verification email: ${error.message}`);
      } else {
        setResendSuccess(true);
        setAuthError(null);
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      setAuthError("Failed to resend verification email");
    } finally {
      setResendingEmail(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        aria-label="Login form"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="m@example.com"
                  type="email"
                  autoComplete="email"
                  aria-label="Email address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="current-password"
                  aria-label="Password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {authError && (
          <Alert variant="destructive" className="text-sm py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">{authError}</AlertDescription>
          </Alert>
        )}

        {needsVerification && (
          <div className="flex flex-col space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleResendVerification}
              disabled={resendingEmail || resendSuccess}
              className="w-full"
            >
              {resendingEmail
                ? "Sending..."
                : resendSuccess
                ? "Email Sent!"
                : "Resend Verification Email"}
            </Button>

            {resendSuccess && (
              <Alert
                variant="success"
                className="text-sm py-2 bg-green-50 border-green-200"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="ml-2 text-green-700">
                  Verification email sent! Please check your inbox.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Logging in...
            </span>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </Form>
  );
}
