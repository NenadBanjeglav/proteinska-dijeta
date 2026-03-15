import { useMemo } from "react";

import { getTodayDate } from "@/src/lib/date";

export function useToday() {
  return useMemo(
    () => ({
      today: getTodayDate(),
    }),
    [],
  );
}
