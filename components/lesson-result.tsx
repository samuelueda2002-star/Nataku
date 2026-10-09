import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { NatakuMascot } from "@/components/nataku-mascot";

interface LessonResultProps {
  failed: boolean;
  title: string;
  xp: number;
  accuracy: number;
  onRestart: () => void;
  onContinue: () => void;
}

export function LessonResult({ failed, title, xp, accuracy, onRestart, onContinue }: LessonResultProps) {
  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
        <View className="items-center gap-5">
          <View className={`h-40 w-40 items-center justify-center rounded-full ${failed ? "bg-[#FFF0F0]" : "bg-[#F1FBDD]"}`}>
            <NatakuMascot portrait className="h-32 w-32 rounded-[32px]" />
          </View>
          <Text accessibilityRole="header" className={`text-center font-poppins-bold text-[28px] ${failed ? "text-[#FF4B4B]" : "text-[#58A700]"}`}>
            {failed ? "Let’s try again!" : "Lesson complete!"}
          </Text>
          <Text className="text-center font-poppins text-base leading-7 text-[#777777]">
            {failed ? "Mistakes help you learn. Refill your hearts and give it another go." : `Great work practicing ${title.toLowerCase()}. Keep your momentum going!`}
          </Text>
          {!failed ? (
            <View className="mt-3 w-full flex-row gap-4">
              <View className="flex-1 items-center gap-2 rounded-2xl border-2 border-[#FFC800] bg-[#FFFBEA] p-4">
                <Text className="font-poppins-bold text-xs text-[#D89E00]">TOTAL XP</Text>
                <Ionicons name="flash" size={28} color="#FFC800" />
                <Text testID="lesson-earned-xp" className="font-poppins-bold text-2xl text-[#D89E00]">+{xp}</Text>
              </View>
              <View className="flex-1 items-center gap-2 rounded-2xl border-2 border-[#58CC02] bg-[#F4FCEB] p-4">
                <Text className="font-poppins-bold text-xs text-[#58A700]">ACCURACY</Text>
                <Ionicons name="locate" size={28} color="#58CC02" />
                <Text className="font-poppins-bold text-2xl text-[#58A700]">{accuracy}%</Text>
              </View>
            </View>
          ) : null}
          {!failed && xp === 0 ? <Text className="text-center font-poppins text-xs leading-5 text-[#888888]">Practice complete. XP was already earned for this lesson.</Text> : null}
        </View>
      </ScrollView>
      <View className="gap-3 px-6 pb-6 pt-4">
        <TouchableOpacity accessibilityRole="button" testID="lesson-result-continue" className="lesson__button" onPress={failed ? onRestart : onContinue}>
          <Text className="font-poppins-bold text-base text-white">{failed ? "TRY AGAIN" : "CONTINUE"}</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" className="min-h-12 items-center justify-center" onPress={failed ? onContinue : onRestart}>
          <Text className="font-poppins-bold text-sm text-[#1CB0F6]">{failed ? "BACK TO LESSONS" : "PRACTICE AGAIN"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
