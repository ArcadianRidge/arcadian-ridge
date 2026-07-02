import type { RulePack } from "../rule-pack.js";

const azBase = (county: string): RulePack => ({
  state: "AZ",
  county,
  claimMechanics: "application",
  coolingOffDays: 30,
  notarizationRequired: true,
  feePosture: {
    defaultPosture: "contingency",
    contingencyAllowed: true,
    maxContingencyPct: 33,
    notarizationRequired: true,
    reasonablenessMemoRef: "az-reasonableness-v1",
  },
  noticeRecipe: {
    recipients: ["treasurer", "interested-parties"],
    mailClasses: ["certified"],
    receiptRequired: true,
  },
  responseWindowDays: 30,
  escheatYears: 2,
  grossFloorCents: 1_500_000,
  solicitationMarkings: ["ADVERTISING MATERIAL"],
  formTemplates: { application: "az-application-v1", order: "az-order-v1" },
  eFilePosture: "packet",
  statutePins: { coolingOff: "A.R.S. § 33-812(P)", feeCap: "$2,500 non-attorney presumption" },
});

const waBase = (county: string): RulePack => ({
  state: "WA",
  county,
  claimMechanics: "motion",
  coolingOffDays: 0,
  notarizationRequired: false,
  feePosture: {
    defaultPosture: "flat",
    contingencyAllowed: false,
    notarizationRequired: false,
  },
  noticeRecipe: {
    recipients: ["notice-of-surplus-recipients", "appearances"],
    mailClasses: ["certified"],
    receiptRequired: true,
    minNoticeDays: 20,
  },
  grossFloorCents: 1_500_000,
  solicitationMarkings: ["ADVERTISING MATERIAL"],
  formTemplates: { motion: "wa-motion-v1", order: "wa-order-v1" },
  eFilePosture: "packet",
  statutePins: { motion: "RCW 61.24.080(3)", finderCap: "RCW 61.12.200 5%" },
  openQuestions: ["C-4 fee characterization memo pending for contingency flag"],
});

const idBase = (county: string): RulePack => ({
  state: "ID",
  county,
  claimMechanics: "trustee",
  coolingOffDays: 0,
  notarizationRequired: false,
  feePosture: {
    defaultPosture: "contingency",
    contingencyAllowed: true,
    maxContingencyPct: 33,
    notarizationRequired: false,
  },
  noticeRecipe: {
    recipients: ["trustee"],
    mailClasses: ["first-class"],
    receiptRequired: false,
  },
  grossFloorCents: 1_500_000,
  solicitationMarkings: ["ADVERTISING MATERIAL"],
  formTemplates: { claim: "id-claim-v1" },
  eFilePosture: "packet",
  statutePins: { surplus: "Idaho Code § 45-1507" },
  openQuestions: county === "Kootenai" ? ["J-ID-1: county trustee/interpleader practice"] : undefined,
});

export const LAUNCH_PACKS: Record<string, RulePack> = {
  "az-maricopa": azBase("Maricopa"),
  "az-pima": azBase("Pima"),
  "wa-king": waBase("King"),
  "wa-pierce": waBase("Pierce"),
  "wa-snohomish": waBase("Snohomish"),
  "wa-spokane": waBase("Spokane"),
  "wa-clark": waBase("Clark"),
  "id-kootenai": idBase("Kootenai"),
  "id-bonner": idBase("Bonner"),
  "id-ada": idBase("Ada"),
};
