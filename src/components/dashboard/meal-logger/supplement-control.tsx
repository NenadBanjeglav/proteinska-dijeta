import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/cn";
import { triggerHaptic } from "@/src/lib/haptics";
import type { MealSupplementKey, MealSupplements } from "@/src/types/app";

import type { MealSupplementDefinition } from "@/src/components/dashboard/meal-logger/types";

export function SupplementControl({
  definitions,
  open,
  setOpen,
  supplements,
  onToggle,
}: {
  definitions: MealSupplementDefinition[];
  open: boolean;
  setOpen: (open: boolean) => void;
  supplements: MealSupplements;
  onToggle: (key: MealSupplementKey) => void;
}) {
  const selectedCount = Object.values(supplements).filter(Boolean).length;

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
              Suplementi
            </Text>
            <Text className="text-base font-semibold text-text">
              {selectedCount ? `${selectedCount} odabrano` : "Bez oznake"}
            </Text>
          </View>
          <Ionicons color="#CBD5E1" name="chevron-down" size={20} />
        </Card>
      </Pressable>
    );
  }

  return (
    <Card className="gap-3 px-4 py-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="gap-1">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
            Suplementi
          </Text>
          <Text className="text-sm text-muted">
            {selectedCount ? `${selectedCount} odabrano` : "Bez oznake"}
          </Text>
        </View>
        <Pressable
          accessibilityLabel="Zatvori suplemente"
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

      {definitions.length ? (
        <View className="flex-row flex-wrap gap-2">
          {definitions.map((definition) => {
            const selected = supplements[definition.key];

            return (
              <Pressable
                accessibilityLabel={definition.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={cn(
                  "min-h-[44px] rounded-2xl border px-4 py-3",
                  selected
                    ? "border-warning bg-surface-strong"
                    : "border-border bg-surface-soft",
                )}
                key={definition.key}
                onPress={() => {
                  triggerHaptic("selection");
                  onToggle(definition.key);
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    color={selected ? "#FDB022" : "#CBD5E1"}
                    name={selected ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                  />
                  <Text className="text-sm font-semibold text-text">
                    {definition.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text className="text-sm leading-6 text-muted">
          Dnevni limit je vec popunjen.
        </Text>
      )}
    </Card>
  );
}
