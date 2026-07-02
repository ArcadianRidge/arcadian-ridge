import { z } from "zod";

export const NoticeRecipeSchema = z.object({
  recipients: z.array(z.string()),
  mailClasses: z.array(z.string()),
  receiptRequired: z.boolean(),
  minNoticeDays: z.number().optional(),
});

export const FeePostureSchema = z.object({
  defaultPosture: z.enum(["contingency", "flat", "hourly"]),
  contingencyAllowed: z.boolean(),
  maxContingencyPct: z.number().optional(),
  notarizationRequired: z.boolean(),
  reasonablenessMemoRef: z.string().optional(),
});

export const RulePackSchema = z.object({
  state: z.string().length(2),
  county: z.string().min(1),
  claimMechanics: z.enum(["application", "motion", "trustee"]),
  coolingOffDays: z.number().nonnegative(),
  notarizationRequired: z.boolean(),
  feePosture: FeePostureSchema,
  noticeRecipe: NoticeRecipeSchema,
  responseWindowDays: z.number().optional(),
  escheatYears: z.number().optional(),
  grossFloorCents: z.number().default(1_500_000),
  solicitationMarkings: z.array(z.string()),
  formTemplates: z.record(z.string()),
  eFilePosture: z.enum(["packet", "efile", "hybrid"]),
  statutePins: z.record(z.string()),
  openQuestions: z.array(z.string()).optional(),
});

export type RulePack = z.infer<typeof RulePackSchema>;

export function validateRulePack(input: unknown): RulePack {
  return RulePackSchema.parse(input);
}

export function canDispatchOutreachStages(pack: { status?: string }): boolean {
  return pack.status === "certified";
}
