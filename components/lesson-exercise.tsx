import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { NatakuMascot } from "@/components/nataku-mascot";
import { getMatchChoices } from "@/data/lesson-activities";
import { useLessonSessionStore } from "@/store/lessonSessionStore";
import type { Activity } from "@/types/learning";

export function LessonExercise({ activity }: { activity: Activity }) {
  const { answer, selectedWords, matches, feedback, choose, toggleWord, pair } = useLessonSessionStore();
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const disabled = feedback !== null;

  const selectPair = (side: "left" | "right", id: string) => {
    const left = side === "left" ? id : selectedLeft;
    const right = side === "right" ? id : selectedRight;
    if (left !== null && right !== null) {
      pair(left, right);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      setSelectedLeft(left);
      setSelectedRight(right);
    }
  };

  return (
    <View className="gap-6">
      <Text accessibilityRole="header" className="font-poppins-bold text-[24px] leading-[34px] text-[#3C3C3C]">
        {activity.question}
      </Text>

      {activity.type !== "match" ? (
        <View className="flex-row items-center gap-4 py-2">
          <NatakuMascot portrait className="h-24 w-24 rounded-[24px]" />
          <View className="min-w-0 flex-1 rounded-[20px] border-2 border-[#E5E5E5] bg-white px-5 py-4">
            <Text className="font-poppins-semibold text-[21px] leading-[32px] text-[#3C3C3C]">{activity.prompt}</Text>
            <Text className="mt-1 font-poppins text-xs text-[#888888]">
              {activity.type === "translate" ? "Portuguese → English" : "English → Portuguese"}
            </Text>
          </View>
        </View>
      ) : (
        <Text className="font-poppins text-sm leading-6 text-[#777777]">
          Tap an English word and its Portuguese meaning. The numbers show your pairs.
        </Text>
      )}

      {activity.type === "multiple-choice" || activity.type === "vocabulary" ? (
        <View className="gap-3">
          {activity.options.map((option, index) => {
            const selected = answer === option;
            return (
              <TouchableOpacity key={option} disabled={disabled} onPress={() => choose(option)}
                accessibilityRole="button" accessibilityLabel={option} accessibilityState={{ selected, disabled }}
                testID={`answer-option-${index}`} activeOpacity={0.8}
                className={`lesson__option flex-row items-center gap-4 ${selected ? "border-[#84D8FF] bg-[#DDF4FF]" : "border-[#E5E5E5] bg-white"}`}>
                <View className={`h-8 w-8 items-center justify-center rounded-lg border-2 ${selected ? "border-[#84D8FF]" : "border-[#E5E5E5]"}`}>
                  <Text className="font-poppins-semibold text-sm text-[#777777]">{index + 1}</Text>
                </View>
                <Text className={`min-w-0 flex-1 font-poppins-medium text-base ${selected ? "text-[#1899D6]" : "text-[#4B4B4B]"}`}>{option}</Text>
                {selected ? <Ionicons name="checkmark-circle" size={23} color="#1CB0F6" /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      {activity.type === "translate" ? (
        <View className="gap-6">
          <View className="min-h-[112px] flex-row flex-wrap content-start gap-2 rounded-2xl border-y-2 border-[#E5E5E5] py-4">
            {selectedWords.length === 0 ? <Text className="font-poppins text-sm text-[#AFAFAF]">Tap the words below to build your answer</Text> : null}
            {selectedWords.map((index) => (
              <TouchableOpacity key={index} disabled={disabled} onPress={() => toggleWord(index)}
                accessibilityRole="button" accessibilityLabel={`Remove ${activity.words[index]}`} accessibilityState={{ disabled }}
                className="lesson__tile border-[#84D8FF] bg-[#DDF4FF]">
                <Text className="font-poppins-medium text-base text-[#1899D6]">{activity.words[index]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row flex-wrap justify-center gap-2">
            {activity.words.map((word, index) => (
              <TouchableOpacity key={index} disabled={disabled || selectedWords.includes(index)} onPress={() => toggleWord(index)}
                testID={`word-tile-${index}`} accessibilityRole="button" accessibilityLabel={`Add ${word}`}
                accessibilityState={{ disabled: disabled || selectedWords.includes(index) }}
                className={`lesson__tile border-[#E5E5E5] ${selectedWords.includes(index) ? "bg-[#E5E5E5]" : "bg-white"}`}>
                <Text className={`font-poppins-medium text-base ${selectedWords.includes(index) ? "text-[#E5E5E5]" : "text-[#4B4B4B]"}`}>{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {activity.type === "match" ? (
        <View className="flex-row gap-3">
          {(["left", "right"] as const).map((side) => (
            <View key={side} className="flex-1 gap-3">
              {(side === "left" ? activity.pairs : getMatchChoices(activity)).map((item) => {
                const leftId = side === "left" ? item.id : Object.keys(matches).find((key) => matches[key] === item.id);
                const pairIndex = activity.pairs.findIndex((entry) => entry.id === leftId);
                const paired = leftId !== undefined && matches[leftId] !== undefined;
                const selected = (side === "left" ? selectedLeft : selectedRight) === item.id;
                return (
                  <TouchableOpacity key={item.id} disabled={disabled} onPress={() => selectPair(side, item.id)}
                    testID={`match-${side}-${item.id}`} accessibilityRole="button"
                    accessibilityLabel={`${side === "left" ? item.word : item.translation}${paired ? `, pair ${pairIndex + 1}` : ""}`}
                    accessibilityState={{ selected, disabled }}
                    className={`lesson__option min-h-[76px] items-center justify-center gap-1 px-2 ${selected ? "border-[#1CB0F6] bg-[#DDF4FF]" : paired ? "border-[#CEB9FF] bg-[#F4EEFF]" : "border-[#E5E5E5] bg-white"}`}>
                    <Text className="text-center font-poppins-medium text-[13px] leading-5 text-[#4B4B4B]">{side === "left" ? item.word : item.translation}</Text>
                    {paired ? <Text className="font-poppins-semibold text-xs text-[#9069CD]">{pairIndex + 1}</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
