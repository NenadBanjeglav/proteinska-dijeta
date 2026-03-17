import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { router } from "expo-router";

import {
  INITIAL_ONBOARDING_STATE,
  buildOnboardingPreview,
  buildOnboardingProfile,
  getFirstIncompleteStep,
  getNextStep,
  getPreviousStep,
  getRouteForStep,
  isStepValid,
  type OnboardingStep,
} from "@/src/lib/onboarding";
import { usePsmfStore } from "@/src/store/psmf-store";
import type { OnboardingWizardState } from "@/src/types/app";

type OnboardingWizardContextValue = {
  state: OnboardingWizardState;
  reset: () => void;
  syncStep: (step: OnboardingStep) => void;
  canContinue: boolean;
  commitStep: (patch?: Partial<OnboardingWizardState>) => boolean;
  goNext: () => boolean;
  goBack: () => boolean;
  confirm: (patch?: Partial<OnboardingWizardState>) => Promise<boolean>;
  isSubmitting: boolean;
};

const OnboardingWizardContext =
  React.createContext<OnboardingWizardContextValue | null>(null);

export function OnboardingWizardProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(INITIAL_ONBOARDING_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stateRef = useRef(state);
  const saveOnboardingProfile = usePsmfStore(
    (store) => store.saveOnboardingProfile,
  );

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const reset = useCallback(() => {
    setState(INITIAL_ONBOARDING_STATE);
  }, []);

  const syncStep = useCallback((step: OnboardingStep) => {
    const current = stateRef.current;
    const firstIncompleteStep = getFirstIncompleteStep(current);

    if (step !== 1 && step > firstIncompleteStep) {
      router.replace(getRouteForStep(firstIncompleteStep));
      return;
    }

    setState((previous) =>
      previous.step === step ? previous : { ...previous, step },
    );
  }, []);

  const commitStep = useCallback(
    (patch: Partial<OnboardingWizardState> = {}) => {
      const nextState = { ...state, ...patch };
      if (!isStepValid(nextState, state.step)) {
        return false;
      }

      const nextStep = getNextStep(state.step);
      setState({ ...nextState, step: nextStep ?? state.step });

      if (nextStep) {
        router.push(getRouteForStep(nextStep));
      }

      return true;
    },
    [state],
  );

  const goNext = useCallback(() => commitStep(), [commitStep]);

  const goBack = useCallback(() => {
    const previousStep = getPreviousStep(state.step);
    if (!previousStep) {
      return false;
    }

    setState((current) => ({ ...current, step: previousStep }));
    router.replace(getRouteForStep(previousStep));
    return true;
  }, [state.step]);

  const confirm = useCallback(async (patch: Partial<OnboardingWizardState> = {}) => {
    const nextState = { ...stateRef.current, ...patch };
    const profile = buildOnboardingProfile(nextState);
    if (!profile) {
      return false;
    }

    setIsSubmitting(true);
    try {
      setState(nextState);
      await saveOnboardingProfile(profile);
      reset();
      router.replace("/(tabs)/home");
      return true;
    } finally {
      setIsSubmitting(false);
    }
  }, [reset, saveOnboardingProfile]);

  return (
    <OnboardingWizardContext.Provider
      value={{
        state,
        reset,
        syncStep,
        canContinue: isStepValid(state, state.step),
        commitStep,
        goNext,
        goBack,
        confirm,
        isSubmitting,
      }}
    >
      {children}
    </OnboardingWizardContext.Provider>
  );
}

export function useOnboardingWizard() {
  const context = React.use(OnboardingWizardContext);
  if (!context) {
    throw new Error("useOnboardingWizard must be used inside OnboardingWizardProvider");
  }

  return {
    ...context,
    preview: buildOnboardingPreview(context.state),
  };
}
