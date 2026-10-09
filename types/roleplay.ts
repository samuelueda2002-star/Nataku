export const ROLEPLAY_TURNS = 5;
export const ROLEPLAY_XP = 20;
export const MAX_ROLEPLAY_MESSAGE_LENGTH = 280;

export type RoleplayScenarioId = "cafe" | "introductions" | "your-day";

export type RoleplayReply = {
  text: string;
  translation: string;
  suggestions: string[];
  correction: { correctedText: string; explanation: string } | null;
};

export type RoleplayMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  reply?: RoleplayReply;
};

export type RoleplayScenario = {
  id: RoleplayScenarioId;
  title: string;
  description: string;
  goal: string;
  role: string;
  icon: "cafe" | "people" | "sunny";
  iconColor: string;
  backgroundClass: string;
  opening: RoleplayReply;
};
