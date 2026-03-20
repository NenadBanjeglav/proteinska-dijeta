import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router, Stack } from "expo-router";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

import { SelectionCard } from "@/src/components/onboarding/selection-card";
import { Card } from "@/src/components/ui/card";
import { HeaderActionButton } from "@/src/components/ui/header-action-button";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { Screen } from "@/src/components/ui/screen";
import { Toggle } from "@/src/components/ui/toggle";
import {
  formatNumberInput,
  isBodyFatValid,
  isGoalWeightValid,
  parseNumberInput,
} from "@/src/lib/onboarding";
import { buildPlanSummary, getCurrentWeightKgFromStore } from "@/src/lib/plan";
import { formatProjectedDays, formatProjectionDate } from "@/src/lib/projection";
import { roundTo } from "@/src/lib/units";
import { usePsmfStore } from "@/src/store/psmf-store";
import type { Activity, Gender } from "@/src/types/app";

const ACTIVITY_OPTIONS: {
  title: string;
  description: string;
  value: Activity;
}[] = [
  {
    title: "Neaktivan",
    description: "Sedentaran dan i bez redovnog treninga.",
    value: "inactive",
  },
  {
    title: "Kardio",
    description: "Redovan kardio ili drugi aerobni treninzi.",
    value: "aerobics",
  },
  {
    title: "Tegovi",
    description: "Redovni treninzi sa tegovima i fokus na očuvanje mišića.",
    value: "weights",
  },
];

function formatProjectionSummary(days: number | null) {
  return days === null ? "Bez procene" : formatProjectedDays(days);
}

function formatProjectionTarget(date: string | null) {
  return date ? formatProjectionDate(date) : "Nedostupno";
}

function formatDeltaLabel(currentValue: string, nextValue: string) {
  return currentValue === nextValue ? currentValue : `${currentValue} -> ${nextValue}`;
}

export default function SettingsRoute() {
  const data = usePsmfStore((store) => store.data);
  const clearStore = usePsmfStore((store) => store.clearStore);
  const updatePlanSettings = usePsmfStore((store) => store.updatePlanSettings);
  const [isResetting, setIsResetting] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [draftName, setDraftName] = useState(data.userName ?? "");
  const [draftGender, setDraftGender] = useState<Gender>(data.gender ?? "male");
  const [draftBodyFat, setDraftBodyFat] = useState(formatNumberInput(data.bodyFatPct, 1));
  const [draftGoalWeight, setDraftGoalWeight] = useState(
    formatNumberInput(data.goalWeightKg, 1),
  );
  const [draftActivity, setDraftActivity] = useState<Activity | null>(data.activity);
  const appName = Constants.expoConfig?.name ?? "Proteinska Dijeta";
  const appVersion = Constants.expoConfig?.version ?? "0.1.0";
  const waterDays = Object.keys(data.waterGlassesByDate).length;
  const currentWeightKg = getCurrentWeightKgFromStore(data);
  const parsedBodyFat = parseNumberInput(draftBodyFat);
  const parsedGoalWeight = parseNumberInput(draftGoalWeight);
  const trimmedName = draftName.trim();
  const normalizedName = trimmedName ? trimmedName : null;

  useEffect(() => {
    setDraftName(data.userName ?? "");
    setDraftGender(data.gender ?? "male");
    setDraftBodyFat(formatNumberInput(data.bodyFatPct, 1));
    setDraftGoalWeight(formatNumberInput(data.goalWeightKg, 1));
    setDraftActivity(data.activity);
  }, [data.activity, data.bodyFatPct, data.gender, data.goalWeightKg, data.userName]);

  const currentPlan = useMemo(
    () =>
      buildPlanSummary({
        startDate: data.startDate,
        startingWeightKg: data.startingWeightKg,
        currentWeightKg,
        goalWeightKg: data.goalWeightKg,
        gender: data.gender,
        bodyFatPct: data.bodyFatPct,
        activity: data.activity,
      }),
    [
      currentWeightKg,
      data.activity,
      data.bodyFatPct,
      data.gender,
      data.goalWeightKg,
      data.startDate,
      data.startingWeightKg,
    ],
  );

  const nextPlan = useMemo(
    () =>
      buildPlanSummary({
        startDate: data.startDate,
        startingWeightKg: data.startingWeightKg,
        currentWeightKg,
        goalWeightKg: parsedGoalWeight,
        gender: draftGender,
        bodyFatPct: parsedBodyFat,
        activity: draftActivity,
      }),
    [
      currentWeightKg,
      data.startDate,
      data.startingWeightKg,
      draftActivity,
      draftGender,
      parsedBodyFat,
      parsedGoalWeight,
    ],
  );

  const canSaveGoal = isGoalWeightValid(currentWeightKg, parsedGoalWeight);
  const canSaveBodyFat = isBodyFatValid(parsedBodyFat);
  const hasChanges =
    normalizedName !== data.userName ||
    draftGender !== data.gender ||
    (parsedBodyFat !== null ? roundTo(parsedBodyFat, 1) : null) !== data.bodyFatPct ||
    draftActivity !== data.activity ||
    (parsedGoalWeight !== null ? roundTo(parsedGoalWeight, 1) : null) !== data.goalWeightKg;

  const canSavePlan =
    hasChanges &&
    canSaveBodyFat &&
    canSaveGoal &&
    draftActivity !== null &&
    nextPlan.proteinTargetG !== null &&
    nextPlan.projection?.status !== "invalid";

  function handleResetPress() {
    if (isResetting) {
      return;
    }

    Alert.alert(
      "Obriši lokalne podatke",
      "Ovo će obrisati onboarding, težine, obroke i vodu sa ovog uređaja. Posle toga aplikacija kreće ispočetka.",
      [
        { text: "Otkaži", style: "cancel" },
        {
          text: "Obriši sve",
          style: "destructive",
          onPress: () => {
            setIsResetting(true);
            void clearStore()
              .then(() => {
                router.replace("/onboarding/welcome");
              })
              .finally(() => {
                setIsResetting(false);
              });
          },
        },
      ],
    );
  }

  function handleSavePlan() {
    if (
      !canSavePlan ||
      parsedBodyFat === null ||
      parsedGoalWeight === null ||
      draftActivity === null ||
      nextPlan.proteinTargetG === null
    ) {
      return;
    }

    const confirmationLines = [
      `Proteini danas: ${formatDeltaLabel(
        currentPlan.proteinTargetG === null ? "Nedostupno" : `${currentPlan.proteinTargetG} g`,
        `${nextPlan.proteinTargetG} g`,
      )}`,
      `Kalorije procena: ${formatDeltaLabel(
        currentPlan.calorieTarget === null ? "Nedostupno" : `${currentPlan.calorieTarget} kcal`,
        nextPlan.calorieTarget === null ? "Nedostupno" : `${nextPlan.calorieTarget} kcal`,
      )}`,
      `Put do cilja: ${formatDeltaLabel(
        formatProjectionSummary(currentPlan.projection?.projectedDays ?? null),
        formatProjectionSummary(nextPlan.projection?.projectedDays ?? null),
      )}`,
    ];

    if (nextPlan.projection?.projectedTargetDate) {
      confirmationLines.push(
        `Procenjeni datum cilja: ${formatProjectionDate(nextPlan.projection.projectedTargetDate)}`,
      );
    }

    if (nextPlan.projection?.message) {
      confirmationLines.push(nextPlan.projection.message);
    }

    Alert.alert("Primeni nove parametre?", confirmationLines.join("\n\n"), [
      { text: "Nazad", style: "cancel" },
      {
        text: "Primeni",
        onPress: () => {
          setIsSavingPlan(true);
          void updatePlanSettings({
            userName: normalizedName,
            gender: draftGender,
            bodyFatPct: roundTo(parsedBodyFat, 1),
            activity: draftActivity,
            goalWeightKg: roundTo(parsedGoalWeight, 1),
            proteinTargetG: nextPlan.proteinTargetG!,
            goalTotalDays: nextPlan.goalTotalDays,
          }).finally(() => {
            setIsSavingPlan(false);
          });
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: "slide_from_right" }} />

      <Screen contentClassName="gap-5">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-[40px] font-black leading-[44px] text-text">
              Podešavanja
            </Text>
            <Text className="text-base leading-6 text-muted">
              Menjaj parametre plana bez resetovanja istorije. Težine, obroci i voda ostaju sačuvani.
            </Text>
          </View>

          <HeaderActionButton
            accessibilityLabel="Nazad"
            icon="arrow-back"
            onPress={() => router.back()}
          />
        </View>

        <Card className="gap-4 border-warning/30 bg-surface">
          <View className="gap-1">
            <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
              Parametri plana
            </Text>
            <Text className="text-2xl font-black text-text">Uredi plan bez novog početka</Text>
            <Text className="text-sm leading-6 text-muted">
              Menjaj pol, BF procenu, aktivnost i ciljnu težinu. Aplikacija odmah preračunava današnji cilj i projekciju.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
              Ime je opciono
            </Text>
            <TextInput
              autoCapitalize="words"
              autoCorrect={false}
              className="rounded-3xl bg-surface-soft px-5 py-4 text-lg font-semibold text-text"
              onChangeText={setDraftName}
              placeholder="Upiši ime ili ostavi prazno"
              placeholderTextColor="#64748B"
              value={draftName}
            />
          </View>

          <View className="gap-2">
            <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
              Pol
            </Text>
            <Toggle
              onChange={setDraftGender}
              options={[
                { label: "Muški", value: "male" },
                { label: "Ženski", value: "female" },
              ]}
              value={draftGender}
            />
          </View>

          <View className="gap-2">
            <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
              Procena telesnih masti
            </Text>
            <TextInput
              className="rounded-3xl bg-surface-soft px-5 py-4 text-2xl font-bold text-text"
              keyboardType="decimal-pad"
              onChangeText={setDraftBodyFat}
              placeholder="22"
              placeholderTextColor="#64748B"
              value={draftBodyFat}
            />
            <Text className="text-sm leading-6 text-muted">
              U podešavanjima držimo samo krajnju BF procenu. Ako si u onboarding-u koristio BMI, ovde menjaš rezultat direktno.
            </Text>
            {!canSaveBodyFat && draftBodyFat.length ? (
              <Text className="text-sm leading-6 text-danger">
                Procena BF mora da bude između 4% i 60%.
              </Text>
            ) : null}
          </View>

          <View className="gap-2">
            <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
              Aktivnost
            </Text>
            <View className="gap-3">
              {ACTIVITY_OPTIONS.map((option) => (
                <SelectionCard
                  key={option.value}
                  description={option.description}
                  onPress={() => setDraftActivity(option.value)}
                  selected={draftActivity === option.value}
                  title={option.title}
                />
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
              Ciljna težina
            </Text>
            <TextInput
              className="rounded-3xl bg-surface-soft px-5 py-4 text-2xl font-bold text-text"
              keyboardType="decimal-pad"
              onChangeText={setDraftGoalWeight}
              placeholder="Unesi ciljnu težinu"
              placeholderTextColor="#64748B"
              value={draftGoalWeight}
            />
            <Text className="text-sm leading-6 text-muted">
              Trenutna težina za poređenje: {formatNumberInput(currentWeightKg, 1)} kg
            </Text>
            {currentWeightKg !== null &&
            parsedGoalWeight !== null &&
            parsedGoalWeight >= currentWeightKg ? (
              <Text className="text-sm leading-6 text-danger">
                Ciljna težina mora da bude niža od trenutne da bi projekcija imala smisla.
              </Text>
            ) : null}
          </View>
        </Card>

        <Card className="gap-3 border-warning/30 bg-surface-strong">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Pregled promene
          </Text>

          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-[120px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Proteini danas</Text>
              <Text className="text-2xl font-black text-text">
                {formatDeltaLabel(
                  currentPlan.proteinTargetG === null ? "Nedostupno" : `${currentPlan.proteinTargetG} g`,
                  nextPlan.proteinTargetG === null ? "Nedostupno" : `${nextPlan.proteinTargetG} g`,
                )}
              </Text>
            </View>
            <View className="min-w-[120px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Kalorije</Text>
              <Text className="text-2xl font-black text-text">
                {formatDeltaLabel(
                  currentPlan.calorieTarget === null ? "Nedostupno" : `${currentPlan.calorieTarget}`,
                  nextPlan.calorieTarget === null ? "Nedostupno" : `${nextPlan.calorieTarget}`,
                )}
              </Text>
            </View>
            <View className="min-w-[120px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Put do cilja</Text>
              <Text className="text-2xl font-black text-text">
                {formatDeltaLabel(
                  formatProjectionSummary(currentPlan.projection?.projectedDays ?? null),
                  formatProjectionSummary(nextPlan.projection?.projectedDays ?? null),
                )}
              </Text>
            </View>
            <View className="min-w-[120px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Ciljni datum</Text>
              <Text className="text-2xl font-black text-text">
                {formatProjectionTarget(nextPlan.projection?.projectedTargetDate ?? null)}
              </Text>
            </View>
          </View>

          <Text className="text-sm leading-6 text-muted">
            {nextPlan.projection?.message ??
              "Kada promeniš parametre, odmah menjamo današnji cilj proteina i projekciju."}
          </Text>

          <PrimaryButton
            disabled={!canSavePlan || isSavingPlan}
            label="Primeni izmene plana"
            loading={isSavingPlan}
            onPress={handleSavePlan}
            variant="secondary"
          />
        </Card>

        <Card className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Zaključana baza faze
          </Text>
          <Text className="text-sm leading-6 text-muted">
            Datum početka i početna težina ostaju zaključani da istorija težine zadrži smisao. Ako ti treba potpuno nov početak, koristi reset aplikacije.
          </Text>
        </Card>

        <Card className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            O aplikaciji
          </Text>
          <View className="gap-1">
            <Text className="text-2xl font-black text-text">{appName}</Text>
            <Text className="text-sm text-muted">Verzija {appVersion}</Text>
          </View>
          <Text className="text-sm leading-6 text-muted">
            Aplikacija za lokalno praćenje proteina, težine, vode i napretka u PSMF fazi.
          </Text>
          <Text className="text-sm leading-6 text-muted">
            Podaci ostaju samo na ovom uređaju. Aplikacija nema nalog, cloud ni deljenje podataka.
          </Text>
        </Card>

        <Card className="gap-3">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
            Tvoji lokalni podaci
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="min-w-[96px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Težine</Text>
              <Text className="text-3xl font-black text-text">{data.weightHistory.length}</Text>
            </View>
            <View className="min-w-[96px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Obroci</Text>
              <Text className="text-3xl font-black text-text">{data.meals.length}</Text>
            </View>
            <View className="min-w-[96px] flex-1 gap-1">
              <Text className="text-xs uppercase tracking-[1.6px] text-muted">Dani vode</Text>
              <Text className="text-3xl font-black text-text">{waterDays}</Text>
            </View>
          </View>
          <Text className="text-sm leading-6 text-muted">
            Reset briše sve ove podatke i vraća te na onboarding.
          </Text>
        </Card>

        <Card className="gap-4 border-danger/30 bg-danger/10">
          <View className="gap-1">
            <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-danger">
              Reset aplikacije
            </Text>
            <Text className="text-2xl font-black text-text">Obriši sve lokalne podatke</Text>
          </View>
          <Text className="text-sm leading-6 text-muted">
            Koristi ovo samo ako zaista želiš da kreneš ispočetka. Ova radnja je trajna.
          </Text>

          <Pressable
            accessibilityRole="button"
            className="min-h-[60px] items-center justify-center rounded-3xl border border-danger/30 bg-danger/15 px-6"
            disabled={isResetting}
            onPress={handleResetPress}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons color="#F04438" name="trash-outline" size={18} />
              <Text className="text-base font-semibold text-danger">
                {isResetting ? "Brišem podatke..." : "Obriši sve i kreni ispočetka"}
              </Text>
            </View>
          </Pressable>
        </Card>
      </Screen>
    </>
  );
}
