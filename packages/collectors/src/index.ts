import { randomUUID } from "node:crypto";

export interface NormalizedSurplusEvent {
  id: string;
  jurisdictionKey: string;
  source: string;
  stream: "backlog" | "newflow";
  courtCaseNo?: string;
  parcel?: string;
  propertyAddress?: string;
  saleDate?: string;
  depositDate?: string;
  grossCents: number;
  escheatAt?: string;
  status: string;
  stage: string;
  traceId: string;
}

export interface CollectorPullResult {
  events: NormalizedSurplusEvent[];
  rowCount: number;
  quarantined: boolean;
  driftDetected: boolean;
  driftReason?: string;
}

export interface CollectorAdapter {
  jurisdictionKey: string;
  sourceType: string;
  pull(): Promise<CollectorPullResult>;
}

const eventStore = new Map<string, NormalizedSurplusEvent>();
const lastPullCounts = new Map<string, number>();

export function registerEvent(event: NormalizedSurplusEvent): NormalizedSurplusEvent {
  const key = `${event.jurisdictionKey}:${event.courtCaseNo ?? event.parcel ?? event.id}`;
  const existing = [...eventStore.values()].find(
    (e) =>
      e.jurisdictionKey === event.jurisdictionKey &&
      e.courtCaseNo === event.courtCaseNo &&
      event.courtCaseNo,
  );
  if (existing) return existing;
  eventStore.set(key, event);
  return event;
}

export function listEvents(jurisdictionKey?: string): NormalizedSurplusEvent[] {
  const all = [...eventStore.values()];
  return jurisdictionKey ? all.filter((e) => e.jurisdictionKey === jurisdictionKey) : all;
}

export function resetCollectorStore(): void {
  eventStore.clear();
  lastPullCounts.clear();
}

export function computeEscheatAt(depositDate: string, escheatYears = 2): string {
  const d = new Date(depositDate);
  d.setFullYear(d.getFullYear() + escheatYears);
  return d.toISOString();
}

export function detectDrift(jurisdictionKey: string, newCount: number): boolean {
  const prev = lastPullCounts.get(jurisdictionKey) ?? 0;
  lastPullCounts.set(jurisdictionKey, newCount);
  if (prev === 0) return false;
  const delta = Math.abs(newCount - prev) / prev;
  return delta > 0.3;
}

export function createSimulatorCollector(
  jurisdictionKey: string,
  rows: Array<Partial<NormalizedSurplusEvent>>,
): CollectorAdapter {
  return {
    jurisdictionKey,
    sourceType: "simulator",
    async pull() {
      const events = rows.map((r) =>
        registerEvent({
          id: randomUUID(),
          jurisdictionKey,
          source: r.source ?? "county-treasurer",
          stream: r.stream ?? "backlog",
          courtCaseNo: r.courtCaseNo,
          parcel: r.parcel,
          propertyAddress: r.propertyAddress,
          saleDate: r.saleDate,
          depositDate: r.depositDate,
          grossCents: r.grossCents ?? 50_000_00,
          escheatAt: r.depositDate ? computeEscheatAt(r.depositDate) : undefined,
          status: "active",
          stage: "ingested",
          traceId: randomUUID(),
        }),
      );
      const drift = detectDrift(jurisdictionKey, events.length);
      return {
        events: drift ? [] : events,
        rowCount: events.length,
        quarantined: drift,
        driftDetected: drift,
        driftReason: drift ? ">30% row change vs prior pull" : undefined,
      };
    },
  };
}

export function detectStreamB(input: {
  considerationCents: number;
  debtCents: number;
  thresholdCents?: number;
}): { surplus: boolean; deltaCents: number } {
  const threshold = input.thresholdCents ?? 100_00;
  const delta = input.considerationCents - input.debtCents;
  return { surplus: delta > threshold, deltaCents: delta };
}

export function setupVoidWindowWatch(saleDate: string): { voidEndsAt: string } {
  const d = new Date(saleDate);
  d.setDate(d.getDate() + 31);
  return { voidEndsAt: d.toISOString() };
}
