/** Expo Router supplies the dev server origin on both native and web. */
export function getApiUrl(path: string): string {
  const origin =
    process.env.EXPO_PUBLIC_API_ORIGIN?.trim() ||
    (typeof window !== "undefined" ? window.location?.origin : undefined);

  if (!origin) {
    throw new Error("Set EXPO_PUBLIC_API_ORIGIN to your deployed API server URL.");
  }

  return new URL(path, origin).toString();
}
