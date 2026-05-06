"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "./useAuth";

export function RequireAdmin({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isReady = auth ? !auth.isRestoringSession && !auth.isUserLoading : false;
  const isAuthed = Boolean(auth?.user);
  const isAdmin = auth?.user?.roles?.includes("admin") ?? false;

  useEffect(() => {
    if (!auth) return;
    if (!isReady) return;
    if (!isAuthed) {
      const params = new URLSearchParams({ from: pathname });
      router.replace(`/auth?${params.toString()}`);
      return;
    }
    if (!isAdmin) {
      router.replace("/");
    }
  }, [auth, isReady, isAuthed, isAdmin, pathname, router]);

  if (!auth || !isReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-white/55">
        Loading…
      </div>
    );
  }

  if (!isAuthed || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
