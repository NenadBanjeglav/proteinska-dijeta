import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";

import { InfoCallout } from "@/src/components/onboarding/info-callout";
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

function getInitialDraft(
  todayWeightKg: number | null,
  previousEntry: WeightEntry | null,
) {
  if (todayWeightKg !== null) {
    return todayWeightKg.toFixed(1);
  }

  if (previousEntry) {
    return previousEntry.kg.toFixed(1);
  }

  return "";
}

function normalizeWeightInput(value: string) {
  const sanitized = value.replace(",", ".").replace(/[^0-9.]/g, "");

  if (!sanitized) {
    return "";
  }

  const hasDecimal = sanitized.includes(".");
  const [wholePart, ...rest] = sanitized.split(".");
  const normalizedWhole = wholePart.slice(0, 3);
  const decimals = rest.join("").slice(0, 1);

  if (hasDecimal) {
    return `${normalizedWhole || "0"}.${decimals}`;
  }

  return normalizedWhole;
}

function parseWeightInput(value: string) {
  if (!value) {
    return null;
  }

  const normalized = value.replace(",", ".");
  if (!/^\d+(\.\d{0,1})?$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
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
  const [draftInput, setDraftInput] = useState(
    getInitialDraft(todayWeightKg, previousEntry),
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftInput(getInitialDraft(todayWeightKg, previousEntry));
    setIsSaving(false);
  }, [open, previousEntry, todayWeightKg]);

  const parsedWeightKg = useMemo(() => parseWeightInput(draftInput), [draftInput]);
  const isOutOfRange =
    parsedWeightKg !== null &&
    (parsedWeightKg < MIN_WEIGHT_KG || parsedWeightKg > MAX_WEIGHT_KG);

  const deltaKg = useMemo(() => {
    if (parsedWeightKg === null || !previousEntry || previousEntry.date >= today) {
      return null;
    }

    return roundTo(parsedWeightKg - previousEntry.kg, 1);
  }, [parsedWeightKg, previousEntry, today]);

  const deltaTone = getWeightDeltaTone(deltaKg);
  const canSave = parsedWeightKg !== null && !isOutOfRange;

  async function handleSave() {
    if (parsedWeightKg === null || isOutOfRange || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(roundTo(parsedWeightKg, 1));
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <BottomSheet
      onOpenChange={onOpenChange}
      open={open}
      title={todayWeightKg === null ? "Unesi jutarnju tezinu" : "Izmeni jutarnju tezinu"}
    >
      <View className="gap-4">
        <InfoCallout
          description="Meri se odmah po budjenju, posle toaleta, pre hrane i vode. Tako je trend najcistiji."
          title="Najtacnije merenje"
          tone="warning"
        />

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
            Ovaj unos cuvamo kao jutarnju tezinu za datum {today}.
          </Text>
        </Card>

        <Card className="gap-3 border-warning bg-surface-strong px-5 py-6">
          <Text className="text-center text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Jutarnja tezina
          </Text>
          <View className="flex-row items-end justify-center gap-3">
            <TextInput
              autoFocus
              className="min-w-[168px] border-b border-warning pb-2 text-center text-[44px] font-black text-text"
              inputMode="decimal"
              keyboardType="decimal-pad"
              onChangeText={(value) => setDraftInput(normalizeWeightInput(value))}
              placeholder="0.0"
              placeholderTextColor="#6F7A90"
              selectTextOnFocus
              value={draftInput}
            />
            <Text className="pb-3 text-lg font-bold text-muted-strong">kg</Text>
          </View>
          <Text className="text-center text-sm leading-6 text-muted">
            {isOutOfRange
              ? `Unesi broj izmedju ${MIN_WEIGHT_KG} i ${MAX_WEIGHT_KG} kg.`
              : "Upisi tezinu direktno. Cuvamo vrednost sa jednom decimalom."}
          </Text>
        </Card>

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
            label={todayWeightKg === null ? "Sacuvaj jutarnju tezinu" : "Sacuvaj izmenu"}
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
