import type { RoleplayScenario } from "@/types/roleplay";

export const ROLEPLAY_CLOSING_REPLIES = ["Thank you!", "That sounds great.", "Have a nice day."];

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: "cafe",
    title: "At the café",
    description: "A coffee, a snack, and a little confidence.",
    goal: "Order a drink and a snack, then say thank you.",
    role: "a friendly barista taking the learner's order at a café",
    icon: "cafe",
    iconColor: "#C47B20",
    backgroundClass: "bg-[#FFF1D6]",
    opening: {
      text: "Welcome to Nataku Café! What would you like to drink?",
      translation: "Bem-vindo ao Café Nataku! O que você gostaria de beber?",
      suggestions: ["A coffee, please.", "I'd like a tea.", "What do you recommend?"],
      correction: null,
    },
  },
  {
    id: "introductions",
    title: "A new friend",
    description: "Break the ice and introduce yourself.",
    goal: "Introduce yourself and ask about your new friend.",
    role: "a friendly new classmate meeting the learner for the first time",
    icon: "people",
    iconColor: "#6C4EF5",
    backgroundClass: "bg-[#EEE8FF]",
    opening: {
      text: "Hi! I'm Nataku. It's nice to meet you! What's your name?",
      translation: "Oi! Eu sou Nataku. Prazer em conhecer você! Qual é o seu nome?",
      suggestions: ["Hi, I'm Sam!", "My name is Alex.", "Nice to meet you, too!"],
      correction: null,
    },
  },
  {
    id: "your-day",
    title: "How was your day?",
    description: "Share the little things that happened today.",
    goal: "Talk about your day and how you feel.",
    role: "a supportive friend asking about the learner's day",
    icon: "sunny",
    iconColor: "#DA8800",
    backgroundClass: "bg-[#FFF7CE]",
    opening: {
      text: "Hey, it's good to see you! How are you feeling today?",
      translation: "Oi, que bom ver você! Como você está se sentindo hoje?",
      suggestions: ["I'm feeling happy!", "I'm a little tired.", "I'm excited about today."],
      correction: null,
    },
  },
];
