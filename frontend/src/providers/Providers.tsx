"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./auth/AuthContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster theme="dark" richColors position="top-right" />
      </AuthProvider>
    </QueryProvider>
  );
}
