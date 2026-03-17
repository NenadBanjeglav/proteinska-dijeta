import { Pressable, Text, View } from "react-native";

import { MEAL_SUPPLEMENT_DEFINITIONS } from "@/src/constants/protocol";
import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/cn";
import type { MealSupplementKey, MealSupplements } from "@/src/types/app";

type MealBuilderSupplementsStepProps = {
  supplements: MealSupplements;
  availableKeys: MealSupplementKey[];
  onToggle: (key: MealSupplementKey) => void;
};

function SupplementCard({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <Card className={cn("gap-3 px-4 py-4", selected && "border-warning bg-surface-strong")}>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className="text-base font-bold text-text">{label}</Text>
            <Text className="text-sm leading-6 text-muted">{description}</Text>
          </View>
          <View
            className={cn(
              "mt-1 h-5 w-5 rounded-full border-2",
              selected ? "border-warning bg-warning" : "border-border",
            )}
          />
        </View>
      </Card>
    </Pressable>
  );
}

function SupplementSection({
  title,
  keys,
  supplements,
  onToggle,
}: {
  title: string;
  keys: MealSupplementKey[];
  supplements: MealSupplements;
  onToggle: (key: MealSupplementKey) => void;
}) {
  if (!keys.length) {
    return null;
  }

  return (
    <View className="gap-3">
      <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-warning">
        {title}
      </Text>
      {MEAL_SUPPLEMENT_DEFINITIONS.filter((definition) => keys.includes(definition.key)).map(
        (definition) => (
          <SupplementCard
            key={definition.key}
            description={definition.description}
            label={definition.label}
            onPress={() => onToggle(definition.key)}
            selected={supplements[definition.key]}
          />
        ),
      )}
    </View>
  );
}

export function MealBuilderSupplementsStep({
  supplements,
  availableKeys,
  onToggle,
}: MealBuilderSupplementsStepProps) {
  const perMealKeys = availableKeys.filter((key) => {
    const definition = MEAL_SUPPLEMENT_DEFINITIONS.find((item) => item.key === key);
    return definition?.dailyLimit === null;
  });
  const dailyKeys = availableKeys.filter((key) => {
    const definition = MEAL_SUPPLEMENT_DEFINITIONS.find((item) => item.key === key);
    return definition?.dailyLimit !== null;
  });

  return (
    <View className="gap-4">
      <Card className="gap-2">
        <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
          Suplementi za ovaj obrok
        </Text>
        <Text className="text-sm leading-6 text-muted">
          Omega-3 i kalijumovu so oznacavas po obroku. Dnevni suplementi nestaju kad
          ispune svoj dnevni limit.
        </Text>
      </Card>

      <SupplementSection
        keys={perMealKeys}
        onToggle={onToggle}
        supplements={supplements}
        title="Uz ovaj obrok"
      />

      {dailyKeys.length ? (
        <SupplementSection
          keys={dailyKeys}
          onToggle={onToggle}
          supplements={supplements}
          title="Dnevni suplementi"
        />
      ) : (
        <Card className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-muted">
            Dnevni suplementi
          </Text>
          <Text className="text-sm leading-6 text-muted">
            Multivitamin, kalcijum i magnezijum su vec rasporedjeni kroz ranije obroke
            danas.
          </Text>
        </Card>
      )}
    </View>
  );
}
