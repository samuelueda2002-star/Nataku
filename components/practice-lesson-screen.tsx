import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { BackHandler, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LessonExercise } from "@/components/lesson-exercise";
import { LessonResult } from "@/components/lesson-result";
import { LESSONS } from "@/data/lessons";
import { getCorrectAnswer } from "@/lib/lesson-practice";
import { getCourseLessons, getPathStatus } from "@/lib/learning-path";
import { useLearningStore } from "@/store/learningStore";
import { useLessonSessionStore } from "@/store/lessonSessionStore";
import type { Lesson } from "@/types/learning";

function LessonSession({ lesson }: { lesson: Lesson }) {
  const session = useLessonSessionStore();
  const completeLesson = useLearningStore((state) => state.completeLesson);
  const [showExit, setShowExit] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const { start } = session;

  useFocusEffect(useCallback(() => {
    start(lesson);
    setEarnedXP(0);
    setShowHint(false);
    setShowExit(false);
  }, [lesson, start]));

  const leave = () => router.replace("/(tabs)/learn");
  useFocusEffect(useCallback(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      if (useLessonSessionStore.getState().status === "playing") setShowExit(true);
      else router.replace("/(tabs)/learn");
      return true;
    });
    return () => handler.remove();
  }, []));

  if (session.lessonId !== lesson.id) return <View className="flex-1 bg-white" />;

  const activity = session.activities[session.queue[session.position]];
  const correct = session.feedback === "correct";
  const canCheck = activity?.type === "match"
    ? activity.pairs.every((pair) => session.matches[pair.id] !== undefined)
    : session.answer.trim().length > 0;

  const continueLesson = () => {
    if (useLessonSessionStore.getState().status !== "playing") return;
    if (session.feedback) {
      session.advance();
      if (useLessonSessionStore.getState().status === "completed") {
        setEarnedXP(completeLesson(lesson.id));
      }
      setShowHint(false);
    } else {
      session.check();
      const feedback = useLessonSessionStore.getState().feedback;
      if (feedback) void Haptics.notificationAsync(feedback === "correct"
        ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {session.status !== "playing" ? (
        <LessonResult failed={session.status === "failed"} title={lesson.title} xp={earnedXP}
          accuracy={session.attempts ? Math.round(session.correctCount / session.attempts * 100) : 0}
          onContinue={leave} onRestart={() => { start(lesson); setShowHint(false); setEarnedXP(0); }} />
      ) : activity ? (
        <>
          <View className="flex-row items-center gap-3 px-4 py-4">
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Exit lesson" testID="lesson-exit"
              onPress={() => setShowExit(true)} className="h-11 w-11 items-center justify-center">
              <Ionicons name="close" size={30} color="#AFAFAF" />
            </TouchableOpacity>
            <View className="h-4 flex-1 overflow-hidden rounded-full bg-[#E5E5E5]"
              accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: session.activities.length, now: session.mastered.length }}>
              <View className="h-full rounded-full bg-[#58CC02]" style={{ width: `${session.mastered.length / session.activities.length * 100}%` }}>
                <View className="mx-2 mt-[3px] h-1 rounded-full bg-[#80E02C]" />
              </View>
            </View>
            <View className="flex-row items-center gap-1" accessibilityLabel={`${session.hearts} hearts remaining`}>
              <Ionicons name="heart" size={27} color="#FF4B4B" />
              <Text className="font-poppins-bold text-lg text-[#FF4B4B]">{session.hearts}</Text>
            </View>
          </View>
          <ScrollView key={session.position} showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}>
            <View className="mb-5 flex-row items-center justify-between gap-3">
              <Text className="min-w-0 flex-1 font-poppins-semibold text-xs uppercase tracking-wide text-[#AFAFAF]">{lesson.title}</Text>
              <Text className="font-poppins-semibold text-xs text-[#58A700]">
                {session.position >= session.activities.length ? "MISTAKE REVIEW" : `${session.position + 1} / ${session.activities.length}`}
              </Text>
            </View>
            <LessonExercise key={`${activity.id}-${session.position}`} activity={activity} />
            {activity.hint ? (
              <TouchableOpacity accessibilityRole="button" onPress={() => setShowHint((show) => !show)} className="mt-6 min-h-11 justify-center">
                <Text className="font-poppins-medium text-sm text-[#1CB0F6]">{showHint ? activity.hint : "Need a pronunciation tip?"}</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
          <View className={`border-t-2 px-6 pb-6 pt-5 ${session.feedback ? correct ? "border-[#D7FFB8] bg-[#D7FFB8]" : "border-[#FFDFE0] bg-[#FFDFE0]" : "border-[#E5E5E5] bg-white"}`}>
            {session.feedback ? (
              <View accessibilityLiveRegion="polite" className="mb-4 flex-row items-start gap-3">
                <Ionicons name={correct ? "checkmark-circle" : "close-circle"} size={32} color={correct ? "#58A700" : "#EA2B2B"} />
                <View className="min-w-0 flex-1">
                  <Text className={`font-poppins-bold text-xl ${correct ? "text-[#58A700]" : "text-[#EA2B2B]"}`}>{correct ? "Nicely done!" : "You’ll get it!"}</Text>
                  {!correct ? (
                    <Text className="mt-1 font-poppins-medium text-sm leading-6 text-[#EA2B2B]">
                      Correct answer: {getCorrectAnswer(activity)}
                    </Text>
                  ) : null}
                  {!correct && session.hearts > 0 ? <Text className="mt-1 font-poppins text-xs text-[#EA2B2B]">We’ll practice this one again.</Text> : null}
                </View>
              </View>
            ) : null}
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled: !session.feedback && !canCheck }}
              testID="lesson-check" disabled={!session.feedback && !canCheck} onPress={continueLesson}
              className={`lesson__button ${session.feedback === "incorrect" ? "border-[#C52222] bg-[#FF4B4B]" : !session.feedback && !canCheck ? "border-[#D4D4D4] bg-[#E5E5E5]" : ""}`}>
              <Text className={`font-poppins-bold text-base tracking-wide ${!session.feedback && !canCheck ? "text-[#AFAFAF]" : "text-white"}`}>
                {session.feedback ? "CONTINUE" : "CHECK"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
      <Modal transparent visible={showExit} animationType="fade" onRequestClose={() => setShowExit(false)}>
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-md gap-4 rounded-[28px] bg-white p-6">
            <Text className="text-center font-poppins-bold text-2xl text-[#3C3C3C]">Take a break?</Text>
            <Text className="text-center font-poppins text-sm leading-6 text-[#777777]">Your progress in this lesson will be lost. Completed lessons and XP are saved.</Text>
            <TouchableOpacity accessibilityRole="button" className="lesson__button" onPress={() => setShowExit(false)}>
              <Text className="font-poppins-bold text-base text-white">KEEP LEARNING</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" testID="lesson-confirm-exit" className="min-h-12 items-center justify-center" onPress={() => { setShowExit(false); leave(); }}>
              <Text className="font-poppins-bold text-sm text-[#FF4B4B]">END LESSON</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export function PracticeLessonScreen({ lessonId }: { lessonId: string }) {
  const lesson = LESSONS.find((item) => item.id === lessonId);
  const completedIds = useLearningStore((state) => state.completedLessonIds);
  const locked = lesson && getPathStatus(lesson.id, getCourseLessons("en"), completedIds) === "locked";
  if (!lesson || locked) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 items-center justify-center gap-4 px-6">
        <Text className="font-poppins-semibold text-xl text-text-primary">{locked ? "Keep following your path" : "Lesson not found"}</Text>
        {locked ? <Text className="text-center font-poppins text-sm leading-6 text-text-secondary">Complete the previous lessons to unlock this one.</Text> : null}
        <TouchableOpacity accessibilityRole="button" className="lesson__button px-6" onPress={() => router.replace("/(tabs)/learn")}>
          <Text className="font-poppins-semibold text-white">BACK TO LESSONS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
  return <LessonSession key={lesson.id} lesson={lesson} />;
}
