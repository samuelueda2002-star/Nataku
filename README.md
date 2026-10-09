# Nataku

## Run on Android

This project uses Stream WebRTC native modules, so test it with a native Android build instead of Expo Go.

1. Open Android Studio and start an emulator from **Device Manager**. The local setup uses the `Medium_Phone` virtual device.
2. From the project root, build, install, and start the app:

   ```bash
   npm run android
   ```

3. For later JavaScript-only sessions, start Metro and press `a`:

   ```bash
   npm start
   ```

Open the generated `android/` directory in Android Studio when you need native logs, Gradle tasks, or Android-specific debugging. Use JDK 17 for Gradle; rerun `npm run android` after changing native dependencies or Expo config plugins.

## Interactive lessons

Open **Learn** to follow the English learning path. Complete the current lesson to unlock the next one; gold nodes let you revisit finished lessons. Each lesson includes meaning questions, English word tiles, and matching pairs from the existing vocabulary.

Tap **Check** to see feedback, then **Continue**. Incorrect exercises return for review. Five missed answers offer a fresh attempt. Finishing saves completion and awards 10 XP once per lesson; replays are practice without duplicate XP. The lesson summary shows accuracy across all attempts.

The **Practice with the AI teacher** link opens the existing audio lesson. Exercise lessons run locally without an AI connection. Run `npm run test:lessons` to check all 50 lessons, mistake review, hearts, unlocks, and persisted XP.

## Roleplay chat

Open **Chat**, choose a situation, and practice a five-reply conversation with Nataku. Suggested replies fill the composer so you can edit them before sending. Tap **Translate** for Brazilian Portuguese, and look for gentle grammar tips below Nataku's replies.

Finish a conversation to earn 20 local XP. Each scenario awards XP once; you can practice it again. Completion and XP persist on the device. Conversations stay in memory and start fresh after restarting the app.

The `/api/roleplay` route verifies the Clerk session and calls Gemini from the server. It reuses `GOOGLE_API_KEY` from `.env.local`; never give this variable an `EXPO_PUBLIC_` prefix. The default text model is `gemini-3.1-flash-lite`. An optional server-side `GEMINI_CHAT_MODEL` can select another Gemini 3 text model supporting minimal thinking and structured output. Production native builds also need the deployed API origin configured in Expo Router.

Validation:

```bash
npm run lint
npm run typecheck
npm run test:roleplay
```

The roleplay checks use mocked provider responses and do not make paid AI calls. To also verify a live correction with your configured key, run `npm run test:roleplay -- --live`.

References: [Duolingo Roleplay](https://blog.duolingo.com/duolingo-max/) and [Gemini structured output](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite).
