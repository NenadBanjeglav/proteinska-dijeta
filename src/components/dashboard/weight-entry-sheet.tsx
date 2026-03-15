import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";

import { ActionPill } from "@/src/components/dashboard/action-pill";
import { BottomSheet } from "@/src/components/ui/bottom-sheet";
import { Card } from "@/src/components/ui/card";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import {
  formatWeightKg,
  getWeightDeltaLabel,
  getWeightDeltaMessage,
  getWeightDeltaTone,
} from "@/src/lib/dashboard";
import { roundTo } from "@/src/lib/units";
import type { WeightEntry } from "@/src/types/app";

type WeightEntrySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  today: string;
  todayWeightKg: number | null;
  previousEntry: WeightEntry | null;
  onSave: (kg: number) => Promise<void>;
};

const MIN_WEIGHT_KG = 35;
const MAX_WEIGHT_KG = 350;
const FINE_STEP = 0.1;
const COARSE_STEP = 1;

function clampWeight(weightKg: number) {
  return Math.min(MAX_WEIGHT_KG, Math.max(MIN_WEIGHT_KG, roundTo(weightKg, 1)));
}

function getInitialDraft(
  todayWeightKg: number | null,
  previousEntry: WeightEntry | null,
) {
  if (todayWeightKg !== null) {
    return todayWeightKg;
  }

  if (previousEntry) {
    return previousEntry.kg;
  }

  return null;
}

function getReferenceLabel(referenceEntry: WeightEntry | null, today: string) {
  if (!referenceEntry) {
    return "Nema ranijeg unosa";
  }

  if (referenceEntry.date === today) {
    return "Startna tezina";
  }

  return `Poslednji unos - ${referenceEntry.date}`;
}

export function WeightEntrySheet({
  open,
  onOpenChange,
  today,
  todayWeightKg,
  previousEntry,
  onSave,
}: WeightEntrySheetProps) {
  const [draftWeightKg, setDraftWeightKg] = useState<number | null>(
    getInitialDraft(todayWeightKg, previousEntry),
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftWeightKg(getInitialDraft(todayWeightKg, previousEntry));
    setIsSaving(false);
  }, [open, previousEntry, todayWeightKg]);

  const deltaKg = useMemo(() => {
    if (draftWeightKg === null || !previousEntry || previousEntry.date >= today) {
      return null;
    }

    return roundTo(draftWeightKg - previousEntry.kg, 1);
  }, [draftWeightKg, previousEntry, today]);

  const deltaTone = getWeightDeltaTone(deltaKg);
  const canSave = draftWeightKg !== null;

  function nudgeDraft(step: number) {
    setDraftWeightKg((current) => {
      const base = current ?? previousEntry?.kg ?? MIN_WEIGHT_KG;
      return clampWeight(base + step);
    });
  }

  async function handleSave() {
    if (draftWeightKg === null || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(draftWeightKg);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <BottomSheet
      onOpenChange={onOpenChange}
      open={open}
      title={todayWeightKg === null ? "Unesi danasnju tezinu" : "Izmeni danasnju tezinu"}
    >
      <View className="gap-4">
        <Card className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
            {getReferenceLabel(previousEntry, today)}
          </Text>
          <Text
            className="text-2xl font-black text-text"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {previousEntry ? formatWeightKg(previousEntry.kg) : "-"}
          </Text>
          <Text className="text-sm leading-6 text-muted">
            Ovaj unos se cuva samo za datum {today}.
          </Text>
        </Card>

        <Card className="items-center gap-3 border-warning bg-surface-strong py-6">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Trenutni draft
          </Text>
          <Text
            className="text-[44px] font-black text-text"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {draftWeightKg === null ? "-" : formatWeightKg(draftWeightKg)}
          </Text>
          <Text className="text-sm text-muted">
            Podesi tezinu sitnim ili krupnim koracima.
          </Text>
        </Card>

        <View className="gap-3">
          <Text className="text-sm font-semibold uppercase tracking-[1.8px] text-muted">
            Fini korak
          </Text>
          <View className="flex-row gap-2">
            <ActionPill label="-0.1" onPress={() => nudgeDraft(-FINE_STEP)} />
            <ActionPill label="+0.1" onPress={() => nudgeDraft(FINE_STEP)} variant="accent" />
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-sm font-semibold uppercase tracking-[1.8px] text-muted">
            Grubi korak
          </Text>
          <View className="flex-row gap-2">
            <ActionPill label="-1.0" onPress={() => nudgeDraft(-COARSE_STEP)} />
            <ActionPill label="+1.0" onPress={() => nudgeDraft(COARSE_STEP)} variant="accent" />
          </View>
        </View>

        <Card
          className={
            deltaTone === "success"
              ? "gap-2 border-success bg-success/10"
              : deltaTone === "danger"
                ? "gap-2 border-danger bg-danger/10"
                : "gap-2"
          }
        >
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
            Promena danas
          </Text>
          <Text
            className={
              deltaTone === "success"
                ? "text-2xl font-black text-success"
                : deltaTone === "danger"
                  ? "text-2xl font-black text-danger"
                  : "text-2xl font-black text-text"
            }
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {getWeightDeltaLabel(deltaKg)}
          </Text>
          <Text className="text-sm leading-6 text-muted">
            {getWeightDeltaMessage(deltaKg)}
          </Text>
        </Card>

        <View className="gap-3 pt-1">
          <PrimaryButton
            disabled={!canSave}
            label={todayWeightKg === null ? "Sacuvaj danasnju tezinu" : "Sacuvaj izmenu"}
            loading={isSaving}
            onPress={() => {
              void handleSave();
            }}
          />
          <PrimaryButton
            label="Zatvori"
            onPress={() => onOpenChange(false)}
            variant="ghost"
          />
        </View>
      </View>
    </BottomSheet>
  );
}
