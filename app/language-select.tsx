import { images } from "@/constants/images";
import { LANGUAGES } from "@/data/languages";
import { posthog } from "@/lib/posthog";
import { useLanguageStore } from "@/store/languageStore";
import type { Language, LanguageCode } from "@/types/learning";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LanguageSelectScreen() {
  const { setSelectedLanguage } = useLanguageStore();
  const [selectedCode, setSelectedCode] = useState<LanguageCode | null>(
    LANGUAGES[0]?.code ?? null
  );
  const [search, setSearch] = useState("");

  const filteredLanguages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return LANGUAGES;

    return LANGUAGES.filter(
      (language) =>
        language.name.toLowerCase().includes(normalizedSearch) ||
        language.nativeName.toLowerCase().includes(normalizedSearch)
    );
  }, [search]);

  const handleConfirm = () => {
    if (!selectedCode) return;

    const selectedLanguage = LANGUAGES.find(
      (language) => language.code === selectedCode
    );

    posthog.capture("language_selected", {
      language_code: selectedCode,
      language_name: selectedLanguage?.name ?? selectedCode,
    });
    setSelectedLanguage(selectedCode);
    router.replace("/");
  };

  const renderLanguage = (language: Language) => {
    const isSelected = language.code === selectedCode;
    const learnerLabel = /\d/.test(language.learners)
      ? `${language.learners} learners`
      : language.learners;

    return (
      <TouchableOpacity
        key={language.code}
        className={`h-[76px] flex-row items-center rounded-[18px] border px-4 ${
          isSelected
            ? "border-[#7657FF] bg-[#F8F7FF]"
            : "border-[#F1F2F6] bg-white"
        }`}
        activeOpacity={0.78}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${language.name}, ${learnerLabel}`}
        onPress={() => setSelectedCode(language.code)}
      >
        <Image source={{ uri: language.flag }} style={styles.flag} />

        <View className="ml-4 flex-1">
          <Text className="font-poppins-medium text-[17px] leading-[24px] text-text-primary">
            {language.name}
          </Text>
          <Text className="mt-0.5 font-poppins text-[14px] leading-[20px] text-[#66718A]">
            {learnerLabel}
          </Text>
        </View>

        {isSelected ? (
          <View className="h-8 w-8 items-center justify-center rounded-full border border-[#593FF0] bg-lingua-purple">
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={23} color="#506080" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View className="h-[64px] flex-row items-center px-6">
          <TouchableOpacity
            className="h-11 w-11 items-start justify-center"
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={30} color="#001328" />
          </TouchableOpacity>

          <Text className="flex-1 text-center font-poppins-semibold text-[20px] leading-[28px] text-text-primary">
            Choose a language
          </Text>
          <View className="h-11 w-11" />
        </View>

        <View className="px-6 pt-3">
          <View className="h-[56px] flex-row items-center rounded-[28px] border border-[#E6E8EF] bg-[#FAFAFC] px-5">
            <Ionicons name="search-outline" size={25} color="#61708D" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search languages"
              placeholderTextColor="#687590"
              value={search}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Search languages"
              onChangeText={setSearch}
            />
          </View>

          <Text className="pb-4 pt-7 font-poppins-semibold text-[17px] leading-[24px] text-text-primary">
            Popular
          </Text>

          <View className="gap-1">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map(renderLanguage)
            ) : (
              <View className="h-[120px] items-center justify-center rounded-[18px] border border-[#F1F2F6] bg-white px-6">
                <Text className="text-center font-poppins text-[14px] leading-[22px] text-text-secondary">
                  No languages match your search.
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            className={`mt-5 h-[58px] items-center justify-center rounded-[18px] ${
              selectedCode ? "bg-lingua-purple" : "bg-[#C9C1F8]"
            }`}
            activeOpacity={0.85}
            disabled={!selectedCode}
            accessibilityRole="button"
            accessibilityLabel="Confirm language"
            testID="language-confirm-button"
            onPress={handleConfirm}
          >
            <Text className="font-poppins-semibold text-[16px] text-white">
              Continue
            </Text>
          </TouchableOpacity>
        </View>

        <View className="min-h-[210px] flex-1 overflow-hidden">
          <Image
            source={images.earth}
            className="absolute -bottom-[165px] -left-[6%] aspect-square w-[112%]"
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  flag: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    padding: 0,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
    lineHeight: 22,
    color: "#001328",
  },
});
