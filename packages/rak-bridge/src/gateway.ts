import { randomUUID } from "node:crypto";

export type GatewayTier = "micro" | "base" | "goliath" | "titan";

export interface GatewayInferenceOptions {
  prompt: string;
  system?: string;
  taskType: string;
  traceId?: string;
  meteringUserId?: string;
  agentTier?: GatewayTier;
  projectId?: string;
}

export interface GatewayInferenceResult {
  content: string;
  traceId: string;
  model?: string;
  simulated?: boolean;
}

export function resolveGatewayUrl(): string | null {
  const url =
    process.env.RAK_GATEWAY_URL?.trim() ||
    process.env.RAKONTEVR_GATEWAY_URL?.trim();
  return url ? url.replace(/\/+$/, "") : null;
}

export function meteringHeaders(options: {
  traceId: string;
  taskType: string;
  meteringUserId?: string;
  agentTier?: GatewayTier;
  projectId?: string;
}): Record<string, string> {
  return {
    "X-Trace-Id": options.traceId,
    "X-Task-Type": options.taskType,
    "X-Metering-User-Id":
      options.meteringUserId ??
      process.env.RAK_DEFAULT_USER_ID?.trim() ??
      "arcadian-ridge",
    "X-Agent-Tier": options.agentTier ?? "base",
    ...(options.projectId ? { "X-Project-Id": options.projectId } : {}),
  };
}

/** Simulator for BDD when gateway unavailable */
function simulateInference(options: GatewayInferenceOptions): GatewayInferenceResult {
  const traceId = options.traceId ?? randomUUID();
  const lower = options.prompt.toLowerCase();
  let content = '{"decision":"continue","confidence":0.75}';
  if (lower.includes("kill") || lower.includes("already filed")) {
    content = '{"passOrKill":"kill","killReason":"already-filed","confidence":0.9}';
  } else if (lower.includes("grade") || lower.includes("score")) {
    content = '{"grade":"B","netToOwnerCents":4500000,"feeEstCents":1125000,"confidence":0.8}';
  } else if (lower.includes("extract") || lower.includes("parties")) {
    content = '{"parties":[{"role":"owner","name":"Jane Doe","confidence":0.85}]}';
  } else if (lower.includes("memo") || lower.includes("packet")) {
    content = "# Filing packet\n\nAssembled from certified template.";
  }
  return { content, traceId, model: "simulator", simulated: true };
}

export async function callGatewayInference(
  options: GatewayInferenceOptions,
): Promise<GatewayInferenceResult> {
  const baseUrl = resolveGatewayUrl();
  const apiKey = process.env.RAK_API_KEY?.trim();
  const traceId = options.traceId ?? randomUUID();

  if (!baseUrl || !apiKey) {
    if (process.env.ARCR_ALLOW_SIMULATOR === "1" || process.env.NODE_ENV === "test") {
      return simulateInference({ ...options, traceId });
    }
    throw new Error(
      "RAK_GATEWAY_URL and RAK_API_KEY required. Set ARCR_ALLOW_SIMULATOR=1 for offline tests.",
    );
  }

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...meteringHeaders({
        traceId,
        taskType: options.taskType,
        meteringUserId: options.meteringUserId,
        agentTier: options.agentTier,
        projectId: options.projectId,
      }),
    },
    body: JSON.stringify({
      model: "iorek-base",
      messages: [
        ...(options.system ? [{ role: "system", content: options.system }] : []),
        { role: "user", content: options.prompt },
      ],
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gateway inference failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    model?: string;
  };
  return {
    content: json.choices?.[0]?.message?.content ?? "",
    traceId,
    model: json.model,
  };
}

export async function getGatewayStatus(): Promise<{
  url: string | null;
  hasApiKey: boolean;
  reachable: boolean;
}> {
  const url = resolveGatewayUrl();
  const hasApiKey = Boolean(process.env.RAK_API_KEY?.trim());
  let reachable = false;
  if (url && hasApiKey) {
    try {
      const res = await fetch(`${url}/v1/models`, {
        headers: { Authorization: `Bearer ${process.env.RAK_API_KEY}` },
        signal: AbortSignal.timeout(4000),
      });
      reachable = res.ok;
    } catch {
      reachable = false;
    }
  }
  return { url, hasApiKey, reachable };
}
