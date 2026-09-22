import type { Lesson } from "@/types/learning";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import {
  type Call,
  type CallClosedCaption,
  StreamCall,
  StreamVideo,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { LANGUAGES } from "@/data/languages";
import { LESSONS } from "@/data/lessons";
import {
  type AgentStatus,
  type AudioCallStatus,
  useAudioLessonCall,
} from "@/hooks/useAudioLessonCall";
import { posthog } from "@/lib/posthog";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";

const AGENT_USER_ID = "ai-teacher";

type LiveCaption = {
  speaker: "agent" | "user";
  text: string;
};

type StageProps = {
  agentStatus: AgentStatus;
  callStatus: AudioCallStatus;
  errorMessage: string | null;
  languageName: string;
  learnerImageUrl?: string;
  learnerName: string;
  lesson: Lesson;
  micActive: boolean;
  micBusy: boolean;
  micDisabled: boolean;
  micError?: string | null;
  micLabel: string;
  onEnd: () => void;
  onMic: () => void;
  onRetryAgent?: () => void;
  onToggleSubtitles: () => void;
  subtitlesEnabled: boolean;
  visibleCaption?: LiveCaption | null;
};

export function AudioLessonScreen({ lessonId }: { lessonId?: string }) {
  const router = useRouter();
  const { isLoaded, user } = useUser();
  const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
  const streak = useLearningStore((state) => state.streak);
  const lesson = LESSONS.find((candidate) => candidate.id === lessonId);
  const language = LANGUAGES.find(
    (candidate) => candidate.code === selectedLanguage,
  );
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const lessonStartTimeRef = useRef<number | null>(null);
  const abandonedRef = useRef(false);

  const {
    agentStatus,
    call,
    callStatus,
    client,
    endCall,
    errorMessage,
    retryAgent,
    startCall,
  } = useAudioLessonCall({ language: selectedLanguage, lesson });

  useEffect(() => {
    if (!isLoaded || !user || !lesson) return;

    lessonStartTimeRef.current = Date.now();
    abandonedRef.current = false;
    posthog.capture("lesson_started", {
      language: selectedLanguage ?? lesson.id.split("-")[0],
      lesson_id: lesson.id,
      lesson_number: LESSONS.findIndex((item) => item.id === lesson.id) + 1,
    });

    return () => {
      if (abandonedRef.current) return;

      abandonedRef.current = true;
      posthog.capture("lesson_abandoned", {
        last_question_index: 0,
        lesson_id: lesson.id,
        time_into_lesson_seconds: lessonStartTimeRef.current
          ? Math.floor((Date.now() - lessonStartTimeRef.current) / 1000)
          : 0,
      });
    };
  }, [isLoaded, lesson, selectedLanguage, user]);

  const trackExit = () => {
    if (abandonedRef.current) return;

    abandonedRef.current = true;
    posthog.capture("lesson_abandoned", {
      last_question_index: 0,
      lesson_id: lesson?.id ?? lessonId ?? "unknown",
      time_into_lesson_seconds: lessonStartTimeRef.current
        ? Math.floor((Date.now() - lessonStartTimeRef.current) / 1000)
        : 0,
    });
  };

  const handleBack = async () => {
    if (callStatus === "joined") {
      const didEnd = await endCall();
      if (!didEnd) return;
    }

    trackExit();
    router.back();
  };

  const handleEnd = async () => {
    if (callStatus === "joined") {
      await endCall();
      return;
    }

    if (["loading", "connecting", "ending"].includes(callStatus)) return;
    await handleBack();
  };

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text className="font-poppins-semibold text-[20px] text-text-primary">
            Lesson not found
          </Text>
          <TouchableOpacity
            className="rounded-full bg-lingua-purple px-5 py-3"
            onPress={() => router.back()}
          >
            <Text className="font-poppins-medium text-[14px] text-white">
              Back to lessons
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const languageName = language?.name ?? "English";
  const learnerName = user?.fullName ?? user?.firstName ?? "Learner";
  const sharedStageProps = {
    agentStatus,
    callStatus,
    errorMessage,
    languageName,
    learnerImageUrl: user?.imageUrl,
    learnerName,
    lesson,
    onEnd: () => void handleEnd(),
    onToggleSubtitles: () => setSubtitlesEnabled((current) => !current),
    subtitlesEnabled,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <LessonHeader
          agentStatus={agentStatus}
          languageName={languageName}
          lessonTitle={lesson.title}
          onBack={() => void handleBack()}
          streak={streak}
        />

        {callStatus === "joined" && client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <ConnectedLessonStage
                {...sharedStageProps}
                call={call}
                onRetryAgent={retryAgent}
              />
            </StreamCall>
          </StreamVideo>
        ) : (
          <LessonStage
            {...sharedStageProps}
            micActive={false}
            micBusy={["loading", "connecting", "ending"].includes(callStatus)}
            micDisabled={
              !user ||
              !selectedLanguage ||
              ["loading", "connecting", "ending", "ended"].includes(
                callStatus,
              )
            }
            micLabel={callStatus === "error" ? "Try again" : "Start Call"}
            onMic={startCall}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonHeader({
  agentStatus,
  languageName,
  lessonTitle,
  onBack,
  streak,
}: {
  agentStatus: AgentStatus;
  languageName: string;
  lessonTitle: string;
  onBack: () => void;
  streak: number;
}) {
  const displayStatus = getDisplayStatus(agentStatus);

  return (
    <View className="h-[106px] flex-row items-center px-5">
      <TouchableOpacity
        accessibilityLabel="Back to lessons"
        accessibilityRole="button"
        className="h-12 w-10 items-start justify-center"
        hitSlop={{ bottom: 8, left: 8, right: 8, top: 8 }}
        onPress={onBack}
      >
        <Ionicons name="chevron-back" size={32} color="#07152D" />
      </TouchableOpacity>

      <View className="min-w-0 flex-1 pl-2 pr-1">
        <Text
          className="font-poppins-semibold text-[21px] leading-[28px] text-text-primary"
          numberOfLines={1}
        >
          AI Teacher
        </Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: displayStatus.color }}
          />
          <Text
            className="flex-1 font-poppins text-[13px] leading-[19px] text-[#65708D]"
            numberOfLines={1}
          >
            {displayStatus.label} · {languageName} · {lessonTitle}
          </Text>
        </View>
      </View>

      <HeaderCircle accessibilityLabel="Audio-only teacher preview">
        <Ionicons name="videocam-outline" size={22} color="#081A3E" />
      </HeaderCircle>
      <HeaderCircle accessibilityLabel={`${streak} day streak`}>
        <Text className="font-poppins-medium text-[17px] text-[#07152D]">
          {streak}
        </Text>
      </HeaderCircle>
      <HeaderCircle accessibilityLabel="Lesson notifications">
        <Ionicons name="notifications-outline" size={22} color="#081A3E" />
      </HeaderCircle>
    </View>
  );
}

function HeaderCircle({
  accessibilityLabel,
  children,
}: {
  accessibilityLabel: string;
  children: React.ReactNode;
}) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className="ml-2 h-[42px] w-[42px] items-center justify-center rounded-full border border-[#E5E8F0] bg-white"
      style={styles.headerCircle}
    >
      {children}
    </View>
  );
}

function ConnectedLessonStage({
  call,
  onRetryAgent,
  ...stageProps
}: Omit<
  StageProps,
  | "micActive"
  | "micBusy"
  | "micDisabled"
  | "micError"
  | "micLabel"
  | "onMic"
  | "visibleCaption"
> & {
  call: Call;
  onRetryAgent: () => void;
}) {
  const { useCallClosedCaptions, useMicrophoneState } = useCallStateHooks();
  const captions = useCallClosedCaptions();
  const { isPromptingPermission, microphone, optimisticIsMute } =
    useMicrophoneState();
  const [isTogglingMic, setIsTogglingMic] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [partialCaption, setPartialCaption] = useState<LiveCaption | null>(null);
  const partialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = call.on(
      "custom",
      (event: {
        custom?: {
          speaker?: "agent" | "user";
          text?: string;
          type?: string;
        };
      }) => {
        const custom = event.custom;
        if (custom?.type !== "transcript_partial" || !custom.text) return;

        setPartialCaption({
          speaker: custom.speaker ?? "agent",
          text: custom.text,
        });
        if (partialTimerRef.current) clearTimeout(partialTimerRef.current);
        partialTimerRef.current = setTimeout(
          () => setPartialCaption(null),
          3000,
        );
      },
    );

    return () => {
      unsubscribe();
      if (partialTimerRef.current) clearTimeout(partialTimerRef.current);
    };
  }, [call]);

  useEffect(() => {
    if (captions.length === 0) return;

    // A committed Stream caption supersedes the local streaming draft.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPartialCaption(null);
    if (partialTimerRef.current) clearTimeout(partialTimerRef.current);
  }, [captions]);

  const latestCaption = captions.at(-1);
  const visibleCaption = partialCaption ?? toLiveCaption(latestCaption);
  const isReady = stageProps.agentStatus === "connected";
  const micBusy = isTogglingMic || isPromptingPermission;

  const handleMic = async () => {
    if (!isReady || micBusy) return;

    setIsTogglingMic(true);
    setMicError(null);
    try {
      await microphone.toggle();
    } catch (error) {
      console.error("[audio-lesson] Microphone toggle error:", error);
      setMicError("Microphone unavailable");
    } finally {
      setIsTogglingMic(false);
    }
  };

  return (
    <LessonStage
      {...stageProps}
      micActive={!optimisticIsMute}
      micBusy={micBusy}
      micDisabled={!isReady || micBusy}
      micError={micError}
      micLabel={!optimisticIsMute ? "Mute" : "Unmute"}
      onMic={() => void handleMic()}
      onRetryAgent={onRetryAgent}
      visibleCaption={visibleCaption}
    />
  );
}

function LessonStage({
  agentStatus,
  callStatus,
  errorMessage,
  languageName,
  learnerImageUrl,
  learnerName,
  lesson,
  micActive,
  micBusy,
  micDisabled,
  micError,
  micLabel,
  onEnd,
  onMic,
  onRetryAgent,
  onToggleSubtitles,
  subtitlesEnabled,
  visibleCaption,
}: StageProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const phrase = lesson.phrases[phraseIndex];
  const teacherResponse = getTeacherResponse(
    callStatus,
    agentStatus,
    errorMessage,
    subtitlesEnabled ? visibleCaption : null,
    lesson,
  );

  const showNextPhrase = () => {
    setPhraseIndex((current) => (current + 1) % lesson.phrases.length);
  };

  return (
    <View className="mx-2 overflow-hidden rounded-t-[24px] bg-[#C7C1C0]">
      <View className="relative h-[338px] overflow-hidden rounded-t-[24px] bg-[#D0C8C3]">
        <Image
          accessibilityLabel="AI teacher preview with the Lingua fox mascot"
          className="h-full w-full"
          contentFit="cover"
          source={images.audioLessonPreview}
        />

        <View
          className="absolute left-3 top-3 max-w-[58%] rounded-[15px] bg-white/95 px-3 py-2.5"
          style={styles.lessonBadge}
        >
          <View className="mb-1 flex-row items-center gap-1.5">
            <Ionicons name="headset" size={13} color="#5B3BF6" />
            <Text className="font-poppins-semibold text-[12px] text-lingua-deep-purple">
              {languageName} · Audio lesson
            </Text>
          </View>
          <Text
            className="font-poppins-semibold text-[14px] leading-[18px] text-text-primary"
            numberOfLines={1}
          >
            {lesson.title}
          </Text>
          <Text
            className="mt-0.5 font-poppins text-[10px] leading-[14px] text-[#66708B]"
            numberOfLines={2}
          >
            Goal: {lesson.goals[0]?.description}
          </Text>
        </View>

        <View
          accessibilityLabel={`${learnerName}. ${getLearnerCallStatus(callStatus, micActive)}`}
          className="absolute right-3 top-3 max-w-[40%] flex-row items-center gap-2 rounded-full bg-white/95 py-1.5 pl-1.5 pr-3"
          style={styles.lessonBadge}
        >
          {learnerImageUrl ? (
            <Image
              accessibilityLabel={`${learnerName} profile photo`}
              className="h-8 w-8 rounded-full"
              contentFit="cover"
              source={{ uri: learnerImageUrl }}
            />
          ) : (
            <View className="h-8 w-8 items-center justify-center rounded-full bg-[#EEEAFE]">
              <Text className="font-poppins-semibold text-[12px] text-lingua-deep-purple">
                {getInitials(learnerName)}
              </Text>
            </View>
          )}
          <View className="min-w-0 flex-1">
            <Text
              className="font-poppins-semibold text-[11px] leading-[14px] text-text-primary"
              numberOfLines={1}
            >
              {learnerName}
            </Text>
            <View className="mt-0.5 flex-row items-center gap-1">
              <View
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor:
                    callStatus === "error"
                      ? colors.semantic.error
                      : callStatus === "joined"
                        ? colors.semantic.success
                        : colors.neutral.textSecondary,
                }}
              />
              <Text
                className="font-poppins text-[9px] leading-[12px] text-[#66708B]"
                numberOfLines={1}
              >
                {getLearnerCallStatus(callStatus, micActive)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        accessibilityLabel={`AI teacher context. ${lesson.aiTeacherPrompt.introMessage}. Phrases: ${lesson.phrases
          .map((item) => item.text)
          .join(", ")}`}
        className="relative mx-[50px] -mt-[20px] min-h-[104px] rounded-[18px] bg-white px-4 py-3"
        style={styles.responseBubble}
      >
        <View className="flex-row items-start gap-2">
          <View className="min-w-0 flex-1">
            <Text
              className="font-poppins-medium text-[16px] leading-[22px] text-[#07152D]"
              numberOfLines={1}
              selectable
            >
              {teacherResponse.title}
            </Text>
            <Text
              className="mt-0.5 font-poppins text-[12px] leading-[17px] text-[#34415C]"
              numberOfLines={2}
              selectable
            >
              {teacherResponse.message}
            </Text>
          </View>
          {teacherResponse.busy ? (
            <ActivityIndicator color="#5B3BF6" size="small" />
          ) : (
            <TouchableOpacity
              accessibilityLabel="Show next lesson phrase"
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-full bg-[#F0EDFF]"
              onPress={showNextPhrase}
            >
              <Ionicons name="volume-high" size={20} color="#5B3BF6" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          accessibilityLabel={`Phrase ${phraseIndex + 1} of ${lesson.phrases.length}: ${phrase.text}. Tap for the next phrase.`}
          accessibilityRole="button"
          className="mt-2 flex-row items-center gap-1.5"
          onPress={showNextPhrase}
        >
          <Text className="font-poppins-semibold text-[10px] uppercase tracking-[0.5px] text-lingua-purple">
            Phrase {phraseIndex + 1}/{lesson.phrases.length}
          </Text>
          <Text
            className="flex-1 font-poppins-medium text-[11px] text-[#24324E]"
            numberOfLines={1}
            selectable
          >
            {phrase.text}
          </Text>
        </TouchableOpacity>
        <View style={styles.bubbleTail} />
      </View>

      {agentStatus === "failed" && callStatus === "joined" ? (
        <TouchableOpacity
          className="mx-auto mt-2 flex-row items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5"
          onPress={onRetryAgent}
        >
          <Ionicons name="refresh" size={14} color="#5B3BF6" />
          <Text className="font-poppins-medium text-[11px] text-lingua-deep-purple">
            Retry teacher
          </Text>
        </TouchableOpacity>
      ) : null}

      <View className="flex-row items-start justify-around px-4 pb-5 pt-5">
        <ControlButton
          disabled
          icon="videocam"
          label="Camera"
          onPress={() => undefined}
        />
        <ControlButton
          active={micActive}
          busy={micBusy}
          disabled={micDisabled}
          icon={micActive ? "mic" : "mic-outline"}
          label={micError ?? micLabel}
          onPress={onMic}
        />
        <ControlButton
          active={subtitlesEnabled}
          icon="language"
          label="Subtitles"
          onPress={onToggleSubtitles}
        />
        <ControlButton
          destructive
          disabled={["loading", "connecting", "ending"].includes(callStatus)}
          icon="call"
          label={callStatus === "ended" ? "Exit" : "End Call"}
          onPress={onEnd}
        />
      </View>

      <View
        className="mx-3 mb-5 h-[98px] flex-row items-center rounded-[20px] bg-white px-3"
        style={styles.feedbackCard}
      >
        <FeedbackItem color="#16C70A" label="Speaking" value="Excellent" />
        <View className="h-[54px] w-px bg-[#E8EAF0]" />
        <FeedbackItem color="#2878FF" label="Pronunciation" value="Great" />
        <View className="h-[54px] w-px bg-[#E8EAF0]" />
        <FeedbackItem color="#5835FF" label="Grammar" value="Good" />
      </View>
    </View>
  );
}

function ControlButton({
  active = false,
  busy = false,
  destructive = false,
  disabled = false,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  busy?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const buttonColor = destructive ? "#FF3B3F" : active ? "#6547F5" : "#FFFFFF";
  const iconColor = destructive || active ? "#FFFFFF" : "#071A42";

  return (
    <View className="w-[76px] items-center">
      <TouchableOpacity
        accessibilityLabel={label}
        accessibilityRole="button"
        accessibilityState={{ disabled, selected: active }}
        activeOpacity={0.72}
        className="h-[58px] w-[58px] items-center justify-center rounded-full"
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.controlButton,
          { backgroundColor: buttonColor },
          disabled && !destructive && styles.disabledControl,
        ]}
      >
        {busy ? (
          <ActivityIndicator color={active ? "#FFFFFF" : "#5B3BF6"} />
        ) : (
          <Ionicons
            color={iconColor}
            name={icon}
            size={destructive ? 29 : 27}
            style={destructive ? styles.endCallIcon : undefined}
          />
        )}
      </TouchableOpacity>
      <Text
        className={`mt-2 text-center font-poppins-medium text-[11px] leading-[15px] ${
          destructive ? "text-white" : "text-white"
        }`}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}

function FeedbackItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 items-center gap-2">
      <Text className="font-poppins-medium text-[12px] text-[#101B34]">
        {label}
      </Text>
      <Text
        className="font-poppins-medium text-[12px]"
        style={{ color }}
        selectable
      >
        {value}
      </Text>
    </View>
  );
}

function toLiveCaption(
  caption: CallClosedCaption | undefined,
): LiveCaption | null {
  if (!caption) return null;

  return {
    speaker: caption.user?.id === AGENT_USER_ID ? "agent" : "user",
    text: caption.text,
  };
}

function getTeacherResponse(
  callStatus: AudioCallStatus,
  agentStatus: AgentStatus,
  errorMessage: string | null,
  caption: LiveCaption | null | undefined,
  lesson: Lesson,
): { busy: boolean; message: string; title: string } {
  if (caption) {
    return {
      busy: false,
      message: caption.text,
      title: caption.speaker === "agent" ? "AI Teacher" : "You",
    };
  }

  if (callStatus === "loading") {
    return {
      busy: true,
      message: "Creating a secure audio lesson for you.",
      title: "Preparing your lesson…",
    };
  }

  if (callStatus === "connecting") {
    return {
      busy: true,
      message: "Connecting you with your AI teacher.",
      title: "Joining the lesson…",
    };
  }

  if (callStatus === "ending") {
    return {
      busy: true,
      message: "Saving your progress and closing the session.",
      title: "Ending your lesson…",
    };
  }

  if (callStatus === "ended") {
    return {
      busy: false,
      message: "Nice work today. Your audio session is complete.",
      title: "Lesson complete!",
    };
  }

  if (callStatus === "error") {
    return {
      busy: false,
      message: errorMessage ?? "Tap the microphone to try again.",
      title: "Connection failed",
    };
  }

  if (callStatus === "joined" && agentStatus === "connecting") {
    return {
      busy: true,
      message: "Your teacher is joining the audio room.",
      title: "Starting lesson…",
    };
  }

  if (callStatus === "joined" && agentStatus === "failed") {
    return {
      busy: false,
      message: "Retry the teacher connection to continue.",
      title: "Teacher unavailable",
    };
  }

  return {
    busy: false,
    message: lesson.aiTeacherPrompt.introMessage,
    title: callStatus === "joined" ? "Let’s begin!" : "Ready to practice?",
  };
}

function getDisplayStatus(
  agentStatus: AgentStatus,
): { color: string; label: string } {
  const statuses: Record<AgentStatus, { color: string; label: string }> = {
    connected: {
      color: colors.semantic.success,
      label: "Teacher connected",
    },
    connecting: {
      color: colors.semantic.warning,
      label: "Teacher connecting",
    },
    failed: {
      color: colors.semantic.error,
      label: "Teacher failed",
    },
    idle: {
      color: colors.neutral.textSecondary,
      label: "Teacher idle",
    },
  };

  return statuses[agentStatus];
}

function getLearnerCallStatus(
  callStatus: AudioCallStatus,
  micActive: boolean,
): string {
  if (callStatus === "joined") {
    return micActive ? "Joined · Mic on" : "Joined · Muted";
  }

  const labels: Record<AudioCallStatus, string> = {
    connecting: "Connecting",
    ended: "Call ended",
    ending: "Ending call",
    error: "Call error",
    idle: "Ready",
    joined: "Joined",
    loading: "Starting call",
  };

  return labels[callStatus];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const styles = StyleSheet.create({
  bubbleTail: {
    backgroundColor: "#FFFFFF",
    bottom: -9,
    height: 20,
    position: "absolute",
    right: 23,
    transform: [{ rotate: "45deg" }],
    width: 20,
  },
  controlButton: {
    borderCurve: "continuous",
    boxShadow: "0 3px 8px rgba(16, 25, 50, 0.16)",
  },
  disabledControl: {
    opacity: 0.92,
  },
  endCallIcon: {
    transform: [{ rotate: "135deg" }],
  },
  feedbackCard: {
    borderCurve: "continuous",
    boxShadow: "0 2px 10px rgba(17, 28, 56, 0.08)",
  },
  headerCircle: {
    borderCurve: "continuous",
    boxShadow: "0 1px 3px rgba(17, 28, 56, 0.06)",
  },
  lessonBadge: {
    borderCurve: "continuous",
    boxShadow: "0 2px 8px rgba(16, 25, 50, 0.12)",
  },
  responseBubble: {
    borderCurve: "continuous",
    boxShadow: "0 4px 12px rgba(16, 25, 50, 0.18)",
  },
  safeArea: {
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
});
