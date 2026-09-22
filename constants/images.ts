import audioLessonPreview from "@/assets/images/audio-lesson-preview.png";
import earth from "@/assets/images/earth.png";
import mascotAuth from "@/assets/images/mascot-auth.png";
import mascotWelcome from "@/assets/images/mascot-welcome.png";
import mascotLogo from "@/assets/images/moscot-logo.png";
import palace from "@/assets/images/palace.png";
import streakFire from "@/assets/images/streak-fire.png";
import treasure from "@/assets/images/treasure.png";

export const lessonImages = {
  "en-lesson-1": {
    uri: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85",
  },
  "en-lesson-2": {
    uri: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=85",
  },
  "en-lesson-3": {
    uri: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=85",
  },
  "en-lesson-4": {
    uri: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
  },
  "en-lesson-5": {
    uri: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85",
  },
  "en-lesson-6": {
    uri: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=85",
  },
} as const;

export const images = {
  audioLessonPreview,
  aiTeacher: {
    uri: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&h=240&q=80",
  },
  earth,
  mascotAuth,
  mascotWelcome,
  mascotLogo,
  palace,
  lessonFallback: {
    uri: "https://picsum.photos/seed/lingua-lesson/1200/700",
  },
  streakFire,
  treasure,
} as const;
