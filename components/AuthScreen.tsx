import { images } from "@/constants/images";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ReactNode, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";

import SocialButton from "./SocialButton";

export type SocialStrategy = "oauth_google";

interface Props {
  mode: "sign-up" | "sign-in";
  email: string;
  onEmailChange: (value: string) => void;
  password?: string;
  onPasswordChange?: (value: string) => void;
  onSubmit: () => void;
  onSocialPress: (strategy: SocialStrategy) => void;
  isLoading: boolean;
  fieldError?: string;
  passwordError?: string;
  authError?: string;
  children?: ReactNode;
}

function GoogleIcon() {
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24">
      <Path fill="#4285F4" d="M21.35 12.23c0-.7-.06-1.37-.17-2.02H12v3.83h5.25a4.5 4.5 0 0 1-1.95 2.95v2.45h3.16c1.85-1.71 2.89-4.23 2.89-7.21Z" />
      <Path fill="#34A853" d="M12 21.75c2.64 0 4.86-.87 6.48-2.36l-3.16-2.45c-.88.59-2 .94-3.32.94-2.55 0-4.71-1.72-5.49-4.03H3.25v2.52A9.75 9.75 0 0 0 12 21.75Z" />
      <Path fill="#FBBC05" d="M6.51 13.85a5.86 5.86 0 0 1 0-3.7V7.63H3.25a9.75 9.75 0 0 0 0 8.74l3.26-2.52Z" />
      <Path fill="#EA4335" d="M12 6.12c1.43 0 2.72.49 3.73 1.47l2.8-2.8A9.36 9.36 0 0 0 12 2.25a9.75 9.75 0 0 0-8.75 5.38l3.26 2.52C7.29 7.84 9.45 6.12 12 6.12Z" />
    </Svg>
  );
}

export default function AuthScreen({
  mode,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  onSubmit,
  onSocialPress,
  isLoading,
  fieldError,
  passwordError,
  authError,
  children,
}: Props) {
  const isSignUp = mode === "sign-up";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-8">
            <TouchableOpacity
              className="mt-5 h-11 w-11 justify-center"
              onPress={() => router.back()}
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={27} color="#001328" />
            </TouchableOpacity>

            <Text className="mt-4 font-poppins-semibold text-[28px] leading-[37px] text-[#001328]">
              {isSignUp ? "Create your account" : "Welcome back!"}
            </Text>
            <Text className="mt-2 font-poppins text-[16px] leading-[27px] text-[#56627C]">
              {isSignUp
                ? "Start your language journey today ✨"
                : "Continue your language journey ✨"}
            </Text>

            <View className="h-[138px] items-center overflow-hidden">
              <Image
                source={images.mascotAuth}
                className="absolute -top-8 h-[300px] w-[300px]"
                resizeMode="contain"
                style={{ transform: [{ scaleX: -1 }] }}
              />
            </View>

            <View className="h-[80px] justify-center rounded-[17px] border border-[#E3E8F2] px-[17px]">
              <Text className="font-poppins text-[13px] leading-[19px] text-[#56627C]">
                Email
              </Text>
              <TextInput
                value={email}
                onChangeText={onEmailChange}
                placeholder="alex@gmail.com"
                placeholderTextColor="#001328"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                accessibilityLabel="Email"
                style={{
                  fontFamily: "Poppins-Regular",
                  fontSize: 15,
                  color: "#001328",
                  padding: 0,
                  marginTop: 3,
                }}
              />
            </View>
            {fieldError ? (
              <Text className="mt-2 font-poppins text-[13px] text-error">
                {fieldError}
              </Text>
            ) : null}
            {isSignUp && onPasswordChange ? (
              <>
                <View className="mt-3 h-[80px] justify-center rounded-[17px] border border-[#E3E8F2] px-[17px]">
                  <Text className="font-poppins text-[13px] leading-[19px] text-[#56627C]">
                    Password
                  </Text>
                  <View className="flex-row items-center">
                    <TextInput
                      value={password}
                      onChangeText={onPasswordChange}
                      placeholder="Create a password"
                      placeholderTextColor="#56627C"
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                      accessibilityLabel="Password"
                      style={{
                        flex: 1,
                        fontFamily: "Poppins-Regular",
                        fontSize: 15,
                        color: "#001328",
                        padding: 0,
                        marginTop: 3,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword((value) => !value)}
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={21}
                        color="#56627C"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {passwordError ? (
                  <Text className="mt-2 font-poppins text-[13px] text-error">
                    {passwordError}
                  </Text>
                ) : null}
              </>
            ) : null}
            {authError ? (
              <Text className="mt-2 font-poppins text-[13px] text-error">
                {authError}
              </Text>
            ) : null}

            <TouchableOpacity
              className="mt-5 h-[58px] items-center justify-center overflow-hidden rounded-[15px] bg-[#5543F5]"
              activeOpacity={0.85}
              onPress={onSubmit}
              disabled={isLoading}
              testID={isSignUp ? "sign-up-button" : "sign-in-button"}
            >
              <Svg
                width="100%"
                height="100%"
                style={{ position: "absolute", top: 0, left: 0 }}
              >
                <Defs>
                  <LinearGradient id="auth-button" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor="#513CF2" />
                    <Stop offset="100%" stopColor="#7659F7" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#auth-button)" />
              </Svg>
              <Text className="font-poppins-semibold text-[18px] text-white">
                {isLoading ? "Sending code..." : isSignUp ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>

            <View className="my-6 flex-row items-center gap-4">
              <View className="h-px flex-1 bg-[#DDE3ED]" />
              <Text className="font-poppins text-[14px] text-[#56627C]">
                or continue with
              </Text>
              <View className="h-px flex-1 bg-[#DDE3ED]" />
            </View>

            <View className="gap-[10px]">
              <SocialButton
                icon={<GoogleIcon />}
                label="Continue with Google"
                onPress={() => onSocialPress("oauth_google")}
              />
            </View>

            <View className="mt-auto flex-row items-center justify-center pb-8 pt-10">
              <Text className="font-poppins text-[14px] text-[#56627C]">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  router.replace(
                    isSignUp ? "/(auth)/sign-in" : "/(auth)/sign-up",
                  )
                }
              >
                <Text className="font-poppins-semibold text-[14px] text-[#5543F5]">
                  {isSignUp ? "Log in" : "Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>

            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
