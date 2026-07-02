import { createIntakeSession, handleInboundTurn } from "@arcr/intake";

export async function POST(req: Request) {
  const body = (await req.json()) as { text: string; attributionRef?: string };
  const session = createIntakeSession(body.attributionRef);
  const result = await handleInboundTurn(session, body.text);
  return Response.json(result);
}
