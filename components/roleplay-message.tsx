import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import type { RoleplayMessage as Message } from "@/types/roleplay";

export function RoleplayMessage({ message }: { message: Message }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const isTutor = message.role === "assistant";

  return (
    <View className={`mb-4 max-w-[88%] ${isTutor ? "self-start" : "self-end"}`}>
      <Text className={`mb-1 font-poppins-medium text-[11px] text-[#7A8594] ${isTutor ? "ml-2" : "mr-2 text-right"}`}>
        {isTutor ? "Nataku" : "You"}
      </Text>
      <View className={`rounded-[20px] border-2 px-4 py-3 ${isTutor
        ? "rounded-bl-md border-[#E5E8E1] bg-white"
        : "rounded-br-md border-[#BEE39B] bg-[#E3F6D3]"}`}>
        <Text selectable className="font-poppins-medium text-[15px] leading-[24px] text-[#263B21]">{message.text}</Text>
        {isTutor && message.reply && (
          <>
            <TouchableOpacity
              className="mt-1 min-h-[44px] flex-row items-center gap-1.5 self-start"
              accessibilityRole="button"
              accessibilityLabel={showTranslation ? "Hide Portuguese translation" : "Show Portuguese translation"}
              accessibilityState={{ expanded: showTranslation }}
              onPress={() => setShowTranslation((value) => !value)}
            >
              <Ionicons name="language-outline" size={15} color="#5C7E46" />
              <Text className="font-poppins-semibold text-[11px] text-[#5C7E46]">{showTranslation ? "Hide translation" : "Translate"}</Text>
            </TouchableOpacity>
            {showTranslation && <Text selectable className="chat__muted border-t border-[#E8EEE4] pt-2">{message.reply.translation}</Text>}
          </>
        )}
      </View>
      {message.reply?.correction && (
        <View className="mt-2 rounded-[18px] border border-[#F2D994] bg-[#FFF9E9] px-4 py-3">
          <View className="mb-1 flex-row items-center gap-1.5">
            <Ionicons name="bulb" size={15} color="#B48213" />
            <Text className="font-poppins-semibold text-[12px] text-[#9A6A12]">A little tip</Text>
          </View>
          <Text selectable className="font-poppins-medium text-[13px] leading-[21px] text-text-primary">{message.reply.correction.correctedText}</Text>
          <Text selectable className="chat__muted mt-1">{message.reply.correction.explanation}</Text>
        </View>
      )}
    </View>
  );
}
