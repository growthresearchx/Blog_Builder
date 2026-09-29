"use client";

import { useState, useEffect } from "react";
import type { UserSession } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  return { user, loading, setUser };
}
