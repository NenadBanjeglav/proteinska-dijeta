import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { triggerHaptic } from "@/src/lib/haptics";

export function MealNameControl({
  customName,
  draftName,
  open,
  setDraftName,
  setOpen,
}: {
  customName: string | null;
  draftName: string;
  open: boolean;
  setDraftName: (value: string) => void;
  setOpen: (open: boolean) => void;
}) {
  if (!open) {
    return (
      <Pressable
        accessibilityRole="button"
        className="rounded-3xl"
        onPress={() => {
          triggerHaptic("selection");
          setOpen(true);
        }}
      >
        <Card className="flex-row items-center justify-between gap-3 px-4 py-4">
          <View className="flex-1 gap-1">
            <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
              Naziv
            </Text>
            <Text className="text-base font-semibold text-text">
              {customName ?? "Automatski"}
            </Text>
          </View>
          <Ionicons color="#CBD5E1" name="create-outline" size={20} />
        </Card>
      </Pressable>
    );
  }

  return (
    <Card className="gap-3 px-4 py-4">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
          Naziv
        </Text>
        <Pressable
          accessibilityLabel="Zatvori naziv"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-2xl bg-surface-soft"
          onPress={() => {
            triggerHaptic("selection");
            setOpen(false);
          }}
        >
          <Ionicons color="#CBD5E1" name="close" size={18} />
        </Pressable>
      </View>
      <TextInput
        className="rounded-2xl bg-surface-soft px-4 py-3 text-base font-semibold text-text"
        onChangeText={setDraftName}
        placeholder="Automatski naziv"
        placeholderTextColor="#6F7A90"
        value={draftName}
      />
    </Card>
  );
}
