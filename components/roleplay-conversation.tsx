import { NatakuMascot } from "@/components/nataku-mascot";
import { RoleplayMessage } from "@/components/roleplay-message";
import { MAX_ROLEPLAY_MESSAGE_LENGTH, ROLEPLAY_TURNS, type RoleplayMessage as Message, type RoleplayScenario } from "@/types/roleplay";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ConversationProps = {
  scenario: RoleplayScenario;
  messages: Message[];
  turns: number;
  isLoading: boolean;
  error: string | null;
  readyToFinish: boolean;
  onSend: (text: string) => boolean;
  onRetry: () => void;
  onLeave: () => void;
  onFinish: () => void;
};

export function RoleplayConversation({ scenario, messages, turns, isLoading, error, readyToFinish, onSend, onRetry, onLeave, onFinish }: ConversationProps) {
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const scrollOnChangeRef = useRef(true);
  const insets = useSafeAreaInsets();
  const latestReply = messages.at(-1)?.reply;
  const canType = !isLoading && !error && !readyToFinish;

  useEffect(() => { if (!canType) inputRef.current?.blur(); }, [canType]);
  useLayoutEffect(() => {
    scrollOnChangeRef.current = true;
  }, [messages.length, isLoading, error]);
  const send = () => { if (onSend(draft)) setDraft(""); };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={insets.top}>
      <View className="border-b border-[#E8EEE3] bg-white px-5 pb-3 pt-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity className="h-[44px] w-[44px] items-center justify-center rounded-2xl bg-[#F4F6F1]" accessibilityRole="button" accessibilityLabel="Leave roleplay" onPress={onLeave}>
            <Ionicons name="close" size={23} color="#78836F" />
          </TouchableOpacity>
          <NatakuMascot portrait className="h-11 w-11 rounded-full" />
          <View className="flex-1">
            <Text className="font-poppins-semibold text-[17px] text-text-primary">Nataku</Text>
            <Text className="chat__muted" numberOfLines={1}>{scenario.title}</Text>
          </View>
          <View className="rounded-full bg-[#E7F5DB] px-2.5 py-1.5">
            <Text className="font-poppins-semibold text-[11px] text-[#4A811F]">{turns}/{ROLEPLAY_TURNS}</Text>
          </View>
        </View>
        <View className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#E7ECDD]" accessible accessibilityRole="progressbar" accessibilityLabel="Conversation progress" accessibilityValue={{ min: 0, max: ROLEPLAY_TURNS, now: turns }}>
          <View className="h-full rounded-full bg-[#58CC02]" style={{ width: `${Math.min(turns / ROLEPLAY_TURNS, 1) * 100}%` }} />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 bg-[#F8FAF5]"
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (scrollOnChangeRef.current) {
            scrollOnChangeRef.current = false;
            scrollRef.current?.scrollToEnd({ animated: true });
          }
        }}
      >
        <View className="mb-5 self-center rounded-2xl bg-[#EEF3E6] px-4 py-3">
          <Text className="font-poppins-semibold text-[10px] text-center tracking-[1px] text-[#73825E]">YOUR MISSION</Text>
          <Text className="mt-1 text-center font-poppins-medium text-[12px] leading-[19px] text-[#5B7046]">{scenario.goal}</Text>
        </View>
        {messages.map((message) => <RoleplayMessage key={message.id} message={message} />)}
        {isLoading && (
          <View className="mb-3 flex-row items-center gap-2 self-start rounded-[18px] border-2 border-[#E5E8E1] bg-white px-4 py-3" accessibilityLiveRegion="polite">
            <ActivityIndicator size="small" color="#58A92D" />
            <Text className="chat__muted">Nataku is typing...</Text>
          </View>
        )}
        {error && (
          <View className="rounded-2xl border border-[#F3D8CB] bg-[#FFF5EF] px-4 py-3" accessibilityLiveRegion="polite">
            <Text selectable className="font-poppins text-[13px] leading-[21px] text-[#9C5736]">{error}</Text>
            <TouchableOpacity className="mt-1 min-h-[44px] flex-row items-center gap-2" accessibilityRole="button" accessibilityLabel="Retry Nataku's reply" onPress={onRetry}>
              <Ionicons name="refresh" size={17} color="#9C5736" />
              <Text className="font-poppins-semibold text-[13px] text-[#9C5736]">Try again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {readyToFinish ? (
        <View className="border-t border-[#E8EEE3] bg-white px-5 py-4">
          <TouchableOpacity className="chat__button" activeOpacity={0.8} accessibilityRole="button" onPress={onFinish}>
            <Text className="font-poppins-bold text-[14px] tracking-[0.7px] text-[#24500F]">FINISH CONVERSATION</Text>
            <Ionicons name="checkmark-circle" size={21} color="#24500F" />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="border-t border-[#E8EEE3] bg-white pb-3 pt-3">
          {canType && latestReply && latestReply.suggestions.length > 0 && (
            <View className="mb-3">
              <Text className="chat__muted mb-2 px-5">Need a hand? Try a reply</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.suggestions}>
                {latestReply.suggestions.map((suggestion) => (
                  <TouchableOpacity key={suggestion} className="min-h-[44px] justify-center rounded-2xl border-2 border-b-[3px] border-[#D9E7CE] bg-[#F7FBF3] px-3 py-2" accessibilityRole="button" accessibilityLabel={`Use suggested reply: ${suggestion}`} activeOpacity={0.7} onPress={() => { setDraft(suggestion); inputRef.current?.focus(); }}>
                    <Text className="font-poppins-medium text-[12px] text-[#45672E]">{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          <View className="flex-row items-end gap-2 px-5">
            <View className="min-h-[52px] flex-1 justify-center rounded-[18px] border-2 border-[#DFE5D8] bg-[#F8FAF5] px-3 py-2">
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={send}
                editable={canType}
                multiline
                maxLength={MAX_ROLEPLAY_MESSAGE_LENGTH}
                placeholder={isLoading ? "Nataku is thinking..." : error ? "Retry to continue" : "Write in English..."}
                placeholderTextColor="#9BA592"
                accessibilityLabel="Your roleplay reply"
                returnKeyType="send"
                submitBehavior="submit"
              />
            </View>
            <TouchableOpacity className={`h-[52px] w-[52px] items-center justify-center rounded-[18px] border-b-4 ${canType && draft.trim() ? "border-[#46A302] bg-[#58CC02]" : "border-[#D5DBCE] bg-[#E5EADD]"}`} disabled={!canType || !draft.trim()} activeOpacity={0.75} accessibilityRole="button" accessibilityLabel="Send reply" accessibilityState={{ disabled: !canType || !draft.trim() }} onPress={send}>
              <Ionicons name="arrow-up" size={25} color={canType && draft.trim() ? "#24500F" : "#A5AE9B"} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messages: { padding: 20, paddingBottom: 12 },
  suggestions: { paddingHorizontal: 20, gap: 8 },
  input: { fontFamily: "Poppins-Regular", fontSize: 14, lineHeight: 22, color: "#263B21", padding: 0, maxHeight: 100 },
});
