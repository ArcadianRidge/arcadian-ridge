/**
 * Platform-side gate enforcement — G1 through G4.
 * These checks run in service layer; SQL constraints mirror in migration.
 */

export class GateViolationError extends Error {
  constructor(
    message: string,
    public readonly gate: "G1" | "G2" | "G3" | "G4",
  ) {
    super(message);
    this.name = "GateViolationError";
  }
}

/** G1: conflict-clear-or-no-engagement */
export function assertG1ConflictClear(input: {
  conflictResult?: string | null;
  waiverRef?: string | null;
}): void {
  const result = input.conflictResult;
  if (!result) {
    throw new GateViolationError("G1: conflict check required before engagement", "G1");
  }
  if (result === "blocked") {
    throw new GateViolationError("G1: conflict blocked — cannot create engagement", "G1");
  }
  if (result === "waivable" && !input.waiverRef) {
    throw new GateViolationError("G1: waivable conflict requires documented waiver", "G1");
  }
}

/** G2: void-window-and-notarization-or-no-signature (AZ) */
export function assertG2EngagementExecutable(input: {
  state: string;
  saleDate?: Date | null;
  signedAt?: Date | null;
  notarizedAt?: Date | null;
  now?: Date;
}): void {
  const now = input.now ?? new Date();
  if (input.state === "AZ" && input.saleDate) {
    const voidEnds = new Date(input.saleDate);
    voidEnds.setDate(voidEnds.getDate() + 31);
    if (now < voidEnds) {
      throw new GateViolationError(
        "G2: AZ ceremony cannot initiate before saleDate + 31 days",
        "G2",
      );
    }
  }
  if (input.signedAt && input.state === "AZ" && !input.notarizedAt) {
    throw new GateViolationError("G2: AZ executed engagement requires notarizedAt", "G2");
  }
}

/** G3: attorney-signature-or-no-filing */
export function assertG3FilingAllowed(input: {
  attorneyApprovalRef?: string | null;
  lintPassed?: boolean;
}): void {
  if (!input.lintPassed) {
    throw new GateViolationError("G3: lint must pass before filing queue", "G3");
  }
  if (!input.attorneyApprovalRef?.trim()) {
    throw new GateViolationError("G3: attorney approval required before filedAt", "G3");
  }
}

/** G4: order-and-operator-or-no-disbursement */
export function assertG4DisbursementAllowed(input: {
  direction: string;
  kind: string;
  orderRef?: string | null;
  clearedAt?: Date | null;
  approvalRef?: string | null;
  depositCleared?: boolean;
  feeWithinStatement?: boolean;
}): void {
  if (input.direction !== "out") return;
  if (!["disbursement", "fee-transfer", "client-disbursement", "fee-transfer"].includes(input.kind)) {
    return;
  }
  if (!input.orderRef?.trim()) {
    throw new GateViolationError("G4: disbursement requires court order reference", "G4");
  }
  if (!input.clearedAt || !input.depositCleared) {
    throw new GateViolationError("G4: disbursement requires cleared funds on deposit", "G4");
  }
  if (!input.approvalRef?.trim()) {
    throw new GateViolationError("G4: operator approval required for money out", "G4");
  }
  if (input.kind === "fee-transfer" && input.feeWithinStatement === false) {
    throw new GateViolationError("G4: fee transfer cannot exceed statement math", "G4");
  }
}
