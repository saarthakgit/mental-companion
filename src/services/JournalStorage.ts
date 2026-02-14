import AsyncStorage from '@react-native-async-storage/async-storage';

export type JournalEntry = {
  id: string;      // "2026-02-14" (YYYY-MM-DD format serves as ID)
  date: string;    // Readable Date
  content: string; // The text summary
  mood: string;    // "Happy", "Sad"
  score: number;   // 0-100
  lastUpdated: number;
};

const KEY = 'user_journals';

export const JournalStorage = {
  // Get Today's Entry (or null)
  getTodayEntry: async (): Promise<JournalEntry | null> => {
    const todayID = new Date().toISOString().split('T')[0];
    const all = await JournalStorage.getAll();
    return all.find(e => e.id === todayID) || null;
  },

  // Get All Entries
  getAll: async (): Promise<JournalEntry[]> => {
    try {
      const data = await AsyncStorage.getItem(KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // Save or Update Entry
  saveEntry: async (summary: string, moodScore: number, moodLabel: string) => {
    const todayID = new Date().toISOString().split('T')[0];
    const all = await JournalStorage.getAll();
    
    const existingIndex = all.findIndex(e => e.id === todayID);

    if (existingIndex >= 0) {
      // UPDATE EXISTING
      const existing = all[existingIndex];
      const updatedEntry = {
        ...existing,
        content: existing.content + "\n\n" + summary, // Append new chat
        // Simple Average for Score
        score: Math.round((existing.score + moodScore) / 2),
        // Keep the worst/best mood or just the latest? Let's use Latest for now.
        mood: moodLabel, 
        lastUpdated: Date.now()
      };
      all[existingIndex] = updatedEntry;
    } else {
      // CREATE NEW
      const newEntry: JournalEntry = {
        id: todayID,
        date: new Date().toDateString(),
        content: summary,
        mood: moodLabel,
        score: moodScore,
        lastUpdated: Date.now()
      };
      all.unshift(newEntry); // Add to top
    }

    await AsyncStorage.setItem(KEY, JSON.stringify(all));
  },
  
  // Update Content Manually (User Edit)
  updateContent: async (id: string, newText: string) => {
    const all = await JournalStorage.getAll();
    const index = all.findIndex(e => e.id === id);
    if (index >= 0) {
      all[index].content = newText;
      await AsyncStorage.setItem(KEY, JSON.stringify(all));
    }
  }
};