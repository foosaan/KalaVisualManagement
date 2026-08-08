"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import {
  signInSchema,
  signUpSchema,
  type SignInValues,
  type SignUpValues
} from "@/lib/validation/auth";

type LoginFormProps = {
  initialMode?: "signin" | "signup";
};

export function LoginForm({ initialMode = "signin" }: LoginFormProps) {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createBrowserSupabaseClient> | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getSupabase = () => {
    if (!supabaseRef.current) {
      supabaseRef.current = createBrowserSupabaseClient();
    }

    return supabaseRef.current;
  };

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      businessName: "",
      phone: "",
      email: "",
      password: ""
    }
  });

  const handleSignIn = signInForm.handleSubmit((values) => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const supabase = getSupabase();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    });
  });

  const handleSignUp = signUpForm.handleSubmit((values) => {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const supabase = getSupabase();
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
          data: {
            full_name: values.fullName,
            business_name: values.businessName,
            phone: values.phone
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setMessage("Account created. Check your email to confirm and finish signing in.");
      signUpForm.reset();
    });
  });

  return (
    <Card className="w-full border-border/40 shadow-elevated">
      <CardHeader className="space-y-4">
        {/* Tab switcher */}
        <div className="inline-flex rounded-lg bg-muted p-1">
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              mode === "signin"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setMode("signin");
              setMessage(null);
              setError(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              mode === "signup"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setMode("signup");
              setMessage(null);
              setError(null);
            }}
          >
            Create account
          </button>
        </div>
        <div>
          <CardTitle className="text-xl">
            {mode === "signin" ? "Welcome back" : "Get started"}
          </CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Sign in to manage your shoots and finances."
              : "Create an account to start managing your photography business."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {mode === "signin" ? (
          <form className="space-y-4" onSubmit={handleSignIn}>
            <FormField
              label="Email"
              htmlFor="signin-email"
              error={signInForm.formState.errors.email?.message}
            >
              <Input id="signin-email" type="email" {...signInForm.register("email")} />
            </FormField>
            <FormField
              label="Password"
              htmlFor="signin-password"
              error={signInForm.formState.errors.password?.message}
            >
              <Input
                id="signin-password"
                type="password"
                {...signInForm.register("password")}
              />
            </FormField>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
            <Button className="w-full" disabled={pending} type="submit">
              {pending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleSignUp}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Your name"
                htmlFor="signup-name"
                error={signUpForm.formState.errors.fullName?.message}
              >
                <Input id="signup-name" {...signUpForm.register("fullName")} />
              </FormField>
              <FormField
                label="Business name"
                htmlFor="signup-business"
                error={signUpForm.formState.errors.businessName?.message}
              >
                <Input id="signup-business" {...signUpForm.register("businessName")} />
              </FormField>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Phone"
                htmlFor="signup-phone"
                error={signUpForm.formState.errors.phone?.message}
              >
                <Input id="signup-phone" {...signUpForm.register("phone")} />
              </FormField>
              <FormField
                label="Email"
                htmlFor="signup-email"
                error={signUpForm.formState.errors.email?.message}
              >
                <Input id="signup-email" type="email" {...signUpForm.register("email")} />
              </FormField>
            </div>
            <FormField
              label="Password"
              htmlFor="signup-password"
              error={signUpForm.formState.errors.password?.message}
            >
              <Input id="signup-password" type="password" {...signUpForm.register("password")} />
            </FormField>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
            <Button className="w-full" disabled={pending} type="submit">
              {pending ? "Creating account…" : "Create account"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
