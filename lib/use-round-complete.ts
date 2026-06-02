"use client";

import { useEffect, useState } from "react";
import { getCompletedRound } from "./round";

export function useRoundComplete(): boolean {
  const [completa, setCompleta] = useState(false);

  useEffect(() => {
    setCompleta(Boolean(getCompletedRound()));
  }, []);

  return completa;
}
