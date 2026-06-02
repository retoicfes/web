"use client";

import { useEffect, useState } from "react";
import { getPlayerSession, type PlayerSession } from "./session";

/** Sesión estable para efectos (evita bucles por referencia nueva en cada render). */
export function usePlayerSession(): PlayerSession | null {
  const [session, setSession] = useState<PlayerSession | null>(null);

  useEffect(() => {
    setSession(getPlayerSession());
  }, []);

  return session;
}
