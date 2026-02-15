// src/constants/Placeholders.ts

// 1. LOADING STATES (When Gemini is thinking)
export const LOADING_MESSAGES = [
  "Consulting the stars... ✨",
  "Listening to the ripples of your day... 🌊",
  "Weaving your thoughts into a story... 🧶",
  "Finding the calm in the chaos... 🍃",
  "Analyzing the vibes... 🤖",
  "Taking a deep breath... 🧘",
];


export const EMPTY_CHAT_PROMPTS = [
    "Talk to me...pleasee?",
  "What's on your mind today?",
  "A quiet mind is a powerful mind.",
  "Unburden your thoughts here.",
  "I'm listening. How are you really?",
  "Every journey begins with a single word.",
  "Have you been putting something off?",
  "Chat about it before bed?",
  "Is it something you overanalyze lately?",
  "what is draining your mental enurgyy?",
  "something you wish you could say out loudd?",
  "what ideas have you been putting off?",
  "what is your childhood dream?",
    "A day unrecorded is a lesson lost.",
  "Tap to preserve this memory. ✍️",
  "What did you learn today?",
  "Capture the moment before it fades.",
  "Was today a mountain or a valley?",
  "Write it down, let it go."
];



//ERROR MESSAGES (Network/API failures)
export const ERROR_MESSAGES = [
  "The clouds are thick today. Try again later. ☁️",
  "I couldn't catch that. One more time?",
  "The connection is a bit wobbly. 😵‍💫",
  "Silence is also an answer... but retrying helps.",
];

// --- HELPER FUNCTIONS ---

// A. Pure Random (Good for Loading screens that appear once)
export const getRandomMessage = (arr: string[]) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// B. Deterministic Random (Good for Lists/Journal)
// This ensures the message for "Feb 14" is always the same, 
// so it doesn't flicker wildly when you scroll.
export const getStableMessage = (arr: string[], seedKey: string) => {
  // Simple hash function to convert string (date) to number
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = seedKey.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % arr.length;
  return arr[index];
};