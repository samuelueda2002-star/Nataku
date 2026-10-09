import type { RoleplayMessage, RoleplayReply } from "@/types/roleplay";

/** Validate AI output on the server and again before rendering it on the device. */
export function isRoleplayReply(value: unknown): value is RoleplayReply {
  if (!value || typeof value !== "object") return false;
  const reply = value as Record<string, unknown>;
  const isText = (text: unknown, maxLength: number): text is string =>
    typeof text === "string" && text.trim().length > 0 && text.length <= maxLength;

  if (!isText(reply.text, 800) || !isText(reply.translation, 1000)) return false;
  if (
    !Array.isArray(reply.suggestions) ||
    reply.suggestions.length > 3 ||
    !reply.suggestions.every((text) => isText(text, 140))
  ) return false;

  if (reply.correction === null) return true;
  if (!reply.correction || typeof reply.correction !== "object") return false;
  const correction = reply.correction as Record<string, unknown>;
  return isText(correction.correctedText, 600) && isText(correction.explanation, 600);
}

/** Keep the tutor from repeating an older tip under a different learner reply. */
export function withoutStaleCorrection(reply: RoleplayReply, conversation: RoleplayMessage[]): RoleplayReply {
  const correction = reply.correction;
  if (!correction) return reply;
  const latestText = conversation.at(-1)?.text.trim().toLowerCase();
  const isOlderTip = conversation.some((message, index) =>
    message.reply?.correction?.correctedText.trim().toLowerCase() === correction.correctedText.trim().toLowerCase() &&
    conversation[index - 1]?.text.trim().toLowerCase() !== latestText,
  );
  return isOlderTip ? { ...reply, correction: null } : reply;
}
