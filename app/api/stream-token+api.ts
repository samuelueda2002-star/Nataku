import {
  createStreamUserToken,
  verifyClerkRequest,
} from "@/lib/server/streamAuth";

export async function GET(request: Request): Promise<Response> {
  const userId = await verifyClerkRequest(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.STREAM_API_SECRET;
  const apiKey = process.env.STREAM_API_KEY;

  if (!secret || !apiKey) {
    return Response.json({ error: "Stream not configured" }, { status: 500 });
  }

  try {
    const token = await createStreamUserToken(userId, secret);
    return Response.json({ token, apiKey, userId });
  } catch (error) {
    console.error("[stream-token] Unable to create user token:", error);
    return Response.json(
      { error: "Unable to authorize the audio lesson call" },
      { status: 500 },
    );
  }
}
