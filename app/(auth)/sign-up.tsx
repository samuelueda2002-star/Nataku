import AuthScreen, { SocialStrategy } from "@/components/AuthScreen";
import VerificationModal from "@/components/VerificationModal";
import { posthog } from "@/lib/posthog";
import { useLanguageStore } from "@/store/languageStore";
import { useSignUp } from "@clerk/expo";
import { useSSO } from "@clerk/expo/experimental";
import { type Href, router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { selectedLanguage } = useLanguageStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [authError, setAuthError] = useState("");
  const [verificationError, setVerificationError] = useState("");

  const handleSignUp = async () => {
    const emailAddress = email.trim();
    setAuthError("");
    setVerificationError("");
    if (!emailAddress) {
      setAuthError("Enter your email address to continue.");
      return;
    }
    if (!password) {
      setAuthError("Enter a password to continue.");
      return;
    }

    posthog.capture("sign_up_submitted", { method: "email_code" });
    try {
      const { error: createError } = await signUp.password({
        emailAddress,
        password,
      });
      if (createError) {
        setAuthError(createError.message);
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setAuthError(sendError.message);
        return;
      }
      setShowVerification(true);
    } catch (error) {
      posthog.capture("sign_up_email_code_failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      setAuthError("We couldn't send your code. Please try again.");
    }
  };

  const handleVerify = async (code: string) => {
    setVerificationError("");
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        setVerificationError(error.message);
        return;
      }
      if (signUp.status !== "complete") {
        setVerificationError("We couldn't verify that code. Please try again.");
        return;
      }

      posthog.capture("sign_up_completed", { method: "email_code" });
      if (signUp.createdUserId) {
        posthog.identify(signUp.createdUserId, {
          $set_once: { signup_date: new Date().toISOString() },
          $set: { preferred_language: selectedLanguage ?? null },
        });
      }
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          router.replace(decorateUrl("/") as Href);
        },
      });
    } catch (error) {
      setVerificationError(
        error instanceof Error ? error.message : "Verification failed. Try again.",
      );
    }
  };

  const handleResend = async () => {
    setVerificationError("");
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) setVerificationError(error.message);
    } catch (error) {
      setVerificationError(
        error instanceof Error ? error.message : "Couldn't resend the code.",
      );
    }
  };

  const handleSSO = async (strategy: SocialStrategy) => {
    posthog.capture("sign_up_sso_started", { strategy });
    setAuthError("");
    if (strategy !== "oauth_google") {
      const provider = strategy === "oauth_facebook" ? "Facebook" : "Apple";
      setAuthError(`${provider} sign up is not enabled yet.`);
      return;
    }

    try {
      const { createdSessionId } = await startSSOFlow({
        strategy,
      });
      if (createdSessionId) {
        posthog.capture("sign_up_completed", { method: strategy });
        router.replace("/");
      }
    } catch (error) {
      posthog.capture("sign_up_sso_failed", {
        strategy,
        error: error instanceof Error ? error.message : "Unknown SSO error",
      });
      setAuthError("Couldn't continue with social sign up. Please try again.");
    }
  };

  return (
    <>
      <AuthScreen
        mode="sign-up"
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        onSubmit={handleSignUp}
        onSocialPress={handleSSO}
        isLoading={fetchStatus === "fetching"}
        fieldError={errors.fields.emailAddress?.message}
        passwordError={errors.fields.password?.message}
        authError={authError || errors.global?.[0]?.message}
      >
        <View nativeID="clerk-captcha" />
      </AuthScreen>
      <VerificationModal
        visible={showVerification}
        email={email.trim()}
        onClose={() => setShowVerification(false)}
        onVerify={handleVerify}
        onResend={handleResend}
        error={verificationError}
      />
    </>
  );
}
