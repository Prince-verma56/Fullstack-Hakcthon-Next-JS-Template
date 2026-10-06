"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  // We can add additional custom auth state handling here if needed
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
