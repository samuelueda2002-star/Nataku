import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { NatakuMascot } from "@/components/nataku-mascot";
import { UNITS } from "@/data/units";
import { getPathStatus } from "@/lib/learning-path";
import type { Lesson } from "@/types/learning";

interface LearningPathProps {
  lessons: Lesson[];
  completedIds: string[];
  selectLesson: (id: string) => void;
}

const UNIT_COLORS = [
  "bg-[#58CC02] border-[#46A302]", "bg-[#1CB0F6] border-[#1899D6]",
  "bg-[#9069CD] border-[#7048AD]", "bg-[#FF9600] border-[#DC7800]",
];
const NODE_OFFSETS = ["self-center", "self-end mr-10", "self-end mr-6", "self-center", "self-start ml-10", "self-start ml-6"];

export function LearningPath({ lessons, completedIds, selectLesson }: LearningPathProps) {
  const currentLesson = lessons.find((lesson) => !completedIds.includes(lesson.id));
  const [selection, setSelection] = useState<{ id: string; currentId?: string } | null>(null);
  const selectedId = selection?.currentId === currentLesson?.id ? selection?.id : null;
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedId) ?? currentLesson ?? lessons.at(-1);
  const units = UNITS.filter((unit) => lessons.some((lesson) => lesson.unitId === unit.id));

  const openLesson = (lesson: Lesson, audio = false) => {
    selectLesson(lesson.id);
    router.push({ pathname: "/lesson/[id]", params: { id: lesson.id, ...(audio ? { mode: "audio" } : {}) } });
  };

  return (
    <View className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="mx-5 mt-3 flex-row items-center gap-3 rounded-[22px] border-2 border-[#E5E5E5] bg-[#FAFDF7] p-4">
          <NatakuMascot portrait className="h-[72px] w-[72px] rounded-[20px]" />
          <View className="min-w-0 flex-1">
            <Text className="font-poppins-bold text-base text-[#4B4B4B]">A little practice, every day.</Text>
            <Text className="mt-1 font-poppins text-xs leading-5 text-[#777777]">Learn words. Build answers. Grow your English.</Text>
          </View>
        </View>
        {units.map((unit, unitIndex) => {
          const unitLessons = lessons.filter((lesson) => lesson.unitId === unit.id);
          const completedCount = unitLessons.filter((lesson) => completedIds.includes(lesson.id)).length;
          return (
            <View key={unit.id}>
              <View className={`mx-5 mb-6 mt-7 gap-1 rounded-2xl border-b-4 p-5 ${UNIT_COLORS[unitIndex % UNIT_COLORS.length]}`}>
                <View className="flex-row items-center justify-between">
                  <Text className="font-poppins-bold text-xs tracking-wide text-white/80">UNIT {unit.order}</Text>
                  <Text className="font-poppins-semibold text-xs text-white/90">{completedCount} / {unitLessons.length}</Text>
                </View>
                <Text className="font-poppins-bold text-xl text-white">{unit.title}</Text>
                <Text className="font-poppins text-xs leading-5 text-white/90">{unit.description}</Text>
              </View>
              <View className="mx-auto w-full max-w-[360px] px-6">
                {unitLessons.map((lesson, index) => {
                  const status = getPathStatus(lesson.id, lessons, completedIds);
                  const current = status === "current";
                  const locked = status === "locked";
                  const completed = status === "completed";
                  return (
                    <View key={lesson.id} className={`w-[116px] items-center pb-5 ${NODE_OFFSETS[index % NODE_OFFSETS.length]}`}>
                      {current ? (
                        <View className="mb-2 rounded-xl border-2 border-[#58CC02] bg-white px-4 py-1.5">
                          <Text className="font-poppins-bold text-xs text-[#58A700]">START</Text>
                        </View>
                      ) : null}
                      <TouchableOpacity activeOpacity={0.8} disabled={locked} onPress={() => setSelection({ id: lesson.id, currentId: currentLesson?.id })}
                        accessibilityRole="button" accessibilityLabel={`${lesson.title}, ${status}`} accessibilityState={{ disabled: locked, selected: selectedLesson?.id === lesson.id }}
                        testID={`lesson-node-${lesson.id}`}
                        className={`h-20 w-20 items-center justify-center rounded-full border-b-[7px] ${locked ? "border-[#CACACA] bg-[#E5E5E5]" : completed ? "border-[#E5AA00] bg-[#FFC800]" : UNIT_COLORS[unitIndex % UNIT_COLORS.length]} ${selectedId === lesson.id ? "border-4" : ""}`}>
                        <Ionicons name={locked ? "lock-closed" : completed ? "checkmark" : "star"} size={36} color={locked ? "#AFAFAF" : "#FFFFFF"} />
                      </TouchableOpacity>
                      <Text numberOfLines={2} className={`mt-2 text-center font-poppins-semibold text-xs leading-5 ${locked ? "text-[#AFAFAF]" : "text-[#5B5B5B]"}`}>{lesson.title}</Text>
                      {index < unitLessons.length - 1 ? <View className="mt-3 h-3 w-3 rounded-full bg-[#E5E5E5]" /> : null}
                    </View>
                  );
                })}
                <View className="mb-2 items-center gap-2 py-4">
                  <View className={`h-16 w-16 items-center justify-center rounded-2xl border-b-4 ${completedCount === unitLessons.length ? "border-[#E5AA00] bg-[#FFC800]" : "border-[#D5D5D5] bg-[#EFEFEF]"}`}>
                    <Ionicons name="trophy" size={32} color={completedCount === unitLessons.length ? "#FFFFFF" : "#AFAFAF"} />
                  </View>
                  <Text className="font-poppins-semibold text-xs text-[#888888]">{completedCount === unitLessons.length ? "Unit complete!" : "Your next milestone"}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      {selectedLesson ? (
        <View className="gap-3 border-t-2 border-[#E5E5E5] bg-white px-5 py-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text numberOfLines={1} className="font-poppins-bold text-base text-[#4B4B4B]">{selectedLesson.title}</Text>
              <Text className="mt-1 font-poppins text-xs text-[#888888]">{selectedLesson.activities.length} exercises · {selectedLesson.xpReward} XP on first completion</Text>
            </View>
            <Ionicons name="flash" size={25} color="#FFC800" />
          </View>
          <TouchableOpacity accessibilityRole="button" testID="start-path-lesson" className="lesson__button" onPress={() => openLesson(selectedLesson)}>
            <Text className="font-poppins-bold text-base tracking-wide text-white">{completedIds.includes(selectedLesson.id) ? "PRACTICE AGAIN" : "START LESSON"}</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" className="min-h-11 flex-row items-center justify-center gap-2" onPress={() => openLesson(selectedLesson, true)}>
            <Ionicons name="headset" size={18} color="#9069CD" />
            <Text className="font-poppins-semibold text-xs text-[#9069CD]">Practice with the AI teacher</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
