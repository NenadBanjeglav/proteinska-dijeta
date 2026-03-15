export const APP_NAME = "Brzo Mršavljenje";

export const TAB_LABELS = {
  home: "Danas",
  progress: "Napredak",
} as const;

export const ONBOARDING_STEP_COUNT = 8;

export const ONBOARDING_PLACEHOLDERS = {
  welcome: {
    title: "Dobrodošlica",
    description:
      "Početni onboarding ekran će u sledećoj fazi dobiti pun vizuelni dizajn iz mocka.",
  },
  name: {
    title: "Kako se zoveš?",
    description:
      "Ovde će biti tekstualni unos imena sa toplim pozdravnim stanjem i validacijom.",
  },
  gender: {
    title: "Koji je tvoj pol?",
    description:
      "Korak će prikazivati pragove kategorija telesnih masti i izbor između dva stanja.",
  },
  weight: {
    title: "Trenutna težina",
    description:
      "Ovde će ići kg/lbs unos sa internim čuvanjem u kilogramima i live konverzijom.",
  },
  "body-fat": {
    title: "Procenat telesnih masti",
    description:
      "Sledeća faza dodaje ručni unos, BMI procenu i validaciju za neaktivne korisnike.",
  },
  activity: {
    title: "Nivo aktivnosti",
    description:
      "Ovde će se prikazivati kategorija, raspon multiplikatora i live cilj proteina.",
  },
  goal: {
    title: "Tvoj cilj",
    description:
      "Korak će birati razlog za PSMF i deterministički broj dana protokola.",
  },
  summary: {
    title: "Rezime",
    description:
      "Na kraju onboarding toka biće prikazan kompletan obračun i finalna potvrda.",
  },
} as const;
