import { Redirect } from "expo-router";

import { usePsmfStore } from "@/src/store/psmf-store";
import { selectIsOnboarded } from "@/src/store/selectors";

export default function IndexRoute() {
  const data = usePsmfStore((store) => store.data);
  const status = usePsmfStore((store) => store.status);

  if (status !== "ready") {
    return null;
  }

  return (
    <Redirect href={selectIsOnboarded(data) ? "/(tabs)/home" : "/onboarding/welcome"} />
  );
}
