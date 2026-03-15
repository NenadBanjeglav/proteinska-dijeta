import type { PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/src/components/ui/primary-button";
import { StepHeader } from "@/src/components/onboarding/step-header";

type OnboardingStepScreenProps = PropsWithChildren<{
  step: number;
  title: string;
  description: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  showProgress?: boolean;
  scroll?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
  progressLabel?: string;
  showHeader?: boolean;
}>;

export function OnboardingStepScreen({
  children,
  step,
  title,
  description,
  primaryLabel,
  onPrimaryPress,
  primaryDisabled = false,
  primaryLoading = false,
  showProgress = true,
  scroll = true,
  showBack = true,
  onBackPress,
  progressLabel,
  showHeader = true,
}: OnboardingStepScreenProps) {
  const progressStep = Math.max(0, step - 1);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-1 bg-background px-6 pt-3">
          {showHeader ? (
            <StepHeader
              description={description}
              showProgress={showProgress}
              showBack={showBack}
              onBackPress={onBackPress}
              progressLabel={progressLabel}
              progressStep={progressStep}
              title={title}
              total={7}
            />
          ) : null}

          {scroll ? (
            <ScrollView
              className="flex-1"
              contentContainerClassName={
                showHeader ? "flex-grow gap-4 pb-8 pt-6" : "flex-grow gap-4 pb-8 pt-2"
              }
              contentInsetAdjustmentBehavior="automatic"
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          ) : (
            <View className={showHeader ? "flex-1 gap-4 pb-8 pt-6" : "flex-1 gap-4 pb-8 pt-2"}>
              {children}
            </View>
          )}
        </View>

        <View className="border-t border-white/5 bg-background px-6 pb-6 pt-4">
          <PrimaryButton
            disabled={primaryDisabled}
            label={primaryLabel}
            loading={primaryLoading}
            onPress={onPrimaryPress}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
