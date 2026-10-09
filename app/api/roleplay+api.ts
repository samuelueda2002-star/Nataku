import { ROLEPLAY_SCENARIOS } from "@/data/roleplay-scenarios";
import { generateRoleplayReply } from "@/lib/server/roleplay";
import { verifyClerkRequest } from "@/lib/server/streamAuth";
import { MAX_ROLEPLAY_MESSAGE_LENGTH, ROLEPLAY_TURNS, type RoleplayMessage } from "@/types/roleplay";

export async function POST(request: Request): Promise<Response> {
  if (!await verifyClerkRequest(request)) {
    return Response.json({ error: "Please sign in to chat with Nataku." }, { status: 401 });
  }

  let body: { scenarioId?: unknown; messages?: unknown };
  try {
    const text = await request.text();
    if (text.length > 12_000) return Response.json({ error: "Conversation is too long." }, { status: 413 });
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
    body = parsed;
  } catch {
    return Response.json({ error: "Invalid conversation." }, { status: 400 });
  }

  const scenario = ROLEPLAY_SCENARIOS.find((item) => item.id === body.scenarioId);
  const messages = body.messages;
  if (
    !scenario || !Array.isArray(messages) || messages.length < 2 ||
    messages.length > ROLEPLAY_TURNS * 2 || messages.length % 2 !== 0 ||
    !messages.every((message: unknown, index: number) => {
      if (!message || typeof message !== "object") return false;
      const entry = message as Record<string, unknown>;
      const role = index % 2 === 0 ? "assistant" : "user";
      return entry.role === role && typeof entry.text === "string" &&
        entry.text.trim().length > 0 && entry.text.length <=
        (role === "user" ? MAX_ROLEPLAY_MESSAGE_LENGTH : 800);
    })
  ) {
    return Response.json({ error: "Choose a scenario and send a valid conversation." }, { status: 400 });
  }

  try {
    const reply = await generateRoleplayReply(scenario, messages as Pick<RoleplayMessage, "role" | "text">[]);
    return Response.json(reply);
  } catch (error) {
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return Response.json({
      error: isTimeout
        ? "Nataku took too long to reply. Please try again."
        : error instanceof Error && error.message.startsWith("Nataku")
          ? error.message : "Nataku couldn't prepare a reply. Please try again.",
    }, { status: isTimeout ? 504 : 502 });
  }
}
