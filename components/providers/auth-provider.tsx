"use client";

import { createContext, useContext, ReactNode } from "react";
import type { UserSession } from "@/types";

const AuthContext = createContext<{ user: UserSession | null }>({ user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={{ user: null }}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
