import { useEffect } from "react";

import { usePsmfStore } from "@/src/store/psmf-store";

export function useHydratedStore() {
  const status = usePsmfStore((store) => store.status);
  const hydrate = usePsmfStore((store) => store.hydrate);

  useEffect(() => {
    if (status === "idle") {
      void hydrate();
    }
  }, [hydrate, status]);

  return {
    ready: status === "ready",
  };
}
