# AGENT.md — PSMF App Build Guide for Codex

## 1) Project mission
Build a **local-first React Native Expo app** for the Serbian market that guides users through the **Protein Sparing Modified Fast (PSMF)** protocol from **Lyle McDonald's Rapid Fat Loss Handbook**.

This app is **not** a generic calorie tracker.

It has 3 core jobs:
1. Calculate the user's **daily protein target** from body composition.
2. Let the user **log daily weight and meals** with very low friction.
3. Show **progress over time** in a simple, motivating way.

## 2) Product constraints that must not be broken
These are hard rules.

- **No backend**.
- **No auth**.
- **No API calls**.
- **No analytics**.
- **No server state**.
- **All app text must be in Serbian**.
- **All values are stored locally on the device**.
- **Persistence uses AsyncStorage**.
- **Navigation uses Expo Router**.
- **Styling uses NativeWind**.
- **Units shown to the user are metric by default**.
- **Internally store weight in kg**.
- **Keep the visual style dark, minimal, readable, and intense, but not cluttered**.

## 3) UX goals
The app should feel like:
- a focused protocol tool
- clear and disciplined
- fast to use in the morning
- visually strong without being noisy
- trustworthy, not gimmicky

The app should **not** feel like:
- a general fitness social app
- a bodybuilder macro calculator with endless settings
- a medical records app
- a gamified toy

## 4) Design direction
### Theme
- Background: `#0f0f14`
- Surface cards: slightly lighter dark neutrals
- Primary accent: orange to red gradient
- Success: green
- Warning/info: amber
- Neutral helper text: cool gray

### Visual rules
- Prioritize **readability over decoration**.
- Avoid tiny text for important guidance.
- Every screen should have **one obvious focal point**.
- Cards should breathe: use solid padding and spacing.
- Use gradient mainly for **primary CTA** and high-value metrics.
- Avoid making every box equally loud.

### Typography rules
- Primary metric numbers should be large and obvious.
- Card labels and helper text must remain readable on small phones.
- Avoid dense blocks of fine print.
- Increase line-height for disclaimers, notes, and supplement lists.

### Mock source of truth
- When a local mock exists in `/mocks`, use it as the primary source for layout, spacing, hierarchy, and CTA placement.
- Current visual source files are `mocks/onboarding/*`, `mocks/danas.png`, and `mocks/napredak.png`.
- `AGENT.md` remains the source of truth for behavior, data rules, calculations, and edge cases.

## 5) Core product flows
### Flow A — Onboarding
A one-time 8-screen wizard:
1. Welcome
2. Name
3. Gender
4. Weight
5. Body fat
6. Activity
7. Goal
8. Summary

### Flow B — Daily Dashboard
After onboarding, the user lands on the daily dashboard.
This is the main repeated-use screen.

### Flow C — Progress
The user can review weight history, total loss, trends, and milestones.

### V1 scope note
`Trening` is out of scope for V1.
Keep workout guidance in this document only as future reference material unless explicitly requested later.

## 6) Storage model
Store everything under a single AsyncStorage key:

- key: `psmf_store`

### Required V1 shape
```ts
export type GoalType = 'kickstart' | 'plateau' | 'event' | 'full';
export type Gender = 'male' | 'female';
export type Activity = 'inactive' | 'aerobics' | 'weights';
export type LoggedMealItemKind = 'protein' | 'vegetable' | 'condiment';

export type WeightEntry = {
  date: string; // YYYY-MM-DD
  kg: number;
};

export type LoggedMealItem = {
  id: string;
  foodId: string;
  kind: LoggedMealItemKind;
  label: string;
  grams: number;
  proteinG: number;
  calories: number;
};

export type LoggedMeal = {
  id: string;
  name: string;
  items: LoggedMealItem[];
  proteinG: number;
  calories: number;
  date: string; // YYYY-MM-DD
};

export type PSMFStore = {
  userName: string | null;
  startDate: string | null;
  startingWeightKg: number | null;
  proteinTargetG: number | null;
  gender: Gender | null;
  bodyFatPct: number | null;
  activity: Activity | null;
  goalType: GoalType | null;
  goalTotalDays: number | null;
  weightHistory: WeightEntry[];
  meals: LoggedMeal[];
  waterGlassesByDate: Record<string, number>;
};
```

### Forward-compatible extension policy
The original spec's base keys remain part of the canonical V1 store. For this app plan, the full shape above is the required persisted V1 app shape.

Future additions are allowed, but:
- do not remove the required legacy base keys: `userName`, `startingWeightKg`, `proteinTargetG`, `weightHistory`
- do not split persistence across multiple storage roots unless there is a strong reason
- keep hydration simple

### Hydration defaults for missing fields
```ts
const DEFAULT_STORE: PSMFStore = {
  userName: null,
  startDate: null,
  startingWeightKg: null,
  proteinTargetG: null,
  gender: null,
  bodyFatPct: null,
  activity: null,
  goalType: null,
  goalTotalDays: null,
  weightHistory: [],
  meals: [],
  waterGlassesByDate: {},
};
```

Hydration rule:
- Older persisted data may miss some of the newer required V1 keys.
- `src/store/storage.ts` must merge parsed data onto `DEFAULT_STORE` so the app always works with a fully shaped `PSMFStore`.

Keep `proteinTargetG` as a single stored target in V1 even when Category 1 screens also show the handbook range as explanatory UI.

### Onboarding persistence rule for this app plan
Once onboarding is confirmed, persist these fields together in the same write:
- `userName`
- `startDate`
- `startingWeightKg`
- `proteinTargetG`
- `gender`
- `bodyFatPct`
- `activity`
- `goalType`
- `goalTotalDays`

`startDate` is mandatory after onboarding confirmation and is the canonical anchor for elapsed-day, compliance, and protocol-progress calculations.

### Goal duration defaults
Persist one deterministic duration per goal card:

```ts
const GOAL_DAYS: Record<GoalType, number> = {
  kickstart: 14,
  plateau: 14,
  event: 21,
  full: 35,
};
```

### Meal persistence note
Store `LoggedMealItem` rows with per-item protein and calorie values at save time.
Reason: historical meals should stay stable even if the local food database changes later.

### Onboarding types
Use these concrete internal types so onboarding state and persistence are not left implicit.

```ts
type WeightUnit = 'kg' | 'lbs';
type BodyFatInputMode = 'manual' | 'bmi';

type OnboardingWizardState = {
  step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  userName: string;
  gender: Gender;
  weightKg: number | null;
  weightUnit: WeightUnit;
  bodyFatMode: BodyFatInputMode;
  bodyFatPct: number | null;
  heightCm: number | null;
  activity: Activity | null;
  goalType: GoalType | null;
};

type OnboardingProfile = {
  userName: string;
  startDate: string; // YYYY-MM-DD
  startingWeightKg: number;
  proteinTargetG: number;
  gender: Gender;
  bodyFatPct: number;
  activity: Activity;
  goalType: GoalType;
  goalTotalDays: number;
};
```

Rules:
- `OnboardingWizardState` is local wizard state only and is not persisted before final confirmation.
- `OnboardingProfile` is the confirmed payload written once on the summary CTA.
- Screen-local draft UI values do not need to be mirrored into `OnboardingWizardState` until the step is committed.

## 7) Store interface
The project must expose a tiny storage API with pure helpers.

### Required helpers
```ts
getStore()
setUserName(name)
getUserName()
setStartingWeight(kg)
setProteinTarget(g)
saveOnboardingProfile(profile)
getOnboardingProfile()
saveWeightEntry(kg, date) // upsert by date
getTodayEntry(date)
getPreviousEntry(date) // most recent previous or fallback to startingWeightKg
saveMeal(meal) // upsert by id
deleteMeal(mealId)
getMealsByDate(date)
setWaterGlasses(date, count)
getWaterGlasses(date)
clearStore()
```

### Implementation rules
- All store functions should be async where persistence is involved.
- Keep parsing and serialization in one place.
- Persist the confirmed onboarding profile atomically in one write path.
- Add runtime guards for malformed JSON.
- Never crash the app on bad persisted data.
- Always return safe defaults.
- Treat these helpers as the low-level persistence API.
- Screens should generally talk to Zustand actions and selectors, not directly to AsyncStorage helpers.

### Architecture split
- `src/store/storage.ts` handles AsyncStorage I/O only.
- `src/store/psmfStore.ts` exposes the Zustand app store and async actions.
- `src/store/selectors.ts` computes derived values.
- `src/hooks/useHydratedStore.ts` gates app rendering until hydration completes.

### Global state management decision
Use `zustand` for the hydrated app-wide store.

Rules:
- Zustand holds in-memory app state after hydration.
- AsyncStorage remains the persistence source of truth.
- Keep AsyncStorage parsing, serialization, and guards in `src/store/storage.ts`.
- Do not rely on Zustand `persist` middleware for core app persistence.
- Keep onboarding wizard state local until the final summary confirm action.
- Use selectors for derived values and cross-screen reads.

Rationale:
- the app has cross-screen local state but no server state
- `Danas` and `Napredak` need shared reactive updates
- explicit persistence better matches the atomic write and malformed-data requirements already in the spec

### Internal app-store types
These are internal architecture types, not persisted schema changes.

```ts
type HydrationStatus = 'idle' | 'hydrating' | 'ready';

type PSMFAppStore = {
  status: HydrationStatus;
  data: PSMFStore;
  hydrate(): Promise<void>;
  clearStore(): Promise<void>;
  saveOnboardingProfile(profile: OnboardingProfile): Promise<void>;
  saveWeightEntry(kg: number, date: string): Promise<void>;
  saveMeal(meal: LoggedMeal): Promise<void>;
  deleteMeal(mealId: string): Promise<void>;
  setWaterGlasses(date: string, count: number): Promise<void>;
};
```

Additional notes:
- `OnboardingProfile` is the final confirmed payload written once at onboarding completion.
- `OnboardingWizardState` remains local UI state and is not globally persisted during the flow.

## 8) Business logic that must be implemented exactly
This is the heart of the app.

### Step 1 — Lean body mass
```ts
lbmKg = bodyWeightKg * (1 - bodyFatPct / 100)
lbmLbs = lbmKg * 2.20462
```

### Step 2 — Category
#### Male
- Category 1 if BF ≤ 15%
- Category 2 if BF 16–25%
- Category 3 if BF 26%+

#### Female
- Category 1 if BF ≤ 24%
- Category 2 if BF 25–34%
- Category 3 if BF 35%+

### Step 3 — Protein multiplier (g protein / lb LBM)
| Category | Inactive | Cardio | Weights |
|---|---:|---:|---:|
| 1 | 1.0–1.25 | 1.25–1.5 | 1.5–2.0 |
| 2 | 0.9 | 1.1 | 1.25 |
| 3 | 0.8 | 0.9 | 1.0 |

### Step 4 — Deterministic Category 1 rule for a single app target
```ts
if (category === 1) {
  const [min, max] = getProteinRange(category, activity);
  const ratio =
    gender === 'male'
      ? clamp((15 - bodyFatPct) / (15 - 4), 0, 1)
      : clamp((24 - bodyFatPct) / (24 - 8), 0, 1);

  multiplier = min + ratio * (max - min);
}
```

Category 1 uses the handbook range, but the app still stores one exact `proteinTargetG`.
Rule: the lower the body fat inside Category 1, the closer the derived multiplier should move toward the top of the handbook range.

### Step 5 — Daily protein target
```ts
proteinG = Math.round(lbmLbs * multiplier)
```

### Estimated calories on summary
```ts
estimatedCal = Math.round(proteinG * 4 + 20)
```

### Activity and Summary screen copy guidance
- Show the handbook range on both the Activity and Summary screens.
- Show the resolved single multiplier and final `proteinTargetG` clearly.
- Explain in Serbian that lower body fat inside Category 1 moves the target toward the upper end of the handbook range.

### Required calc functions
Create a dedicated pure module, for example:
- `src/lib/psmf.ts`

It should export pure functions like:
```ts
getCategory(gender, bodyFatPct)
getProteinRange(category, activity)
calcProteinMultiplier(gender, bodyFatPct, activity)
calcLeanBodyMassKg(weightKg, bodyFatPct)
calcLeanBodyMassLbs(weightKg, bodyFatPct)
calcProteinTarget(weightKg, bodyFatPct, gender, activity)
calcEstimatedCalories(proteinG)
```

## 9) BMI → body fat estimate
When the user does not know body fat %, the app can estimate it from BMI.

### Implementation formula
Do not implement BMI via the handbook's height/weight lookup chart.
Use the standard BMI formula:

```ts
bmi = weightKg / (heightM * heightM)
```

### Handbook BMI → body-fat table
Put this table in `src/constants/bmiTable.ts`.

```ts
export const BMI_ROWS = [13, 14, 15, 16, 17, 18.5, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];

export const FEMALE_BF = [13.5, 15, 16.5, 18, 19.5, 21, 22.5, 24, 25.5, 27, 28.5, 30, 31.5, 33, 34.5, 36, 37.5, 39, 40.5, 42, 43.5, 45, 46.5, 48, 49.5, 51, 52.5, 54];

export const MALE_BF = [null, null, null, 5, 6.5, 8, 9.5, 11, 12.5, 14, 15.5, 17, 18.5, 20, 21.5, 23, 24.5, 26, 27.5, 29, 30.5, 32, 33.5, 35, 36.5, 38, 39.5, 41];
```

### Rules
- Support **linear interpolation** between adjacent BMI rows.
- If `BMI > 40`, add `1.5` body-fat points for each BMI point above `40`.
- If `BMI < 13`, block BMI estimation and require manual body-fat entry.
- If the male lookup lands in a `null` row, block BMI estimation and require manual body-fat entry.
- This is only an estimate.
- In the UI, clearly communicate that the BMI method is for inactive users only and can badly misread athletic or muscular users.

### Required BMI helpers
Put the logic in `src/lib/bmi.ts`.

```ts
calcBmi(weightKg, heightM)
canEstimateBodyFatFromBmi(bmi, gender)
estimateBodyFatFromBmi(bmi, gender)
```

### Implementation note
Put the BMI table and logic in a pure utility module.
Do not bury it inside screen code.

### Serbian warning guidance
Use direct copy such as:
- `BMI procena je samo gruba procena za neaktivne osobe.`
- `Ako si atletski gradjen ili misicav, unesi procenat masti rucno.`

## 10) Source-derived protocol rules
These rules are derived from *The Rapid Fat Loss Handbook* and should shape the product spec, copy, and feature boundaries.

### PSMF basics
- lean protein is the core of the diet
- non-starchy vegetables are effectively unlimited
- include an omega-3 source daily
- include basic multivitamin/mineral support
- planned breaks are part of the protocol, not a failure

### Expectation setting
- early scale drops include water, not only fat
- lighter users usually lose less fat and less total scale weight than heavier users
- metabolic slowdown can begin after roughly 3-4 days of severe restriction
- the handbook frames this as a short, intense protocol rather than a permanent eating pattern

### Appropriate consumer use cases for V1
- `special event`
- `kickstart`
- V1 should not position itself as a contest-prep tool or athlete carb-up planner
- keep a basic medical disclaimer on onboarding and summary surfaces

### Food guidance from source material
- preferred protein sources: skinless chicken breast, low-fat fish, extra lean beef, fat-free dairy, egg whites, lean jerky, limited protein powder
- prefer `1+` dairy servings per day
- protein powder can be used sparingly, but should not be the primary food source
- vegetables are effectively unlimited except peas, corn, carrots, and beets, which should stay minimal
- free condiments and beverages include lemon juice, soy sauce, salsa or pico de gallo, vinegar, mustard, spices, and water

### Supplement defaults for summary and education copy
- fish oil `6 x 1 g` daily or `1 tbsp` flax oil
- sodium `3-5 g/day`
- potassium `up to 1 g/day`
- magnesium `500 mg/day`
- calcium `600-1200 mg/day`, split AM/PM
- daily multivitamin

These supplement defaults belong in onboarding summary copy, protocol education cards, and reference screens.
Do not turn V1 into a medical dosing tracker.

### Protocol length and break guidance
Use this as educational guidance, not mandatory scheduling logic in V1.

| Category | Main stretch | Free meals | Refeed | Post-stretch guidance |
|---|---|---|---|---|
| 1 | `11-12` straight days | none | `2-3` high-carb days at the end | then return to normal dieting guidance |
| 2 | `2-6` weeks | `1/week` | `5-hour` refeed once/week | `2-week` diet break |
| 3 | `6-12` weeks | `2/week` | none | `2-week` diet break |

Protocol notes:
- free meals and refeeds should ideally land on workout days
- they should ideally end in the evening so the next morning can return to the plan cleanly
- next-day weight spikes after free meals or refeeds are usually water, not instant fat regain

### Workout guidance from source material
This section is source/reference material only.
Do not build a dedicated workout screen or `Trening` tab in V1.

- weight training is preferred over cardio for LBM retention
- beginners: full body, `1` exercise per body part, `12-15` reps, light weights, `2x/week`, `3x/week` absolute max
- experienced lifters: keep intensity, sharply cut volume and frequency, full body every `3-4` days, a few heavy sets in the `6-8` range
- cardio is optional and modest: roughly `20-40` minutes, `3-5x/week`
- intervals are not recommended for beginners and are not a V1 focus

Add source-backed constants/modules to the spec:
- `src/constants/bmiTable.ts`
- `src/constants/protocol.ts`

## 11) Folder structure recommendation
Use a structure that stays understandable as the app grows.

```txt
app/
  _layout.tsx
  index.tsx
  onboarding/
    welcome.tsx
    name.tsx
    gender.tsx
    weight.tsx
    body-fat.tsx
    activity.tsx
    goal.tsx
    summary.tsx
  (tabs)/
    _layout.tsx
    home.tsx
    progress.tsx

src/
  components/
    ui/
      PrimaryButton.tsx
      ProgressBar.tsx
      Screen.tsx
      Card.tsx
      SectionHeader.tsx
      EmptyState.tsx
      Chip.tsx
      Toggle.tsx
      StatTile.tsx
      BottomSheet.tsx
    onboarding/
      StepHeader.tsx
      SelectionCard.tsx
      NumericInputCard.tsx
    dashboard/
      MacroRing.tsx
      WeightEntryCard.tsx
      WaterTrackerCard.tsx
      MealCard.tsx
      MealSummary.tsx
    progress/
      WeightChart.tsx
      MilestoneCard.tsx

  constants/
    colors.ts
    foodDb.ts
    bmiTable.ts
    protocol.ts
    copy.ts

  lib/
    date.ts
    psmf.ts
    bmi.ts
    units.ts

  store/
    storage.ts
    psmfStore.ts
    selectors.ts

  hooks/
    useHydratedStore.ts
    useToday.ts

  types/
    app.ts
```

### UI system decision
Do not use a large third-party UI kit for V1.

Rules:
- Build app components and hooks in-house with React Native and NativeWind.
- Do not adopt gluestack, Tamagui, or another primary component system for V1.
- Keep the visual layer custom so screens can match local mocks exactly.
- Allow small infrastructure dependencies only when they solve a narrow technical problem.
- Hide any such dependency behind a local wrapper component or hook.

Rationale:
- V1 has a small screen surface and strict mocks.
- NativeWind is already the styling choice.
- A custom layer is easier to control than adapting a generic UI system.
- Full UI kits add setup, theming, and abstraction overhead without enough payoff for this app.

### UI dependency policy
Allowed by default:
- React Native primitives
- Expo SDK modules
- NativeWind
- Small support libraries behind wrappers when needed

Not allowed by default:
- Full UI kits
- Theme-provider-heavy component systems
- Vendor-owned screen-level APIs

If a UI dependency is considered, it must:
- solve a narrow problem
- preserve Expo Go-first development when practical
- stay behind a local wrapper so it can be swapped later

Examples of allowed narrow problems:
- bottom sheet implementation
- chart rendering
- optional animation helper
- optional gesture helper

### Component architecture
Treat `src/components/ui/*` as the base primitive layer for the app:
- `Screen`
- `PrimaryButton`
- `Card`
- `SectionHeader`
- `EmptyState`
- `Chip`
- `Toggle`
- `ProgressBar`
- `StatTile`
- `BottomSheet`

Treat feature folders as app-specific composition layers:
- `src/components/onboarding/*`
  - `StepHeader`
  - `SelectionCard`
  - `NumericInputCard`
- `src/components/dashboard/*`
  - `MacroRing`
  - `WeightEntryCard`
  - `WaterTrackerCard`
  - `MealCard`
  - `MealSummary`
- `src/components/progress/*`
  - `WeightChart`
  - `MilestoneCard`

Rule:
- Base UI components should be generic enough for app reuse, but not abstracted into a fake design system.

### Base UI component contracts
These are internal interface expectations, not strict required names:

```ts
type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  safeArea?: 'none' | 'top' | 'all';
  contentClassName?: string;
};

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
};

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

type BottomSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};
```

The intent is simple app-facing APIs, not vendor APIs.

### Hook design rules
- Write custom hooks only for reusable stateful logic or screen complexity reduction.
- Do not create hooks for trivial one-screen `useState` values.
- Prefer pure helper functions for calculations and selectors for derived store values.
- Use hooks for orchestration, side effects, subscriptions, and reusable interaction flows.
- If a screen approaches the LOC limit, extract hooks before adding more component nesting.

Recommended hook categories:
- app and store hooks
- feature orchestration hooks
- date and today helpers
- UI interaction hooks only when they simplify repeated behavior

### Initial hook list
Keep these as the initial approved hooks:
- `src/hooks/useHydratedStore.ts`
- `src/hooks/useToday.ts`

Optional hooks to add only when needed:
- `src/hooks/useOnboardingWizard.ts`
- `src/hooks/useProteinProgress.ts`
- `src/hooks/useProtocolProgress.ts`
- `src/hooks/useWeightEntryDraft.ts`
- `src/hooks/useWaterTracker.ts`

Rule:
- Do not create all optional hooks up front; add them only when the corresponding screen logic justifies extraction.

### Hook contracts
These are internal hook expectations, not strict required names:

```ts
type UseHydratedStoreResult = {
  ready: boolean;
};

type UseTodayResult = {
  today: string; // YYYY-MM-DD
};

type UseOnboardingWizardResult = {
  state: OnboardingWizardState;
  update: (patch: Partial<OnboardingWizardState>) => void;
  goNext: () => void;
  goBack: () => void;
  canContinue: boolean;
};
```

Rules:
- `OnboardingWizardState` stays local and is not persisted until final confirm.
- Derived calculations should stay in pure utilities and selectors, not inside UI hooks.

## 12) Navigation rules
### App startup behavior
On app start:
1. Read `psmf_store`.
2. If `startingWeightKg === null`, route to onboarding.
3. Otherwise route to `/(tabs)/home`.

### Tabs
After onboarding, there are 2 bottom tabs:
- `Danas`
- `Napredak`

### Expo development target
Use an `Expo Go first` approach for V1.

Rules:
- V1 should run in Expo Go whenever practical.
- This is a development preference, not a permanent hard constraint.
- Prefer Expo SDK modules and libraries that work in Expo Go.
- Only switch to a development build if a chosen dependency or native capability requires it.
- Do not introduce native-only dependencies casually.
- If a dependency forces a dev client, document that decision explicitly in the spec before adopting it.

Rationale:
- current V1 scope is mostly JS, UI, state, and local persistence, which fits Expo Go well
- Expo Router, AsyncStorage, Zustand, and standard screen logic do not require a dev client by default
- the main risk area is third-party bottom-sheet and chart package choice

### When a development build becomes acceptable
A development build is allowed if one of these becomes necessary:
- a third-party library with native code is not bundled in Expo Go
- a required native capability cannot be validated in Expo Go
- a chosen chart or bottom-sheet dependency cannot run in Expo Go

Additional rules:
- switching to a dev client is an implementation decision that must be reflected back into `AGENT.md`
- do not silently drift from Expo Go to dev-client-only development

## 13) Implementation phases
Build in phases. Do not try to generate the whole app at once.

---

# Phase 1 — Foundation
## Goal
Create the project shell and all shared technical foundations.

## Tasks
1. Bootstrap Expo app with Expo Router and NativeWind.
2. Set up folder structure.
3. Install and configure `zustand`.
4. Verify the initial scaffold runs in Expo Go.
5. Define design tokens for colors, radius, spacing, and typography scale.
6. Create AsyncStorage wrapper.
7. Create base storage module for reading/writing `psmf_store`.
8. Create `src/store/psmfStore.ts` for the Zustand app store and async actions.
9. Create hydration flow from AsyncStorage into Zustand.
10. Create selectors for derived reads.
11. Keep initial dependency choices Expo Go-compatible.
12. Delay any native-only library choice until a wrapper exists and compatibility is checked.
13. Do not install gluestack, Tamagui, or another full UI kit.
14. Create shared custom UI primitives.
15. Create only the initial hooks required for hydration and date handling.
16. Defer additional hooks until screen complexity requires them.
17. Create pure PSMF calculation utilities.
18. Create BMI utilities/table and handbook-derived protocol constants.
19. Create root layout and loading state.
20. Implement first-launch routing logic.

## Definition of done
- App starts without errors.
- App boots in Expo Go.
- Routing works.
- Hydration and routing work in Expo Go.
- Store hydrates safely.
- Hydration gates rendering until the app store is ready.
- No chosen dependency requires a development build in Phase 1.
- Base custom primitives exist.
- No full UI library is required for screen implementation.
- Hooks remain minimal and purpose-specific.
- Calc utilities are unit-testable and separated from UI.
- Basic design system exists.

## Codex prompt for this phase
```md
Build Phase 1 of the PSMF app.
Use Expo Router, NativeWind, AsyncStorage, and Zustand.
Create the folder structure, storage wrapper, Zustand app store, hydration flow, selectors, psmf calculation utilities, bmi utilities, handbook protocol constants, and custom UI primitives.
Keep AsyncStorage integration explicit and do not use Zustand persist middleware as the core persistence layer.
Use Expo Go-compatible dependencies by default.
Do not introduce packages that require a dev client unless the spec is updated first.
Do not install gluestack or another large UI kit.
Build custom primitives and only the minimum hooks needed.
Do not build feature screens yet beyond placeholders.
Keep everything Serbian-ready and local-first.
```

---

# Phase 2 — Onboarding state model
## Goal
Create a stable onboarding state flow before polishing visuals.

## Tasks
1. Create a local onboarding state container.
2. Define types for name, gender, weight input, body fat, activity, goal, and deterministic `goalTotalDays`.
3. Handle cross-screen data passing safely.
4. Add step progress tracking.
5. Keep data in memory until final confirmation.
6. Do not put temporary onboarding step fields into Zustand during the wizard.
7. Treat local wizard state as the only source of truth until summary confirm.
8. Write the entire confirmed onboarding profile into Zustand and AsyncStorage through one final summary action path.

## Definition of done
- User can move through the wizard.
- Back/next behavior works.
- Validation gates work.
- No data is prematurely persisted.
- Temporary onboarding edits do not touch the global app store.

## Codex prompt for this phase
```md
Build the onboarding state model and route flow.
Use local in-memory wizard state until the final summary step.
Do not put onboarding step fields in Zustand during the wizard.
Do not write to AsyncStorage until the user confirms on the last screen.
On final confirm, write the completed profile through one path that updates Zustand and AsyncStorage together.
Implement step progress, validation, deterministic goal-duration mapping, and back/next behavior.
```

---

# Phase 3 — Onboarding screens
## Goal
Build all 8 onboarding screens in order.

## Screen order
1. Dobrodošlica
2. Kako se zoveš?
3. Koji je tvoj pol?
4. Trenutna težina
5. Procenat telesnih masti
6. Nivo aktivnosti
7. Tvoj cilj
8. Rezime

## Per-screen requirements
### Welcome
- strong hero
- benefit bullets
- medical disclaimer
- no back button
- no step counter

### Name
- text input
- warm confirmation banner after typing
- continue disabled until non-empty trimmed input

### Gender
- 2 cards
- default `male`
- thresholds visible

### Weight
- kg/lbs toggle
- live conversion
- store internally in kg

### Body fat
- manual mode and BMI estimate mode
- slider for manual mode
- height input for BMI mode
- BMI mode uses the BMI formula plus the handbook BMI-to-body-fat table
- BMI mode is for inactive users only and must clearly warn that it can misread athletic or muscular users
- unsupported BMI cases must fall back to manual entry
- computed estimate flows into bodyFat on continue

### Activity
- 3 options
- live protein preview
- show category, handbook range, resolved multiplier, and target

### Goal
- 4 options
- expectation setting
- persist `goalType` and deterministic `goalTotalDays` on final confirm

### Summary
- final calculation breakdown
- handbook range explanation for Category 1 when relevant
- source-backed supplement list
- confirm button writes the full onboarding profile, `startDate`, and derived target to store

## Definition of done
- All screens are connected.
- Inputs validate correctly.
- Summary reflects actual calculations.
- Pressing final CTA saves onboarding results and enters tabs.

## Codex prompt for this phase
```md
Build all onboarding screens for the PSMF app.
Match the existing design direction and the mocks in `/mocks/onboarding`, while prioritizing readability and clear hierarchy.
Use Serbian text only.
Respect the calculation rules exactly.
Only persist onboarding data when the final CTA is pressed on the summary screen.
```

---

# Phase 4 — Daily dashboard shell
## Goal
Build the core dashboard structure before advanced interactions.

## Sections
1. Header with greeting and day progress
2. Protein and calorie progress cards
3. Weight entry card
4. Water tracker card
5. Meal log section
6. Add meal CTA

## Important UX rule
This screen will be used daily. Favor clarity over cleverness.
Use `mocks/danas.png` as the primary visual reference.

## Definition of done
- Dashboard loads persisted user data.
- Greeting works.
- Protein target and calorie target display correctly.
- Empty states are handled gracefully.

## Codex prompt for this phase
```md
Build the daily dashboard shell for the PSMF app.
Load user data from local storage.
Show greeting, day progress, protein target, calorie target, weight card, water tracker card, and meal log section.
Handle empty states well.
Do not overpack the screen.
Match the hierarchy in `mocks/danas.png`.
```

---

# Phase 5 — Weight logging
## Goal
Make daily weight entry smooth and reliable.

## Tasks
1. Create weight entry bottom sheet.
2. Show previous weight reference.
3. Add coarse and fine stepper controls.
4. Calculate live delta vs previous day.
5. Save by date using upsert logic.
6. Update dashboard immediately after save.

## Rules
- First entry should feel special and clear.
- Use positive green for drops, caution red for gains.
- Do not shame the user for temporary increases.

## Definition of done
- User can log or edit today's weight.
- Previous-day delta is correct.
- The history persists correctly.

## Codex prompt for this phase
```md
Implement the weight entry flow with a bottom sheet, steppers, live delta versus previous entry, and save-by-date upsert behavior.
Use supportive Serbian copy.
Keep the interaction fast and reliable.
```

---

# Phase 6 — Meal logging
## Goal
Add the food logging system with the hardcoded food database.

## Food database
Keep it local and hardcoded.

### Database rules
- Default macros in `foodDb.ts` should be stored per `100 g` of edible product.
- For meat and fish, use conservative `raw` or `drained` values in the database, not cooked values.
- For jarred or canned vegetables, use `drained` edible values and ignore the brine or marinade.
- Cooked values often look higher because water loss concentrates protein per `100 g`.
- When useful, store a short basis label such as `raw`, `drained`, or `as-packaged`.
- Prefer recognizable Serbian retail labels over obscure terms.
- Every database item must have exact numeric values for protein and calories per `100 g`.
- Do not use ranged macro values such as `1-2g` or `15-20 kcal` inside `foodDb.ts`.
- Do not merge multiple foods into one database item unless they are sold as one retail product.

### Food priority tiers
Classify foods in the local database by practical PSMF priority:

- `tierA`: best default choices; leanest and easiest to use freely inside the plan
- `tierB`: acceptable rotation foods; still valid but less ideal than `tierA`
- `limited`: allowed only in small amounts or with an explicit warning
- `condiment`: flavor/support items, not primary protein or vegetable servings

Implementation note:
- Meal selection UI should show `tierA` first.
- `tierB` can be shown normally but below `tierA`.
- `limited` items should be visually marked and never presented as default “safe unlimited” choices.
- `condiment` items belong in the condiment/support section, not in the main vegetable or protein pickers.

Use an explicit item type in `foodDb.ts`:

```ts
type FoodKind = 'protein' | 'vegetable' | 'condiment';
type FoodPriority = 'tierA' | 'tierB' | 'limited' | 'condiment';
type FoodBasis = 'raw' | 'drained' | 'asPackaged';

type FoodItem = {
  id: string;
  label: string;
  kind: FoodKind;
  priority: FoodPriority;
  basis: FoodBasis;
  proteinPer100g: number;
  caloriesPer100g: number;
};
```

Rule:
- `LoggedMealItem.foodId` must reference `FoodItem.id`.
- The database contract should stay numeric and flat; meal-builder grouping belongs in UI selectors, not in the raw DB rows.

### Protein priority
#### Tier A protein defaults
- Belanca jajeta, sirova
- Pileća prsa bez kože, sirova
- Ćureća prsa bez kože, sirova
- Oslić
- Tunjevina u salamuri, oceđena
- Ella sir / obrani sveži sir
- Grčki ili proteinski jogurt 0%

#### Tier B protein rotation
- Ramstek, sirov, lean
- Biftek, sirov
- Mlevena junetina 95% lean, sirova
- Svinjski file, sirov
- Škampi
- Lignje

#### Limited protein items
- Protein powder should stay limited convenience food, not a default meal base.
- Jerky products should stay limited unless label-checked for very low sugar and low fat.
- Any beef or pork cut meaningfully fattier than the listed lean versions should not be a default PSMF protein.

### Protein sources
- Belanca jajeta, sirova — 11g / 52 kcal
- Pileća prsa bez kože, sirova — 23g / 110 kcal
- Ćureća prsa bez kože, sirova — 24g / 114 kcal
- Ramstek, sirov, lean — 22g / 135 kcal
- Biftek, sirov — 22g / 143 kcal
- Mlevena junetina 95% lean, sirova — 21g / 137 kcal
- Svinjski file, sirov — 21g / 120 kcal
- Oslić — 18g / 86 kcal
- Tunjevina u salamuri, oceđena — 23g / 109 kcal
- Škampi — 20g / 99 kcal
- Lignje — 16g / 92 kcal
- Grčki ili proteinski jogurt 0% — 10g / 59 kcal
- Ella sir / obrani sveži sir — 13g / 67 kcal

### Dairy naming note
- Do not use `skuta` as the primary app label.
- If needed in education copy, explain that `skuta` is a fresh curd or whey-style cheese, but prefer retail-familiar names such as `Ella sir`, `obrani sveži sir`, or `posni sitan sir`.

### Vegetables
- Pečurke — 3g / 22 kcal
- Brokoli — 3g / 34 kcal
- Karfiol — 2g / 25 kcal
- Tikvice — 1g / 17 kcal
- Krastavac — 1g / 15 kcal
- Paradajz — 1g / 18 kcal
- Čeri paradajz — 1g / 18 kcal
- Crni luk — 1g / 40 kcal
- Mladi luk — 2g / 32 kcal
- Paprika / babura — 1g / 31 kcal
- Celer stabljika — 1g / 14 kcal
- Rotkvice — 1g / 16 kcal
- Kupus — 1g / 25 kcal
- Baby spanać — 3g / 23 kcal
- Rukola — 3g / 25 kcal
- Zelena salata — 1g / 15 kcal
- Iceberg salata — 1g / 14 kcal
- Miks listova — 2g / 18 kcal

### Vegetable priority
#### Tier A vegetable defaults
- Pečurke
- Brokoli
- Karfiol
- Tikvice
- Krastavac
- Kupus
- Baby spanać
- Rukola
- Zelena salata
- Iceberg salata
- Miks listova
- Celer stabljika

#### Tier B vegetable rotation
- Paradajz
- Čeri paradajz
- Crni luk
- Mladi luk
- Paprika / babura
- Rotkvice

#### Limited vegetables
- Grašak
- Kukuruz
- Šargarepa
- Cvekla
- Krompir
- Mixed frozen vegetables dominated by the items above

Rule:
- `Tier A` vegetables are the default recommendation when the app says vegetables are effectively unlimited.
- `Tier B` vegetables are allowed, but should not be framed as the core “eat as much as you want” vegetable base.
- `Limited` vegetables must be visually separated from unlimited/default choices.

### Preserved vegetables and condiments
- Kiseli krastavci, oceđeni — 1g / 12 kcal
- Pečena paprika iz tegle, oceđena — 1g / 31 kcal
- Kisela paprika / feferoni, oceđeni — 1g / 24 kcal
- Šampinjoni iz konzerve ili tegle, oceđeni — 2g / 18 kcal
- Kapari, oceđeni — 2g / 23 kcal

### Preserved item priority
#### Condiment or support defaults
- Kiseli krastavci, oceđeni
- Kisela paprika / feferoni, oceđeni
- Kapari, oceđeni

#### Tier B preserved vegetables
- Pečena paprika iz tegle, oceđena
- Šampinjoni iz konzerve ili tegle, oceđeni

Rule:
- Preserved items should generally be treated as support foods for flavor, crunch, sodium, and convenience.
- They should not replace the bulk of fresh or frozen `tierA` vegetables.

### Source-backed food rules
- Keep the database aligned with handbook-friendly lean proteins.
- Prefer at least one dairy serving per day somewhere in the daily plan.
- Protein powder is allowed only as a limited convenience option, not as the primary food source.
- Treat peas, corn, carrots, and beets as limited starchy vegetables, not "unlimited" vegetables.
- Use handbook-friendly low-calorie condiments and beverages in copy and UI suggestions: lemon juice, soy sauce, salsa/pico, vinegar, mustard, spices, and water.
- Chicken breast values in the database must reflect raw product, not cooked or grilled macros.
- Favor local labels users will actually recognize in Serbia, especially for dairy and beef cuts.
- Tomatoes, cherry tomatoes, peppers, and onions are allowed vegetables, but onions and cherry tomatoes should not be treated as truly unlimited in very large quantities because carbs add up faster than leafy greens.
- Kapari should be treated as a garnish or condiment, not a primary vegetable serving.
- Jarred vegetables packed with sugar, oil-heavy marinades, or creamy sauces should be excluded from default PSMF recommendations.
- The handbook-style defaults for “build most meals from this” are ultra-lean proteins plus `tierA` vegetables.
- `TierB` foods are valid for variety, adherence, and local availability, but they are not the primary default recommendation.
- `Limited` foods may exist in the database for realism, but they should carry an explicit caution state in the UI.

### Local market convenience guidance
- Lidl fresh leafy options such as rukola, baby spanać, iceberg, and simple salad mixes are acceptable default vegetables if the ingredient list is mostly leafy vegetables and there is no dressing.
- Lidl mixes that include meaningful amounts of šargarepa or cvekla should be treated as limited vegetables, not "unlimited" vegetables.
- Current Lidl Serbia examples that fit well are Freshona kiseli krastavci, Best Food pečena paprika, and Freshona šampinjoni, using drained weights.
- If Lidl later stocks kapari, treat them as a condiment entry rather than a main vegetable entry.
- Freshona rezana cvekla should stay in the limited-vegetable bucket, not the unlimited-vegetable bucket.
- Frikom brokoli and Frikom spanać are acceptable freezer staples for V1 meal suggestions.
- Frikom mixes dominated by grašak, kukuruz, šargarepa, krompir, or sauces, such as `grašak i šargarepa`, `carska mešavina`, or `povrće za rusku salatu`, should not be treated as unlimited vegetables.
- The meal builder should prefer single-ingredient or clearly leafy convenience vegetables over complex mixed packs.

## Tasks
1. Create food database constant.
2. Build meal builder bottom sheet as a 3-step flow.
3. Step 1: choose one protein source and grams.
4. Step 2: optionally choose fresh, frozen, or preserved vegetables and grams.
5. Step 3: condiments, protocol reminders, and summary.
6. Confirm to add a meal entry with structured `LoggedMealItem[]` rows.
7. Allow editing an existing meal.
8. Allow delete.
9. Recalculate total protein and calories immediately.

## Calculation rule
For each item:
```ts
Math.round(baseValue * grams / 100)
```

## Definition of done
- Meals can be added, edited, and deleted.
- Totals update immediately.
- The meal flow is readable and not cluttered.

## Codex prompt for this phase
```md
Implement the meal logging flow using a hardcoded local food database.
Build a 3-step meal builder bottom sheet.
Use conservative raw or drained macros in the database, not cooked meat values.
Allow one protein source, optional fresh, frozen, or preserved vegetables, handbook-friendly condiments, and a final summary.
Prefer recognizable Serbian retail labels such as Ella sir, ramstek, biftek, simple salad mixes, and preserved vegetables like pickles or roasted peppers.
Show `tierA` foods first, keep `tierB` foods as secondary choices, and visually warn on `limited` foods.
Persist meals as structured item rows with grams and per-item macros, not string-only labels.
Support add, edit, and delete.
Keep the UI simple and readable.
```

---

# Phase 7 — Water tracker
## Goal
Add a simple daily hydration tracker.

## Formula
```ts
targetGlasses = Math.round(bodyWeightKg * 35 / 250)
```

This hydration target is an app-specific product rule.
The handbook supports high water intake in general, but does not define this exact formula.

## Tasks
1. Show today's water count.
2. Add `+` and `-` controls.
3. Persist daily value.
4. Calculate target from starting weight.
5. Add a simple fill visualization.

## Definition of done
- Water count can be changed daily.
- Target is correct.
- Visual state updates smoothly.

## Codex prompt for this phase
```md
Implement the daily water tracker using the PSMF app formula for target glasses.
Store the value locally per day.
Keep the interaction lightweight and visually clear.
```

---

# Phase 8 — Progress screen
## Goal
Turn stored weight entries into a useful progress view.

## Sections
1. Header
2. Total lost stat
3. Current vs starting weight
4. Protocol progress bar
5. Weight chart
6. Stat tiles
7. Daily log list
8. Milestones

## Required metrics
- total lost since start
- current weight
- average daily loss
- estimated calories from fat = totalLostKg * 7700
- compliance days = days with weight entry / days elapsed
- protocol progress = days elapsed / `goalTotalDays` when goal data exists

## Goal/protocol progress note
If goal data is available, use it for time-window progress only.
Do not invent a fake goal weight in V1.
If goal data is missing, show progress without pretending a fixed target exists.
Use `startDate` as the single source of truth for elapsed days.
Do not infer elapsed time from the first weight entry.

## Definition of done
- Screen handles empty and populated history.
- Chart is legible.
- Stats are correct.
- Latest value is visually clear.

## Codex prompt for this phase
```md
Build the progress screen using local weight history data.
Include total loss, current weight, a progress bar, a readable chart, stats, daily log cards, and milestones.
Prioritize trust and clarity over visual density.
Match the hierarchy in `mocks/napredak.png`.
```

---

# Phase 9 — Polish and hardening
## Goal
Make the app feel production-ready.

## Tasks
1. Improve spacing and readability.
2. Audit Serbian copy.
3. Add loading states.
4. Add empty states.
5. Add destructive action confirmation where needed.
6. Test hydration and relaunch behavior.
7. Add app icon and splash.
8. Optionally add local reminders.

### Expo Go limitation note
App icon, app name, and splash-screen behavior cannot be fully validated inside Expo Go alone.
Final verification of these assets may require a development or production build.
This does not change the `Expo Go first` policy for normal feature development.

## Definition of done
- Relaunch is stable.
- No major UI overlap on small phones.
- Local persistence works reliably.
- Main flows feel smooth.

## Codex prompt for this phase
```md
Polish the PSMF app for production readiness.
Focus on readability, spacing, safe local persistence, empty states, confirmations, and small-screen behavior.
Do not introduce backend complexity.
```

## 14) Screen-specific UX guidance
These points come from design review and should influence implementation.

### Welcome screen
- keep the message short
- make the disclaimer readable
- do not cram tiny text at the bottom

### Name screen
- make it warm, not empty
- keep confirmation banner friendly and visible

### Gender screen
- use stronger selected state than just a thin border
- keep threshold text readable

### Weight screen
- the number input should feel interactive
- show unit conversion clearly

### Body fat screen
- make the two modes very distinct
- explain BMI limits in one short line
- when BMI mode is unavailable, make the manual fallback obvious

### Activity screen
- make the protein result the focal point
- treat handbook range and multiplier comparison as secondary

### Goal screen
- highlight the recommended option clearly
- reduce dense explanatory copy per card

### Summary screen
- celebrate the result
- then explain what the number means
- if Category 1, show the handbook range before the final app target
- then show supplements
- then CTA

### Dashboard
- do not overcompress cards
- make top metrics obvious
- keep meal cards readable
- avoid hidden swipe-only critical actions

### Progress
- make the chart large enough to build trust
- do not show too many competing stat boxes at the same level

## 15) Copy style rules
All visible copy must be Serbian.

### Tone
- direct
- supportive
- disciplined
- not cheesy
- not overly clinical

### Good examples
- `Dobro jutro, Nenade 👋`
- `Odlično — 0.5 kg manje nego juče`
- `Kratkotrajan porast je normalan. Nastavi po planu.`
- `Sve je gotovo — možeš početi!`

### Bad examples
- overly aggressive fat-loss hype
- guilt-based messaging
- English fallback labels
- unexplained abbreviations

## 16) Technical rules for Codex
### General coding rules
- Use TypeScript everywhere.
- Keep pure business logic outside screen files.
- Keep repeated UI in reusable components.
- Prefer simple explicit code over clever abstractions.
- Keep repo docs and source files UTF-8 encoded so Serbian copy renders correctly.
- Keep handwritten source files at `300` lines of code or fewer in normal cases.
- Split large screens into subcomponents, hooks, selectors, or utility modules before they grow past the limit.
- Treat `300` LOC as the default ceiling for app code; only static data tables or generated files should exceed it.
- Avoid premature architecture for backend features that do not exist.
- Use stable IDs for list items.
- Add guardrails for undefined or null persisted data.

### Component rules
- Prefer custom components over third-party UI-kit components.
- Keep components small, mock-driven, and readable.
- Do not introduce theme-provider-heavy UI systems for V1.
- Pass styling through explicit props and NativeWind class names instead of complex variant engines unless clearly needed.
- Extract repeated UI into components before copying JSX across screens.

### Hook rules
- Prefer pure functions first, selectors second, hooks third.
- Hooks should own reusable stateful behavior, not static formatting logic.
- Avoid generic utility hooks with vague responsibilities.
- Keep hook APIs narrow and screen-focused.

### Integration boundary rules
- Prefer Expo Go-compatible libraries for V1.
- Keep the bottom-sheet implementation isolated behind `src/components/ui/BottomSheet.tsx`.
- Keep the chart implementation isolated behind `src/components/progress/WeightChart.tsx`.
- Default `BottomSheet.tsx` to an in-house V1 implementation using React Native `Modal`, backdrop press handling, and a simple vertical slide animation.
- Do not adopt a third-party bottom-sheet package in Phase 1 or Phase 2 unless the spec is updated first.
- Default `WeightChart.tsx` to a simple wrapper around `react-native-svg` for a basic line chart and labels.
- Do not adopt a larger charting library unless the wrapper proves insufficient for the `Napredak` screen requirements.
- These wrappers are vendor boundaries, not app logic containers.
- Their purpose is to isolate external implementation details from the rest of the UI layer.
- No screen should import a third-party chart or bottom-sheet package directly.
- Treat both wrappers as compatibility boundaries so implementations can be swapped later.
- Callers should not depend on vendor-specific APIs from either implementation.
- Validate Expo Go compatibility before adopting a third-party bottom-sheet or chart package.
- If a package is not Expo Go-compatible, either replace it with an Expo Go-safe option or explicitly move the project to a dev-client workflow in the spec.
- If either default wrapper strategy is replaced, update `AGENT.md` before adopting the new package.
- If a third-party package is used for either, wrap it so the rest of the app does not depend on vendor-specific APIs.

### State rules
- Use Zustand for hydrated global app state.
- Persist only what matters.
- Keep onboarding wizard state local until final confirmation.
- Do not use global state for temporary per-step onboarding inputs.
- Do not store obvious derived values unless there is a strong reason.
- Keep persistence explicit; do not hide core writes behind Zustand `persist`.
- Compute derived values in selectors/helpers when practical.
- Prefer selectors over stored derived fields unless persistence is required.
- Use `startDate` as the canonical anchor for elapsed-day and compliance calculations.

### Performance rules
- Do not optimize too early.
- But avoid unnecessary rerenders in meal lists and charts.
- Memoize only where it helps.

### Error handling
- Never allow malformed storage to white-screen the app.
- Fallback gracefully.
- Provide reset capability.

## 17) Testing checklist
At minimum, test these cases.

### Development environment
- fresh scaffold starts in Expo Go
- onboarding routes and tabs render in Expo Go
- AsyncStorage hydration works in Expo Go
- Zustand global store works in Expo Go

### UI architecture
- no screen depends on gluestack or another full UI kit
- screens are built from local `src/components/ui/*` and feature components
- base components can reproduce the onboarding, `Danas`, and `Napredak` mocks without vendor theming

### Onboarding
- user can complete flow with manual body fat
- user can complete flow with BMI estimation
- BMI exact-row lookup works for both male and female inputs
- BMI interpolation works between rows
- BMI over `40` applies the `+1.5` rule correctly
- unsupported low BMI blocks BMI estimation and falls back to manual entry
- male BMI values that land in a `null` handbook row block BMI estimation and fall back to manual entry
- weight conversion works both directions
- Category 1 male at `15%` uses the range minimum and at `4%` uses the range maximum
- Category 1 female at `24%` uses the range minimum and at `8%` uses the range maximum
- Category 2 and 3 still return fixed multipliers
- final target matches formulas

### Storage
- Zustand store hydrates from `psmf_store` on app startup
- app UI stays gated until hydration is complete
- `proteinTargetG` persists as a single stored target
- corrupted or malformed AsyncStorage JSON falls back safely without a white screen
- malformed AsyncStorage data produces safe defaults in Zustand
- missing newer V1 store fields in older data hydrate from `DEFAULT_STORE`
- app relaunch after onboarding works
- weight history persists
- clearing data resets Zustand state and first-launch routing
- deleting data resets first-launch behavior

### Dependency compatibility
- default bottom-sheet implementation works without a third-party bottom-sheet package
- default chart implementation works with `react-native-svg`
- selected bottom-sheet implementation works in Expo Go, or is rejected before adoption
- selected chart implementation works in Expo Go, or is rejected before adoption
- no Phase 1 or Phase 2 dependency silently requires a dev client

### Hook architecture
- hooks are only introduced for reusable stateful behavior
- pure calculation logic remains outside hooks
- hooks do not duplicate selector logic or storage parsing logic
- onboarding wizard state remains local until final confirmation

### Onboarding state management
- onboarding field changes do not touch global store before final confirm
- final onboarding confirm writes once and hydrates the global store consistently
- navigating back within onboarding preserves local wizard state without relying on global persistence

### Wrapper boundaries
- no screen imports third-party bottom-sheet packages directly
- no screen imports third-party chart packages directly
- bottom sheet and chart implementations remain swappable without screen API changes

### Dashboard
- first ever weight entry behaves correctly
- later entries compare against previous day correctly
- meal totals update after add/edit/delete
- meal edits and deletes persist correctly after relaunch
- water tracker persists daily value
- water tracker rolls over cleanly on a new day
- summary supplement list renders in Serbian
- saving today’s weight updates dashboard and progress reads through Zustand selectors
- meal add/edit/delete updates derived totals without requiring screen reload
- water updates are reflected immediately across subscribed views

### Meal and protocol rules
- meal rules reject "unlimited" starchy vegetables
- every `foodDb.ts` item has exact numeric per-100g macros and no ranged values
- meal pickers show `tierA` foods before `tierB` foods
- `limited` foods render with an explicit caution state
- condiment items do not appear as default main vegetable choices
- break guidance by category shows the correct schedule and water-weight note
- confirmed onboarding goal data produces deterministic protocol-progress behavior

### Progress
- empty history does not crash
- one entry state is sensible
- multiple entries chart correctly

### Final verification limits
- icon and splash requirements are marked as requiring final build validation outside Expo Go when necessary
- Expo Go limitations do not block regular feature development for onboarding, `Danas`, and `Napredak`

### Development workflow
- custom component approach works with the existing Expo Go-first plan
- no UI-kit installation is required to begin Phase 1 or Phase 2 work
- Windows setup remains simple because no gluestack CLI or manual-install workflow is introduced

## 18) Safe defaults and fallbacks
If data is missing:
- show placeholder values
- do not fake precision
- keep CTAs available only when enough data exists
- guide the user to the next valid action

## 19) What not to build in V1
Do not add these unless explicitly requested:
- account system
- cloud sync
- barcode APIs
- AI meal estimation
- push-heavy gamification
- social/community features
- complex macro split logic beyond PSMF needs
- multiple diet modes
- EC stack or stimulant-stack guidance
- yohimbine or drug protocol recommendations
- workout or `Trening` screen
- contest-prep or athlete carb-up tools

## 20) Suggested development order for Codex sessions
Use short, focused implementation loops.

### Recommended sequence
1. Foundation
2. Store + pure calculations
3. Onboarding wizard state
4. Onboarding screens
5. Tabs shell
6. Weight logging
7. Meal logging
8. Water tracking
9. Progress screen
10. Polish

## 21) Example master prompt for Codex
Use this when starting a new implementation session.

```md
You are building a local-first Expo React Native app called PSMF.
It is a Serbian-only mobile app for guiding users through the Protein Sparing Modified Fast protocol.

Core constraints:
- No backend
- No auth
- No API calls
- AsyncStorage only
- Zustand for global hydrated app state
- Expo Go first for V1 development
- Expo Router navigation
- NativeWind styling
- Dark theme with orange/red gradient accents
- Weight stored internally in kg
- Pure calculation logic separated from UI
- BMI uses the standard formula plus the handbook BMI-to-body-fat table
- Category 1 protein uses the handbook range with a deterministic app target
- Consumer-safe handbook guidance only
- No stimulant/drug protocol guidance
- Explicit AsyncStorage storage module; no hidden persistence layer
- Onboarding wizard state stays local until final confirm
- Prefer Expo Go-compatible packages
- Do not adopt native-only dependencies unless the spec explicitly allows a dev client
- Keep bottom sheet and chart behind wrapper components so implementations can be swapped
- Use custom app components and hooks, not a large UI kit
- Do not add gluestack or another primary component library
- Use NativeWind for styling and local wrappers for any third-party infra dependency
- Keep hooks minimal and purpose-specific

Core flows:
- Onboarding wizard
- Daily dashboard
- Progress screen

Priorities:
- Readability
- Clear hierarchy
- Fast daily use
- Safe local persistence
- Exact protein calculation logic

Build only the requested phase.
Do not invent server features.
Do not switch app copy to English.
Keep code modular and production-minded.
```

## 22) Example review checklist for each PR-sized step
Before considering a task finished, verify:
- Does this match the product spec?
- Is the copy Serbian?
- Is the core action obvious?
- Is any important text too small?
- Is business logic separated from presentation?
- Does local persistence survive app restart?
- Are empty states handled?
- Is the UI less cluttered than before?

## 23) Final instruction to the agent
Build the app like a **focused, high-clarity protocol tool**.
Do not drift into generic fitness-app complexity.
When in doubt, choose:
- simpler state
- clearer UI
- better readability
- stricter alignment with the PSMF protocol
