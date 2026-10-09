import { LANGUAGES } from "@/data/languages";
import { LESSONS } from "@/data/lessons";
import {
  createStreamServerToken,
  createStreamUserToken,
  verifyClerkRequest,
} from "@/lib/server/streamAuth";
import { LanguageCode } from "@/types/learning";

const CALL_TYPE = "audio_room";

type CreateCallBody = {
  language?: unknown;
  lessonId?: unknown;
  user?: {
    image?: unknown;
    name?: unknown;
  };
};

function getOptionalString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maxLength
    ? normalized
    : null;
}

function isLanguageCode(value: unknown): value is LanguageCode {
  return (
    typeof value === "string" &&
    LANGUAGES.some((language) => language.code === value)
  );
}

export async function POST(request: Request): Promise<Response> {
  const userId = await verifyClerkRequest(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateCallBody;
  try {
    body = (await request.json()) as CreateCallBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const lessonId = getOptionalString(body.lessonId, 80);
  const lesson = LESSONS.find((candidate) => candidate.id === lessonId);

  if (!lesson) {
    return Response.json({ error: "Lesson not found" }, { status: 404 });
  }

  if (!isLanguageCode(body.language)) {
    return Response.json(
      { error: "A valid selected language is required" },
      { status: 400 },
    );
  }

  if (!lesson.id.startsWith(`${body.language}-`)) {
    return Response.json(
      { error: "The selected lesson does not match the selected language" },
      { status: 400 },
    );
  }

  const apiKey = process.env.STREAM_API_KEY;
  const secret = process.env.STREAM_API_SECRET;

  if (!apiKey || !secret) {
    return Response.json({ error: "Stream not configured" }, { status: 500 });
  }

  const userName = getOptionalString(body.user?.name, 100) ?? "Learner";
  const userImage = getOptionalString(body.user?.image, 500);
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 40);
  const callId = `lesson-${safeUserId}-${globalThis.crypto.randomUUID().slice(0, 12)}`;
  const language = LANGUAGES.find(({ code }) => code === body.language)!;
  let serverToken: string;
  let token: string;

  try {
    [serverToken, token] = await Promise.all([
      createStreamServerToken(secret),
      createStreamUserToken(userId, secret),
    ]);
  } catch (error) {
    console.error("[stream-call] Unable to create a Stream user token:", error);
    return Response.json(
      { error: "Unable to authorize the audio lesson call" },
      { status: 500 },
    );
  }

  const streamHeaders = {
    Authorization: serverToken,
    "Content-Type": "application/json",
    "stream-auth-type": "jwt",
  };

  try {
    const streamUser = {
      id: userId,
      name: userName,
      role: "user",
      ...(userImage ? { image: userImage } : {}),
    };
    const userResponse = await fetch(
      `https://video.stream-io-api.com/api/v2/users?api_key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: streamHeaders,
        body: JSON.stringify({ users: { [userId]: streamUser } }),
      },
    );

    if (!userResponse.ok) {
      const details = await userResponse.text();
      console.error(
        `[stream-call] Stream user sync returned ${userResponse.status}: ${details}`,
      );
      return Response.json(
        { error: "Unable to prepare the learner for the audio call" },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("[stream-call] Unable to sync the Stream user:", error);
    return Response.json(
      { error: "Unable to reach the audio call service" },
      { status: 503 },
    );
  }

  let streamResponse: Response;
  try {
    streamResponse = await fetch(
      `https://video.stream-io-api.com/api/v2/video/call/${CALL_TYPE}/${encodeURIComponent(callId)}?api_key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: streamHeaders,
        body: JSON.stringify({
          data: {
            created_by_id: userId,
            members: [
              { role: "admin", user_id: userId },
              { role: "admin", user_id: "ai-teacher" },
            ],
            custom: {
              clerk_user_id: userId,
              user_name: userName,
              user_image: userImage,
              lesson_id: lesson.id,
              lesson_title: lesson.title,
              lesson_description: lesson.description,
              lesson: {
                id: lesson.id,
                title: lesson.title,
                description: lesson.description,
              },
              language: language.code,
              language_name: language.name,
              goals: lesson.goals.map((goal) => goal.description),
              vocabulary: lesson.vocabulary.map(
                ({ pronunciation, translation, word }) => ({
                  pronunciation,
                  translation,
                  word,
                }),
              ),
              phrases: lesson.phrases.map(
                ({ pronunciation, text, translation }) => ({
                  pronunciation,
                  text,
                  translation,
                }),
              ),
              topics: lesson.aiTeacherPrompt.topics,
              system_prompt: lesson.aiTeacherPrompt.systemPrompt,
              intro_message: lesson.aiTeacherPrompt.introMessage,
              ai_teacher_prompt: lesson.aiTeacherPrompt,
            },
            settings_override: {
              audio: {
                default_device: "speaker",
                mic_default_on: false,
              },
              transcription: {
                closed_caption_mode: "available",
                language: "auto",
                mode: "available",
                speech_segment_config: {
                  max_speech_caption_ms: 5000,
                  silence_duration_ms: 500,
                },
              },
            },
          },
        }),
      },
    );
  } catch (error) {
    console.error("[stream-call] Unable to reach Stream:", error);
    return Response.json(
      { error: "Unable to reach the audio call service" },
      { status: 503 },
    );
  }

  if (!streamResponse.ok) {
    const details = await streamResponse.text();
    console.error(
      `[stream-call] Stream returned ${streamResponse.status}: ${details}`,
    );
    return Response.json(
      { error: "Unable to create the audio lesson call" },
      { status: 502 },
    );
  }

  return Response.json({
    apiKey,
    callId,
    callType: CALL_TYPE,
    token,
    userId,
  });
}
