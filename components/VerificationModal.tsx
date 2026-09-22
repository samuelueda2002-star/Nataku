import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  visible: boolean;
  email: string;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  error?: string;
}

export default function VerificationModal({
  visible,
  email,
  onClose,
  onVerify,
  onResend,
  error,
}: Props) {
  const [code, setCode] = useState("");
  const inputRef = useRef<TextInput>(null);
  const submittingRef = useRef(false);

  const handleCodeChange = async (text: string) => {
    if (submittingRef.current) return;
    const digits = text.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length !== 6) return;

    submittingRef.current = true;
    try {
      await onVerify(digits);
    } finally {
      setCode("");
      submittingRef.current = false;
    }
  };

  const handleResend = async () => {
    setCode("");
    await onResend();
    inputRef.current?.focus();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
      onShow={() => {
        setCode("");
        setTimeout(() => inputRef.current?.focus(), 250);
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity
          className="flex-1 bg-black/45"
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Close verification"
        />

        <View className="items-center rounded-t-[28px] bg-white px-6 pb-10 pt-10">
          <TouchableOpacity
            className="absolute right-5 top-4 p-1"
            onPress={onClose}
            accessibilityLabel="Close verification"
          >
            <Ionicons name="close" size={22} color="#56627C" />
          </TouchableOpacity>

          <Text className="font-poppins-semibold text-[22px] text-[#001328]">
            Verify your email
          </Text>
          <Text className="mt-2 text-center font-poppins text-[14px] leading-[22px] text-[#56627C]">
            You received an email at{"\n"}
            <Text className="font-poppins-medium text-[#001328]">{email}</Text>
            {"\nEnter the 6-digit verification code."}
          </Text>

          <TouchableOpacity
            className="mt-8 w-full flex-row gap-2"
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            accessibilityLabel="Enter 6-digit verification code"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <View
                key={index}
                className={`h-14 flex-1 items-center justify-center rounded-[13px] border-[1.5px] ${
                  code[index]
                    ? "border-[#5543F5] bg-[#F5F2FF]"
                    : index === code.length
                      ? "border-[#5543F5] bg-white"
                      : "border-[#E3E8F2] bg-white"
                }`}
              >
                <Text className="font-poppins-semibold text-[20px] text-[#001328]">
                  {code[index] ?? ""}
                </Text>
              </View>
            ))}
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={handleCodeChange}
            keyboardType="number-pad"
            maxLength={6}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            caretHidden
            accessibilityLabel="Verification code"
            style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
          />

          {error ? (
            <Text className="mt-3 text-center font-poppins text-[13px] text-error">
              {error}
            </Text>
          ) : null}

          <TouchableOpacity className="mt-5 p-2" onPress={handleResend}>
            <Text className="font-poppins text-[13px] text-[#56627C]">
              {"Didn't receive it? "}
              <Text className="font-poppins-medium text-[#5543F5]">
                Resend
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
