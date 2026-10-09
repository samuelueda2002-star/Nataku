import { NatakuMascot } from "@/components/nataku-mascot";
import { ROLEPLAY_SCENARIOS } from "@/data/roleplay-scenarios";
import { ROLEPLAY_TURNS, ROLEPLAY_XP, type RoleplayScenario, type RoleplayScenarioId } from "@/types/roleplay";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type RoleplayLobbyProps = {
  completedIds: RoleplayScenarioId[];
  onStart: (scenario: RoleplayScenario) => void;
};

export function RoleplayLobby({ completedIds, onStart }: RoleplayLobbyProps) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text className="font-poppins-bold text-[28px] leading-[38px] text-text-primary">Let&apos;s talk</Text>
      <Text className="chat__muted mt-1">Small conversations. Big confidence.</Text>

      <View className="mt-6 overflow-hidden rounded-[26px] border-2 border-[#D2ECC0] bg-[#F1FBEA] px-5 py-5">
        <View className="flex-row items-center">
          <View className="flex-1 pr-2">
            <View className="mb-2 self-start rounded-full bg-[#DFF3CD] px-2.5 py-1">
              <Text className="font-poppins-semibold text-[10px] tracking-[1px] text-[#3E781F]">CHAT WITH NATAKU</Text>
            </View>
            <Text className="font-poppins-semibold text-[21px] leading-[29px] text-[#234619]">A little chat. A big step.</Text>
            <Text className="chat__muted mt-2">Practice real-life English. Mistakes are welcome here!</Text>
          </View>
          <NatakuMascot className="h-40 w-28" accessibilityLabel="Nataku, your roleplay buddy" />
        </View>
        <View className="mt-4 flex-row items-center gap-2 border-t border-[#D2ECC0] pt-3">
          <Ionicons name="chatbubbles-outline" size={16} color="#4B7F33" />
          <Text className="font-poppins-medium text-[11px] text-[#4B7F33]">Beginner · {ROLEPLAY_TURNS} replies · +{ROLEPLAY_XP} XP</Text>
        </View>
      </View>

      <View className="mb-3 mt-7 flex-row items-center justify-between">
        <Text className="font-poppins-semibold text-[18px] text-text-primary">Pick a situation</Text>
        <Text className="chat__muted">{completedIds.length}/{ROLEPLAY_SCENARIOS.length} practiced</Text>
      </View>
      <View className="gap-3">
        {ROLEPLAY_SCENARIOS.map((scenario) => {
          const isComplete = completedIds.includes(scenario.id);
          return (
            <TouchableOpacity
              key={scenario.id}
              className="flex-row items-center gap-3 rounded-[22px] border-2 border-b-4 border-[#E5E7EB] bg-white p-4"
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`${scenario.title}. ${scenario.description}. ${isComplete ? "Practice again" : `Earn ${ROLEPLAY_XP} XP`}`}
              onPress={() => onStart(scenario)}
            >
              <View className={`h-14 w-14 items-center justify-center rounded-[18px] ${scenario.backgroundClass}`}>
                <Ionicons name={scenario.icon} size={28} color={scenario.iconColor} />
              </View>
              <View className="flex-1">
                <Text className="font-poppins-semibold text-[16px] text-text-primary">{scenario.title}</Text>
                <Text className="chat__muted mt-1">{scenario.description}</Text>
                <View className="mt-2 flex-row items-center gap-1">
                  <Ionicons name={isComplete ? "checkmark-circle" : "flash"} size={13} color={isComplete ? "#3F8D21" : "#DAA000"} />
                  <Text className="font-poppins-medium text-[10px] text-[#5D6C57]">{isComplete ? "Completed · practice again" : `+${ROLEPLAY_XP} XP`}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A5ADBA" />
            </TouchableOpacity>
          );
        })}
      </View>
      <View className="mt-5 flex-row items-start gap-2 rounded-2xl bg-[#F6F7FB] px-4 py-3">
        <Ionicons name="bulb-outline" size={19} color="#768095" />
        <Text className="chat__muted flex-1">Stuck for words? Try a suggested reply or tap Translate for a little help.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { padding: 24, paddingBottom: 28 } });
