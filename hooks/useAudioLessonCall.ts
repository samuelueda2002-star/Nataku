import { useAuth, useUser } from "@clerk/expo";
import {
  Call,
  StreamVideoClient,
} from "@stream-io/video-react-native-sdk";
import { useCallback, useEffect, useRef, useState } from "react";

import { Lesson, LanguageCode } from "@/types/learning";

const AGENT_USER_ID = "ai-teacher";
const AGENT_CONNECTION_TIMEOUT_MS = 20_000;

export type AudioCallStatus =
  | "idle"
  | "loading"
  | "connecting"
  | "joined"
  | "ending"
  | "ended"
  | "error";

export type AgentStatus = "idle" | "connecting" | "connected" | "failed";

type StreamCallSetup = {
  apiKey: string;
  callId: string;
  callType: string;
  token: string;
  userId: string;
};

type StreamToken = Pick<StreamCallSetup, "apiKey" | "token" | "userId">;

type UseAudioLessonCallOptions = {
  language: LanguageCode | null;
  lesson: Lesson | undefined;
};

async function getResponseError(
  response: Response,
  fallback: string,
): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    error?: unknown;
  } | null;

  return typeof body?.error === "string" ? body.error : fallback;
}

export function useAudioLessonCall({
  language,
  lesson,
}: UseAudioLessonCallOptions) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [callStatus, setCallStatus] = useState<AudioCallStatus>("idle");
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const callRef = useRef<Call | null>(null);
  const clientRef = useRef<StreamVideoClient | null>(null);
  const agentSessionRef = useRef<string | null>(null);
  const activeCallIdRef = useRef<string | null>(null);
  const activeCallTypeRef = useRef<string | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const callEndedUnsubscribeRef = useRef<(() => void) | null>(null);
  const agentJoinedUnsubscribeRef = useRef<(() => void) | null>(null);
  const agentLeftUnsubscribeRef = useRef<(() => void) | null>(null);
  const agentConnectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const clerkTokenRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);
  const isEndingRef = useRef(false);
  const mountedRef = useRef(true);
  const operationIdRef = useRef(0);
  const agentAttemptIdRef = useRef(0);

  const stopAgentSession = useCallback(
    async (callId: string | null, sessionId: string | null) => {
      const clerkToken =
        (await getToken().catch(() => null)) ?? clerkTokenRef.current;
      if (!callId || !sessionId || !clerkToken) {
        return;
      }

      await fetch(
        `/api/agent-session?callId=${encodeURIComponent(callId)}&sessionId=${encodeURIComponent(sessionId)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${clerkToken}` },
        },
      ).catch(() => undefined);
    },
    [getToken],
  );

  const disposeResources = useCallback(
    async (endForEveryone: boolean) => {
      const currentCall = callRef.current;
      const currentClient = clientRef.current;
      const sessionId = agentSessionRef.current;

      callEndedUnsubscribeRef.current?.();
      callEndedUnsubscribeRef.current = null;
      agentJoinedUnsubscribeRef.current?.();
      agentJoinedUnsubscribeRef.current = null;
      agentLeftUnsubscribeRef.current?.();
      agentLeftUnsubscribeRef.current = null;
      if (agentConnectionTimerRef.current) {
        clearTimeout(agentConnectionTimerRef.current);
        agentConnectionTimerRef.current = null;
      }

      callRef.current = null;
      clientRef.current = null;
      agentSessionRef.current = null;
      activeCallIdRef.current = null;
      activeCallTypeRef.current = null;
      agentAttemptIdRef.current += 1;

      await stopAgentSession(currentCall?.id ?? null, sessionId);

      let endError: unknown;
      if (endForEveryone && currentCall) {
        try {
          await currentCall.endCall();
        } catch (error) {
          endError = error;
        }
      }

      await currentCall?.leave().catch(() => undefined);
      await currentClient?.disconnectUser().catch(() => undefined);

      if (endError) {
        throw endError;
      }
    },
    [stopAgentSession],
  );

  const fetchStreamToken = useCallback(async (): Promise<string> => {
    const clerkToken = await getToken();
    if (!clerkToken) {
      throw new Error("Please sign in again to continue this lesson");
    }

    const response = await fetch("/api/stream-token", {
      headers: { Authorization: `Bearer ${clerkToken}` },
    });

    if (!response.ok) {
      throw new Error(
        await getResponseError(response, "Unable to refresh the call token"),
      );
    }

    const refreshed = (await response.json()) as StreamToken;
    if (!user || refreshed.userId !== user.id) {
      throw new Error("The call token did not match the signed-in user");
    }

    return refreshed.token;
  }, [getToken, user]);

  const startAgentSession = useCallback(
    async (callId: string, callType: string, clerkToken: string) => {
      if (!mountedRef.current || activeCallIdRef.current !== callId) {
        return;
      }

      const attemptId = ++agentAttemptIdRef.current;
      setAgentStatus("connecting");
      if (agentConnectionTimerRef.current) {
        clearTimeout(agentConnectionTimerRef.current);
      }
      agentConnectionTimerRef.current = setTimeout(() => {
        agentConnectionTimerRef.current = null;
        if (
          mountedRef.current &&
          activeCallIdRef.current === callId &&
          agentAttemptIdRef.current === attemptId
        ) {
          setAgentStatus("failed");
        }
      }, AGENT_CONNECTION_TIMEOUT_MS);

      try {
        const response = await fetch("/api/agent-session", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${clerkToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ callId, callType }),
        });

        if (!response.ok) {
          throw new Error(
            await getResponseError(response, "The AI teacher could not join"),
          );
        }

        const body = (await response.json()) as { session_id?: unknown };
        if (typeof body.session_id !== "string" || !body.session_id) {
          throw new Error("The AI teacher returned an invalid session");
        }

        if (
          !mountedRef.current ||
          activeCallIdRef.current !== callId ||
          agentAttemptIdRef.current !== attemptId
        ) {
          await stopAgentSession(callId, body.session_id);
          return;
        }

        agentSessionRef.current = body.session_id;
        if (
          callRef.current?.state.participants.some(
            (participant) => participant.userId === AGENT_USER_ID,
          )
        ) {
          if (agentConnectionTimerRef.current) {
            clearTimeout(agentConnectionTimerRef.current);
            agentConnectionTimerRef.current = null;
          }
          setAgentStatus("connected");
        }
      } catch (error) {
        console.error("[audio-lesson] Agent session error:", error);
        if (
          agentAttemptIdRef.current === attemptId &&
          agentConnectionTimerRef.current
        ) {
          clearTimeout(agentConnectionTimerRef.current);
          agentConnectionTimerRef.current = null;
        }
        if (
          mountedRef.current &&
          activeCallIdRef.current === callId &&
          agentAttemptIdRef.current === attemptId
        ) {
          setAgentStatus("failed");
        }
      }
    },
    [stopAgentSession],
  );

  const startCall = useCallback(async () => {
    if (inFlightRef.current || !user || !lesson || !language) {
      return;
    }

    inFlightRef.current = true;
    const operationId = ++operationIdRef.current;
    const requestController = new AbortController();
    requestControllerRef.current?.abort();
    requestControllerRef.current = requestController;
    const isCurrentOperation = () =>
      mountedRef.current && operationIdRef.current === operationId;
    setErrorMessage(null);
    setAgentStatus("idle");
    setCallStatus("loading");

    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        throw new Error("Please sign in again to start this lesson");
      }
      if (!isCurrentOperation()) return;

      clerkTokenRef.current = clerkToken;

      const response = await fetch("/api/stream-call", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clerkToken}`,
          "Content-Type": "application/json",
        },
        signal: requestController.signal,
        body: JSON.stringify({
          lessonId: lesson.id,
          language,
          user: {
            image: user.imageUrl,
            name: user.fullName ?? user.firstName ?? "Learner",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(
          await getResponseError(response, "Unable to prepare the audio call"),
        );
      }

      const setup = (await response.json()) as StreamCallSetup;
      if (setup.userId !== user.id) {
        throw new Error("The call user did not match the signed-in user");
      }
      if (!isCurrentOperation()) return;

      setCallStatus("connecting");

      const streamClient = StreamVideoClient.getOrCreateInstance({
        apiKey: setup.apiKey,
        token: setup.token,
        tokenProvider: fetchStreamToken,
        user: {
          id: user.id,
          image: user.imageUrl || undefined,
          name: user.fullName ?? user.firstName ?? user.id,
        },
      });
      const streamCall = streamClient.call(setup.callType, setup.callId);

      clientRef.current = streamClient;
      callRef.current = streamCall;
      activeCallIdRef.current = setup.callId;
      activeCallTypeRef.current = setup.callType;

      agentJoinedUnsubscribeRef.current = streamCall.on(
        "call.session_participant_joined",
        (event) => {
          if (
            event.participant.user.id !== AGENT_USER_ID ||
            activeCallIdRef.current !== setup.callId
          ) {
            return;
          }

          if (agentConnectionTimerRef.current) {
            clearTimeout(agentConnectionTimerRef.current);
            agentConnectionTimerRef.current = null;
          }
          setAgentStatus("connected");
        },
      );
      agentLeftUnsubscribeRef.current = streamCall.on(
        "call.session_participant_left",
        (event) => {
          if (
            event.participant.user.id === AGENT_USER_ID &&
            activeCallIdRef.current === setup.callId &&
            !isEndingRef.current
          ) {
            setAgentStatus("failed");
          }
        },
      );

      callEndedUnsubscribeRef.current = streamCall.on("call.ended", () => {
        if (callRef.current !== streamCall || isEndingRef.current) {
          return;
        }

        operationIdRef.current += 1;
        requestControllerRef.current?.abort();
        requestControllerRef.current = null;
        setClient(null);
        setCall(null);
        setAgentStatus("idle");
        setCallStatus("ended");
        void disposeResources(false).catch(() => undefined);
      });

      await Promise.all([
        streamCall.camera.disable(),
        streamCall.microphone.disable(),
      ]);
      await streamCall.join();
      if (!isCurrentOperation()) {
        await disposeResources(true).catch(() => undefined);
        return;
      }

      setClient(streamClient);
      setCall(streamCall);
      setCallStatus("joined");

      await streamCall.startClosedCaptions().catch((error) => {
        console.warn("[audio-lesson] Closed captions unavailable:", error);
      });
      void startAgentSession(setup.callId, setup.callType, clerkToken);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      console.error("[audio-lesson] Call setup error:", error);
      await disposeResources(true).catch(() => undefined);
      if (!isCurrentOperation()) return;

      setClient(null);
      setCall(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to start the lesson",
      );
      setCallStatus("error");
    } finally {
      if (operationIdRef.current === operationId) {
        inFlightRef.current = false;
        requestControllerRef.current = null;
      }
    }
  }, [
    disposeResources,
    fetchStreamToken,
    getToken,
    language,
    lesson,
    startAgentSession,
    user,
  ]);

  const retryAgent = useCallback(async () => {
    const currentCall = callRef.current;
    const clerkToken = await getToken();

    if (!currentCall || !clerkToken) {
      setAgentStatus("failed");
      return;
    }

    clerkTokenRef.current = clerkToken;
    agentAttemptIdRef.current += 1;
    if (agentConnectionTimerRef.current) {
      clearTimeout(agentConnectionTimerRef.current);
      agentConnectionTimerRef.current = null;
    }
    const previousSessionId = agentSessionRef.current;
    agentSessionRef.current = null;
    await stopAgentSession(currentCall.id, previousSessionId);
    await startAgentSession(
      currentCall.id,
      activeCallTypeRef.current ?? currentCall.type,
      clerkToken,
    );
  }, [getToken, startAgentSession, stopAgentSession]);

  const endCall = useCallback(async () => {
    if (inFlightRef.current || callStatus !== "joined") {
      return false;
    }

    inFlightRef.current = true;
    operationIdRef.current += 1;
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    isEndingRef.current = true;
    setErrorMessage(null);
    setCallStatus("ending");

    try {
      await disposeResources(true);
      setClient(null);
      setCall(null);
      setAgentStatus("idle");
      setCallStatus("ended");
      return true;
    } catch (error) {
      console.error("[audio-lesson] End call error:", error);
      await disposeResources(false).catch(() => undefined);
      setClient(null);
      setCall(null);
      setAgentStatus("idle");
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to end the call",
      );
      setCallStatus("error");
      return false;
    } finally {
      isEndingRef.current = false;
      inFlightRef.current = false;
    }
  }, [callStatus, disposeResources]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      operationIdRef.current += 1;
      inFlightRef.current = false;
      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
      void disposeResources(true).catch(() => undefined);
    };
  }, [disposeResources]);

  return {
    agentStatus,
    call,
    callStatus,
    client,
    endCall,
    errorMessage,
    retryAgent,
    startCall,
  };
}
