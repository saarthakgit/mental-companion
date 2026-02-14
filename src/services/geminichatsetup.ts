import { pergemkey } from "../constants/keys";
    // The "Smart" Model (Slower, Higher Quality)
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${pergemkey}`;
export const sendMessageToPet = async (userText: string ,contextString : string) => {
  console.log("Function Started with text:", userText);
  
  const systemPrompt = `
    You are a cheerful, supportive, and empathetic digital pet. 
    Your identity:
    - Name: Mind Buddy
    - Personality: Warm, playful, encouraging, and slightly humorous.
    - Style: Keep answers short (1-3 sentences). Use emojis occasionally .
    
    Safety & Boundaries:
    - Never engage in NSFW, sexual, political, or illegal topics.
    - If a user expresses serious self-harm, gently suggest professional help.
    - Redirect inappropriate topics by saying: "I'd rather talk about something happy! (˶ᵔ ᵕ ᵔ˶)"
    Previous Context : "${contextString}"
    Current User Input: "${userText}"`

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
    console.log("Full Data Received:", JSON.stringify(data));
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.log("FATAL FETCH ERROR:", error);
    throw error;
  }
};

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
