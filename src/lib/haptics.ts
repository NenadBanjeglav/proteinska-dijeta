import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export type AppHaptic = "none" | "selection" | "light" | "medium" | "success";

function run(task: () => Promise<void>) {
  if (Platform.OS === "web") {
    return;
  }

  void task().catch(() => {
    // Ignore haptics failures on unsupported devices and simulators.
  });
}

export function triggerHaptic(type: AppHaptic = "light") {
  if (type === "none") {
    return;
  }

  if (type === "selection") {
    run(() => Haptics.selectionAsync());
    return;
  }

  if (type === "success") {
    run(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
    return;
  }

  run(() =>
    Haptics.impactAsync(
      type === "medium"
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light,
    ),
  );
}
