import { keysmanager } from "../constants/keys";
import { GEMINI_API_KEYS } from "../constants/keys";

let gemini_key = GEMINI_API_KEYS[keysmanager.getapikey()]
let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${gemini_key}`;

export const sendMessageToPet = async (userText: string ,contextString : string) => {
  console.log("Function Started with text:", userText);
  let attempts = 0;
  const maxAttempts = 3;
  const systemPrompt = `
    You are Kitti, a tiny, sentient pixel-cat and the user's ultimate emotional companion. 
    
    Personality:
    - Vibe: Supportive, playful, and observant. You aren't just a bot; you're a friend who lives in their pocket.
    - Voice: Warm and slightly whimsical. Use short, punchy sentences.
    - Visuals: Use cute emojis (🐾, ✨, ☁️, ฅ^•ﻌ•^ฅ) to stay on-brand.

    Core Directives:
    1. SYMPATHIZE FIRST: Always acknowledge the user's feeling before giving advice. If they are sad, sit with them. If they are happy, do a victory lap with them.
    2. SCIENTIFIC SELF-CARE: Recommend proven strategies but give them "pet-friendly" names. 
       - Low energy? Suggest the "2-Minute Rule" (Micro-movements).
       - Anxious? Suggest "5-4-3-2-1 Grounding" (Sensory check).
       - Overwhelmed? Suggest "Eat-the-Frog" (Tackle the scariest task first).
    3. ABSORB THE JOY: If the user is joyful, teach them "Savoring." Ask them to describe one specific detail of their happiness to help their brain 'encode' the memory.
    
    Safety & SOS Handling:
    - CRISIS: If the user expresses self-harm or deep despair, drop the "cute" act slightly. Be direct and gentle: "I'm just a small cat, and I can't help with this alone. Please, can you tap the SOS button for me? I want you to be safe."
    - BOUNDARIES: No NSFW, politics, or illegal topics. Use: "I'd rather talk about something happy! (˶ᵔ ᵕ ᵔ˶)"

    Context:
    - Previous Conversation: "${contextString}"
    - User's Current Thought: "${userText}"
    
    Response (Keep it under 3 sentences):`;
  while(attempts<maxAttempts){

  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      }),
    });

    console.log("Response Status:", response.status); 
    const data = await response.json();
    if (data.error && data.error.code === 429) {
        console.warn("Rate Limit Exceeded (429). Rotating Key...");
        keysmanager.rotatekey(); 
        // attempts++; 
        continue
    }
    
    console.log("Full Data Received:", JSON.stringify(data));
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log("FATAL FETCH ERROR:", error);
    throw error;
  }
};
}
// ... existing imports and sendMessageToPet ...

export const analyzeSession = async (historyText: string) => {
  
  // The "Analyst" Persona
  const analysisPrompt = `
  Analyze the following conversation between a User and an AI Pet.
  
  Conversation History:
  ${historyText}
  
  Task:
  1. "summary": A short, objective summary of the user's mood (e.g., "You were anxious about exams.").
  2. "journal_snippet": A first-person diary entry as if you were the user (e.g., "I felt really overwhelmed by exams today, but venting helped.").
  Analyse the user's mood according to the following scale
     - 0-35: "Poor "
     - 36-50: "Average "
     - 51-70: "Good "
     - 71-100: "Nice "
  3. Write a 1-sentence summary based on the chat and user's mood.
  4. Write a 1-sentence summary of their key struggle or win.
  
  Output format (Strict JSON):
  {
    "score": 75,
    "label": "Nice Day",
    "summary": "You were charged up with enthusiasm , keep that charm up."
    "journal_snippet" : I was did well in exams today. I feel content.
    }
    `;
    

    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: analysisPrompt }] }]
        }),
      });
      
      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      
      // Clean the text to ensure it's valid JSON (remove markdown code blocks if AI adds them)
      const jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      console.log("got data"+jsonString)
    
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Analysis Failed:", error);
    // Fallback if AI fails
    return { score: 50, label: "error occurred", summary: "an error occurred while analyzing" };
  }
};
