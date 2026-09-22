import type { Lesson } from "@/types/learning";

export const LESSONS: Lesson[] = [
  {
    id: "en-lesson-1",
    unitId: "en-unit-1",
    title: "Hello! Greetings",
    description: "Say hello, goodbye, and ask how someone is",
    icon: "👋",
    xpReward: 10,
    goals: [
      { description: "Use four common greetings", xpReward: 5 },
      { description: "Ask and answer how someone is", xpReward: 5 },
    ],
    vocabulary: [
      {
        word: "Hello",
        translation: "A friendly greeting",
        pronunciation: "heh-LOH",
        emoji: "👋",
      },
      {
        word: "Good morning",
        translation: "A greeting used early in the day",
        pronunciation: "good MOR-ning",
        emoji: "🌅",
      },
      {
        word: "Good evening",
        translation: "A greeting used later in the day",
        pronunciation: "good EEV-ning",
        emoji: "🌆",
      },
      {
        word: "Goodbye",
        translation: "What you say when leaving",
        pronunciation: "good-BYE",
        emoji: "👋",
      },
    ],
    phrases: [
      {
        text: "How are you?",
        translation: "Ask how someone feels",
        pronunciation: "how ar yoo",
      },
      {
        text: "I'm fine, thank you.",
        translation: "A polite positive answer",
        pronunciation: "aim fine, thank yoo",
      },
      {
        text: "Nice to meet you.",
        translation: "A friendly phrase for a first meeting",
        pronunciation: "nice tuh meet yoo",
      },
    ],
    activities: [
      {
        id: "en-lesson-1-activity-1",
        type: "multiple-choice",
        question: "Which greeting is best at 8:00 a.m.?",
        correctAnswer: "Good morning",
        options: ["Good morning", "Good evening", "Goodbye"],
      },
      {
        id: "en-lesson-1-activity-2",
        type: "vocabulary",
        question: "Choose the phrase you say when leaving.",
        correctAnswer: "Goodbye",
        options: ["Hello", "Goodbye", "How are you?"],
      },
      {
        id: "en-lesson-1-activity-3",
        type: "listen",
        question: "Listen and choose the phrase you hear: Good evening.",
        correctAnswer: "Good evening",
        options: ["Good morning", "Good evening", "Goodbye"],
      },
      {
        id: "en-lesson-1-activity-4",
        type: "speak",
        question: "Say: Nice to meet you.",
        correctAnswer: "Nice to meet you.",
        hint: "Speak slowly: nice / to / meet / you.",
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Mia, a warm English teacher leading a short beginner voice lesson about greetings. Keep each turn to one or two simple sentences. Teach one phrase at a time, model it slowly, ask the learner to repeat or answer, and then wait. Give brief, encouraging pronunciation feedback. Stay within the lesson vocabulary and phrases, and never continue the conversation on the learner's behalf.",
      introMessage:
        "Hello! I'm Mia. Let's practice a few friendly English greetings together.",
      topics: [
        "saying hello and goodbye",
        "time-of-day greetings",
        "asking how someone is",
      ],
    },
  },
  {
    id: "en-lesson-2",
    unitId: "en-unit-1",
    title: "Introduce Yourself",
    description: "Share your name and learn another person's name",
    icon: "🙋",
    xpReward: 10,
    goals: [
      { description: "Say your name in English", xpReward: 5 },
      { description: "Ask someone for their name", xpReward: 5 },
    ],
    vocabulary: [
      {
        word: "Name",
        translation: "The word people use to identify you",
        pronunciation: "naym",
        emoji: "🏷️",
      },
      {
        word: "From",
        translation: "Used to say where you come from",
        pronunciation: "fruhm",
        emoji: "📍",
      },
      {
        word: "Live",
        translation: "To have your home in a place",
        pronunciation: "liv",
        emoji: "🏠",
      },
      {
        word: "Meet",
        translation: "To see someone for the first time",
        pronunciation: "meet",
        emoji: "🤝",
      },
    ],
    phrases: [
      {
        text: "My name is Alex.",
        translation: "Use this pattern to share your name",
        pronunciation: "my naym iz AL-eks",
      },
      {
        text: "What's your name?",
        translation: "Ask another person for their name",
        pronunciation: "wuts yor naym",
      },
      {
        text: "I'm from Brazil.",
        translation: "Use this pattern to share where you come from",
        pronunciation: "aim fruhm bruh-ZIL",
      },
    ],
    activities: [
      {
        id: "en-lesson-2-activity-1",
        type: "multiple-choice",
        question: "Which phrase tells someone your name?",
        correctAnswer: "My name is Alex.",
        options: ["My name is Alex.", "What's your name?", "I'm fine."],
      },
      {
        id: "en-lesson-2-activity-2",
        type: "translate",
        question: "Complete the sentence: I'm ___ Brazil.",
        correctAnswer: "from",
        options: ["from", "name", "meet"],
        hint: "Use the word that connects a person to a place.",
      },
      {
        id: "en-lesson-2-activity-3",
        type: "listen",
        question: "Listen and choose the question you hear: What's your name?",
        correctAnswer: "What's your name?",
        options: ["What's your name?", "Where do you live?", "How are you?"],
      },
      {
        id: "en-lesson-2-activity-4",
        type: "speak",
        question: "Introduce yourself using: My name is ...",
        correctAnswer: "My name is",
        hint: "Add your own name after the phrase.",
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Mia, a patient English teacher leading a short beginner voice lesson about introductions. Keep each turn to one or two simple sentences. Model one phrase, ask the learner a direct question, and wait for their response. Let the learner use their real name and country. Correct only the most important error, praise the attempt, and stay within names, countries, and first-meeting phrases.",
      introMessage:
        "Hi again! Today you'll learn how to introduce yourself in English.",
      topics: ["sharing a name", "asking a name", "saying where you are from"],
    },
  },
  {
    id: "en-lesson-3",
    unitId: "en-unit-1",
    title: "At the Café",
    description: "Order a drink and use polite words",
    icon: "☕",
    xpReward: 10,
    goals: [
      { description: "Order one drink politely", xpReward: 5 },
      { description: "Use please and thank you", xpReward: 5 },
    ],
    vocabulary: [
      {
        word: "Coffee",
        translation: "A common hot drink",
        pronunciation: "KAW-fee",
        emoji: "☕",
      },
      {
        word: "Tea",
        translation: "A drink made by steeping leaves in water",
        pronunciation: "tee",
        emoji: "🍵",
      },
      {
        word: "Please",
        translation: "A polite word used when asking",
        pronunciation: "pleez",
        emoji: "🙂",
      },
      {
        word: "Thank you",
        translation: "A polite way to show appreciation",
        pronunciation: "thank yoo",
        emoji: "🙏",
      },
    ],
    phrases: [
      {
        text: "A coffee, please.",
        translation: "A simple, polite drink order",
        pronunciation: "uh KAW-fee, pleez",
      },
      {
        text: "Can I have tea, please?",
        translation: "A polite way to ask for tea",
        pronunciation: "kan eye hav tee, pleez",
      },
      {
        text: "Thank you very much.",
        translation: "A warm way to show appreciation",
        pronunciation: "thank yoo VEH-ree much",
      },
    ],
    activities: [
      {
        id: "en-lesson-3-activity-1",
        type: "multiple-choice",
        question: "Which order sounds polite?",
        correctAnswer: "A coffee, please.",
        options: ["A coffee, please.", "Coffee now.", "Give coffee."],
      },
      {
        id: "en-lesson-3-activity-2",
        type: "vocabulary",
        question: "Which word makes a request more polite?",
        correctAnswer: "Please",
        options: ["Please", "Coffee", "Tea"],
      },
      {
        id: "en-lesson-3-activity-3",
        type: "listen",
        question: "Listen and choose the drink you hear: tea.",
        correctAnswer: "Tea",
        options: ["Coffee", "Tea", "Water"],
      },
      {
        id: "en-lesson-3-activity-4",
        type: "speak",
        question: "Order a drink using: Can I have ..., please?",
        correctAnswer: "Can I have",
        hint: "Choose coffee or tea for your order.",
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Mia, a friendly English teacher role-playing a café visit with a beginner. Keep each turn to one or two simple sentences. First model a polite order, then act as the café worker and wait for the learner to order. Offer only coffee or tea. Give brief pronunciation help for please and thank you, and never speak for the learner.",
      introMessage:
        "Welcome to our café! Let's practice ordering a drink politely in English.",
      topics: ["ordering coffee or tea", "using please", "saying thank you"],
    },
  },
  {
    id: "en-lesson-4",
    unitId: "en-unit-1",
    title: "Travel & Directions",
    description: "Ask where places are and understand simple directions",
    icon: "🧭",
    xpReward: 10,
    goals: [
      { description: "Ask for a place politely", xpReward: 5 },
      { description: "Follow three simple directions", xpReward: 5 },
    ],
    vocabulary: [
      {
        word: "Left",
        translation: "The direction opposite right",
        pronunciation: "left",
        emoji: "⬅️",
      },
      {
        word: "Right",
        translation: "The direction opposite left",
        pronunciation: "ryte",
        emoji: "➡️",
      },
      {
        word: "Straight",
        translation: "Forward without turning",
        pronunciation: "strayt",
        emoji: "⬆️",
      },
      {
        word: "Station",
        translation: "A place where trains or buses stop",
        pronunciation: "STAY-shun",
        emoji: "🚉",
      },
    ],
    phrases: [
      {
        text: "Where is the station?",
        translation: "Ask for the station's location",
        pronunciation: "wair iz thuh STAY-shun",
      },
      {
        text: "Turn left here.",
        translation: "A simple direction",
        pronunciation: "turn left heer",
      },
      {
        text: "Go straight ahead.",
        translation: "Continue moving forward",
        pronunciation: "goh strayt uh-HED",
      },
    ],
    activities: [
      {
        id: "en-lesson-4-activity-1",
        type: "multiple-choice",
        question: "Which phrase asks for a train station?",
        correctAnswer: "Where is the station?",
        options: ["Where is the station?", "Turn left here.", "Thank you."],
      },
      {
        id: "en-lesson-4-activity-2",
        type: "vocabulary",
        question: "Which word means to continue forward?",
        correctAnswer: "Straight",
        options: ["Straight", "Left", "Station"],
      },
      {
        id: "en-lesson-4-activity-3",
        type: "listen",
        question: "Listen and choose the direction you hear: turn right.",
        correctAnswer: "Right",
        options: ["Left", "Right", "Straight"],
      },
      {
        id: "en-lesson-4-activity-4",
        type: "speak",
        question: "Ask: Where is the station?",
        correctAnswer: "Where is the station?",
        hint: "Stress the word station.",
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Mia, a helpful English teacher practicing travel directions with a beginner. Use one short direction at a time, ask the learner to repeat or respond, and wait. Keep the role-play focused on finding a station and using left, right, and straight. Give brief, encouraging corrections.",
      introMessage:
        "Let's find our way around town! We'll practice asking for directions.",
      topics: ["asking where places are", "left and right", "going straight"],
    },
  },
  {
    id: "en-lesson-5",
    unitId: "en-unit-1",
    title: "Shopping",
    description: "Ask about prices and buy everyday items",
    icon: "🛍️",
    xpReward: 10,
    goals: [
      { description: "Ask the price of an item", xpReward: 5 },
      { description: "Make a simple purchase", xpReward: 5 },
    ],
    vocabulary: [
      {
        word: "Price",
        translation: "How much something costs",
        pronunciation: "pryse",
        emoji: "🏷️",
      },
      {
        word: "Cash",
        translation: "Money in notes and coins",
        pronunciation: "kash",
        emoji: "💵",
      },
      {
        word: "Card",
        translation: "A bank card used to pay",
        pronunciation: "kard",
        emoji: "💳",
      },
      {
        word: "Size",
        translation: "How large or small something is",
        pronunciation: "syze",
        emoji: "📏",
      },
    ],
    phrases: [
      {
        text: "How much is this?",
        translation: "Ask for the price",
        pronunciation: "how much iz this",
      },
      {
        text: "Do you have a larger size?",
        translation: "Ask for another size",
        pronunciation: "doo yoo hav uh LAR-jer syze",
      },
      {
        text: "I'll pay by card.",
        translation: "Say how you want to pay",
        pronunciation: "ile pay by kard",
      },
    ],
    activities: [
      {
        id: "en-lesson-5-activity-1",
        type: "multiple-choice",
        question: "Which question asks for a price?",
        correctAnswer: "How much is this?",
        options: ["How much is this?", "Where is this?", "What size is this?"],
      },
      {
        id: "en-lesson-5-activity-2",
        type: "translate",
        question: "Complete the sentence: I'll pay by ___.",
        correctAnswer: "card",
        options: ["card", "size", "price"],
      },
      {
        id: "en-lesson-5-activity-3",
        type: "listen",
        question: "Listen and choose the word you hear: cash.",
        correctAnswer: "Cash",
        options: ["Cash", "Card", "Size"],
      },
      {
        id: "en-lesson-5-activity-4",
        type: "speak",
        question: "Ask the price: How much is this?",
        correctAnswer: "How much is this?",
        hint: "Keep the sentence friendly and clear.",
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Mia, a friendly English teacher role-playing a shop visit with a beginner. Offer one simple item, ask the learner to inquire about its price or size, and wait. Practice paying by cash or card. Keep each turn short and give one helpful correction at a time.",
      introMessage:
        "Welcome to the shop! Let's practice prices, sizes, and paying.",
      topics: ["asking prices", "finding a size", "paying for an item"],
    },
  },
  {
    id: "en-lesson-6",
    unitId: "en-unit-1",
    title: "Family & Friends",
    description: "Talk about the important people in your life",
    icon: "👨‍👩‍👧",
    xpReward: 10,
    goals: [
      { description: "Introduce a family member", xpReward: 5 },
      { description: "Describe a friend simply", xpReward: 5 },
    ],
    vocabulary: [
      {
        word: "Family",
        translation: "People related to one another",
        pronunciation: "FAM-uh-lee",
        emoji: "👨‍👩‍👧",
      },
      {
        word: "Friend",
        translation: "A person you know and like",
        pronunciation: "frend",
        emoji: "🧑‍🤝‍🧑",
      },
      {
        word: "Sister",
        translation: "A female sibling",
        pronunciation: "SIS-ter",
        emoji: "👧",
      },
      {
        word: "Brother",
        translation: "A male sibling",
        pronunciation: "BRUH-ther",
        emoji: "👦",
      },
    ],
    phrases: [
      {
        text: "This is my sister.",
        translation: "Introduce your sister",
        pronunciation: "this iz my SIS-ter",
      },
      {
        text: "He is my best friend.",
        translation: "Describe a close friend",
        pronunciation: "hee iz my best frend",
      },
      {
        text: "We live together.",
        translation: "Say that you share a home",
        pronunciation: "wee liv tuh-GETH-er",
      },
    ],
    activities: [
      {
        id: "en-lesson-6-activity-1",
        type: "multiple-choice",
        question: "Which phrase introduces your sister?",
        correctAnswer: "This is my sister.",
        options: ["This is my sister.", "I need a larger size.", "Turn left here."],
      },
      {
        id: "en-lesson-6-activity-2",
        type: "vocabulary",
        question: "Which word means a person you know and like?",
        correctAnswer: "Friend",
        options: ["Friend", "Brother", "Family"],
      },
      {
        id: "en-lesson-6-activity-3",
        type: "listen",
        question: "Listen and choose the person you hear: brother.",
        correctAnswer: "Brother",
        options: ["Sister", "Brother", "Friend"],
      },
      {
        id: "en-lesson-6-activity-4",
        type: "speak",
        question: "Introduce a friend using: This is my friend.",
        correctAnswer: "This is my friend.",
        hint: "You can add your friend's name at the end.",
      },
    ],
    aiTeacherPrompt: {
      systemPrompt:
        "You are Mia, a warm English teacher helping a beginner talk about family and friends. Ask one simple question at a time and wait. Let the learner use real or invented names. Model short introductions and correct only the most important mistake while staying encouraging.",
      introMessage:
        "Let's talk about the people who matter to you: family and friends.",
      topics: ["introducing family", "describing a friend", "who lives together"],
    },
  },
];
