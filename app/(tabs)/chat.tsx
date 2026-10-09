import { RoleplayConversation } from "@/components/roleplay-conversation";
import { RoleplayLobby } from "@/components/roleplay-lobby";
import { NatakuMascot } from "@/components/nataku-mascot";
import { useRoleplay } from "@/hooks/use-roleplay";
import { useLearningStore } from "@/store/learningStore";
import { ROLEPLAY_TURNS, ROLEPLAY_XP } from "@/types/roleplay";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  const roleplay = useRoleplay();
  const completedIds = useLearningStore((state) => state.completedRoleplayIds);
  const completeRoleplay = useLearningStore((state) => state.completeRoleplay);
  const [reward, setReward] = useState<number | null>(null);

  const leave = () => {
    if (roleplay.messages.length <= 1) return roleplay.reset();
    Alert.alert("Leave this conversation?", "Your current conversation will be cleared.", [
      { text: "Keep chatting", style: "cancel" },
      { text: "Leave", style: "destructive", onPress: roleplay.reset },
    ]);
  };
  const finish = () => {
    if (!roleplay.scenario || !roleplay.readyToFinish) return;
    const earned = completedIds.includes(roleplay.scenario.id) ? 0 : ROLEPLAY_XP;
    completeRoleplay(roleplay.scenario.id);
    setReward(earned);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {reward !== null ? (
        <ScrollView contentContainerStyle={styles.completion} showsVerticalScrollIndicator={false}>
          <View className="mb-4 h-14 w-14 items-center justify-center rounded-[18px] bg-[#FFF5CE]">
            <Ionicons name="trophy" size={30} color="#D99A00" />
          </View>
          <NatakuMascot className="h-52 w-44" />
          <Text className="mt-5 text-center font-poppins-bold text-[27px] leading-[36px] text-[#397D18]">Conversation complete!</Text>
          <Text className="chat__muted mt-3 text-center">You kept the conversation going for {ROLEPLAY_TURNS} replies. That&apos;s a step worth celebrating!</Text>
          <View className="mt-5 flex-row items-center gap-2 rounded-2xl border-2 border-[#F1D37B] bg-[#FFF8DB] px-5 py-3">
            <Ionicons name={reward > 0 ? "flash" : "checkmark-circle"} size={23} color="#C99500" />
            <Text className="font-poppins-bold text-[18px] text-[#A47600]">{reward > 0 ? `+${reward} XP` : "Practice makes progress"}</Text>
          </View>
          {reward === 0 && <Text className="chat__muted mt-2 text-center">You already earned XP for this scenario.</Text>}
          <TouchableOpacity className="chat__button mt-8 w-full" activeOpacity={0.8} accessibilityRole="button" onPress={() => { setReward(null); roleplay.reset(); }}>
            <Text className="font-poppins-bold text-[14px] tracking-[0.5px] text-[#24500F]">BACK TO SCENARIOS</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : roleplay.scenario ? (
        <RoleplayConversation
          key={roleplay.scenario.id}
          scenario={roleplay.scenario}
          messages={roleplay.messages}
          turns={roleplay.turns}
          isLoading={roleplay.isLoading}
          error={roleplay.error}
          readyToFinish={roleplay.readyToFinish}
          onSend={roleplay.send}
          onRetry={roleplay.retry}
          onLeave={leave}
          onFinish={finish}
        />
      ) : <RoleplayLobby completedIds={completedIds} onStart={roleplay.start} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  completion: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 28 },
});
