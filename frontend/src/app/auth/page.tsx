"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

import { useAuth } from "@/providers/auth/useAuth";
import type { AuthCredentials } from "@/entities/auth/model";
import { LoginForm } from "@/features/auth/login-form";
import { SignupForm } from "@/features/auth/signup-form";

type Mode = "login" | "register";

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } })
      .response;
    const detail = response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return "Something went wrong";
};

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] bg-black" />}>
      <AuthPageInner />
    </Suspense>
  );
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/";
  const auth = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (auth?.user) {
      router.replace(redirectTo);
    }
  }, [auth?.user, redirectTo, router]);

  if (!auth) return null;

  const {
    login,
    register,
    isLoggingIn,
    loginError,
    isRegistering,
    registerError,
  } = auth;

  const isLoading = isLoggingIn || isRegistering;
  const error = mode === "login" ? loginError : registerError;
  const errorMessage = error ? getErrorMessage(error) : null;
  const canSubmit = Boolean(email.trim() && password.trim() && !isLoading);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const credentials: AuthCredentials = {
      email: email.trim(),
      password,
    };
    try {
      if (mode === "login") {
        await login(credentials);
      } else {
        await register(credentials);
      }
      router.replace(redirectTo);
    } catch {}
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-black px-4 py-12 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_rgba(0,0,0,0))]"
      />
      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <LoginForm
                email={email}
                password={password}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onSubmit={submit}
                submitLabel={isLoading ? "Signing in…" : "Login"}
                disabled={isLoading}
                submitDisabled={!canSubmit}
                errorMessage={errorMessage}
                onSwitchToSignup={() => setMode("register")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <SignupForm
                email={email}
                password={password}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onSubmit={submit}
                submitLabel={isLoading ? "Creating…" : "Create Account"}
                disabled={isLoading}
                submitDisabled={!canSubmit}
                errorMessage={errorMessage}
                onSwitchToLogin={() => setMode("login")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
