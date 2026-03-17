import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { getTodayDate } from "@/src/lib/date";

function getMsUntilNextDay(now = new Date()) {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 1, 0);

  return Math.max(1_000, nextMidnight.getTime() - now.getTime());
}

export function useToday() {
  const [today, setToday] = useState(() => getTodayDate());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    function syncToday() {
      setToday((current) => {
        const next = getTodayDate();
        return current === next ? current : next;
      });
    }

    function scheduleNextSync() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        syncToday();
        scheduleNextSync();
      }, getMsUntilNextDay());
    }

    syncToday();
    scheduleNextSync();

    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        syncToday();
        scheduleNextSync();
      }
    });

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      subscription.remove();
    };
  }, []);

  return { today };
}
