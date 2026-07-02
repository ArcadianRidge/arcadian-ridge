export class EnvelopeExceededError extends Error {
  constructor(
    message: string,
    public readonly requestedCents: number,
    public readonly envelopeCents: number,
    public readonly envelopeKind: "data" | "mail",
  ) {
    super(message);
    this.name = "EnvelopeExceededError";
  }
}

export function assertWithinDataEnvelope(input: {
  currentMonthlySpendCents: number;
  deltaCents: number;
  envelopeCents: number;
}): void {
  const projected = input.currentMonthlySpendCents + input.deltaCents;
  if (projected > input.envelopeCents) {
    throw new EnvelopeExceededError(
      `Data spend would exceed envelope (${projected} > ${input.envelopeCents} cents)`,
      projected,
      input.envelopeCents,
      "data",
    );
  }
}

export function assertWithinMailEnvelope(input: {
  currentMonthlyCount: number;
  deltaCount: number;
  envelopeCount: number;
}): void {
  const projected = input.currentMonthlyCount + input.deltaCount;
  if (projected > input.envelopeCount) {
    throw new EnvelopeExceededError(
      `Mail count would exceed envelope (${projected} > ${input.envelopeCount})`,
      projected,
      input.envelopeCount,
      "mail",
    );
  }
}
