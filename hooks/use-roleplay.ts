import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useRef, useState } from "react";

import { getApiUrl } from "@/lib/api";
import { isRoleplayReply, withoutStaleCorrection } from "@/lib/roleplay";
import { MAX_ROLEPLAY_MESSAGE_LENGTH, ROLEPLAY_TURNS, type RoleplayMessage, type RoleplayScenario } from "@/types/roleplay";

export function useRoleplay() {
  const { getToken } = useAuth();
  const [scenario, setScenario] = useState<RoleplayScenario | null>(null);
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const operationRef = useRef(0);
  const inFlightRef = useRef(false);

  const reset = useCallback(() => {
    operationRef.current += 1;
    controllerRef.current?.abort();
    controllerRef.current = null;
    inFlightRef.current = false;
    setIsLoading(false);
    setError(null);
    setScenario(null);
    setMessages([]);
  }, []);

  useEffect(() => () => {
    operationRef.current += 1;
    controllerRef.current?.abort();
  }, []);

  const start = (nextScenario: RoleplayScenario) => {
    reset();
    setScenario(nextScenario);
    setMessages([{ id: "opening", role: "assistant", text: nextScenario.opening.text, reply: nextScenario.opening }]);
  };

  const requestReply = async (conversation: RoleplayMessage[]) => {
    if (!scenario || inFlightRef.current) return;
    inFlightRef.current = true;
    const operation = ++operationRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 55_000);
    setIsLoading(true);
    setError(null);

    try {
      const token = await Promise.race([
        getToken(),
        new Promise<never>((_, reject) => controller.signal.addEventListener(
          "abort", () => reject(new Error("Nataku took too long to reply. Please try again.")),
          { once: true },
        )),
      ]);
      if (controller.signal.aborted) throw new Error("Nataku took too long to reply. Please try again.");
      if (!token) throw new Error("Please sign in again to continue.");
      const response = await fetch(getApiUrl("/api/roleplay"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        signal: controller.signal,
        body: JSON.stringify({ scenarioId: scenario.id, messages: conversation.map(({ role, text }) => ({ role, text })) }),
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const message = body && typeof body === "object" && "error" in body && typeof body.error === "string"
          ? body.error : "Nataku couldn't reply. Please try again.";
        throw new Error(message);
      }
      if (!isRoleplayReply(body)) throw new Error("Nataku couldn't prepare a reply. Please try again.");
      if (operation !== operationRef.current) return;
      const reply = withoutStaleCorrection(body, conversation);
      setMessages([...conversation, { id: `reply-${operation}`, role: "assistant", text: reply.text, reply }]);
    } catch (requestError) {
      if (operation !== operationRef.current) return;
      setError(controller.signal.aborted ? "Nataku took too long to reply. Please try again."
        : requestError instanceof Error ? requestError.message : "Couldn't reach Nataku. Please try again.");
    } finally {
      clearTimeout(timeout);
      if (operation === operationRef.current) {
        inFlightRef.current = false;
        controllerRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const turns = Math.max(0, messages.filter((message) => message.role === "assistant").length - 1);
  const readyToFinish = turns >= ROLEPLAY_TURNS;
  const send = (text: string) => {
    const trimmed = text.trim();
    if (!scenario || !trimmed || trimmed.length > MAX_ROLEPLAY_MESSAGE_LENGTH || inFlightRef.current || error || readyToFinish) return false;
    const conversation = [...messages, { id: `user-${operationRef.current + 1}`, role: "user" as const, text: trimmed }];
    setMessages(conversation);
    void requestReply(conversation);
    return true;
  };

  return {
    scenario, messages, isLoading, error, turns, readyToFinish, start, reset, send,
    retry: () => { if (error && !inFlightRef.current) void requestReply(messages); },
  };
}
