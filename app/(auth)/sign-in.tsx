import AuthScreen, { SocialStrategy } from "@/components/AuthScreen";
import VerificationModal from "@/components/VerificationModal";
import { posthog } from "@/lib/posthog";
import { useSignIn, useSSO } from "@clerk/expo";
import * as Linking from "expo-linking";
import { type Href, router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [authError, setAuthError] = useState("");
  const [verificationError, setVerificationError] = useState("");

  const handleSignIn = async () => {
    const emailAddress = email.trim();
    setAuthError("");
    setVerificationError("");
    if (!emailAddress) {
      setAuthError("Enter your email address to continue.");
      return;
    }

    posthog.capture("sign_in_submitted", { method: "email_code" });
    try {
      const { error: createError } = await signIn.create({
        identifier: emailAddress,
      });
      if (createError) {
        setAuthError(createError.message);
        return;
      }

      const { error: sendError } = await signIn.emailCode.sendCode({
        emailAddress,
      });
      if (sendError) {
        setAuthError(sendError.message);
        return;
      }
      setShowVerification(true);
    } catch (error) {
      posthog.capture("sign_in_email_code_failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      setAuthError("We couldn't send your code. Please try again.");
    }
  };

  const handleVerify = async (code: string) => {
    setVerificationError("");
    try {
      const { error } = await signIn.emailCode.verifyCode({ code });
      if (error) {
        setVerificationError(error.message);
        return;
      }
      if (signIn.status !== "complete") {
        setVerificationError("We couldn't verify that code. Please try again.");
        return;
      }

      posthog.capture("sign_in_completed", { method: "email_code" });
      await signIn.finalize({
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
      const { error } = await signIn.emailCode.sendCode({
        emailAddress: email.trim(),
      });
      if (error) setVerificationError(error.message);
    } catch (error) {
      setVerificationError(
        error instanceof Error ? error.message : "Couldn't resend the code.",
      );
    }
  };

  const handleSSO = async (strategy: SocialStrategy) => {
    posthog.capture("sign_in_sso_started", { strategy });
    setAuthError("");
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL("/"),
      });
      if (createdSessionId && setActive) {
        posthog.capture("sign_in_completed", { method: strategy });
        await setActive({ session: createdSessionId });
        router.replace("/");
      }
    } catch (error) {
      posthog.capture("sign_in_sso_failed", {
        strategy,
        error: error instanceof Error ? error.message : "Unknown SSO error",
      });
      setAuthError("Couldn't continue with social sign in. Please try again.");
    }
  };

  return (
    <>
      <AuthScreen
        mode="sign-in"
        email={email}
        onEmailChange={setEmail}
        onSubmit={handleSignIn}
        onSocialPress={handleSSO}
        isLoading={fetchStatus === "fetching"}
        fieldError={errors.fields.identifier?.message}
        authError={authError || errors.global?.[0]?.message}
      />
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
