import { verifyClerkRequest } from "@/lib/server/streamAuth";

const AGENT_URL =
  process.env.VISION_AGENT_URL?.replace(/\/+$/, "") ??
  "http://127.0.0.1:8000";
const AGENT_REQUEST_TIMEOUT_MS = 10_000;

type StartAgentBody = {
  callId?: unknown;
  callType?: unknown;
};

function getIdentifier(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const identifier = value.trim();
  return identifier.length > 0 &&
    identifier.length <= 200 &&
    /^[a-zA-Z0-9_-]+$/.test(identifier)
    ? identifier
    : null;
}

async function fetchAgent(
  path: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    AGENT_REQUEST_TIMEOUT_MS,
  );

  try {
    return await fetch(`${AGENT_URL}${path}`, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function belongsToUser(callId: string, userId: string): boolean {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 40);
  return callId.startsWith(`lesson-${safeUserId}-`);
}

export async function POST(request: Request): Promise<Response> {
  const userId = await verifyClerkRequest(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: StartAgentBody;
  try {
    body = (await request.json()) as StartAgentBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const callId = getIdentifier(body.callId);
  const callType = body.callType ?? "audio_room";

  if (!callId) {
    return Response.json({ error: "A valid callId is required" }, { status: 400 });
  }

  if (callType !== "audio_room") {
    return Response.json({ error: "Unsupported call type" }, { status: 400 });
  }

  if (!belongsToUser(callId, userId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  console.log(
    `[agent-session] Starting session for call ${callId} at ${AGENT_URL}`,
  );

  try {
    const res = await fetchAgent(
      `/calls/${encodeURIComponent(callId)}/sessions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_type: callType }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error(
        `[agent-session] Vision agent returned ${res.status}: ${text}`,
      );
      return Response.json(
        { error: "Unable to start the AI teacher" },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      call_id?: unknown;
      session_id?: unknown;
    };
    if (
      data.call_id !== callId ||
      typeof data.session_id !== "string" ||
      !data.session_id
    ) {
      console.error("[agent-session] Vision agent returned an invalid session");
      return Response.json(
        { error: "Unable to start the AI teacher" },
        { status: 502 },
      );
    }

    console.log(`[agent-session] Session started: ${data.session_id}`);
    return Response.json({ session_id: data.session_id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[agent-session] Failed to reach vision agent at ${AGENT_URL}: ${message}`,
    );
    return Response.json(
      { error: "AI teacher service unavailable" },
      { status: 503 },
    );
  }
}

export async function DELETE(request: Request): Promise<Response> {
  const userId = await verifyClerkRequest(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let callId = getIdentifier(searchParams.get("callId"));
  let sessionId = getIdentifier(searchParams.get("sessionId"));

  if (!callId || !sessionId) {
    try {
      const body = (await request.json()) as {
        callId?: unknown;
        sessionId?: unknown;
      };
      callId = callId ?? getIdentifier(body?.callId);
      sessionId = sessionId ?? getIdentifier(body?.sessionId);
    } catch {
      // Body is optional
    }
  }

  if (!callId || !sessionId) {
    return Response.json(
      { error: "callId and sessionId are required" },
      { status: 400 },
    );
  }

  if (!belongsToUser(callId, userId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const res = await fetchAgent(
      `/calls/${encodeURIComponent(callId)}/sessions/${encodeURIComponent(sessionId)}`,
      { method: "DELETE" },
    );

    if (!res.ok && res.status !== 404) {
      const text = await res.text();
      console.error(
        `[agent-session] Vision agent cleanup returned ${res.status}: ${text}`,
      );
      return Response.json(
        { error: "Unable to stop the AI teacher" },
        { status: 502 },
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[agent-session] DELETE failed: ${message}`);
    return Response.json(
      { error: "Failed to reach vision agent" },
      { status: 503 },
    );
  }

  return Response.json({ ok: true });
}
