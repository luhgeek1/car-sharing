"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

import { useAuth } from "@/providers/auth/useAuth";
import { patchMyProfile } from "@/shared/api/auth";

export default function ProfilePage() {
  const auth = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [touched, setTouched] = useState(false);

  const isReady = auth ? !auth.isRestoringSession && !auth.isUserLoading : false;
  const user = auth?.user ?? null;

  useEffect(() => {
    if (isReady && !user) {
      router.replace("/auth?from=/profile");
    }
  }, [isReady, user, router]);

  useEffect(() => {
    if (user) setUsername(user.username ?? "");
  }, [user]);

  const mutation = useMutation({
    mutationFn: patchMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setTouched(false);
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!touched) return;
    await mutation.mutateAsync({ username: username.trim() || null });
  };

  if (!isReady || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-xs uppercase tracking-[0.3em] text-white/55">
        Loading…
      </div>
    );
  }

  const isAdmin = user.roles?.includes("admin") ?? false;
  const initials = (user.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="w-full pt-40 pb-32">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-16 max-w-3xl">
          <div className="text-white/40 text-[10px] font-medium uppercase tracking-[0.3em] mb-6">
            Account
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-light uppercase tracking-[0.05em] mb-6 leading-tight"
          >
            My <span className="font-medium text-white/50">Profile</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/50 font-light tracking-wide leading-relaxed"
          >
            Manage your account details and preferences.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="border border-white/10 bg-[#050505] p-10 flex flex-col gap-6"
          >
            <div className="flex items-center justify-center w-20 h-20 border border-white/30 text-lg font-display font-medium uppercase tracking-[0.18em] text-white">
              {initials}
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
                Email
              </div>
              <div className="text-sm text-white tracking-wide break-all">
                {user.email}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
                Username
              </div>
              <div className="text-sm text-white tracking-wide">
                {user.username || (
                  <span className="text-white/40">Not set</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
                Roles
              </div>
              <div className="flex flex-wrap gap-2">
                {(user.roles ?? []).map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 border border-white/20 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/80"
                  >
                    {role === "admin" ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : null}
                    {role}
                  </span>
                ))}
              </div>
            </div>
            {isAdmin ? (
              <div className="pt-2 border-t border-white/10">
                <Link
                  href="/admin/cars"
                  className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/70 hover:text-white transition-colors inline-flex items-center gap-2 border-b border-white/30 pb-1 hover:border-white"
                >
                  Open Admin Console
                </Link>
              </div>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-white/10 bg-[#050505] p-10 flex flex-col gap-10"
          >
            <div>
              <h2 className="text-2xl font-display font-light uppercase tracking-[0.1em] mb-2">
                Profile details
              </h2>
              <p className="text-white/50 font-light text-sm tracking-wide">
                Pick a display name. Leave blank to clear it.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40 ml-2">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setTouched(true);
                  }}
                  placeholder="e.g. luhgeek"
                  className="w-full bg-transparent border-b border-white/20 px-2 py-3 text-white text-sm font-light tracking-wide focus:outline-none focus:border-white transition-all placeholder:text-white/20"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={!touched || mutation.isPending}
                  className="px-8 py-4 bg-white text-black text-xs font-medium uppercase tracking-[0.2em] hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {mutation.isPending ? "Saving…" : "Save changes"}
                </button>
                {mutation.isSuccess && !touched ? (
                  <span className="text-[10px] uppercase tracking-[0.22em] text-white/60">
                    Saved
                  </span>
                ) : null}
                {mutation.isError ? (
                  <span className="text-[10px] uppercase tracking-[0.22em] text-red-300">
                    Could not save. Try again.
                  </span>
                ) : null}
              </div>
            </form>

            <div className="border-t border-white/10 pt-8 space-y-4">
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
                Session
              </div>
              <button
                type="button"
                onClick={() => auth?.logout()}
                className="px-8 py-4 bg-transparent border border-white/30 text-white text-xs font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all"
              >
                Sign out
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
